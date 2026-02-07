// js/script-loader/main.js - Arquivo principal que integra tudo
console.log('🚀 script-loader/main.js carregando...');

class ScriptLoaderSystem {
    constructor() {
        this.loader = new ScriptLoader();
        this.progress = new ProgressManager();
        this.verifier = new ScriptVerifier();
        this.errorHandler = window.scriptErrorHandler || new ScriptErrorHandler();
        
        this.isInitialized = false;
        this.loadResults = null;
    }
    
    async initialize() {
        if (this.isInitialized) {
            console.warn('⚠️ Sistema já inicializado');
            return;
        }
        
        console.log('🚀 Inicializando sistema de carregamento de scripts...');
        
        try {
            // Mostrar progresso
            this.progress.show();
            
            // 1. Carregar configuração primeiro
            await this.loader.loadScript('js/script-loader/config.js');
            
            // 2. Carregar todos os grupos
            const groups = window.SORTED_SCRIPT_GROUPS || window.SCRIPT_GROUPS;
            this.loadResults = await this.loader.loadAllGroups(groups);
            
            // 3. Atualizar progresso final
            this.progress.updateProgress(
                this.loadResults.totalSuccess,
                this.loadResults.totalScripts,
                'Completo'
            );
            
            // 4. Verificar scripts essenciais
            const verification = this.verifier.verifyAll();
            
            // 5. Mostrar resumo
            this.showSummary(this.loadResults, verification);
            
            // 6. Esconder progresso
            setTimeout(() => this.progress.hide(), 1000);
            
            // 7. Disparar evento de conclusão
            this.dispatchCompletionEvent(this.loadResults, verification);
            
            this.isInitialized = true;
            console.log('✅ Sistema de carregamento inicializado com sucesso');
            
            return {
                success: true,
                loadResults: this.loadResults,
                verification,
                functional: verification.criticalFailures === 0
            };
            
        } catch (error) {
            console.error('❌ Erro na inicialização do sistema:', error);
            this.errorHandler.recordError({
                type: 'systemInit',
                message: 'Falha na inicialização do sistema de carregamento',
                error: error.toString(),
                timestamp: Date.now()
            });
            
            this.progress.hide();
            this.showErrorScreen(error);
            
            return {
                success: false,
                error: error.message,
                functional: false
            };
        }
    }
    
    showSummary(loadResults, verification) {
        const successRate = Math.round((loadResults.totalSuccess / loadResults.totalScripts) * 100);
        const verificationRate = Math.round((verification.passed / verification.total) * 100);
        
        console.group('📊 RESUMO DO CARREGAMENTO');
        console.log(`📦 Scripts: ${loadResults.totalSuccess}/${loadResults.totalScripts} (${successRate}%)`);
        console.log(`⏱️  Tempo: ${loadResults.duration}ms`);
        console.log(`🔍 Verificação: ${verification.passed}/${verification.total} (${verificationRate}%)`);
        console.log(`🚨 Erros críticos: ${verification.criticalFailures}`);
        console.groupEnd();
        
        // Mostrar mensagem de conclusão
        this.progress.showCompletionMessage(
            loadResults.totalSuccess,
            loadResults.totalScripts,
            loadResults.duration
        );
    }
    
    dispatchCompletionEvent(loadResults, verification) {
        document.dispatchEvent(new CustomEvent('scriptLoaderComplete', {
            detail: {
                loadResults,
                verification,
                timestamp: Date.now(),
                appFunctional: verification.criticalFailures === 0
            }
        }));
        
        // Evento específico para sucesso
        if (verification.criticalFailures === 0) {
            document.dispatchEvent(new Event('appReady'));
        }
    }
    
    showErrorScreen(error) {
        // Tela de erro simplificada
        const errorHtml = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 20px;
                z-index: 100000;
            ">
                <h1 style="font-size: 3em; margin-bottom: 20px;">⚠️</h1>
                <h2 style="margin-bottom: 10px;">Erro no Carregamento</h2>
                <p style="margin-bottom: 20px; max-width: 500px;">
                    Ocorreu um problema ao carregar o jogo PATROL.
                </p>
                <div style="
                    background: rgba(255,255,255,0.1);
                    padding: 15px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    max-width: 500px;
                    text-align: left;
                    font-family: monospace;
                    font-size: 12px;
                ">
                    ${error.toString()}
                </div>
                <button onclick="window.location.reload()" style="
                   