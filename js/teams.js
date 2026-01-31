// file name: js/teams.js
// file content begin
window.teamColorSchemes = [
    {name: 'Vermelho', bg: 'team-bg-1', turn: 'team-color-1'},
    {name: 'Verde', bg: 'team-bg-2', turn: 'team-color-2'},
    {name: 'Amarelo', bg: 'team-bg-3', turn: 'team-color-3'},
    {name: 'Azul', bg: 'team-bg-4', turn: 'team-color-4'},
    {name: 'Rosa', bg: 'team-bg-5', turn: 'team-color-5'},
    {name: 'Ciano', bg: 'team-bg-6', turn: 'team-color-6'},
    {name: 'Roxo', bg: 'team-bg-7', turn: 'team-color-7'},
    {name: 'Laranja', bg: 'team-bg-8', turn: 'team-color-8'},
    {name: 'Vermelho Escuro', bg: 'team-bg-9', turn: 'team-color-9'},
    {name: 'Verde Escuro', bg: 'team-bg-10', turn: 'team-color-10'}
];

window.defaultTeamNames = ["ALFA", "BRAVO", "CHARLIE", "DELTA", "ECHO", "FOXTROT", "GOLF", "HOTEL", "INDIA", "JULIETT"];

function addTeam() {
    const container = document.getElementById('teams-container');
    const teamCount = container.children.length;
    const defaultName = window.defaultTeamNames[teamCount] || `Equipe ${teamCount + 1}`;
    
    const teamInput = document.createElement('div');
    teamInput.className = 'team-input';
    teamInput.innerHTML = `
        <input type="text" placeholder="Nome da Equipe" value="${defaultName}">
        <input type="text" placeholder="Jogadores (opcional)">
        <button class="remove-team" onclick="removeTeam(this)">🗑️</button>
    `;
    
    container.appendChild(teamInput);
    
    if (window.checkStartGame) {
        checkStartGame();
    }
}

function removeTeam(button) {
    const teamInput = button.parentElement;
    const totalTeams = document.querySelectorAll('.team-input').length;
    
    if (totalTeams > 1) {
        teamInput.remove();
        
        if (window.checkStartGame) {
            checkStartGame();
        }
        
        reorganizeTeamNames();
    } else {
        alert('⚠️ É necessário ter pelo menos uma equipe!');
    }
}

function reorganizeTeamNames() {
    document.querySelectorAll('.team-input').forEach((teamInput, index) => {
        const nameInput = teamInput.querySelector('input[type="text"]');
        const defaultName = window.defaultTeamNames[index] || `Equipe ${index + 1}`;
        
        if (window.defaultTeamNames.includes(nameInput.value) || nameInput.value.startsWith('Equipe ')) {
            nameInput.value = defaultName;
        }
    });
}

function updateTeamsDisplay() {
    if (!window.teams || !window.teams.length) return;
    
    const teamsDisplay = document.getElementById('teams-display');
    const activeTeamDisplay = document.getElementById('active-team-display');
    
    if (!teamsDisplay || !activeTeamDisplay) return;
    
    teamsDisplay.innerHTML = '';
    activeTeamDisplay.innerHTML = '';
    
    const activeTeam = window.teams[window.currentTeamIndex];
    const inactiveTeams = window.teams.filter((team, index) => index !== window.currentTeamIndex);
    
    if (activeTeam) {
        activeTeamDisplay.appendChild(createTeamCard(activeTeam, true));
    }
    
    const inactiveContainer = document.createElement('div');
    inactiveContainer.className = 'folga-teams-container';
    
    inactiveTeams.forEach(team => {
        inactiveContainer.appendChild(createTeamCard(team, false));
    });
    
    teamsDisplay.appendChild(inactiveContainer);
}

function createTeamCard(team, isActive) {
    const card = document.createElement('div');
    card.className = `team-card ${team.colorClass} ${isActive ? 'active' : ''}`;
    card.setAttribute('data-team-id', team.id);
    
    // Formatar jogadores com quebras de linha
    const playersHtml = team.players.map(playerName => {
        return `<div class="player-name">${playerName}</div>`;
    }).join('');
    
    // CABEÇALHO ORIGINAL: equipe/jogadores à esquerda, pontuação à direita
    // REMOVIDO: status DE PLANTÃO/FOLGA
    card.innerHTML = `
        <div class="team-card-header">
            <div class="team-info-left">
                <div class="team-name">${team.name}</div>
                <div class="team-players">${playersHtml || '<div class="no-players">Sem jogadores</div>'}</div>
            </div>
            <div class="team-info-right">
                <div class="team-score">${team.score}</div>
            </div>
        </div>
    `;
    
    // ADICIONAR SEÇÃO DE PERFORMANCE SE O SISTEMA ESTIVER ATIVO
    if (window.performanceSystemInitialized && team.performanceBySubject) {
        const performanceHtml = getFormattedPerformanceBySubject(team);
        const performanceDiv = document.createElement('div');
        performanceDiv.className = 'performance-display';
        performanceDiv.innerHTML = '<div class="performance-title">📊 Performance por Assunto:</div>' + performanceHtml;
        card.appendChild(performanceDiv);
    }
    
    return card;
}

// Função para obter performance formatada (será definida pelo teams-performance.js)
function getFormattedPerformanceBySubject(team) {
    if (typeof window.getFormattedPerformanceBySubject === 'function') {
        return window.getFormattedPerformanceBySubject(team);
    }
    return '<div class="no-performance">Nenhuma performance registrada</div>';
}

window.addTeam = addTeam;
window.removeTeam = removeTeam;
window.updateTeamsDisplay = updateTeamsDisplay;
window.createTeamCard = createTeamCard;
window.getFormattedPerformanceBySubject = getFormattedPerformanceBySubject;

console.log('teams.js carregado!');
// file content end