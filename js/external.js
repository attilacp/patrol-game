// js/external.js - Verificação simples
console.log('📚 Verificando bibliotecas externas...');

if (typeof XLSX === 'undefined') {
    console.error('❌ XLSX não carregada');
} else {
    console.log('✅ XLSX carregada com sucesso');
}