// PATROL - Sistema de Salas (Multiplayer)
console.log('🏠 Rooms carregando...');

class RoomSystem {
    constructor() {
        this.currentRoom = null;
        this.isMaster = false;
        this.playerId = this.generatePlayerId();
        this.playerName = 'Aguardando...';
        this.playerTeamId = null;
        this.players = {};
        this.listeners = [];
    }
    
    init() {
        this.setupEventListeners();
        console.log('✅ RoomSystem inicializado');
    }
    
    generatePlayerId() {
        if (firebase.auth().currentUser) {
            return firebase.auth().currentUser.uid;
        }
        return 'guest_' + Math.random().toString(36).substr(2, 9);
    }
    
    getCurrentPlayerName() {
        const user = firebase.auth().currentUser;
        if (user) {
            // Prioridade: displayName > parte antes do @ do email > 'Jogador'
            if (user.displayName) {
                return user.displayName;
            }
            if (user.email) {
                // Extrair apenas o nome (antes do @)
                return user.email.split('@')[0];
            }
            return 'Jogador';
        }
        return 'Convidado';
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    
    setupEventListeners() {
        document.getElementById('create-room-btn')?.addEventListener('click', async () => {
            await this.createRoom();
        });
        
        document.getElementById('join-room-btn')?.addEventListener('click', async () => {
            const roomCode = document.getElementById('room-code')?.value.toUpperCase();
            if (roomCode && roomCode.length === 6) {
                await this.joinRoom(roomCode);
            } else {
                Utils.notify('Digite um código de 6 caracteres', 'warning');
            }
        });
    }
    
    async createRoom() {
        console.log('🆕 Criando sala...');
        
        const user = firebase.auth().currentUser;
        if (!user) {
            Utils.notify('Você precisa estar logado', 'error');
            return null;
        }
        
        this.playerName = this.getCurrentPlayerName();
        
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
            players: {
                [this.playerId]: {
                    uid: this.playerId,
                    name: this.playerName,
                    email: user.email,
                    isMaster: true,
                    connected: true,
                    joinedAt: Date.now()
                }
            }
        };
        
        try {
            await firebase.database().ref('rooms/' + roomCode).set(roomData);
            
            console.log('✅ Sala criada:', roomCode);
            console.log(`👑 Mestre ${this.playerName} criou a sala ${roomCode}`);
            this.updateRoomCodeDisplay(roomCode);
            
            try {
                await navigator.clipboard.writeText(roomCode);
                Utils.notify(`Sala ${roomCode}`, 'success');
            } catch {
                Utils.notify(`Sala: ${roomCode}`, 'success');
            }
            
            setTimeout(() => {
                Utils.showScreen('config-screen');
            }, 1000);
            
            this.setupRoomListeners();
            
            return roomCode;
        } catch (error) {
            console.error('❌ Erro ao criar sala:', error);
            Utils.notify('Erro ao criar sala', 'error');
            return null;
        }
    }
    
    async joinRoom(roomCode) {
        console.log('🔑 Entrando na sala:', roomCode);
        
        const user = firebase.auth().currentUser;
        if (!user) {
            Utils.notify('Você precisa estar logado', 'error');
            return false;
        }
        
        this.playerName = this.getCurrentPlayerName();
        this.currentRoom = roomCode.toUpperCase();
        this.isMaster = false;
        
        try {
            const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
            const snapshot = await roomRef.once('value');
            
            if (!snapshot.exists()) {
                Utils.notify('❌ Sala não encontrada', 'error');
                this.currentRoom = null;
                return false;
            }
            
            const playerData = {
                uid: this.playerId,
                name: this.playerName,
                email: user.email,
                isMaster: false,
                connected: true,
                joinedAt: Date.now()
            };
            
            await roomRef.child('players/' + this.playerId).set(playerData);
            
            console.log('✅ Entrou na sala');
            console.log(`👋 Jogador ${this.playerName} entrou na sala ${this.currentRoom}`);
            this.updateRoomCodeDisplay(this.currentRoom);
            Utils.notify(`Aguarde o mestre...`, 'info');
            
            this.setupRoomListeners();
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao entrar:', error);
            Utils.notify('Erro ao entrar na sala', 'error');
            return false;
        }
    }
    
    updateRoomCodeDisplay(roomCode) {
        document.querySelectorAll('#room-code-display, #current-room-code').forEach(el => {
            el.textContent = roomCode;
        });
    }
    
    setupRoomListeners() {
        if (!this.currentRoom) return;
        
        console.log('👂 Configurando listeners da sala...');
        
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        
        const statusListener = roomRef.child('status').on('value', (snapshot) => {
            const status = snapshot.val();
            if (status) {
                this.handleStatusChange(status);
            }
        });
        this.listeners.push({ ref: roomRef.child('status'), listener: statusListener });
        
        const gameDataListener = roomRef.child('gameData').on('value', (snapshot) => {
            const gameData = snapshot.val();
            if (gameData && !this.isMaster) {
                this.syncGameData(gameData);
            }
        });
        this.listeners.push({ ref: roomRef.child('gameData'), listener: gameDataListener });
        
        const gameStateListener = roomRef.child('gameState').on('value', (snapshot) => {
            const state = snapshot.val();
            if (state && !this.isMaster) {
                this.syncGameState(state);
            }
        });
        this.listeners.push({ ref: roomRef.child('gameState'), listener: gameStateListener });
    }
    
    handleStatusChange(status) {
        console.log('📊 Status da sala:', status);
        
        if (status === 'playing' && !this.isMaster) {
            Utils.showScreen('game-screen');
        }
    }
    
    syncGameData(gameData) {
        if (gameData.questions && Array.isArray(gameData.questions)) {
            window.QuestionSystem.questions = gameData.questions;
            console.log('📚 Perguntas sincronizadas:', gameData.questions.length);
        }
        
        if (gameData.teams && Array.isArray(gameData.teams)) {
            // Verificar se jogador local JÁ está atribuído
            let playerTeamId = this.playerTeamId;
            let playerName = this.playerName;
            
            // Aplicar equipes do Firebase
            window.TeamSystem.teams = JSON.parse(JSON.stringify(gameData.teams)); // Deep copy
            
            // Garantir assignedPlayers existe
            window.TeamSystem.teams.forEach(team => {
                if (!team.assignedPlayers) team.assignedPlayers = [];
            });
            
            // Se jogador local já estava atribuído, manter na mesma equipe
            if (playerTeamId && playerName) {
                const team = window.TeamSystem.teams.find(t => t.id === playerTeamId);
                if (team && !team.assignedPlayers.includes(playerName)) {
                    team.assignedPlayers.push(playerName);
                    console.log(`🔄 Restaurando ${playerName} na equipe ${team.name}`);
                }
            }
            
            // Atribuir jogador se ainda não está em nenhuma equipe
            this.assignPlayerToTeam();
            
            console.log('👥 Equipes sincronizadas:', window.TeamSystem.teams.length);
            
            // Log da distribuição
            window.TeamSystem.teams.forEach(team => {
                console.log(`   ${team.name}: ${team.assignedPlayers.length} jogador(es) - [${team.assignedPlayers.join(', ')}]`);
            });
            
            // Atualizar display
            if (window.TeamSystem.updateDisplay) {
                window.TeamSystem.updateDisplay();
            }
        }
    }
    
    syncGameState(state) {
        if (typeof state.currentQuestionIndex === 'number') {
            window.GameSystem.currentQuestionIndex = state.currentQuestionIndex;
        }
        
        if (typeof state.currentTeamIndex === 'number') {
            window.TeamSystem.currentTeamIndex = state.currentTeamIndex;
        }
        
        if (state.teams && Array.isArray(state.teams)) {
            // Verificar se jogador local JÁ está atribuído
            let playerTeamId = this.playerTeamId;
            let playerName = this.playerName;
            
            // Atualizar pontuações e dados das equipes
            state.teams.forEach((newTeam) => {
                const localTeam = window.TeamSystem.teams.find(t => t.id === newTeam.id);
                if (localTeam) {
                    // Atualizar pontuação
                    localTeam.score = newTeam.score || 0;
                    localTeam.questionsAnswered = newTeam.questionsAnswered || 0;
                    localTeam.questionsCorrect = newTeam.questionsCorrect || 0;
                    localTeam.questionsWrong = newTeam.questionsWrong || 0;
                    
                    // Atualizar lista de jogadores do Firebase
                    localTeam.assignedPlayers = newTeam.assignedPlayers ? [...newTeam.assignedPlayers] : [];
                    
                    // Se jogador local não está na lista, adicionar
                    if (playerTeamId === localTeam.id && playerName && !localTeam.assignedPlayers.includes(playerName)) {
                        localTeam.assignedPlayers.push(playerName);
                    }
                }
            });
        }
        
        if (typeof state.consecutiveCorrect === 'number') {
            window.GameSystem.consecutiveCorrect = state.consecutiveCorrect;
        }
        
        window.GameSystem.showQuestion();
        window.TeamSystem.updateDisplay();
    }
    
    assignPlayerToTeam() {
        if (!window.TeamSystem.teams || window.TeamSystem.teams.length === 0) {
            console.log('⚠️ Nenhuma equipe disponível para atribuição');
            return;
        }
        
        const teams = window.TeamSystem.teams;
        
        // Inicializar assignedPlayers se não existir
        teams.forEach(team => {
            if (!team.assignedPlayers) team.assignedPlayers = [];
        });
        
        // Verificar se jogador já está em alguma equipe
        for (let team of teams) {
            const hasPlayer = team.assignedPlayers.some(p => p === this.playerName);
            if (hasPlayer) {
                this.playerTeamId = team.id;
                console.log(`ℹ️ JOGADOR JÁ ESTAVA NA EQUIPE:`);
                console.log(`   👤 Jogador: ${this.playerName}`);
                console.log(`   🏁 Equipe: ${team.name} (ID: ${team.id})`);
                console.log(`   👥 Jogadores na equipe: ${team.assignedPlayers.join(', ')}`);
                return;
            }
        }
        
        // Se não está em nenhuma equipe, encontrar a com MENOS jogadores
        if (!this.playerTeamId) {
            // Ordenar por quantidade de jogadores (menor primeiro)
            teams.sort((a, b) => a.assignedPlayers.length - b.assignedPlayers.length);
            const smallestTeam = teams[0];
            
            // Adicionar jogador à equipe
            smallestTeam.assignedPlayers.push(this.playerName);
            this.playerTeamId = smallestTeam.id;
            
            console.log(`✅ ATRIBUIÇÃO DE EQUIPE:`);
            console.log(`   👤 Jogador: ${this.playerName}`);
            console.log(`   🏁 Equipe: ${smallestTeam.name} (ID: ${smallestTeam.id})`);
            console.log(`   👥 Total de jogadores na equipe: ${smallestTeam.assignedPlayers.length}`);
            console.log(`   📋 Jogadores: ${smallestTeam.assignedPlayers.join(', ')}`);
            
            // Mostrar distribuição de todas as equipes
            console.log(`   📊 DISTRIBUIÇÃO GERAL:`);
            teams.forEach(t => {
                console.log(`      ${t.name}: ${t.assignedPlayers.length} jogador(es) - [${t.assignedPlayers.join(', ')}]`);
            });
            
            // Salvar no Firebase para sincronizar com todos
            this.syncTeamsToFirebase();
        }
    }
    
    async syncTeamsToFirebase() {
        if (!this.currentRoom) return;
        
        try {
            await firebase.database().ref('rooms/' + this.currentRoom + '/gameData/teams').set(window.TeamSystem.teams);
            console.log('🔄 Equipes sincronizadas no Firebase');
        } catch (error) {
            console.error('❌ Erro ao sincronizar equipes:', error);
        }
    }
    
    async startGameForAll() {
        if (!this.isMaster || !this.currentRoom) {
            Utils.notify('Apenas o mestre pode iniciar', 'warning');
            return false;
        }
        
        console.log('🚀 Mestre iniciando jogo para todos...');
        
        try {
            const questions = window.QuestionSystem.collectQuestions();
            const teams = window.TeamSystem.collectTeams();
            
            if (questions.length === 0) {
                Utils.notify('❌ Nenhuma pergunta carregada', 'error');
                return false;
            }
            
            if (teams.length === 0) {
                Utils.notify('❌ Nenhuma equipe configurada', 'error');
                return false;
            }
            
            // IMPORTANTE: Atualizar playerName do mestre antes de iniciar
            this.playerName = this.getCurrentPlayerName();
            
            const gameData = {
                questions: questions,
                teams: teams
            };
            
            const gameState = {
                currentQuestionIndex: 0,
                currentTeamIndex: 0,
                teams: teams,
                consecutiveCorrect: 0
            };
            
            await firebase.database().ref('rooms/' + this.currentRoom).update({
                status: 'playing',
                gameData: gameData,
                gameState: gameState,
                gameStartedAt: Date.now()
            });
            
            console.log('✅ Jogo iniciado no Firebase');
            
            // ATRIBUIR MESTRE A UMA EQUIPE
            window.TeamSystem.teams = teams;
            this.assignPlayerToTeam();
            
            Utils.notify('🎮 Jogo iniciado!', 'success');
            
            setTimeout(() => {
                Utils.showScreen('game-screen');
                if (window.GameSystem) {
                    window.GameSystem.start();
                }
            }, 1000);
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao iniciar jogo:', error);
            Utils.notify('Erro ao iniciar jogo', 'error');
            return false;
        }
    }
    
    async broadcastGameState() {
        if (!this.currentRoom) return;
        
        // Qualquer participante pode transmitir (não apenas mestre)
        try {
            const gameState = {
                currentQuestionIndex: window.GameSystem.currentQuestionIndex,
                currentTeamIndex: window.TeamSystem.currentTeamIndex,
                teams: window.TeamSystem.teams,
                consecutiveCorrect: window.GameSystem.consecutiveCorrect
            };
            
            await firebase.database().ref('rooms/' + this.currentRoom + '/gameState').set(gameState);
            console.log('📡 Estado transmitido para Firebase');
        } catch (error) {
            console.error('❌ Erro ao atualizar estado:', error);
        }
    }
    
    cleanup() {
        this.listeners.forEach(item => {
            if (item.ref && item.listener) {
                item.ref.off('value', item.listener);
            }
        });
        this.listeners = [];
        
        this.currentRoom = null;
        this.isMaster = false;
        this.players = {};
        this.playerTeamId = null;
        
        console.log('🧹 RoomSystem limpo');
    }
}

let roomSystem;
document.addEventListener('firebaseReady', () => {
    roomSystem = new RoomSystem();
    roomSystem.init();
    window.roomSystem = roomSystem;
});

console.log('✅ Rooms carregado');
