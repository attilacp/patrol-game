// js/gameEvents/teamTurn.js
console.log('🔄 teamTurn.js carregando...');

function setupTeamTurnClickEvent() {
    console.log('🎯 Configurando clique no turno da equipe...');
    
    const teamTurnElement = document.getElementById('team-turn');
    if (teamTurnElement) {
        // PREVENIR DUPLICAÇÃO: remover listeners antigos
        const newElement = teamTurnElement.cloneNode(true);
        teamTurnElement.parentNode.replaceChild(newElement, teamTurnElement);
        
        newElement.addEventListener('click', function() {
            console.log('🔄 Retângulo da equipe de plantão clicado');
            
            // Apenas mestre pode rodar equipe
            if (window.roomSystem && window.roomSystem.isMaster) {
                if (confirm('Deseja rotacionar para a próxima equipe?')) {
                    console.log('✅ Confirmado mudança de equipe');
                    
                    // Rodar equipe e salvar no Firebase
                    if (window.turnSystem) {
                        const nextIndex = window.turnSystem.rotateTeam();
                        window.turnSystem.setCurrentTurn(nextIndex);
                    } 
                    // Fallback manual
                    else if (window.teams && window.teams.length > 1) {
                        const nextIndex = (window.currentTeamIndex + 1) % window.teams.length;
                        window.currentTeamIndex = nextIndex;
                        
                        console.log(`🔄 Mudou para: ${window.teams[nextIndex].name}`);
                        
                        if (window.updateTeamsDisplay) {
                            window.updateTeamsDisplay();
                        }
                        
                        if (window.showQuestion) {
                            window.showQuestion();
                        }
                    }
                }
            } else {
                console.log('⏳ Apenas o mestre pode rodar equipes');
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