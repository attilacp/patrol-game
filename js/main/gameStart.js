// js/main/gameStart.js - VERSÃO FINAL
console.log('🚀 gameStart.js carregando...');

// GARANTIR QUE A FUNÇÃO É GLOBAL
if (typeof window.startGame !== 'function') {
    window.startGame = async function() {
        console.log('🎮 MESTRE: Iniciando jogo...');
        
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
            alert('❌ Erro: Nenhuma pergunta carregada.');
            return;
        }
        
        console.log('📊 Perguntas coletadas:', window.questions.length);
        
        // 2. COLETAR EQUIPES COM ESTRUTURA CORRETA
        window.teams = [];
        document.querySelectorAll('.team-input').forEach((input, index) => {
            const teamNameInput = input.querySelector('input[type="text"]');
            const teamName = teamNameInput?.value.trim();
            
            if (teamName) {
                const playersInput = input.querySelectorAll('input[type="text"]')[1];
                const playersValue = playersInput?.value || '';
                
                // Converter string para array
                const players = playersValue.split(',').map(p => p.trim()).filter(p => p !== '');
                
                const colorScheme = window.teamColorSchemes[index % window.teamColorSchemes.length];
                
                // ESTRUTURA COMPLETA para Firebase
                window.teams.push({
                    id: index + 1,
                    name: teamName,
                    players: players, // Array, não string
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
            alert('❌ Erro: Configure equipes.');
            return;
        }
        
        console.log('👥 Equipes coletadas:', window.teams.length);
        
        // 3. SALVAR NO FIREBASE
        if (window.roomSystem && window.roomSystem.isMaster && window.roomSystem.currentRoom) {
            try {
                const roomCode = window.roomSystem.currentRoom;
                console.log('💾 SALVANDO NO FIREBASE - Sala:', roomCode);
                
                const roomRef = firebase.database().ref('rooms/' + roomCode);
                
                // Status primeiro
                await roomRef.child('status').set('playing');
                console.log('✅ Status: playing');
                
                // PERGUNTAS
                console.log('💾 Salvando perguntas...');
                await roomRef.child('gameData/questions').set(window.questions);
                console.log('✅ Perguntas salvas:', window.questions.length);
                
                // EQUIPES (com estrutura correta)
                console.log('💾 Salvando equipes...');
                await roomRef.child('gameData/teams').set(window.teams);
                console.log('✅ Equipes salvas:', window.teams.length);
                
                // Estado do jogo
                const gameState = {
                    startedAt: Date.now(),
                    currentQuestionIndex: 0,
                    currentTeamIndex: 0,
                    scores: {},
                    mestre: window.roomSystem.playerName,
                    roomCode: roomCode,
                    totalQuestions: window.questions.length,
                    totalTeams: window.teams.length
                };
                await roomRef.child('gameState').set(gameState);
                console.log('✅ Estado do jogo salvo');
                
            } catch (error) {
                console.error('❌ ERRO Firebase:', error);
                alert('❌ Erro ao salvar: ' + error.message);
                return;
            }
        }
        
        // 4. CONFIGURAÇÕES LOCAIS
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
        
        // 6. INICIALIZAR
        setTimeout(() => {
            if (typeof window.initializeGameEventListeners === 'function') {
                window.initializeGameEventListeners();
            }
            
            setTimeout(() => {
                if (window.updateTeamsDisplay) {
                    window.updateTeamsDisplay();
                }
                
                if (window.showQuestion) {
                    window.showQuestion();
                }
                
                console.log('✅ JOGO INICIADO');
            }, 200);
        }, 100);
    };
    
    console.log('✅ window.startGame definida');
}

function applyRecurrence(questions, recurrence) {
    const multiplier = {baixa: 1, media: 2, alta: 3}[recurrence] || 3;
    const result = [];
    for (let i = 0; i < multiplier; i++) result.push(...questions);
    return result;
}

window.applyRecurrence = applyRecurrence;

console.log('✅ gameStart.js carregado');