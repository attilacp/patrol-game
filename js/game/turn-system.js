// js/game/turn-system.js - SISTEMA COMPLETO DE TURNOS
console.log('🔄 turn-system.js carregando...');

class TurnSystem {
    constructor(roomSystem) {
        this.roomSystem = roomSystem;
        this.currentTurn = null;
        this.setupTurnListeners();
        this.playerTeam = null; // Equipe do jogador atual
        console.log('✅ Sistema de turnos inicializado');
    }
    
    setupTurnListeners() {
        if (!this.roomSystem.currentRoom) return;
        
        console.log('👂 Configurando listeners de turno...');
        
        // 1. Ouvir turno atual
        const turnRef = firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentTurn');
        turnRef.on('value', (snapshot) => {
            const turnData = snapshot.val();
            if (turnData) {
                this.handleTurnChange(turnData);
            }
        });
        
        // 2. Ouvir resultados de respostas
        const resultRef = firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/answerResult');
        resultRef.on('value', (snapshot) => {
            const resultData = snapshot.val();
            if (resultData) {
                this.handleAnswerResult(resultData);
            }
        });
        
        // 3. Ouvir mudanças de pergunta
        const questionRef = firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentQuestion');
        questionRef.on('value', (snapshot) => {
            const questionData = snapshot.val();
            if (questionData) {
                this.handleQuestionChange(questionData);
            }
        });
        
        // 4. Se for jogador, escolher equipe
        if (!this.roomSystem.isMaster) {
            this.setupTeamSelection();
        }
    }
    
    setupTeamSelection() {
        console.log('👤 Jogador precisa escolher equipe');
        
        // Mostrar modal para escolher equipe
        setTimeout(() => {
            this.showTeamSelectionModal();
        }, 1500);
    }
    
    showTeamSelectionModal() {
        if (!window.teams || window.teams.length === 0) {
            console.log('⏳ Aguardando equipes carregarem...');
            setTimeout(() => this.showTeamSelectionModal(), 1000);
            return;
        }
        
        const modal = document.createElement('div');
        modal.id = 'team-selection-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 10000;
            display: flex; justify-content: center; align-items: center;
        `;
        
        let teamsHtml = '<h3 style="color: #FFCC00; margin-bottom: 20px;">🏆 Escolha sua Equipe</h3>';
        window.teams.forEach((team, index) => {
            teamsHtml += `
                <button class="team-select-btn" data-team-index="${index}" 
                        style="background: ${this.getTeamColor(index)}; 
                               color: white; border: none; padding: 15px 30px;
                               margin: 10px; border-radius: 10px; cursor: pointer;
                               font-size: 16px; font-weight: bold; width: 200px;">
                    ${team.name}
                    ${team.players && team.players.length > 0 ? 
                      `<br><small>(${team.players.join(', ')})</small>` : ''}
                </button><br>
            `;
        });
        
        modal.innerHTML = `
            <div style="background: #003366; padding: 30px; border-radius: 15px;
                        border: 3px solid #FFCC00; text-align: center; max-width: 500px;">
                ${teamsHtml}
                <p style="color: #ccc; margin-top: 20px; font-size: 14px;">
                    Você poderá responder apenas quando sua equipe estiver de plantão
                </p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar event listeners
        document.querySelectorAll('.team-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const teamIndex = parseInt(e.target.dataset.teamIndex);
                this.selectPlayerTeam(teamIndex);
                modal.remove();
            });
        });
    }
    
    getTeamColor(index) {
        const colors = [
            '#E53935', '#00897B', '#FFA000', '#1E3799', '#EC407A',
            '#4DB6AC', '#6C5CE7', '#F9A825', '#C23616', '#008F74'
        ];
        return colors[index % colors.length];
    }
    
    selectPlayerTeam(teamIndex) {
        if (!window.teams[teamIndex]) return;
        
        this.playerTeam = window.teams[teamIndex];
        console.log(`✅ Jogador selecionou equipe: ${this.playerTeam.name}`);
        
        // Salvar no Firebase
        if (this.roomSystem.currentRoom) {
            firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/players/' + this.roomSystem.playerId)
                .update({ teamId: this.playerTeam.id, teamName: this.playerTeam.name });
        }
        
        alert(`✅ Você entrou na equipe ${this.playerTeam.name}!`);
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
        window.consecutiveCorrect = 0;
        
        this.setCurrentTurn(nextIndex, nextTeam.id, nextTeam.name);
        
        console.log('🔄 Equipe rotacionada para:', nextTeam.name);
    }
    
    // TODOS: Processar mudança de turno
    handleTurnChange(turnData) {
        console.log('📥 Turno recebido:', turnData.teamName, 'Pergunta:', turnData.questionIndex + 1);
        
        this.currentTurn = turnData;
        
        // Sincronizar com estado local
        window.currentTeamIndex = turnData.teamIndex;
        window.currentQuestionIndex = turnData.questionIndex;
        
        // Atualizar interface
        this.updateTurnUI();
        
        // Controlar botões de resposta
        this.updateAnswerButtons();
    }
    
    updateTurnUI() {
        setTimeout(() => {
            // Atualizar equipe de plantão
            const teamTurnElement = document.getElementById('team-turn');
            if (teamTurnElement && this.currentTurn) {
                teamTurnElement.textContent = `🎯 ${this.currentTurn.teamName} - DE PLANTÃO`;
                
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
            if (window.showQuestion && window.questions[window.currentQuestionIndex]) {
                window.showQuestion();
            }
            
            // Atualizar display das equipes
            if (window.updateTeamsDisplay) {
                window.updateTeamsDisplay();
            }
            
        }, 300);
    }
    
    updateAnswerButtons() {
        const certoBtn = document.getElementById('certo-btn');
        const erradoBtn = document.getElementById('errado-btn');
        
        if (!certoBtn || !erradoBtn) return;
        
        // Verificar se o jogador pode responder
        const canAnswer = this.canPlayerAnswer();
        
        if (canAnswer) {
            // Jogador pode responder
            certoBtn.disabled = false;
            erradoBtn.disabled = false;
            certoBtn.style.opacity = '1';
            erradoBtn.style.opacity = '1';
            certoBtn.style.cursor = 'pointer';
            erradoBtn.style.cursor = 'pointer';
            
            console.log('🎯 Jogador pode responder - equipe de plantão');
        } else {
            // Jogador não pode responder
            certoBtn.disabled = true;
            erradoBtn.disabled = true;
            certoBtn.style.opacity = '0.5';
            erradoBtn.style.opacity = '0.5';
            certoBtn.style.cursor = 'not-allowed';
            erradoBtn.style.cursor = 'not-allowed';
            
            console.log('⏳ Jogador não está na equipe de plantão');
        }
    }
    
    canPlayerAnswer() {
        if (!this.currentTurn || !this.playerTeam) return false;
        
        // Verificar se o jogador está na equipe de plantão
        return this.playerTeam.id === this.currentTurn.teamId;
    }
    
    // JOGADOR: Enviar resposta
    submitAnswer(answer) {
        if (!this.canPlayerAnswer()) {
            alert('⏳ Aguarde sua equipe estar de plantão!');
            return;
        }
        
        if (!this.roomSystem.currentRoom) return;
        
        const answerData = {
            teamId: this.playerTeam.id,
            teamName: this.playerTeam.name,
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
    
    // MESTRE: Processar resposta recebida
    handleTeamAnswer(answerData) {
        if (!this.roomSystem.isMaster) return;
        
        console.log('📥 Resposta recebida:', answerData);
        
        // Verificar se é do turno atual e pergunta atual
        if (this.currentTurn &&
            this.currentTurn.teamId === answerData.teamId &&
            this.currentTurn.questionIndex === answerData.questionIndex &&
            !this.currentTurn.answered) {
            
            // Marcar como respondido
            firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentTurn')
                .update({ answered: true });
            
            // Processar resposta
            this.processAnswer(answerData);
        }
    }
    
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
        
        // Atualizar pontuação local
        const teamIndex = window.teams.findIndex(t => t.id === answerData.teamId);
        if (teamIndex !== -1) {
            window.teams[teamIndex].score += points;
            
            if (window.updateTeamsDisplay) {
                window.updateTeamsDisplay();
            }
            
            // Atualizar no Firebase
            this.updateTeamScore(teamIndex, window.teams[teamIndex].score);
        }
        
        // Transmitir resultado
        this.broadcastAnswerResult(isCorrect, points, answerData);
        
        console.log(`✅ Resposta processada: ${isCorrect ? 'CORRETO' : 'ERRADO'} (${points} pts)`);
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
        
        console.log('📤 Resultado transmitido');
    }
    
    handleAnswerResult(resultData) {
        console.log('📥 Resultado recebido:', resultData);
        
        // Mostrar resultado na tela
        this.showResult(resultData);
        
        // Se for mestre, aguardar e avançar
        if (this.roomSystem.isMaster) {
            setTimeout(() => {
                this.advanceToNextQuestion();
            }, 3000);
        }
    }
    
    showResult(resultData) {
        const questionText = document.getElementById('question-text');
        if (!questionText) return;
        
        const resultHtml = `
            <div style="background: ${resultData.isCorrect ? '#d4edda' : '#f8d7da'}; 
                        padding: 15px; border-radius: 10px; margin-bottom: 20px;
                        border: 2px solid ${resultData.isCorrect ? '#28a745' : '#dc3545'};">
                <h3 style="color: ${resultData.isCorrect ? '#155724' : '#721c24'}; margin: 0 0 10px 0;">
                    ${resultData.isCorrect ? '✅ CORRETO!' : '❌ ERRADO!'}
                </h3>
                <p style="margin: 5px 0;">
                    <strong>${resultData.playerName}</strong> da equipe <strong>${resultData.teamName}</strong>
                    ${resultData.isCorrect ? 'acertou' : 'errou'}!
                </p>
                <p style="margin: 5px 0;">Pontos: ${resultData.points > 0 ? '+' : ''}${resultData.points}</p>
                <p style="margin: 5px 0; font-weight: bold;">
                    Resposta correta: ${resultData.correctAnswer || 'Não informada'}
                </p>
            </div>
        `;
        
        // Adicionar resultado acima da pergunta
        questionText.innerHTML = resultHtml + (questionText.innerHTML || '');
    }
    
    advanceToNextQuestion() {
        window.currentQuestionIndex++;
        
        // Transmitir nova pergunta
        this.broadcastQuestionChange();
        
        // Rotacionar equipe se necessário
        if (!this.currentTurn?.isCorrect) {
            setTimeout(() => {
                this.rotateTeam();
            }, 1000);
        }
    }
    
    broadcastQuestionChange() {
        if (!this.roomSystem.isMaster) return;
        
        const questionData = {
            index: window.currentQuestionIndex,
            total: window.questions.length,
            timestamp: Date.now()
        };
        
        firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentQuestion')
            .set(questionData);
        
        console.log('📤 Nova pergunta transmitida:', window.currentQuestionIndex + 1);
    }
    
    handleQuestionChange(questionData) {
        console.log('📥 Nova pergunta recebida:', questionData.index + 1);
        
        window.currentQuestionIndex = questionData.index;
        this.updateTurnUI();
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
}

// Inicializar quando disponível
setTimeout(() => {
    if (window.roomSystem) {
        window.turnSystem = new TurnSystem(window.roomSystem);
        console.log('✅ Sistema de turnos global criado');
    }
}, 2000);

console.log('✅ turn-system.js carregado');