[file name]: rooms/ui.js
[file content begin]
// js/rooms/ui.js - Atualização de interface
console.log('🏠 rooms/ui.js carregando...');

RoomSystem.prototype.updateRoomUI = function(roomData) {
    // Atualizar lista de jogadores
    this.updatePlayersList(roomData.players || {});
    
    // Atualizar status da sala
    this.updateRoomStatus(roomData.status);
    
    // Atualizar informações do mestre
    if (roomData.master) {
        this.updateMasterInfo(roomData.master);
    }
    
    // Atualizar código da sala
    this.updateRoomCode();
    
    // Mostrar/ocultar controles baseado no papel do usuário
    this.updateControlsVisibility();
};

RoomSystem.prototype.updatePlayersList = function(players) {
    this.players = players;
    
    const playersList = document.getElementById('players-list');
    if (!playersList) return;
    
    let html = '<h4>👥 Jogadores Conectados:</h4>';
    let playerCount = 0;
    
    // Ordenar: mestre primeiro, depois por nome
    const sortedPlayers = Object.values(players).sort((a, b) => {
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

RoomSystem.prototype.updateMasterInfo = function(master) {
    const masterNameElement = document.getElementById('master-name');
    if (masterNameElement) {
        masterNameElement.textContent = master.name;
    }
    
    // Mostrar nome do mestre no cabeçalho
    const masterBadge = document.getElementById('master-badge');
    if (masterBadge) {
        masterBadge.textContent = `👑 Mestre: ${master.name}`;
        masterBadge.style.display = 'inline-block';
    }
};

RoomSystem.prototype.updateRoomCode = function() {
    const codeElement = document.getElementById('current-room-code');
    if (codeElement) {
        codeElement.textContent = this.currentRoom;
    }
    
    // Atualizar também no cabeçalho da tela do jogo
    const gameRoomCode = document.getElementById('game-room-code');
    if (gameRoomCode) {
        gameRoomCode.textContent = this.currentRoom;
    }
};

RoomSystem.prototype.updateControlsVisibility = function() {
    // Botão iniciar jogo (apenas para mestre)
    const startBtn = document.getElementById('start-game-btn-lobby');
    if (startBtn) {
        startBtn.style.display = this.isMaster ? 'block' : 'none';
    }
    
    // Controles do mestre na tela do jogo
    const masterControls = document.getElementById('master-controls');
    if (masterControls) {
        masterControls.style.display = this.isMaster ? 'block' : 'none';
    }
    
    // Mostrar badge "Você é o mestre"
    const youAreMasterBadge = document.getElementById('you-are-master');
    if (youAreMasterBadge) {
        youAreMasterBadge.style.display = this.isMaster ? 'block' : 'none';
    }
};

RoomSystem.prototype.showRoomInfo = function(roomCode) {
    const roomInfo = document.getElementById('room-info');
    if (roomInfo) {
        roomInfo.style.display = 'block';
        roomInfo.style.animation = 'slideIn 0.5s ease';
    }
    
    // Adicionar botão para copiar código
    this.addCopyCodeButton(roomCode);
};

RoomSystem.prototype.addCopyCodeButton = function(roomCode) {
    const codeContainer = document.getElementById('current-room-code');
    if (!codeContainer || codeContainer.parentNode.querySelector('.copy-code-btn')) return;
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-code-btn';
    copyBtn.innerHTML = '📋 Copiar';
    copyBtn.style.cssText = `
        background: #003366;
        color: #FFCC00;
        border: 2px solid #FFCC00;
        padding: 5px 15px;
        border-radius: 5px;
        cursor: pointer;
        margin-left: 10px;
        font-size: 12px;
        font-weight: bold;
        transition: all 0.3s;
    `;
    
    copyBtn.onmouseenter = () => {
        copyBtn.style.background = '#002244';
        copyBtn.style.transform = 'translateY(-2px)';
    };
    
    copyBtn.onmouseleave = () => {
        copyBtn.style.background = '#003366';
        copyBtn.style.transform = 'translateY(0)';
    };
    
    copyBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        navigator.clipboard.writeText(roomCode)
            .then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '✅ Copiado!';
                copyBtn.disabled = true;
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.disabled = false;
                }, 2000);
            })
            .catch(err => {
                console.error('Erro ao copiar:', err);
                copyBtn.innerHTML = '❌ Erro';
            });
    };
    
    codeContainer.parentNode.appendChild(copyBtn);
};

RoomSystem.prototype.addChatMessage = function(sender, message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    messageDiv.innerHTML = `
        <strong>${sender}:</strong> 
        <span>${this.sanitizeMessage(message)}</span>
        <small class="chat-time">${this.formatTime()}</small>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

RoomSystem.prototype.sanitizeMessage = function(message) {
    // Prevenir XSS básico
    const div = document.createElement('div');
    div.textContent = message;
    return div.innerHTML;
};

RoomSystem.prototype.formatTime = function() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

RoomSystem.prototype.checkAllPlayersReady = function() {
    if (!this.isMaster || !this.players) return;
    
    const players = Object.values(this.players);
    if (players.length < 2) return; // Pelo menos 2 jogadores para começar
    
    const allReady = players.every(player => player.isReady);
    const readyCount = players.filter(p => p.isReady).length;
    const totalCount = players.length;
    
    if (allReady && readyCount > 0) {
        this.showNotification(`✅ Todos os jogadores estão prontos! (${readyCount}/${totalCount})`);
        
        // Mostrar botão para iniciar
        const autoStartBtn = document.getElementById('auto-start-btn');
        if (autoStartBtn) {
            autoStartBtn.style.display = 'block';
        }
    }
};

console.log('✅ rooms/ui.js carregado com sucesso!');
[file content end]