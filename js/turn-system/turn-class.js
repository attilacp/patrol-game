// js/turn-system/turn-class.js - CLASSE PRINCIPAL
console.log('🔄 turn-system/turn-class.js carregando...');

class TurnSystem {
    constructor(roomSystem) {
        this.roomSystem = roomSystem;
        this.currentTurn = null;
        this.playerTeam = null;
        this.playerTeamId = null;
        this.teamAssignedNotified = false;
        
        console.log('✅ Sistema de turnos inicializado');
    }
}

window.TurnSystem = TurnSystem;
console.log('✅ turn-system/turn-class.js carregado');