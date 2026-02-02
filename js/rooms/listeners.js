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
        
        // Listener para ações
        const actionsRef = firebase.database().ref('rooms/' + this.currentRoom + '/actions');
        const actionListener = actionsRef.on('child_added', (snapshot) => {
            const action = snapshot.val();
            this.handlePlayerAction(action);
        });
        this.actionListeners.push({ ref: actionsRef, listener: actionListener });
        
        console.log('✅ Listeners configurados para sala:', this.currentRoom);
        
    } catch (error) {
        console.error('❌ Erro ao configurar listeners:', error);
    }
};

RoomSystem.prototype.handleRoomUpdate = function(roomData) {
    console.log('🔄 Processando atualização da sala:', roomData.status);
    
    // Se o mestre iniciou o jogo
    if (roomData.status === 'playing') {
        console.log('🎮 O mestre iniciou o jogo! Status: playing');
        
        // Se for jogador (não mestre), ir para tela do jogo
        if (!this.isMaster) {
            console.log('🚀 Jogador detectou início do jogo, indo para tela do jogo...');
            
            // Aguardar 1 segundo para garantir que tudo está carregado
            setTimeout(() => {
                if (window.authSystem && document.getElementById('lobby-screen')?.classList.contains('active')) {
                    console.log('✅ Redirecionando jogador para tela do jogo...');
                    window.authSystem.showGameScreen();
                    
                    // Mostrar alerta informativo
                    setTimeout(() => {
                        alert('🎮 O mestre iniciou o jogo!\n\nBoa sorte!');
                    }, 500);
                }
            }, 1000);
        }
    }
    
    // Atualizar lista de jogadores
    if (roomData.players) {
        this.players = roomData.players;
        this.updatePlayersList();
    }
    
    // Atualizar status da sala na UI
    if (roomData.status) {
        this.updateRoomStatus(roomData.status);
    }
};

RoomSystem.prototype.handlePlayerAction = function(action) {
    // Não processar própria ação
    if (action.playerId === this.playerId) return;
    
    console.log('📥 Ação recebida:', action.type, 'de', action.playerName);
    
    // Mostrar notificação da ação
    this.showActionNotification(action);
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
            // Chat é mostrado separadamente
            return;
    }
    
    if (message) {
        this.showNotification(message);
    }
};

RoomSystem.prototype.showNotification = function(message, type = 'info') {
    // Criar notificação temporária
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = 'room-notification';
    
    const colors = {
        info: { bg: '#003366', border: '#FFCC00', color: '#FFCC00' },
        success: { bg: '#28a745', border: '#1e7e34', color: '#fff' },
        warning: { bg: '#ffc107', border: '#e0a800', color: '#003366' },
        error: { bg: '#dc3545', border: '#bd2130', color: '#fff' }
    };
    
    const color = colors[type] || colors.info;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color.bg};
        color: ${color.color};
        padding: 12px 20px;
        border-radius: 8px;
        border: 2px solid ${color.border};
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-weight: 600;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

RoomSystem.prototype.updatePlayersList = function() {
    const playersList = document.getElementById('players-list');
    if (!playersList) return;
    
    let html = '<h4>👥 Jogadores Conectados:</h4>';
    let playerCount = 0;
    
    // Ordenar: mestre primeiro, depois por nome
    const sortedPlayers = Object.values(this.players).sort((a, b) => {
        if (a.isMaster && !b.isMaster) return -1;
        if (!a.isMaster && b.isMaster) return 1;
        return a.name.localeCompare(b.name);
    });
    
    sortedPlayers.forEach(player => {
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
    
    // Atualizar contador
    const playerCountElement = document.getElementById('player-count');
    if (playerCountElement) {
        playerCountElement.textContent = `(${playerCount} jogadores)`;
    }
};

RoomSystem.prototype.updateRoomStatus = function(status) {
    const statusElement = document.getElementById('game-status');
    if (!statusElement) return;
    
    const statusMap = {
        'lobby': { text: '🔵 Lobby', color: '#007bff', icon: '👥' },
        'config': { text: '⚙️ Configurando', color: '#ffc107', icon: '⚙️' },
        'playing': { text: '🎮 Em Andamento', color: '#28a745', icon: '🎮' },
        'finished': { text: '🏁 Finalizado', color: '#6c757d', icon: '🏁' }
    };
    
    const statusInfo = statusMap[status] || { text: '❓ Desconhecido', color: '#dc3545', icon: '❓' };
    statusElement.textContent = `${statusInfo.icon} ${statusInfo.text}`;
    statusElement.style.color = statusInfo.color;
};

console.log('✅ rooms/listeners.js carregado com sucesso!');