// js/teams.js - VERSÃO CORRIGIDA SEM CAMPO DE JOGADORES NA CONFIG
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
    
    // BUSCAR JOGADORES ATRIBUÍDOS A ESTA EQUIPE
    let playersHtml = '<div class="no-players">Carregando jogadores...</div>';
    
    // Verificar se há sistema de salas e buscar jogadores do Firebase
    if (window.roomSystem && window.roomSystem.currentRoom) {
        // Usar dados locais se disponíveis
        if (team.assignedPlayers && Array.isArray(team.assignedPlayers) && team.assignedPlayers.length > 0) {
            playersHtml = team.assignedPlayers.map(playerName => {
                return `<div class="player-name">👤 ${playerName}</div>`;
            }).join('');
        } else if (team.players && Array.isArray(team.players) && team.players.length > 0) {
            playersHtml = team.players.map(playerName => {
                return `<div class="player-name">👤 ${playerName}</div>`;
            }).join('');
        } else {
            playersHtml = '<div class="no-players">Nenhum jogador ainda</div>';
        }
    } else {
        // Modo offline - mostrar placeholder
        playersHtml = '<div class="no-players">Modo offline</div>';
    }
    
    // Garantir que as classes de cor existam
    const colorClass = team.colorClass || 'team-bg-1';
    const turnClass = team.turnColorClass || 'team-color-1';
    
    card.innerHTML = `
        <div class="team-card-header">
            <div class="team-info-left">
                <div class="team-name">${team.name || 'Equipe Sem Nome'}</div>
                <div class="team-players">${playersHtml}</div>
            </div>
            <div class="team-info-right">
                <div class="team-score">${team.score || 0}</div>
            </div>
        </div>
    `;
    
    // Adicionar classe de turno se for a equipe ativa
    if (isActive) {
        const turnElement = document.getElementById('team-turn');
        if (turnElement) {
            turnElement.textContent = '🎯 ' + (team.name || 'Equipe') + ' - DE PLANTÃO';
            turnElement.className = 'team-turn ' + turnClass;
        }
    }
    
    return card;
}

// Função para atualizar jogadores nas equipes (chamada pelo sistema de salas)
function updateTeamPlayers(teamId, players) {
    if (!window.teams) return;
    
    const team = window.teams.find(t => t.id === teamId);
    if (team) {
        team.assignedPlayers = Array.isArray(players) ? players : [];
        console.log(`👥 Equipe ${team.name} atualizada:`, team.assignedPlayers);
        
        // Atualizar display
        if (window.updateTeamsDisplay) {
            window.updateTeamsDisplay();
        }
    }
}

// Função para buscar jogadores de todas as equipes do Firebase
async function fetchAllTeamPlayers() {
    if (!window.roomSystem || !window.roomSystem.currentRoom || !window.teams) return;
    
    try {
        const playersRef = firebase.database().ref('rooms/' + window.roomSystem.currentRoom + '/players');
        const snapshot = await playersRef.once('value');
        const allPlayers = snapshot.val() || {};
        
        // Limpar jogadores anteriores
        window.teams.forEach(team => {
            team.assignedPlayers = [];
        });
        
        // Agrupar jogadores por equipe
        for (const playerId in allPlayers) {
            const player = allPlayers[playerId];
            if (player.teamId && player.name) {
                const team = window.teams.find(t => t.id === player.teamId);
                if (team) {
                    if (!team.assignedPlayers) team.assignedPlayers = [];
                    team.assignedPlayers.push(player.name);
                }
            }
        }
        
        console.log('👥 Jogadores carregados por equipe');
        
        // Atualizar display
        if (window.updateTeamsDisplay) {
            window.updateTeamsDisplay();
        }
        
    } catch (error) {
        console.error('❌ Erro ao buscar jogadores:', error);
    }
}

// Iniciar busca periódica de jogadores
if (typeof window !== 'undefined') {
    window.startTeamPlayersSync = function() {
        if (window.roomSystem && window.roomSystem.currentRoom) {
            setInterval(fetchAllTeamPlayers, 5000); // Atualizar a cada 5 segundos
            console.log('🔄 Sincronização de jogadores iniciada');
        }
    };
}

// Função simplificada para performance
function getFormattedPerformanceBySubject(team) {
    if (!team.performanceBySubject || Object.keys(team.performanceBySubject).length === 0) {
        return '<div class="no-performance">Nenhuma performance registrada</div>';
    }
    
    let html = '';
    for (const subject in team.performanceBySubject) {
        const perf = team.performanceBySubject[subject];
        html += `<div class="performance-row">
            <span class="performance-subject">${subject}</span>
            <span class="performance-value">${perf.correct || 0}/${perf.total || 0}</span>
        </div>`;
    }
    return html;
}

window.addTeam = addTeam;
window.removeTeam = removeTeam;
window.updateTeamsDisplay = updateTeamsDisplay;
window.createTeamCard = createTeamCard;
window.getFormattedPerformanceBySubject = getFormattedPerformanceBySubject;
window.updateTeamPlayers = updateTeamPlayers;
window.fetchAllTeamPlayers = fetchAllTeamPlayers;

console.log('✅ teams.js carregado!');