// js/main/gameStart.js - VERSÃO CORRIGIDA
console.log('🚀 gameStart.js carregando...');

// GARANTIR QUE A FUNÇÃO É GLOBAL
if (typeof window.startGame !== 'function') {
    window.startGame = async function() {
        console.log('🎮 Função startGame executada!');
        
        // ATUALIZAR STATUS DA SALA NO FIREBASE (se for mestre)
        if (window.roomSystem && window.roomSystem.isMaster && window.roomSystem.currentRoom) {
            console.log('🎮 Mestre está iniciando jogo para sala:', window.roomSystem.currentRoom);
            
            try {
                const roomRef = firebase.database().ref('rooms/' + window.roomSystem.currentRoom);
                await roomRef.child('status').set('playing');
                console.log('✅ Status da sala atualizado para "playing" no Firebase');
                
                const gameState = {
                    startedAt: Date.now(),
                    currentQuestionIndex: 0,
                    currentTeamIndex: 0,
                    scores: {},
                    mestre: window.roomSystem.playerName,
                    roomCode: window.roomSystem.currentRoom
                };
                
                await roomRef.child('gameState').set(gameState);
                console.log('✅ Estado do jogo salvo no Firebase');
                
            } catch (error) {
                console.error('❌ Erro ao atualizar Firebase:', error);
                alert('Erro ao sincronizar com Firebase: ' + error.message);
                return;
            }
        }
        
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
        
        if (window.roomSystem && window.roomSystem.isMaster && window.roomSystem.currentRoom) {
            try {
                await firebase.database().ref('rooms/' + window.roomSystem.currentRoom + '/gameState/totalQuestions')
                    .set(window.questions.length);
                console.log('✅ Total de perguntas atualizado no Firebase:', window.questions.length);
            } catch (error) {
                console.error('❌ Erro ao atualizar total de perguntas:', error);
            }
        }
        
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
        
        document.getElementById('config-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        
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

function applyRecurrence(questions, recurrence) {
    const multiplier = {baixa: 1, media: 2, alta: 3}[recurrence] || 3;
    const result = [];
    for (let i = 0; i < multiplier; i++) result.push(...questions);
    console.log(`Recorrência: ${recurrence} (${multiplier}x) - ${questions.length} → ${result.length}`);
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

if (typeof updateTotalQuestionsCount !== 'undefined') {
    window.updateTotalQuestionsCount = function() {
        let totalQuestions = countQuestionsWithoutRecurrence();
        
        const totalQuestionsElement = document.getElementById('total-questions');
        if (totalQuestionsElement) {
            totalQuestionsElement.textContent = totalQuestions;
        }
        return totalQuestions;
    };
} else {
    window.updateTotalQuestionsCount = function() {
        let totalQuestions = countQuestionsWithoutRecurrence();
        
        const totalQuestionsElement = document.getElementById('total-questions');
        if (totalQuestionsElement) {
            totalQuestionsElement.textContent = totalQuestions;
        }
        return totalQuestions;
    };
}

window.applyRecurrence = applyRecurrence;
window.countQuestionsWithoutRecurrence = countQuestionsWithoutRecurrence;

console.log('✅ gameStart.js carregado - window.startGame disponível');