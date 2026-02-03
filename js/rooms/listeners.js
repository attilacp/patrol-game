// js/rooms/listeners.js - VERSÃO CORRIGIDA
console.log('🏠 rooms/listeners.js carregando...');

RoomSystem.prototype.setupRoomListeners = function() {
    if (!this.currentRoom) return;
    
    console.log('👂 Configurando listeners da sala:', this.currentRoom);
    
    this.cleanupAllListeners();
    
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        
        // 1. LISTENER para status
        const statusListener = roomRef.child('status').on('value', (snapshot) => {
            const status = snapshot.val();
            if (status && status !== this.lastStatus) {
                console.log('🔄 Status mudou para:', status);
                this.lastStatus = status;
                this.handleStatusChange(status);
            }
        });
        this.roomListeners.push({ ref: roomRef.child('status'), listener: statusListener });
        
        // 2. LISTENER para turno atual (CRÍTICO)
        const turnListener = roomRef.child('currentTurn').on('value', (snapshot) => {
            const turnData = snapshot.val();
            if (turnData) {
                console.log('🎯 Turno recebido do Firebase:', turnData.teamName);
                this.handleTurnFromFirebase(turnData);
            }
        });
        this.roomListeners.push({ ref: roomRef.child('currentTurn'), listener: turnListener });
        
        // 3. LISTENER para pergunta atual
        const questionListener = roomRef.child('currentQuestion').on('value', (snapshot) => {
            const questionData = snapshot.val();
            if (questionData) {
                console.log('📚 Pergunta recebida do Firebase:', questionData.index + 1);
                this.handleQuestionFromFirebase(questionData);
            }
        });
        this.roomListeners.push({ ref: roomRef.child('currentQuestion'), listener: questionListener });
        
        this.loadInitialRoomData();
        
        console.log('✅ Listeners configurados');
        
    } catch (error) {
        console.error('❌ Erro ao configurar listeners:', error);
    }
};

RoomSystem.prototype.cleanupAllListeners = function() {
    this.roomListeners.forEach(item => {
        if (item.ref && item.listener) {
            item.ref.off('value', item.listener);
        }
    });
    this.roomListeners = [];
    
    this.lastStatus = null;
    this.jogoIniciadoParaJogador = false;
    this.alertaMostrado = false;
};

RoomSystem.prototype.loadInitialRoomData = async function() {
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        const snapshot = await roomRef.once('value');
        const roomData = snapshot.val();
        
        if (roomData) {
            console.log('📡 Dados iniciais:', roomData.status);
            
            // Jogadores
            if (roomData.players) {
                this.players = roomData.players;
                this.updatePlayersList();
            }
            
            // Status
            if (roomData.status) {
                this.updateRoomStatus(roomData.status);
                this.lastStatus = roomData.status;
                
                // Se já estiver playing, buscar dados
                if (roomData.status === 'playing' && !this.isMaster) {
                    console.log('🎮 Jogo em andamento - buscando dados...');
                    await this.fetchGameDataFromFirebase();
                }
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados iniciais:', error);
    }
};

RoomSystem.prototype.handleStatusChange = function(status) {
    console.log('📊 Status mudou:', status);
    
    if (status === 'playing' && !this.isMaster && !this.jogoIniciadoParaJogador) {
        console.log('🎮 Jogo iniciado pelo mestre!');
        this.jogoIniciadoParaJogador = true;
        
        if (!this.alertaMostrado) {
            this.alertaMostrado = true;
            setTimeout(() => {
                alert('🎮 O mestre iniciou o jogo!\n\nSincronizando...');
            }, 500);
        }
        
        setTimeout(() => {
            if (window.authSystem) {
                console.log('✅ Indo para tela do jogo...');
                window.authSystem.showGameScreen();
                
                // Buscar dados
                this.fetchGameDataFromFirebase();
            }
        }, 1000);
    }
};

RoomSystem.prototype.handleTurnFromFirebase = function(turnData) {
    console.log('🔄 Processando turno do Firebase:', turnData);
    
    // Atualizar estado local
    window.currentTeamIndex = turnData.teamIndex || 0;
    window.currentQuestionIndex = turnData.questionIndex || 0;
    
    // Atualizar interface
    this.updateTurnUI(turnData);
};

RoomSystem.prototype.handleQuestionFromFirebase = function(questionData) {
    console.log('📚 Processando pergunta do Firebase:', questionData);
    
    // Atualizar índice
    if (questionData.index !== undefined) {
        window.currentQuestionIndex = questionData.index;
    }
    
    // Mostrar pergunta
    setTimeout(() => {
        if (window.showQuestion) {
            window.showQuestion();
        }
        
        // Atualizar contador
        const questionNumber = document.getElementById('question-number');
        const totalQuestions = document.getElementById('total-questions');
        if (questionNumber) questionNumber.textContent = (window.currentQuestionIndex + 1) || 1;
        if (totalQuestions && window.questions) totalQuestions.textContent = window.questions.length;
    }, 300);
};

RoomSystem.prototype.updateTurnUI = function(turnData) {
    // Atualizar equipe de plantão
    const teamTurnElement = document.getElementById('team-turn');
    if (teamTurnElement && turnData.teamName) {
        teamTurnElement.textContent = `🎯 ${turnData.teamName} - DE PLANTÃO`;
        
        // Aplicar cor
        const currentTeam = window.teams?.[window.currentTeamIndex];
        if (currentTeam && currentTeam.turnColorClass) {
            teamTurnElement.className = 'team-turn ' + currentTeam.turnColorClass;
        }
    }
    
    // Atualizar display das equipes
    if (window.updateTeamsDisplay) {
        window.updateTeamsDisplay();
    }
};

RoomSystem.prototype.fetchGameDataFromFirebase = async function() {
    console.log('📥 BUSCANDO DADOS...');
    
    if (!this.currentRoom) return;
    
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        
        // PERGUNTAS
        const questionsSnap = await roomRef.child('gameData/questions').once('value');
        if (questionsSnap.exists()) {
            window.questions = questionsSnap.val();
            console.log('✅ Perguntas:', window.questions.length);
        } else {
            console.error('❌ Nenhuma pergunta');
            return;
        }
        
        // EQUIPES
        const teamsSnap = await roomRef.child('gameData/teams').once('value');
        if (teamsSnap.exists()) {
            window.teams = teamsSnap.val();
            console.log('✅ Equipes:', window.teams.length);
            
            // Corrigir estrutura
            window.teams = window.teams.map((team, index) => ({
                id: team.id || index + 1,
                name: team.name || `Equipe ${index + 1}`,
                players: team.players || [],
                score: team.score || 0,
                colorClass: team.colorClass || `team-bg-${(index % 10) + 1}`,
                turnColorClass: team.turnColorClass || `team-color-${(index % 10) + 1}`
            }));
        } else {
            console.error('❌ Nenhuma equipe');
            return;
        }
        
        // ORDEM
        await this.applyFirebaseOrder();
        
        // INICIAR JOGADOR
        this.startGameForPlayer();
        
    } catch (error) {
        console.error('❌ Erro:', error);
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
            console.log('🔄 Ordem:', orderData.isRandom ? 'ALEATÓRIA' : 'NORMAL');
            
            if (orderData.questions && window.questions) {
                const originalQuestions = [...window.questions];
                const reorderedQuestions = [];
                
                orderData.questions.forEach(originalIndex => {
                    if (originalQuestions[originalIndex]) {
                        reorderedQuestions.push(originalQuestions[originalIndex]);
                    }
                });
                
                if (reorderedQuestions.length === window.questions.length) {
                    window.questions = reorderedQuestions;
                    console.log('✅ Perguntas reordenadas');
                }
            }
        }
    } catch (error) {
        console.error('❌ Erro na ordem:', error);
    }
};

RoomSystem.prototype.startGameForPlayer = function() {
    console.log('🚀 Iniciando jogador...');
    
    window.currentQuestionIndex = 0;
    window.currentTeamIndex = 0;
    window.gameStarted = true;
    
    console.log('📊 Dados prontos:', {
        perguntas: window.questions?.length,
        equipes: window.teams?.length
    });
    
    // NÃO mostrar pergunta ainda - aguardar Firebase
    
    // Atribuir jogador à primeira equipe (temporário)
    if (window.turnSystem && window.teams && window.teams.length > 0) {
        setTimeout(() => {
            window.turnSystem.selectPlayerTeam(0); // Atribuir à equipe 0
        }, 1000);
    }
    
    console.log('✅ Jogador pronto (aguardando sincronização)');
};

RoomSystem.prototype.showDataError = function() {
    const questionText = document.getElementById('question-text');
    if (questionText) {
        questionText.textContent = '❌ Erro ao carregar. Recarregue.';
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

console.log('✅ listeners.js carregado!');