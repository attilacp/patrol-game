// js/script-loader/verification.js - Verificação de scripts essenciais
console.log('🔍 script-loader/verification.js carregando...');

class ScriptVerifier {
    constructor() {
        this.essentialScripts = this.getEssentialScriptsList();
        this.verificationResults = {};
    }
    
    getEssentialScriptsList() {
        return [
            {
                name: 'firebase',
                check: () => typeof firebase !== 'undefined',
                message: 'Firebase SDK',
                critical: true
            },
            {
                name: 'auth',
                check: () => window.auth && typeof window.auth === 'object',
                message: 'Sistema de autenticação',
                critical: true
            },
            {
                name: 'database',
                check: () => window.db && typeof window.db === 'object',
                message: 'Banco de dados Firebase',
                critical: true
            },
            {
                name: 'roomSystem',
                check: () => window.roomSystem && typeof window.roomSystem === 'object',
                message: 'Sistema de salas',
                critical: true
            },
            {
                name: 'teams',
                check: () => typeof window.updateTeamsDisplay === 'function',
                message: 'Sistema de equipes',
                critical: true
            },
            {
                name: 'questions',
                check: () => Array.isArray(window.questions),
                message: 'Array de perguntas',
                critical: false
            },
            {
                name: 'showQuestion',
                check: () => typeof window.showQuestion === 'function',
                message: 'Função de exibir pergunta',
                critical: true
            },
            {
                name: 'checkAnswer',
                check: () => typeof window.checkAnswer === 'function',
                message: 'Função de verificar resposta',
                critical: true
            },
            {
                name: 'checkStartGame',
                check: () => typeof window.checkStartGame === 'function',
                message: 'Verificação de início de jogo',
                critical: false
            }
        ];
    }
    
    verifyAll() {
        console.log('🔍 Verificando scripts essenciais...');
        
        this.verificationResults = {
            timestamp: Date.now(),
            total: this.essentialScripts.length,
            passed: 0,
            failed: [],
            criticalFailures: 0
        };
        
        this.essentialScripts.forEach(script => {
            const result = this.verifyScript(script);
            
            if (result.passed) {
                this.verificationResults.passed++;
            } else {
                this.verificationResults.failed.push(result);
                if (script.critical) {
                    this.verificationResults.criticalFailures++;
                }
            }
        });
        
        this.logVerificationResults();
        return this.verificationResults;
    }
    
    verifyScript(script) {
        const result = {
            name: script.name,
            message: script.message,
            critical: script.critical,
            passed: false,
            error: null
        };
        
        try {
            result.passed = script.check();
            if (!result.passed) {
                result.error = `${script.message} não disponível`;
            }
        } catch (error) {
            result.passed = false;
            result.error = `Erro na verificação: ${error.message}`;
        }
        
        const statusIcon = result.passed ? '✅' : result.critical ? '❌' : '⚠️';
        console.log(`${statusIcon} ${script.message}: ${result.passed ? 'OK' : result.error}`);
        
        return result;
    }
    
    logVerificationResults() {
        const { total, passed, failed, criticalFailures } = this.verificationResults;
        const successRate = Math.round((passed / total) * 100);
        
        console.log(`🔍 Resultado da verificação: ${passed}/${total} (${successRate}%)`);
        
        if (failed.length > 0) {
            console.group('📋 Scripts com problemas:');
            failed.forEach(f => {
                console.log(`${f.critical ? '❌ CRÍTICO' : '⚠️'} ${f.message}: ${f.error}`);
            });
            console.groupEnd();
        }
        
        if (criticalFailures > 0) {
            console.error(`🚨 ${criticalFailures} falhas críticas detectadas!`);
            this.dispatchCriticalFailureEvent();
        }
    }
    
    dispatchCriticalFailureEvent() {
        document.dispatchEvent(new CustomEvent('criticalScriptsMissing', {
            detail: {
                failed: this.verificationResults.failed.filter(f => f.critical),
                totalCritical: this.essentialScripts.filter(s => s.critical).length
            }
        }));
    }
    
    getMissingScripts() {
        return this.verificationResults.failed.map(f => ({
            name: f.name,
            message: f.message,
            critical: f.critical
        }));
    }
    
    isAppFunctional() {
        return this.verificationResults.criticalFailures === 0;
    }
    
    generateReport() {
        return {
            ...this.verificationResults,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            appFunctional: this.isAppFunctional(),
            suggestions: this.generateSuggestions()
        };
    }
    
    generateSuggestions() {
        const suggestions = [];
        
        if (!window.firebase) {
            suggestions.push('Recarregar a página (F5) para tentar carregar Firebase novamente');
        }
        
        if (!window.roomSystem) {
            suggestions.push('Verificar conexão com a internet e recarregar');
        }
        
        if (!window.questions) {
            suggestions.push('Carregar arquivo de perguntas na tela de configuração');
        }
        
        return suggestions;
    }
}

// Exportar
window.ScriptVerifier = ScriptVerifier;

console.log('✅ script-loader/verification.js carregado');