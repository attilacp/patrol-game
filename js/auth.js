ARQUIVO: auth.js
LOCALIZAÇÃO: js/auth.js
===============================================

// PATROL - Sistema de Autenticação
console.log('🔐 Auth carregando...');

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        // Aguardar Firebase estar pronto
        if (!firebase?.auth) {
            setTimeout(() => this.init(), 500);
            return;
        }
        
        firebase.auth().onAuthStateChanged(user => {
            this.handleAuthStateChange(user);
        });
        
        this.setupEventListeners();
        console.log('✅ Auth inicializado');
    }
    
    handleAuthStateChange(user) {
        if (user) {
            this.currentUser = user;
            console.log('👤 Usuário logado:', user.email);
            this.showScreen('lobby-screen');
            localStorage.setItem('patrol_user', JSON.stringify({
                uid: user.uid,
                email: user.email
            }));
        } else {
            this.currentUser = null;
            localStorage.removeItem('patrol_user');
            this.showScreen('login-screen');
        }
    }
    
    setupEventListeners() {
        // Login
        document.getElementById('login-btn')?.addEventListener('click', () => {
            this.loginWithEmail();
        });
        
        // Cadastro
        document.getElementById('signup-btn')?.addEventListener('click', () => {
            this.signupWithEmail();
        });
        
        // Google
        document.getElementById('google-login-btn')?.addEventListener('click', () => {
            this.loginWithGoogle();
        });
        
        // Reset senha
        document.getElementById('reset-btn')?.addEventListener('click', () => {
            this.resetPassword();
        });
        
        // Logout
        ['logout-btn-lobby', 'logout-btn-config', 'logout-btn-game'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', () => {
                this.logout();
            });
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
            this.showError(Utils.getAuthErrorMessage(error.code));
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
            this.showError(Utils.getAuthErrorMessage(error.code));
        }
    }
    
    async loginWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await firebase.auth().signInWithPopup(provider);
        } catch (error) {
            this.showError(Utils.getAuthErrorMessage(error.code));
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
            Utils.notify('📧 Email de recuperação enviado!', 'success');
        } catch (error) {
            this.showError(Utils.getAuthErrorMessage(error.code));
        }
    }
    
    logout() {
        if (confirm('🚪 Deseja realmente sair do PATROL?')) {
            firebase.auth().signOut();
        }
    }
    
    showScreen(screenId) {
        Utils.hideAllScreens();
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
        }
    }
    
    showError(message) {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => errorDiv.style.display = 'none', 5000);
        }
    }
}

// Inicializar
let authSystem;
document.addEventListener('firebaseReady', () => {
    authSystem = new AuthSystem();
    window.authSystem = authSystem;
});

console.log('✅ Auth carregado');