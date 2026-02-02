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
        this.settings = { maxPlayers: 10, isPrivate: false };
        
        console.log('👤 Jogador:', this.playerName, 'ID:', this.playerId);
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
    
    getCurrentRoom() { return this.currentRoom; }
    getIsMaster() { return this.isMaster; }
    getPlayers() { return this.players; }
    getPlayerCount() {
        return Object.values(this.players).filter(p => p.connected).length;
    }
    
    cleanup() {
        this.currentRoom = null;
        this.isMaster = false;
        this.players = {};
        console.log('🧹 Sistema de salas limpo');
    }
}

window.RoomSystem = RoomSystem;
console.log('✅ rooms/core.js carregado com sucesso!');