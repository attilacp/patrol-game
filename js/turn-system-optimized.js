// js/turn-system-optimized.js - CORRIGIDO (Erro 1)
console.log('🔄 Sistema de turnos otimizado carregando...');

class TurnSystem {
    constructor(roomSystem) {
        this.roomSystem = roomSystem;
        this.currentTurn = null;
        this.playerTeam = null;
        this.playerTeamId = null;
        this.teamAssigned = false;
    }

    // ========================================
    // SUBMIT ANSWER (PRINCIPAL)
    // ========================================
    async submitAnswer(isCorrect) {
        if (!this.roomSystem.isMaster) {
            console.warn('⚠️ Apenas o mestre pode submeter respostas');
            return;
        }

        const question = window.questions?.[window.currentQuestionIndex];
        if (!question) {
            console.error('❌ Pergunta não encontrada');
            return;
        }

        console.log(`📤 Submetendo resposta: ${isCorrect ? 'CORRETA' : 'ERRADA'}`);

        try {
            // 1. Processar resposta localmente
            if (isCorrect) {
                if (typeof handleCorrectAnswer === 'function') {
                    handleCorrectAnswer();
                }
            } else {
                if (typeof handleWrongAnswer === 'function') {
                    handleWrongAnswer();
                }
            }

            // 2. Sincronizar resultado para todos
            await this.broadcastAnswerResult(isCorrect, question);

            console.log('✅ Resposta processada e sincronizada');

        } catch (error) {
            console.error('❌ Erro ao submeter resposta:', error);
        }
    }

    async broadcastAnswerResult(isCorrect, question) {
        if (!this.roomSystem.currentRoom) return;

        let allComments = '';
        if (question.comentario) allComments += question.comentario;
        if (question.comentario2) allComments += (allComments ? '<br><br>' : '') + question.comentario2;
        if (question.comentario3) allComments += (allComments ? '<br><br>' : '') + question.comentario3;

        const resultData = {
            isCorrect: isCorrect,
            correctAnswer: question.gabarito || 'Não informado',
            comments: allComments,
            questionIndex: window.currentQuestionIndex,
            teamName: window.teams?.[window.currentTeamIndex]?.name,
            timestamp: Date.now()
        };

        await firebase.database()
            .ref(`rooms/${this.roomSystem.currentRoom}/answerResult`)
            .set(resultData);

        console.log('📤 Resultado transmitido:', resultData);
    }

    // ========================================
    // LISTENERS
    // ========================================
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
        
        firebase.database().ref(`rooms/${room}/currentTurn`).once('value', snap => {
            const data = snap.val();
            if (data) {
                console.log('🔄 Estado inicial do turno:', data);
                this.handleTurnChange(data);
            }
        });

        firebase.database().ref(`rooms/${room}/currentQuestion`).once('value', snap => {
            const data = snap.val();
            if (data) {
                console.log('📚 Estado inicial da pergunta:', data);
                this.handleQuestionChange(data);
            }
        });
    }

    // ========================================
    // TEAMS
    // ========================================
    updatePlayerTeam(teamId) {
        if (this.teamAssigned) return;

        this.playerTeamId = teamId;
        
        if (window.teams) {
            const team = window.teams.find(t => t.id === teamId);
            if (team) {
                this.playerTeam = team;
                this.teamAssigned = true;
                console.log(`✅ Jogador atribuído à equipe: ${team.name}`);
            }
        }
    }

    assignMasterToTeam() {
        if (!this.roomSystem.isMaster || !window.teams?.[0]) return;
        
        const firstTeam = window.teams[0];
        this.updatePlayerTeam(firstTeam.id);
        
        console.log(`👑 Mestre atribuído à equipe: ${firstTeam.name}`);
    }

    canPlayerAnswer() {
        if (this.roomSystem.isMaster) return true;
        if (!this.currentTurn) return false;
        if (!this.playerTeamId) return false;
        
        return this.currentTurn.teamId === this.playerTeamId;
    }

    // ========================================
    // INTERFACE
    // ========================================
    async setCurrentTurn(teamIndex) {
        if (!this.roomSystem.isMaster || !this.roomSystem.currentRoom) return;

        const team = window.teams?.[teamIndex];
        if (!team) return;

        const turnData = {
            teamId: team.id,
            teamIndex: teamIndex,
            teamName: team.name,
            questionIndex: window.currentQuestionIndex,
            startTime: Date.now(),
            answered: false
        };

        await firebase.database()
            .ref(`rooms/${this.roomSystem.currentRoom}/currentTurn`)
            .set(turnData);

        console.log(`🎯 Turno definido: ${team.name}`);
    }

    rotateTeam() {
        if (!window.teams) return;

        window.currentTeamIndex = (window.currentTeamIndex + 1) % window.teams.length;
        console.log(`🔄 Rodando equipe: ${window.teams[window.currentTeamIndex].name}`);
        
        return window.currentTeamIndex;
    }

    handleTurnChange(turnData) {
        this.currentTurn = turnData;
        this.updateTurnUI(turnData);
        this.updateAnswerButtons(turnData);
    }

    updateTurnUI(turnData) {
        const teamTurn = document.getElementById('team-turn');
        if (!teamTurn) return;

        teamTurn.textContent = `🎯 ${turnData.teamName} - DE PLANTÃO`;
        
        if (window.teams) {
            const team = window.teams[turnData.teamIndex];
            if (team) {
                teamTurn.className = 'team-turn ' + (team.turnColorClass || 'team-color-1');
            }
        }
    }

    updateAnswerButtons(turnData) {
        const canAnswer = this.canPlayerAnswer();
        const certoBtn = document.getElementById('certo-btn');
        const erradoBtn = document.getElementById('errado-btn');

        if (certoBtn) {
            certoBtn.disabled = !canAnswer && !this.roomSystem.isMaster;
            certoBtn.style.opacity = (canAnswer || this.roomSystem.isMaster) ? '1' : '0.5';
        }

        if (erradoBtn) {
            erradoBtn.disabled = !canAnswer && !this.roomSystem.isMaster;
            erradoBtn.style.opacity = (canAnswer || this.roomSystem.isMaster) ? '1' : '0.5';
        }
    }

    // ========================================
    // RESULTS
    // ========================================
    handleQuestionChange(questionData) {
        console.log('📚 Nova pergunta:', questionData.index + 1);
        
        window.currentQuestionIndex = questionData.index || 0;
        
        // CORREÇÃO ERRO 1: Chamar showQuestion E habilitar controles
        if (typeof showQuestion === 'function') {
            showQuestion();
        } else if (typeof displayQuestionWithSubject === 'function') {
            displayQuestionWithSubject();
        }

        // HABILITAR BOTÕES APÓS NOVA PERGUNTA
        if (typeof enableQuestionControls === 'function') {
            enableQuestionControls();
        }
    }

    handleAnswerResult(resultData) {
        console.log('✅ Resultado recebido:', resultData.isCorrect ? 'CORRETO' : 'ERRADO');
        
        this.showResult(resultData);
        
        if (resultData.isCorrect && window.currentTeamIndex !== undefined) {
            const team = window.teams?.[window.currentTeamIndex];
            if (team) {
                team.score = (team.score || 0) + 1;
                
                if (typeof updateTeamsDisplay === 'function') {
                    updateTeamsDisplay();
                }
            }
        }
    }

    showResult(resultData) {
        const correctAnswer = document.getElementById('correct-answer');
        if (correctAnswer) {
            correctAnswer.textContent = resultData.isCorrect ? '✅ ACERTOU' : '❌ ERROU';
            correctAnswer.className = resultData.isCorrect ? 'correct-answer' : 'wrong-answer';
            
            if (resultData.correctAnswer) {
                correctAnswer.textContent += ' - GABARITO: ' + resultData.correctAnswer;
            }
        }

        const commentary = document.getElementById('commentary');
        if (commentary && resultData.comments) {
            commentary.innerHTML = resultData.comments;
            commentary.classList.add('active');
        }

        const certoBtn = document.getElementById('certo-btn');
        const erradoBtn = document.getElementById('errado-btn');
        const nextBtn = document.getElementById('next-question-btn');

        if (certoBtn) certoBtn.disabled = true;
        if (erradoBtn) erradoBtn.disabled = true;
        if (nextBtn) nextBtn.style.display = 'inline-block';
    }

    async advanceToNextQuestion() {
        if (!this.roomSystem.isMaster) return;

        window.currentQuestionIndex++;
        
        if (window.currentQuestionIndex >= window.questions.length) {
            console.log('🏁 Fim do jogo');
            if (typeof showPodium === 'function') {
                showPodium();
            }
            return;
        }

        const nextTeamIndex = this.rotateTeam();
        await this.setCurrentTurn(nextTeamIndex);
        await this.broadcastQuestionChange();
    }

    async broadcastQuestionChange() {
        if (!this.roomSystem.isMaster || !this.roomSystem.currentRoom) return;

        const question = window.questions?.[window.currentQuestionIndex];
        if (!question) return;

        let questionHTML = '';
        if (question.assuntoInfo) {
            questionHTML = `<div class="assunto-container">
                <div class="assunto-icon">📚</div>
                <div class="assunto-text">${question.assuntoInfo}</div>
            </div>
            <div class="pergunta-texto">${question.enunciado || 'Pergunta sem enunciado'}</div>`;
        } else {
            questionHTML = `<div class="pergunta-texto">${question.enunciado || 'Pergunta sem enunciado'}</div>`;
        }

        const questionData = {
            index: window.currentQuestionIndex,
            total: window.questions.length,
            questionHTML: questionHTML,
            enunciado: question.enunciado,
            timestamp: Date.now()
        };

        await firebase.database()
            .ref(`rooms/${this.roomSystem.currentRoom}/currentQuestion`)
            .set(questionData);

        console.log('📤 Pergunta transmitida');
    }

    showNotification(message, type = 'info') {
        console.log(`📢 ${message}`);
    }

    syncCurrentQuestion() {
        if (!this.roomSystem.isMaster) return;
        this.broadcastQuestionChange();
    }
}

// Auto-inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (window.roomSystem) {
        window.turnSystem = new TurnSystem(window.roomSystem);
        console.log('✅ Sistema de turnos inicializado');
    } else {
        setTimeout(() => {
            if (window.roomSystem) {
                window.turnSystem = new TurnSystem(window.roomSystem);
                console.log('✅ Sistema de turnos inicializado');
            }
        }, 2000);
    }
});

window.TurnSystem = TurnSystem;

console.log('✅ turn-system-optimized.js carregado');
