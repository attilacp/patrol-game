// file name: js/main/configScreen.js
// Inicialização da tela de configuração (SEM campo de jogadores)

function initializeConfigScreen() {
    console.log('⚙️ Inicializando tela de configuração...');
    
    // Configurar texto inicial da pergunta
    const questionTextElement = document.getElementById('question-text');
    if (questionTextElement) {
        questionTextElement.textContent = 'Aguardando carregamento das perguntas...';
    }
    
    // Configurar contadores iniciais
    const questionNumberElement = document.getElementById('question-number');
    const totalQuestionsElement = document.getElementById('total-questions');
    if (questionNumberElement) questionNumberElement.textContent = '1';
    if (totalQuestionsElement) totalQuestionsElement.textContent = '0';
    
    // Configurar ordem aleatória como padrão
    const randomOrderCheckbox = document.getElementById('random-order');
    if (randomOrderCheckbox) {
        randomOrderCheckbox.checked = true;
        console.log('✅ Ordem aleatória definida como padrão');
    }
    
    // Configurar nomes padrão das equipes (SEM campo de jogadores)
    setupDefaultTeams();
    
    console.log('✅ Tela de configuração inicializada');
}

function setupDefaultTeams() {
    console.log('👥 Configurando equipes padrão...');
    
    const teamsContainer = document.getElementById('teams-container');
    if (!teamsContainer) return;
    
    // Verificar se já existem equipes
    const existingTeams = teamsContainer.querySelectorAll('.team-input');
    if (existingTeams.length === 0) {
        console.log('📝 Adicionando equipe padrão ALFA');
        
        const teamInput = document.createElement('div');
        teamInput.className = 'team-input';
        teamInput.innerHTML = `
            <input type="text" placeholder="Nome da Equipe" value="ALFA">
            <button class="remove-team" onclick="removeTeam(this)">🗑️</button>
        `;
        
        teamsContainer.appendChild(teamInput);
    } else {
        console.log(`📝 ${existingTeams.length} equipes já configuradas`);
        
        // Remover campos de jogadores existentes se houver
        existingTeams.forEach(teamInput => {
            const inputs = teamInput.querySelectorAll('input[type="text"]');
            if (inputs.length > 1) {
                // Manter apenas o primeiro input (nome da equipe)
                for (let i = 1; i < inputs.length; i++) {
                    inputs[i].remove();
                }
            }
        });
    }
}

// Exportar para uso global
window.initializeConfigScreen = initializeConfigScreen;
console.log('✅ configScreen.js carregado com sucesso!');