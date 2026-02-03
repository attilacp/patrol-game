// js/main/gameStart.js - VERSÃO CORRIGIDA (salva dados no Firebase)
console.log('🚀 gameStart.js carregando...');

// GARANTIR QUE A FUNÇÃO É GLOBAL
if (typeof window.startGame !== 'function') {
    window.startGame = async function() {
        console.log('🎮 Função startGame executada!');
        
        // 1. COLETAR PERGUNTAS
        window.questions = [];
        if (window.subjects) {
            Object.values(window.subjects).forEach(subject => {
                if (subject.enabled && subject.questions.length > 0) {
                    window.questions.push(...applyRecurrence(subject.questions, subject.recurrence));
                }
            });
        }
        
        if (window.questions.length === 0) {
            alert('❌ Erro: Nenhuma pergunta carregada ou selecionada.');
            return;
        }
        
        // 2. COLETAR EQUIPES
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
            alert('❌ Erro: Configure pelo menos uma equipe com nome.');
            return;
        }
        
        // 3. SALVAR NO FIREBASE (APENAS MESTRE)
        if (window.roomSystem && window.roomSystem.isMaster && window.roomSystem.currentRoom) {
            try {
                console.log('💾 Mestre salvando dados no Firebase...');
                
                // Atualizar status da sala
                const roomRef = firebase.database().ref('rooms/' + window.roomSystem.currentRoom);
                await roomRef.child('status').set('playing');
                console.log('✅ Status da sala atualizado para "playing"');
                
                // Salvar estado do jogo
                const gameState = {
                    startedAt: Date.now(),
                    currentQuestionIndex: 0,
                    currentTeamIndex: 0,
                    scores: {},
                    mestre: window.roomSystem.playerName,
                    roomCode: window.roomSystem.currentRoom,
                    totalQuestions: window.questions.length
                };
                await roomRef.child('gameState').set(gameState);
                console.log('✅ Estado do jogo salvo');
                
                // SALVAR PERGUNTAS PARA OS JOGADORES
                await firebase.database().ref('rooms/' + window.roomSystem.currentRoom + '/gameData/questions')
                    .set(window.questions);
                console.log('✅ Perguntas salvas para jogadores:', window.questions.length);
                
                // SALVAR EQUIPES PARA OS JOGADORES
                await firebase.database().ref('rooms/' + window.roomSystem.currentRoom + '/gameData/teams')
                    .set(window.teams);
                console.log('✅ Equipes salvas para jogadores:', window.teams.length);
                
            } catch (error) {
                console.error('❌ Erro ao salvar no Firebase:', error);
                alert('⚠️ Erro ao sincronizar: ' + error.message + '\n\nO jogo começará localmente.');
            }
        }
        
        // 4. CONFIGURAÇÕES LOCAIS
        if (typeof loadSavedPerformance === 'function') {
            loadSavedPerformance();
            console.log('✅ Performance salva carregada');
        }
        
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
        
        // 5. MUDAR TELA
        document.getElementById('config-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        
        // 6. INICIALIZAR SISTEMAS
        setTimeout(() => {
            window.initializeGameEventListeners?.();
            
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
    };
    
    console.log('✅ Função window.startGame definida');
}

// Funções auxiliares
function applyRecurrence(questions, recurrence) {
    const multiplier = {baixa: 1, media: 2, alta: 3}[recurrence] || 3;
    const result = [];
    for (let i = 0; i < multiplier; i++) result.push(...questions);
    console.log(`📊 Recorrência: ${recurrence} (${multiplier}x) - ${questions.length} → ${result.length}`);
    return result;
}

function countQuestionsWithoutRecurrence() {
    let totalQuestions = 0;
    if (window.subjects) {
        Object.values(window.subjects).forEach(subject => {
            if (subject.enabled) {
                totalQuestions += subject.questions.length;
            }
        });
    }
    return totalQuestions;
}

// Exportar funções globais
window.applyRecurrence = applyRecurrence;
window.countQuestionsWithoutRecurrence = countQuestionsWithoutRecurrence;

if (typeof updateTotalQuestionsCount !== 'undefined') {
    window.updateTotalQuestionsCount = function() {
        let totalQuestions = countQuestionsWithoutRecurrence();
        const totalEl = document.getElementById('total-questions');
        if (totalEl) totalEl.textContent = totalQuestions;
        return totalQuestions;
    };
} else {
    window.updateTotalQuestionsCount = function() {
        let totalQuestions = countQuestionsWithoutRecurrence();
        const totalEl = document.getElementById('total-questions');
        if (totalEl) totalEl.textContent = totalQuestions;
        return totalQuestions;
    };
}

console.log('✅ gameStart.js carregado - window.startGame disponível');