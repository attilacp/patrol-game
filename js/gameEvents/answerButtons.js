// file name: js/gameEvents/answerButtons.js
console.log('🎮 gameEvents/answerButtons.js carregando...');

function setupAnswerButtonEvents() {
    console.log('🎯 Configurando eventos dos botões de resposta...');
    
    const certoBtn = document.getElementById('certo-btn');
    const erradoBtn = document.getElementById('errado-btn');
    const skipBtn = document.getElementById('skip-btn');
    
    if (certoBtn) {
        certoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('✅ Botão CERTO clicado - EVENT LISTENER ATIVO');
            if (window.checkAnswer) {
                window.checkAnswer('CERTO');
            } else {
                console.error('❌ Função checkAnswer não disponível');
                alert('Erro: Sistema de resposta não carregado. Recarregue a página.');
            }
        });
        certoBtn.disabled = false;
        console.log('✅ Event listener do botão CERTO adicionado');
    }
    
    if (erradoBtn) {
        erradoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('❌ Botão ERRADO clicado - EVENT LISTENER ATIVO');
            if (window.checkAnswer) {
                window.checkAnswer('ERRADO');
            } else {
                console.error('❌ Função checkAnswer não disponível');
                alert('Erro: Sistema de resposta não carregado. Recarregue a página.');
            }
        });
        erradoBtn.disabled = false;
        console.log('✅ Event listener do botão ERRADO adicionado');
    }
    
    if (skipBtn) {
        skipBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('⏭️ Botão PULAR clicado - EVENT LISTENER ATIVO');
            if (window.skipQuestion) {
                window.skipQuestion();
            } else {
                console.error('❌ Função skipQuestion não disponível');
                alert('Erro: Sistema de resposta não carregado. Recarregue a página.');
            }
        });
        skipBtn.disabled = false;
        console.log('✅ Event listener do botão PULAR adicionado');
    }
    
    // Forçar habilitação dos botões
    setTimeout(() => {
        ['certo-btn', 'errado-btn', 'skip-btn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn && btn.disabled) {
                btn.disabled = false;
                console.log(`🔧 Forçando habilitação do botão ${id}`);
            }
        });
    }, 100);
}

// Exportar
if (typeof window !== 'undefined') {
    window.setupAnswerButtonEvents = setupAnswerButtonEvents;
    console.log('✅ gameEvents/answerButtons.js exportado');
}