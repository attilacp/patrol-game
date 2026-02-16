ARQUIVO: rooms.js
LOCALIZAÇÃO: js/rooms.js
===============================================

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
        // Criar sala
        document.getElementById('create-room-btn')?.addEventListener('click', async () => {
            await this.createRoom();
        });
        
        // Entrar na sala
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
            this.updateRoomCodeDisplay(roomCode);
            Utils.notify(`🎉 Sala criada: ${roomCode}`, 'success');
            
            // Ir para tela de configuração
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
            this.updateRoomCodeDisplay(this.currentRoom);
            Utils.notify(`✅ Entrou na sala ${this.currentRoom}`, 'success');
            
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
        
        // Ouvir mudanças no status
        const statusListener = roomRef.child('status').on('value', (snapshot) => {
            const status = snapshot.val();
            if (status) {
                this.handleStatusChange(status);
            }
        });
        this.listeners.push({ ref: roomRef.child('status'), listener: statusListener });
        
        // Ouvir dados do jogo
        const gameDataListener = roomRef.child('gameData').on('value', (snapshot) => {
            const gameData = snapshot.val();
            if (gameData && !this.isMaster) {
                this.syncGameData(gameData);
            }
        });
        this.listeners.push({ ref: roomRef.child('gameData'), listener: gameDataListener });
    }
    
    handleStatusChange(status) {
        console.log('📊 Status da sala:', status);
        
        if (status === 'playing' && !this.isMaster) {
            // Jogador: ir para tela de jogo
            Utils.showScreen('game-screen');
        }
    }
    
    syncGameData(gameData) {
        if (gameData.questions) {
            window.QuestionSystem.questions = gameData.questions;
            console.log('📚 Perguntas sincronizadas:', gameData.questions.length);
        }
        
        if (gameData.teams) {
            window.TeamSystem.teams = gameData.teams;
            console.log('👥 Equipes sincronizadas:', gameData.teams.length);
        }
    }
    
    async startGameForAll() {
        if (!this.isMaster || !this.currentRoom) {
            Utils.notify('Apenas o mestre pode iniciar', 'warning');
            return false;
        }
        
        console.log('🚀 Mestre iniciando jogo para todos...');
        
        try {
            // Coletar dados
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
                teams: teams,
                currentQuestionIndex: 0,
                currentTeamIndex: 0
            };
            
            // Salvar no Firebase
            await firebase.database().ref('rooms/' + this.currentRoom).update({
                status: 'playing',
                gameData: gameData,
                gameStartedAt: Date.now()
            });
            
            console.log('✅ Jogo iniciado no Firebase');
            Utils.notify('🎮 Jogo iniciado!', 'success');
            
            // Ir para tela de jogo
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
    
    cleanup() {
        // Remover listeners
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

// Inicializar
let roomSystem;
document.addEventListener('firebaseReady', () => {
    roomSystem = new RoomSystem();
    roomSystem.init();
    window.roomSystem = roomSystem;
});

console.log('✅ Rooms carregado');