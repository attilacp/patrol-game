// js/turn-system-optimized.js - VERSÃO FINAL SEM DUPLICAÇÕES
console.log('🔄 Sistema de turnos otimizado carregando...');

class TurnSystem {
    constructor(roomSystem) {
        this.roomSystem = roomSystem;
        this.currentTurn = null;
        this.playerTeam = null;
        this.playerTeamId = null;
        this.teamAssigned = false;
    }

    async submitAnswer(isCorrect) {
        if (!this.roomSystem.isMaster) {
            console.warn('⚠️ Apenas o mestre pode submeter respostas');
            return;
        }

        const question = window.questions?.[window.currentQuestionIndex];
        if (!question) return;

        console.log(`📤 Submetendo resposta: ${isCorrect ? 'CORRETA' : 'ERRADA'}`);

        if (isCorrect && typeof handleCorrectAnswer === 'function') {
            handleCorrectAnswer();
        } else if (!isCorrect && typeof handleWrongAnswer === 'function') {
            handleWrongAnswer();
        }

        await this.broadcastAnswerResult(isCorrect, question);
    }

    async broadcastAnswerResult(isCorrect, question) {
        if (!this.roomSystem.currentRoom) return;

        let allComments = '';
        if (question.comentario) allComments += question.comentario;
        if (question.comentario2) allComments += (allComments ? '<br><br>' : '') + question.comentario2;
        if (question.comentario3) allComments += (allComments ? '<br><br>' : '') + question.comentario3;

        await firebase.database()
            .ref(`rooms/${this.roomSystem.currentRoom}/answerResult`)
            .set({
                isCorrect: isCorrect,
                correctAnswer: question.gabarito || 'Não informado',
                comments: allComments,
                questionIndex: window.currentQuestionIndex,
                teamName: window.teams?.[window.currentTeamIndex]?.name,
                timestamp: Date.now()
            });
    }

    setupTurnListeners() {
        if (!this.roomSystem.currentRoom) return;

        const room = this.roomSystem.currentRoom;
        
        firebase.database().ref(`rooms/${room}/currentTurn`).on('value', snap => {
            if (snap.val()) this.handleTurnChange(snap.val());
        });

        firebase.database().ref(`rooms/${room}/players/${this.roomSystem.playerId}`).on('value', snap => {
            if (snap.val()?.teamId) this.updatePlayerTeam(snap.val().teamId);
        });

        firebase.database().ref(`rooms/${room}/answerResult`).on('value', snap => {
            if (snap.val()) this.handleAnswerResult(snap.val());
        });

        firebase.database().ref(`rooms/${room}/currentQuestion`).on('value', snap => {
            if (snap.val()) this.handleQuestionChange(snap.val());
        });

        if (this.roomSystem.isMaster) {
            setTimeout(() => this.assignMasterToTeam(), 500);
        }
    }

    updatePlayerTeam(teamId) {
        if (this.teamAssigned) return;
        this.playerTeamId = teamId;
        const team = window.teams?.find(t => t.id === teamId);
        if (team) {
            this.playerTeam = team;
            this.teamAssigned = true;
        }
    }

    assignMasterToTeam() {
        if (window.teams?.[0]) {
            this.updatePlayerTeam(window.teams[0].id);
        }
    }

    canPlayerAnswer() {
        if (this.roomSystem.isMaster) return true;
        if (!this.currentTurn || !this.playerTeamId) return false;
        return this.currentTurn.teamId === this.playerTeamId;
    }

    async setCurrentTurn(teamIndex) {
        if (!this.roomSystem.isMaster || !this.roomSystem.currentRoom) return;
        const team = window.teams?.[teamIndex];
        if (!team) return;

        await firebase.database()
            .ref(`rooms/${this.roomSystem.currentRoom}/currentTurn`)
            .set({
                teamId: team.id,
                teamIndex: teamIndex,
                teamName: team.name,
                questionIndex: window.currentQuestionIndex,
                startTime: Date.now(),
                answered: false
            });
    }

    rotateTeam() {
        if (!window.teams) return;
        window.currentTeamIndex = (window.currentTeamIndex + 1) % window.teams.length;
        console.log(`🔄 Rodando equipe: ${window.teams[window.currentTeamIndex].name}`);
        return window.currentTeamIndex;
    }

    handleTurnChange(turnData) {
        this.currentTurn = turnData;
        
        const teamTurn = document.getElementById('team-turn');
        if (teamTurn) {
            teamTurn.textContent = `🎯 ${turnData.teamName} - DE PLANTÃO`;
            const team = window.teams?.[turnData.teamIndex];
            if (team) {
                teamTurn.className = 'team-turn ' + (team.turnColorClass || 'team-color-1');
            }
        }

        const canAnswer = this.canPlayerAnswer();
        ['certo-btn', 'errado-btn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = !canAnswer && !this.roomSystem.isMaster;
                btn.style.opacity = (canAnswer || this.roomSystem.isMaster) ? '1' : '0.5';
            }
        });
    }

    handleQuestionChange(questionData) {
        console.log('📚 Nova pergunta:', questionData.index + 1);
        console.log('🔍 DEBUG questionData:', questionData);
        
        window.currentQuestionIndex = questionData.index || 0;
        window.currentQuestionProcessed = false;
        
        console.log('🔍 DEBUG window.questions existe?', !!window.questions);
        console.log('🔍 DEBUG window.questions.length?', window.questions?.length);
        console.log('🔍 DEBUG showQuestion existe?', typeof showQuestion);
        
        if (typeof showQuestion === 'function') {
            console.log('✅ Chamando showQuestion()...');
            showQuestion();
        } else if (typeof displayQuestionWithSubject === 'function') {
            console.log('✅ Chamando displayQuestionWithSubject()...');
            displayQuestionWithSubject();
        } else {
            console.error('❌ Nenhuma função de exibição encontrada!');
        }
        
        if (typeof enableQuestionControls === 'function') {
            enableQuestionControls();
        }
    }

    handleAnswerResult(resultData) {
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

        ['certo-btn', 'errado-btn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = true;
        });

        const nextBtn = document.getElementById('next-question-btn');
        if (nextBtn) nextBtn.style.display = 'inline-block';

        if (resultData.isCorrect && typeof updateTeamsDisplay === 'function') {
            updateTeamsDisplay();
        }
    }

    async advanceToNextQuestion() {
        if (!this.roomSystem.isMaster) return;

        window.currentQuestionIndex++;
        
        if (window.currentQuestionIndex >= window.questions.length) {
            if (typeof showPodium === 'function') showPodium();
            return;
        }

        // Verificar se deve rodar equipe
        let nextTeamIndex = window.currentTeamIndex;
        if (window.nextTeamRotation === true) {
            nextTeamIndex = this.rotateTeam();
            window.nextTeamRotation = false;
        }

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
            <div class="pergunta-texto">${question.enunciado || 'Sem enunciado'}</div>`;
        } else {
            questionHTML = `<div class="pergunta-texto">${question.enunciado || 'Sem enunciado'}</div>`;
        }

        await firebase.database()
            .ref(`rooms/${this.roomSystem.currentRoom}/currentQuestion`)
            .set({
                index: window.currentQuestionIndex,
                total: window.questions.length,
                questionHTML: questionHTML,
                enunciado: question.enunciado,
                timestamp: Date.now()
            });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.roomSystem && !window.turnSystem) {
            window.turnSystem = new TurnSystem(window.roomSystem);
        }
    }, 1000);
});

window.TurnSystem = TurnSystem;
console.log('✅ turn-system-optimized.js carregado');
