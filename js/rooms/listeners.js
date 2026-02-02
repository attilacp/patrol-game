// js/rooms/listeners.js - Listeners do Firebase
console.log('🏠 rooms/listeners.js carregando...');

RoomSystem.prototype.setupRoomListeners = function() {
    if (!this.currentRoom) return;
    
    console.log('👂 Configurando listeners da sala:', this.currentRoom);
    
    try {
        // Listener para dados da sala
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        const roomListener = roomRef.on('value', (snapshot) => {
            const roomData = snapshot.val();
            if (roomData) {
                console.log('📡 Atualização da sala recebida:', roomData.status);
                this.handleRoomUpdate(roomData);
            }
        });
        this.roomListeners.push({ ref: roomRef, listener: roomListener });
        
        console.log('✅ Listeners configurados para sala:', this.currentRoom);
        
    } catch (error) {
        console.error('❌ Erro ao configurar listeners:', error);
    }
};

RoomSystem.prototype.handleRoomUpdate = function(roomData) {
    console.log('🔄 Processando atualização da sala:', roomData.status);
    
    // Se o mestre iniciou o jogo
    if (roomData.status === 'playing') {
        console.log('🎮 O mestre iniciou o jogo!');
        
        // Se for jogador (não mestre), ir para tela do jogo
        if (!this.isMaster) {
            console.log('🚀 Jogador indo para tela do jogo...');
            
            // Aguardar 1 segundo para garantir que tudo está carregado
            setTimeout(() => {
                if (window.authSystem) {
                    window.authSystem.showGameScreen();
                    alert('🎮 O mestre iniciou o jogo!');
                }
            }, 1000);
        }
    }
    
    // Atualizar lista de jogadores
    if (roomData.players) {
        this.players = roomData.players;
        this.updatePlayersList();
    }
};

RoomSystem.prototype.updatePlayersList = function() {
    const playersList = document.getElementById('players-list');
    if (!playersList) return;
    
    let html = '<h4>👥 Jogadores Conectados:</h4>';
    let playerCount = 0;
    
    Object.values(this.players).forEach(player => {
        if (player.connected) {
            playerCount++;
            html += `
                <div class="player-item ${player.isMaster ? 'master' : ''}">
                    <span class="player-icon">${player.avatar || '👤'}</span>
                    <span class="player-name">${player.name}</span>
                    <span class="player-status">${player.isReady ? '✅ Pronto' : '⏳ Aguardando'}</span>
                    <span class="player-score">${player.score} pts</span>
                </div>
            `;
        }
    });
    
    if (playerCount === 0) {
        html += '<div class="no-players">Nenhum jogador conectado</div>';
    }
    
    playersList.innerHTML = html;
};

console.log('✅ rooms/listeners.js carregado com sucesso!');