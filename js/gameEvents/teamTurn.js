// file name: js/gameEvents/teamTurn.js
console.log('🎮 gameEvents/teamTurn.js carregando...');

function setupTeamTurnClickEvent() {
    console.log('👥 Configurando clique no retângulo da equipe de plantão...');
    
    const teamTurnElement = document.getElementById('team-turn');
    if (teamTurnElement) {
        teamTurnElement.style.cursor = 'pointer';
        teamTurnElement.title = 'Clique para mudar de equipe';
        
        // Remover listeners antigos
        const newTeamTurn = teamTurnElement.cloneNode(true);
        teamTurnElement.parentNode.replaceChild(newTeamTurn, teamTurnElement);
        
        const finalTeamTurn = document.getElementById('team-turn');
        
        finalTeamTurn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (window.teamTurnClickInProgress) return;
            window.teamTurnClickInProgress = true;
            
            console.log('🔄 Retângulo da equipe de plantão clicado');
            
            if (!window.gameStarted || window.winnerTeam || (window.bombQuestionSystem && window.bombQuestionSystem.isBombActive)) {
                console.log('⛔ Não é possível mudar de equipe agora');
                window.teamTurnClickInProgress = false;
                return;
            }
            
            // REGRA 3: CONFIRMAÇÃO DA MENSAGEM APÓS APERTAR O BOTÃO
            if (confirm('Deseja mudar a equipe de plantão para a próxima equipe?')) {
                console.log('✅ Confirmado mudança de equipe');
                
                // MUDAR EQUIPE IMEDIATAMENTE
                const oldTeam = window.teams[window.currentTeamIndex];
                
                // Rodar equipe AGORA
                if (window.rotateTeam) {
                    window.rotateTeam();
                } else {
                    window.currentTeamIndex = (window.currentTeamIndex + 1) % window.teams.length;
                }
                
                const newTeam = window.teams[window.currentTeamIndex];
                console.log(`🔄 ${oldTeam.name} → ${newTeam.name} (mudança imediata)`);
                
                // Atualizar display da equipe de plantão
                finalTeamTurn.textContent = '🎯 ' + newTeam.name + ' - DE PLANTÃO';
                finalTeamTurn.className = 'team-turn ' + (newTeam.turnColorClass || 'team-color-1');
                
                // Resetar flags
                window.consecutiveCorrect = 0; // Zerar contador
                window.pendingBombQuestion = false; // Cancelar PB pendente
                window.resetPendingBombButton?.(); // Resetar botão de PB
                window.nextTeamRotation = false; // NÃO marcar para rodar na próxima pergunta
                
                // Atualizar display das equipes
                if (window.updateTeamsDisplay) {
                    window.updateTeamsDisplay();
                }
                
                console.log('✅ Equipe de plantão mudada IMEDIATAMENTE');
            } else {
                console.log('❌ Mudança de equipe cancelada');
            }
            
            setTimeout(() => window.teamTurnClickInProgress = false, 500);
        });
        
        console.log('✅ Evento de clique no retângulo da equipe configurado');
    }
}

// Exportar
if (typeof window !== 'undefined') {
    window.setupTeamTurnClickEvent = setupTeamTurnClickEvent;
    console.log('✅ gameEvents/teamTurn.js exportado');
}