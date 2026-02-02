// js/rooms/ui.js - Atualização de interface
console.log('🏠 rooms/ui.js carregando...');

RoomSystem.prototype.showRoomInfo = function(roomCode) {
    console.log('📋 Mostrando código da sala:', roomCode);
    
    const roomInfo = document.getElementById('room-info');
    if (roomInfo) {
        roomInfo.style.display = 'block';
        console.log('✅ room-info exibido');
    }
};

console.log('✅ rooms/ui.js carregado com sucesso!');