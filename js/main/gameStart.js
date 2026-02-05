// js/main/gameStart.js - VERSÃO COM SINCRONIZAÇÃO DE RECORRÊNCIA
console.log('🚀 gameStart.js carregando...');

// GARANTIR QUE A FUNÇÃO É GLOBAL
if (typeof window.startGame !== 'function') {
    window.startGame = async function() {
        console.log('🎮 MESTRE: Iniciando jogo...');
        
        // 1. COLETAR PERGUNTAS COM RECORRÊNCIA
        window.questions = [];
        if (window.subjects) {
            Object.values(window.subjects).forEach(subject => {
                if (subject.enabled && subject.questions.length > 0) {
                    const questionsWithRecurrence = applyRecurrence(subject.questions, subject.recurrence);
                    
                    // Adicionar identificador único para cada cópia
                    questionsWithRecurrence.forEach((q, index) => {
                        const questionCopy = {...q};
                        questionCopy.originalSubject = subject.name;
                        questionCopy.recurrenceCopy = index + 1;
                        questionCopy.recurrenceLevel = subject.recurrence;
                        questionCopy.uniqueId = `${subject.name}_${index}`;
                        window.questions.push(questionCopy);
                    });
                    
                    console.log(`📊 ${subject.name}: ${subject.questions.length} originais → ${questionsWithRecurrence.length} com recorrência`);
                }
            });
        }
        
        if (window.questions.length === 0) {
            alert('❌ Erro: Nenhuma pergunta carregada.');
            return;
        }
        
        console.log('📊 Perguntas finais (com recorrência):', window.questions.length);
        
        // 2. COLETAR EQUIPES
        window.teams = [];
        document.querySelectorAll('.team-input').forEach((input, index) => {
            const teamNameInput = input.querySelector('input[type="text"]');
            const teamName = teamNameInput?.value.trim();
            
            if (teamName) {
                const playersInput = input.querySelectorAll('input[type="text"]')[1];
                const playersValue = playersInput?.value || '';
                const players = playersValue.split(',').map(p => p.trim()).filter(p => p !== '');
                
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
            alert('❌ Erro: Configure equipes.');
            return;
        }
        
        console.log('👥 Equipes coletadas:', window.teams.length);
        
        // 3. SALVAR NO FIREBASE (PERGUNTAS COM RECORRÊNCIA)
        if (window.roomSystem && window.roomSystem.isMaster && window.roomSystem.currentRoom) {
            try {
                const roomCode = window.roomSystem.currentRoom;
                console.log('💾 SALVANDO NO FIREBASE - Sala:', roomCode);
                
                const roomRef = firebase.database().ref('rooms/' + roomCode);
                
                // Status
                await roomRef.child('status').set('playing');
                console.log('✅ Status: playing');
                
                // SALVAR PERGUNTAS COM RECORRÊNCIA
                console.log('💾 Salvando perguntas (com recorrência):', window.questions.length);
                await roomRef.child('gameData/questions').set(window.questions);
                
                // SALVAR EQUIPES
                console.log('💾 Salvando equipes:', window.teams.length);
                await roomRef.child('gameData/teams').set(window.teams);
                
                // SALVAR METADADOS DE RECORRÊNCIA
                const recurrenceInfo = {};
                if (window.subjects) {
                    Object.values(window.subjects).forEach(subject => {
                        if (subject.enabled) {
                            recurrenceInfo[subject.name] = {
                                recurrence: subject.recurrence,
                                originalCount: subject.questions.length,
                                finalCount: subject.recurrence === 'baixa' ? subject.questions.length :
                                           subject.recurrence === 'media' ? subject.questions.length * 2 :
                                           subject.questions.length * 3
                            };
                        }
                    });
                }
                
                await roomRef.child('gameData/recurrenceInfo').set(recurrenceInfo);
                console.log('✅ Metadados de recorrência salvos');
                
                // ORDEM
                const randomOrderCheckbox = document.getElementById('random-order');
                const isRandomOrder = randomOrderCheckbox?.checked || false;
                
                const orderData = {
                    teams: window.teams.map(t => t.id),
                    questions: window.questions.map((q, i) => i),
                    isRandom: isRandomOrder,
                    timestamp: Date.now()
                };
                
                if (isRandomOrder && typeof shuffleArray === 'function') {
                    const shuffledQuestions = [...window.questions];
                    shuffleArray(shuffledQuestions);
                    orderData.questions = shuffledQuestions.map((q, i) => i);
                    window.questions = shuffledQuestions;
                    
                    const shuffledTeams = [...window.teams];
                    shuffleArray(shuffledTeams);
                    orderData.teams = shuffledTeams.map(t => t.id);
                    window.teams = shuffledTeams;
                    
                    console.log('✅ Ordem aleatória aplicada');
                }
                
                await roomRef.child('gameData/order').set(orderData);
                console.log('✅ Ordem salva no Firebase');
                
                // ESTADO DO JOGO
                const gameState = {
                    startedAt: Date.now(),
                    currentQuestionIndex: 0,
                    currentTeamIndex: 0,
                    mestre: window.roomSystem.playerName,
                    roomCode: roomCode,
                    totalQuestions: window.questions.length,
                    totalTeams: window.teams.length,
                    recurrenceApplied: true
                };
                await roomRef.child('gameState').set(gameState);
                console.log('✅ Estado do jogo salvo');
                
                // VERIFICAÇÃO
                setTimeout(async () => {
                    try {
                        const verifyQuestions = await roomRef.child('gameData/questions').once('value');
                        const verifyTeams = await roomRef.child('gameData/teams').once('value');
                        
                        console.log('🔍 VERIFICAÇÃO FINAL:');
                        console.log('- Perguntas no Firebase:', verifyQuestions.exists() ? verifyQuestions.val().length : 'NÃO');
                        console.log('- Equipes no Firebase:', verifyTeams.exists() ? verifyTeams.val().length : 'NÃO');
                        
                        if (verifyQuestions.exists()) {
                            const firebaseQuestions = verifyQuestions.val();
                            console.log('- Primeira pergunta no Firebase:', firebaseQuestions[0]?.enunciado?.substring(0, 50) + '...');
                        }
                    } catch (verifyError) {
                        console.error('❌ Erro na verificação:', verifyError);
                    }
                }, 1000);
                
            } catch (error) {
                console.error('❌ ERRO Firebase:', error);
                alert('❌ Erro ao salvar: ' + error.message);
                return;
            }
        }
        
        // 4. CONFIGURAÇÕES LOCAIS
        const randomOrderCheckbox = document.getElementById('random-order');
        window.randomOrder = randomOrderCheckbox?.checked || false;
        
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
            
            if (window.bombQuestionSystem?.resetUsedQuestions) {
                window.bombQuestionSystem.resetUsedQuestions();
            }
            
            // DEFINIR PRIMEIRA EQUIPE DE PLANTÃO
            if (window.roomSystem && window.roomSystem.isMaster && window.teams.length > 0) {
                setTimeout(() => {
                    if (window.turnSystem) {
                        window.turnSystem.setCurrentTurn(
                            0, 
                            window.teams[0].id, 
                            window.teams[0].name
                        );
                        console.log('🎯 Primeira equipe de plantão:', window.teams[0].name);
                        
                        window.turnSystem.broadcastQuestionChange();
                    } else if (window.roomSystem.currentRoom) {
                        const turnData = {
                            teamIndex: 0,
                            teamId: window.teams[0].id,
                            teamName: window.teams[0].name,
                            questionIndex: 0,
                            startTime: Date.now(),
                            answered: false,
                            masterId: window.roomSystem.playerId
                        };
                        
                        firebase.database().ref('rooms/' + window.roomSystem.currentRoom + '/currentTurn')
                            .set(turnData);
                        console.log('✅ Turno salvo no Firebase');
                    }
                }, 800);
            }
            
            setTimeout(() => {
                if (window.updateTeamsDisplay) {
                    window.updateTeamsDisplay();
                }
                
                if (window.roomSystem && window.roomSystem.isMaster && window.showQuestion) {
                    window.showQuestion();
                }
                
                console.log('✅ JOGO INICIADO');
                console.log('- Perguntas (com recorrência):', window.questions.length);
                console.log('- Equipes:', window.teams.length);
                console.log('- Sala:', window.roomSystem?.currentRoom || 'Local');
                console.log('- Mestre?', window.roomSystem?.isMaster ? 'SIM' : 'NÃO');
                
            }, 200);
        }, 100);
    };
    
    console.log('✅ Função window.startGame definida');
}

function applyRecurrence(questions, recurrence) {
    const multiplier = {baixa: 1, media: 2, alta: 3}[recurrence] || 3;
    const result = [];
    
    for (let i = 0; i < multiplier; i++) {
        questions.forEach(q => {
            const copy = {...q};
            copy.recurrenceCopy = i + 1;
            result.push(copy);
        });
    }
    
    console.log(`📊 Recorrência ${recurrence}: ${questions.length} → ${result.length} perguntas`);
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

console.log('✅ gameStart.js carregado com sincronização de recorrência');