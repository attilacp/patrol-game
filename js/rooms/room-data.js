// js/rooms/room-data.js - SINCRONIZAÇÃO DE DADOS
console.log('🏠 rooms/room-data.js carregando...');

RoomSystem.prototype.syncGameDataFromFirebase = function(gameData) {
    console.log('🔄 Sincronizando gameData...');
    
    // Perguntas (já com recorrência aplicada)
    if (gameData.questions && Array.isArray(gameData.questions)) {
        window.questions = [...gameData.questions];
        console.log('✅ Perguntas sincronizadas (com recorrência):', window.questions.length);
    }
    
    // Equipes
    if (gameData.teams && Array.isArray(gameData.teams)) {
        window.teams = gameData.teams.map((team, index) => ({
            id: team.id || index + 1,
            name: team.name || `Equipe ${index + 1}`,
            players: Array.isArray(team.players) ? team.players : [],
            score: team.score || 0,
            colorClass: team.colorClass || `team-bg-${(index % 10) + 1}`,
            turnColorClass: team.turnColorClass || `team-color-${(index % 10) + 1}`
        }));
        console.log('✅ Equipes sincronizadas:', window.teams.length);
    }
    
    // Aplicar ordem do Firebase
    if (gameData.order && gameData.order.questions) {
        this.applyFirebaseOrder(gameData.order);
    }
    
    // Atribuir jogador à equipe automaticamente
    this.assignPlayerToTeam();
    
    // Atualizar interface
    if (window.updateTeamsDisplay) {
        window.updateTeamsDisplay();
    }
};

// NOTA: A função applyFirebaseOrder foi movida para room-handlers.js
// para buscar dados do Firebase corretamente (evita erro de undefined)

RoomSystem.prototype.loadInitialRoomData = async function() {
    try {
        const roomRef = firebase.database().ref('rooms/' + this.currentRoom);
        const snapshot = await roomRef.once('value');
        const roomData = snapshot.val();
        
        if (roomData) {
            console.log('📡 Dados iniciais carregados');
            
            if (roomData.status) {
                this.updateRoomStatus(roomData.status);
                this.lastStatus = roomData.status;
                
                if (roomData.status === 'playing' && !this.isMaster) {
                    console.log('🎮 Jogo em andamento - sincronizando...');
                    this.syncGameDataFromFirebase(roomData.gameData || {});
                }
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
    }
};

console.log('✅ rooms/room-data.js carregado!');