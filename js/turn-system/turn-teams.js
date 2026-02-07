// js/turn-system/turn-teams.js - VERSÃO COMPLETA (ATUALIZADA)
console.log('🔄 turn-system/turn-teams.js carregando...');

TurnSystem.prototype.updatePlayerTeam = function(teamId) {
    if (!window.teams) {
        console.log('⏳ Aguardando equipes carregarem...');
        setTimeout(() => this.updatePlayerTeam(teamId), 1000);
        return;
    }
    
    const team = window.teams.find(t => t.id === teamId);
    if (team) {
        // Evitar duplicação
        if (this.playerTeamId === teamId) {
            console.log(`🔄 Jogador já está na equipe: ${team.name}`);
            return;
        }
        
        this.playerTeam = team;
        this.playerTeamId = teamId;
        console.log(`🎯 Jogador atribuído à equipe: ${team.name} (ID: ${teamId})`);
        
        // NOTIFICAR MESTRE ESPECIALMENTE
        if (this.roomSystem.isMaster) {
            this.roomSystem.showMasterTeam(team.name);
        }
        
        this.updateAnswerButtons();
        
        // Mostrar notificação APENAS UMA VEZ
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

TurnSystem.prototype.assignMasterToTeam = function() {
    if (!this.roomSystem.isMaster || !window.teams || window.teams.length === 0) return;
    
    console.log('👑 Atribuindo mestre à equipe...');
    
    const teamId = window.teams[0].id;
    const teamName = window.teams[0].name;
    
    // Evitar duplicação
    if (this.playerTeamId === teamId) {
        console.log(`👑 Mestre já está na equipe: ${teamName}`);
        return;
    }
    
    this.playerTeam = window.teams[0];
    this.playerTeamId = teamId;
    
    console.log(`👑 Mestre atribuído à equipe: ${teamName} (ID: ${teamId})`);
    
    this.saveMasterTeamAssignment(teamId, teamName);
    
    // NOTIFICAR MESTRE
    this.roomSystem.showMasterTeam(teamName);
    
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
    // MESTRE SEMPRE PODE RESPONDER
    if (this.roomSystem.isMaster) {
        return true;
    }
    
    // JOGADORES NORMAIS: verificar equipe de plantão
    if (!this.currentTurn || !this.playerTeamId) {
        console.log('❌ Jogador não pode responder (sem turno ou equipe):', {
            currentTurn: this.currentTurn,
            playerTeamId: this.playerTeamId
        });
        return false;
    }
    
    const canAnswer = this.playerTeamId === this.currentTurn.teamId;
    
    if (!canAnswer) {
        console.log('❌ Jogador não está na equipe de plantão:', {
            equipeJogador: this.playerTeamId,
            equipePlantao: this.currentTurn.teamId,
            nomeJogador: this.playerTeam?.name,
            nomePlantao: this.currentTurn.teamName
        });
    } else {
        console.log('✅ Jogador PODE responder!', {
            equipe: this.playerTeam?.name,
            jogador: this.roomSystem.playerName
        });
    }
    
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
    
    this.currentTurn = turnData;
    
    firebase.database().ref('rooms/' + this.roomSystem.currentRoom + '/currentTurn')
        .set(turnData);
    
    console.log('👑 Mestre definiu turno:', teamName);
    
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