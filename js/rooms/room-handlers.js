// js/rooms/room-handlers.js - MANIPULAÇÃO DE EVENTOS (COMPLETO)
console.log('🏠 rooms/room-handlers.js carregando...');

RoomSystem.prototype.handleStatusChange = function(status) {
    console.log('📊 Status mudou:', status);
    
    if (status === 'playing' && !this.isMaster) {
        console.log('🎮 MESTRE iniciou o jogo! Sincronizando automaticamente...');
        this.jogoIniciadoParaJogador = true;
        
        // SINCRONIZAÇÃO AUTOMÁTICA
        setTimeout(() => {
            // 1. Buscar dados do jogo
            this.fetchGameDataFromFirebase();
            
            // 2. Configurar sincronização
            if (this.setupGameSync) {
                this.setupGameSync();
            }
            
            // 3. Ir para tela do jogo AUTOMATICAMENTE
            if (window.authSystem && window.authSystem.showGameScreen) {
                console.log('✅ Indo para tela do jogo automaticamente...');
                window.authSystem.showGameScreen();
            }
            
            // 4. Mostrar notificação
            if (!this.alertaMostrado) {
                this.alertaMostrado = true;
                this.showNotification('🎮 Jogo iniciado pelo mestre! Sincronizando...', 'success');
            }
        }, 800);
    }
};

RoomSystem.prototype.handleTurnFromFirebase = function(turnData) {
    console.log('🔄 Processando turno do Firebase:', turnData);
    
    // Atualizar índices globais
    window.currentTeamIndex = turnData.teamIndex || 0;
    window.currentQuestionIndex = turnData.questionIndex || 0;
    
    // Atualizar UI (função do RoomSystem)
    this.updateTurnUI(turnData);
};

RoomSystem.prototype.updateTurnUI = function(turnData) {
    console.log('🔄 Atualizando UI do turno:', turnData.teamName);
    
    const teamTurnElement = document.getElementById('team-turn');
    if (!teamTurnElement) return;
    
    if (turnData.teamName) {
        teamTurnElement.textContent = `🎯 ${turnData.teamName} - DE PLANTÃO`;
        
        // Tentar aplicar cor da equipe
        if (window.teams && window.teams[turnData.teamIndex]) {
            const team = window.teams[turnData.teamIndex];
            teamTurnElement.className = 'team-turn ' + (team.turnColorClass || 'team-color-1');
        }
    }
};

RoomSystem.prototype.handleQuestionFromFirebase = function(questionData) {
    console.log('📚 Processando pergunta do Firebase:', questionData);
    
    if (questionData.index !== undefined) {
        window.currentQuestionIndex = questionData.index;
    }
    
    setTimeout(() => {
        if (window.showQuestion) window.showQuestion();
        
        const questionNumber = document.getElementById('question-number');
        const totalQuestions = document.getElementById('total-questions');
        if (questionNumber) questionNumber.textContent = (window.currentQuestionIndex + 1) || 1;
        if (totalQuestions && window.questions) totalQuestions.textContent = window.questions.length;
    }, 300);
};

RoomSystem.prototype.fetchGameDataFromFirebase = async function() {
    console.log('📥 BUSCANDO DADOS...');
    
    if (!this.currentRoom) return;
    
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        
        const questionsSnap = await roomRef.child('gameData/questions').once('value');
        if (questionsSnap.exists()) {
            window.questions = questionsSnap.val();
            console.log('✅ Perguntas:', window.questions.length);
        } else {
            console.error('❌ Nenhuma pergunta');
            return;
        }
        
        const teamsSnap = await roomRef.child('gameData/teams').once('value');
        if (teamsSnap.exists()) {
            window.teams = teamsSnap.val();
            console.log('✅ Equipes:', window.teams.length);
            
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
        
        await this.applyFirebaseOrder();
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
    
    console.log('✅ Jogador pronto (aguardando sincronização)');
};

RoomSystem.prototype.showDataError = function() {
    const questionText = document.getElementById('question-text');
    if (questionText) {
        questionText.textContent = '❌ Erro ao carregar. Recarregue.';
    }
};

RoomSystem.prototype.setupRoomListeners = function() {
    if (!this.currentRoom) return;
    
    console.log('👂 Configurando listeners da sala:', this.currentRoom);
    
    this.cleanupAllListeners();
    
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        
        // Status da sala
        const statusListener = roomRef.child('status').on('value', (snapshot) => {
            const status = snapshot.val();
            if (status && status !== this.lastStatus) {
                console.log('🔄 Status mudou para:', status);
                this.lastStatus = status;
                this.handleStatusChange(status);
            }
        });
        this.roomListeners.push({ ref: roomRef.child('status'), listener: statusListener });
        
        // Dados do jogo
        const gameDataListener = roomRef.child('gameData').on('value', (snapshot) => {
            const gameData = snapshot.val();
            if (gameData) {
                console.log('📥 GameData recebido do Firebase');
                this.syncGameDataFromFirebase(gameData);
            }
        });
        this.roomListeners.push({ ref: roomRef.child('gameData'), listener: gameDataListener });
        
        // Turno atual
        const turnListener = roomRef.child('currentTurn').on('value', (snapshot) => {
            const turnData = snapshot.val();
            if (turnData) {
                console.log('🎯 Turno recebido:', turnData.teamName);
                this.handleTurnFromFirebase(turnData);
            }
        });
        this.roomListeners.push({ ref: roomRef.child('currentTurn'), listener: turnListener });
        
        // Pergunta atual
        const questionListener = roomRef.child('currentQuestion').on('value', (snapshot) => {
            const questionData = snapshot.val();
            if (questionData) {
                console.log('📚 Pergunta recebida:', questionData.index + 1);
                this.handleQuestionFromFirebase(questionData);
            }
        });
        this.roomListeners.push({ ref: roomRef.child('currentQuestion'), listener: questionListener });
        
        // Resultados de respostas
        const answerResultListener = roomRef.child('answerResult').on('value', (snapshot) => {
            const resultData = snapshot.val();
            if (resultData) {
                console.log('✅ Resultado de resposta recebido');
                if (typeof this.syncAnswerResult === 'function') {
                    this.syncAnswerResult(resultData);
                }
            }
        });
        this.roomListeners.push({ ref: roomRef.child('answerResult'), listener: answerResultListener });
        
        // Sincronização de jogo
        const gameSyncListener = roomRef.child('gameSync').on('value', (snapshot) => {
            const syncData = snapshot.val();
            if (syncData) {
                console.log('🔄 Dados de sincronização recebidos');
                if (typeof this.handleGameSync === 'function') {
                    this.handleGameSync(syncData);
                }
            }
        });
        this.roomListeners.push({ ref: roomRef.child('gameSync'), listener: gameSyncListener });
        
        // Respostas dos jogadores (apenas para mestre)
        if (this.isMaster) {
            const playerAnswersListener = roomRef.child('playerAnswers').on('child_added', (snapshot) => {
                const answerData = snapshot.val();
                if (answerData && answerData.playerId !== this.playerId) {
                    console.log('📥 Resposta de jogador recebida:', answerData.playerName);
                    if (typeof this.handlePlayerAnswer === 'function') {
                        this.handlePlayerAnswer(answerData);
                    }
                }
            });
            this.roomListeners.push({ ref: roomRef.child('playerAnswers'), listener: playerAnswersListener });
        }
        
        this.loadInitialRoomData();
        
        console.log('✅ Todos os listeners configurados');
        
    } catch (error) {
        console.error('❌ Erro ao configurar listeners:', error);
    }
};

RoomSystem.prototype.cleanupAllListeners = function() {
    this.roomListeners.forEach(item => {
        if (item.ref && item.listener) {
            if (item.ref.off) {
                item.ref.off('value', item.listener);
            } else if (item.ref.off && typeof item.ref.off === 'function') {
                item.ref.off('child_added', item.listener);
            }
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
            console.log('📡 Dados iniciais carregados');
            
            if (roomData.status) {
                this.updateRoomStatus(roomData.status);
                this.lastStatus = roomData.status;
                
                if (roomData.status === 'playing' && !this.isMaster) {
                    console.log('🎮 Jogo em andamento - sincronizando...');
                    this.syncGameDataFromFirebase(roomData.gameData || {});
                }
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
    }
};

console.log('✅ rooms/room-handlers.js carregado!');