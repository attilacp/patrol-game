// js/auth.js - Sistema de Autenticação do Patrol Game
console.log('🔐 auth.js carregando...');

class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.init();
  }
  
  init() {
    console.log('🔐 Iniciando sistema de autenticação...');
    
    // Observar mudanças no estado de autenticação
    firebase.auth().onAuthStateChanged((user) => {
      console.log('🔄 Estado de autenticação mudou:', user ? user.email : 'Nenhum usuário');
      
      if (user) {
        console.log('✅ Usuário logado:', user.email);
        this.currentUser = user;
        this.showGameScreen();
        
        // Salvar no localStorage para persistência
        localStorage.setItem('patrol_user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }));
      } else {
        console.log('👋 Nenhum usuário logado');
        this.currentUser = null;
        localStorage.removeItem('patrol_user');
        this.showLoginScreen();
      }
    });
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    console.log('🔧 Configurando event listeners...');
    
    // Login com email/senha
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      console.log('✅ Botão de login encontrado');
      loginBtn.addEventListener('click', () => this.loginWithEmail());
    } else {
      console.error('❌ Botão de login NÃO encontrado!');
    }
    
    // Criar conta
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
      console.log('✅ Botão de criar conta encontrado');
      signupBtn.addEventListener('click', () => this.signupWithEmail());
    }
    
    // Login com Google
    const googleBtn = document.getElementById('google-login-btn');
    if (googleBtn) {
      console.log('✅ Botão Google encontrado');
      googleBtn.addEventListener('click', () => this.loginWithGoogle());
    }
    
    // Reset de senha
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      console.log('✅ Botão reset senha encontrado');
      resetBtn.addEventListener('click', () => this.resetPassword());
    }
    
    // Logout - IMPORTANTE: Configurar dinamicamente
    setTimeout(() => {
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        console.log('✅ Botão de logout encontrado');
        logoutBtn.addEventListener('click', () => this.logout());
      } else {
        console.error('❌ Botão de logout NÃO encontrado!');
      }
    }, 1000);
  }
  
  async loginWithEmail() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    console.log('🔐 Tentando login com:', email);
    
    if (!email || !password) {
      this.showError('Digite email e senha');
      return;
    }
    
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      console.log('✅ Login realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no login:', error);
      this.showError(this.getErrorMessage(error.code));
    }
  }
  
  async signupWithEmail() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    console.log('📝 Tentando criar conta:', email);
    
    if (!email || !password) {
      this.showError('Digite email e senha');
      return;
    }
    
    if (password.length < 6) {
      this.showError('Senha precisa ter pelo menos 6 caracteres');
      return;
    }
    
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      console.log('✅ Conta criada com sucesso');
      alert('🎉 Conta criada! Você já está logado.');
    } catch (error) {
      console.error('❌ Erro ao criar conta:', error);
      this.showError(this.getErrorMessage(error.code));
    }
  }
  
  async loginWithGoogle() {
    try {
      console.log('🔐 Tentando login com Google...');
      const provider = new firebase.auth.GoogleAuthProvider();
      await firebase.auth().signInWithPopup(provider);
      console.log('✅ Login com Google realizado');
    } catch (error) {
      console.error('❌ Erro no login Google:', error);
      this.showError('Erro ao entrar com Google');
    }
  }
  
  async resetPassword() {
    const email = document.getElementById('login-email').value;
    
    if (!email) {
      this.showError('Digite seu email para recuperar a senha');
      return;
    }
    
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      alert('📧 Email de recuperação enviado! Verifique sua caixa de entrada.');
      console.log('✅ Email de recuperação enviado para:', email);
    } catch (error) {
      console.error('❌ Erro ao resetar senha:', error);
      this.showError(this.getErrorMessage(error.code));
    }
  }
  
  logout() {
    console.log('🚪 Fazendo logout...');
    firebase.auth().signOut();
  }
  
  showLoginScreen() {
    console.log('📱 Mostrando tela de login...');
    
    // Esconder todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    
    // Mostrar tela de login
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
      loginScreen.classList.add('active');
    }
    
    // ESCONDER botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.style.display = 'none';
    }
    
    // Limpar campos (opcional)
    document.getElementById('login-password').value = '';
  }
  
  showGameScreen() {
    console.log('🎮 Mostrando tela do jogo...');
    
    // Esconder todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    
    // Mostrar tela de configuração
    const configScreen = document.getElementById('config-screen');
    if (configScreen) {
      configScreen.classList.add('active');
    }
    
    // MOSTRAR botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.style.display = 'block';
      console.log('✅ Botão de logout mostrado');
    } else {
      console.error('❌ Botão de logout NÃO encontrado para mostrar!');
    }
  }
  
  showError(message) {
    console.error('❌ Erro de autenticação:', message);
    
    const errorDiv = document.getElementById('login-error');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      
      // Esconder após 5 segundos
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    } else {
      alert('Erro: ' + message);
    }
  }
  
  getErrorMessage(errorCode) {
    const messages = {
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Conta desativada',
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Email já cadastrado',
      'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres)',
      'auth/network-request-failed': 'Erro de conexão com a internet',
      'auth/too-many-requests': 'Muitas tentativas. Tente mais tarde.',
      'auth/operation-not-allowed': 'Método de login não permitido'
    };
    
    return messages[errorCode] || 'Erro desconhecido: ' + errorCode;
  }
  
  getCurrentUser() {
    return this.currentUser;
  }
  
  getUserUID() {
    return this.currentUser ? this.currentUser.uid : null;
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM carregado, iniciando auth system...');
  
  // Verificar se já está logado (localStorage)
  const savedUser = localStorage.getItem('patrol_user');
  if (savedUser) {
    console.log('💾 Usuário salvo encontrado:', JSON.parse(savedUser).email);
  }
  
  // Inicializar sistema de autenticação
  window.authSystem = new AuthSystem();
  
  console.log('✅ Sistema de autenticação inicializado');
});

