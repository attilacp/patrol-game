// PATROL - Sistema de Salas (Multiplayer)
console.log('🏠 Rooms carregando...');

class RoomSystem {
    constructor() {
        this.currentRoom = null;
        this.isMaster = false;
        this.playerId = this.generatePlayerId();
        this.playerName = this.getPlayerName();
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
    
    getPlayerName() {
        const user = firebase.auth().currentUser;
        if (user) {
            return user.displayName || user.email || 'Jogador';
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
            window.TeamSystem.teams = gameData.teams;
            this.assignPlayerToTeam();
            console.log('👥 Equipes sincronizadas:', gameData.teams.length);
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
            window.TeamSystem.teams = state.teams;
        }
        
        if (typeof state.consecutiveCorrect === 'number') {
            window.GameSystem.consecutiveCorrect = state.consecutiveCorrect;
        }
        
        window.GameSystem.showQuestion();
        window.TeamSystem.updateDisplay();
    }
    
    assignPlayerToTeam() {
        if (!window.TeamSystem.teams || window.TeamSystem.teams.length === 0) return;
        
        const teams = window.TeamSystem.teams;
        let smallestTeam = teams[0];
        
        teams.forEach(team => {
            if (!team.assignedPlayers) team.assignedPlayers = [];
            const hasPlayer = team.assignedPlayers.some(p => p.includes(this.playerName));
            if (hasPlayer) {
                this.playerTeamId = team.id;
                console.log(`ℹ️ JOGADOR JÁ ESTAVA NA EQUIPE:`);
                console.log(`   👤 Jogador: ${this.playerName}`);
                console.log(`   🏁 Equipe: ${team.name} (ID: ${team.id})`);
                return;
            }
            if (team.assignedPlayers.length < smallestTeam.assignedPlayers.length) {
                smallestTeam = team;
            }
        });
        
        if (!this.playerTeamId) {
            if (!smallestTeam.assignedPlayers) smallestTeam.assignedPlayers = [];
            if (!smallestTeam.assignedPlayers.some(p => p.includes(this.playerName))) {
                smallestTeam.assignedPlayers.push(this.playerName);
                this.playerTeamId = smallestTeam.id;
                console.log(`✅ ATRIBUIÇÃO DE EQUIPE:`);
                console.log(`   👤 Jogador: ${this.playerName}`);
                console.log(`   🏁 Equipe: ${smallestTeam.name} (ID: ${smallestTeam.id})`);
                console.log(`   👥 Total de jogadores na equipe: ${smallestTeam.assignedPlayers.length}`);
            }
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
        if (!this.isMaster || !this.currentRoom) return;
        
        try {
            const gameState = {
                currentQuestionIndex: window.GameSystem.currentQuestionIndex,
                currentTeamIndex: window.TeamSystem.currentTeamIndex,
                teams: window.TeamSystem.teams,
                consecutiveCorrect: window.GameSystem.consecutiveCorrect
            };
            
            await firebase.database().ref('rooms/' + this.currentRoom + '/gameState').set(gameState);
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
