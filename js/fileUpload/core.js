// file name: js/fileUpload/core.js
console.log('📁 fileUpload/core.js carregando...');

// Processar workbook Excel e extrair perguntas
function processWorkbook(workbook, fileName) {
    if (!window.subjects) window.subjects = {};
    
    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 1) {
            const cellA1 = jsonData[0] && jsonData[0][0] ? jsonData[0][0].toString().trim() : '';
            const cellB1 = jsonData[0] && jsonData[0][1] ? jsonData[0][1].toString().trim() : '';
            const cellC1 = jsonData[0] && jsonData[0][2] ? jsonData[0][2].toString().trim() : '';
            const cellD1 = jsonData[0] && jsonData[0][3] ? jsonData[0][3].toString().trim() : '';
            
            // Formato para a tela de jogo (SEM ASPAS)
            let assuntoJogo = '';
            if (cellB1) assuntoJogo += cellB1;
            if (cellC1) {
                if (assuntoJogo) assuntoJogo += '; ';
                assuntoJogo += cellC1;
            }
            if (cellD1) {
                if (assuntoJogo) assuntoJogo += '; ';
                assuntoJogo += cellD1;
            }
            
            // Se não houver B1, C1, D1, usar A1
            if (!assuntoJogo && cellA1) {
                assuntoJogo = cellA1;
            }
            
            // Formato para exibição na lista de assuntos (sem A1, sem rótulos B1, C1, D1)
            let assuntoLista = '';
            if (cellB1) assuntoLista += cellB1;
            if (cellC1) {
                if (assuntoLista) assuntoLista += '; ';
                assuntoLista += cellC1;
            }
            if (cellD1) {
                if (assuntoLista) assuntoLista += '; ';
                assuntoLista += cellD1;
            }
            
            const questions = extractQuestionsFromSheet(jsonData, sheetName, assuntoJogo);
            
            if (!window.subjects[sheetName]) {
                window.subjects[sheetName] = {
                    name: sheetName,
                    displayName: sheetName,
                    cellA1: cellA1,
                    cellB1: cellB1,
                    cellC1: cellC1,
                    cellD1: cellD1,
                    assuntoJogo: assuntoJogo,
                    assuntoLista: assuntoLista,
                    questions: [],
                    enabled: true,
                    fileName: fileName,
                    recurrence: 'alta'
                };
            }
            
            window.subjects[sheetName].questions.push(...questions);
        }
    });
    
    updateFileStatus('✅ ' + Object.keys(window.subjects).length + ' assuntos carregados', 'success');
    const fileError = document.getElementById('file-error');
    if (fileError) fileError.style.display = 'none';
    
    if (typeof updateSubjectsList === 'function') {
        updateSubjectsList();
    }
    if (typeof updateTotalQuestionsCount === 'function') {
        updateTotalQuestionsCount();
    }
    if (typeof checkStartGame === 'function') checkStartGame();
}

// Extrair perguntas de uma sheet do Excel
function extractQuestionsFromSheet(jsonData, sheetName, assuntoInfo) {
    const headers = jsonData[1];
    const questions = [];
    
    const enunciadoIndex = headers.findIndex(header => 
        header && header.toString().toLowerCase().includes('enunciado')
    );
    const gabaritoIndex = headers.findIndex(header => 
        header && header.toString().toLowerCase().includes('gabarito')
    );
    const comentarioIndex = headers.findIndex(header => 
        header && header.toString().toLowerCase().includes('comentário') || 
        header && header.toString().toLowerCase().includes('comentario')
    );
    
    if (enunciadoIndex !== -1 && gabaritoIndex !== -1) {
        for (let i = 2; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row[enunciadoIndex]) {
                const question = {
                    enunciado: row[enunciadoIndex],
                    gabarito: row[gabaritoIndex] ? row[gabaritoIndex].toString().toUpperCase().trim() : '',
                    comentario: comentarioIndex !== -1 ? row[comentarioIndex] : '',
                    assunto: sheetName,
                    assuntoInfo: assuntoInfo  // JÁ SEM ASPAS
                };
                questions.push(question);
            }
        }
    }
    
    return questions;
}

// Exportar funções
if (typeof window !== 'undefined') {
    window.processWorkbook = processWorkbook;
    window.extractQuestionsFromSheet = extractQuestionsFromSheet;
    
    console.log('✅ fileUpload/core.js exportado');
}