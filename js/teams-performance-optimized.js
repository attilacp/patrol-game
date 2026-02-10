// js/teams-performance-optimized.js - Performance otimizado
console.log('📊 Sistema de performance otimizado carregando...');

const PerformanceSystem = {
    KEYS: {
        player: 'patrol_player_performance',
        team: 'patrol_team_performance'
    },

    init() {
        if (!window.teams?.length) return;

        window.teams.forEach(team => {
            if (team.players?.length) {
                team.players.forEach(playerName => {
                    const key = playerName.trim().toLowerCase();
                    if (!team.playerPerformance) team.playerPerformance = {};
                    if (!team.playerPerformance[key]) {
                        team.playerPerformance[key] = {
                            name: playerName.trim(),
                            performanceBySubject: {},
                            questionsBySubject: {},
                            totalCorrect: 0,
                            totalAnswered: 0
                        };
                    }
                });
            }

            if (!team.performanceBySubject) team.performanceBySubject = {};
            if (!team.questionsBySubject) team.questionsBySubject = {};
        });

        this.loadSaved();
        this.addCSS();
        this.setupEvents();
    },

    setupEvents() {
        document.addEventListener('answerGiven', e => {
            if (e.detail?.team && e.detail?.question && e.detail.isCorrect !== undefined) {
                this.update(e.detail.team, e.detail.question, e.detail.isCorrect);
                setTimeout(() => window.updateTeamsDisplay?.(), 100);
            }
        });
    },

    update(team, question, isCorrect) {
        if (!team || !question) return;

        if (team.players?.length) {
            team.players.forEach(name => this.updatePlayer(team, name, question, isCorrect));
            this.updateTeamAverage(team);
        } else {
            this.updateLegacy(team, question, isCorrect);
        }

        setTimeout(() => this.save(), 100);
        setTimeout(() => window.updateTeamsDisplay?.(), 150);
    },

    updatePlayer(team, playerName, question, isCorrect) {
        const key = playerName.trim().toLowerCase();
        
        if (!team.playerPerformance) team.playerPerformance = {};
        if (!team.playerPerformance[key]) {
            team.playerPerformance[key] = {
                name: playerName.trim(),
                performanceBySubject: {},
                questionsBySubject: {},
                totalCorrect: 0,
                totalAnswered: 0
            };
        }

        const player = team.playerPerformance[key];
        const subject = question.assunto || 'Sem Assunto';
        const display = question.assuntoInfo || question.assunto || 'Sem Assunto';

        if (!player.performanceBySubject[subject]) {
            player.performanceBySubject[subject] = {
                displayName: display,
                total: 0,
                correct: 0,
                wrong: 0,
                performance: 0
            };
        }

        if (!player.questionsBySubject[subject]) {
            player.questionsBySubject[subject] = [];
        }

        const perf = player.performanceBySubject[subject];
        perf.total++;
        isCorrect ? perf.correct++ : perf.wrong++;
        perf.performance = Math.round((perf.correct / perf.total) * 100);

        player.totalAnswered++;
        if (isCorrect) player.totalCorrect++;

        if (player.questionsBySubject[subject].length > 10) {
            player.questionsBySubject[subject].shift();
        }

        player.questionsBySubject[subject].push({
            question: question.enunciado?.substring(0, 50) + '...',
            correct: isCorrect,
            timestamp: new Date().toISOString()
        });
    },

    updateTeamAverage(team) {
        if (!team.playerPerformance) return;

        const aggregates = {};

        Object.values(team.playerPerformance).forEach(player => {
            Object.entries(player.performanceBySubject || {}).forEach(([subject, data]) => {
                if (!aggregates[subject]) {
                    aggregates[subject] = {
                        totalQuestions: 0,
                        totalCorrect: 0,
                        players: []
                    };
                }

                aggregates[subject].totalQuestions += data.total || 0;
                aggregates[subject].totalCorrect += data.correct || 0;

                if (data.total > 0 && !aggregates[subject].players.includes(player.name)) {
                    aggregates[subject].players.push(player.name);
                }
            });
        });

        team.performanceBySubject = {};

        Object.entries(aggregates).forEach(([subject, agg]) => {
            if (agg.players.length > 0) {
                const players = Object.values(team.playerPerformance);
                const player = players.find(p => p.performanceBySubject[subject]);
                const displayName = player?.performanceBySubject[subject].displayName || subject;

                team.performanceBySubject[subject] = {
                    displayName,
                    totalQuestions: agg.totalQuestions,
                    totalCorrect: agg.totalCorrect,
                    averageCorrect: Math.round(agg.totalCorrect / agg.players.length),
                    averagePerformance: Math.round((agg.totalCorrect / agg.totalQuestions) * 100),
                    playerCount: agg.players.length,
                    players: agg.players
                };
            }
        });
    },

    updateLegacy(team, question, isCorrect) {
        const subject = question.assunto || 'Sem Assunto';
        const display = question.assuntoInfo || question.assunto || 'Sem Assunto';

        if (!team.performanceBySubject[subject]) {
            team.performanceBySubject[subject] = {
                displayName: display,
                total: 0,
                correct: 0,
                wrong: 0,
                performance: 0
            };
        }

        const perf = team.performanceBySubject[subject];
        perf.total++;
        isCorrect ? perf.correct++ : perf.wrong++;
        perf.performance = Math.round((perf.correct / perf.total) * 100);
    },

    save() {
        if (!window.teams?.length) return;

        const playerData = { timestamp: new Date().toISOString(), version: '2.0', players: {} };
        const teamData = { timestamp: new Date().toISOString(), version: '2.0', teams: {} };

        window.teams.forEach(team => {
            if (team.playerPerformance) {
                Object.values(team.playerPerformance).forEach(player => {
                    if (player.name) {
                        const key = player.name.toLowerCase();
                        playerData.players[key] = {
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

            teamData.teams[team.name] = {
                name: team.name,
                performanceBySubject: team.performanceBySubject || {},
                questionsBySubject: team.questionsBySubject || {},
                playerCount: team.players?.length || 0,
                lastUpdated: new Date().toISOString()
            };
        });

        localStorage.setItem(this.KEYS.player, JSON.stringify(playerData));
        localStorage.setItem(this.KEYS.team, JSON.stringify(teamData));
    },

    loadSaved() {
        try {
            const saved = localStorage.getItem(this.KEYS.player);
            if (saved) {
                const data = JSON.parse(saved);
                window.teams?.forEach(team => {
                    team.players?.forEach(name => {
                        const key = name.trim().toLowerCase();
                        if (data.players[key]) {
                            if (!team.playerPerformance) team.playerPerformance = {};
                            team.playerPerformance[key] = data.players[key];
                        }
                    });
                });
            }

            const savedTeams = localStorage.getItem(this.KEYS.team);
            if (savedTeams) {
                const data = JSON.parse(savedTeams);
                window.teams?.forEach(team => {
                    if (data.teams[team.name]) {
                        team.performanceBySubject = data.teams[team.name].performanceBySubject || {};
                        team.questionsBySubject = data.teams[team.name].questionsBySubject || {};
                    }
                });
            }

            return true;
        } catch (err) {
            localStorage.removeItem(this.KEYS.player);
            localStorage.removeItem(this.KEYS.team);
            return false;
        }
    },

    reset() {
        window.teams?.forEach(team => {
            team.performanceBySubject = {};
            team.questionsBySubject = {};
            team.playerPerformance = {};
        });
        return true;
    },

    getFormatted(team) {
        if (!team?.playerPerformance || !Object.keys(team.playerPerformance).length) {
            return '<div class="no-performance">Nenhuma performance registrada</div>';
        }

        const players = Object.values(team.playerPerformance);
        const count = players.length;

        let html = '<div class="performance-container">';

        if (count === 1) {
            // Single player
            const player = players[0];
            html += '<div class="performance-section-title">👤 Jogador:</div>';

            if (player.performanceBySubject && Object.keys(player.performanceBySubject).length) {
                const sorted = Object.entries(player.performanceBySubject)
                    .sort((a, b) => b[1].total !== a[1].total ? b[1].total - a[1].total : b[1].performance - a[1].performance);

                sorted.forEach(([_, data]) => {
                    if (data.total > 0) {
                        const cls = data.performance >= 80 ? 'high' : data.performance >= 60 ? 'medium' : 'low';
                        html += `
                            <div class="subject-performance">
                                <div class="performance-row">
                                    <div class="subject-name">${data.displayName}</div>
                                    <div class="performance-info performance-${cls}">
                                        ${data.correct}/${data.total} (${data.performance}%)
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                });
            }
        } else {
            // Multiple players - show average
            html += '<div class="performance-section-title">👥 Média da Equipe:</div>';

            const averages = this.calculateAverages(team);

            if (averages.length) {
                averages.sort((a, b) => b.totalQuestions !== a.totalQuestions ? b.totalQuestions - a.totalQuestions : b.averagePerformance - a.averagePerformance);

                averages.forEach(avg => {
                    const cls = avg.averagePerformance >= 80 ? 'high' : avg.averagePerformance >= 60 ? 'medium' : 'low';
                    html += `
                        <div class="subject-performance">
                            <div class="performance-row">
                                <div class="subject-name">${avg.subjectName}</div>
                                <div class="performance-info performance-${cls}">
                                    ${Math.round(avg.averageCorrect)}/${avg.totalQuestions} (${avg.averagePerformance}%)
                                    <span class="player-count">(${avg.playerCount} jogador${avg.playerCount > 1 ? 'es' : ''})</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }

            // Details per player
            html += '<details class="players-details"><summary>📋 Ver por jogador</summary>';
            players.forEach(player => {
                html += `<div class="player-performance-section"><div class="player-name-header">${player.name}</div>`;

                if (player.performanceBySubject && Object.keys(player.performanceBySubject).length) {
                    Object.entries(player.performanceBySubject)
                        .sort((a, b) => b[1].total - a[1].total)
                        .forEach(([_, data]) => {
                            if (data.total > 0) {
                                const cls = data.performance >= 80 ? 'high' : data.performance >= 60 ? 'medium' : 'low';
                                html += `
                                    <div class="subject-performance">
                                        <div class="performance-row">
                                            <div class="subject-name">${data.displayName}</div>
                                            <div class="performance-info performance-${cls}">
                                                ${data.correct}/${data.total} (${data.performance}%)
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }
                        });
                }

                html += '</div>';
            });
            html += '</details>';
        }

        html += '</div>';
        return html;
    },

    calculateAverages(team) {
        const map = {};

        Object.values(team.playerPerformance).forEach(player => {
            Object.entries(player.performanceBySubject || {}).forEach(([subject, data]) => {
                if (!map[subject]) {
                    map[subject] = {
                        subjectName: data.displayName || subject,
                        totalCorrect: 0,
                        totalQuestions: 0,
                        players: []
                    };
                }

                map[subject].totalCorrect += data.correct || 0;
                map[subject].totalQuestions += data.total || 0;

                if (data.total > 0 && !map[subject].players.includes(player.name)) {
                    map[subject].players.push(player.name);
                }
            });
        });

        return Object.entries(map).map(([_, data]) => ({
            subjectName: data.subjectName,
            averageCorrect: data.totalCorrect / data.players.length,
            totalQuestions: data.totalQuestions,
            averagePerformance: Math.round((data.totalCorrect / data.totalQuestions) * 100),
            playerCount: data.players.length,
            players: data.players
        })).filter(a => a.totalQuestions > 0 && a.playerCount > 0);
    },

    addCSS() {
        if (document.getElementById('perf-css')) return;

        const css = `
.performance-display{margin-top:10px;padding:10px;background:rgba(255,255,255,0.9);border-radius:8px;border:2px solid #003366;font-size:0.85em;max-height:420px;overflow-y:auto;flex:1}
.performance-section-title{font-weight:bold;color:#003366;margin:10px 0 5px 0;font-size:0.9em;border-bottom:1px solid #dee2e6;padding-bottom:4px}
.player-performance-section{margin-bottom:15px;padding:8px;background:rgba(0,51,102,0.05);border-radius:6px}
.player-name-header{font-weight:bold;color:#003366;font-size:0.9em;margin-bottom:5px;padding-left:5px;border-left:3px solid #FFCC00}
.player-count{font-size:0.7em;color:#666;font-style:italic;margin-left:5px}
.performance-container{display:flex;flex-direction:column;gap:6px}
.subject-performance{display:flex;flex-direction:column;gap:4px}
.performance-row{display:flex;justify-content:space-between;align-items:center;gap:10px}
.subject-name{font-size:0.85em;color:#003366;font-weight:bold;flex:1}
.performance-info{font-size:0.8em;font-weight:bold;text-align:right;white-space:nowrap;min-width:80px}
.performance-high{color:#2E7D32}
.performance-medium{color:#F57C00}
.performance-low{color:#D32F2F}
.no-performance{text-align:center;color:#999;font-style:italic;padding:15px 0}
.players-details{margin-top:10px;border:1px solid #dee2e6;border-radius:6px}
.players-summary{padding:8px 12px;background:#f8f9fa;cursor:pointer;font-weight:bold;color:#003366;font-size:0.85em;transition:background 0.3s}
.players-summary:hover{background:#e9ecef}
.players-details[open] .players-summary{background:#e9ecef}
        `;

        const style = document.createElement('style');
        style.id = 'perf-css';
        style.textContent = css;
        document.head.appendChild(style);
    }
};

// Export
window.PerformanceSystem = PerformanceSystem;
window.initializeTeamPerformanceTracking = () => PerformanceSystem.init();
window.updateTeamPerformance = (t, q, c) => PerformanceSystem.update(t, q, c);
window.getFormattedPerformanceBySubject = (t) => PerformanceSystem.getFormatted(t);
window.savePerformanceToStorage = () => PerformanceSystem.save();
window.loadSavedPerformance = () => PerformanceSystem.loadSaved();
window.resetTeamPerformance = () => PerformanceSystem.reset();

console.log('✅ teams-performance-optimized.js carregado');
