// js/game/turn-system.js - Sistema de turnos e respostas
console.log('🔄 turn-system.js carregando...');

class TurnSystem {
    constructor(roomSystem) {
        this.roomSystem = roomSystem;
        this.currentTurn = null;
        this.setupTurnListeners();
        console.log('✅ Sistema de turnos inicializado');
    }
    
    setupTurnListeners() {
        if (!this.roomSystem.currentRoom) return;
        
        // Ouvir mudanças de turno
        const turnRef = firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentTurn');
        turnRef.on('value', (snapshot) => {
            const turnData = snapshot.val();
            if (turnData) {
                this.handleTurnChange(turnData);
            }
        });
        
        // Ouvir respostas das equipes
        const answersRef = firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/teamAnswers');
        answersRef.on('child_added', (snapshot) => {
            const answer = snapshot.val();
            this.handleTeamAnswer(answer);
        });
    }
    
    // MESTRE: Definir equipe de plantão
    setCurrentTurn(teamIndex, teamId, teamName) {
        if (!this.roomSystem.isMaster) return;
        
        const turnData = {
            teamIndex: teamIndex,
            teamId: teamId,
            teamName: teamName,
            questionIndex: window.currentQuestionIndex || 0,
            startTime: Date.now(),
            answered: false,
            masterId: this.roomSystem.playerId
        };
        
        firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentTurn')
            .set(turnData);
        
        console.log('👑 Mestre definiu turno:', teamName);
    }
    
    // MESTRE: Rotacionar equipe
    rotateTeam() {
        if (!this.roomSystem.isMaster || !window.teams || window.teams.length === 0) return;
        
        const nextIndex = (window.currentTeamIndex + 1) % window.teams.length;
        const nextTeam = window.teams[nextIndex];
        
        window.currentTeamIndex = nextIndex;
        window.consecutiveCorrect = 0; // Resetar acertos consecutivos
        
        this.setCurrentTurn(nextIndex, nextTeam.id, nextTeam.name);
        
        // Atualizar localmente
        if (window.updateTeamsDisplay) {
            window.updateTeamsDisplay();
        }
        
        console.log('🔄 Equipe rotacionada para:', nextTeam.name);
    }
    
    // TODOS: Processar mudança de turno
    handleTurnChange(turnData) {
        console.log('📥 Turno recebido:', turnData);
        
        // Sincronizar índices
        if (turnData.teamIndex !== undefined) {
            window.currentTeamIndex = turnData.teamIndex;
        }
        
        if (turnData.questionIndex !== undefined) {
            window.currentQuestionIndex = turnData.questionIndex;
        }
        
        // Atualizar display
        setTimeout(() => {
            // Atualizar equipe de plantão
            const teamTurnElement = document.getElementById('team-turn');
            if (teamTurnElement && turnData.teamName) {
                teamTurnElement.textContent = `🎯 ${turnData.teamName} - DE PLANTÃO`;
                
                // Aplicar cor da equipe
                const currentTeam = window.teams?.[window.currentTeamIndex];
                if (currentTeam && currentTeam.turnColorClass) {
                    teamTurnElement.className = 'team-turn ' + currentTeam.turnColorClass;
                }
            }
            
            // Atualizar contador de pergunta
            const questionNumber = document.getElementById('question-number');
            if (questionNumber) {
                questionNumber.textContent = (window.currentQuestionIndex + 1) || 1;
            }
            
            // Mostrar pergunta atual
            if (window.showQuestion) {
                window.showQuestion();
            }
            
            // Controlar botões de resposta
            this.updateAnswerButtons(turnData);
            
        }, 300);
    }
    
    // Controlar quem pode responder
    updateAnswerButtons(turnData) {
        const certoBtn = document.getElementById('certo-btn');
        const erradoBtn = document.getElementById('errado-btn');
        const skipBtn = document.getElementById('skip-btn');
        
        if (!certoBtn || !erradoBtn) return;
        
        // Verificar se o usuário atual está na equipe de plantão
        const userTeam = this.getUserTeam();
        const isUsersTurn = userTeam && userTeam.id === turnData.teamId;
        
        if (isUsersTurn) {
            // Usuário está na equipe de plantão - pode responder
            certoBtn.disabled = false;
            erradoBtn.disabled = false;
            certoBtn.style.opacity = '1';
            erradoBtn.style.opacity = '1';
            certoBtn.title = 'Responder CORRETO';
            erradoBtn.title = 'Responder ERRADO';
            
            console.log('🎮 Usuário pode responder - equipe de plantão');
        } else if (this.roomSystem.isMaster) {
            // Mestre sempre pode responder (é jogador também)
            certoBtn.disabled = false;
            erradoBtn.disabled = false;
            certoBtn.title = 'Mestre: Responder CORRETO';
            erradoBtn.title = 'Mestre: Responder ERRADO';
            
            console.log('👑 Mestre pode responder');
        } else {
            // Usuário não está na equipe de plantão - não pode responder
            certoBtn.disabled = true;
            erradoBtn.disabled = true;
            certoBtn.style.opacity = '0.5';
            erradoBtn.style.opacity = '0.5';
            certoBtn.title = 'Aguarde sua equipe';
            erradoBtn.title = 'Aguarde sua equipe';
            
            console.log('⏳ Usuário aguardando turno da equipe');
        }
        
        // Botão pular só para mestre
        if (skipBtn) {
            skipBtn.disabled = !this.roomSystem.isMaster;
            skipBtn.style.display = this.roomSystem.isMaster ? 'block' : 'none';
        }
        
        // Botão rodízio só para mestre
        const rotateBtn = document.getElementById('rotate-team-btn');
        if (rotateBtn) {
            rotateBtn.style.display = this.roomSystem.isMaster ? 'block' : 'none';
        }
    }
    
    // JOGADOR: Enviar resposta da equipe
    submitTeamAnswer(answer) {
        const currentTeam = window.teams?.[window.currentTeamIndex];
        if (!currentTeam || !this.roomSystem.currentRoom) return;
        
        const answerData = {
            teamId: currentTeam.id,
            teamName: currentTeam.name,
            playerId: this.roomSystem.playerId,
            playerName: this.roomSystem.playerName,
            answer: answer,
            timestamp: Date.now(),
            questionIndex: window.currentQuestionIndex
        };
        
        firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/teamAnswers')
            .push(answerData);
        
        console.log('📤 Resposta enviada:', answer);
    }
    
    // MESTRE: Processar resposta da equipe
    handleTeamAnswer(answerData) {
        if (!this.roomSystem.isMaster) return;
        
        console.log('📥 Resposta recebida da equipe:', answerData);
        
        // Verificar se é da equipe de plantão e pergunta atual
        const currentTurnRef = firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentTurn');
        currentTurnRef.once('value').then((snapshot) => {
            const currentTurn = snapshot.val();
            
            if (currentTurn && 
                currentTurn.teamId === answerData.teamId &&
                currentTurn.questionIndex === answerData.questionIndex &&
                !currentTurn.answered) {
                
                // Marcar como respondido
                currentTurnRef.update({ answered: true });
                
                // Processar resposta
                this.processAnswer(answerData);
            }
        });
    }
    
    // MESTRE: Processar e validar resposta
    processAnswer(answerData) {
        const question = window.questions[window.currentQuestionIndex];
        const gabarito = question?.gabarito ? question.gabarito.trim().toUpperCase() : '';
        const normalizedGabarito = this.normalizeAnswer(gabarito);
        const normalizedUserAnswer = this.normalizeAnswer(answerData.answer);
        
        const isCorrect = normalizedUserAnswer === normalizedGabarito;
        
        // Calcular pontos
        let points = 0;
        if (isCorrect) {
            window.consecutiveCorrect = (window.consecutiveCorrect || 0) + 1;
            points = 10 + (window.consecutiveCorrect * 2);
        } else {
            window.consecutiveCorrect = 0;
            points = -5;
        }
        
        // Atualizar pontuação
        const teamIndex = window.teams.findIndex(t => t.id === answerData.teamId);
        if (teamIndex !== -1) {
            window.teams[teamIndex].score += points;
            
            if (isCorrect) {
                window.teams[teamIndex].questionsAnswered++;
            } else {
                window.teams[teamIndex].questionsWrong++;
            }
            
            // Atualizar no Firebase
            this.updateTeamScore(teamIndex, window.teams[teamIndex].score);
            
            // Atualizar display
            if (window.updateTeamsDisplay) {
                window.updateTeamsDisplay();
            }
        }
        
        // Transmitir resultado
        this.broadcastAnswerResult(isCorrect, points, answerData);
        
        console.log(`✅ Resposta processada: ${answerData.answer} → ${isCorrect ? 'CORRETO' : 'ERRADO'} (${points} pts)`);
    }
    
    broadcastAnswerResult(isCorrect, points, answerData) {
        const resultData = {
            questionIndex: window.currentQuestionIndex,
            isCorrect: isCorrect,
            points: points,
            teamId: answerData.teamId,
            teamName: answerData.teamName,
            playerName: answerData.playerName,
            correctAnswer: window.questions[window.currentQuestionIndex]?.gabarito,
            timestamp: Date.now()
        };
        
        firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/answerResult')
            .set(resultData);
        
        console.log('📤 Resultado transmitido:', resultData);
    }
    
    updateTeamScore(teamIndex, score) {
        firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/gameData/teams/' + teamIndex + '/score')
            .set(score);
    }
    
    normalizeAnswer(answer) {
        if (!answer) return '';
        return answer.toString().trim().toUpperCase()
            .replace(/^CERTO$/i, 'C')
            .replace(/^ERRADO$/i, 'E')
            .replace(/^CERTA$/i, 'C')
            .replace(/^ERRADA$/i, 'E')
            .replace(/^C$/i, 'C')
            .replace(/^E$/i, 'E');
    }
    
    getUserTeam() {
        // Verificar em qual equipe o usuário está
        // (Isso precisa ser configurado quando o jogador entra)
        if (!window.teams) return null;
        
        // Por enquanto, retorna a primeira equipe
        // Você precisa implementar a lógica de associação jogador-equipe
        return window.teams[0];
    }
}

// Inicializar globalmente
setTimeout(() => {
    if (window.roomSystem) {
        window.turnSystem = new TurnSystem(window.roomSystem);
        console.log('✅ Sistema de turnos global criado');
    }
}, 2000);

console.log('✅ turn-system.js carregado');