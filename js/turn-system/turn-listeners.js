// js/turn-system/turn-listeners.js - CONFIGURAÇÃO DE LISTENERS
console.log('🔄 turn-system/turn-listeners.js carregando...');

TurnSystem.prototype.setupTurnListeners = function() {
    if (!this.roomSystem.currentRoom) return;
    
    console.log('👂 Configurando listeners de turno...');
    
    const turnRef = firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentTurn');
    turnRef.on('value', (snapshot) => {
        const turnData = snapshot.val();
        if (turnData) this.handleTurnChange(turnData);
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
        if (questionData) this.handleQuestionChange(questionData);
    });
    
    console.log('👂 Listeners de turno configurados');
};

console.log('✅ turn-system/turn-listeners.js carregado');