// js/turn-system-optimized.js - Sistema de turnos unificado
console.log('🔄 Sistema de turnos otimizado carregando...');

class TurnSystem {
    constructor(roomSystem) {
        this.roomSystem = roomSystem;
        this.currentTurn = null;
        this.playerTeam = null;
        this.playerTeamId = null;
        this.teamAssigned = false;
    }

    // LISTENERS
    setupTurnListeners() {
        if (!this.roomSystem.currentRoom) return;

        const room = this.roomSystem.currentRoom;
        const refs = {
            turn: firebase.database().ref(`rooms/${room}/currentTurn`),
            player: firebase.database().ref(`rooms/${room}/players/${this.roomSystem.playerId}`),
            result: firebase.database().ref(`rooms/${room}/answerResult`),
            question: firebase.database().ref(`rooms/${room}/currentQuestion`)
        };

        refs.turn.on('value', snap => {
            const data = snap.val();
            if (data) this.handleTurnChange(data);
        });

        refs.player.on('value', snap => {
            const data = snap.val();
            if (data?.teamId) this.updatePlayerTeam(data.teamId);
        });

        refs.result.on('value', snap => {
            const data = snap.val();
            if (data) this.handleAnswerResult(data);
        });

        refs.question.on('value', snap => {
            const data = snap.val();
            if (data) this.handleQuestionChange(data);
        });

        if (this.roomSystem.isMaster) {
            setTimeout(() => this.assignMasterToTeam(), 500);
        }

        setTimeout(() => this.syncInitialState(), 1000);
    }

    syncInitialState() {
        if (!this.roomSystem.currentRoom) return;

        const room = this.roomSystem.currentRoom;
        
        firebase.database().ref(`rooms/${room}/currentQuestion`).once('value')
            .then(snap => {
                const data = snap.val();
                if (data) {
                    window.currentQuestionIndex = data.index || 0;
                    window.currentTeamIndex = data.teamIndex || 0;
                }
            });

        firebase.database().ref(`rooms/${room}/currentTurn`).once('value')
            .then(snap => {
                const data = snap.val();
                if (data) this.currentTurn = data;
            });
    }

    // TEAMS
    updatePlayerTeam(teamId) {
        if (!window.teams) {
            setTimeout(() => this.updatePlayerTeam(teamId), 1000);
            return;
        }

        if (this.playerTeamId === teamId) return;

        const team = window.teams.find(t => t.id === teamId);
        if (team) {
            this.playerTeam = team;
            this.playerTeamId = teamId;

            if (this.roomSystem.isMaster) {
                this.roomSystem.showMasterTeam(team.name);
            }

            this.updateAnswerButtons();

            if (!this.teamAssigned) {
                this.teamAssigned = true;
                setTimeout(() => {
                    this.showNotification(`🎯 Você está na equipe: ${team.name}`, 'success');
                }, 500);
            }
        }
    }

    assignMasterToTeam() {
        if (!this.roomSystem.isMaster || !window.teams?.length) return;
        if (this.playerTeamId === window.teams[0].id) return;

        const team = window.teams[0];
        this.playerTeam = team;
        this.playerTeamId = team.id;

        firebase.database().ref(`rooms/${this.roomSystem.currentRoom}/players/${this.roomSystem.playerId}`)
            .update({
                teamId: team.id,
                teamName: team.name,
                isMaster: true,
                assignedAt: Date.now()
            });

        this.roomSystem.showMasterTeam(team.name);
        this.updateAnswerButtons();
    }

    canPlayerAnswer() {
        if (this.roomSystem.isMaster) return true;
        if (!this.currentTurn || !this.playerTeamId) return false;
        return this.playerTeamId === this.currentTurn.teamId;
    }

    setCurrentTurn(teamIndex, teamId, teamName) {
        if (!this.roomSystem.isMaster) return;

        const turnData = {
            teamIndex,
            teamId,
            teamName,
            questionIndex: window.currentQuestionIndex || 0,
            startTime: Date.now(),
            answered: false
        };

        this.currentTurn = turnData;

        firebase.database().ref(`rooms/${this.roomSystem.currentRoom}/currentTurn`)
            .set(turnData);

        setTimeout(() => this.updateAnswerButtons(), 100);
    }

    rotateTeam() {
        if (!this.roomSystem.isMaster || !window.teams?.length) return;

        const nextIndex = (window.currentTeamIndex + 1) % window.teams.length;
        const nextTeam = window.teams[nextIndex];

        window.currentTeamIndex = nextIndex;
        window.consecutiveCorrect = 0;

        this.setCurrentTurn(nextIndex, nextTeam.id, nextTeam.name);
    }

    // INTERFACE
    handleTurnChange(turnData) {
        this.currentTurn = turnData;
        window.currentTeamIndex = turnData.teamIndex;
        window.currentQuestionIndex = turnData.questionIndex;

        this.updateTurnUI();
        this.updateAnswerButtons();
    }

    updateTurnUI() {
        const el = document.getElementById('team-turn');
        if (!el) return;

        const team = window.teams?.[window.currentTeamIndex];
        if (team) {
            el.textContent = `🎯 ${team.name} - DE PLANTÃO`;
            el.className = `team-turn ${team.turnColorClass}`;
        }
    }

    updateAnswerButtons() {
        const certoBtn = document.getElementById('certo-btn');
        const erradoBtn = document.getElementById('errado-btn');

        if (!certoBtn || !erradoBtn) return;

        const canAnswer = this.canPlayerAnswer();
        const disabled = !canAnswer;

        [certoBtn, erradoBtn].forEach(btn => {
            btn.disabled = disabled;
            btn.style.opacity = disabled ? '0.5' : '1';
            btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
            btn.title = this.roomSystem.isMaster 
                ? (canAnswer ? 'Responder' : 'Aguardando jogadores...')
                : (canAnswer ? 'Sua vez!' : 'Aguarde sua equipe');
        });

        if (this.roomSystem.isMaster && canAnswer) {
            certoBtn.style.background = '#28a745';
            erradoBtn.style.background = '#dc3545';
        }
    }

    handleQuestionChange(questionData) {
        window.currentQuestionIndex = questionData.index || 0;
        window.currentTeamIndex = questionData.teamIndex || 0;

        if (questionData.teamIndex !== undefined && window.teams?.[questionData.teamIndex]) {
            const team = window.teams[questionData.teamIndex];
            this.setCurrentTurn(questionData.teamIndex, team.id, team.name);
        }

        setTimeout(() => window.showQuestion?.(), 300);
    }

    // RESULTS
    handleAnswerResult(resultData) {
        this.showResult(resultData);
    }

    showResult(resultData) {
        const qt = document.getElementById('question-text');
        if (!qt) return;

        const color = resultData.isCorrect ? '#d4edda' : '#f8d7da';
        const border = resultData.isCorrect ? '#28a745' : '#dc3545';
        const icon = resultData.isCorrect ? '✅ CORRETO!' : '❌ ERRADO!';

        qt.innerHTML = `
            <div style="background: ${color}; padding: 15px; border-radius: 10px; border: 2px solid ${border};">
                <h3 style="margin: 0 0 10px 0;">${icon}</h3>
                <p><strong>${resultData.playerName}</strong> (${resultData.teamName}) 
                ${resultData.isCorrect ? 'acertou' : 'errou'}!</p>
                <p>Pontos: ${resultData.points > 0 ? '+' : ''}${resultData.points}</p>
                <p><strong>Resposta: ${resultData.correctAnswer || 'N/A'}</strong></p>
            </div>
        ` + (qt.innerHTML || '');
    }

    advanceToNextQuestion() {
        window.currentQuestionIndex++;
        this.broadcastQuestionChange();
        setTimeout(() => window.showQuestion?.(), 500);
    }

    broadcastQuestionChange() {
        if (!this.roomSystem.isMaster) return;

        const data = {
            index: window.currentQuestionIndex,
            total: window.questions.length,
            teamIndex: window.currentTeamIndex,
            teamName: window.teams?.[window.currentTeamIndex]?.name || 'Equipe',
            timestamp: Date.now()
        };

        firebase.database().ref(`rooms/${this.roomSystem.currentRoom}/currentQuestion`).set(data);

        if (window.teams?.[window.currentTeamIndex]) {
            const team = window.teams[window.currentTeamIndex];
            this.setCurrentTurn(window.currentTeamIndex, team.id, team.name);
        }
    }

    broadcastAnswerResult(isCorrect, points, answerData) {
        const data = {
            questionIndex: window.currentQuestionIndex,
            isCorrect,
            points,
            teamId: answerData.teamId,
            teamName: answerData.teamName,
            playerName: answerData.playerName,
            correctAnswer: window.questions[window.currentQuestionIndex]?.gabarito,
            timestamp: Date.now()
        };

        firebase.database().ref(`rooms/${this.roomSystem.currentRoom}/answerResult`).set(data);
    }

    // NOTIFICATIONS
    showNotification(message, type = 'info') {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#007bff'
        };

        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 9999;
            background: ${colors[type]}; color: ${type === 'warning' ? '#000' : '#fff'};
            padding: 15px 20px; border-radius: 5px; max-width: 300px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        notif.textContent = message;

        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 5000);
    }

    syncCurrentQuestion() {
        if (!this.roomSystem.currentRoom) return;

        firebase.database().ref(`rooms/${this.roomSystem.currentRoom}/currentQuestion`)
            .once('value').then(snap => {
                const data = snap.val();
                if (data) {
                    window.currentQuestionIndex = data.index || 0;
                    window.currentTeamIndex = data.teamIndex || 0;

                    if (window.showQuestion) window.showQuestion();

                    if (data.teamIndex !== undefined && window.teams?.[data.teamIndex]) {
                        const team = window.teams[data.teamIndex];
                        this.setCurrentTurn(data.teamIndex, team.id, team.name);
                    }
                }
            });
    }
}

window.TurnSystem = TurnSystem;

// Auto-start
function startTurnSystem() {
    if (window.roomSystem && window.TurnSystem) {
        window.turnSystem = new TurnSystem(window.roomSystem);
        window.turnSystem.setupTurnListeners();

        if (window.roomSystem.currentRoom && !window.roomSystem.isMaster) {
            setTimeout(() => window.turnSystem.syncCurrentQuestion(), 1000);
        }

        console.log('✅ Sistema de turnos inicializado');
    } else {
        setTimeout(startTurnSystem, 1000);
    }
}

setTimeout(startTurnSystem, 2000);

console.log('✅ turn-system-optimized.js carregado');
