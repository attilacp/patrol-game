// file name: js/fileUpload/status.js
console.log('📁 fileUpload/status.js carregando...');

// Atualizar status do arquivo na UI
function updateFileStatus(message, type) {
    const fileStatus = document.getElementById('file-status');
    const fileError = document.getElementById('file-error');
    
    if (fileStatus) {
        fileStatus.textContent = message;
        fileStatus.className = type === 'success' ? 'status-success' : 
                              type === 'error' ? 'status-error' : 
                              type === 'warning' ? 'status-warning' : '';
    }
    
    if (fileError) {
        fileError.style.display = type === 'error' ? 'block' : 'none';
    }
}

// Exportar
if (typeof window !== 'undefined') {
    window.updateFileStatus = updateFileStatus;
    console.log('✅ fileUpload/status.js exportado');
}