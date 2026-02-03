// js/main/gameStart.js - VERSÃO FINAL CORRIGIDA
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
            alert('❌ Erro: Nenhuma pergunta carregada ou selecionada.');
            return;
        }
        
        console.log('📊 Perguntas coletadas:', window.questions.length);
        
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
        
        console.log('👥 Equipes coletadas:', window.teams.length);
        
        // 3. SALVAR NO FIREBASE (CRÍTICO - MESTRE)
        if (window.roomSystem && window.roomSystem.isMaster && window.roomSystem.currentRoom) {
            try {
                const roomCode = window.roomSystem.currentRoom;
                console.log('💾 SALVANDO NO FIREBASE - Sala:', roomCode);
                
                const roomRef = firebase.database().ref('rooms/' + roomCode);
                
                // ATUALIZAR STATUS PRIMEIRO
                await roomRef.child('status').set('playing');
                console.log('✅ Status atualizado para "playing"');
                
                // SALVAR PERGUNTAS - CAMINHO CORRETO
                console.log('💾 Salvando perguntas...');
                await roomRef.child('gameData/questions').set(window.questions);
                console.log('✅ Perguntas salvas:', window.questions.length);
                
                // SALVAR EQUIPES - CAMINHO CORRETO
                console.log('💾 Salvando equipes...');
                await roomRef.child('gameData/teams').set(window.teams);
                console.log('✅ Equipes salvas:', window.teams.length);
                
                // SALVAR ESTADO DO JOGO
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
                
                // VERIFICAR SE OS DADOS FORAM SALVOS
                setTimeout(async () => {
                    try {
                        const verifyQuestions = await roomRef.child('gameData/questions').once('value');
                        const verifyTeams = await roomRef.child('gameData/teams').once('value');
                        
                        console.log('🔍 VERIFICAÇÃO:');
                        console.log('- Perguntas no Firebase:', verifyQuestions.exists() ? verifyQuestions.val().length : 'NÃO ENCONTRADO');
                        console.log('- Equipes no Firebase:', verifyTeams.exists() ? verifyTeams.val().length : 'NÃO ENCONTRADO');
                        
                        if (!verifyQuestions.exists() || !verifyTeams.exists()) {
                            console.error('❌ DADOS NÃO SALVOS CORRETAMENTE!');
                            alert('⚠️ Problema ao salvar no Firebase. Tente novamente.');
                        }
                    } catch (verifyError) {
                        console.error('❌ Erro na verificação:', verifyError);
                    }
                }, 1000);
                
            } catch (error) {
                console.error('❌ ERRO CRÍTICO ao salvar no Firebase:', error);
                console.error('Detalhes:', error.message, error.code);
                alert('❌ ERRO ao salvar no Firebase:\n\n' + error.message + '\n\nVerifique as regras do banco de dados.');
                return; // Não continuar se não salvar
            }
        } else {
            console.log('⚠️ Mestre sem sala ativa - iniciando localmente');
        }
        
        // 4. CONFIGURAÇÕES LOCAIS (MESTRE)
        if (typeof loadSavedPerformance === 'function') {
            loadSavedPerformance();
        }
        
        if (typeof resetTeamPerformance === 'function') {
            resetTeamPerformance();
        }
        
        if (window.bombQuestionSystem?.resetUsedQuestions) {
            window.bombQuestionSystem.resetUsedQuestions();
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
            if (typeof window.initializeGameEventListeners === 'function') {
                window.initializeGameEventListeners();
            }
            
            if (typeof initTeamPerformanceSystem === 'function') {
                initTeamPerformanceSystem();
            }
            
            setTimeout(() => {
                if (window.updateTeamsDisplay) {
                    window.updateTeamsDisplay();
                }
                
                if (window.showQuestion) {
                    window.showQuestion();
                }
                
                console.log('✅ JOGO INICIADO pelo mestre');
                console.log('- Perguntas:', window.questions.length);
                console.log('- Equipes:', window.teams.length);
                console.log('- Sala:', window.roomSystem?.currentRoom);
            }, 200);
        }, 100);
    };
    
    console.log('✅ Função window.startGame definida');
}

// Funções auxiliares
function applyRecurrence(questions, recurrence) {
    const multiplier = {baixa: 1, media: 2, alta: 3}[recurrence] || 3;
    const result = [];
    for (let i = 0; i < multiplier; i++) result.push(...questions);
    console.log(`📊 Recorrência: ${recurrence} (${multiplier}x)`);
    return result;
}

// Exportar funções globais
window.applyRecurrence = applyRecurrence;
window.startGame = window.startGame; // Garantir exportação

console.log('✅ gameStart.js carregado - window.startGame disponível');