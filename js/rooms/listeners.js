// js/rooms/listeners.js - VERSÃO FINAL CORRIGIDA
console.log('🏠 rooms/listeners.js carregando...');

// Variável global para controle
window.roomListenerActive = false;

RoomSystem.prototype.setupRoomListeners = function() {
    if (!this.currentRoom) return;
    
    console.log('👂 Configurando listeners da sala:', this.currentRoom);
    
    // LIMPAR COMPLETAMENTE ANTES DE RECRIAR
    this.cleanupAllListeners();
    
    try {
        // LISTENER ÚNICO com once() em vez de on() para evitar múltiplas execuções
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        
        // Usar once() para receber dados APENAS UMA VEZ
        roomRef.once('value').then((snapshot) => {
            const roomData = snapshot.val();
            if (roomData) {
                console.log('📡 Dados da sala recebidos (uma vez):', roomData.status);
                this.handleRoomUpdate(roomData);
            }
        }).catch(error => {
            console.error('❌ Erro ao buscar dados da sala:', error);
        });
        
        // Apenas para mudanças de status usamos on()
        const statusListener = roomRef.child('status').on('value', (snapshot) => {
            const status = snapshot.val();
            if (status && status !== this.lastStatus) {
                console.log('🔄 Status mudou para:', status);
                this.lastStatus = status;
                this.handleStatusChange(status);
            }
        });
        
        this.roomListeners.push({ ref: roomRef.child('status'), listener: statusListener });
        
        console.log('✅ Listeners configurados (modo uma vez)');
        
    } catch (error) {
        console.error('❌ Erro ao configurar listeners:', error);
    }
};

RoomSystem.prototype.cleanupAllListeners = function() {
    console.log('🧹 Limpando TODOS os listeners...');
    
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
    
    // Resetar flags
    this.lastStatus = null;
    this.jogoIniciadoParaJogador = false;
    this.alertaMostrado = false;
    window.roomListenerActive = false;
};

RoomSystem.prototype.handleStatusChange = function(status) {
    console.log('📊 Status da sala alterado:', status);
    
    // Se o mestre iniciou o jogo
    if (status === 'playing' && !this.isMaster) {
        console.log('🎮 Jogo iniciado pelo mestre!');
        
        // 1. Ir para tela do jogo (APENAS UMA VEZ)
        if (!this.jogoIniciadoParaJogador && window.authSystem) {
            this.jogoIniciadoParaJogador = true;
            
            setTimeout(() => {
                console.log('✅ Indo para tela do jogo...');
                window.authSystem.showGameScreen();
                
                // Buscar dados do jogo
                this.fetchGameDataFromFirebase();
                
                // Alerta (APENAS UMA VEZ)
                if (!this.alertaMostrado) {
                    this.alertaMostrado = true;
                    setTimeout(() => {
                        alert('🎮 O mestre iniciou o jogo!\n\nSincronizando dados...');
                    }, 500);
                }
            }, 800);
        }
    }
};

RoomSystem.prototype.handleRoomUpdate = function(roomData) {
    console.log('🔄 Processando dados da sala:', roomData.status);
    
    // Atualizar lista de jogadores
    if (roomData.players) {
        this.players = roomData.players;
        this.updatePlayersList();
    }
    
    // Atualizar status
    if (roomData.status) {
        this.updateRoomStatus(roomData.status);
        this.lastStatus = roomData.status;
    }
};

RoomSystem.prototype.fetchGameDataFromFirebase = async function() {
    console.log('📥 BUSCANDO DADOS DO JOGO NO FIREBASE...');
    
    if (!this.currentRoom) {
        console.error('❌ Sem sala ativa');
        return;
    }
    
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        
        // BUSCAR PERGUNTAS
        console.log('🔍 Buscando perguntas em /gameData/questions...');
        const questionsSnap = await roomRef.child('gameData/questions').once('value');
        
        if (questionsSnap.exists()) {
            window.questions = questionsSnap.val();
            console.log('✅ PERGUNTAS RECEBIDAS:', window.questions.length);
            
            // Atualizar total na tela
            const totalEl = document.getElementById('total-questions');
            if (totalEl && window.questions.length > 0) {
                totalEl.textContent = window.questions.length;
            }
        } else {
            console.error('❌ NENHUMA PERGUNTA ENCONTRADA no Firebase');
            console.log('📍 Caminho verificado: /rooms/' + this.currentRoom + '/gameData/questions');
            window.questions = [];
        }
        
        // BUSCAR EQUIPES
        console.log('🔍 Buscando equipes em /gameData/teams...');
        const teamsSnap = await roomRef.child('gameData/teams').once('value');
        
        if (teamsSnap.exists()) {
            window.teams = teamsSnap.val();
            console.log('✅ EQUIPES RECEBIDAS:', window.teams.length);
        } else {
            console.error('❌ NENHUMA EQUIPE ENCONTRADA no Firebase');
            window.teams = [];
        }
        
        // SE TEMOS DADOS, INICIAR JOGO
        if (window.questions && window.questions.length > 0) {
            console.log('🚀 DADOS RECEBIDOS - Iniciando jogo para jogador...');
            
            // Configurar estado do jogo
            window.currentQuestionIndex = 0;
            window.currentTeamIndex = 0;
            window.gameStarted = true;
            
            // Mostrar primeira pergunta
            setTimeout(() => {
                if (window.updateTeamsDisplay) {
                    window.updateTeamsDisplay();
                }
                
                if (window.showQuestion) {
                    window.showQuestion();
                } else {
                    console.error('❌ showQuestion não disponível');
                    // Fallback manual
                    const questionText = document.getElementById('question-text');
                    if (questionText && window.questions[0]) {
                        questionText.textContent = window.questions[0].enunciado || 'Pergunta recebida';
                    }
                }
            }, 1000);
            
        } else {
            console.log('⏳ Aguardando mestre enviar dados...');
            const questionText = document.getElementById('question-text');
            if (questionText) {
                questionText.textContent = '🔄 Aguardando dados do mestre...';
            }
            
            // Tentar novamente em 3 segundos
            setTimeout(() => {
                console.log('🔄 Tentando buscar dados novamente...');
                this.fetchGameDataFromFirebase();
            }, 3000);
        }
        
    } catch (error) {
        console.error('❌ ERRO ao buscar dados:', error);
        console.error('Detalhes:', error.message);
        
        const questionText = document.getElementById('question-text');
        if (questionText) {
            questionText.textContent = '❌ Erro ao sincronizar. Recarregue a página.';
        }
    }
};

// Funções de UI (manter)
RoomSystem.prototype.updatePlayersList = function() {
    const playersList = document.getElementById('players-list');
    if (!playersList) return;
    
    let html = '<h4>👥 Jogadores Conectados:</h4>';
    let playerCount = 0;
    
    const players = this.players || {};
    const sortedPlayers = Object.values(players).sort((a, b) => {
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