// file name: js/main/configEvents.js
// Event listeners da tela de configuração (VERSÃO CORRIGIDA)

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
        
        addTeamBtn.replaceWith(addTeamBtn.cloneNode(true));
        
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
        
        excelFileInput.replaceWith(excelFileInput.cloneNode(true));
        
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
        
        startGameBtn.replaceWith(startGameBtn.cloneNode(true));
        
        const newStartBtn = document.getElementById('start-game-btn');
        newStartBtn.addEventListener('click', async function() {
            console.log('🚀 Botão Iniciar Jogo clicado!');
            console.log('🔍 Verificando função startGame:', typeof startGame);
            console.log('🔍 Verificando window.startGame:', typeof window.startGame);
            
            // VERIFICAÇÃO EM CASCATA
            if (typeof startGame === 'function') {
                console.log('✅ Função startGame encontrada localmente');
                try {
                    await startGame();
                } catch (error) {
                    console.error('❌ Erro ao executar startGame:', error);
                    alert('Erro ao iniciar jogo: ' + error.message);
                }
            } else if (typeof window.startGame === 'function') {
                console.log('✅ Função window.startGame encontrada');
                try {
                    await window.startGame();
                } catch (error) {
                    console.error('❌ Erro ao executar window.startGame:', error);
                    alert('Erro ao iniciar jogo: ' + error.message);
                }
            } else {
                console.error('❌ Função startGame não disponível em nenhum escopo');
                
                // DIAGNÓSTICO
                console.log('🔍 Diagnóstico:');
                console.log('- window.questions:', window.questions);
                console.log('- window.teams:', window.teams);
                console.log('- window.subjects:', window.subjects);
                
                // TENTAR CARREGAR MANUALMENTE
                console.log('🔄 Tentando carregar gameStart.js manualmente...');
                loadGameStartScriptManually();
            }
        });
        console.log('✅ Event listener do botão Iniciar Jogo configurado');
    } else {
        console.error('❌ Botão Iniciar Jogo não encontrado no DOM');
    }
}

function loadGameStartScriptManually() {
    const script = document.createElement('script');
    script.src = 'js/main/gameStart.js';
    script.onload = function() {
        console.log('✅ gameStart.js recarregado manualmente');
        console.log('🔍 window.startGame após recarregar:', typeof window.startGame);
        
        if (typeof window.startGame === 'function') {
            alert('✅ Sistema recarregado! Clique em "Iniciar Jogo" novamente.');
        } else {
            alert('❌ Sistema ainda não carregado. Recarregue a página (F5).');
        }
    };
    script.onerror = function() {
        console.error('❌ Falha ao carregar gameStart.js manualmente');
        alert('❌ Erro ao carregar sistema. Verifique console (F12).');
    };
    document.head.appendChild(script);
}

function setupUtilityEvents() {
    console.log('🔧 Configurando eventos utilitários...');
    
    // Botões de seleção de assuntos
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
    
    // Botão Bloco de Notas
    const openNotesConfigBtn = document.getElementById('open-notes-config');
    
    if (openNotesConfigBtn) {
        console.log('✅ Botão Bloco de Notas encontrado');
        
        openNotesConfigBtn.replaceWith(openNotesConfigBtn.cloneNode(true));
        
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
    
    // Botões de Performance (verificar pelos ícones)
    const exportPerfBtn = document.querySelector('.performance-header-controls button[title*="Exportar"]');
    const importPerfBtn = document.querySelector('.performance-header-controls button[title*="Importar"]');
    
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
    
    // Verificar se há campo de upload de performance
    const importPerformanceFile = document.getElementById('import-performance-file');
    if (importPerformanceFile) {
        console.log('✅ Input de importação de performance encontrado');
        importPerformanceFile.addEventListener('change', function(event) {
            console.log('📁 Arquivo de performance selecionado');
            if (typeof importPerformanceData === 'function') {
                importPerformanceData(event);
            } else if (typeof window.importPerformanceData === 'function') {
                window.importPerformanceData(event);
            }
        });
    }
}

// Sobre o erro 404 do favicon.ico:
// Para resolver, adicione um favicon.ico na raiz do projeto ou
// adicione isso no <head> do index.html:
// <link rel="icon" href="data:;base64,iVBORw0KGgo="> (favicon vazio)

window.initializeConfigEventListeners = initializeConfigEventListeners;
window.setupTeamManagementEvents = setupTeamManagementEvents;
window.setupFileUploadEvents = setupFileUploadEvents;
window.setupGameStartEvents = setupGameStartEvents;
window.setupUtilityEvents = setupUtilityEvents;
window.fallbackAddTeam = fallbackAddTeam;
window.loadGameStartScriptManually = loadGameStartScriptManually;

console.log('✅ configEvents.js carregado com sucesso!');