// js/rooms/sync-game.js - Sincronização automática de tela
console.log('🔄 rooms/sync-game.js carregando...');

RoomSystem.prototype.setupGameSync = function() {
    console.log('🔄 Configurando sincronização do jogo...');
    
    if (!this.currentRoom) return;
    
    // 1. SINCRONIZAR ESTADO DA PERGUNTA
    const questionRef = firebase.database().ref('rooms/' + this.currentRoom + '/gameSync/currentQuestion');
    questionRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            this.syncQuestionDisplay(data);
        }
    });
    
    // 2. SINCRONIZAR RESPOSTAS E COMENTÁRIOS
    const answerRef = firebase.database().ref('rooms/' + this.currentRoom + '/answerResult');
    answerRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            this.syncAnswerDisplay(data);
        }
    });
    
    // 3. SINCRONIZAR BOTÕES
    const buttonsRef = firebase.database().ref('rooms/' + this.currentRoom + '/gameSync/buttonsState');
    buttonsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            this.syncButtonsState(data);
        }
    });
    
    console.log('✅ Sincronização configurada');
};

RoomSystem.prototype.syncQuestionDisplay = function(data) {
    console.log('📚 Sincronizando pergunta:', data.index + 1);
    
    window.currentQuestionIndex = data.index || 0;
    
    const questionText = document.getElementById('question-text');
    if (questionText && data.questionHTML) {
        questionText.innerHTML = data.questionHTML;
    } else if (questionText && data.enunciado) {
        questionText.textContent = data.enunciado;
    }
    
    const questionNumber = document.getElementById('question-number');
    const totalQuestions = document.getElementById('total-questions');
    if (questionNumber) questionNumber.textContent = (data.index + 1) || 1;
    if (totalQuestions) totalQuestions.textContent = data.total || window.questions?.length || 0;
    
    if (data.teamName) {
        const teamTurn = document.getElementById('team-turn');
        if (teamTurn) {
            teamTurn.textContent = `🎯 ${data.teamName} - DE PLANTÃO`;
            
            if (window.teams && data.teamIndex !== undefined && window.teams[data.teamIndex]) {
                const team = window.teams[data.teamIndex];
                teamTurn.className = 'team-turn ' + (team.turnColorClass || 'team-color-1');
            }
        }
    }
    
    const commentary = document.getElementById('commentary');
    if (commentary) {
        commentary.innerHTML = '';
        commentary.classList.remove('active');
    }
    
    const correctAnswer = document.getElementById('correct-answer');
    if (correctAnswer) {
        correctAnswer.textContent = '';
        correctAnswer.className = 'correct-answer';
    }
    
    this.syncButtonsState({
        certo: true,
        errado: true,
        skip: this.isMaster,
        next: false,
        podium: false
    });
};

RoomSystem.prototype.syncAnswerDisplay = function(data) {
    console.log('✅ Sincronizando resposta:', data.isCorrect ? 'CORRETA' : 'ERRADA');
    
    const correctAnswer = document.getElementById('correct-answer');
    if (correctAnswer) {
        correctAnswer.textContent = data.isCorrect ? '✅ ACERTOU' : '❌ ERROU';
        correctAnswer.className = data.isCorrect ? 'correct-answer' : 'wrong-answer';
    }
    
    const commentary = document.getElementById('commentary');
    if (commentary && data.comments) {
        commentary.innerHTML = data.comments;
        commentary.classList.add('active');
    }
    
    if (data.correctAnswer && correctAnswer) {
        correctAnswer.textContent += ' - GABARITO: ' + data.correctAnswer;
    }
    
    this.syncButtonsState({
        certo: false,
        errado: false,
        skip: false,
        next: true,
        podium: false
    });
};

RoomSystem.prototype.syncButtonsState = function(state) {
    const certoBtn = document.getElementById('certo-btn');
    const erradoBtn = document.getElementById('errado-btn');
    const skipBtn = document.getElementById('skip-btn');
    const nextBtn = document.getElementById('next-question-btn');
    const podiumBtn = document.getElementById('podium-btn');
    
    if (certoBtn) {
        certoBtn.disabled = !state.certo;
        certoBtn.style.opacity = state.certo ? '1' : '0.5';
        certoBtn.style.cursor = state.certo ? 'pointer' : 'not-allowed';
    }
    
    if (erradoBtn) {
        erradoBtn.disabled = !state.errado;
        erradoBtn.style.opacity = state.errado ? '1' : '0.5';
        erradoBtn.style.cursor = state.errado ? 'pointer' : 'not-allowed';
    }
    
    if (skipBtn) {
        skipBtn.disabled = !state.skip;
        skipBtn.style.opacity = state.skip ? '1' : '0.5';
        skipBtn.style.cursor = state.skip ? 'pointer' : 'not-allowed';
    }
    
    if (nextBtn) {
        nextBtn.style.display = state.next ? 'inline-block' : 'none';
        if (state.next) {
            nextBtn.disabled = false;
            nextBtn.textContent = '⏭️ Continuar';
        }
    }
    
    if (podiumBtn) {
        podiumBtn.style.display = state.podium ? 'inline-block' : 'none';
    }
};

RoomSystem.prototype.broadcastQuestionToAll = function() {
    if (!this.isMaster || !this.currentRoom) return;
    
    const question = window.questions?.[window.currentQuestionIndex];
    if (!question) return;
    
    let questionHTML = '';
    if (question.assuntoInfo) {
        questionHTML = '<div class="assunto-container">' +
            '<div class="assunto-icon">📚</div>' +
            '<div class="assunto-text">' + question.assuntoInfo + '</div>' +
        '</div>' +
        '<div class="pergunta-texto">' +
            (question.enunciado || 'Pergunta sem enunciado') +
        '</div>';
    } else {
        questionHTML = '<div class="pergunta-texto">' + (question.enunciado || 'Pergunta sem enunciado') + '</div>';
    }
    
    const syncData = {
        index: window.currentQuestionIndex,
        total: window.questions.length,
        teamIndex: window.currentTeamIndex,
        teamName: window.teams?.[window.currentTeamIndex]?.name || 'Equipe',
        questionHTML: questionHTML,
        enunciado: question.enunciado,
        timestamp: Date.now()
    };
    
    firebase.database().ref('rooms/' + this.currentRoom + '/gameSync/currentQuestion')
        .set(syncData);
    
    this.broadcastButtonsState({
        certo: true,
        errado: true,
        skip: this.isMaster,
        next: false,
        podium: false
    });
    
    console.log('📤 Pergunta transmitida para todos');
};

RoomSystem.prototype.broadcastAnswerToAll = function(isCorrect, question) {
    if (!this.isMaster || !this.currentRoom) return;
    
    let allComments = '';
    if (question.comentario) allComments += question.comentario;
    if (question.comentario2) allComments += (allComments ? '<br><br>' : '') + question.comentario2;
    if (question.comentario3) allComments += (allComments ? '<br><br>' : '') + question.comentario3;
    
    const syncData = {
        isCorrect: isCorrect,
        correctAnswer: question.gabarito || 'Não informado',
        comments: allComments,
        timestamp: Date.now()
    };
    
    firebase.database().ref('rooms/' + this.currentRoom + '/answerResult')
        .set(syncData);
    
    console.log('📤 Resposta e comentários transmitidos');
};

RoomSystem.prototype.broadcastButtonsState = function(state) {
    if (!this.isMaster || !this.currentRoom) return;
    
    firebase.database().ref('rooms/' + this.currentRoom + '/gameSync/buttonsState')
        .set(state);
};

RoomSystem.prototype.startGameForAllPlayers = async function() {
    if (!this.isMaster || !this.currentRoom) {
        alert('Apenas o mestre pode iniciar o jogo');
        return false;
    }
    
    console.log('🚀 Mestre iniciando jogo para TODOS...');
    
    try {
        await firebase.database().ref('rooms/' + this.currentRoom).update({
            status: 'playing',
            gameStartedAt: Date.now(),
            masterStarted: true
        });
        
        if (window.questions && window.teams) {
            const gameData = {
                questions: window.questions,
                teams: window.teams,
                totalQuestions: window.questions.length,
                totalTeams: window.teams.length
            };
            
            await firebase.database().ref('rooms/' + this.currentRoom + '/gameData').set(gameData);
        }
        
        this.sendAction('game_started', {
            message: '🎮 O MESTRE INICIOU O JOGO!',
            masterName: this.playerName,
            timestamp: Date.now()
        });
        
        this.showNotification('✅ Jogo iniciado!', 'success');
        
        this.setupGameSync();
        
        setTimeout(() => {
            this.broadcastQuestionToAll();
        }, 1000);
        
        setTimeout(() => {
            if (window.authSystem && window.authSystem.showGameScreen) {
                window.authSystem.showGameScreen();
            }
        }, 500);
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao iniciar jogo:', error);
        alert('Erro: ' + error.message);
        return false;
    }
};

console.log('✅ rooms/sync-game.js carregado!');
