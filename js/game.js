// PATROL - Sistema de Jogo
console.log('🎮 Game carregando...');

const GameSystem = {
    currentQuestionIndex: 0,
    consecutiveCorrect: 0,
    winnerTeam: null,
    nextTeamRotation: false,
    
    init() {
        console.log('✅ GameSystem inicializado');
    },
    
    start() {
        console.log('🚀 Iniciando jogo...');
        
        this.currentQuestionIndex = 0;
        this.consecutiveCorrect = 0;
        this.winnerTeam = null;
        this.nextTeamRotation = false;
        
        window.TeamSystem.currentTeamIndex = 0;
        
        this.showQuestion();
        window.TeamSystem.updateDisplay();
    },
    
    showQuestion() {
        if (this.winnerTeam) {
            this.showPodium();
            return;
        }
        
        const questions = window.QuestionSystem.questions;
        
        if (!questions || questions.length === 0) {
            console.log('⏳ Aguardando perguntas...');
            return;
        }
        
        if (this.currentQuestionIndex >= questions.length) {
            this.endGame();
            return;
        }
        
        const question = questions[this.currentQuestionIndex];
        const questionText = document.getElementById('question-text');
        const questionNumber = document.getElementById('question-number');
        const totalQuestions = document.getElementById('total-questions');
        
        if (questionText) {
            let html = '';
            
            if (question.assuntoInfo || question.assunto) {
                html = `<div class="assunto-container">
                    <span class="assunto-icon">📚</span>
                    <span class="assunto-text">${question.assuntoInfo || question.assunto}</span>
                </div>`;
            }
            
            html += `<div class="pergunta-texto">${question.enunciado || 'Pergunta sem enunciado'}</div>`;
            questionText.innerHTML = html;
        }
        
        if (questionNumber) questionNumber.textContent = this.currentQuestionIndex + 1;
        if (totalQuestions) totalQuestions.textContent = questions.length;
        
        const answerResult = document.getElementById('answer-result');
        const commentary = document.getElementById('commentary');
        if (answerResult) answerResult.innerHTML = '';
        if (commentary) {
            commentary.innerHTML = '';
            commentary.classList.remove('active');
        }
        
        this.enableAnswerButtons();
        window.TeamSystem.updateDisplay();
        
        console.log(`📚 Pergunta ${this.currentQuestionIndex + 1}/${questions.length}`);
    },
    
    enableAnswerButtons() {
        // MESTRE: sempre pode responder
        if (window.roomSystem && window.roomSystem.isMaster) {
            ['certo-btn', 'errado-btn'].forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }
            });
        } 
        // JOGADOR: pode responder se estiver na equipe de plantão
        else if (window.roomSystem && !window.roomSystem.isMaster) {
            const currentTeam = window.TeamSystem.teams[window.TeamSystem.currentTeamIndex];
            const playerTeamId = window.roomSystem.playerTeamId;
            
            if (currentTeam && playerTeamId === currentTeam.id) {
                console.log(`✅ Jogador pode responder - equipe de plantão: ${currentTeam.name}`);
                ['certo-btn', 'errado-btn'].forEach(id => {
                    const btn = document.getElementById(id);
                    if (btn) {
                        btn.disabled = false;
                        btn.style.opacity = '1';
                    }
                });
            } else {
                console.log(`🚫 Jogador não pode responder - aguardando equipe ${currentTeam?.name}`);
                ['certo-btn', 'errado-btn'].forEach(id => {
                    const btn = document.getElementById(id);
                    if (btn) {
                        btn.disabled = true;
                        btn.style.opacity = '0.5';
                    }
                });
            }
        }
        // OFFLINE: sempre pode responder
        else {
            ['certo-btn', 'errado-btn'].forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }
            });
        }
        
        const nextBtn = document.getElementById('next-btn');
        const podiumBtn = document.getElementById('podium-btn');
        
        if (nextBtn) nextBtn.style.display = 'none';
        if (podiumBtn) podiumBtn.style.display = 'none';
    },
    
    disableAnswerButtons() {
        ['certo-btn', 'errado-btn', 'skip-btn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            }
        });
    },
    
    checkAnswer(answer) {
        if (window.roomSystem && !window.roomSystem.isMaster) {
            const currentTeam = window.TeamSystem.teams[window.TeamSystem.currentTeamIndex];
            const playerTeamId = window.roomSystem.playerTeamId;
            
            if (!currentTeam || playerTeamId !== currentTeam.id) {
                Utils.notify('Aguarde sua equipe ser chamada', 'warning');
                return;
            }
        }
        
        console.log('🎯 Verificando resposta:', answer);
        
        this.disableAnswerButtons();
        
        const question = window.QuestionSystem.questions[this.currentQuestionIndex];
        if (!question) return;
        
        const normalizedAnswer = Utils.normalizeAnswer(answer);
        const normalizedGabarito = Utils.normalizeAnswer(question.gabarito);
        
        const isCorrect = normalizedAnswer === normalizedGabarito;
        
        console.log(`Resposta: ${normalizedAnswer}, Gabarito: ${normalizedGabarito}, Correto: ${isCorrect}`);
        
        const teamIndex = window.TeamSystem.currentTeamIndex;
        const points = isCorrect ? 1 : 0;
        
        const result = window.TeamSystem.updateScore(teamIndex, points);
        
        this.showResult(isCorrect, question);
        
        if (result.winner) {
            this.winnerTeam = result.winner;
            this.showWinnerMessage();
            if (window.roomSystem && window.roomSystem.isMaster) {
                window.roomSystem.broadcastGameState();
            }
            return;
        }
        
        if (isCorrect) {
            this.consecutiveCorrect++;
            console.log(`✅ Acertos consecutivos: ${this.consecutiveCorrect}`);
            
            if (this.consecutiveCorrect >= CONFIG.game.consecutiveForRotation) {
                console.log('🏆 5 acertos consecutivos - rodando equipe');
                this.nextTeamRotation = true;
                this.consecutiveCorrect = 0;
            }
        } else {
            console.log('❌ Erro - rodando equipe');
            this.consecutiveCorrect = 0;
            this.nextTeamRotation = true;
        }
        
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.style.display = 'inline-block';
            nextBtn.textContent = '⏭️ Próxima';
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
        }
        
        // APENAS mestre transmite após responder
        if (window.roomSystem && window.roomSystem.isMaster) {
            window.roomSystem.broadcastGameState();
        }
    },
    
    showResult(isCorrect, question) {
        const answerResult = document.getElementById('answer-result');
        if (answerResult) {
            answerResult.innerHTML = `
                <div id="correct-answer" class="${isCorrect ? 'correct-answer' : 'wrong-answer'}">
                    ${isCorrect ? '✅ ACERTOU' : '❌ ERROU'} - GABARITO: ${question.gabarito}
                </div>
            `;
        }
        
        const commentary = document.getElementById('commentary');
        if (commentary) {
            let comments = '';
            if (question.comentario) comments += question.comentario;
            if (question.comentario2) comments += (comments ? '<br><br>' : '') + question.comentario2;
            if (question.comentario3) comments += (comments ? '<br><br>' : '') + question.comentario3;
            
            if (comments) {
                commentary.innerHTML = comments;
                commentary.classList.add('active');
            }
        }
    },
    
    nextQuestion() {
        console.log('⏭️ Avançando para próxima pergunta...');
        
        if (this.nextTeamRotation) {
            window.TeamSystem.rotateTeam();
            this.nextTeamRotation = false;
        }
        
        this.currentQuestionIndex++;
        
        // APENAS mestre transmite
        if (window.roomSystem && window.roomSystem.isMaster) {
            window.roomSystem.broadcastGameState();
        }
        
        this.showQuestion();
    },
    
    skipQuestion() {
        if (!confirm('⚠️ Pular esta questão?\n\nNão contará para pontuação.')) {
            return;
        }
        
        console.log('⏭️ Pulando pergunta...');
        
        this.disableAnswerButtons();
        
        const question = window.QuestionSystem.questions[this.currentQuestionIndex];
        
        const answerResult = document.getElementById('answer-result');
        if (answerResult) {
            answerResult.innerHTML = `
                <div class="correct-answer">⏭️ Questão pulada</div>
            `;
        }
        
        const commentary = document.getElementById('commentary');
        if (commentary && question) {
            let comments = '';
            if (question.comentario) comments += question.comentario;
            if (question.comentario2) comments += (comments ? '<br><br>' : '') + question.comentario2;
            if (question.comentario3) comments += (comments ? '<br><br>' : '') + question.comentario3;
            
            if (comments) {
                commentary.innerHTML = comments;
                commentary.classList.add('active');
            }
        }
        
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.style.display = 'inline-block';
            nextBtn.textContent = '⏭️ Continuar';
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
        }
        
        // APENAS mestre transmite
        if (window.roomSystem && window.roomSystem.isMaster) {
            window.roomSystem.broadcastGameState();
        }
    },
    
    endGame() {
        console.log('🏁 Fim do jogo!');
        
        const questionText = document.getElementById('question-text');
        if (questionText) {
            questionText.textContent = '🏆 Fim do jogo!';
        }
        
        this.disableAnswerButtons();
        
        const podiumBtn = document.getElementById('podium-btn');
        if (podiumBtn) {
            podiumBtn.style.display = 'inline-block';
            podiumBtn.textContent = '🏆 Ver Pódio';
        }
        
        window.TeamSystem.updateDisplay();
    },
    
    showWinnerMessage() {
        console.log('🏆 Temos um vencedor:', this.winnerTeam.name);
        
        const questionText = document.getElementById('question-text');
        if (questionText) {
            questionText.textContent = `🎉 PARABÉNS! ${this.winnerTeam.name} venceu!`;
        }
        
        const teamTurn = document.getElementById('team-turn');
        if (teamTurn) {
            teamTurn.textContent = '🏆 TEMOS UM VENCEDOR!';
            teamTurn.className = `team-turn ${this.winnerTeam.turnColorClass}`;
        }
        
        this.disableAnswerButtons();
        
        const podiumBtn = document.getElementById('podium-btn');
        if (podiumBtn) {
            podiumBtn.style.display = 'inline-block';
            podiumBtn.textContent = '🏆 Ver Pódio';
        }
        
        Utils.notify(`🏆 ${this.winnerTeam.name} venceu!`, 'success');
    },
    
    showPodium() {
        const teams = [...window.TeamSystem.teams].sort((a, b) => b.score - a.score);
        const top3 = teams.slice(0, 3);
        
        const container = document.getElementById('podium-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        top3.forEach((team, index) => {
            const place = document.createElement('div');
            place.className = `podium-place podium-${['1st', '2nd', '3rd'][index]}`;
            
            place.innerHTML = `
                <div class="podium-badge">${['🥇', '🥈', '🥉'][index]}</div>
                <div class="podium-name">${team.name}</div>
                <div class="podium-score">Pontuação: ${team.score}</div>
            `;
            
            container.appendChild(place);
        });
        
        Utils.showScreen('podium-screen');
    }
};

window.GameSystem = GameSystem;

console.log('✅ Game carregado');
