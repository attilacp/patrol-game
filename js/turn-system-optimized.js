// js/turn-system-optimized.js - VERSÃO FINAL CORRIGIDA
console.log('🔄 Sistema de turnos otimizado carregando...');

class TurnSystem {
    constructor(roomSystem) {
        this.roomSystem = roomSystem;
        this.currentTurn = null;
        this.playerTeam = null;
        this.playerTeamId = null;
        this.teamAssigned = false;
        this.listenersConfigured = false; // Prevenir configuração duplicada
    }

    async submitAnswer(answer) {
        // Verificar se é o mestre OU se é jogador da equipe de plantão
        const canAnswer = this.roomSystem.isMaster || this.canPlayerAnswer();
        
        if (!canAnswer) {
            console.warn('⚠️ Não é sua vez de responder');
            return;
        }

        const question = window.questions?.[window.currentQuestionIndex];
        if (!question) {
            console.error('❌ Pergunta não encontrada');
            return;
        }

        // RESETAR FLAG ANTES DE PROCESSAR
        window.currentQuestionProcessed = false;

        // Normalizar resposta (aceita 'CERTO'/'ERRADO' ou true/false)
        let playerAnswer = answer;
        if (typeof answer === 'string') {
            playerAnswer = answer.toUpperCase();
        } else if (typeof answer === 'boolean') {
            playerAnswer = answer ? 'CERTO' : 'ERRADO';
        }

        // Normalizar gabarito
        let gabarito = (question.gabarito || '').toString().toUpperCase().trim();
        
        // Verificar se acertou
        const isCorrect = (playerAnswer === gabarito);
        
        console.log(`📤 Resposta: ${playerAnswer} | Gabarito: ${gabarito} | Acertou: ${isCorrect}`);

        // Processar acerto/erro LOCALMENTE
        if (isCorrect) {
            if (typeof handleCorrectAnswer === 'function') {
                handleCorrectAnswer();
            }
        } else {
            if (typeof handleWrongAnswer === 'function') {
                handleWrongAnswer();
            }
        }

        // TRANSMITIR RESULTADO (mestre E jogador)
        await this.broadcastAnswerResult(isCorrect, question);
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

    setupTurnListeners() {
        if (!this.roomSystem.currentRoom) {
            console.log('⏳ Sala ainda não disponível, aguardando...');
            // Tentar novamente após 500ms
            setTimeout(() => this.setupTurnListeners(), 500);
            return;
        }

        // Prevenir configuração duplicada
        if (this.listenersConfigured) {
            console.log('✅ Listeners já configurados');
            return;
        }

        const room = this.roomSystem.currentRoom;
        console.log('🔄 Configurando listeners para sala:', room);
        
        firebase.database().ref(`rooms/${room}/currentTurn`).on('value', snap => {
            if (snap.val()) {
                console.log('📡 currentTurn recebido:', snap.val());
                this.handleTurnChange(snap.val());
            }
        });

        firebase.database().ref(`rooms/${room}/players/${this.roomSystem.playerId}`).on('value', snap => {
            if (snap.val()?.teamId) this.updatePlayerTeam(snap.val().teamId);
        });

        firebase.database().ref(`rooms/${room}/answerResult`).on('value', snap => {
            if (snap.val()) {
                console.log('📡 answerResult recebido do Firebase:', snap.val());
                this.handleAnswerResult(snap.val());
            }
        });

        firebase.database().ref(`rooms/${room}/currentQuestion`).on('value', snap => {
            if (snap.val()) this.handleQuestionChange(snap.val());
        });

        if (this.roomSystem.isMaster) {
            setTimeout(() => this.assignMasterToTeam(), 500);
        }
        
        this.listenersConfigured = true;
        console.log('✅ Listeners do TurnSystem configurados');
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
        // console.log('🔍 Verificando se pode responder:');
        // console.log('  - É mestre?', this.roomSystem.isMaster);
        // console.log('  - currentTurn:', this.currentTurn);
        // console.log('  - playerTeamId:', this.playerTeamId);
        
        if (this.roomSystem.isMaster) return true;
        if (!this.currentTurn || !this.playerTeamId) {
            // console.log('  ❌ Faltam dados (currentTurn ou playerTeamId)');
            return false;
        }
        
        const canAnswer = this.currentTurn.teamId === this.playerTeamId;
        // console.log('  - Turn teamId:', this.currentTurn.teamId);
        // console.log('  - Player teamId:', this.playerTeamId);
        // console.log('  → Resultado:', canAnswer);
        
        return canAnswer;
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
        
        // SINCRONIZAR novo turno com Firebase
        if (this.roomSystem?.isMaster && this.roomSystem?.currentRoom) {
            this.setCurrentTurn(window.currentTeamIndex);
        }
        
        return window.currentTeamIndex;
    }

    handleTurnChange(turnData) {
        const previousTeamId = this.currentTurn?.teamId;
        this.currentTurn = turnData;
        
        // RESETAR consecutivos se mudou de equipe
        if (previousTeamId && previousTeamId !== turnData.teamId) {
            console.log('🔄 Equipe mudou, resetando consecutivos');
            window.consecutiveCorrect = 0;
        }
        
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
                btn.style.cursor = (canAnswer || this.roomSystem.isMaster) ? 'pointer' : 'not-allowed';
            }
        });
    }

    handleQuestionChange(questionData) {
        console.log('📚 Nova pergunta:', questionData.index + 1);
        
        window.currentQuestionIndex = questionData.index || 0;
        window.currentQuestionProcessed = false;
        
        if (typeof showQuestion === 'function') {
            showQuestion();
        } else if (typeof displayQuestionWithSubject === 'function') {
            displayQuestionWithSubject();
        }
        
        if (typeof enableQuestionControls === 'function') {
            enableQuestionControls();
        }
    }

    handleAnswerResult(resultData) {
        console.log('📊 ===== PROCESSANDO RESULTADO =====');
        console.log('📊 Dados:', resultData);
        console.log('📊 Equipe no resultado:', resultData.teamName);
        console.log('📊 Equipe atual (index):', window.currentTeamIndex);
        console.log('📊 Equipes disponíveis:', window.teams?.map(t => t.name));
        
        // ENCONTRAR EQUIPE PELO NOME (mais confiável que índice)
        const teamIndex = window.teams?.findIndex(t => t.name === resultData.teamName);
        const team = window.teams[teamIndex];
        
        if (!team || teamIndex === -1) {
            console.error('❌ Equipe não encontrada:', resultData.teamName);
            return;
        }
        
        // PRESERVAR assignedPlayers (não perder ao atualizar)
        const preservedAssignedPlayers = team.assignedPlayers;
        
        // Atualizar pontuação da equipe SE ACERTOU
        if (resultData.isCorrect) {
            const oldScore = team.score || 0;
            
            // VERIFICAR SE PRECISA INCREMENTAR SCORE
            // - MESTRE respondendo: SIM (não foi incrementado antes)
            // - JOGADOR respondendo: NÃO (já foi incrementado em room-answer-sync.js)
            const isMasterAnswer = !resultData.playerName || resultData.playerName === 'Mestre';
            
            if (this.roomSystem.isMaster && isMasterAnswer) {
                // MESTRE respondendo: incrementar aqui
                team.score = oldScore + 1;
                console.log(`✅ ${team.name}: ${oldScore} → ${team.score} pontos (mestre respondeu)`);
            } else {
                // JOGADOR respondendo: já incrementado em room-answer-sync.js
                console.log(`✅ ${team.name}: ${team.score} pontos (jogador respondeu - já incrementado)`);
            }
            
            team.questionsAnswered = (team.questionsAnswered || 0) + 1;
            team.questionsCorrect = (team.questionsCorrect || 0) + 1;
            
            // SALVAR EQUIPE NO FIREBASE (para sincronizar scores)
            if (this.roomSystem && this.roomSystem.currentRoom && isMasterAnswer) {
                firebase.database()
                    .ref(`rooms/${this.roomSystem.currentRoom}/gameData/teams/${teamIndex}`)
                    .set({
                        id: team.id,
                        name: team.name,
                        score: team.score,
                        questionsAnswered: team.questionsAnswered,
                        questionsCorrect: team.questionsCorrect,
                        questionsWrong: team.questionsWrong || 0,
                        colorClass: team.colorClass || '',
                        turnColorClass: team.turnColorClass || '',
                        assignedPlayers: team.assignedPlayers || []
                    })
                    .then(() => console.log(`💾 ${team.name} sincronizada no Firebase`))
                    .catch(err => console.error('❌ Erro ao sincronizar equipe:', err));
            }
            
            // VERIFICAR SE ATINGIU 15 PONTOS (FIM DE JOGO)
            if (team.score >= 15) {
                console.log(`🏆 ${team.name} atingiu ${team.score} pontos - FIM DE JOGO!`);
                window.winnerTeam = team;
                
                // Atualizar display
                if (typeof updateTeamsDisplay === 'function') {
                    updateTeamsDisplay();
                }
                
                // SALVAR VENCEDOR NO FIREBASE
                if (this.roomSystem && this.roomSystem.currentRoom) {
                    firebase.database()
                        .ref(`rooms/${this.roomSystem.currentRoom}/winner`)
                        .set({
                            teamName: team.name,
                            teamId: team.id,
                            score: team.score,
                            timestamp: Date.now()
                        })
                        .then(() => console.log('🏆 Vencedor salvo no Firebase'))
                        .catch(err => console.error('❌ Erro ao salvar vencedor:', err));
                }
                
                // Mostrar mensagem de vitória
                if (typeof showWinnerMessage === 'function') {
                    showWinnerMessage();
                }
                
                return; // Parar processamento
            }
            
            // RESTAURAR assignedPlayers (que pode ter sido perdido)
            if (!team.assignedPlayers || team.assignedPlayers.length === 0) {
                team.assignedPlayers = preservedAssignedPlayers;
            }
            
            // Atualizar display UMA VEZ
            if (typeof updateTeamsDisplay === 'function') {
                updateTeamsDisplay();
            }
        } else {
            team.questionsAnswered = (team.questionsAnswered || 0) + 1;
            team.questionsWrong = (team.questionsWrong || 0) + 1;
            
            console.log(`❌ ${team.name} errou`);
            
            // RESTAURAR assignedPlayers
            team.assignedPlayers = preservedAssignedPlayers;
            
            // Forçar atualização visual
            if (typeof updateTeamsDisplay === 'function') {
                updateTeamsDisplay();
                setTimeout(() => {
                    team.assignedPlayers = preservedAssignedPlayers;
                    updateTeamsDisplay();
                }, 100);
            }
        }

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
            if (btn) {
                btn.disabled = true;
                btn.style.cursor = 'not-allowed';
            }
        });

        const nextBtn = document.getElementById('next-question-btn');
        if (nextBtn) nextBtn.style.display = 'inline-block';
        
        console.log('📊 ===== FIM PROCESSAMENTO =====');
    }

    async advanceToNextQuestion() {
        if (!this.roomSystem.isMaster) return;

        window.currentQuestionIndex++;
        
        if (window.currentQuestionIndex >= window.questions.length) {
            if (typeof showPodium === 'function') showPodium();
            return;
        }

        // IMPORTANTE: Não chamar setCurrentTurn aqui!
        // O GameCoordinator já fez o rodízio (se necessário) ANTES de chamar esta função
        // Se chamarmos setCurrentTurn aqui, vamos SOBRESCREVER o rodízio
        
        // Apenas transmitir a pergunta
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
            console.log('🔄 TurnSystem criado');
            
            // Tentar configurar listeners (com retry automático)
            window.turnSystem.setupTurnListeners();
        }
    }, 1000);
});

// Permitir configuração manual também
window.initializeTurnListeners = function() {
    if (window.turnSystem) {
        console.log('📡 Inicializando listeners manualmente...');
        window.turnSystem.setupTurnListeners();
    }
};

window.TurnSystem = TurnSystem;
console.log('✅ turn-system-optimized.js carregado');
