// js/turn-system/turn-listeners.js - ATUALIZADO COM SINCRONIZAÇÃO
console.log('🔄 turn-system/turn-listeners.js carregando...');

TurnSystem.prototype.setupTurnListeners = function() {
    if (!this.roomSystem.currentRoom) return;
    
    console.log('👂 Configurando listeners de turno...');
    
    // ATRIBUIR MESTRE À EQUIPE IMEDIATAMENTE
    if (this.roomSystem.isMaster) {
        console.log('👑 Configurando sistema para mestre...');
        setTimeout(() => {
            this.assignMasterToTeam();
        }, 500);
    }
    
    const turnRef = firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentTurn');
    turnRef.on('value', (snapshot) => {
        const turnData = snapshot.val();
        if (turnData) {
            console.log('🎯 Turno recebido:', turnData.teamName, 'Pergunta:', turnData.questionIndex + 1);
            this.handleTurnChange(turnData);
        }
    });
    
    const playerRef = firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/players/' + this.roomSystem.playerId);
    playerRef.on('value', (snapshot) => {
        const playerData = snapshot.val();
        if (playerData && playerData.teamId) this.updatePlayerTeam(playerData.teamId);
    });
    
    const resultRef = firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/answerResult');
    resultRef.on('value', (snapshot) => {
        const resultData = snapshot.val();
        if (resultData) this.handleAnswerResult(resultData);
    });
    
    const questionRef = firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentQuestion');
    questionRef.on('value', (snapshot) => {
        const questionData = snapshot.val();
        if (questionData) {
            console.log('📚 Pergunta sincronizada:', questionData.index + 1, 'Equipe:', questionData.teamName);
            this.handleQuestionChange(questionData);
        }
    });
    
    // SINCRONIZAR ESTADO ATUAL NO INÍCIO
    setTimeout(() => {
        this.syncInitialState();
    }, 1000);
    
    console.log('👂 Listeners de turno configurados');
};

TurnSystem.prototype.syncInitialState = function() {
    if (!this.roomSystem.currentRoom) return;
    
    const questionRef = firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentQuestion');
    const turnRef = firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentTurn');
    
    questionRef.once('value').then(snapshot => {
        const questionData = snapshot.val();
        if (questionData) {
            window.currentQuestionIndex = questionData.index || 0;
            window.currentTeamIndex = questionData.teamIndex || 0;
            console.log('🔄 Estado inicial sincronizado: Pergunta', window.currentQuestionIndex + 1);
        }
    });
    
    turnRef.once('value').then(snapshot => {
        const turnData = snapshot.val();
        if (turnData) {
            this.currentTurn = turnData;
            console.log('🔄 Turno inicial sincronizado:', turnData.teamName);
        }
    });
};

TurnSystem.prototype.handleQuestionChange = function(questionData) {
    console.log('📚 Atualizando pergunta:', questionData.index + 1);
    
    // Atualizar índice local
    window.currentQuestionIndex = questionData.index || 0;
    window.currentTeamIndex = questionData.teamIndex || 0;
    
    // Sincronizar com sistema de turnos
    if (questionData.teamIndex !== undefined && window.teams && window.teams[questionData.teamIndex]) {
        const team = window.teams[questionData.teamIndex];
        this.setCurrentTurn(questionData.teamIndex, team.id, team.name);
    }
    
    // Mostrar pergunta
    setTimeout(() => {
        if (window.showQuestion) {
            window.showQuestion();
        }
    }, 300);
};

console.log('✅ turn-system/turn-listeners.js carregado');