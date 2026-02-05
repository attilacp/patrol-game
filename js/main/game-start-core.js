// js/main/game-start-core.js - FUNÇÃO PRINCIPAL STARTGAME
console.log('🚀 game-start-core.js carregando...');

if (typeof window.startGame !== 'function') {
    window.startGame = async function() {
        console.log('🎮 MESTRE: Iniciando jogo...');
        
        // 1. COLETAR PERGUNTAS COM RECORRÊNCIA
        window.questions = [];
        if (window.subjects) {
            Object.values(window.subjects).forEach(subject => {
                if (subject.enabled && subject.questions.length > 0) {
                    const questionsWithRecurrence = applyRecurrence(subject.questions, subject.recurrence);
                    
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
                const players = []; // Sem jogadores na configuração
                
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
            await saveGameToFirebase();
        } else {
            console.log('⚠️ Mestre sem sala ativa - iniciando localmente');
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
                        window.turnSystem.broadcastQuestionChange();
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

console.log('✅ game-start-core.js carregado');