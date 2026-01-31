// file name: main/gameStart.js
function startGame() {
    console.log('Botão Iniciar Jogo clicado');
    
    window.questions = [];
    
    if (window.subjects) {
        Object.values(window.subjects).forEach(subject => {
            if (subject.enabled && subject.questions.length > 0) {
                window.questions.push(...applyRecurrence(subject.questions, subject.recurrence));
            }
        });
    }
    
    if (window.questions.length === 0) {
        alert('Erro: Nenhuma pergunta carregada ou selecionada.');
        return;
    }
    
    window.teams = [];
    document.querySelectorAll('.team-input').forEach((input, index) => {
        const teamNameInput = input.querySelector('input[type="text"]');
        const teamName = teamNameInput?.value.trim();
        
        if (teamName) {
            const playersInput = input.querySelectorAll('input[type="text"]')[1];
            const players = playersInput?.value.split(',').map(p => p.trim()).filter(p => p) || [];
            const colorScheme = window.teamColorSchemes[index % window.teamColorSchemes.length];
            
            window.teams.push({
                id: index + 1,
                name: teamName,
                players: players,
                score: 0,
                questionsAnswered: 0,
                questionsWrong: 0,
                colorClass: colorScheme.bg,
                turnColorClass: colorScheme.turn,
                colorName: colorScheme.name,
                performanceBySubject: {},
                questionsBySubject: {}
            });
        }
    });
    
    if (window.teams.length === 0) {
        alert('Erro: Configure pelo menos uma equipe com nome.');
        return;
    }
    
    // REMOVIDO: Chamada à função não existente
    // loadPerformanceForCurrentGame?.();
    
    // Carregar performance salva se existir
    if (typeof loadSavedPerformance === 'function') {
        loadSavedPerformance();
        console.log('✅ Performance salva carregada');
    }
    
    // Inicializar performance
    if (typeof resetTeamPerformance === 'function') {
        resetTeamPerformance();
    }
    
    if (window.bombQuestionSystem?.resetUsedQuestions) {
        window.bombQuestionSystem.resetUsedQuestions();
        console.log('✅ Perguntas bomba resetadas');
    }
    
    const randomOrderCheckbox = document.getElementById('random-order');
    window.randomOrder = randomOrderCheckbox?.checked || false;
    
    if (window.randomOrder && typeof shuffleArray === 'function') {
        shuffleArray(window.teams);
        shuffleArray(window.questions);
    }
    
    window.currentQuestionIndex = 0;
    window.currentTeamIndex = 0;
    window.consecutiveCorrect = 0;
    window.gameStarted = true;
    window.winnerTeam = null;
    window.nextTeamRotation = false;
    window.currentQuestionAnswered = false;
    window.keyboardEnabled = true;
    window.currentQuestionProcessed = false;
    
    // Mudar para tela do jogo
    document.getElementById('config-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    setTimeout(() => {
        window.initializeGameEventListeners?.();
        
        // Inicializar sistema de performance
        if (typeof initTeamPerformanceSystem === 'function') {
            initTeamPerformanceSystem();
            console.log('✅ Sistema de performance inicializado');
        }
        
        setTimeout(() => {
            window.updateTeamsDisplay?.();
            window.showQuestion?.();
            console.log('✅ Jogo iniciado com', window.questions.length, 'perguntas');
        }, 150);
    }, 100);
}

function applyRecurrence(questions, recurrence) {
    const multiplier = {baixa: 1, media: 2, alta: 3}[recurrence] || 3;
    const result = [];
    for (let i = 0; i < multiplier; i++) result.push(...questions);
    console.log(`Recorrência: ${recurrence} (${multiplier}x) - ${questions.length} → ${result.length}`);
    return result;
}

window.startGame = startGame;
window.applyRecurrence = applyRecurrence;