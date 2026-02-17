// PATROL - Templates HTML
console.log('📄 Templates carregando...');

const TEMPLATES = {
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
                    <button id="reset-btn" class="reset-btn">🔑 Esqueci a senha</button>
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
    
    lobby: `
        <div id="lobby-screen" class="screen">
            <div class="room-code-header">Sala: <span id="room-code-display">------</span></div>
            <button id="logout-btn-lobby" class="logout-btn-discrete">Logout</button>
            <h1>PATROL</h1>
            <div class="lobby-container">
                <h2>🎮 Sala de Jogo</h2>
                <div class="lobby-options">
                    <div class="lobby-option">
                        <h3>🆕 Criar Nova Partida</h3>
                        <button id="create-room-btn" class="lobby-btn">Criar como Mestre 👑</button>
                        <p class="lobby-hint">Você controla o jogo e as perguntas</p>
                    </div>
                    <div class="lobby-option">
                        <h3>🔑 Entrar na Partida</h3>
                        <input type="text" id="room-code" placeholder="Digite o código" class="lobby-input" maxlength="6">
                        <button id="join-room-btn" class="lobby-btn">Entrar como Jogador 🎮</button>
                        <p class="lobby-hint">Peça o código para quem criou a partida</p>
                    </div>
                </div>
                <div id="room-info" style="display: none;">
                    <h3>📋 Código da Sala: <span id="current-room-code">------</span></h3>
                    <p class="room-success">✓ Compartilhe este código com os jogadores</p>
                    <div id="players-list"></div>
                </div>
            </div>
        </div>
    `,
    
    config: `
        <div id="config-screen" class="screen">
            <div class="room-code-header">Sala: <span id="room-code-display">------</span></div>
            <button id="logout-btn-config" class="logout-btn-discrete">Logout</button>
            <h1>PATROL</h1>
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
                            <input type="checkbox" id="random-order" checked>
                            <label for="random-order">Ordem aleatória</label>
                        </div>
                    </div>
                    <div class="subjects-config">
                        <h3>Assuntos Carregados</h3>
                        <div class="subjects-controls">
                            <button onclick="selectAllSubjects()" class="subjects-btn">✓ Todos</button>
                            <button onclick="deselectAllSubjects()" class="subjects-btn">✗ Nenhum</button>
                            <button onclick="clearSubjects()" class="subjects-btn">🗑️ Limpar</button>
                        </div>
                        <div id="subjects-container" class="subjects-container">
                            <div class="no-subjects">Nenhum assunto carregado</div>
                        </div>
                    </div>
                    <button id="start-game-btn" class="start-game-btn" disabled>🎮 Iniciar Jogo</button>
                </div>
            </div>
        </div>
    `,
    
    game: `
        <div id="game-screen" class="screen">
            <div class="room-code-header">Sala: <span id="room-code-display">------</span></div>
            <button id="logout-btn-game" class="logout-btn-discrete">Logout</button>
            <h1>PATROL</h1>
            <div class="question-main-area">
                <div class="question-area">
                    <div class="question-header">
                        <div class="question-counter">
                            Pergunta <span id="question-number">1</span>/<span id="total-questions">0</span>
                        </div>
                        <div id="team-turn" class="team-turn">🎯 Aguardando início...</div>
                        <div class="question-header-buttons">
                            <button id="open-notes-btn" class="notes-btn">📝 Notas</button>
                            <button id="back-to-config-btn" class="config-btn">⚙️ Config</button>
                        </div>
                    </div>
                    <div id="question-text">Aguardando início do jogo...</div>
                    <div class="answer-buttons">
                        <button id="certo-btn" class="answer-btn certo-btn">✅ CERTO</button>
                        <button id="errado-btn" class="answer-btn errado-btn">❌ ERRADO</button>
                        <button id="skip-btn" class="skip-btn">⏭️ Pular</button>
                        <button id="next-btn" class="next-btn" style="display:none;">⏭️ Próxima</button>
                        <button id="podium-btn" class="podium-btn" style="display:none;">🏆 Pódio</button>
                    </div>
                    <div id="answer-result"></div>
                    <div id="commentary"></div>
                </div>
                <div class="active-team-sidebar">
                    <div id="active-team-display"></div>
                </div>
            </div>
            <div class="teams-area">
                <div id="teams-display"></div>
            </div>
        </div>
    `,
    
    podium: `
        <div id="podium-screen" class="screen">
            <h1>PATROL</h1>
            <div class="podium-screen">
                <div class="podium-title">🏆 PÓDIO</div>
                <div id="podium-container" class="podium-container"></div>
                <div class="podium-buttons">
                    <button id="restart-btn" class="lobby-btn">🔄 Nova Partida</button>
                    <button id="config-btn" class="lobby-btn">⚙️ Configurações</button>
                </div>
            </div>
        </div>
    `
};

function loadAllTemplates() {
    console.log('📄 Carregando templates...');
    
    const container = document.getElementById('main-container');
    if (!container) {
        console.error('❌ main-container não encontrado');
        return;
    }
    
    container.innerHTML = Object.values(TEMPLATES).join('');
    
    console.log('✅ Templates carregados');
    document.dispatchEvent(new Event('templatesLoaded'));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllTemplates);
} else {
    loadAllTemplates();
}

window.TEMPLATES = TEMPLATES;
window.loadAllTemplates = loadAllTemplates;

console.log('✅ Templates carregado');
