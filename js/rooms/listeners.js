// js/rooms/listeners.js - VERSÃO CORRIGIDA (evita duplicação e sincroniza jogo)
console.log('🏠 rooms/listeners.js carregando...');

RoomSystem.prototype.setupRoomListeners = function() {
    if (!this.currentRoom) return;
    
    console.log('👂 Configurando listeners da sala:', this.currentRoom);
    
    // Limpar listeners anteriores para evitar duplicação
    this.cleanupRoomListeners();
    
    try {
        // Listener para dados da sala (APENAS UMA VEZ)
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        const roomListener = roomRef.on('value', (snapshot) => {
            const roomData = snapshot.val();
            if (roomData) {
                console.log('📡 Atualização da sala recebida:', roomData.status);
                this.handleRoomUpdate(roomData);
            }
        });
        this.roomListeners.push({ ref: roomRef, listener: roomListener });
        
        // Listener para ações (para chat, respostas, etc.)
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

RoomSystem.prototype.cleanupRoomListeners = function() {
    // Limpar listeners da sala
    this.roomListeners.forEach(item => {
        if (item.ref && item.listener) {
            item.ref.off('value', item.listener);
        }
    });
    this.roomListeners = [];
    
    // Limpar listeners de ações
    this.actionListeners.forEach(item => {
        if (item.ref && item.listener) {
            item.ref.off('child_added', item.listener);
        }
    });
    this.actionListeners = [];
    
    console.log('🧹 Todos os listeners anteriores foram limpos');
};

RoomSystem.prototype.handleRoomUpdate = function(roomData) {
    console.log('🔄 Processando atualização da sala:', roomData.status);
    
    // FLAG PARA EVITAR MÚLTIPLAS EXECUÇÕES
    if (this.lastStatus === roomData.status) {
        console.log('⏭️ Status igual ao anterior, ignorando...');
        return;
    }
    this.lastStatus = roomData.status;
    
    // Atualizar lista de jogadores
    if (roomData.players) {
        this.players = roomData.players;
        this.updatePlayersList();
    }
    
    // SE O MESTRE INICIOU O JOGO
    if (roomData.status === 'playing' && !this.isMaster) {
        console.log('🎮 O mestre iniciou o jogo! Sincronizando...');
        
        // 1. Ir para tela do jogo (APENAS UMA VEZ)
        if (!this.jogoIniciadoParaJogador) {
            this.jogoIniciadoParaJogador = true;
            
            setTimeout(() => {
                if (window.authSystem) {
                    console.log('✅ Redirecionando jogador para tela do jogo...');
                    window.authSystem.showGameScreen();
                    
                    // Mostrar alerta (APENAS UMA VEZ)
                    if (!this.alertaMostrado) {
                        this.alertaMostrado = true;
                        setTimeout(() => {
                            alert('🎮 O mestre iniciou o jogo!\n\nBoa sorte!');
                        }, 800);
                    }
                }
            }, 1200);
        }
        
        // 2. SINCRONIZAR DADOS DO JOGO
        this.syncGameData(roomData);
    }
    
    // Atualizar status da sala na UI
    if (roomData.status) {
        this.updateRoomStatus(roomData.status);
    }
};

RoomSystem.prototype.syncGameData = async function(roomData) {
    console.log('🔄 Sincronizando dados do jogo do Firebase...');
    
    // Sincronizar estado do jogo
    if (roomData.gameState) {
        console.log('📊 Recebendo estado do jogo:', roomData.gameState);
        
        // Sincronizar índices
        if (roomData.gameState.currentQuestionIndex !== undefined) {
            window.currentQuestionIndex = roomData.gameState.currentQuestionIndex;
        }
        if (roomData.gameState.currentTeamIndex !== undefined) {
            window.currentTeamIndex = roomData.gameState.currentTeamIndex;
        }
        
        // Sincronizar pontuações
        if (roomData.gameState.scores && window.teams) {
            this.syncScores(roomData.gameState.scores);
        }
    }
    
    // BUSCAR PERGUNTAS E EQUIPES DO FIREBASE
    await this.fetchQuestionsAndTeams();
};

RoomSystem.prototype.syncScores = function(scores) {
    if (window.teams && scores) {
        window.teams.forEach(team => {
            if (scores[team.id] !== undefined) {
                team.score = scores[team.id];
            }
        });
        console.log('📊 Pontuações sincronizadas das equipes');
        
        // Atualizar display se estiver no jogo
        if (window.updateTeamsDisplay) {
            window.updateTeamsDisplay();
        }
    }
};

RoomSystem.prototype.fetchQuestionsAndTeams = async function() {
    console.log('📥 Buscando perguntas e equipes do Firebase...');
    
    try {
        // Buscar perguntas
        const questionsRef = firebase.database().ref('rooms/' + this.currentRoom + '/gameData/questions');
        const questionsSnap = await questionsRef.once('value');
        
        if (questionsSnap.exists()) {
            window.questions = questionsSnap.val();
            console.log('✅ Perguntas recebidas:', window.questions.length);
            
            // Atualizar contador na tela
            const totalEl = document.getElementById('total-questions');
            if (totalEl) totalEl.textContent = window.questions.length;
        } else {
            console.log('⏳ Aguardando mestre enviar perguntas...');
            window.questions = [];
        }
        
        // Buscar equipes
        const teamsRef = firebase.database().ref('rooms/' + this.currentRoom + '/gameData/teams');
        const teamsSnap = await teamsRef.once('value');
        
        if (teamsSnap.exists()) {
            window.teams = teamsSnap.val();
            console.log('✅ Equipes recebidas:', window.teams.length);
            
            // Atualizar display das equipes
            if (window.updateTeamsDisplay) {
                window.updateTeamsDisplay();
            }
        } else {
            console.log('⏳ Aguardando mestre enviar equipes...');
            window.teams = [];
        }
        
        // Se temos perguntas, mostrar a atual
        if (window.questions && window.questions.length > 0 && window.showQuestion) {
            setTimeout(() => {
                window.showQuestion();
            }, 500);
        } else {
            // Mostrar mensagem de espera
            const questionText = document.getElementById('question-text');
            if (questionText) {
                questionText.textContent = '🔄 Sincronizando com o mestre...';
            }
        }
        
    } catch (error) {
        console.error('❌ Erro ao buscar dados:', error);
    }
};

// Funções existentes (manter)
RoomSystem.prototype.handlePlayerAction = function(action) {
    if (action.playerId === this.playerId) return;
    console.log('📥 Ação recebida:', action.type, 'de', action.playerName);
    this.showActionNotification(action);
};

RoomSystem.prototype.showActionNotification = function(action) {
    let message = '';
    switch (action.type) {
        case 'answer': message = `${action.playerName} ${action.data.correct ? 'acertou' : 'errou'}!`; break;
        case 'ready': message = `${action.playerName} está ${action.data.ready ? 'pronto' : 'não pronto'}`; break;
    }
    if (message) this.showNotification(message);
};

RoomSystem.prototype.showNotification = function(message, type = 'info') {
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
        position: fixed; top: 20px; right: 20px; background: ${color.bg};
        color: ${color.color}; padding: 12px 20px; border-radius: 8px;
        border: 2px solid ${color.border}; z-index: 10000;
        animation: slideIn 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-weight: 600; max-width: 300px; word-wrap: break-word;
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
    
    const sortedPlayers = Object.values(this.players || {}).sort((a, b) => {
        if (a.isMaster && !b.isMaster) return -1;
        if (!a.isMaster && b.isMaster) return 1;
        return (a.name || '').localeCompare(b.name || '');
    });
    
    sortedPlayers.forEach(player => {
        if (player.connected) {
            playerCount++;
            html += `
                <div class="player-item ${player.isMaster ? 'master' : ''}">
                    <span class="player-icon">${player.avatar || '👤'}</span>
                    <span class="player-name">${player.name || 'Sem nome'}</span>
                    <span class="player-status">${player.isReady ? '✅ Pronto' : '⏳ Aguardando'}</span>
                    <span class="player-score">${player.score || 0} pts</span>
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

console.log('✅ rooms/listeners.js carregado com sucesso!');