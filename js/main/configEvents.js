// No arquivo configEvents.js, atualize a função fallbackAddTeam:

function fallbackAddTeam() {
    const teamsContainer = document.getElementById('teams-container');
    if (!teamsContainer) return;
    
    const teamCount = teamsContainer.children.length + 1;
    const defaultName = window.defaultTeamNames && window.defaultTeamNames[teamCount - 1] || `Equipe ${teamCount}`;
    
    const teamInput = document.createElement('div');
    teamInput.className = 'team-input';
    teamInput.innerHTML = `
        <input type="text" placeholder="Nome da Equipe" value="${defaultName}">
        <button class="remove-team" onclick="removeTeam(this)">🗑️</button>
    `;
    
    teamsContainer.appendChild(teamInput);
    
    if (typeof checkStartGame === 'function') {
        checkStartGame();
    } else if (typeof window.checkStartGame === 'function') {
        window.checkStartGame();
    }
    
    console.log(`✅ Equipe ${defaultName} adicionada (fallback)`);
}