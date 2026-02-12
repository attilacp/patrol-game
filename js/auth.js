// js/auth.js - VERSÃO FINAL
console.log('🔐 auth.js CARREGADO');

(function() {
    class AuthSystem {
        constructor() {
            this.currentUser = null;
            // NÃO inicializar ainda, esperar Firebase
        }
        
        init() {
            if (!firebase?.auth) {
                console.warn('⏳ Aguardando Firebase...');
                setTimeout(() => this.init(), 500);
                return;
            }
            
            firebase.auth().onAuthStateChanged((user) => {
                this.handleAuthStateChange(user);
            });
            this.setupEventListeners();
        }
        
        handleAuthStateChange(user) {
            if (user) {
                this.currentUser = user;
                this.showLobbyScreen();
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
            document.getElementById('login-btn')?.addEventListener('click', () => this.loginWithEmail());
            document.getElementById('signup-btn')?.addEventListener('click', () => this.signupWithEmail());
            document.getElementById('google-login-btn')?.addEventListener('click', () => this.loginWithGoogle());
            document.getElementById('reset-btn')?.addEventListener('click', () => this.resetPassword());
            document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
            document.getElementById('logout-btn-game')?.addEventListener('click', () => this.logout());
            document.getElementById('back-to-lobby-login')?.addEventListener('click', () => this.logout());
            
            document.getElementById('back-to-config-btn')?.addEventListener('click', () => {
                if (window.roomSystem?.isMaster) this.showConfigScreen();
            });
        }
        
        async loginWithEmail() {
            const email = document.getElementById('login-email')?.value;
            const password = document.getElementById('login-password')?.value;
            
            if (!email || !password) {
                this.showError('Preencha email e senha');
                return;
            }
            
            try {
                await firebase.auth().signInWithEmailAndPassword(email, password);
            } catch (error) {
                this.showError(this.getErrorMessage(error.code));
            }
        }
        
        async signupWithEmail() {
            const email = document.getElementById('login-email')?.value;
            const password = document.getElementById('login-password')?.value;
            
            if (!email || !password) {
                this.showError('Preencha email e senha');
                return;
            }
            
            if (password.length < 6) {
                this.showError('Senha deve ter no mínimo 6 caracteres');
                return;
            }
            
            try {
                await firebase.auth().createUserWithEmailAndPassword(email, password);
            } catch (error) {
                this.showError(this.getErrorMessage(error.code));
            }
        }
        
        async loginWithGoogle() {
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                await firebase.auth().signInWithPopup(provider);
            } catch (error) {
                this.showError(this.getErrorMessage(error.code));
            }
        }
        
        async resetPassword() {
            const email = document.getElementById('login-email')?.value;
            
            if (!email) {
                this.showError('Digite seu email primeiro');
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
            if (confirm('🚪 Deseja realmente sair do PATROL?')) {
                firebase.auth().signOut();
            }
        }
        
        showLoginScreen() {
            this.hideAllScreens();
            document.getElementById('login-screen')?.classList.add('active');
        }
        
        showLobbyScreen() {
            this.hideAllScreens();
            document.getElementById('lobby-screen')?.classList.add('active');
            this.setupLobbyButtons();
        }
        
        showConfigScreen() {
            this.hideAllScreens();
            document.getElementById('config-screen')?.classList.add('active');
            this.updateRoomCodeDisplay();
            document.getElementById('logout-btn').style.display = 'block';
        }
        
        showGameScreen() {
            this.hideAllScreens();
            document.getElementById('game-screen')?.classList.add('active');
            this.updateRoomCodeDisplay();
            this.updateUserDisplay();
        }
        
        updateRoomCodeDisplay() {
            [0, 100, 300, 500].forEach(delay => {
                setTimeout(() => {
                    if (window.roomSystem?.currentRoom) {
                        document.querySelectorAll('#room-code-display').forEach(el => {
                            el.textContent = window.roomSystem.currentRoom;
                        });
                    }
                }, delay);
            });
        }
        
        updateUserDisplay() {
            setTimeout(() => {
                const userDisplay = document.getElementById('user-name-display');
                if (userDisplay && firebase.auth().currentUser) {
                    userDisplay.textContent = firebase.auth().currentUser.email.split('@')[0];
                }
            }, 200);
        }
        
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
            document.getElementById('create-room-btn').onclick = () => {
                if (window.roomSystem) {
                    window.roomSystem.createRoom();
                    this.showConfigScreen();
                }
            };
            
            document.getElementById('join-room-btn').onclick = () => {
                const code = document.getElementById('room-code')?.value.trim().toUpperCase();
                if (code && window.roomSystem) {
                    window.roomSystem.joinRoom(code);
                }
            };
        }
        
        showError(message) {
            const errorDiv = document.getElementById('login-error');
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                setTimeout(() => errorDiv.style.display = 'none', 5000);
            }
        }
        
        getErrorMessage(code) {
            const errors = {
                'auth/email-already-in-use': 'Email já cadastrado',
                'auth/invalid-email': 'Email inválido',
                'auth/user-not-found': 'Usuário não encontrado',
                'auth/wrong-password': 'Senha incorreta',
                'auth/weak-password': 'Senha muito fraca'
            };
            return errors[code] || 'Erro ao autenticar';
        }
    }
    
    window.authSystem = new AuthSystem();
    
    // Inicializar quando Firebase estiver pronto
    if (window.firebase?.auth) {
        window.authSystem.init();
    } else {
        document.addEventListener('firebaseReady', () => {
            window.authSystem.init();
        });
        setTimeout(() => window.authSystem.init(), 1000);
    }
    
    window.showLoginScreen = () => window.authSystem.showLoginScreen();
    window.showLobbyScreen = () => window.authSystem.showLobbyScreen();
    window.showConfigScreen = () => window.authSystem.showConfigScreen();
    window.showGameScreen = () => window.authSystem.showGameScreen();
    window.showPodiumScreen = () => window.authSystem.showPodiumScreen();
    
    console.log('✅ auth.js PRONTO');
})();
