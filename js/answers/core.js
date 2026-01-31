// file name: js/answers/core.js
// answers/core.js - COM CONTROLE DE TECLADO E PREVENÇÃO DE DUPLICAÇÃO

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
    console.log('Pergunta:', window.currentQuestionIndex + 1, '/', window.questions.length);
    
    // RESETAR FLAGS DE RESPOSTA, TECLADO E PROCESSAMENTO
    window.currentQuestionAnswered = false;
    window.keyboardEnabled = true;
    window.currentQuestionProcessed = false;
    
    // RESETAR FLAG DE RESPOSTA PROCESSADA
    if (typeof window.resetAnswerProcessedFlag === 'function') {
        window.resetAnswerProcessedFlag();
    }
    
    // VERIFICAR SE HÁ PB PENDENTE - SE SIM, ATIVAR
    if (window.pendingBombQuestion && window.bombQuestionSystem) {
        console.log('PB pendente detectada, ativando...');
        window.pendingBombQuestion = false;
        
        if (window.bombQuestionSystem.activateBombQuestion()) {
            console.log('PB ativada após pendência');
            return;
        } else {
            console.log('Falha ao ativar PB pendente');
        }
    }
    
    // VERIFICAR SE JÁ TEM UM VENCEDOR - SE SIM, MOSTRAR BOTÕES DE FIM DE JOGO
    if (window.winnerTeam) {
        console.log('Já temos um vencedor, mostrando botões de fim de jogo');
        
        ['certo-btn', 'errado-btn', 'skip-btn'].forEach(function(id) {
            var btn = document.getElementById(id);
            if (btn) {
                btn.disabled = true;
                btn.style.display = 'none';
            }
        });
        
        var podiumBtn = document.getElementById('podium-btn');
        if (podiumBtn) {
            podiumBtn.style.display = 'inline-block';
            podiumBtn.textContent = 'Ir para Pódio';
        }
        
        var nextBtn = document.getElementById('next-question-btn');
        if (nextBtn) nextBtn.style.display = 'none';
        
        document.getElementById('question-text').textContent = 'PARABÉNS! ' + window.winnerTeam.name + ' venceu!';
        document.getElementById('team-turn').textContent = 'TEMOS UM VENCEDOR!';
        document.getElementById('team-turn').className = 'team-turn ' + window.winnerTeam.turnColorClass;
        
        if (window.updateTeamsDisplay) {
            window.updateTeamsDisplay();
        }
        return;
    }
    
    if (window.nextTeamRotation && window.gameStarted) {
        rotateTeam();
        window.nextTeamRotation = false;
        console.log('Rodízio aplicado');
    }
    
    if (window.currentQuestionIndex < window.questions.length) {
        var q = window.questions[window.currentQuestionIndex];
        
        // EXIBIR PERGUNTA COM ASSUNTO (POSIÇÃO INICIAL CORRETA)
        var questionHTML = '';
        
        if (q.assuntoInfo) {
            questionHTML = '<div class="assunto-container">' +
                '<div class="assunto-icon">📚</div>' +
                '<div class="assunto-text">' + q.assuntoInfo + '</div>' +
            '</div>' +
            '<div class="pergunta-texto">' +
                (q.enunciado || 'Pergunta sem enunciado') +
            '</div>';
        } else {
            questionHTML = '<div class="pergunta-texto">' + (q.enunciado || 'Pergunta sem enunciado') + '</div>';
        }
        
        document.getElementById('question-text').innerHTML = questionHTML;
        
        // LIMPAR ELEMENTOS DE RESPOSTA
        document.getElementById('commentary').textContent = '';
        document.getElementById('commentary').classList.remove('active');
        
        document.getElementById('correct-answer').textContent = '';
        document.getElementById('correct-answer').className = 'correct-answer';
        
        // ATUALIZAR CONTADORES
        document.getElementById('question-number').textContent = window.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent = window.questions.length;
        
        // ATUALIZAR EQUIPE ATUAL
        if (window.teams && window.teams[window.currentTeamIndex]) {
            var team = window.teams[window.currentTeamIndex];
            var turnEl = document.getElementById('team-turn');
            turnEl.textContent = '🎯 ' + team.name + ' - DE PLANTÃO';
            turnEl.className = 'team-turn ' + team.turnColorClass;
            console.log('Equipe atual: ' + team.name);
        }
        
        // HABILITAR BOTÕES DE RESPOSTA, ESCONDER CONTINUAÇÃO
        enableAnswerButtons();
        
        // ESCONDER BOTÕES DE CONTINUAÇÃO
        var nextBtn = document.getElementById('next-question-btn');
        var podiumBtn = document.getElementById('podium-btn');
        if (nextBtn) {
            nextBtn.style.display = 'none';
            nextBtn.textContent = '⏭️ PRÓXIMA';
        }
        if (podiumBtn) podiumBtn.style.display = 'none';
        
        // ATUALIZAR DISPLAY DAS EQUIPES
        if (window.updateTeamsDisplay) {
            window.updateTeamsDisplay();
        }
        
        console.log('Pergunta ' + (window.currentQuestionIndex + 1) + ' exibida (teclado habilitado)');
    } else {
        endGame();
    }
}

function nextQuestion() {
    console.log('Próxima pergunta...');
    
    var nextBtn = document.getElementById('next-question-btn');
    if (nextBtn && nextBtn.textContent.includes('PB')) {
        nextBtn.textContent = '⏭️ PRÓXIMA';
        
        var newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        
        var finalNextBtn = document.getElementById('next-question-btn');
        finalNextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Próxima clicado (restaurado)');
            window.nextQuestion();
        });
    }
    
    window.currentQuestionIndex++;
    console.log('Novo índice: ' + window.currentQuestionIndex);
    showQuestion();
}

function rotateTeam() {
    var oldTeam = window.teams[window.currentTeamIndex];
    window.currentTeamIndex = (window.currentTeamIndex + 1) % window.teams.length;
    var newTeam = window.teams[window.currentTeamIndex];
    window.consecutiveCorrect = 0;
    console.log(oldTeam.name + ' → ' + newTeam.name);
}

function enableAnswerButtons() {
    // Se já tem vencedor, não habilitar botões de resposta
    if (window.winnerTeam) {
        console.log('Tem vencedor, não habilitando botões de resposta');
        return;
    }
    
    ['certo-btn', 'errado-btn', 'skip-btn'].forEach(function(id) {
        var btn = document.getElementById(id);
        if (btn) {
            btn.disabled = false;
            btn.style.display = 'inline-block';
        }
    });
    
    var nextBtn = document.getElementById('next-question-btn');
    var podiumBtn = document.getElementById('podium-btn');
    if (nextBtn) nextBtn.style.display = 'none';
    if (podiumBtn) podiumBtn.style.display = window.winnerTeam ? 'block' : 'none';
    
    console.log('Botões de resposta habilitados, botões de continuação escondidos');
}

function endGame() {
    console.log('Fim do jogo');
    document.getElementById('question-text').textContent = 'Fim do jogo!';
    document.getElementById('team-turn').textContent = 'JOGO FINALIZADO';
    document.getElementById('team-turn').className = 'team-turn team-color-1';
    
    ['certo-btn', 'errado-btn', 'skip-btn'].forEach(function(id) {
        var btn = document.getElementById(id);
        if (btn) btn.disabled = true;
    });
    
    var nextBtn = document.getElementById('next-question-btn');
    var podiumBtn = document.getElementById('podium-btn');
    if (nextBtn) nextBtn.style.display = 'none';
    if (podiumBtn) podiumBtn.style.display = 'block';
    
    if (window.updateTeamsDisplay) {
        window.updateTeamsDisplay();
    }
}

window.showQuestion = showQuestion;
window.nextQuestion = nextQuestion;
window.rotateTeam = rotateTeam;
window.enableAnswerButtons = enableAnswerButtons;
window.game = { nextQuestion: nextQuestion, showQuestion: showQuestion };

console.log('answers/core.js carregado com controle de teclado e prevenção de duplicação');