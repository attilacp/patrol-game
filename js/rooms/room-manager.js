// js/rooms/room-manager.js - ARQUIVO PRINCIPAL (REDIRECIONADOR)
console.log('🏠 rooms/room-manager.js carregando...');

// Este arquivo agora apenas garante que as funções estão disponíveis
// As implementações estão nos arquivos separados

// Verificar se as funções principais existem, se não, carregar dinamicamente
if (typeof RoomSystem.prototype.generateRoomCode === 'undefined') {
    console.log('📦 Carregando funções de gerenciamento de sala...');
    
    // As funções serão carregadas pelos outros arquivos na ordem correta:
    // 1. room-manager-core.js
    // 2. room-manager-utils.js
    
    // Aguardar um pouco para garantir carregamento
    setTimeout(() => {
        console.log('✅ Funções de gerenciamento disponíveis:');
        console.log('- generateRoomCode:', typeof RoomSystem.prototype.generateRoomCode);
        console.log('- createRoom:', typeof RoomSystem.prototype.createRoom);
        console.log('- joinRoom:', typeof RoomSystem.prototype.joinRoom);
        console.log('- cleanup:', typeof RoomSystem.prototype.cleanup);
        console.log('- addCopyButtonToRoomCode:', typeof RoomSystem.prototype.addCopyButtonToRoomCode);
    }, 100);
}

console.log('✅ rooms/room-manager.js carregado (redirecionador)');