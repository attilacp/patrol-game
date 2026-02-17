// PATROL - Sistema de Equipes
console.log('👥 Teams carregando...');

const TeamSystem = {
    teams: [],
    currentTeamIndex: 0,
    
    init() {
        this.setupEventListeners();
        console.log('✅ Teams inicializado');
    },
    
    setupEventListeners() {
        document.getElementById('add-team-btn')?.addEventListener('click', () => {
            this.addTeam();
        });
    },
    
    addTeam() {
        const container = document.getElementById('teams-container');
        if (!container) return;
        
        const teamCount = container.children.length;
        const defaultName = CONFIG.teams.defaultNames[teamCount] || `Equipe ${teamCount + 1}`;
        
        const teamInput = document.createElement('div');
        teamInput.className = 'team-input';
        teamInput.innerHTML = `
            <input type="text" placeholder="Nome da Equipe" value="${defaultName}">
            <button class="remove-team" onclick="TeamSystem.removeTeam(this)">🗑️</button>
        `;
        
        container.appendChild(teamInput);
        this.validateTeams();
    },
    
    removeTeam(button) {
        const container = document.getElementById('teams-container');
        const totalTeams = container?.querySelectorAll('.team-input').length || 0;
        
        if (totalTeams > 1) {
            button.parentElement.remove();
            this.validateTeams();
            this.reorganizeTeamNames();
        } else {
            Utils.notify('⚠️ É necessário ter pelo menos uma equipe!', 'warning');
        }
    },
    
    reorganizeTeamNames() {
        document.querySelectorAll('.team-input').forEach((teamInput, index) => {
            const nameInput = teamInput.querySelector('input[type="text"]');
            const currentValue = nameInput.value;
            const defaultName = CONFIG.teams.defaultNames[index] || `Equipe ${index + 1}`;
            
            if (CONFIG.teams.defaultNames.includes(currentValue) || currentValue.startsWith('Equipe ')) {
                nameInput.value = defaultName;
            }
        });
    },
    
    collectTeams() {
        this.teams = [];
        
        document.querySelectorAll('.team-input').forEach((input, index) => {
            const teamNameInput = input.querySelector('input[type="text"]');
            const teamName = teamNameInput?.value.trim();
            
            if (teamName) {
                const colorScheme = CONFIG.teams.colors[index % CONFIG.teams.colors.length];
                
                this.teams.push({
                    id: index + 1,
                    name: teamName,
                    score: 0,
                    questionsAnswered: 0,
                    questionsCorrect: 0,
                    questionsWrong: 0,
                    colorClass: colorScheme.bg,
                    turnColorClass: colorScheme.turn,
                    colorName: colorScheme.name,
                    assignedPlayers: []
                });
            }
        });
        
        console.log(`👥 ${this.teams.length} equipes coletadas`);
        return this.teams;
    },
    
    updateDisplay() {
        if (!this.teams || this.teams.length === 0) {
            console.log('⏳ Nenhuma equipe para exibir');
            return;
        }
        
        const teamsDisplay = document.getElementById('teams-display');
        const activeTeamDisplay = document.getElementById('active-team-display');
        
        if (!teamsDisplay) return;
        
        teamsDisplay.innerHTML = '';
        if (activeTeamDisplay) activeTeamDisplay.innerHTML = '';
        
        const activeTeam = this.teams[this.currentTeamIndex];
        const inactiveTeams = this.teams.filter((_, index) => index !== this.currentTeamIndex);
        
        if (activeTeam && activeTeamDisplay) {
            activeTeamDisplay.appendChild(this.createTeamCard(activeTeam, true));
        }
        
        inactiveTeams.forEach(team => {
            teamsDisplay.appendChild(this.createTeamCard(team, false));
        });
        
        this.updateTurnDisplay();
    },
    
    createTeamCard(team, isActive) {
        const card = document.createElement('div');
        card.className = `team-card ${team.colorClass} ${isActive ? 'active' : ''}`;
        
        let playersHtml = '';
        if (team.assignedPlayers && team.assignedPlayers.length > 0) {
            playersHtml = team.assignedPlayers.map(p => `<div class="player-name">👤 ${p}</div>`).join('');
        } else {
            playersHtml = '<div class="player-name" style="color: #999; font-style: italic;">Aguardando jogadores...</div>';
        }
        
        card.innerHTML = `
            <div class="team-card-header">
                <div class="team-info-left">
                    <div class="team-name">${team.name}</div>
                    ${playersHtml}
                </div>
                <div class="team-info-right">
                    <div class="team-score">${team.score || 0}</div>
                </div>
            </div>
        `;
        
        return card;
    },
    
    updateTurnDisplay() {
        const teamTurn = document.getElementById('team-turn');
        if (!teamTurn) return;
        
        const currentTeam = this.teams[this.currentTeamIndex];
        if (currentTeam) {
            teamTurn.textContent = `🎯 ${currentTeam.name} - DE PLANTÃO`;
            teamTurn.className = `team-turn ${currentTeam.turnColorClass}`;
        }
    },
    
    rotateTeam() {
        if (this.teams.length === 0) return;
        
        const oldTeam = this.teams[this.currentTeamIndex]?.name || 'Equipe';
        this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;
        const newTeam = this.teams[this.currentTeamIndex]?.name || 'Equipe';
        
        console.log(`🔄 Rodízio: ${oldTeam} → ${newTeam}`);
        
        this.updateDisplay();
        Utils.notify(`🔄 Rodízio: ${newTeam} agora está de plantão`, 'info');
    },
    
    updateScore(teamIndex, points) {
        if (!this.teams[teamIndex]) return;
        
        const team = this.teams[teamIndex];
        team.score += points;
        team.questionsAnswered++;
        
        if (points > 0) {
            team.questionsCorrect++;
        } else if (points < 0) {
            team.questionsWrong++;
        }
        
        this.updateDisplay();
        
        if (team.score >= CONFIG.game.winningScore) {
            return { winner: team };
        }
        
        return { winner: null };
    },
    
    validateTeams() {
        const container = document.getElementById('teams-container');
        const teamInputs = container?.querySelectorAll('.team-input') || [];
        let hasValidTeams = false;
        
        teamInputs.forEach(input => {
            const teamInput = input.querySelector('input[type="text"]');
            if (teamInput && teamInput.value.trim()) {
                hasValidTeams = true;
            }
        });
        
        const teamError = document.getElementById('team-error');
        if (teamError) {
            teamError.style.display = hasValidTeams ? 'none' : 'block';
        }
        
        this.updateStartButton();
        
        return hasValidTeams;
    },
    
    updateStartButton() {
        const hasTeams = this.validateTeamsOnly();
        const hasQuestions = window.QuestionSystem ? window.QuestionSystem.validateQuestionsOnly() : false;
        const canStart = hasTeams && hasQuestions;
        
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.disabled = !canStart;
            startBtn.className = canStart ? 'start-game-btn enabled' : 'start-game-btn disabled';
        }
    },
    
    validateTeamsOnly() {
        const container = document.getElementById('teams-container');
        const teamInputs = container?.querySelectorAll('.team-input') || [];
        
        for (let input of teamInputs) {
            const teamInput = input.querySelector('input[type="text"]');
            if (teamInput && teamInput.value.trim()) {
                return true;
            }
        }
        return false;
    }
};

window.TeamSystem = TeamSystem;
window.removeTeam = (button) => TeamSystem.removeTeam(button);

document.addEventListener('templatesLoaded', () => {
    TeamSystem.init();
});

console.log('✅ Teams carregado');
