// file name: js/teams-performance/tracking.js
// Sistema de tracking e atualização de performance - FOCO EM JOGADORES

function updateTeamPerformance(team, question, isCorrect) {
    if (!team || !question) {
        console.warn('Dados insuficientes para atualizar performance');
        return;
    }
    
    // ATUALIZAR PERFORMANCE DE CADA JOGADOR DA EQUIPE
    if (team.players && team.players.length > 0) {
        team.players.forEach(function(playerName) {
            if (playerName && playerName.trim()) {
                updatePlayerPerformance(team, playerName, question, isCorrect);
            }
        });
    } else {
        // FALLBACK: se não houver jogadores, atualizar apenas a equipe
        updateLegacyTeamPerformance(team, question, isCorrect);
    }
    
    // ATUALIZAR MÉDIA DA EQUIPE BASEADA NOS JOGADORES
    updateTeamAverageFromPlayers(team);
    
    // SALVAR PERFORMANCE APÓS ATUALIZAR
    setTimeout(function() {
        if (typeof savePerformanceToStorage === 'function') {
            savePerformanceToStorage();
        }
    }, 100);
    
    // ATUALIZAR EXIBIÇÃO DOS CARDS
    setTimeout(function() {
        if (typeof window.updateTeamsDisplay === 'function') {
            window.updateTeamsDisplay();
        }
    }, 150);
}

function updatePlayerPerformance(team, playerName, question, isCorrect) {
    if (!team || !playerName || !question) {
        console.warn('Dados insuficientes para atualizar performance do jogador');
        return;
    }
    
    var playerKey = playerName.trim().toLowerCase();
    
    // GARANTIR QUE O JOGADOR EXISTA NA EQUIPE
    if (!team.playerPerformance) {
        team.playerPerformance = {};
    }
    
    if (!team.playerPerformance[playerKey]) {
        team.playerPerformance[playerKey] = {
            name: playerName.trim(),
            performanceBySubject: {},
            questionsBySubject: {},
            totalCorrect: 0,
            totalAnswered: 0
        };
    }
    
    var player = team.playerPerformance[playerKey];
    var subjectKey = question.assunto || 'Sem Assunto';
    var subjectDisplay = question.assuntoInfo || question.assunto || 'Sem Assunto';
    
    try {
        if (!player.performanceBySubject[subjectKey]) {
            player.performanceBySubject[subjectKey] = {
                displayName: subjectDisplay,
                total: 0,
                correct: 0,
                wrong: 0,
                performance: 0
            };
        }
        
        if (!player.questionsBySubject) {
            player.questionsBySubject = {};
        }
        
        if (!player.questionsBySubject[subjectKey]) {
            player.questionsBySubject[subjectKey] = [];
        }
        
        var subjectData = player.performanceBySubject[subjectKey];
        subjectData.total++;
        
        if (isCorrect) {
            subjectData.correct++;
            player.totalCorrect++;
        } else {
            subjectData.wrong++;
        }
        
        player.totalAnswered++;
        subjectData.performance = subjectData.total > 0 ? 
            Math.round((subjectData.correct / subjectData.total) * 100) : 0;
        
        // LIMITAR HISTÓRICO
        if (player.questionsBySubject[subjectKey].length > 10) {
            player.questionsBySubject[subjectKey].shift();
        }
        
        player.questionsBySubject[subjectKey].push({
            question: question.enunciado ? (question.enunciado.substring(0, 50) + '...') : 'Sem enunciado',
            correct: isCorrect,
            timestamp: new Date().toISOString()
        });
        
        console.log(playerName + ' - ' + subjectDisplay + ': ' + 
                   subjectData.correct + '/' + subjectData.total + ' (' + subjectData.performance + '%)');
        
    } catch (error) {
        console.error('Erro ao atualizar performance do jogador:', error);
    }
}

function updateTeamAverageFromPlayers(team) {
    if (!team || !team.playerPerformance) return;
    
    var players = Object.values(team.playerPerformance);
    if (players.length === 0) return;
    
    // LIMPAR PERFORMANCE ANTIGA DA EQUIPE (agora só usamos dados dos jogadores)
    team.performanceBySubject = {};
    team.questionsBySubject = {};
    
    // CALCULAR MÉDIA POR ASSUNTO BASEADA NOS JOGADORES
    var subjectAggregates = {};
    
    players.forEach(function(player) {
        Object.entries(player.performanceBySubject || {}).forEach(function([subjectKey, playerData]) {
            if (!subjectAggregates[subjectKey]) {
                subjectAggregates[subjectKey] = {
                    totalQuestions: 0,
                    totalCorrect: 0,
                    playerCount: 0,
                    players: []
                };
            }
            
            subjectAggregates[subjectKey].totalQuestions += playerData.total || 0;
            subjectAggregates[subjectKey].totalCorrect += playerData.correct || 0;
            
            // Contar jogador apenas se tiver dados neste assunto
            if (playerData.total > 0 && !subjectAggregates[subjectKey].players.includes(player.name)) {
                subjectAggregates[subjectKey].players.push(player.name);
                subjectAggregates[subjectKey].playerCount++;
            }
        });
    });
    
    // ATUALIZAR PERFORMANCE DA EQUIPE (MÉDIA)
    Object.entries(subjectAggregates).forEach(function([subjectKey, aggregate]) {
        if (aggregate.playerCount > 0) {
            var player = players.find(p => p.performanceBySubject[subjectKey]);
            var displayName = player ? player.performanceBySubject[subjectKey].displayName : subjectKey;
            
            var averageCorrect = aggregate.totalCorrect / aggregate.playerCount;
            var averagePerformance = aggregate.totalQuestions > 0 ? 
                Math.round((aggregate.totalCorrect / aggregate.totalQuestions) * 100) : 0;
            
            team.performanceBySubject[subjectKey] = {
                displayName: displayName,
                totalQuestions: aggregate.totalQuestions,
                totalCorrect: aggregate.totalCorrect,
                averageCorrect: Math.round(averageCorrect),
                averagePerformance: averagePerformance,
                playerCount: aggregate.playerCount,
                players: aggregate.players
            };
        }
    });
    
    console.log('Média da equipe ' + team.name + ' atualizada: ' + 
               Object.keys(team.performanceBySubject).length + ' assuntos');
}

function updateLegacyTeamPerformance(team, question, isCorrect) {
    var subjectKey = question.assunto || 'Sem Assunto';
    var subjectDisplay = question.assuntoInfo || question.assunto || 'Sem Assunto';
    
    if (!team.performanceBySubject) {
        team.performanceBySubject = {};
    }
    
    if (!team.performanceBySubject[subjectKey]) {
        team.performanceBySubject[subjectKey] = {
            displayName: subjectDisplay,
            total: 0,
            correct: 0,
            wrong: 0,
            performance: 0
        };
    }
    
    var subjectData = team.performanceBySubject[subjectKey];
    subjectData.total++;
    
    if (isCorrect) {
        subjectData.correct++;
    } else {
        subjectData.wrong++;
    }
    
    subjectData.performance = subjectData.total > 0 ? 
        Math.round((subjectData.correct / subjectData.total) * 100) : 0;
    
    console.log(team.name + ' (legacy) - ' + subjectDisplay + ': ' + 
               subjectData.correct + '/' + subjectData.total + ' (' + subjectData.performance + '%)');
}

// FUNÇÃO PARA VERIFICAR SE HÁ DADOS DE PERFORMANCE
function hasPerformanceData() {
    if (!window.teams || !Array.isArray(window.teams)) {
        return false;
    }
    
    var hasData = false;
    window.teams.forEach(function(team) {
        if (team && team.playerPerformance && Object.keys(team.playerPerformance).length > 0) {
            hasData = true;
        }
    });
    
    return hasData;
}

// Exportar funções de tracking
window.updateTeamPerformance = updateTeamPerformance;
window.updatePlayerPerformance = updatePlayerPerformance;
window.updateTeamAverageFromPlayers = updateTeamAverageFromPlayers;
window.updateLegacyTeamPerformance = updateLegacyTeamPerformance;
window.hasPerformanceData = hasPerformanceData;