// file name: js/main/configEvents.js
// Event listeners da tela de configuração - SEM RANKING

function initializeConfigEventListeners() {
    console.log('🎯 Inicializando event listeners da configuração...');
    
    setupTeamManagementEvents();
    setupFileUploadEvents();
    setupGameStartEvents();
    setupUtilityEvents();
    
    console.log('✅ Event listeners da configuração inicializados');
}

function setupTeamManagementEvents() {
    console.log('👥 Configurando eventos de gerenciamento de equipes...');
    
    const addTeamBtn = document.getElementById('add-team-btn');
    if (addTeamBtn) {
        console.log('✅ Botão Adicionar Equipe encontrado');
        
        // Remover event listeners antigos
        addTeamBtn.replaceWith(addTeamBtn.cloneNode(true));
        
        // Obter nova referência
        const newAddTeamBtn = document.getElementById('add-team-btn');
        newAddTeamBtn.addEventListener('click', function() {
            console.log('➕ Botão Adicionar Equipe clicado!');
            if (typeof addTeam === 'function') {
                addTeam();
            } else if (typeof window.addTeam === 'function') {
                window.addTeam();
            } else {
                console.error('❌ Função addTeam não disponível');
                fallbackAddTeam();
            }
        });
        console.log('✅ Event listener do botão Adicionar Equipe configurado');
    } else {
        console.error('❌ Botão Adicionar Equipe não encontrado no DOM');
    }
}

function fallbackAddTeam() {
    const teamsContainer = document.getElementById('teams-container');
    if (!teamsContainer) return;
    
    const teamCount = teamsContainer.children.length + 1;
    const defaultName = window.defaultTeamNames && window.defaultTeamNames[teamCount - 1] || `Equipe ${teamCount}`;
    
    const teamInput = document.createElement('div');
    teamInput.className = 'team-input';
    teamInput.innerHTML = `
        <input type="text" placeholder="Nome da Equipe" value="${defaultName}">
        <input type="text" placeholder="Jogadores (opcional)">
        <button class="remove-team" onclick="removeTeam(this)">🗑️</button>
    `;
    
    teamsContainer.appendChild(teamInput);
    
    if (typeof checkStartGame === 'function') {
        checkStartGame();
    } else if (typeof window.checkStartGame === 'function') {
        window.checkStartGame();
    }
    
    console.log(`✅ Equipe ${defaultName} adicionada (fallback)`);
}

function setupFileUploadEvents() {
    console.log('📁 Configurando eventos de upload de arquivo...');
    
    const excelFileInput = document.getElementById('excel-file');
    if (excelFileInput) {
        console.log('✅ Input de arquivo encontrado');
        
        // Remover event listeners antigos
        excelFileInput.replaceWith(excelFileInput.cloneNode(true));
        
        // Obter nova referência
        const newExcelInput = document.getElementById('excel-file');
        newExcelInput.addEventListener('change', function(event) {
            console.log('📄 Arquivo selecionado:', event.target.files[0]?.name);
            if (typeof handleFileUpload === 'function') {
                handleFileUpload(event);
            } else if (typeof window.handleFileUpload === 'function') {
                window.handleFileUpload(event);
            } else {
                console.error('❌ Função handleFileUpload não disponível');
            }
        });
        console.log('✅ Event listener do upload de arquivo configurado');
    } else {
        console.error('❌ Input de arquivo não encontrado no DOM');
    }
}

function setupGameStartEvents() {
    console.log('🎮 Configurando eventos de início do jogo...');
    
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
        console.log('✅ Botão Iniciar Jogo encontrado');
        
        // Remover event listeners antigos
        startGameBtn.replaceWith(startGameBtn.cloneNode(true));
        
        // Obter nova referência
        const newStartBtn = document.getElementById('start-game-btn');
        newStartBtn.addEventListener('click', function() {
            console.log('🚀 Botão Iniciar Jogo clicado!');
            console.log('🔍 Verificando função startGame:', typeof startGame);
            console.log('🔍 Verificando window.startGame:', typeof window.startGame);
            
            if (typeof startGame === 'function') {
                console.log('✅ Função startGame encontrada localmente');
                startGame();
            } else if (typeof window.startGame === 'function') {
                console.log('✅ Função window.startGame encontrada');
                window.startGame();
            } else {
                console.error('❌ Função startGame não disponível em nenhum escopo');
                alert('Erro: Sistema de jogo não carregado corretamente. Recarregue a página.');
            }
        });
        console.log('✅ Event listener do botão Iniciar Jogo configurado');
    } else {
        console.error('❌ Botão Iniciar Jogo não encontrado no DOM');
    }
}

function setupUtilityEvents() {
    console.log('🔧 Configurando eventos utilitários...');
    
    // Event listeners para controles de assunto
    const selectAllBtn = document.querySelector('button[onclick*="toggleAllSubjects(true)"]');
    const deselectAllBtn = document.querySelector('button[onclick*="toggleAllSubjects(false)"]');
    const clearAllBtn = document.querySelector('button[onclick*="clearAllSubjects()"]');
    
    if (selectAllBtn) {
        console.log('✅ Botão Selecionar Todos encontrado');
        selectAllBtn.addEventListener('click', function() {
            if (typeof toggleAllSubjects === 'function') {
                toggleAllSubjects(true);
            } else if (typeof window.toggleAllSubjects === 'function') {
                window.toggleAllSubjects(true);
            }
        });
    }
    
    if (deselectAllBtn) {
        console.log('✅ Botão Desmarcar Todos encontrado');
        deselectAllBtn.addEventListener('click', function() {
            if (typeof toggleAllSubjects === 'function') {
                toggleAllSubjects(false);
            } else if (typeof window.toggleAllSubjects === 'function') {
                window.toggleAllSubjects(false);
            }
        });
    }
    
    if (clearAllBtn) {
        console.log('✅ Botão Limpar Tudo encontrado');
        clearAllBtn.addEventListener('click', function() {
            if (typeof clearAllSubjects === 'function') {
                clearAllSubjects();
            } else if (typeof window.clearAllSubjects === 'function') {
                window.clearAllSubjects();
            }
        });
    }
    
    // Event listeners para notas (REMOVIDO RANKING)
    const openNotesConfigBtn = document.getElementById('open-notes-config');
    
    if (openNotesConfigBtn) {
        console.log('✅ Botão Bloco de Notas encontrado');
        
        // Remover event listeners antigos
        openNotesConfigBtn.replaceWith(openNotesConfigBtn.cloneNode(true));
        
        // Obter nova referência
        const newNotesBtn = document.getElementById('open-notes-config');
        newNotesBtn.addEventListener('click', function() {
            console.log('📝 Botão Bloco de Notas clicado (config)');
            if (typeof openNotes === 'function') {
                openNotes();
            } else if (typeof window.openNotes === 'function') {
                window.openNotes();
            } else {
                console.error('❌ Função openNotes não disponível');
            }
        });
        console.log('✅ Event listener do botão Bloco de Notas configurado');
    } else {
        console.error('❌ Botão Bloco de Notas não encontrado no DOM');
    }
    
    // Event listeners para performance
    const importPerfBtn = document.querySelector('.performance-import-btn');
    const exportPerfBtn = document.querySelector('.performance-export-btn');
    
    if (importPerfBtn) {
        console.log('✅ Botão Importar Performance encontrado');
        importPerfBtn.addEventListener('click', function() {
            console.log('📤 Botão Importar Performance clicado');
            if (typeof triggerPerformanceImport === 'function') {
                triggerPerformanceImport();
            } else if (typeof window.triggerPerformanceImport === 'function') {
                window.triggerPerformanceImport();
            } else {
                console.error('❌ Função triggerPerformanceImport não disponível');
            }
        });
    }
    
    if (exportPerfBtn) {
        console.log('✅ Botão Exportar Performance encontrado');
        exportPerfBtn.addEventListener('click', function() {
            console.log('📥 Botão Exportar Performance clicado');
            if (typeof exportPerformanceToExcel === 'function') {
                exportPerformanceToExcel();
            } else if (typeof window.exportPerformanceToExcel === 'function') {
                window.exportPerformanceToExcel();
            } else {
                console.error('❌ Função exportPerformanceToExcel não disponível');
            }
        });
    }
}

// Exportar para uso global
window.initializeConfigEventListeners = initializeConfigEventListeners;
window.setupTeamManagementEvents = setupTeamManagementEvents;
window.setupFileUploadEvents = setupFileUploadEvents;
window.setupGameStartEvents = setupGameStartEvents;
window.setupUtilityEvents = setupUtilityEvents;
window.fallbackAddTeam = fallbackAddTeam;

console.log('✅ configEvents.js carregado com sucesso!');