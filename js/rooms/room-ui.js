// js/rooms/room-ui.js - ATUALIZAÇÃO DE INTERFACE
console.log('🏠 rooms/room-ui.js carregando...');

RoomSystem.prototype.updateTurnUI = function(turnData) {
    const teamTurnElement = document.getElementById('team-turn');
    if (teamTurnElement && turnData.teamName) {
        teamTurnElement.textContent = `🎯 ${turnData.teamName} - DE PLANTÃO`;
        
        const currentTeam = window.teams?.[window.currentTeamIndex];
        if (currentTeam && currentTeam.turnColorClass) {
            teamTurnElement.className = 'team-turn ' + currentTeam.turnColorClass;
        }
    }
    
    if (window.updateTeamsDisplay) {
        window.updateTeamsDisplay();
    }
};

RoomSystem.prototype.updatePlayersList = function() {
    const playersList = document.getElementById('players-list');
    if (!playersList) return;
    
    const players = this.players || {};
    let html = '<h4>👥 Jogadores:</h4>';
    let count = 0;
    
    Object.values(players).forEach(player => {
        if (player.connected) {
            count++;
            html += `
                <div class="player-item ${player.isMaster ? 'master' : ''}">
                    <span class="player-icon">${player.avatar || '👤'}</span>
                    <span class="player-name">${player.name || 'Jogador'}</span>
                    <span class="player-score">${player.score || 0} pts</span>
                </div>
            `;
        }
    });
    
    if (count === 0) html += '<div class="no-players">Nenhum jogador</div>';
    playersList.innerHTML = html;
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
    
    const statusInfo = statusMap[status] || { text: '❓', color: '#dc3545', icon: '❓' };
    statusElement.textContent = `${statusInfo.icon} ${statusInfo.text}`;
    statusElement.style.color = statusInfo.color;
};

RoomSystem.prototype.showNotification = function(message, type = 'info') {
    console.log('🔔 Notificação:', message);
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#007bff'};
        color: ${type === 'warning' ? '#000' : 'white'}; padding: 15px 20px; border-radius: 5px;
        z-index: 9999; box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease; border: 2px solid ${type === 'warning' ? '#ff9800' : 'transparent'};
        max-width: 300px; word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
};

console.log('✅ rooms/room-ui.js carregado!');