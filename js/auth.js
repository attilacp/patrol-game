// js/auth.js - VERSÃO COM PRIORIDADE MÁXIMA
console.log('🔐 auth.js CARREGADO - PRIORIDADE MÁXIMA');

// NÃO esperar DOMContentLoaded - executar IMEDIATAMENTE
(function() {
  console.log('🚀 Iniciando auth IMEDIATAMENTE');
  
  // Verificar se Firebase está pronto
  if (!window.firebase) {
    console.error('❌ Firebase não carregado ainda');
    setTimeout(() => window.location.reload(), 1000);
    return;
  }
  
  // Função principal
  function initializeAuth() {
    console.log('🔐 Configurando sistema de autenticação...');
    
    // 1. Configurar botões
    setupButtons();
    
    // 2. Observar estado de login
    firebase.auth().onAuthStateChanged(handleAuthStateChange);
    
    // 3. Forçar mostrar login primeiro
    setTimeout(() => {
      const user = firebase.auth().currentUser;
      if (!user) {
        showLoginScreen();
      } else {
        showGameScreen();
      }
    }, 100);
  }
  
  function handleAuthStateChange(user) {
    console.log('👤 Estado auth:', user ? user.email : 'Nenhum usuário');
    
    if (user) {
      showGameScreen();
    } else {
      showLoginScreen();
    }
  }
  
  function showLoginScreen() {
    console.log('📱 FORÇANDO tela de login...');
    
    // Esconder todas as telas
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
      screen.classList.remove('active');
    });
    
    // Mostrar login
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
      loginScreen.classList.add('active');
      console.log('✅ Tela de login ativada');
    } else {
      console.error('❌ Elemento #login-screen não encontrado!');
    }
    
    // Esconder logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
  
  function showGameScreen() {
    console.log('🎮 Mostrando jogo...');
    
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
      screen.classList.remove('active');
    });
    
    const configScreen = document.getElementById('config-screen');
    if (configScreen) {
      configScreen.classList.add('active');
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.style.display = 'block';
  }
  
  function setupButtons() {
    console.log('🔧 Configurando botões...');
    
    // Login
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.onclick = function() {
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;
        
        if (email && password) {
          firebase.auth().signInWithEmailAndPassword(email, password)
            .catch(error => alert('Erro: ' + error.message));
        } else {
          alert('Digite email e senha');
        }
      };
    }
    
    // Criar conta
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
      signupBtn.onclick = function() {
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;
        
        if (email && password) {
          if (password.length < 6) {
            alert('Senha precisa 6+ caracteres');
            return;
          }
          firebase.auth().createUserWithEmailAndPassword(email, password)
            .catch(error => alert('Erro: ' + error.message));
        } else {
          alert('Digite email e senha');
        }
      };
    }
    
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = function() {
        firebase.auth().signOut();
      };
    }
    
    // Google
    const googleBtn = document.getElementById('google-login-btn');
    if (googleBtn) {
      googleBtn.onclick = function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
          .catch(error => alert('Erro Google: ' + error.message));
      };
    }
  }
  
  // Executar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
  } else {
    initializeAuth();
  }
})();