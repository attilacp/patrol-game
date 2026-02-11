// js/teams.js - CORRIGIDO (Erro 2 - Mostrar nome do jogador)
console.log('👥 teams.js carregando...');

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

// CORREÇÃO ERRO 2: Extrair nome do email
function extractNameFromEmail(email) {
    if (!email) return 'Jogador';
    return email.split('@')[0];
}

function addTeam() {
    const container = document.getElementById('teams-container');
    const teamCount = container.children.length;
    const defaultName = window.defaultTeamNames[teamCount] || `Equipe ${teamCount + 1}`;
    
    const teamInput = document.createElement('div');
    teamInput.className = 'team-input';
    teamInput.innerHTML = `
        <input type="text" placeholder="Nome da Equipe" value="${defaultName}">
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
    if (!window.teams || !window.teams.length) {
        console.log('⏳ Nenhuma equipe para exibir');
        return;
    }
    
    console.log('🔄 Atualizando display de equipes:', window.teams.length);
    
    const teamsDisplay = document.getElementById('teams-display');
    const activeTeamDisplay = document.getElementById('active-team-display');
    
    if (!teamsDisplay || !activeTeamDisplay) {
        console.error('❌ Elementos de display não encontrados');
        return;
    }
    
    teamsDisplay.innerHTML = '';
    activeTeamDisplay.innerHTML = '';
    
    const activeTeam = window.teams[window.currentTeamIndex || 0];
    const inactiveTeams = window.teams.filter((team, index) => index !== (window.currentTeamIndex || 0));
    
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
    card.className = `team-card ${team.colorClass || ''} ${isActive ? 'active' : ''}`;
    card.setAttribute('data-team-id', team.id || 0);
    
    // CORREÇÃO ERRO 2: Buscar jogadores e extrair nome do email
    let playersHtml = '<div class="no-players">Carregando...</div>';
    
    if (window.roomSystem && window.roomSystem.currentRoom) {
        if (team.assignedPlayers && Array.isArray(team.assignedPlayers) && team.assignedPlayers.length > 0) {
            playersHtml = team.assignedPlayers.map(playerEmail => {
                const playerName = extractNameFromEmail(playerEmail);
                return `<div class="player-name">👤 ${playerName}</div>`;
            }).join('');
        } else if (team.players && Array.isArray(team.players) && team.players.length > 0) {
            playersHtml = team.players.map(playerEmail => {
                const playerName = extractNameFromEmail(playerEmail);
                return `<div class="player-name">👤 ${playerName}</div>`;
            }).join('');
        } else {
            playersHtml = '<div class="no-players">Nenhum jogador</div>';
        }
    } else {
        playersHtml = '<div class="no-players">Modo offline</div>';
    }
    
    const colorClass = team.colorClass || 'team-bg-1';
    const turnClass = team.turnColorClass || 'team-color-1';
    
    card.innerHTML = `
        <div class="team-card-header">
            <div class="team-info-left">
                <div class="team-name">${team.name || 'Equipe'}</div>
                <div class="team-players">${playersHtml}</div>
            </div>
            <div class="team-info-right">
                <div class="team-score">${team.score || 0}</div>
            </div>
        </div>
    `;
    
    if (isActive) {
        const turnElement = document.getElementById('team-turn');
        if (turnElement) {
            turnElement.textContent = '🎯 ' + (team.name || 'Equipe') + ' - DE PLANTÃO';
            turnElement.className = 'team-turn ' + turnClass;
        }
    }
    
    return card;
}

function updateTeamPlayers(teamId, players) {
    if (!window.teams) return;
    
    const team = window.teams.find(t => t.id === teamId);
    if (!team) return;
    
    team.assignedPlayers = players;
    updateTeamsDisplay();
    
    console.log(`✅ Jogadores da equipe ${team.name} atualizados:`, players.map(extractNameFromEmail));
}

function getTeamByIndex(index) {
    return window.teams?.[index] || null;
}

function getTeamById(id) {
    return window.teams?.find(t => t.id === id) || null;
}

function addPointToTeam(teamIndex, points = 1) {
    if (!window.teams || !window.teams[teamIndex]) return;
    
    window.teams[teamIndex].score = (window.teams[teamIndex].score || 0) + points;
    updateTeamsDisplay();
    
    console.log(`+${points} ponto(s) para ${window.teams[teamIndex].name}`);
}

function subtractPointFromTeam(teamIndex, points = 1) {
    if (!window.teams || !window.teams[teamIndex]) return;
    
    window.teams[teamIndex].score = Math.max(0, (window.teams[teamIndex].score || 0) - points);
    updateTeamsDisplay();
    
    console.log(`-${points} ponto(s) de ${window.teams[teamIndex].name}`);
}

function resetAllScores() {
    if (!window.teams) return;
    
    window.teams.forEach(team => {
        team.score = 0;
    });
    
    updateTeamsDisplay();
    console.log('📊 Pontuações resetadas');
}

function getWinningTeam() {
    if (!window.teams || window.teams.length === 0) return null;
    
    return window.teams.reduce((winner, current) => {
        return (current.score || 0) > (winner.score || 0) ? current : winner;
    });
}

function sortTeamsByScore() {
    if (!window.teams) return [];
    
    return [...window.teams].sort((a, b) => (b.score || 0) - (a.score || 0));
}

function getRandomTeamColor() {
    const usedColors = window.teams ? window.teams.map(t => t.colorIndex || 0) : [];
    
    for (let i = 0; i < window.teamColorSchemes.length; i++) {
        if (!usedColors.includes(i)) {
            return i;
        }
    }
    
    return Math.floor(Math.random() * window.teamColorSchemes.length);
}

// Exportar funções
window.extractNameFromEmail = extractNameFromEmail;
window.addTeam = addTeam;
window.removeTeam = removeTeam;
window.reorganizeTeamNames = reorganizeTeamNames;
window.updateTeamsDisplay = updateTeamsDisplay;
window.createTeamCard = createTeamCard;
window.updateTeamPlayers = updateTeamPlayers;
window.getTeamByIndex = getTeamByIndex;
window.getTeamById = getTeamById;
window.addPointToTeam = addPointToTeam;
window.subtractPointFromTeam = subtractPointFromTeam;
window.resetAllScores = resetAllScores;
window.getWinningTeam = getWinningTeam;
window.sortTeamsByScore = sortTeamsByScore;
window.getRandomTeamColor = getRandomTeamColor;

console.log('✅ teams.js carregado!');
