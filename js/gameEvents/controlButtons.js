// file name: js/gameEvents/controlButtons.js
console.log('🎮 gameEvents/controlButtons.js carregando...');

function setupControlButtonEvents() {
    console.log('⚙️ Configurando eventos dos botões de controle...');
    
    // Botão Próxima Pergunta
    const nextQuestionBtn = document.getElementById('next-question-btn');
    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('⏭️ Botão Próxima Pergunta clicado');
            if (window.nextQuestion) {
                window.nextQuestion();
            } else {
                console.error('❌ Função nextQuestion não disponível');
            }
        });
        console.log('✅ Event listener do botão Próxima Pergunta configurado');
    }
    
    // Botão Configurações
    const backToConfigBtn = document.getElementById('back-to-config');
    if (backToConfigBtn) {
        backToConfigBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('⚙️ Botão Config clicado');
            if (window.handleBackToConfig) {
                window.handleBackToConfig();
            } else {
                console.error('❌ Função handleBackToConfig não disponível');
            }
        });
        console.log('✅ Event listener do botão Config configurado');
    }
    
    // Botão Pódio
    const podiumBtn = document.getElementById('podium-btn');
    if (podiumBtn) {
        podiumBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🏆 Botão Pódio clicado');
            if (window.showPodium) {
                window.showPodium();
            } else if (window.goToPodium) {
                window.goToPodium();
            } else {
                console.error('❌ Função de pódio não disponível');
            }
        });
        console.log('✅ Event listener do botão Pódio configurado');
    }
    
    // Botão Notas (na tela do jogo)
    const openNotesGameBtn = document.getElementById('open-notes-btn');
    if (openNotesGameBtn) {
        openNotesGameBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('📝 Botão Notas clicado (jogo)');
            if (window.openNotes) {
                window.openNotes();
            } else {
                console.error('❌ Função openNotes não disponível');
            }
        });
        console.log('✅ Event listener do botão Notas (jogo) configurado');
    }
}

// Exportar
if (typeof window !== 'undefined') {
    window.setupControlButtonEvents = setupControlButtonEvents;
    console.log('✅ gameEvents/controlButtons.js exportado');
}