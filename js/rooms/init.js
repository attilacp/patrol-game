// js/rooms/init.js - Inicialização
console.log('🏠 rooms/init.js carregando...');

function initializeRoomSystem() {
    console.log('🚀 Inicializando sistema de salas...');
    
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase não disponível');
        return;
    }
    
    window.roomSystem = new RoomSystem();
    console.log('✅ Sistema de salas inicializado');
    
    // Configurar botões do lobby
    setupLobbyButtons();
}

function setupLobbyButtons() {
    const createBtn = document.getElementById('create-room-btn');
    if (createBtn) {
        createBtn.onclick = async () => {
            if (!window.roomSystem) {
                alert('Sistema de salas não carregado');
                return;
            }
            
            createBtn.disabled = true;
            createBtn.textContent = '⏳ Criando sala...';
            
            const roomCode = await window.roomSystem.createRoom();
            
            if (roomCode) {
                // Ir para configuração após 2 segundos
                setTimeout(() => {
                    if (window.authSystem) {
                        window.authSystem.showConfigScreen();
                    }
                }, 2000);
            } else {
                createBtn.disabled = false;
                createBtn.textContent = 'Criar como Mestre 👑';
            }
        };
    }
    
    const joinBtn = document.getElementById('join-room-btn');
    if (joinBtn) {
        joinBtn.onclick = async () => {
            const roomCode = document.getElementById('room-code')?.value.toUpperCase();
            if (!roomCode || roomCode.length !== 6) {
                alert('Digite um código de 6 letras/números');
                return;
            }
            
            if (!window.roomSystem) {
                alert('Sistema de salas não carregado');
                return;
            }
            
            joinBtn.disabled = true;
            joinBtn.textContent = '⏳ Entrando...';
            
            const success = await window.roomSystem.joinRoom(roomCode);
            
            if (success) {
                // Jogador fica no lobby aguardando
                alert(`✅ Entrou na sala ${roomCode}!\nAguardando o mestre...`);
            } else {
                joinBtn.disabled = false;
                joinBtn.textContent = 'Entrar como Jogador 🎮';
            }
        };
    }
}

// Inicializar
setTimeout(initializeRoomSystem, 1000);

console.log('✅ rooms/init.js carregado com sucesso!');