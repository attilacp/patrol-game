// js/rooms/listeners.js - VERSÃO CORRIGIDA COM SINCRONIZAÇÃO DE RECORRÊNCIA
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
        
        // 2. LISTENER para gameData (CRÍTICO PARA SINCRONIZAÇÃO)
        const gameDataListener = roomRef.child('gameData').on('value', (snapshot) => {
            const gameData = snapshot.val();
            if (gameData) {
                console.log('📥 GameData recebido do Firebase');
                this.syncGameDataFromFirebase(gameData);
            }
        });
        this.roomListeners.push({ ref: roomRef.child('gameData'), listener: gameDataListener });
        
        // 3. LISTENER para turno atual
        const turnListener = roomRef.child('currentTurn').on('value', (snapshot) => {
            const turnData = snapshot.val();
            if (turnData) {
                console.log('🎯 Turno recebido:', turnData.teamName);
                this.handleTurnFromFirebase(turnData);
            }
        });
        this.roomListeners.push({ ref: roomRef.child('currentTurn'), listener: turnListener });
        
        // 4. LISTENER para pergunta atual
        const questionListener = roomRef.child('currentQuestion').on('value', (snapshot) => {
            const questionData = snapshot.val();
            if (questionData) {
                console.log('📚 Pergunta recebida:', questionData.index + 1);
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

RoomSystem.prototype.syncGameDataFromFirebase = function(gameData) {
    console.log('🔄 Sincronizando gameData...');
    
    // SINCRONIZAR PERGUNTAS (JÁ COM RECORRÊNCIA APLICADA)
    if (gameData.questions && Array.isArray(gameData.questions)) {
        window.questions = [...gameData.questions];
        console.log('✅ Perguntas sincronizadas (com recorrência):', window.questions.length);
        
        // Verificar metadados de recorrência
        if (gameData.recurrenceInfo) {
            console.log('📊 Metadados de recorrência:', gameData.recurrenceInfo);
            let totalExpected = 0;
            for (const subject in gameData.recurrenceInfo) {
                totalExpected += gameData.recurrenceInfo[subject].finalCount;
            }
            console.log('📈 Total esperado (com recorrência):', totalExpected);
        }
    }
    
    // SINCRONIZAR EQUIPES
    if (gameData.teams && Array.isArray(gameData.teams)) {
        window.teams = gameData.teams.map((team, index) => ({
            id: team.id || index + 1,
            name: team.name || `Equipe ${index + 1}`,
            players: Array.isArray(team.players) ? team.players : [],
            score: team.score || 0,
            colorClass: team.colorClass || `team-bg-${(index % 10) + 1}`,
            turnColorClass: team.turnColorClass || `team-color-${(index % 10) + 1}`
        }));
        console.log('✅ Equipes sincronizadas:', window.teams.length);
    }
    
    // APLICAR ORDEM DO FIREBASE
    if (gameData.order && gameData.order.questions) {
        this.applyFirebaseOrder(gameData.order);
    }
    
    // ATRIBUIR JOGADOR À EQUIPE AUTOMATICAMENTE
    this.assignPlayerToTeam();
    
    // Atualizar interface
    if (window.updateTeamsDisplay) {
        window.updateTeamsDisplay();
    }
};

RoomSystem.prototype.assignPlayerToTeam = function() {
    if (!window.teams || window.teams.length === 0) return;
    
    // Se já tiver equipe, manter
    if (this.playerTeamId) {
        console.log('👤 Jogador já tem equipe:', this.playerTeamId);
        return;
    }
    
    // Distribuir jogadores igualmente entre as equipes
    this.getAssignedPlayers().then(assignedPlayers => {
        const playerCounts = {};
        window.teams.forEach(team => {
            playerCounts[team.id] = assignedPlayers.filter(p => p.teamId === team.id).length;
        });
        
        console.log('📊 Distribuição atual:', playerCounts);
        
        // Encontrar equipe com menos jogadores
        let minCount = Infinity;
        let targetTeamId = null;
        
        for (const teamId in playerCounts) {
            if (playerCounts[teamId] < minCount) {
                minCount = playerCounts[teamId];
                targetTeamId = parseInt(teamId);
            }
        }
        
        // Se todas iguais ou limite atingido, usar round-robin
        if (!targetTeamId || minCount >= 5) {
            const availableTeams = window.teams.filter(team => playerCounts[team.id] < 5);
            if (availableTeams.length > 0) {
                targetTeamId = availableTeams[Math.floor(Math.random() * availableTeams.length)].id;
            } else {
                targetTeamId = window.teams[0].id; // Forçar primeira equipe
            }
        }
        
        // Atribuir jogador
        this.playerTeamId = targetTeamId;
        const team = window.teams.find(t => t.id === targetTeamId);
        
        console.log(`👤 Jogador atribuído à equipe: ${team.name} (ID: ${targetTeamId})`);
        
        // Salvar no Firebase
        this.savePlayerTeamAssignment(targetTeamId, team.name);
        
        // Atualizar sistema de turnos
        if (window.turnSystem) {
            window.turnSystem.playerTeam = team;
            console.log('✅ Equipe atribuída ao sistema de turnos');
        }
        
        // Mostrar notificação
        this.showNotification(`🎯 Você foi atribuído à equipe: ${team.name}`);
    });
};

RoomSystem.prototype.getAssignedPlayers = async function() {
    if (!this.currentRoom) return [];
    
    try {
        const playersRef = firebase.database().ref('rooms/' + this.currentRoom + '/players');
        const snapshot = await playersRef.once('value');
        const players = snapshot.val() || {};
        
        const assigned = [];
        for (const playerId in players) {
            if (players[playerId].teamId) {
                assigned.push({
                    playerId: playerId,
                    teamId: players[playerId].teamId,
                    playerName: players[playerId].name
                });
            }
        }
        
        console.log('👥 Jogadores já atribuídos:', assigned.length);
        return assigned;
    } catch (error) {
        console.error('❌ Erro ao buscar jogadores:', error);
        return [];
    }
};

RoomSystem.prototype.savePlayerTeamAssignment = function(teamId, teamName) {
    if (!this.currentRoom) return;
    
    firebase.database().ref('rooms/' + this.currentRoom + '/players/' + this.playerId)
        .update({ 
            teamId: teamId,
            teamName: teamName,
            assignedAt: Date.now()
        });
    
    console.log(`💾 Equipe ${teamName} salva no Firebase para jogador`);
};

RoomSystem.prototype.applyFirebaseOrder = function(orderData) {
    console.log('🔄 Aplicando ordem do Firebase:', orderData.isRandom ? 'ALEATÓRIA' : 'NORMAL');
    
    if (orderData.isRandom && window.questions) {
        const originalQuestions = [...window.questions];
        const reorderedQuestions = [];
        
        orderData.questions.forEach(originalIndex => {
            if (originalQuestions[originalIndex]) {
                reorderedQuestions.push(originalQuestions[originalIndex]);
            }
        });
        
        if (reorderedQuestions.length === window.questions.length) {
            window.questions = reorderedQuestions;
            console.log('✅ Perguntas reordenadas conforme Firebase');
        }
    }
    
    if (orderData.teams && window.teams) {
        const originalTeams = [...window.teams];
        const reorderedTeams = [];
        
        orderData.teams.forEach(teamId => {
            const team = originalTeams.find(t => t.id === teamId);
            if (team) {
                reorderedTeams.push(team);
            }
        });
        
        if (reorderedTeams.length === window.teams.length) {
            window.teams = reorderedTeams;
            console.log('✅ Equipes reordenadas conforme Firebase');
        }
    }
};

RoomSystem.prototype.loadInitialRoomData = async function() {
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        const snapshot = await roomRef.once('value');
        const roomData = snapshot.val();
        
        if (roomData) {
            console.log('📡 Dados iniciais carregados');
            
            // Status
            if (roomData.status) {
                this.updateRoomStatus(roomData.status);
                this.lastStatus = roomData.status;
                
                // Se já estiver playing, buscar dados
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

RoomSystem.prototype.handleStatusChange = function(status) {
    console.log('📊 Status mudou:', status);
    
    if (status === 'playing' && !this.isMaster) {
        console.log('🎮 Jogo iniciado pelo mestre!');
        
        setTimeout(() => {
            if (window.authSystem) {
                console.log('✅ Indo para tela do jogo...');
                window.authSystem.showGameScreen();
            }
        }, 1000);
    }
};

RoomSystem.prototype.handleTurnFromFirebase = function(turnData) {
    if (!turnData) return;
    
    // Atualizar estado local
    window.currentTeamIndex = turnData.teamIndex || 0;
    window.currentQuestionIndex = turnData.questionIndex || 0;
    
    console.log(`🎯 Turno: ${turnData.teamName} - Pergunta ${turnData.questionIndex + 1}`);
    
    // Atualizar interface
    this.updateTurnUI(turnData);
    
    // Se for a equipe do jogador, habilitar botões
    this.updatePlayerControls();
};

RoomSystem.prototype.updatePlayerControls = function() {
    if (!window.turnSystem || !this.playerTeamId) return;
    
    const canAnswer = window.turnSystem.canPlayerAnswer?.();
    const certoBtn = document.getElementById('certo-btn');
    const erradoBtn = document.getElementById('errado-btn');
    
    if (certoBtn && erradoBtn) {
        if (canAnswer) {
            certoBtn.disabled = false;
            erradoBtn.disabled = false;
            certoBtn.style.opacity = '1';
            erradoBtn.style.opacity = '1';
            certoBtn.title = 'Sua vez de responder!';
            erradoBtn.title = 'Sua vez de responder!';
        } else {
            certoBtn.disabled = true;
            erradoBtn.disabled = true;
            certoBtn.style.opacity = '0.5';
            erradoBtn.style.opacity = '0.5';
            certoBtn.title = 'Aguarde sua equipe estar de plantão';
            erradoBtn.title = 'Aguarde sua equipe estar de plantão';
        }
    }
};

RoomSystem.prototype.handleQuestionFromFirebase = function(questionData) {
    if (questionData.index !== undefined) {
        window.currentQuestionIndex = questionData.index;
    }
    
    // Mostrar pergunta atual
    setTimeout(() => {
        if (window.showQuestion) {
            window.showQuestion();
        }
        
        // Atualizar contadores
        const questionNumber = document.getElementById('question-number');
        const totalQuestions = document.getElementById('total-questions');
        if (questionNumber) questionNumber.textContent = (window.currentQuestionIndex + 1) || 1;
        if (totalQuestions && window.questions) totalQuestions.textContent = window.questions.length;
    }, 300);
};

RoomSystem.prototype.updateTurnUI = function(turnData) {
    const teamTurnElement = document.getElementById('team-turn');
    if (teamTurnElement && turnData.teamName) {
        teamTurnElement.textContent = `🎯 ${turnData.teamName} - DE PLANTÃO`;
        
        // Aplicar cor da equipe
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
    
    // Criar notificação na tela
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white; padding: 15px 20px; border-radius: 5px;
        z-index: 9999; box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
};

console.log('✅ listeners.js corrigido!');