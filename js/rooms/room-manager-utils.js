// js/rooms/room-manager-utils.js - FUNÇÕES AUXILIARES
console.log('🏠 rooms/room-manager-utils.js carregando...');

RoomSystem.prototype.cleanup = function() {
    this.currentRoom = null;
    this.isMaster = false;
    this.players = {};
    console.log('🧹 Sistema de salas limpo');
};

RoomSystem.prototype.addCopyButtonToRoomCode = function(roomCode) {
    const codeContainer = document.getElementById('current-room-code');
    if (!codeContainer) return;
    
    // Remover botão anterior se existir
    const existingBtn = codeContainer.parentNode.querySelector('.copy-code-btn');
    if (existingBtn) existingBtn.remove();
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-code-btn';
    copyBtn.innerHTML = '📋 Copiar';
    copyBtn.style.cssText = `
        background: #003366; color: #FFCC00; border: 2px solid #FFCC00;
        padding: 5px 15px; border-radius: 5px; cursor: pointer;
        margin-left: 10px; font-size: 12px; font-weight: bold;
    `;
    
    copyBtn.onclick = (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(roomCode).then(() => {
            copyBtn.innerHTML = '✅ Copiado!';
            setTimeout(() => copyBtn.innerHTML = '📋 Copiar', 2000);
        });
    };
    
    codeContainer.parentNode.appendChild(copyBtn);
    console.log('✅ Botão copiar adicionado');
};

console.log('✅ rooms/room-manager-utils.js carregado');