// js/templates.js
console.log('📄 templates.js carregando...');

const TEMPLATES = {
    // TELA DE LOGIN
    login: `
        <div id="login-screen" class="screen active">
            <h1>PATROL</h1>
            
            <div class="login-container">
                <h2>🔐 Entrar no Jogo</h2>
                
                <div class="login-form">
                    <input type="email" id="login-email" placeholder="Seu email" class="login-input">
                    <input type="password" id="login-password" placeholder="Sua senha" class="login-input">
                    <button id="login-btn" class="login-btn">🎮 Entrar</button>
                    <button id="signup-btn" class="signup-btn">📝 Criar Conta</button>
                    <button id="reset-btn" class="reset-btn">🔓 Esqueci a senha</button>
                </div>
                
                <div class="login-options">
                    <p>Ou entre com:</p>
                    <button id="google-login-btn" class="google-btn">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
                        Conta Google
                    </button>
                </div>
                
                <div class="login-error" id="login-error"></div>
            </div>
        </div>
    `,
    
    // TELA DE LOBBY
    lobby: `
        <div id="lobby-screen" class="screen">
            <button id="back-to-lobby-login" class="back-to-lobby">← Voltar</button>
            
            <h1>PATROL</h1>
            
            <div class="lobby-container">
                <h2>🎮 Sala de Jogo</h2>
                
                <div class="lobby-options">
                    <!-- Criar Nova Sala -->
                    <div class="lobby-option">
                        <h3>🏁 Criar Nova Partida</h3>
                        <button id="create-room-btn" class="lobby-btn">
                            Criar como Mestre 👑
                        </button>
                        <p class="lobby-hint">
                            Você controla o jogo e as perguntas
                        </p>
                    </div>
                    
                    <!-- Entrar em Sala Existente -->
                    <div class="lobby-option">
                        <h3>🔑 Entrar na Partida</h3>
                        <input type="text" id="room-code" placeholder="Digite o código" class="lobby-input" maxlength="6">
                        <button id="join-room-btn" class="lobby-btn">
                            Entrar como Jogador 🎮
                        </button>
                        <p class="lobby-hint">
                            Peça o código para quem criou a partida
                        </p>
                    </div>
                </div>
                
                <!-- Código da Sala (quando mestre) -->
                <div id="room-info" style="display: none;">
                    <h3>📋 Código da Sala: <span id="current-room-code">ABC123</span></h3>
                    <p class="room-success">✔ Compartilhe este código com os jogadores</p>
                    <div id="players-list"></div>
                    <button id="start-game-btn-lobby" class="lobby-btn start-btn">
                        🚀 Ir para Configuração
                    </button>
                </div>
            </div>
        </div>
    `,
    
    // TELA DE CONFIGURAÇÃO
    config: `
        <div id="config-screen" class="screen">
            <button id="back-to-lobby-config" class="back-to-lobby">← Voltar ao Lobby</button>
            <button id="logout-btn" class="logout-btn">🚪 Sair</button>
            
            <h1>PATROL - Configuração do Mestre</h1>
            
            <div class="config-main-area">
                <div class="team-config">
                    <h3>Equipes</h3>
                    <div id="teams-container">
                        <div class="team-input">
                            <input type="text" placeholder="Nome da Equipe" value="ALFA">
                            <button class="remove-team" onclick="removeTeam(this)">🗑️</button>
                        </div>
                    </div>
                    <button id="add-team-btn" class="add-team-btn">➕ Adicionar Equipe</button>
                    <div id="team-error" class="error-message">⚠️ Configure pelo menos uma equipe</div>
                </div>

                <div class="file-upload-container">
                    <div class="file-upload">
                        <h3>Perguntas</h3>
                        <input type="file" id="excel-file" accept=".xlsx, .xls">
                        <div id="file-status">📁 Nenhum arquivo selecionado</div>
                        <div id="file-error" class="error-message">⚠️ Carregue um arquivo de perguntas</div>
                        
                        <div class="checkbox-container">
                            <input type="checkbox" id="random-order">
                            <label for="random-order">Ordem aleatória de perguntas e equipes</label>
                        </div>
                    </div>

                    <div class="subjects-config">
                        <h3>Assuntos Carregados</h3>
                        <div class="subjects-controls">
                            <button onclick="toggleAllSubjects(true)" class="subjects-btn">✓ Selecionar Todos</button>
                            <button onclick="toggleAllSubjects(false)" class="subjects-btn">✗ Desmarcar Todos</button>
                            <button onclick="clearAllSubjects()" class="subjects-btn">🗑️ Limpar Tudo</button>
                        </div>
                        <div id="subjects-container" class="subjects-container">
                            <div class="no-subjects">Nenhum assunto carregado</div>
                        </div>
                    </div>

                    <div class="performance-config-container">
                        <div class="performance-header">
                            <span>📊</span> Performance por Assunto
                            <div class="performance-header-controls">
                                <button onclick="exportPerformanceToExcel()" class="performance-header-btn" title="Exportar Performance">
                                    📥
                                </button>
                                <button onclick="triggerPerformanceImport()" class="performance-header-btn" title="Importar Performance">
                                    📤
                                </button>
                            </div>
                        </div>
                        <div class="performance-description">
                            Importe/exporte dados de performance para acompanhamento histórico.
                        </div>
                        <div class="performance-note">
                            Os dados são salvos automaticamente durante o jogo.
                        </div>
                        <input type="file" id="import-performance-file" accept=".csv" class="performance-file-input">
                    </div>

                    <button id="start-game-btn" class="start-game-btn" disabled>🎮 Iniciar Jogo para Todos</button>
                    
                    <div class="ranking-button-container">
                        <button id="open-notes-config" class="notes-btn">📝 Bloco de Notas</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    // TELA DO JOGO
    game: `
        <div id="game-screen" class="screen">
            <button id="back-to-lobby-game" class="back-to-lobby">← Sair da Partida</button>
            
            <h1>PATROL <span id="game-status" class="game-status">● Conectado</span></h1>
            
            <div class="question-main-area">
                <div class="question-area">
                    <div class="question-header">
                        <div class="question-counter">
                            Pergunta <span id="question-number">1</span>/<span id="total-questions">0</span>
                        </div>
                        <div id="team-turn" class="team-turn">🎯 Aguardando início...</div>
                        <div class="question-header-buttons">
                            <button id="open-notes-btn" class="notes-btn">📝 Notas</button>
                            <div id="master-controls" class="master-controls" style="display: none;">
                                <button id="master-next-btn" class="config-btn">⏭️ Avançar</button>
                            </div>
                        </div>
                    </div>
                    
                    <div id="question-text">Aguardando o mestre iniciar o jogo...</div>
                    
                    <div class="answer-buttons">
                        <button id="certo-btn" class="answer-btn certo-btn">✅ CERTO</button>
                        <button id="errado-btn" class="answer-btn errado-btn">❌ ERRADO</button>
                        <button id="skip-btn" class="skip-btn">⏭️ Pular</button>
                        <button id="next-question-btn" class="next-btn" style="display: none;">⏭️ Próxima</button>
                        <button id="podium-btn" class="podium-btn" style="display: none;">🏆 Pódio</button>
                    </div>
                    
                    <div id="correct-answer" class="correct-answer"></div>
                    <div id="commentary" class="commentary"></div>
                </div>

                <div class="active-team-sidebar">
                    <div id="active-team-display"></div>
                    <!-- Placar em tempo real -->
                    <div id="live-scoreboard" class="live-scoreboard">
                        <h4>🏆 Placar ao Vivo</h4>
                        <div id="scoreboard-content"></div>
                    </div>
                </div>
            </div>

            <div class="teams-area">
                <div id="teams-display"></div>
            </div>
            
            <!-- Chat multiplayer -->
            <div id="game-chat" class="game-chat" style="display: none;">
                <div class="chat-container">
                    <h4>💬 Chat da Partida</h4>
                    <div id="chat-messages" class="chat-messages"></div>
                    <div class="chat-input-container">
                        <input type="text" id="chat-input" placeholder="Digite uma mensagem...">
                        <button id="send-chat-btn">Enviar</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    // TELA DE PÓDIO
    podium: `
        <div id="podium-screen" class="screen">
            <h1>PATROL</h1>
            <div class="podium-screen">
                <div class="podium-title">🏆 PÓDIO</div>
                <div id="podium-container" class="podium-container"></div>
            </div>
        </div>
    `,
    
    // MODAL DE NOTAS
    notesModal: `
        <div id="notes-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📝 Bloco de Notas</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="notes-tabs-container">
                        <div class="notes-tabs" id="notes-tabs"></div>
                    </div>
                    <div class="notes-content" id="notes-content"></div>
                    <div class="notes-controls">
                        <button id="save-notes" class="notes-action-btn">💾 Salvar Tudo</button>
                        <button id="export-notes" class="notes-action-btn">📥 Exportar Tudo</button>
                        <button id="import-notes" class="notes-action-btn">📤 Importar Tudo</button>
                        <button id="clear-notes" class="notes-action-btn">🗑️ Limpar Esta Aba</button>
                    </div>
                    <input type="file" id="import-notes-file" accept=".json">
                </div>
            </div>
        </div>
    `
};

function loadTemplate(templateName, containerId = 'main-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ Container não encontrado: ${containerId}`);
        return false;
    }
    
    if (!TEMPLATES[templateName]) {
        console.error(`❌ Template não encontrado: ${templateName}`);
        return false;
    }
    
    container.innerHTML = TEMPLATES[templateName];
    console.log(`✅ Template carregado: ${templateName}`);
    
    // Disparar evento para notificar que o template foi carregado
    document.dispatchEvent(new CustomEvent('templateLoaded', {
        detail: { templateName }
    }));
    
    return true;
}

function loadAllTemplates() {
    console.log('📄 Carregando todas as telas...');
    
    // Carregar tela de login inicialmente
    loadTemplate('login');
    
    // Carregar modal de notas em container separado
    const modalContainer = document.getElementById('notes-modal-container');
    if (modalContainer) {
        modalContainer.innerHTML = TEMPLATES.notesModal;
        console.log('✅ Modal de notas carregado');
    }
}

// Exportar
window.TEMPLATES = TEMPLATES;
window.loadTemplate = loadTemplate;
window.loadAllTemplates = loadAllTemplates;

console.log('✅ templates.js carregado');