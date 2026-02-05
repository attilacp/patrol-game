// js/rooms/actions.js - Sistema de ações multiplayer
console.log('🏠 rooms/actions.js carregando...');

RoomSystem.prototype.sendAction = function(actionType, data = {}) {
    if (!this.currentRoom) {
        console.log('❌ Nenhuma sala ativa para enviar ação');
        return null;
    }
    
    const user = firebase.auth().currentUser;
    const action = {
        type: actionType,
        playerId: this.playerId,
        playerName: this.playerName,
        data: data,
        timestamp: Date.now(),
        roomCode: this.currentRoom
    };
    
    try {
        const actionsRef = firebase.database().ref('rooms/' + this.currentRoom + '/actions');
        const newActionRef = actionsRef.push(action);
        
        console.log('📤 Ação enviada:', actionType, data);
        return newActionRef.key;
        
    } catch (error) {
        console.error('❌ Erro ao enviar ação:', error);
        return null;
    }
};

RoomSystem.prototype.handlePlayerAction = function(action) {
    if (action.playerId === this.playerId) return;
    
    console.log('📥 Ação recebida:', action.type, 'de', action.playerName);
    
    this.showActionNotification(action);
    
    switch (action.type) {
        case 'answer':
            this.handleAnswerAction(action);
            break;
        case 'skip':
            this.handleSkipAction(action);
            break;
        case 'chat':
            this.handleChatAction(action);
            break;
        case 'ready':
            this.handleReadyAction(action);
            break;
        case 'start_game':
            this.handleStartGameAction(action);
            break;
        case 'next_question':
            this.handleNextQuestionAction(action);
            break;
        case 'update_score':
            this.handleUpdateScoreAction(action);
            break;
    }
};

RoomSystem.prototype.handleAnswerAction = function(action) {
    const isCorrect = action.data.correct;
    const scoreChange = isCorrect ? 10 : -5;
    
    const playerRef = firebase.database().ref('rooms/' + this.currentRoom + '/players/' + action.playerId + '/score');
    playerRef.transaction((current) => {
        return (current || 0) + scoreChange;
    });
};

RoomSystem.prototype.handleSkipAction = function(action) {
    if (this.isMaster) {
        this.showNotification(`${action.playerName} pediu para pular a pergunta`);
    }
};

RoomSystem.prototype.handleChatAction = function(action) {
    this.addChatMessage(action.playerName, action.data.message);
};

RoomSystem.prototype.handleReadyAction = function(action) {
    const playerRef = firebase.database().ref('rooms/' + this.currentRoom + '/players/' + action.playerId + '/isReady');
    playerRef.set(action.data.ready);
};

RoomSystem.prototype.handleStartGameAction = function(action) {
    if (this.players[action.playerId]?.isMaster) {
        this.showNotification('🎮 O mestre iniciou o jogo!');
        
        setTimeout(() => {
            if (window.authSystem) {
                window.authSystem.showGameScreen();
            }
        }, 1000);
    }
};

RoomSystem.prototype.handleNextQuestionAction = function(action) {
    if (this.players[action.playerId]?.isMaster) {
        this.showNotification('⏭️ O mestre avançou para próxima pergunta');
        
        if (window.gameStarted) {
            window.nextQuestion?.();
        }
    }
};

RoomSystem.prototype.handleUpdateScoreAction = function(action) {
    if (this.isMaster) {
        const teamRef = firebase.database().ref('rooms/' + this.currentRoom + '/scores/' + action.data.teamId);
        teamRef.set(action.data.score);
    }
};

RoomSystem.prototype.showActionNotification = function(action) {
    let message = '';
    
    switch (action.type) {
        case 'answer':
            message = `${action.playerName} ${action.data.correct ? 'acertou' : 'errou'}!`;
            break;
        case 'ready':
            message = `${action.playerName} está ${action.data.ready ? 'pronto' : 'não pronto'}`;
            break;
        case 'chat':
            return;
    }
    
    if (message) {
        this.showNotification(message);
    }
};

console.log('✅ rooms/actions.js carregado com sucesso!');