// js/rooms/init.js - Inicialização do sistema de salas
console.log('🏠 rooms/init.js carregando...');

RoomSystem.prototype.showNotification = function(message, type = 'info') {
    // Criar notificação temporária
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = 'room-notification';
    
    const colors = {
        info: { bg: '#003366', border: '#FFCC00', color: '#FFCC00' },
        success: { bg: '#28a745', border: '#1e7e34', color: '#fff' },
        warning: { bg: '#ffc107', border: '#e0a800', color: '#003366' },
        error: { bg: '#dc3545', border: '#bd2130', color: '#fff' }
    };
    
    const color = colors[type] || colors.info;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color.bg};
        color: ${color.color};
        padding: 12px 20px;
        border-radius: 8px;
        border: 2px solid ${color.border};
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-weight: 600;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

// Adicionar estilos para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .room-notification {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
    }
`;
document.head.appendChild(style);

// Inicializar sistema de salas quando DOM estiver pronto
function initializeRoomSystem() {
    console.log('🚀 Inicializando sistema de salas...');
    
    if (typeof firebase === 'undefined' || !firebase.database) {
        console.error('❌ Firebase não está disponível');
        setTimeout(initializeRoomSystem, 1000);
        return;
    }
    
    window.roomSystem = new RoomSystem();
    console.log('✅ Sistema de salas inicializado');
    
    // Configurar botões do lobby
    setupLobbyButtons();
    
    // Adicionar nome do usuário nas telas
    addUserNameToScreens();
}

function setupLobbyButtons() {
    console.log('🎮 Configurando botões do lobby...');
    
    // Botão Criar Sala
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
                // Ir para configuração (mestre)
                if (window.authSystem) {
                    window.authSystem.showConfigScreen();
                }
            } else {
                createBtn.disabled = false;
                createBtn.textContent = 'Criar como Mestre 👑';
            }
        };
    }
    
    // Botão Entrar na Sala
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
                // Ir para tela do jogo
                if (window.authSystem) {
                    window.authSystem.showGameScreen();
                }
            } else {
                joinBtn.disabled = false;
                joinBtn.textContent = 'Entrar como Jogador 🎮';
            }
        };
    }
    
    // Botão Iniciar Jogo (no lobby do mestre)
    const startBtnLobby = document.getElementById('start-game-btn-lobby');
    if (startBtnLobby) {
        startBtnLobby.onclick = () => {
            if (window.authSystem) {
                window.authSystem.showConfigScreen();
            }
        };
    }
    
    // Input do código da sala (auto uppercase)
    const roomCodeInput = document.getElementById('room-code');
    if (roomCodeInput) {
        roomCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
        
        roomCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                joinBtn?.click();
            }
        });
    }
}

function addUserNameToScreens() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const userName = user.displayName || user.email || 'Jogador';
    
    // Adicionar badge com nome do usuário em todas as telas
    const screens = ['login-screen', 'lobby-screen', 'config-screen', 'game-screen', 'podium-screen'];
    
    screens.forEach(screenId => {
        const screen = document.getElementById(screenId);
        if (screen) {
            // Verificar se já existe o badge
            let userBadge = screen.querySelector('.user-badge');
            
            if (!userBadge) {
                userBadge = document.createElement('div');
                userBadge.className = 'user-badge';
                userBadge.innerHTML = `
                    <span class="user-icon">👤</span>
                    <span class="user-name">${userName}</span>
                    ${window.roomSystem?.isMaster ? '<span class="master-badge">👑</span>' : ''}
                `;
                userBadge.style.cssText = `
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(0, 51, 102, 0.9);
                    color: #FFCC00;
                    padding: 8px 15px;
                    border-radius: 20px;
                    border: 2px solid #FFCC00;
                    font-weight: 600;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    z-index: 99;
                `;
                
                screen.appendChild(userBadge);
            }
        }
    });
    
    console.log('✅ Nome do usuário adicionado às telas:', userName);
}

// Inicializar quando Firebase estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRoomSystem);
} else {
    setTimeout(initializeRoomSystem, 1000);
}

console.log('✅ rooms/init.js carregado com sucesso!');