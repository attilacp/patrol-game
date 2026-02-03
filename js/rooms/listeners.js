// js/rooms/listeners.js - VERSÃO COMPLETA CORRIGIDA
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
        
        // Mostrar alerta APENAS UMA VEZ
        if (!this.alertaMostrado) {
            this.alertaMostrado = true;
            setTimeout(() => {
                alert('🎮 O mestre iniciou o jogo!\n\nSincronizando dados...');
            }, 500);
        }
        
        // Ir para tela do jogo com delay
        setTimeout(() => {
            if (window.authSystem) {
                console.log('✅ Indo para tela do jogo...');
                window.authSystem.showGameScreen();
                
                // Buscar dados do jogo
                this.fetchGameDataFromFirebase();
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
                    colorName: team.colorName || window.teamColorSchemes?.[index % window.teamColorSchemes?.length]?.name || 'Padrão',
                    performanceBySubject: team.performanceBySubject || {},
                    questionsBySubject: team.questionsBySubject || {}
                };
            });
        } else {
            console.error('❌ NENHUMA EQUIPE ENCONTRADA');
            window.teams = [];
            return;
        }
        
        // APLICAR ORDEM DO FIREBASE (CRÍTICO PARA SINCRONIZAÇÃO)
        await this.applyFirebaseOrder();
        
        // INICIAR JOGO PARA JOGADOR
        this.startGameForPlayer();
        
    } catch (error) {
        console.error('❌ ERRO ao buscar dados:', error);
        this.showDataError();
    }
};

RoomSystem.prototype.applyFirebaseOrder = async function() {
    if (!this.currentRoom) return;
    
    try {
        const orderRef = firebase.database().ref('rooms/' + this.currentRoom + '/gameData/order');
        const orderSnap = await orderRef.once('value');
        
        if (orderSnap.exists()) {
            const orderData = orderSnap.val();
            console.log('🔄 Aplicando ordem do Firebase:', orderData.isRandom ? 'ALEATÓRIA' : 'SEQUENCIAL');
            
            // Reordenar perguntas conforme salvo no Firebase
            if (orderData.questions && window.questions && window.questions.length > 0) {
                const originalQuestions = [...window.questions];
                const reorderedQuestions = [];
                
                // orderData.questions contém os índices na ordem correta
                orderData.questions.forEach(originalIndex => {
                    if (originalQuestions[originalIndex]) {
                        reorderedQuestions.push(originalQuestions[originalIndex]);
                    }
                });
                
                // Se o array resultante tem o mesmo tamanho, aplicar
                if (reorderedQuestions.length === window.questions.length) {
                    window.questions = reorderedQuestions;
                    console.log('✅ Perguntas reordenadas conforme Firebase');
                } else {
                    console.warn('⚠️ Tamanho diferente, mantendo ordem original');
                }
            }
            
            // Reordenar equipes conforme salvo no Firebase
            if (orderData.teams && window.teams && window.teams.length > 0) {
                const teamMap = {};
                window.teams.forEach(team => {
                    teamMap[team.id] = team;
                });
                
                const reorderedTeams = [];
                orderData.teams.forEach(teamId => {
                    if (teamMap[teamId]) {
                        reorderedTeams.push(teamMap[teamId]);
                    }
                });
                
                // Aplicar se o tamanho for igual
                if (reorderedTeams.length === window.teams.length) {
                    window.teams = reorderedTeams;
                    console.log('✅ Equipes reordenadas conforme Firebase');
                }
            }
        } else {
            console.log('ℹ️ Nenhuma ordem específica no Firebase, usando ordem recebida');
        }
    } catch (error) {
        console.error('❌ Erro ao aplicar ordem:', error);
    }
};

RoomSystem.prototype.startGameForPlayer = function() {
    console.log('🚀 INICIANDO JOGO PARA JOGADOR...');
    
    // Configurar estado do jogo
    window.currentQuestionIndex = 0;
    window.currentTeamIndex = 0;
    window.gameStarted = true;
    window.winnerTeam = null;
    window.consecutiveCorrect = 0;
    window.currentQuestionAnswered = false;
    window.keyboardEnabled = true;
    
    console.log('📊 Dados recebidos:');
    console.log('- Perguntas:', window.questions.length);
    console.log('- Equipes:', window.teams.length);
    if (window.teams[0]) {
        console.log('- Primeira equipe:', window.teams[0].name);
    }
    
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
        
        // Inicializar sistema de turnos se disponível
        if (window.turnSystem) {
            console.log('✅ Sistema de turnos ativo para jogador');
            
            // Jogador precisa ouvir mudanças de turno do mestre
            // O turn-system.js já configura isso automaticamente
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
        teamTurn.className = 'team-turn ' + (window.teams[0].turnColorClass || 'team-color-1');
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