// js/rooms/room-manager.js - VERSÃO CORRIGIDA (evita mensagens duplicadas)
console.log('🏠 rooms/room-manager.js carregando...');

RoomSystem.prototype.createRoom = async function() {
    console.log('🏁 Criando nova sala...');
    
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Você precisa estar logado para criar uma sala');
        return null;
    }
    
    const roomCode = this.generateRoomCode();
    this.currentRoom = roomCode;
    this.isMaster = true;
    
    const roomData = {
        code: roomCode,
        created: Date.now(),
        master: { 
            uid: user.uid, 
            name: this.playerName, 
            email: user.email 
        },
        status: 'lobby',
        gameState: null,
        gameData: { questions: [], teams: [] }, // NOVO: dados do jogo
        settings: this.settings,
        players: {
            [this.playerId]: {
                uid: this.playerId,
                name: this.playerName,
                email: user.email,
                isMaster: true,
                isReady: false,
                score: 0,
                connected: true,
                joinedAt: Date.now(),
                avatar: '👑'
            }
        },
        lastActivity: Date.now()
    };
    
    try {
        const roomRef = firebase.database().ref('rooms/' + roomCode);
        await roomRef.set(roomData);
        
        console.log('✅ Sala criada no Firebase:', roomCode);
        
        // Mostrar código no lobby
        const roomInfo = document.getElementById('room-info');
        const roomCodeSpan = document.getElementById('current-room-code');
        
        if (roomInfo) {
            roomInfo.style.display = 'block';
            roomInfo.style.animation = 'fadeIn 0.5s ease';
        }
        
        if (roomCodeSpan) {
            roomCodeSpan.textContent = roomCode;
        }
        
        this.addCopyButtonToRoomCode(roomCode);
        this.setupRoomListeners();
        
        // MOSTRAR ALERTA APENAS UMA VEZ
        if (!this.roomCreatedAlertShown) {
            this.roomCreatedAlertShown = true;
            setTimeout(() => {
                alert(`🎉 Sala criada!\n\nCódigo: ${roomCode}\n\nCompartilhe este código com os jogadores.`);
            }, 800);
        }
        
        return roomCode;
        
    } catch (error) {
        console.error('❌ Erro ao criar sala:', error);
        
        if (error.code === 'PERMISSION_DENIED') {
            alert('❌ Erro: Permissão negada no Firebase.\n\nNo Firebase Console:\n1. Vá em Realtime Database\n2. Clique em "Rules"\n3. Altere para:\n{\n  "rules": {\n    ".read": true,\n    ".write": true\n  }\n}');
        } else {
            alert('Erro ao criar sala: ' + error.message);
        }
        
        this.currentRoom = null;
        this.isMaster = false;
        return null;
    }
};

RoomSystem.prototype.joinRoom = async function(roomCode, isMaster = false) {
    console.log('🔑 Entrando na sala:', roomCode);
    
    const user = firebase.auth().currentUser;
    if (!user && !isMaster) {
        alert('Você precisa estar logado para entrar em uma sala');
        return false;
    }
    
    this.cleanup();
    this.currentRoom = roomCode.toUpperCase();
    this.isMaster = isMaster;
    
    // FLAG PARA CONTROLAR MENSAGENS
    if (!this.joinFlags) this.joinFlags = {};
    const roomKey = this.currentRoom;
    
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        const snapshot = await roomRef.once('value');
        
        if (!snapshot.exists()) {
            alert('❌ Sala não encontrada. Verifique o código.');
            this.currentRoom = null;
            return false;
        }
        
        const roomData = snapshot.val();
        
        if (roomData.status === 'playing' && !isMaster) {
            alert('⚠️ O jogo já começou nesta sala. Não é possível entrar.');
            this.currentRoom = null;
            return false;
        }
        
        const playerData = {
            uid: this.playerId,
            name: this.playerName,
            email: user ? user.email : null,
            isMaster: isMaster,
            isReady: false,
            score: 0,
            connected: true,
            joinedAt: Date.now(),
            avatar: isMaster ? '👑' : '👤'
        };
        
        await roomRef.child('players/' + this.playerId).set(playerData);
        
        console.log('✅ Jogador entrou na sala:', this.currentRoom);
        await roomRef.child('lastActivity').set(Date.now());
        
        this.setupRoomListeners();
        this.updateRoomUI(roomData);
        
        // MOSTRAR ALERTA APENAS UMA VEZ POR SALA
        if (!isMaster && !this.joinFlags[roomKey]) {
            this.joinFlags[roomKey] = true;
            
            setTimeout(() => {
                alert(`✅ Entrou na sala ${this.currentRoom}!\nAguardando o mestre iniciar o jogo...`);
            }, 600);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao entrar na sala:', error);
        
        if (error.code === 'PERMISSION_DENIED') {
            alert('❌ Erro: Permissão negada no Firebase.\n\nConfigure as regras do Realtime Database para modo teste.');
        } else {
            alert('Erro ao entrar na sala: ' + error.message);
        }
        
        this.currentRoom = null;
        this.isMaster = false;
        return false;
    }
};

RoomSystem.prototype.leaveRoom = async function() {
    if (!this.currentRoom) return;
    
    console.log('🚪 Saindo da sala:', this.currentRoom);
    
    try {
        const playerRef = firebase.database().ref('rooms/' + this.currentRoom + '/players/' + this.playerId);
        await playerRef.remove();
        
        console.log('✅ Jogador removido da sala');
        
        if (this.isMaster) {
            await this.checkAndDeleteEmptyRoom();
        }
        
        this.cleanup();
        
        if (window.authSystem) {
            window.authSystem.showLobbyScreen();
        }
        
    } catch (error) {
        console.error('❌ Erro ao sair da sala:', error);
    }
};

RoomSystem.prototype.checkAndDeleteEmptyRoom = async function() {
    if (!this.currentRoom) return;
    
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom + '/players');
        const snapshot = await roomRef.once('value');
        
        if (!snapshot.exists() || Object.keys(snapshot.val() || {}).length === 0) {
            await firebase.database().ref('rooms/' + this.currentRoom).remove();
            console.log('🗑️ Sala vazia deletada do Firebase');
        }
    } catch (error) {
        console.error('Erro ao verificar sala vazia:', error);
    }
};

RoomSystem.prototype.addCopyButtonToRoomCode = function(roomCode) {
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

RoomSystem.prototype.updateRoomUI = function(roomData) {
    if (roomData.players) {
        this.updatePlayersList(roomData.players);
    }
    
    if (roomData.status) {
        this.updateRoomStatus(roomData.status);
    }
    
    this.updateRoomCode();
};

RoomSystem.prototype.updatePlayersList = function(players) {
    this.players = players;
    
    const playersList = document.getElementById('players-list');
    if (!playersList) return;
    
    let html = '<h4>👥 Jogadores Conectados:</h4>';
    let playerCount = 0;
    
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

RoomSystem.prototype.updateRoomCode = function() {
    const codeElement = document.getElementById('current-room-code');
    if (codeElement) {
        codeElement.textContent = this.currentRoom;
    }
};

console.log('✅ rooms/room-manager.js carregado com sucesso!');