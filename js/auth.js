// js/auth.js - COM SISTEMA DE LOBBY
console.log('🔐 auth.js CARREGADO');

(function() {
    console.log('🚀 Iniciando sistema de autenticação...');
    
    // Sistema principal
    class AuthSystem {
        constructor() {
            this.currentUser = null;
            this.init();
        }
        
        init() {
            // Observar estado de login
            firebase.auth().onAuthStateChanged((user) => {
                this.handleAuthStateChange(user);
            });
            
            this.setupEventListeners();
        }
        
        handleAuthStateChange(user) {
            console.log('👤 Estado auth:', user ? user.email : 'Nenhum usuário');
            
            if (user) {
                this.currentUser = user;
                this.showLobbyScreen(); // MUDANÇA AQUI: Vai para LOBBY, não para jogo direto
                
                // Salvar no localStorage
                localStorage.setItem('patrol_user', JSON.stringify({
                    uid: user.uid,
                    email: user.email
                }));
            } else {
                this.currentUser = null;
                localStorage.removeItem('patrol_user');
                this.showLoginScreen();
            }
        }
        
        setupEventListeners() {
            // Login com email/senha
            const loginBtn = document.getElementById('login-btn');
            if (loginBtn) {
                loginBtn.addEventListener('click', () => this.loginWithEmail());
            }
            
            // Criar conta
            const signupBtn = document.getElementById('signup-btn');
            if (signupBtn) {
                signupBtn.addEventListener('click', () => this.signupWithEmail());
            }
            
            // Google
            const googleBtn = document.getElementById('google-login-btn');
            if (googleBtn) {
                googleBtn.addEventListener('click', () => this.loginWithGoogle());
            }
            
            // Reset senha
            const resetBtn = document.getElementById('reset-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => this.resetPassword());
            }
            
            // Logout
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.logout());
            }
            
            // Botões de voltar
            const backToLogin = document.getElementById('back-to-lobby-login');
            if (backToLogin) {
                backToLogin.addEventListener('click', () => this.showLoginScreen());
            }
            
            const backToLobbyConfig = document.getElementById('back-to-lobby-config');
            if (backToLobbyConfig) {
                backToLobbyConfig.addEventListener('click', () => this.showLobbyScreen());
            }
            
            const backToLobbyGame = document.getElementById('back-to-lobby-game');
            if (backToLobbyGame) {
                backToLobbyGame.addEventListener('click', () => {
                    if (confirm('Sair da partida atual?')) {
                        this.showLobbyScreen();
                    }
                });
            }
        }
        
        async loginWithEmail() {
            const email = document.getElementById('login-email')?.value;
            const password = document.getElementById('login-password')?.value;
            
            if (!email || !password) {
                this.showError('Digite email e senha');
                return;
            }
            
            try {
                await firebase.auth().signInWithEmailAndPassword(email, password);
                console.log('✅ Login realizado');
            } catch (error) {
                this.showError(this.getErrorMessage(error.code));
            }
        }
        
        async signupWithEmail() {
            const email = document.getElementById('login-email')?.value;
            const password = document.getElementById('login-password')?.value;
            
            if (!email || !password) {
                this.showError('Digite email e senha');
                return;
            }
            
            if (password.length < 6) {
                this.showError('Senha precisa 6+ caracteres');
                return;
            }
            
            try {
                await firebase.auth().createUserWithEmailAndPassword(email, password);
                console.log('✅ Conta criada');
            } catch (error) {
                this.showError(this.getErrorMessage(error.code));
            }
        }
        
        async loginWithGoogle() {
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                await firebase.auth().signInWithPopup(provider);
                console.log('✅ Login Google realizado');
            } catch (error) {
                this.showError('Erro ao entrar com Google');
            }
        }
        
        async resetPassword() {
            const email = document.getElementById('login-email')?.value;
            
            if (!email) {
                this.showError('Digite seu email');
                return;
            }
            
            try {
                await firebase.auth().sendPasswordResetEmail(email);
                alert('📧 Email de recuperação enviado!');
            } catch (error) {
                this.showError(this.getErrorMessage(error.code));
            }
        }
        
        logout() {
            firebase.auth().signOut();
        }
        
        // TELA DE LOGIN
        showLoginScreen() {
            console.log('📱 Mostrando tela de login...');
            this.hideAllScreens();
            document.getElementById('login-screen')?.classList.add('active');
        }
        
        // TELA DE LOBBY (NOVO)
        showLobbyScreen() {
            console.log('🎮 Mostrando lobby...');
            this.hideAllScreens();
            document.getElementById('lobby-screen')?.classList.add('active');
            
            // Configurar botões do lobby
            this.setupLobbyButtons();
        }
        
        // TELA DE CONFIGURAÇÃO (APENAS MESTRE)
        showConfigScreen() {
            console.log('⚙️ Mostrando configuração (mestre)...');
            this.hideAllScreens();
            document.getElementById('config-screen')?.classList.add('active');
            
            // Mostrar botão de logout
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) logoutBtn.style.display = 'block';

            // Mostrar código da sala
            if (window.roomSystem && window.roomSystem.currentRoom) {
            	const codeDisplay = document.getElementById('room-code-display');
            	if (codeDisplay) {
            		codeDisplay.textContent = window.roomSystem.currentRoom;
            	}
            }
        }
        
        // TELA DO JOGO (TODOS)
        showGameScreen() {
            console.log('🎯 Mostrando jogo...');
            this.hideAllScreens();
            document.getElementById('game-screen')?.classList.add('active');
           
// CORREÇÃO ERRO 5: Mostrar código da sala
    if (window.roomSystem && window.roomSystem.currentRoom) {
        const codeDisplay = document.getElementById('room-code-display');
        if (codeDisplay) {
            codeDisplay.textContent = window.roomSystem.currentRoom;
        }
    }
    
    // CORREÇÃO ERRO 10: Mostrar nome do usuário
    const userDisplay = document.getElementById('user-name-display');
    if (userDisplay && firebase.auth().currentUser) {
        const email = firebase.auth().currentUser.email;
        const name = email.split('@')[0];
        userDisplay.textContent = name;
    }
        }
        
        // TELA DE PÓDIO
        showPodiumScreen() {
            this.hideAllScreens();
            document.getElementById('podium-screen')?.classList.add('active');
        }
        
        hideAllScreens() {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
        }
        
        setupLobbyButtons() {
            // Botão Criar Sala
            const createBtn = document.getElementById('create-room-btn');
            if (createBtn) {
                createBtn.onclick = () => {
                    if (window.roomSystem) {
                        const roomCode = window.roomSystem.createRoom();
                        console.log('🏁 Sala criada:', roomCode);
                        // Vai para configuração (mestre)
                        this.showConfigScreen();
                    } else {
                        alert('Sistema de salas não carregado');
                    }
                };
            }
            
            // Botão Entrar na Sala
            const joinBtn = document.getElementById('join-room-btn');
            if (joinBtn) {
                joinBtn.onclick = () => {
                    const roomCode = document.getElementById('room-code')?.value.toUpperCase();
                    if (roomCode && roomCode.length === 6) {
                        if (window.roomSystem) {
                            const isMaster = false; // Jogador nunca é mestre ao entrar
                            window.roomSystem.joinRoom(roomCode, isMaster);
                            console.log('🔑 Entrando na sala:', roomCode);
                            
                            // CORREÇÃO: Jogador fica no LOBBY, não vai para jogo
                            // Apenas mostra mensagem de sucesso
                            this.showLobbyScreen();
                            alert(`✅ Entrou na sala ${roomCode}!\nAguardando o mestre iniciar...`);
                        }
                    } else {
                        alert('Digite um código de 6 letras/números');
                    }
                };
            }
            
            // Botão Iniciar Jogo (no lobby)
            const startBtnLobby = document.getElementById('start-game-btn-lobby');
            if (startBtnLobby) {
                startBtnLobby.onclick = () => {
                    this.showConfigScreen();
                };
            }
        }
        
        showError(message) {
            const errorDiv = document.getElementById('login-error');
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                setTimeout(() => errorDiv.style.display = 'none', 5000);
            } else {
                alert('Erro: ' + message);
            }
        }
        
        getErrorMessage(errorCode) {
            const messages = {
                'auth/invalid-email': 'Email inválido',
                'auth/user-not-found': 'Usuário não encontrado',
                'auth/wrong-password': 'Senha incorreta',
                'auth/email-already-in-use': 'Email já cadastrado'
            };
            return messages[errorCode] || 'Erro: ' + errorCode;
        }
    }
    
    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.authSystem = new AuthSystem();
            console.log('✅ Sistema de auth com lobby inicializado');
        });
    } else {
        window.authSystem = new AuthSystem();
        console.log('✅ Sistema de auth com lobby inicializado');
    }
})();