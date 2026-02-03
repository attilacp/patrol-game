// js/main/gameStart.js - VERSÃO COMPLETA CORRIGIDA
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
        
        // 3. SALVAR NO FIREBASE (APENAS MESTRE)
        if (window.roomSystem && window.roomSystem.isMaster && window.roomSystem.currentRoom) {
            try {
                const roomCode = window.roomSystem.currentRoom;
                console.log('💾 SALVANDO NO FIREBASE - Sala:', roomCode);
                
                const roomRef = firebase.database().ref('rooms/' + roomCode);
                
                // Status primeiro
                await roomRef.child('status').set('playing');
                console.log('✅ Status: playing');
                
                // SALVAR PERGUNTAS - COM ORDEM
                console.log('💾 Salvando perguntas...');
                await roomRef.child('gameData/questions').set(window.questions);
                console.log('✅ Perguntas salvas:', window.questions.length);
                
                // SALVAR EQUIPES
                console.log('💾 Salvando equipes...');
                await roomRef.child('gameData/teams').set(window.teams);
                console.log('✅ Equipes salvas:', window.teams.length);
                
                // VERIFICAR SE TEM ORDEM ALEATÓRIA E SALVAR ORDEM
                const randomOrderCheckbox = document.getElementById('random-order');
                const isRandomOrder = randomOrderCheckbox?.checked || false;
                
                if (isRandomOrder && typeof shuffleArray === 'function') {
                    // Embaralhar cópias para não afetar o original ainda
                    const shuffledTeams = [...window.teams];
                    const shuffledQuestions = [...window.questions];
                    
                    shuffleArray(shuffledTeams);
                    shuffleArray(shuffledQuestions);
                    
                    // Salvar ordem no Firebase
                    await roomRef.child('gameData/order').set({
                        teams: shuffledTeams.map(t => t.id),
                        questions: shuffledQuestions.map((q, i) => i), // Salva índices embaralhados
                        isRandom: true,
                        timestamp: Date.now()
                    });
                    
                    console.log('✅ Ordem aleatória salva no Firebase');
                    
                    // Aplicar ordem localmente
                    window.teams = shuffledTeams;
                    window.questions = shuffledQuestions;
                } else {
                    // Salvar ordem sequencial
                    await roomRef.child('gameData/order').set({
                        teams: window.teams.map(t => t.id),
                        questions: window.questions.map((q, i) => i), // Índices normais
                        isRandom: false,
                        timestamp: Date.now()
                    });
                    console.log('✅ Ordem sequencial salva no Firebase');
                }
                
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
                
                // VERIFICAÇÃO (opcional)
                setTimeout(async () => {
                    try {
                        const verifyQuestions = await roomRef.child('gameData/questions').once('value');
                        const verifyTeams = await roomRef.child('gameData/teams').once('value');
                        const verifyOrder = await roomRef.child('gameData/order').once('value');
                        
                        console.log('🔍 VERIFICAÇÃO:');
                        console.log('- Perguntas no Firebase:', verifyQuestions.exists() ? verifyQuestions.val().length : 'NÃO');
                        console.log('- Equipes no Firebase:', verifyTeams.exists() ? verifyTeams.val().length : 'NÃO');
                        console.log('- Ordem no Firebase:', verifyOrder.exists() ? 'SIM' : 'NÃO');
                    } catch (verifyError) {
                        console.error('❌ Erro na verificação:', verifyError);
                    }
                }, 1000);
                
            } catch (error) {
                console.error('❌ ERRO Firebase:', error);
                alert('❌ Erro ao salvar: ' + error.message);
                return;
            }
        } else {
            console.log('⚠️ Mestre sem sala ativa - iniciando localmente');
        }
        
        // 4. CONFIGURAÇÕES LOCAIS
        const randomOrderCheckbox = document.getElementById('random-order');
        window.randomOrder = randomOrderCheckbox?.checked || false;
        
        // NOTA: O embaralhamento já foi feito acima se for mestre com Firebase
        // Se for jogo local sem Firebase, aplicar aqui
        if (window.randomOrder && typeof shuffleArray === 'function' && 
            (!window.roomSystem || !window.roomSystem.isMaster)) {
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
            
            // Inicializar performance se disponível
            if (typeof initTeamPerformanceSystem === 'function') {
                initTeamPerformanceSystem();
            }
            
            // Inicializar perguntas bomba se disponível
            if (window.bombQuestionSystem?.resetUsedQuestions) {
                window.bombQuestionSystem.resetUsedQuestions();
            }
            
            // DEFINIR PRIMEIRA EQUIPE DE PLANTÃO (se for mestre)
            if (window.roomSystem && window.roomSystem.isMaster && window.turnSystem) {
                setTimeout(() => {
                    if (window.teams && window.teams.length > 0) {
                        window.turnSystem.setCurrentTurn(
                            0, 
                            window.teams[0].id, 
                            window.teams[0].name
                        );
                        console.log('🎯 Primeira equipe de plantão definida:', window.teams[0].name);
                    }
                }, 800);
            }
            
            // Atualizar display
            setTimeout(() => {
                if (window.updateTeamsDisplay) {
                    window.updateTeamsDisplay();
                }
                
                if (window.showQuestion) {
                    window.showQuestion();
                }
                
                console.log('✅ JOGO INICIADO');
                console.log('- Perguntas:', window.questions.length);
                console.log('- Equipes:', window.teams.length);
                if (window.roomSystem?.currentRoom) {
                    console.log('- Sala:', window.roomSystem.currentRoom);
                }
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

console.log('✅ gameStart.js carregado');