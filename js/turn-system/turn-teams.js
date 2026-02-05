// js/turn-system/turn-teams.js - ATUALIZADO COM ATRIBUIÇÃO PARA MESTRE
console.log('🔄 turn-system/turn-teams.js carregando...');

TurnSystem.prototype.updatePlayerTeam = function(teamId) {
    if (!window.teams) {
        console.log('⏳ Aguardando equipes carregarem...');
        setTimeout(() => this.updatePlayerTeam(teamId), 1000);
        return;
    }
    
    const team = window.teams.find(t => t.id === teamId);
    if (team) {
        this.playerTeam = team;
        this.playerTeamId = teamId;
        console.log(`🎯 Jogador atribuído à equipe: ${team.name} (ID: ${teamId})`);
        
        this.updateAnswerButtons();
        
        if (!this.teamAssignedNotified) {
            this.teamAssignedNotified = true;
            setTimeout(() => {
                this.showNotification(`🎯 Você está na equipe: ${team.name}`, 'success');
            }, 500);
        }
    } else {
        console.error(`❌ Equipe não encontrada: ${teamId}`);
    }
};

// NOVA FUNÇÃO: Atribuir mestre automaticamente à primeira equipe
TurnSystem.prototype.assignMasterToTeam = function() {
    if (!this.roomSystem.isMaster || !window.teams || window.teams.length === 0) return;
    
    console.log('👑 Atribuindo mestre à equipe...');
    
    // Mestre sempre fica na primeira equipe
    const teamId = window.teams[0].id;
    const teamName = window.teams[0].name;
    
    // Atribuir localmente
    this.playerTeam = window.teams[0];
    this.playerTeamId = teamId;
    
    console.log(`👑 Mestre atribuído à equipe: ${teamName} (ID: ${teamId})`);
    
    // Salvar no Firebase
    this.saveMasterTeamAssignment(teamId, teamName);
    
    // Atualizar controles
    this.updateAnswerButtons();
};

TurnSystem.prototype.saveMasterTeamAssignment = function(teamId, teamName) {
    if (!this.roomSystem.currentRoom) return;
    
    firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/players/' + this.roomSystem.playerId)
        .update({ 
            teamId: teamId,
            teamName: teamName,
            isMaster: true,
            assignedAt: Date.now()
        });
    
    console.log(`💾 Equipe ${teamName} salva no Firebase para mestre`);
};

TurnSystem.prototype.canPlayerAnswer = function() {
    // MESTRE SEMPRE PODE RESPONDER, INDEPENDENTE DA EQUIPE
    if (this.roomSystem.isMaster) {
        console.log('👑 Mestre sempre pode responder');
        return true;
    }
    
    if (!this.currentTurn || !this.playerTeamId) {
        console.log('❌ Não pode responder:', {
            currentTurn: this.currentTurn,
            playerTeamId: this.playerTeamId
        });
        return false;
    }
    
    const canAnswer = this.playerTeamId === this.currentTurn.teamId;
    console.log('✅ Verificação de equipe:', {
        jogador: this.playerTeamId,
        plantao: this.currentTurn.teamId,
        podeResponder: canAnswer
    });
    return canAnswer;
};

TurnSystem.prototype.setCurrentTurn = function(teamIndex, teamId, teamName) {
    if (!this.roomSystem.isMaster) return;
    
    const turnData = {
        teamIndex: teamIndex,
        teamId: teamId,
        teamName: teamName,
        questionIndex: window.currentQuestionIndex || 0,
        startTime: Date.now(),
        answered: false,
        masterId: this.roomSystem.playerId
    };
    
    this.currentTurn = turnData; // IMPORTANTE: Atribuir localmente também
    
    firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentTurn')
        .set(turnData);
    
    console.log('👑 Mestre definiu turno:', teamName);
    
    // Atualizar controles após definir turno
    setTimeout(() => {
        this.updateAnswerButtons();
    }, 100);
};

TurnSystem.prototype.rotateTeam = function() {
    if (!this.roomSystem.isMaster || !window.teams || window.teams.length === 0) return;
    
    const nextIndex = (window.currentTeamIndex + 1) % window.teams.length;
    const nextTeam = window.teams[nextIndex];
    
    window.currentTeamIndex = nextIndex;
    window.consecutiveCorrect = 0;
    
    this.setCurrentTurn(nextIndex, nextTeam.id, nextTeam.name);
    
    console.log('🔄 Equipe rotacionada para:', nextTeam.name);
};

console.log('✅ turn-system/turn-teams.js carregado');