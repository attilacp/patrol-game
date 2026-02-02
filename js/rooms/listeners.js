[file name]: rooms/listeners.js
[file content begin]
// js/rooms/listeners.js - Listeners do Firebase
console.log('🏠 rooms/listeners.js carregando...');

RoomSystem.prototype.setupRoomListeners = function() {
    if (!this.currentRoom) return;
    
    console.log('👂 Configurando listeners da sala:', this.currentRoom);
    
    // Listener para dados da sala
    const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
    const roomListener = roomRef.on('value', (snapshot) => {
        const roomData = snapshot.val();
        if (roomData) {
            this.players = roomData.players || {};
            this.updateRoomUI(roomData);
            this.handleRoomUpdate(roomData);
        }
    });
    this.roomListeners.push({ ref: roomRef, listener: roomListener });
    
    // Listener para ações dos jogadores
    const actionsRef = firebase.database().ref('rooms/' + this.currentRoom + '/actions');
    const actionListener = actionsRef.on('child_added', (snapshot) => {
        const action = snapshot.val();
        this.handlePlayerAction(action);
        
        // Remover ação antiga após 30 segundos
        setTimeout(() => {
            snapshot.ref.remove();
        }, 30000);
    });
    this.actionListeners.push({ ref: actionsRef, listener: actionListener });
    
    // Listener para remover jogadores desconectados
    const presenceRef = firebase.database().ref('rooms/' + this.currentRoom + '/players/' + this.playerId);
    presenceRef.onDisconnect().remove();
    
    console.log('✅ Listeners configurados para sala:', this.currentRoom);
};

RoomSystem.prototype.handleRoomUpdate = function(roomData) {
    // Atualizar status da sala
    this.updateRoomStatus(roomData.status);
    
    // Verificar se mestre mudou
    if (roomData.master && this.isMaster && roomData.master.uid !== this.playerId) {
        this.isMaster = false;
        this.showNotification('⚠️ O mestre original retornou. Você agora é um jogador.');
    }
    
    // Sincronizar estado do jogo se estiver em andamento
    if (roomData.status === 'playing' && roomData.gameState) {
        this.syncGameState(roomData.gameState);
    }
    
    // Verificar se todos estão prontos
    if (roomData.status === 'lobby' && this.isMaster) {
        this.checkAllPlayersReady();
    }
};

RoomSystem.prototype.syncGameState = function(gameState) {
    if (!gameState) return;
    
    console.log('🔄 Sincronizando estado do jogo:', gameState);
    
    // Sincronizar pergunta atual
    if (gameState.currentQuestionIndex !== undefined) {
        window.currentQuestionIndex = gameState.currentQuestionIndex;
    }
    
    // Sincronizar equipe atual
    if (gameState.currentTeamIndex !== undefined) {
        window.currentTeamIndex = gameState.currentTeamIndex;
    }
    
    // Sincronizar pontuações
    if (gameState.scores && window.teams) {
        window.teams.forEach((team, index) => {
            if (gameState.scores[team.id]) {
                team.score = gameState.scores[team.id];
            }
        });
    }
    
    // Atualizar display se estiver na tela do jogo
    if (document.getElementById('game-screen')?.classList.contains('active')) {
        window.updateTeamsDisplay?.();
        window.showQuestion?.();
    }
};

console.log('✅ rooms/listeners.js carregado com sucesso!');
[file content end]