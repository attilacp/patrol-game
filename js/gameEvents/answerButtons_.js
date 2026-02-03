// js/gameEvents/answerButtons.js - MODIFICADO
function setupAnswerButtonEvents() {
    console.log('🎮 Configurando botões de resposta com sistema de turnos...');
    
    const certoBtn = document.getElementById('certo-btn');
    const erradoBtn = document.getElementById('errado-btn');
    
    if (certoBtn) {
        certoBtn.addEventListener('click', function() {
            console.log('✅ Botão CERTO clicado');
            
            if (window.turnSystem) {
                // Usar sistema de turnos
                window.turnSystem.submitTeamAnswer('CERTO');
            } else if (window.checkAnswer) {
                // Fallback para sistema antigo
                window.checkAnswer('CERTO');
            }
        });
    }
    
    if (erradoBtn) {
        erradoBtn.addEventListener('click', function() {
            console.log('❌ Botão ERRADO clicado');
            
            if (window.turnSystem) {
                window.turnSystem.submitTeamAnswer('ERRADO');
            } else if (window.checkAnswer) {
                window.checkAnswer('ERRADO');
            }
        });
    }
    
    // Botão de rodízio (apenas mestre)
    const rotateBtn = document.createElement('button');
    rotateBtn.id = 'rotate-team-btn';
    rotateBtn.className = 'rotate-btn';
    rotateBtn.innerHTML = '🔄 Rodízio de Equipe';
    rotateBtn.style.cssText = `
        background: linear-gradient(145deg, #6f42c1, #5a32a3);
        color: white;
        border: 2px solid #4a2384;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        display: none;
        margin-left: 10px;
    `;
    
    rotateBtn.onclick = function() {
        if (window.turnSystem && window.roomSystem && window.roomSystem.isMaster) {
            window.turnSystem.rotateTeam();
        }
    };
    
    // Adicionar ao cabeçalho da pergunta
    const questionHeader = document.querySelector('.question-header-buttons');
    if (questionHeader) {
        questionHeader.appendChild(rotateBtn);
    }
    
    console.log('✅ Botões configurados com sistema de turnos');
}