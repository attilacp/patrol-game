// js/script-loader/loader-core.js - Funções básicas de carregamento
console.log('📂 script-loader/loader-core.js carregando...');

class ScriptLoader {
    constructor() {
        this.loadedScripts = new Set();
        this.loadingQueue = [];
        this.isLoading = false;
    }
    
    async loadScript(src) {
        // Verificar se já foi carregado
        if (this.loadedScripts.has(src)) {
            console.log(`📦 Script já carregado anteriormente: ${src}`);
            return true;
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = false; // Manter ordem
            
            script.onload = () => {
                this.loadedScripts.add(src);
                console.log(`✅ Script carregado: ${src}`);
                resolve(true);
            };
            
            script.onerror = (error) => {
                console.error(`❌ Erro ao carregar script: ${src}`, error);
                this.recordError(src, error);
                reject(new Error(`Falha ao carregar: ${src}`));
            };
            
            document.head.appendChild(script);
        });
    }
    
    async loadScriptWithRetry(src, maxRetries = 2) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.loadScript(src);
            } catch (error) {
                if (attempt === maxRetries) {
                    console.error(`❌ Falha definitiva após ${maxRetries} tentativas: ${src}`);
                    throw error;
                }
                
                console.log(`🔄 Tentativa ${attempt + 1} para: ${src}`);
                await this.delay(1000 * attempt); // Backoff exponencial
            }
        }
    }
    
    async loadGroup(group) {
        console.log(`📦 --- Iniciando grupo: ${group.name} (${group.scripts.length} scripts) ---`);
        
        const results = {
            group: group.name,
            total: group.scripts.length,
            success: 0,
            failed: []
        };
        
        for (const scriptSrc of group.scripts) {
            try {
                // Usar retry apenas para scripts locais
                if (scriptSrc.startsWith('js/')) {
                    await this.loadScriptWithRetry(scriptSrc, 2);
                } else {
                    await this.loadScript(scriptSrc);
                }
                results.success++;
            } catch (error) {
                results.failed.push({
                    script: scriptSrc,
                    error: error.message
                });
                // Continuar mesmo com erro
                continue;
            }
        }
        
        console.log(`📦 Grupo ${group.name} concluído: ${results.success}/${results.total} sucesso`);
        
        if (results.failed.length > 0) {
            console.warn(`⚠️ ${results.failed.length} falhas no grupo ${group.name}:`, 
                results.failed.map(f => f.script));
        }
        
        return results;
    }
    
    async loadAllGroups(groups) {
        const allResults = {
            startedAt: Date.now(),
            groups: [],
            totalScripts: 0,
            totalSuccess: 0,
            totalFailed: 0
        };
        
        for (const group of groups) {
            const groupResult = await this.loadGroup(group);
            allResults.groups.push(groupResult);
            allResults.totalScripts += groupResult.total;
            allResults.totalSuccess += groupResult.success;
            allResults.totalFailed += groupResult.failed.length;
            
            // Disparar evento de progresso do grupo
            this.dispatchGroupProgress(allResults);
        }
        
        allResults.completedAt = Date.now();
        allResults.duration = allResults.completedAt - allResults.startedAt;
        
        console.log(`📦 Carregamento completo! ${allResults.totalSuccess}/${allResults.totalScripts} scripts carregados em ${allResults.duration}ms`);
        
        return allResults;
    }
    
    dispatchGroupProgress(results) {
        const totalProcessed = results.groups.reduce((sum, g) => sum + g.total, 0);
        const totalGroups = results.groups.length;
        
        document.dispatchEvent(new CustomEvent('scriptGroupProgress', {
            detail: {
                currentGroup: results.groups.length,
                totalGroups,
                processedScripts: totalProcessed,
                totalScripts: results.totalScripts,
                successRate: results.totalSuccess / results.totalScripts * 100
            }
        }));
    }
    
    recordError(src, error) {
        // Registrar erro para análise posterior
        if (!window.scriptErrors) window.scriptErrors = [];
        window.scriptErrors.push({
            src,
            error: error.toString(),
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        });
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    getLoadedCount() {
        return this.loadedScripts.size;
    }
    
    clearCache() {
        this.loadedScripts.clear();
        console.log('🧹 Cache de scripts limpo');
    }
}

// Exportar
window.ScriptLoader = ScriptLoader;

console.log('✅ script-loader/loader-core.js carregado');