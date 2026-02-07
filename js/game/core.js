// game/core.js - COM SINCRONIZAÇÃO
if (!window.questions) window.questions = [];
if (window.currentQuestionIndex === undefined) window.currentQuestionIndex = 0;
if (window.currentTeamIndex === undefined) window.currentTeamIndex = 0;
if (window.gameStarted === undefined) window.gameStarted = false;
if (window.randomOrder === undefined) window.randomOrder = false;
if (window.consecutiveCorrect === undefined) window.consecutiveCorrect = 0;
if (window.winnerTeam === undefined) window.winnerTeam = null;
if (window.nextTeamRotation === undefined) window.nextTeamRotation = false;
if (window.pendingBombQuestion === undefined) window.pendingBombQuestion = false;
if (window.currentQuestionAnswered === undefined) window.currentQuestionAnswered = false;
if (window.keyboardEnabled === undefined) window.keyboardEnabled = true;
if (window.currentQuestionProcessed === undefined) window.currentQuestionProcessed = false;

function showQuestion() {
    console.log('🎯 Mostrando pergunta:', window.currentQuestionIndex + 1, 'de', window.questions.length);
    
    // RESETAR FLAGS DE RESPOSTA
    window.currentQuestionAnswered = false;
    window.keyboardEnabled = true;
    window.currentQuestionProcessed = false;
    window.resetAnswerProcessedFlag?.();
    
    // VERIFICAR SE HÁ PB PENDENTE - SE SIM, ATIVAR
    if (window.pendingBombQuestion && window.bombQuestionSystem) {
        console.log('PB pendente detectada, ativando...');
        window.pendingBombQuestion = false;
        
        // Tentar ativar PB
        if (window.bombQuestionSystem.activateBombQuestion()) {
            console.log('PB ativada após pendência');
            return;
        } else {
            console.log('❌ Falha ao ativar PB pendente - continuando jogo normal');
            window.pendingBombQuestion = false;
            window.resetPendingBombButton?.();
        }
    }
    
    // VERIFICAR SE JÁ TEM VENCEDOR
    if (window.winnerTeam) {
        console.log('🏆 Já temos um vencedor, ignorando PB');
        
        if (window.nextTeamRotation && window.gameStarted) {
            rotateTeam();
            window.nextTeamRotation = false;
        }
        
        if (window.currentQuestionIndex < window.questions.length) {
            displayCurrentQuestion();
        } else {
            endGame();
        }
        return;
    }
    
    // APLICAR RODÍZIO SE MARCADO
    if (window.nextTeamRotation && window.gameStarted) {
        console.log('🔄 Aplicando rodízio marcado...');
        rotateTeam();
        window.nextTeamRotation = false;
    }
    
    if (window.currentQuestionIndex < window.questions.length) {
        displayCurrentQuestion();
    } else {
        endGame();
    }
}

function displayCurrentQuestion() {
    const question = window.questions[window.currentQuestionIndex];
    
    // EXIBIR PERGUNTA COM ASSUNTO
    let questionHTML = '';
    if (question.assuntoInfo) {
        questionHTML = '<div class="assunto-container">' +
            '<div class="assunto-icon">📚</div>' +
            '<div class="assunto-text">' + question.assuntoInfo + '</div>' +
        '</div>' +
        '<div class="pergunta-texto">' +
            (question.enunciado || 'Pergunta sem enunciado') +
        '</div>';
    } else {
        questionHTML = '<div class="pergunta-texto">' + (question.enunciado || 'Pergunta sem enunciado') + '</div>';
    }
    
    document.getElementById('question-text').innerHTML = questionHTML;
    
    // LIMPAR ELEMENTOS ANTERIORES
    document.getElementById('commentary').textContent = '';
    document.getElementById('commentary').innerHTML = '';
    document.getElementById('commentary').classList.remove('active');
    
    document.getElementById('correct-answer').textContent = '';
    document.getElementById('correct-answer').className = 'correct-answer';
    
    document.getElementById('question-number').textContent = window.currentQuestionIndex + 1;
    document.getElementById('total-questions').textContent = window.questions.length;
    
    if (window.teams?.[window.currentTeamIndex]) {
        const currentTeam = window.teams[window.currentTeamIndex];
        document.getElementById('team-turn').textContent = '🎯 ' + currentTeam.name + ' - DE PLANTÃO';
        document.getElementById('team-turn').className = 'team-turn ' + currentTeam.turnColorClass;
    }
    
    enableAnswerButtons();
    window.updateTeamsDisplay?.();
    
    // SINCRONIZAR COM TODOS OS JOGADORES (se mestre)
    if (window.roomSystem && window.roomSystem.isMaster) {
        if (window.roomSystem.broadcastQuestionToAll) {
            window.roomSystem.broadcastQuestionToAll();
        }
    }
}

function nextQuestion() {
    window.currentQuestionIndex++;
    showQuestion();
}

function rotateTeam() {
    window.currentTeamIndex = (window.currentTeamIndex + 1) % window.teams.length;
    window.consecutiveCorrect = 0;
}

function enableAnswerButtons() {
    ['certo-btn', 'errado-btn', 'skip-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = false;
    });
    
    const nextBtn = document.getElementById('next-question-btn');
    const podiumBtn = document.getElementById('podium-btn');
    if (nextBtn) nextBtn.style.display = 'none';
    if (podiumBtn) podiumBtn.style.display = window.winnerTeam ? 'block' : 'none';
    
    // SINCRONIZAR ESTADO DOS BOTÕES (se mestre)
    if (window.roomSystem && window.roomSystem.isMaster) {
        if (window.roomSystem.broadcastButtonsState) {
            window.roomSystem.broadcastButtonsState({
                certo: true,
                errado: true,
                skip: true,
                next: false,
                podium: false
            });
        }
    }
}

function endGame() {
    document.getElementById('question-text').textContent = '🏆 Fim do jogo!';
    document.getElementById('team-turn').textContent = '🎊 JOGO FINALIZADO';
    
    ['certo-btn', 'errado-btn', 'skip-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = true;
    });
    
    const podiumBtn = document.getElementById('podium-btn');
    if (podiumBtn) podiumBtn.style.display = 'block';
    
    window.updateTeamsDisplay?.();
}

// NOVA FUNÇÃO: Sincronizar resposta para todos
function syncAnswerToAll(isCorrect, question) {
    if (window.roomSystem && window.roomSystem.isMaster) {
        // 1. Transmitir se acertou/errou
        if (window.roomSystem.broadcastAnswerToAll) {
            window.roomSystem.broadcastAnswerToAll(isCorrect);
        }
        
        // 2. Transmitir gabarito e comentários
        if (window.roomSystem.broadcastGabaritoToAll) {
            setTimeout(() => {
                window.roomSystem.broadcastGabaritoToAll(question);
            }, 500);
        }
        
        // 3. Transmitir estado dos botões
        if (window.roomSystem.broadcastButtonsState) {
            window.roomSystem.broadcastButtonsState({
                certo: false,
                errado: false,
                skip: false,
                next: true,
                podium: false
            });
        }
    }
}

// ATUALIZAR checkAnswer para sincronizar
if (window.checkAnswer) {
    const originalCheckAnswer = window.checkAnswer;
    window.checkAnswer = function(answer) {
        originalCheckAnswer(answer);
        
        // Sincronizar após resposta
        if (window.questions && window.questions[window.currentQuestionIndex]) {
            const question = window.questions[window.currentQuestionIndex];
            const isCorrect = answer === 'CERTO' ? true : false;
            syncAnswerToAll(isCorrect, question);
        }
    };
}

window.showQuestion = showQuestion;
window.nextQuestion = nextQuestion;
window.rotateTeam = rotateTeam;
window.enableAnswerButtons = enableAnswerButtons;
window.syncAnswerToAll = syncAnswerToAll;