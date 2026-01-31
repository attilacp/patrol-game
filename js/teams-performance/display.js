// file name: js/teams-performance/display.js
// Funções de exibição de performance POR JOGADOR com média da equipe

function getFormattedPerformanceBySubject(team) {
    if (!team) {
        return '<div class="no-performance">Nenhuma performance registrada</div>';
    }
    
    // VERIFICAR SE TEM PERFORMANCE POR JOGADOR
    var hasPlayerPerformance = team.playerPerformance && 
                              Object.keys(team.playerPerformance).length > 0;
    
    if (!hasPlayerPerformance) {
        return '<div class="no-performance">Nenhuma performance registrada</div>';
    }
    
    var html = '<div class="performance-container">';
    
    try {
        var players = Object.values(team.playerPerformance);
        var playerCount = players.length;
        
        if (playerCount === 1) {
            // SE SÓ TEM 1 JOGADOR: MOSTRAR SEUS DADOS DIRETAMENTE
            var player = players[0];
            html += '<div class="performance-section-title">👤 Jogador:</div>';
            
            if (player.performanceBySubject && Object.keys(player.performanceBySubject).length > 0) {
                var playerSubjects = Object.entries(player.performanceBySubject)
                    .sort(function(a, b) {
                        if (b[1].total !== a[1].total) {
                            return b[1].total - a[1].total;
                        }
                        return b[1].performance - a[1].performance;
                    });
                
                playerSubjects.forEach(function(subjectEntry) {
                    var data = subjectEntry[1];
                    if (data && data.total > 0) {
                        var performanceClass = getPerformanceClass(data.performance);
                        
                        html += '<div class="subject-performance player-subject">';
                        html += '<div class="performance-row">';
                        html += '<div class="subject-name">' + (data.displayName || subjectEntry[0]) + '</div>';
                        html += '<div class="performance-info ' + performanceClass + '">';
                        html += data.correct + '/' + data.total + ' (' + data.performance + '%)';
                        html += '</div>';
                        html += '</div>';
                        html += '</div>';
                    }
                });
            } else {
                html += '<div class="no-performance">Nenhuma performance registrada</div>';
            }
            
        } else {
            // SE TEM MAIS DE 1 JOGADOR: MOSTRAR MÉDIA DA EQUIPE
            html += '<div class="performance-section-title">👥 Média da Equipe:</div>';
            
            // CALCULAR MÉDIA POR ASSUNTO
            var teamAverages = calculateTeamAverages(team);
            
            if (teamAverages.length > 0) {
                teamAverages.sort(function(a, b) {
                    if (b.totalQuestions !== a.totalQuestions) {
                        return b.totalQuestions - a.totalQuestions;
                    }
                    return b.averagePerformance - a.averagePerformance;
                });
                
                teamAverages.forEach(function(subjectAvg) {
                    var performanceClass = getPerformanceClass(subjectAvg.averagePerformance);
                    
                    html += '<div class="subject-performance team-subject">';
                    html += '<div class="performance-row">';
                    html += '<div class="subject-name">' + subjectAvg.subjectName + '</div>';
                    html += '<div class="performance-info ' + performanceClass + '">';
                    html += Math.round(subjectAvg.averageCorrect) + '/' + subjectAvg.totalQuestions + 
                           ' (' + subjectAvg.averagePerformance + '%)';
                    html += '<span class="player-count"> (' + subjectAvg.playerCount + ' jogador' + 
                           (subjectAvg.playerCount > 1 ? 'es' : '') + ')</span>';
                    html += '</div>';
                    html += '</div>';
                    html += '</div>';
                });
            } else {
                html += '<div class="no-performance">Nenhuma performance registrada</div>';
            }
            
            // OPCIONAL: Mostrar performance por jogador em seção recolhível
            html += '<details class="players-details">';
            html += '<summary class="players-summary">📋 Ver por jogador</summary>';
            
            players.forEach(function(player, index) {
                html += '<div class="player-performance-section">';
                html += '<div class="player-name-header">' + player.name + '</div>';
                
                if (player.performanceBySubject && Object.keys(player.performanceBySubject).length > 0) {
                    var playerSubjects = Object.entries(player.performanceBySubject)
                        .sort(function(a, b) {
                            if (b[1].total !== a[1].total) {
                                return b[1].total - a[1].total;
                            }
                            return b[1].performance - a[1].performance;
                        });
                    
                    playerSubjects.forEach(function(subjectEntry) {
                        var data = subjectEntry[1];
                        if (data && data.total > 0) {
                            var performanceClass = getPerformanceClass(data.performance);
                            
                            html += '<div class="subject-performance player-subject">';
                            html += '<div class="performance-row">';
                            html += '<div class="subject-name">' + (data.displayName || subjectEntry[0]) + '</div>';
                            html += '<div class="performance-info ' + performanceClass + '">';
                            html += data.correct + '/' + data.total + ' (' + data.performance + '%)';
                            html += '</div>';
                            html += '</div>';
                            html += '</div>';
                        }
                    });
                } else {
                    html += '<div class="no-performance">Nenhuma performance</div>';
                }
                
                html += '</div>';
            });
            
            html += '</details>';
        }
        
    } catch (error) {
        console.error('Erro ao formatar performance:', error);
        html += '<div class="no-performance">Erro ao carregar performance</div>';
    }
    
    html += '</div>';
    return html;
}

function calculateTeamAverages(team) {
    var subjectMap = {};
    
    // AGRUPAR DADOS POR ASSUNTO
    Object.values(team.playerPerformance).forEach(function(player) {
        Object.entries(player.performanceBySubject || {}).forEach(function([subjectKey, playerData]) {
            if (!subjectMap[subjectKey]) {
                subjectMap[subjectKey] = {
                    subjectName: playerData.displayName || subjectKey,
                    totalCorrect: 0,
                    totalQuestions: 0,
                    playerCount: 0,
                    players: []
                };
            }
            
            subjectMap[subjectKey].totalCorrect += playerData.correct || 0;
            subjectMap[subjectKey].totalQuestions += playerData.total || 0;
            
            // Contar jogador apenas se tiver dados neste assunto
            if (playerData.total > 0 && !subjectMap[subjectKey].players.includes(player.name)) {
                subjectMap[subjectKey].players.push(player.name);
                subjectMap[subjectKey].playerCount++;
            }
        });
    });
    
    // CALCULAR MÉDIAS
    var averages = [];
    Object.entries(subjectMap).forEach(function([subjectKey, data]) {
        if (data.totalQuestions > 0 && data.playerCount > 0) {
            var averageCorrect = data.totalCorrect / data.playerCount;
            var averagePerformance = Math.round((data.totalCorrect / data.totalQuestions) * 100);
            
            averages.push({
                subjectKey: subjectKey,
                subjectName: data.subjectName,
                averageCorrect: averageCorrect,
                totalQuestions: data.totalQuestions,
                averagePerformance: averagePerformance,
                playerCount: data.playerCount,
                players: data.players
            });
        }
    });
    
    return averages;
}

function getPerformanceClass(percentage) {
    if (percentage >= 80) return 'performance-high';
    if (percentage >= 60) return 'performance-medium';
    return 'performance-low';
}

// CSS adicional para performance por jogador
var performanceCSS = '.performance-display {margin-top: 10px; padding: 10px; background: rgba(255, 255, 255, 0.9); border-radius: 8px; border: 2px solid #003366; font-size: 0.85em; max-height: 420px; overflow-y: auto; flex: 1;} .performance-section-title {font-weight: bold; color: #003366; margin: 10px 0 5px 0; font-size: 0.9em; text-align: left; border-bottom: 1px solid #dee2e6; padding-bottom: 4px;} .player-performance-section {margin-bottom: 15px; padding: 8px; background: rgba(0, 51, 102, 0.05); border-radius: 6px;} .player-name-header {font-weight: bold; color: #003366; font-size: 0.9em; margin-bottom: 5px; padding-left: 5px; border-left: 3px solid #FFCC00;} .player-subject {margin-left: 10px; font-size: 0.8em;} .team-subject {margin-left: 5px;} .player-count {font-size: 0.7em; color: #666; font-style: italic; margin-left: 5px;} .performance-container {display: flex; flex-direction: column; gap: 6px;} .subject-performance {display: flex; flex-direction: column; gap: 4px;} .performance-row {display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 10px;} .subject-name {font-size: 0.85em; color: #003366; font-weight: bold; text-align: left; flex: 1; white-space: normal; overflow: visible; text-overflow: clip; line-height: 1.4;} .performance-info {font-size: 0.8em; font-weight: bold; color: #003366; text-align: right; white-space: nowrap; min-width: 80px;} .performance-high {color: #2E7D32;} .performance-medium {color: #F57C00;} .performance-low {color: #D32F2F;} .no-performance {text-align: center; color: #999; font-style: italic; font-size: 0.9em; padding: 15px 0;} .players-details {margin-top: 10px; border: 1px solid #dee2e6; border-radius: 6px; overflow: hidden;} .players-summary {padding: 8px 12px; background: #f8f9fa; cursor: pointer; font-weight: bold; color: #003366; font-size: 0.85em; transition: background 0.3s;} .players-summary:hover {background: #e9ecef;} .players-details[open] .players-summary {background: #e9ecef;}';

function addPerformanceCSS() {
    if (!document.getElementById('performance-css')) {
        var style = document.createElement('style');
        style.id = 'performance-css';
        style.textContent = performanceCSS;
        document.head.appendChild(style);
        console.log('CSS de performance (jogadores) adicionado');
    }
}

// Exportar funções de display
window.getFormattedPerformanceBySubject = getFormattedPerformanceBySubject;
window.calculateTeamAverages = calculateTeamAverages;
window.addPerformanceCSS = addPerformanceCSS;