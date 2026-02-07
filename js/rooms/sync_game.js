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
    
    // 2. SINCRONIZAR RESPOSTAS
    const answerRef = firebase.database().ref('rooms/' + this.currentRoom + '/gameSync/answerResult');
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
    
    // 4. SINCRONIZAR GABARITO
    const gabaritoRef = firebase.database().ref('rooms/' + this.currentRoom + '/gameSync/gabarito');
    gabaritoRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            this.syncGabaritoDisplay(data);
        }
    });
    
    console.log('✅ Sincronização configurada');
};

RoomSystem.prototype.syncQuestionDisplay = function(data) {
    console.log('📚 Sincronizando pergunta:', data.index + 1);
    
    // Atualizar índice global
    window.currentQuestionIndex = data.index || 0;
    
    // Atualizar display da pergunta
    const questionText = document.getElementById('question-text');
    if (questionText && data.questionHTML) {
        questionText.innerHTML = data.questionHTML;
    } else if (questionText && data.enunciado) {
        questionText.textContent = data.enunciado;
    }
    
    // Atualizar contador
    const questionNumber = document.getElementById('question-number');
    const totalQuestions = document.getElementById('total-questions');
    if (questionNumber) questionNumber.textContent = (data.index + 1) || 1;
    if (totalQuestions) totalQuestions.textContent = data.total || window.questions?.length || 0;
    
    // Atualizar equipe de plantão
    if (data.teamName) {
        const teamTurn = document.getElementById('team-turn');
        if (teamTurn) {
            teamTurn.textContent = `🎯 ${data.teamName} - DE PLANTÃO`;
            
            // Aplicar cor da equipe se disponível
            if (window.teams && data.teamIndex !== undefined && window.teams[data.teamIndex]) {
                const team = window.teams[data.teamIndex];
                teamTurn.className = 'team-turn ' + (team.turnColorClass || 'team-color-1');
            }
        }
    }
    
    // Habilitar botões de resposta (se for a vez da equipe)
    this.syncButtonsState({
        certo: true,
        errado: true,
        skip: this.isMaster, // Apenas mestre pode pular
        next: false,
        podium: false
    });
};

RoomSystem.prototype.syncAnswerDisplay = function(data) {
    console.log('✅ Sincronizando resposta:', data.isCorrect ? 'CORRETA' : 'ERRADA');
    
    // Mostrar se acertou ou errou
    const correctAnswer = document.getElementById('correct-answer');
    if (correctAnswer) {
        correctAnswer.textContent = data.isCorrect ? '✅ ACERTOU' : '❌ ERROU';
        correctAnswer.className = data.isCorrect ? 'correct-answer' : 'wrong-answer';
    }
    
    // Atualizar botões para mostrar "Continuar"
    this.syncButtonsState({
        certo: false,
        errado: false,
        skip: false,
        next: true,
        podium: false
    });
};

RoomSystem.prototype.syncGabaritoDisplay = function(data) {
    console.log('📋 Sincronizando gabarito e comentários');
    
    // Mostrar gabarito
    const correctAnswer = document.getElementById('correct-answer');
    if (correctAnswer && data.gabarito) {
        correctAnswer.textContent = 'GABARITO: ' + data.gabarito;
        correctAnswer.className = 'correct-answer';
    }
    
    // Mostrar comentários
    const commentary = document.getElementById('commentary');
    if (commentary && data.comments) {
        commentary.innerHTML = data.comments;
        commentary.classList.add('active');
    }
    
    // Desabilitar botões de resposta
    this.syncButtonsState({
        certo: false,
        errado: false,
        skip: false,
        next: true,
        podium: false
    });
};

RoomSystem.prototype.syncButtonsState = function(state) {
    console.log('🔘 Sincronizando botões:', state);
    
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
        if (state.next) nextBtn.disabled = false;
    }
    
    if (podiumBtn) {
        podiumBtn.style.display = state.podium ? 'inline-block' : 'none';
    }
};

RoomSystem.prototype.broadcastQuestionToAll = function() {
    if (!this.isMaster || !this.currentRoom) return;
    
    const question = window.questions?.[window.currentQuestionIndex];
    if (!question) return;
    
    // Criar HTML da pergunta com assunto
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
    
    // Resetar botões para todos
    this.broadcastButtonsState({
        certo: true,
        errado: true,
        skip: this.isMaster, // Apenas mestre pode pular
        next: false,
        podium: false
    });
    
    console.log('📤 Pergunta transmitida para todos');
};

RoomSystem.prototype.broadcastAnswerToAll = function(isCorrect) {
    if (!this.isMaster || !this.currentRoom) return;
    
    const syncData = {
        isCorrect: isCorrect,
        timestamp: Date.now()
    };
    
    firebase.database().ref('rooms/' + this.currentRoom + '/gameSync/answerResult')
        .set(syncData);
    
    console.log('📤 Resposta transmitida para todos');
};

RoomSystem.prototype.broadcastGabaritoToAll = function(question) {
    if (!this.isMaster || !this.currentRoom) return;
    
    // Coletar todos os comentários
    let allComments = '';
    if (question.comentario) allComments += question.comentario;
    if (question.comentario2) allComments += (allComments ? '<br><br>' : '') + question.comentario2;
    if (question.comentario3) allComments += (allComments ? '<br><br>' : '') + question.comentario3;
    
    const syncData = {
        gabarito: question.gabarito || 'Não informado',
        comments: allComments,
        timestamp: Date.now()
    };
    
    firebase.database().ref('rooms/' + this.currentRoom + '/gameSync/gabarito')
        .set(syncData);
    
    console.log('📤 Gabarito e comentários transmitidos para todos');
};

RoomSystem.prototype.broadcastButtonsState = function(state) {
    if (!this.isMaster || !this.currentRoom) return;
    
    firebase.database().ref('rooms/' + this.currentRoom + '/gameSync/buttonsState')
        .set(state);
};

// AUTO-INICIAR SINCRONIZAÇÃO QUANDO MESTRE COMEÇAR JOGO
RoomSystem.prototype.startGameForAllPlayers = async function() {
    if (!this.isMaster || !this.currentRoom) {
        alert('Apenas o mestre pode iniciar o jogo');
        return false;
    }
    
    console.log('🚀 Mestre iniciando jogo para TODOS os jogadores...');
    
    try {
        // 1. ATUALIZAR STATUS DA SALA
        await firebase.database().ref('rooms/' + this.currentRoom).update({
            status: 'playing',
            gameStartedAt: Date.now(),
            masterStarted: true
        });
        
        // 2. SINCRONIZAR DADOS DO JOGO
        if (window.questions && window.teams) {
            const gameData = {
                questions: window.questions,
                teams: window.teams,
                totalQuestions: window.questions.length,
                totalTeams: window.teams.length
            };
            
            await firebase.database().ref('rooms/' + this.currentRoom + '/gameData').set(gameData);
        }
        
        // 3. NOTIFICAR TODOS OS JOGADORES
        this.sendAction('game_started', {
            message: '🎮 O MESTRE INICIOU O JOGO!',
            masterName: this.playerName,
            timestamp: Date.now()
        });
        
        this.showNotification('✅ Jogo iniciado! Todos os jogadores foram notificados.', 'success');
        
        // 4. INICIAR SINCRONIZAÇÃO
        this.setupGameSync();
        
        // 5. TRANSMITIR PRIMEIRA PERGUNTA
        setTimeout(() => {
            this.broadcastQuestionToAll();
        }, 1000);
        
        // 6. IR PARA TELA DO JOGO
        setTimeout(() => {
            if (window.authSystem && window.authSystem.showGameScreen) {
                window.authSystem.showGameScreen();
            }
        }, 500);
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao iniciar jogo para todos:', error);
        alert('Erro: ' + error.message);
        return false;
    }
};

console.log('✅ rooms/sync-game.js carregado com sucesso!');