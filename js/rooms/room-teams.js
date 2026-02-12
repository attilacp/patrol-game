// js/rooms/room-teams.js - CORRIGIDO (Erro 7 - Entrar a qualquer momento)
console.log('🏠 rooms/room-teams.js carregando...');

RoomSystem.prototype.assignPlayerToTeam = function() {
    if (!window.teams || window.teams.length === 0) {
        console.log('⏳ Aguardando equipes carregarem...');
        setTimeout(() => this.assignPlayerToTeam(), 1000);
        return;
    }
    
    // Se já tem equipe, não atribuir novamente
    if (this.playerTeamId) {
        console.log('👤 Jogador já tem equipe:', this.playerTeamId);
        return;
    }
    
    console.log('🎯 Atribuindo equipe para jogador...');
    
    // CORREÇÃO ERRO 7: Removida verificação de status
    // Jogadores podem entrar a qualquer momento, mesmo com jogo em andamento
    
    // Buscar jogadores já atribuídos
    this.getAssignedPlayers().then(assignedPlayers => {
        // Verificar novamente (pode ter sido atribuído durante a promise)
        if (this.playerTeamId) {
            console.log('👤 Jogador já foi atribuído durante a busca');
            return;
        }
        
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
        
        // Atribuir APENAS UMA VEZ
        this.playerTeamId = targetTeamId;
        const team = window.teams.find(t => t.id === targetTeamId);
        
        console.log(`👤 Jogador atribuído à equipe: ${team.name} (ID: ${targetTeamId})`);
        
        // ADICIONAR JOGADOR AO ARRAY DA EQUIPE
        if (!team.assignedPlayers) {
            team.assignedPlayers = [];
        }
        const playerEmail = firebase.auth().currentUser?.email;
        if (playerEmail && !team.assignedPlayers.includes(playerEmail)) {
            team.assignedPlayers.push(playerEmail);
            console.log(`✅ ${playerEmail} adicionado à equipe ${team.name}`);
            
            // SALVAR NO FIREBASE
            if (this.currentRoom) {
                const teamRef = firebase.database().ref(`rooms/${this.currentRoom}/gameData/teams`);
                teamRef.once('value', snapshot => {
                    const teams = snapshot.val() || [];
                    const teamIndex = teams.findIndex(t => t.id === targetTeamId);
                    if (teamIndex >= 0) {
                        teams[teamIndex].assignedPlayers = team.assignedPlayers;
                        teamRef.set(teams).then(() => {
                            console.log('💾 assignedPlayers salvo no Firebase');
                        });
                    }
                });
            }
            
            // Atualizar display
            if (typeof updateTeamsDisplay === 'function') {
                updateTeamsDisplay();
            }
        }
        
        // Salvar no Firebase APENAS UMA VEZ
        this.savePlayerTeamAssignment(targetTeamId, team.name);
        
        // Atualizar sistema de turnos APENAS UMA VEZ
        if (window.turnSystem && typeof window.turnSystem.updatePlayerTeam === 'function') {
            window.turnSystem.updatePlayerTeam(targetTeamId);
            console.log('✅ Equipe atribuída ao sistema de turnos');
        }
        
        // Notificação APENAS UMA VEZ
        if (!this.teamAssignmentNotified) {
            this.teamAssignmentNotified = true;
            this.showNotification(`🎯 Você foi atribuído à equipe: ${team.name}`);
        }
    }).catch(error => {
        console.error('❌ Erro ao atribuir equipe:', error);
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
