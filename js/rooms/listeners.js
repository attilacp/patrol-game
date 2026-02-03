// js/rooms/listeners.js - VERSÃO FINAL
console.log('🏠 rooms/listeners.js carregando...');

RoomSystem.prototype.setupRoomListeners = function() {
    if (!this.currentRoom) return;
    
    console.log('👂 Configurando listeners da sala:', this.currentRoom);
    
    // Limpar listeners anteriores
    this.cleanupAllListeners();
    
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        
        // LISTENER para mudanças de status (APENAS mudanças)
        const statusListener = roomRef.child('status').on('value', (snapshot) => {
            const status = snapshot.val();
            if (status && status !== this.lastStatus) {
                console.log('🔄 Status mudou para:', status);
                this.lastStatus = status;
                this.handleStatusChange(status);
            }
        });
        
        this.roomListeners.push({ ref: roomRef.child('status'), listener: statusListener });
        
        // Carregar dados iniciais UMA VEZ
        this.loadInitialRoomData();
        
        console.log('✅ Listeners configurados');
        
    } catch (error) {
        console.error('❌ Erro ao configurar listeners:', error);
    }
};

RoomSystem.prototype.cleanupAllListeners = function() {
    // Limpar listeners da sala
    this.roomListeners.forEach(item => {
        if (item.ref && item.listener) {
            item.ref.off('value', item.listener);
        }
    });
    this.roomListeners = [];
    
    // Resetar flags
    this.lastStatus = null;
    this.jogoIniciadoParaJogador = false;
    this.alertaMostrado = false;
    this.dadosCarregados = false;
};

RoomSystem.prototype.loadInitialRoomData = async function() {
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        const snapshot = await roomRef.once('value');
        const roomData = snapshot.val();
        
        if (roomData) {
            console.log('📡 Dados iniciais da sala:', roomData.status);
            
            // Atualizar jogadores
            if (roomData.players) {
                this.players = roomData.players;
                this.updatePlayersList();
            }
            
            // Atualizar status
            if (roomData.status) {
                this.updateRoomStatus(roomData.status);
                this.lastStatus = roomData.status;
                
                // Se já estiver playing, carregar dados do jogo
                if (roomData.status === 'playing' && !this.isMaster) {
                    console.log('🎮 Jogo já está em andamento - carregando dados...');
                    this.handleStatusChange('playing');
                }
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados iniciais:', error);
    }
};

RoomSystem.prototype.handleStatusChange = function(status) {
    console.log('📊 Processando mudança de status:', status);
    
    // Se o mestre iniciou o jogo E ainda não processamos
    if (status === 'playing' && !this.isMaster && !this.jogoIniciadoParaJogador) {
        console.log('🎮 Jogo iniciado pelo mestre!');
        this.jogoIniciadoParaJogador = true;
        
        // Ir para tela do jogo com delay
        setTimeout(() => {
            if (window.authSystem) {
                console.log('✅ Indo para tela do jogo...');
                window.authSystem.showGameScreen();
                
                // Buscar dados do jogo
                this.fetchGameDataFromFirebase();
                
                // Mostrar alerta APENAS UMA VEZ
                if (!this.alertaMostrado) {
                    this.alertaMostrado = true;
                    setTimeout(() => {
                        alert('🎮 O mestre iniciou o jogo!\n\nSincronizando dados...');
                    }, 500);
                }
            }
        }, 1000);
    }
};

RoomSystem.prototype.fetchGameDataFromFirebase = async function() {
    console.log('📥 BUSCANDO DADOS DO JOGO...');
    
    if (!this.currentRoom) {
        console.error('❌ Sem sala ativa');
        return;
    }
    
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        
        // BUSCAR PERGUNTAS
        console.log('🔍 Buscando perguntas...');
        const questionsSnap = await roomRef.child('gameData/questions').once('value');
        
        if (questionsSnap.exists()) {
            window.questions = questionsSnap.val();
            console.log('✅ PERGUNTAS RECEBIDAS:', window.questions.length);
        } else {
            console.error('❌ NENHUMA PERGUNTA ENCONTRADA');
            window.questions = [];
            return;
        }
        
        // BUSCAR EQUIPES
        console.log('🔍 Buscando equipes...');
        const teamsSnap = await roomRef.child('gameData/teams').once('value');
        
        if (teamsSnap.exists()) {
            window.teams = teamsSnap.val();
            console.log('✅ EQUIPES RECEBIDAS:', window.teams.length);
            
            // CORREÇÃO: Garantir que cada equipe tenha estrutura correta
            window.teams = window.teams.map((team, index) => {
                return {
                    id: team.id || index + 1,
                    name: team.name || `Equipe ${index + 1}`,
                    players: team.players || [],
                    score: team.score || 0,
                    questionsAnswered: team.questionsAnswered || 0,
                    questionsWrong: team.questionsWrong || 0,
                    colorClass: team.colorClass || `team-bg-${(index % 10) + 1}`,
                    turnColorClass: team.turnColorClass || `team-color-${(index % 10) + 1}`,
                    colorName: team.colorName || window.teamColorSchemes[index % window.teamColorSchemes.length]?.name || 'Padrão'
                };
            });
        } else {
            console.error('❌ NENHUMA EQUIPE ENCONTRADA');
            window.teams = [];
            return;
        }
        
        // INICIAR JOGO PARA JOGADOR
        this.startGameForPlayer();
        
    } catch (error) {
        console.error('❌ ERRO ao buscar dados:', error);
        this.showDataError();
    }
};

RoomSystem.prototype.startGameForPlayer = function() {
    console.log('🚀 INICIANDO JOGO PARA JOGADOR...');
    
    // Configurar estado do jogo
    window.currentQuestionIndex = 0;
    window.currentTeamIndex = 0;
    window.gameStarted = true;
    window.winnerTeam = null;
    
    console.log('📊 Dados recebidos:');
    console.log('- Perguntas:', window.questions.length);
    console.log('- Equipes:', window.teams.length);
    console.log('- Equipe atual:', window.teams[0]?.name);
    
    // Atualizar interface
    setTimeout(() => {
        // Atualizar contador de perguntas
        const questionNumber = document.getElementById('question-number');
        const totalQuestions = document.getElementById('total-questions');
        if (questionNumber) questionNumber.textContent = '1';
        if (totalQuestions) totalQuestions.textContent = window.questions.length;
        
        // Atualizar display das equipes
        if (window.updateTeamsDisplay) {
            window.updateTeamsDisplay();
        } else {
            console.error('❌ updateTeamsDisplay não disponível');
            // Fallback manual
            this.updateTeamsDisplayFallback();
        }
        
        // Mostrar primeira pergunta
        if (window.showQuestion) {
            setTimeout(() => {
                window.showQuestion();
            }, 500);
        } else {
            console.error('❌ showQuestion não disponível');
            // Fallback manual
            this.showQuestionFallback();
        }
        
        console.log('✅ Jogo iniciado para jogador');
        
    }, 500);
};

RoomSystem.prototype.updateTeamsDisplayFallback = function() {
    const teamsDisplay = document.getElementById('teams-display');
    const activeTeamDisplay = document.getElementById('active-team-display');
    
    if (!teamsDisplay || !activeTeamDisplay) return;
    
    // Limpar
    teamsDisplay.innerHTML = '';
    activeTeamDisplay.innerHTML = '';
    
    // Equipe ativa
    if (window.teams[0]) {
        const team = window.teams[0];
        const card = document.createElement('div');
        card.className = 'team-card active';
        card.innerHTML = `
            <div class="team-card-header">
                <div class="team-info-left">
                    <div class="team-name">${team.name}</div>
                    <div class="team-players">
                        ${team.players && team.players.length > 0 ? 
                          team.players.map(p => `<div class="player-name">${p}</div>`).join('') : 
                          '<div class="no-players">Sem jogadores</div>'}
                    </div>
                </div>
                <div class="team-info-right">
                    <div class="team-score">${team.score || 0}</div>
                </div>
            </div>
        `;
        activeTeamDisplay.appendChild(card);
    }
    
    // Atualizar turno
    const teamTurn = document.getElementById('team-turn');
    if (teamTurn && window.teams[0]) {
        teamTurn.textContent = `🎯 ${window.teams[0].name} - DE PLANTÃO`;
    }
};

RoomSystem.prototype.showQuestionFallback = function() {
    const questionText = document.getElementById('question-text');
    if (questionText && window.questions[0]) {
        questionText.textContent = window.questions[0].enunciado || 'Pergunta recebida do mestre';
    }
};

RoomSystem.prototype.showDataError = function() {
    const questionText = document.getElementById('question-text');
    if (questionText) {
        questionText.textContent = '❌ Erro ao carregar dados. Recarregue a página.';
    }
};

// Funções de UI (manter)
RoomSystem.prototype.updatePlayersList = function() {
    const playersList = document.getElementById('players-list');
    if (!playersList) return;
    
    let html = '<h4>👥 Jogadores:</h4>';
    let playerCount = 0;
    
    const players = this.players || {};
    Object.values(players).forEach(player => {
        if (player.connected) {
            playerCount++;
            html += `
                <div class="player-item ${player.isMaster ? 'master' : ''}">
                    <span class="player-icon">${player.avatar || '👤'}</span>
                    <span class="player-name">${player.name || 'Jogador'}</span>
                    <span class="player-score">${player.score || 0} pts</span>
                </div>
            `;
        }
    });
    
    if (playerCount === 0) {
        html += '<div class="no-players">Nenhum jogador</div>';
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
    
    const statusInfo = statusMap[status] || { text: '❓', color: '#dc3545', icon: '❓' };
    statusElement.textContent = `${statusInfo.icon} ${statusInfo.text}`;
    statusElement.style.color = statusInfo.color;
};

console.log('✅ listeners.js carregado!');