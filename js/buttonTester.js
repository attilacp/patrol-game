// file name: js/main/buttonTester.js
// Sistema de teste e fallback para botões

function testButtonsManually() {
    console.log('🔧 Testando botões manualmente...');
    
    const certoBtn = document.getElementById('certo-btn');
    const erradoBtn = document.getElementById('errado-btn');
    const skipBtn = document.getElementById('skip-btn');
    
    if (certoBtn) {
        certoBtn.onclick = function() {
            console.log('✅ Botão CERTO clicado - MANUAL FALLBACK');
            if (typeof window.checkAnswer === 'function') {
                window.checkAnswer('CERTO');
            }
        };
        console.log('✅ Listener manual do botão CERTO adicionado');
    }
    
    if (erradoBtn) {
        erradoBtn.onclick = function() {
            console.log('❌ Botão ERRADO clicado - MANUAL FALLBACK');
            if (typeof window.checkAnswer === 'function') {
                window.checkAnswer('ERRADO');
            }
        };
        console.log('✅ Listener manual do botão ERRADO adicionado');
    }
    
    if (skipBtn) {
        skipBtn.onclick = function() {
            console.log('⏭️ Botão PULAR clicado - MANUAL FALLBACK');
            if (typeof window.skipQuestion === 'function') {
                window.skipQuestion();
            }
        };
        console.log('✅ Listener manual do botão PULAR adicionado');
    }
}

function debugButtons() {
    console.log('🔍 DEBUG DOS BOTÕES:');
    
    const certo = document.getElementById('certo-btn');
    const errado = document.getElementById('errado-btn');
    const pular = document.getElementById('skip-btn');
    
    console.log('📍 Elementos encontrados:');
    console.log('- CERTO:', certo ? '✅' : '❌');
    console.log('- ERRADO:', errado ? '✅' : '❌');
    console.log('- PULAR:', pular ? '✅' : '❌');
    
    if (certo) {
        console.log('🔧 Estado do botão CERTO:');
        console.log('- disabled:', certo.disabled);
        console.log('- style.display:', certo.style.display);
        console.log('- onclick:', certo.onclick ? '✅' : '❌');
    }
    
    if (errado) {
        console.log('🔧 Estado do botão ERRADO:');
        console.log('- disabled:', errado.disabled);
        console.log('- style.display:', errado.style.display);
        console.log('- onclick:', errado.onclick ? '✅' : '❌');
    }
    
    if (pular) {
        console.log('🔧 Estado do botão PULAR:');
        console.log('- disabled:', pular.disabled);
        console.log('- style.display:', pular.style.display);
        console.log('- onclick:', pular.onclick ? '✅' : '❌');
    }
}

// Exportar para uso global
window.testButtonsManually = testButtonsManually;
window.debugButtons = debugButtons;

console.log('✅ buttonTester.js carregado com sucesso!');