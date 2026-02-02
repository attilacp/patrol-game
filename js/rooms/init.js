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
    
    // TESTE TEMPORÁRIO - REMOVER DEPOIS
    addTestButton();
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
                // MOSTRAR CÓDIGO DA SALA IMEDIATAMENTE NO LOBBY
                const roomInfo = document.getElementById('room-info');
                const roomCodeSpan = document.getElementById('current-room-code');
                
                if (roomInfo) {
                    roomInfo.style.display = 'block';
                    roomInfo.style.animation = 'fadeIn 0.5s ease';
                    console.log('✅ room-info exibido');
                }
                
                if (roomCodeSpan) {
                    roomCodeSpan.textContent = roomCode;
                    console.log('✅ Código atualizado no DOM:', roomCode);
                }
                
                // Adicionar botão copiar
                addCopyButtonToRoomCode(roomCode);
                
                // Mostrar notificação
                window.roomSystem.showNotification(`🎉 Sala criada! Código: ${roomCode}`, 'success');
                
                // Aguardar 2 segundos antes de ir para configuração
                setTimeout(() => {
                    // Ir para configuração (mestre)
                    if (window.authSystem) {
                        window.authSystem.showConfigScreen();
                    }
                }, 2000);
                
            } else {
                createBtn.disabled = false;
                createBtn.textContent = 'Criar como Mestre 👑';
                window.roomSystem.showNotification('❌ Erro ao criar sala', 'error');
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
                setTimeout(() => {
                    if (window.authSystem) {
                        window.authSystem.showGameScreen();
                    }
                }, 1000);
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

function addCopyButtonToRoomCode(roomCode) {
    const codeContainer = document.getElementById('current-room-code');
    if (!codeContainer || codeContainer.parentNode.querySelector('.copy-code-btn')) return;
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-code-btn';
    copyBtn.innerHTML = '📋 Copiar';
    copyBtn.style.cssText = `
        background: #003366;
        color: #FFCC00;
        border: 2px solid #FFCC00;
        padding: 5px 15px;
        border-radius: 5px;
        cursor: pointer;
        margin-left: 10px;
        font-size: 12px;
        font-weight: bold;
        transition: all 0.3s;
    `;
    
    copyBtn.onmouseenter = () => {
        copyBtn.style.background = '#002244';
        copyBtn.style.transform = 'translateY(-2px)';
    };
    
    copyBtn.onmouseleave = () => {
        copyBtn.style.background = '#003366';
        copyBtn.style.transform = 'translateY(0)';
    };
    
    copyBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        navigator.clipboard.writeText(roomCode)
            .then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '✅ Copiado!';
                copyBtn.disabled = true;
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.disabled = false;
                }, 2000);
            })
            .catch(err => {
                console.error('Erro ao copiar:', err);
                copyBtn.innerHTML = '❌ Erro';
            });
    };
    
    codeContainer.parentNode.appendChild(copyBtn);
}

// TESTE TEMPORÁRIO - REMOVER DEPOIS
function addTestButton() {
    console.log('🧪 Adicionando botão de teste...');
    
    setTimeout(() => {
        const lobbyContainer = document.querySelector('.lobby-container');
        if (!lobbyContainer) return;
        
        const testBtn = document.createElement('button');
        testBtn.textContent = '🧪 TESTE: Simular Criação de Sala';
        testBtn.style.cssText = `
            background: linear-gradient(145deg, #dc3545, #c82333);
            color: white !important;
            padding: 12px 24px;
            margin: 20px auto;
            border-radius: 10px;
            border: 3px solid #bd2130;
            display: block;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        `;
        
        testBtn.onmouseenter = () => {
            testBtn.style.transform = 'translateY(-3px)';
            testBtn.style.boxShadow = '0 8px 20px rgba(220,53,69,0.3)';
        };
        
        testBtn.onmouseleave = () => {
            testBtn.style.transform = 'translateY(0)';
            testBtn.style.boxShadow = 'none';
        };
        
        testBtn.onclick = () => {
            console.log('🧪 Teste: Simulando criação de sala...');
            
            // Simular código de sala
            const testCode = 'TEST' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            
            // Mostrar room-info
            const roomInfo = document.getElementById('room-info');
            const roomCodeSpan = document.getElementById('current-room-code');
            
            if (roomInfo) {
                roomInfo.style.display = 'block';
                roomInfo.style.animation = 'fadeIn 0.5s ease';
                
                // Atualizar conteúdo
                if (!roomCodeSpan) {
                    roomInfo.innerHTML = `
                        <h3>📋 Código da Sala: <span id="current-room-code" style="color: #FFCC00; background: #003366; padding: 5px 15px; border-radius: 8px; font-family: monospace; letter-spacing: 2px;">${testCode}</span></h3>
                        <p style="color: #28a745; font-weight: bold;">✔ TESTE: Código gerado com sucesso!</p>
                        <div id="players-list">
                            <h4>👥 Jogadores Conectados:</h4>
                            <div class="player-item master">
                                <span class="player-icon">👑</span>
                                <span class="player-name">Você (Mestre)</span>
                                <span class="player-status">✅ Pronto</span>
                                <span class="player-score">0 pts</span>
                            </div>
                            <div class="player-item">
                                <span class="player-icon">👤</span>
                                <span class="player-name">Jogador Teste 1</span>
                                <span class="player-status">⏳ Aguardando</span>
                                <span class="player-score">0 pts</span>
                            </div>
                        </div>
                        <button id="start-game-btn-lobby" class="lobby-btn start-btn" style="margin-top: 20px;">
                            🚀 Ir para Configuração
                        </button>
                    `;
                }
                
                console.log('✅ Teste: room-info exibido com código', testCode);
                
                // Adicionar botão copiar
                addCopyButtonToRoomCode(testCode);
                
                // Configurar botão "Ir para Configuração"
                setTimeout(() => {
                    const startBtn = document.getElementById('start-game-btn-lobby');
                    if (startBtn) {
                        startBtn.onclick = () => {
                            if (window.authSystem) {
                                window.authSystem.showConfigScreen();
                            }
                        };
                    }
                }, 100);
                
            } else {
                console.error('❌ Teste: Elemento room-info não encontrado');
                alert('Erro: Elemento #room-info não encontrado no DOM');
            }
        };
        
        lobbyContainer.appendChild(testBtn);
        console.log('✅ Botão de teste adicionado');
        
    }, 2000); // Aguardar 2 segundos
}

// Inicializar quando Firebase estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRoomSystem);
} else {
    setTimeout(initializeRoomSystem, 1000);
}

console.log('✅ rooms/init.js carregado com sucesso!');