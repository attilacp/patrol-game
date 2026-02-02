[file name]: rooms/core.js
[file content begin]
// js/rooms/core.js - Classe principal do sistema de salas
console.log('🏠 rooms/core.js carregando...');

class RoomSystem {
    constructor() {
        console.log('🏠 Inicializando sistema de salas...');
        this.currentRoom = null;
        this.isMaster = false;
        this.playerId = this.generatePlayerId();
        this.playerName = this.getPlayerName();
        this.players = {};
        this.roomListeners = [];
        this.actionListeners = [];
        this.settings = {
            maxPlayers: 10,
            isPrivate: false
        };
        
        console.log('👤 Jogador:', this.playerName, 'ID:', this.playerId);
    }
    
    // ===== GERAR IDs =====
    generatePlayerId() {
        // Usar UID do Firebase se disponível, senão gerar aleatório
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
    
    // ===== GETTERS =====
    getCurrentRoom() {
        return this.currentRoom;
    }
    
    getIsMaster() {
        return this.isMaster;
    }
    
    getPlayers() {
        return this.players;
    }
    
    getPlayerCount() {
        return Object.values(this.players).filter(p => p.connected).length;
    }
    
    getPlayerNameById(playerId) {
        return this.players[playerId]?.name || 'Desconhecido';
    }
    
    // ===== CLEANUP =====
    cleanup() {
        this.removeAllListeners();
        this.currentRoom = null;
        this.isMaster = false;
        this.players = {};
        console.log('🧹 Sistema de salas limpo');
    }
    
    removeAllListeners() {
        // Remover todos os listeners do Firebase
        this.roomListeners.forEach(item => {
            if (item.ref && item.listener) {
                item.ref.off('value', item.listener);
            }
        });
        
        this.actionListeners.forEach(item => {
            if (item.ref && item.listener) {
                item.ref.off('child_added', item.listener);
            }
        });
        
        this.roomListeners = [];
        this.actionListeners = [];
        console.log('👋 Todos os listeners removidos');
    }
}

// Exportar para uso global
window.RoomSystem = RoomSystem;
console.log('✅ rooms/core.js carregado com sucesso!');
[file content end]