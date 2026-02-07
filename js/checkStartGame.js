// js/checkStartGame.js - Verifica se o jogo pode ser iniciado
console.log('✅ checkStartGame.js carregando...');

function checkStartGame() {
    console.log('🔍 Verificando se pode iniciar jogo...');
    
    const startGameBtn = document.getElementById('start-game-btn');
    const startGameLobbyBtn = document.getElementById('start-game-btn-lobby');
    
    if (!startGameBtn && !startGameLobbyBtn) {
        console.error('❌ Botão iniciar jogo não encontrado');
        return false;
    }
    
    // 1. VERIFICAR EQUIPES
    const teamsContainer = document.getElementById('teams-container');
    const teamInputs = teamsContainer ? teamsContainer.querySelectorAll('.team-input') : [];
    let hasValidTeams = false;
    let teamNames = [];
    
    teamInputs.forEach(input => {
        const teamInput = input.querySelector('input[type="text"]');
        if (teamInput && teamInput.value.trim()) {
            hasValidTeams = true;
            teamNames.push(teamInput.value.trim());
        }
    });
    
    // Verificar nomes duplicados
    const uniqueNames = [...new Set(teamNames)];
    const hasDuplicateTeams = teamNames.length !== uniqueNames.length;
    
    const teamError = document.getElementById('team-error');
    if (teamError) {
        if (!hasValidTeams) {
            teamError.textContent = '⚠️ Configure pelo menos uma equipe';
            teamError.style.display = 'block';
        } else if (hasDuplicateTeams) {
            teamError.textContent = '⚠️ Nomes de equipe não podem ser iguais';
            teamError.style.display = 'block';
            hasValidTeams = false;
        } else {
            teamError.style.display = 'none';
        }
    }
    
    // 2. VERIFICAR ARQUIVO DE PERGUNTAS
    const fileError = document.getElementById('file-error');
    let hasValidFile = false;
    let totalQuestions = 0;
    
    if (window.subjects) {
        // Contar perguntas de assuntos habilitados
        Object.values(window.subjects).forEach(subject => {
            if (subject.enabled) {
                totalQuestions += subject.questions.length;
            }
        });
        
        hasValidFile = totalQuestions > 0;
    } else {
        // Verificar se há perguntas carregadas (sistema antigo)
        hasValidFile = window.questions && window.questions.length > 0;
        totalQuestions = hasValidFile ? window.questions.length : 0;
    }
    
    if (fileError) {
        fileError.style.display = hasValidFile ? 'none' : 'block';
    }
    
    // 3. VERIFICAR SE É MESTRE (em lobby multiplayer)
    let canStartGame = hasValidTeams && hasValidFile;
    
    if (window.roomSystem && window.roomSystem.currentRoom) {
        canStartGame = canStartGame && window.roomSystem.isMaster;
        console.log('🕹️ Modo multiplayer - Mestre?', window.roomSystem.isMaster);
    }
    
    // 4. ATUALIZAR BOTÕES
    if (startGameBtn) {
        startGameBtn.disabled = !canStartGame;
        startGameBtn.title = canStartGame ? 
            'Iniciar jogo para todos os jogadores' : 
            'Configure equipes e carregue perguntas para habilitar';
        
        if (canStartGame) {
            startGameBtn.classList.remove('disabled');
            startGameBtn.classList.add('enabled');
        } else {
            startGameBtn.classList.remove('enabled');
            startGameBtn.classList.add('disabled');
        }
        
        console.log('🎮 Botão Iniciar Jogo:', canStartGame ? '✅ HABILITADO' : '❌ DESABILITADO');
    }
    
    if (startGameLobbyBtn) {
        startGameLobbyBtn.disabled = !canStartGame;
        console.log('🎮 Botão Lobby:', canStartGame ? '✅ HABILITADO' : '❌ DESABILITADO');
    }
    
    // 5. ATUALIZAR CONTADORES
    const totalQuestionsElement = document.getElementById('total-questions');
    if (totalQuestionsElement) {
        totalQuestionsElement.textContent = totalQuestions;
    }
    
    console.log('🔍 Verificação concluída:', {
        equipesValidas: hasValidTeams,
        arquivoValido: hasValidFile,
        totalPerguntas: totalQuestions,
        podeIniciar: canStartGame
    });
    
    return canStartGame;
}

window.checkStartGame = checkStartGame;
console.log('✅ checkStartGame.js exportado');