// js/gameEvents/teamTurn.js
console.log('🔄 teamTurn.js carregando...');

function setupTeamTurnClickEvent() {
    console.log('🎯 Configurando clique no turno da equipe...');
    
    const teamTurnElement = document.getElementById('team-turn');
    if (teamTurnElement) {
        // REMOVER LISTENERS ANTIGOS para evitar duplicação
        const newElement = teamTurnElement.cloneNode(true);
        teamTurnElement.parentNode.replaceChild(newElement, teamTurnElement);
        
        const freshElement = document.getElementById('team-turn');
        freshElement.addEventListener('click', function() {
            console.log('🔄 Retângulo da equipe de plantão clicado');
            
            // TODOS podem rodar equipe
            if (confirm('Deseja rotacionar para a próxima equipe?')) {
                console.log('✅ Confirmado mudança de equipe');
                
                // Usar sistema de turnos se disponível
                if (window.turnSystem) {
                    window.turnSystem.rotateTeam();
                } 
                // Fallback manual
                else if (window.teams && window.teams.length > 1) {
                    const nextIndex = (window.currentTeamIndex + 1) % window.teams.length;
                    window.currentTeamIndex = nextIndex;
                    
                    console.log(`🔄 ${window.teams[window.currentTeamIndex-1]?.name} → ${window.teams[nextIndex].name}`);
                    
                    if (window.updateTeamsDisplay) {
                        window.updateTeamsDisplay();
                    }
                    
                    if (window.showQuestion) {
                        window.showQuestion();
                    }
                }
            }
        });
        
        console.log('✅ Clique no team-turn configurado');
    } else {
        console.error('❌ Elemento team-turn não encontrado');
    }
}

if (typeof window !== 'undefined') {
    window.setupTeamTurnClickEvent = setupTeamTurnClickEvent;
    console.log('✅ teamTurn.js exportado');
}