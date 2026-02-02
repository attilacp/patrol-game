// js/rooms.js - Sistema de Salas Multiplayer do Patrol Game
console.log('🎮 rooms.js carregando...');

class RoomSystem {
    constructor() {
        console.log('🏠 Inicializando sistema de salas...');
        this.currentRoom = null;
        this.isMaster = false;
        this.playerId = this.generatePlayerId();
        this.players = {};
        this.roomListeners = [];
        this.actionListeners = [];
        
        console.log('👤 ID do jogador:', this.playerId);
    }
    
    // ===== GERAR IDs =====
    generatePlayerId() {
        // Usar UID do Firebase se disponível, senão gerar aleatório
        if (firebase.auth().currentUser) {
            return firebase.auth().currentUser.uid;
        }
        return 'guest_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    
    // ===== CRIAR SALA =====
    createRoom() {
        console.log('🏁 Criando nova sala...');
        
        const roomCode = this.generateRoomCode();
        const user = firebase.auth().currentUser;
        
        if (!user) {
            alert('Você precisa estar logado para criar uma sala');
            return null;
        }
        
        this.currentRoom = roomCode;
        this.isMaster = true;
        
        // Dados da sala
        const roomData = {
            code: roomCode,
            created: Date.now(),
            master: {
                uid: user.uid,
                name: user.email || 'Mestre',
                email: user.email
            },
            status: 'lobby', // lobby, config, playing, finished
            gameState: null,
            settings: {
                maxPlayers: 10,
                isPrivate: false
            },
            players: {
                [this.playerId]: {
                    uid: this.playerId,
                    name: user.displayName || user.email || 'Jogador',
                    email: user.email,
                    isMaster: true,
                    isReady: false,
                    score: 0,
                    connected: true,
                    joinedAt: Date.now()
                }
            }
        };
        
        // Criar sala no Firebase
        const roomRef = firebase.database().ref('rooms/' + roomCode);
        roomRef.set(roomData)
            .then(() => {
                console.log('✅ Sala criada:', roomCode);
                this.joinRoom(roomCode, true);
                
                // Mostrar código para o mestre
                this.showRoomInfo(roomCode);
                
                // Ouvir mudanças na sala
                this.setupRoomListeners();
                
                alert(`🎉 Sala criada!\nCódigo: ${roomCode}\nCompartilhe com os jogadores.`);
                
                // Ir para tela de configuração
                if (window.authSystem) {
                    window.authSystem.showConfigScreen();
                }
            })
            .catch(error => {
                console.error('❌ Erro ao criar sala:', error);
                alert('Erro ao criar sala: ' + error.message);
            });
        
        return roomCode;
    }
    
    // ===== ENTRAR NA SALA =====
    joinRoom(roomCode, isMaster = false) {
        console.log('🔑 Entrando na sala:', roomCode);
        
        const user = firebase.auth().currentUser;
        if (!user && !isMaster) {
            alert('Você precisa estar logado para entrar em uma sala');
            return false;
        }
        
        this.currentRoom = roomCode;
        this.isMaster = isMaster;
        
        // Verificar se sala existe
        const roomRef = firebase.database().ref('rooms/' + roomCode);
        roomRef.once('value')
            .then(snapshot => {
                if (!snapshot.exists()) {
                    alert('Sala não encontrada. Verifique o código.');
                    this.currentRoom = null;
                    return;
                }
                
                const roomData = snapshot.val();
                
                // Verificar se sala está cheia
                const playerCount = Object.keys(roomData.players || {}).length;
                if (playerCount >= (roomData.settings?.maxPlayers || 10)) {
                    alert('Sala cheia! Máximo de jogadores atingido.');
                    this.currentRoom = null;
                    return;
                }
                
                // Verificar se jogo já começou
                if (roomData.status === 'playing' && !isMaster) {
                    alert('O jogo já começou nesta sala. Não é possível entrar.');
                    this.currentRoom = null;
                    return;
                }
                
                // Adicionar jogador à sala
                const playerData = {
                    uid: this.playerId,
                    name: user ? (user.displayName || user.email || 'Jogador') : 'Convidado',
                    email: user ? user.email : null,
                    isMaster: isMaster,
                    isReady: false,
                    score: 0,
                    connected: true,
                    joinedAt: Date.now()
                };
                
                roomRef.child('players/' + this.playerId).set(playerData)
                    .then(() => {
                        console.log('✅ Jogador entrou na sala:', roomCode);
                        
                        // Mostrar informações da sala
                        if (!isMaster) {
                            this.showRoomInfo(roomCode);
                            alert(`✅ Entrou na sala ${roomCode}!\nAguardando o mestre iniciar...`);
                        }
                        
                        // Ouvir mudanças na sala
                        this.setupRoomListeners();
                        
                        // Atualizar UI
                        this.updateRoomUI(roomData);
                        
                        // Ir para tela do jogo
                        if (window.authSystem) {
                            window.authSystem.showGameScreen();
                        }
                    })
                    .catch(error => {
                        console.error('❌ Erro ao entrar na sala:', error);
                        alert('Erro ao entrar na sala: ' + error.message);
                    });
            })
            .catch(error => {
                console.error('❌ Erro ao verificar sala:', error);
                alert('Erro: ' + error.message);
            });
        
        return true;
    }
    
    // ===== SAIR DA SALA =====
    leaveRoom() {
        if (!this.currentRoom) return;
        
        console.log('🚪 Saindo da sala:', this.currentRoom);
        
        // Remover jogador da sala no Firebase
        const playerRef = firebase.database().ref('rooms/' + this.currentRoom + '/players/' + this.playerId);
        playerRef.remove()
            .then(() => {
                console.log('✅ Jogador removido da sala');
                
                // Se for mestre e não houver mais jogadores, deletar sala
                if (this.isMaster) {
                    this.checkAndDeleteEmptyRoom();
                }
                
                // Remover listeners
                this.removeRoomListeners();
                
                // Resetar dados locais
                this.currentRoom = null;
                this.isMaster = false;
                this.players = {};
                
                // Voltar para lobby
                if (window.authSystem) {
                    window.authSystem.showLobbyScreen();
                }
            })
            .catch(error => {
                console.error('❌ Erro ao sair da sala:', error);
            });
    }
    
    checkAndDeleteEmptyRoom() {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom + '/players');
        roomRef.once('value')
            .then(snapshot => {
                if (!snapshot.exists() || Object.keys(snapshot.val() || {}).length === 0) {
                    // Sala vazia, deletar
                    firebase.database().ref('rooms/' + this.currentRoom).remove()
                        .then(() => console.log('🗑️ Sala vazia deletada'))
                        .catch(error => console.error('Erro ao deletar sala:', error));
                }
            });
    }
    
    // ===== OUVIR MUDANÇAS NA SALA =====
    setupRoomListeners() {
        if (!this.currentRoom) return;
        
        console.log('👂 Configurando listeners da sala:', this.currentRoom);
        
        // Listener para dados da sala
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        const roomListener = roomRef.on('value', (snapshot) => {
            const roomData = snapshot.val();
            if (roomData) {
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
        });
        this.actionListeners.push({ ref: actionsRef, listener: actionListener });
    }
    
    removeRoomListeners() {
        // Remover todos os listeners
        this.roomListeners.forEach(item => {
            if (item.ref && item.listener) {
                item.ref.off('value', item.listener);
            }
        });
        
        this.actionListeners.forEach(item => {
            if (item.ref && item.listener) {
                item.ref.off('child_added', item.listener);
            }
        });
        
        this.roomListeners = [];
        this.actionListeners = [];
        console.log('👋 Listeners removidos');
    }
    
    // ===== ATUALIZAR UI =====
    updateRoomUI(roomData) {
        // Atualizar lista de jogadores
        this.updatePlayersList(roomData.players || {});
        
        // Atualizar status da sala
        this.updateRoomStatus(roomData.status);
        
        // Atualizar informações do mestre
        if (roomData.master) {
            const masterNameElement = document.getElementById('master-name');
            if (masterNameElement) {
                masterNameElement.textContent = roomData.master.name;
            }
        }
        
        // Atualizar código da sala
        const codeElement = document.getElementById('current-room-code');
        if (codeElement) {
            codeElement.textContent = this.currentRoom;
        }
    }
    
    updatePlayersList(players) {
        this.players = players;
        
        const playersList = document.getElementById('players-list');
        if (!playersList) return;
        
        let html = '<h4>👥 Jogadores Conectados:</h4>';
        let playerCount = 0;
        
        Object.values(players).forEach(player => {
            if (player.connected) {
                playerCount++;
                html += `
                    <div class="player-item ${player.isMaster ? 'master' : ''}">
                        <span class="player-icon">${player.isMaster ? '👑' : '👤'}</span>
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
        
        // Mostrar/ocultar botão iniciar jogo (apenas para mestre)
        const startBtn = document.getElementById('start-game-btn-lobby');
        if (startBtn) {
            startBtn.style.display = this.isMaster ? 'block' : 'none';
        }
    }
    
    updateRoomStatus(status) {
        const statusElement = document.getElementById('game-status');
        if (!statusElement) return;
        
        const statusMap = {
            'lobby': { text: '🔵 Lobby', color: '#007bff' },
            'config': { text: '⚙️ Configurando', color: '#ffc107' },
            'playing': { text: '🎮 Em Andamento', color: '#28a745' },
            'finished': { text: '🏁 Finalizado', color: '#6c757d' }
        };
        
        const statusInfo = statusMap[status] || { text: '❓ Desconhecido', color: '#dc3545' };
        statusElement.textContent = statusInfo.text;
        statusElement.style.color = statusInfo.color;
    }
    
    showRoomInfo(roomCode) {
        const roomInfo = document.getElementById('room-info');
        if (roomInfo) {
            roomInfo.style.display = 'block';
        }
        
        // Mostrar código em vários lugares
        const codeElement = document.getElementById('current-room-code');
        if (codeElement) {
            codeElement.textContent = roomCode;
        }
        
        // Copiar código para área de transferência (opcional)
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 Copiar Código';
        copyBtn.style.cssText = `
            background: #6c757d;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
            margin-left: 10px;
            font-size: 12px;
        `;
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(roomCode);
            alert('Código copiado!');
        };
        
        const codeContainer = document.getElementById('current-room-code');
        if (codeContainer && !codeContainer.parentNode.querySelector('button')) {
            codeContainer.parentNode.appendChild(copyBtn);
        }
    }
    
    // ===== AÇÕES DO JOGO =====
    sendAction(actionType, data = {}) {
        if (!this.currentRoom) return;
        
        const user = firebase.auth().currentUser;
        const action = {
            type: actionType,
            playerId: this.playerId,
            playerName: user ? (user.displayName || user.email) : 'Anônimo',
            data: data,
            timestamp: Date.now(),
            roomCode: this.currentRoom
        };
        
        const actionsRef = firebase.database().ref('rooms/' + this.currentRoom + '/actions');
        actionsRef.push(action)
            .then(() => {
                console.log('📤 Ação enviada:', actionType, data);
            })
            .catch(error => {
                console.error('❌ Erro ao enviar ação:', error);
            });
    }
    
    handlePlayerAction(action) {
        // Não processar própria ação
        if (action.playerId === this.playerId) return;
        
        console.log('📥 Ação recebida:', action.type, 'de', action.playerName);
        
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
        }
    }
    
    handleAnswerAction(action) {
        // Atualizar pontuação do jogador
        const isCorrect = action.data.correct;
        const scoreChange = isCorrect ? 10 : -5;
        
        const playerRef = firebase.database().ref('rooms/' + this.currentRoom + '/players/' + action.playerId + '/score');
        playerRef.transaction((current) => {
            return (current || 0) + scoreChange;
        });
        
        // Mostrar notificação
        this.showNotification(`${action.playerName} ${isCorrect ? 'acertou' : 'errou'}!`);
    }
    
    handleSkipAction(action) {
        // Apenas mestre pode avançar pergunta
        if (this.isMaster) {
            this.showNotification(`${action.playerName} pediu para pular`);
        }
    }
    
    handleChatAction(action) {
        // Adicionar mensagem ao chat
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            const messageDiv = document.createElement('div');
            messageDiv.innerHTML = `<strong>${action.playerName}:</strong> ${action.data.message}`;
            messageDiv.style.marginBottom = '5px';
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    handleReadyAction(action) {
        // Atualizar status do jogador
        const playerRef = firebase.database().ref('rooms/' + this.currentRoom + '/players/' + action.playerId + '/isReady');
        playerRef.set(action.data.ready);
        
        this.showNotification(`${action.playerName} está ${action.data.ready ? 'pronto' : 'não pronto'}`);
    }
    
    handleStartGameAction(action) {
        // Apenas mestre pode iniciar jogo
        const player = this.players[action.playerId];
        if (player && player.isMaster) {
            // Mudar status da sala para playing
            firebase.database().ref('rooms/' + this.currentRoom + '/status').set('playing');
            
            // Ir para tela do jogo
            if (window.authSystem) {
                window.authSystem.showGameScreen();
            }
        }
    }
    
    handleRoomUpdate(roomData) {
        // Verificar se status mudou
        const gameScreen = document.getElementById('game-screen');
        if (roomData.status === 'playing' && gameScreen && gameScreen.classList.contains('active')) {
            // Jogo começou, atualizar interface
            this.updateGameInterface(roomData.gameState);
        }
        
        // Verificar se mestre mudou (se mestre saiu)
        if (roomData.master && this.isMaster && roomData.master.uid !== this.playerId) {
            // Você não é mais o mestre
            this.isMaster = false;
            alert('⚠️ O mestre original retornou. Você agora é um jogador.');
        }
    }
    
    updateGameInterface(gameState) {
        // Aqui você atualizaria a interface do jogo com os dados sincronizados
        if (gameState && gameState.currentQuestion) {
            const questionText = document.getElementById('question-text');
            const questionNumber = document.getElementById('question-number');
            const totalQuestions = document.getElementById('total-questions');
            
            if (questionText) questionText.textContent = gameState.currentQuestion.enunciado;
            if (questionNumber) questionNumber.textContent = gameState.questionIndex + 1;
            if (totalQuestions) totalQuestions.textContent = gameState.totalQuestions;
        }
    }
    
    // ===== UTILITÁRIOS =====
    showNotification(message) {
        // Criar notificação temporária
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #003366;
            color: #FFCC00;
            padding: 10px 20px;
            border-radius: 5px;
            border: 2px solid #FFCC00;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // ===== CONTROLES DO MESTRE =====
    startGame(gameData) {
        if (!this.isMaster || !this.currentRoom) {
            alert('Apenas o mestre pode iniciar o jogo');
            return;
        }
        
        console.log('🚀 Iniciando jogo...');
        
        // Enviar ação de iniciar jogo
        this.sendAction('start_game', { gameData: gameData });
        
        // Atualizar status da sala
        firebase.database().ref('rooms/' + this.currentRoom).update({
            status: 'playing',
            gameState: gameData
        });
        
        // Ir para tela do jogo
        if (window.authSystem) {
            window.authSystem.showGameScreen();
        }
    }
    
    updateGameState(gameState) {
        if (!this.isMaster || !this.currentRoom) return;
        
        firebase.database().ref('rooms/' + this.currentRoom + '/gameState').set(gameState);
    }
    
    // ===== GETTERS =====
    getCurrentRoom() {
        return this.currentRoom;
    }
    
    getIsMaster() {
        return this.isMaster;
    }
    
    getPlayers() {
        return this.players;
    }
    
    getPlayerCount() {
        return Object.values(this.players).filter(p => p.connected).length;
    }
}

// Exportar para uso global
window.RoomSystem = RoomSystem;

console.log('✅ rooms.js carregado com sucesso!');