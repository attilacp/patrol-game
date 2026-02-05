// js/turn-system/turn-notifications.js - SISTEMA DE NOTIFICAÇÕES
console.log('🔄 turn-system/turn-notifications.js carregando...');

TurnSystem.prototype.showNotification = function(message, type = 'info') {
    console.log('🔔 Notificação:', message);
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#007bff'};
        color: ${type === 'warning' ? '#000' : 'white'}; padding: 15px 20px; border-radius: 5px;
        z-index: 9999; box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease; border: 2px solid ${type === 'warning' ? '#ff9800' : 'transparent'};
        max-width: 300px; word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
};

console.log('✅ turn-system/turn-notifications.js carregado');