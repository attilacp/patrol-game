// js/rooms/room-listeners.js - CONFIGURAÇÃO BÁSICA DE LISTENERS
console.log('🏠 rooms/room-listeners.js carregando...');

RoomSystem.prototype.setupRoomListeners = function() {
    if (!this.currentRoom) return;
    
    console.log('👂 Configurando listeners da sala:', this.currentRoom);
    
    this.cleanupAllListeners();
    
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        
        // Status da sala
        const statusListener = roomRef.child('status').on('value', (snapshot) => {
            const status = snapshot.val();
            if (status && status !== this.lastStatus) {
                console.log('🔄 Status mudou para:', status);
                this.lastStatus = status;
                this.handleStatusChange(status);
            }
        });
        this.roomListeners.push({ ref: roomRef.child('status'), listener: statusListener });
        
        // Dados do jogo
        const gameDataListener = roomRef.child('gameData').on('value', (snapshot) => {
            const gameData = snapshot.val();
            if (gameData) {
                console.log('📥 GameData recebido do Firebase');
                this.syncGameDataFromFirebase(gameData);
            }
        });
        this.roomListeners.push({ ref: roomRef.child('gameData'), listener: gameDataListener });
        
        // Turno atual
        const turnListener = roomRef.child('currentTurn').on('value', (snapshot) => {
            const turnData = snapshot.val();
            if (turnData) {
                console.log('🎯 Turno recebido:', turnData.teamName);
                this.handleTurnFromFirebase(turnData);
            }
        });
        this.roomListeners.push({ ref: roomRef.child('currentTurn'), listener: turnListener });
        
        // Pergunta atual
        const questionListener = roomRef.child('currentQuestion').on('value', (snapshot) => {
            const questionData = snapshot.val();
            if (questionData) {
                console.log('📚 Pergunta recebida:', questionData.index + 1);
                this.handleQuestionFromFirebase(questionData);
            }
        });
        this.roomListeners.push({ ref: roomRef.child('currentQuestion'), listener: questionListener });
        
        this.loadInitialRoomData();
        
        console.log('✅ Listeners configurados');
        
    } catch (error) {
        console.error('❌ Erro ao configurar listeners:', error);
    }
};

RoomSystem.prototype.cleanupAllListeners = function() {
    this.roomListeners.forEach(item => {
        if (item.ref && item.listener) {
            item.ref.off('value', item.listener);
        }
    });
    this.roomListeners = [];
    
    this.lastStatus = null;
    this.jogoIniciadoParaJogador = false;
    this.alertaMostrado = false;
};

console.log('✅ rooms/room-listeners.js carregado!');