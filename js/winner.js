// file name: js/answers/winner.js
function showWinnerMessage(){
    const questionText = document.getElementById('question-text');
    if(questionText){
        questionText.textContent = `🎉 PARABÉNS! ${window.winnerTeam.name} venceu!`;
    }
    
    updateWinnerDisplay();
    disableGameButtons();
    showPodiumButton();
    window.updateTeamsDisplay && window.updateTeamsDisplay();
}

function updateWinnerDisplay(){
    const teamTurn = document.getElementById('team-turn');
    if(teamTurn){
        teamTurn.textContent = '🏆 TEMOS UM VENCEDOR!';
        teamTurn.className = window.winnerTeam.turnColorClass ? 
            `team-turn ${window.winnerTeam.turnColorClass}` : 
            'team-turn team-color-1';
    }
}

function disableGameButtons(){
    ['certo-btn', 'errado-btn', 'skip-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.disabled = true;
    });
}

function showPodiumButton(){
    const nextBtn = document.getElementById('next-question-btn');
    const podiumBtn = document.getElementById('podium-btn');
    
    if(nextBtn) nextBtn.style.display = 'none';
    if(podiumBtn) podiumBtn.style.display = 'block';
}

window.showWinnerMessage = showWinnerMessage;
window.updateWinnerDisplay = updateWinnerDisplay;
window.disableGameButtons = disableGameButtons;
window.showPodiumButton = showPodiumButton;