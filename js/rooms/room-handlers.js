// js/rooms/room-handlers.js - MANIPULAÇÃO DE EVENTOS
console.log('🏠 rooms/room-handlers.js carregando...');

RoomSystem.prototype.handleStatusChange = function(status) {
    console.log('📊 Status mudou:', status);
    
    if (status === 'playing' && !this.isMaster) {
        console.log('🎮 Jogo iniciado pelo mestre!');
        this.jogoIniciadoParaJogador = true;
        
        if (!this.alertaMostrado) {
            this.alertaMostrado = true;
            setTimeout(() => {
                alert('🎮 O mestre iniciou o jogo!\n\nSincronizando...');
            }, 500);
        }
        
        setTimeout(() => {
            if (window.authSystem) {
                console.log('✅ Indo para tela do jogo...');
                window.authSystem.showGameScreen();
                this.fetchGameDataFromFirebase();
            }
        }, 1000);
    }
};

RoomSystem.prototype.handleTurnFromFirebase = function(turnData) {
    console.log('🔄 Processando turno do Firebase:', turnData);
    
    window.currentTeamIndex = turnData.teamIndex || 0;
    window.currentQuestionIndex = turnData.questionIndex || 0;
    
    this.updateTurnUI(turnData);
    
    if (window.turnSystem) {
        window.turnSystem.updatePlayerControls();
    }
};

RoomSystem.prototype.handleQuestionFromFirebase = function(questionData) {
    console.log('📚 Processando pergunta do Firebase:', questionData);
    
    if (questionData.index !== undefined) {
        window.currentQuestionIndex = questionData.index;
    }
    
    setTimeout(() => {
        if (window.showQuestion) window.showQuestion();
        
        const questionNumber = document.getElementById('question-number');
        const totalQuestions = document.getElementById('total-questions');
        if (questionNumber) questionNumber.textContent = (window.currentQuestionIndex + 1) || 1;
        if (totalQuestions && window.questions) totalQuestions.textContent = window.questions.length;
    }, 300);
};

RoomSystem.prototype.fetchGameDataFromFirebase = async function() {
    console.log('📥 BUSCANDO DADOS...');
    
    if (!this.currentRoom) return;
    
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        
        const questionsSnap = await roomRef.child('gameData/questions').once('value');
        if (questionsSnap.exists()) {
            window.questions = questionsSnap.val();
            console.log('✅ Perguntas:', window.questions.length);
        }
        
        const teamsSnap = await roomRef.child('gameData/teams').once('value');
        if (teamsSnap.exists()) {
            window.teams = teamsSnap.val();
            console.log('✅ Equipes:', window.teams.length);
            
            window.teams = window.teams.map((team, index) => ({
                id: team.id || index + 1,
                name: team.name || `Equipe ${index + 1}`,
                players: team.players || [],
                score: team.score || 0,
                colorClass: team.colorClass || `team-bg-${(index % 10) + 1}`,
                turnColorClass: team.turnColorClass || `team-color-${(index % 10) + 1}`
            }));
        }
        
        await this.applyFirebaseOrder();
        this.startGameForPlayer();
        
    } catch (error) {
        console.error('❌ Erro:', error);
        this.showDataError();
    }
};

RoomSystem.prototype.startGameForPlayer = function() {
    console.log('🚀 Iniciando jogador...');
    
    window.currentQuestionIndex = 0;
    window.currentTeamIndex = 0;
    window.gameStarted = true;
    
    console.log('📊 Dados prontos:', {
        perguntas: window.questions?.length,
        equipes: window.teams?.length
    });
    
    if (window.turnSystem && window.teams && window.teams.length > 0) {
        setTimeout(() => {
            window.turnSystem.selectPlayerTeam(0);
        }, 1000);
    }
    
    console.log('✅ Jogador pronto (aguardando sincronização)');
};

RoomSystem.prototype.showDataError = function() {
    const questionText = document.getElementById('question-text');
    if (questionText) {
        questionText.textContent = '❌ Erro ao carregar. Recarregue.';
    }
};

console.log('✅ rooms/room-handlers.js carregado!');