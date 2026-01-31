// file name: teams-performance/core.js
// Núcleo do sistema de performance - FOCO EM JOGADORES

if (!window.playerPerformance) window.playerPerformance = {};
if (!window.teamPerformance) window.teamPerformance = {};

// CHAVES PARA LOCALSTORAGE
var PLAYER_PERFORMANCE_KEY = 'patrol_player_performance';
var TEAM_PERFORMANCE_KEY = 'patrol_team_performance';

function initializeTeamPerformanceTracking() {
    console.log('Inicializando tracking de performance por jogador...');
    
    if (!window.teams || !Array.isArray(window.teams)) {
        console.warn('window.teams não está definido ou não é um array');
        return;
    }
    
    // TENTAR CARREGAR PERFORMANCE SALVA
    loadSavedPerformance();
    
    window.teams.forEach(function(team, index) {
        if (!team) {
            console.warn('Equipe ' + index + ' é undefined');
            return;
        }
        
        // INICIALIZAR PERFORMANCE POR JOGADOR
        if (team.players && team.players.length > 0) {
            team.players.forEach(function(playerName) {
                if (playerName && playerName.trim()) {
                    var playerKey = playerName.trim().toLowerCase();
                    if (!team.playerPerformance) team.playerPerformance = {};
                    if (!team.playerPerformance[playerKey]) {
                        team.playerPerformance[playerKey] = {
                            name: playerName.trim(),
                            performanceBySubject: {},
                            questionsBySubject: {},
                            totalCorrect: 0,
                            totalAnswered: 0
                        };
                    }
                }
            });
        }
        
        // SE NÃO HOUVER JOGADORES, MANTER PERFORMANCE DA EQUIPE PARA COMPATIBILIDADE
        if ((!team.players || team.players.length === 0) && !team.performanceBySubject) {
            team.performanceBySubject = {};
        }
        if (!team.questionsBySubject) {
            team.questionsBySubject = {};
        }
    });
    
    console.log('Tracking de performance inicializado para jogadores');
}

function resetTeamPerformance() {
    console.log('Resetando performance das equipes...');
    
    if (window.teams && Array.isArray(window.teams)) {
        window.teams.forEach(team => {
            if (team) {
                team.performanceBySubject = {};
                team.questionsBySubject = {};
                team.playerPerformance = {};
                console.log(`Performance resetada para: ${team.name}`);
            }
        });
    }
    
    return true;
}

// SALVAR PERFORMANCE NO LOCALSTORAGE
function savePerformanceToStorage() {
    try {
        if (!window.teams || !Array.isArray(window.teams)) {
            console.warn('Não é possível salvar performance: equipes não definidas');
            return false;
        }
        
        var playerPerformanceData = {
            timestamp: new Date().toISOString(),
            version: '2.0', // Nova versão com jogadores
            players: {}
        };
        
        var teamPerformanceData = {
            timestamp: new Date().toISOString(),
            version: '2.0',
            teams: {}
        };
        
        window.teams.forEach(function(team) {
            if (team && team.name) {
                // SALVAR PERFORMANCE POR JOGADOR
                if (team.playerPerformance) {
                    Object.values(team.playerPerformance).forEach(function(player) {
                        if (player && player.name) {
                            var playerKey = player.name.toLowerCase();
                            playerPerformanceData.players[playerKey] = {
                                name: player.name,
                                team: team.name,
                                performanceBySubject: player.performanceBySubject || {},
                                questionsBySubject: player.questionsBySubject || {},
                                totalCorrect: player.totalCorrect || 0,
                                totalAnswered: player.totalAnswered || 0,
                                lastUpdated: new Date().toISOString()
                            };
                        }
                    });
                }
                
                // SALVAR PERFORMANCE DA EQUIPE (média calculada)
                teamPerformanceData.teams[team.name] = {
                    name: team.name,
                    performanceBySubject: team.performanceBySubject || {},
                    questionsBySubject: team.questionsBySubject || {},
                    playerCount: team.players ? team.players.length : 0,
                    lastUpdated: new Date().toISOString()
                };
            }
        });
        
        localStorage.setItem(PLAYER_PERFORMANCE_KEY, JSON.stringify(playerPerformanceData));
        localStorage.setItem(TEAM_PERFORMANCE_KEY, JSON.stringify(teamPerformanceData));
        
        console.log('Performance salva: ' + 
            Object.keys(playerPerformanceData.players).length + ' jogadores, ' +
            Object.keys(teamPerformanceData.teams).length + ' equipes');
        return true;
    } catch (error) {
        console.error('Erro ao salvar performance:', error);
        return false;
    }
}

// CARREGAR PERFORMANCE DO LOCALSTORAGE
function loadSavedPerformance() {
    try {
        // CARREGAR JOGADORES
        var savedPlayers = localStorage.getItem(PLAYER_PERFORMANCE_KEY);
        var savedTeams = localStorage.getItem(TEAM_PERFORMANCE_KEY);
        
        var loaded = false;
        
        if (savedPlayers) {
            var playerData = JSON.parse(savedPlayers);
            console.log('Performance de jogadores carregada (salva em: ' + playerData.timestamp + ')');
            
            if (window.teams && Array.isArray(window.teams)) {
                window.teams.forEach(function(team) {
                    if (team && team.players) {
                        team.players.forEach(function(playerName) {
                            if (playerName && playerName.trim()) {
                                var playerKey = playerName.trim().toLowerCase();
                                if (playerData.players[playerKey]) {
                                    if (!team.playerPerformance) team.playerPerformance = {};
                                    team.playerPerformance[playerKey] = playerData.players[playerKey];
                                    console.log('Performance carregada para jogador: ' + playerName);
                                }
                            }
                        });
                    }
                });
            }
            loaded = true;
        }
        
        if (savedTeams) {
            var teamData = JSON.parse(savedTeams);
            console.log('Performance de equipes carregada (salva em: ' + teamData.timestamp + ')');
            
            if (window.teams && Array.isArray(window.teams)) {
                window.teams.forEach(function(team) {
                    if (team && team.name && teamData.teams[team.name]) {
                        var savedTeam = teamData.teams[team.name];
                        team.performanceBySubject = savedTeam.performanceBySubject || {};
                        team.questionsBySubject = savedTeam.questionsBySubject || {};
                        console.log('Performance carregada para equipe: ' + team.name);
                    }
                });
            }
            loaded = true;
        }
        
        return loaded;
    } catch (error) {
        console.error('Erro ao carregar performance:', error);
        // Limpar dados corrompidos
        localStorage.removeItem(PLAYER_PERFORMANCE_KEY);
        localStorage.removeItem(TEAM_PERFORMANCE_KEY);
        return false;
    }
}

// Exportar funções do core
window.initializeTeamPerformanceTracking = initializeTeamPerformanceTracking;
window.resetTeamPerformance = resetTeamPerformance;
window.savePerformanceToStorage = savePerformanceToStorage;
window.loadSavedPerformance = loadSavedPerformance;