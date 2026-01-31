// js/fileUpload/main.js - VERSÃO CORRIGIDA (sem import dinâmico)
console.log('📁 fileUpload/main.js carregando...');

// Sistema principal de upload de arquivos com extração de assuntos A1, B1, C1, D1

// Função principal - será chamada quando arquivo for selecionado
function handleFileUpload(event) {
    console.log('📄 Função handleFileUpload chamada');
    
    // VERIFICAR SE XLSX ESTÁ DISPONÍVEL
    if (typeof XLSX === 'undefined') {
        console.error('❌ XLSX não está disponível');
        updateFileStatus('❌ Biblioteca XLSX não carregada', 'error');
        
        // Tentar recarregar
        setTimeout(() => {
            if (typeof XLSX !== 'undefined') {
                console.log('✅ XLSX carregado, tentando novamente...');
                handleFileUpload(event); // Tentar novamente
            } else {
                alert('Erro: Biblioteca XLSX não carregada. Recarregue a página.');
            }
        }, 1000);
        return;
    }
    
    const file = event.target.files[0];
    if (!file) {
        updateFileStatus('📁 Nenhum arquivo selecionado', 'error');
        window.questions = [];
        const fileError = document.getElementById('file-error');
        if (fileError) fileError.style.display = 'block';
        if (typeof checkStartGame === 'function') checkStartGame();
        return;
    }

    const fileStatus = document.getElementById('file-status');
    if (fileStatus) {
        fileStatus.textContent = '⏳ Processando: ' + file.name;
        fileStatus.className = '';
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            
            // Verificar se é arquivo de Perguntas Bomba
            if (isBombQuestionFile(file.name)) {
                if (window.bombQuestionSystem) {
                    window.bombQuestionSystem.loadBombQuestions(workbook, file.name);
                    
                    const status = window.bombQuestionSystem.getLoadStatus?.() || {};
                    const config = window.bombQuestionConfig ? window.bombQuestionConfig.getConfig() : {maxPairs: 3};
                    
                    if (status.loaded) {
                        updateFileStatus(`✅ Arquivo de Perguntas Bomba carregado - ${status.totalTables} tabelas (maxPairs=${config.maxPairs})`, 'success');
                    } else {
                        updateFileStatus(`⚠️ ${status.error || 'Nenhuma pergunta bomba válida encontrada'}`, 'warning');
                    }
                } else {
                    updateFileStatus('❌ Sistema de PB não carregado', 'error');
                }
            } else {
                // Processar arquivo normal de perguntas
                processWorkbook(workbook, file.name);
            }
            
        } catch (error) {
            updateFileStatus('❌ Erro ao processar o arquivo', 'error');
            window.questions = [];
            const fileError = document.getElementById('file-error');
            if (fileError) fileError.style.display = 'block';
            console.error('Erro ao processar arquivo:', error);
        }
        
        if (typeof checkStartGame === 'function') {
            checkStartGame();
        }
    };
    
    reader.onerror = function() {
        updateFileStatus('❌ Erro ao ler o arquivo', 'error');
        window.questions = [];
        const fileError = document.getElementById('file-error');
        if (fileError) fileError.style.display = 'block';
        if (typeof checkStartGame === 'function') {
            checkStartGame();
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// Verificar se é arquivo de Perguntas Bomba
function isBombQuestionFile(fileName) {
    return fileName.toLowerCase().includes('bomba') || 
           fileName.toLowerCase().includes('pb') ||
           fileName.toLowerCase().includes('perguntabomba') ||
           fileName.toLowerCase().includes('bomb') ||
           fileName.toLowerCase().includes('pergunta-bomba');
}

// Exportar funções principais
if (typeof window !== 'undefined') {
    window.handleFileUpload = handleFileUpload;
    window.isBombQuestionFile = isBombQuestionFile;
    
    console.log('✅ fileUpload/main.js exportado');
}