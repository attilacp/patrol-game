// js/rooms/room-teams.js - ATRIBUIÇÃO DE EQUIPES
console.log('🏠 rooms/room-teams.js carregando...');

RoomSystem.prototype.assignPlayerToTeam = function() {
    if (!window.teams || window.teams.length === 0) return;
    
    if (this.playerTeamId) {
        console.log('👤 Jogador já tem equipe:', this.playerTeamId);
        return;
    }
    
    this.getAssignedPlayers().then(assignedPlayers => {
        const playerCounts = {};
        window.teams.forEach(team => {
            playerCounts[team.id] = assignedPlayers.filter(p => p.teamId === team.id).length;
        });
        
        console.log('📊 Distribuição atual:', playerCounts);
        
        let minCount = Infinity;
        let targetTeamId = null;
        
        for (const teamId in playerCounts) {
            if (playerCounts[teamId] < minCount) {
                minCount = playerCounts[teamId];
                targetTeamId = parseInt(teamId);
            }
        }
        
        if (!targetTeamId || minCount >= 5) {
            const availableTeams = window.teams.filter(team => playerCounts[team.id] < 5);
            if (availableTeams.length > 0) {
                targetTeamId = availableTeams[Math.floor(Math.random() * availableTeams.length)].id;
            } else {
                targetTeamId = window.teams[0].id;
            }
        }
        
        this.playerTeamId = targetTeamId;
        const team = window.teams.find(t => t.id === targetTeamId);
        
        console.log(`👤 Jogador atribuído à equipe: ${team.name} (ID: ${targetTeamId})`);
        
        this.savePlayerTeamAssignment(targetTeamId, team.name);
        
        if (window.turnSystem) {
            window.turnSystem.playerTeam = team;
            console.log('✅ Equipe atribuída ao sistema de turnos');
        }
        
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

console.log('✅ rooms/room-teams.js carregado!');