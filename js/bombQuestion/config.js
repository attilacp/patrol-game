// file name: bombQuestion/config.js
class BombQuestionConfig{
    constructor(){
        this.enabled=!0,this.maxPairs=3,this.consecutiveToActivate=3,
        this.localKey="bomb-question-config",this.loadConfig(),
        "loading"===document.readyState?
            document.addEventListener("DOMContentLoaded",()=>this.init()):
            setTimeout(()=>this.init(),500)
    }
    init(){
        this.createUI(),this.setupEvents(),this.additionalUIModifications(),
        console.log("✅ Config PB - maxPairs:",this.maxPairs,"acertos:",this.consecutiveToActivate),
        setTimeout(()=>this.showLoadInfo(),1e3)
    }
    showLoadInfo(){
        if(window.bombQuestionSystem&&window.bombQuestionSystem.getLoadStatus){
            const a=window.bombQuestionSystem.getLoadStatus();
            a.loaded&&(console.log(`📊 Status PB: ${a.totalTables} tabelas carregadas, ${a.availableTables} disponíveis`),
            console.log(`📊 Média: ${a.averagePairsPerTable} pares por tabela (max=${this.maxPairs})`))
        }
    }
    loadConfig(){
        const a=localStorage.getItem(this.localKey);
        if(a)try{
            const b=JSON.parse(a);
            this.enabled=void 0!==b.enabled?b.enabled:!0,
            this.maxPairs=b.maxPairs||3,
            this.consecutiveToActivate=b.consecutiveToActivate||3,
            console.log("✅ Config PB carregada:",b)
        }catch(a){console.error("❌ Erro:",a)}
    }
    saveConfig(){
        const a={
            enabled:this.enabled,
            maxPairs:this.maxPairs,
            consecutiveToActivate:this.consecutiveToActivate,
            lastUpdated:new Date().toISOString()
        };
        localStorage.setItem(this.localKey,JSON.stringify(a)),
        console.log("💾 Config PB salva:",a),
        this.reloadBombQuestionsWithNewMaxPairs(),
        this.showLoadInfo()
    }
    reloadBombQuestionsWithNewMaxPairs(){
        if(!window.bombQuestionSystem||!window.bombQuestionSystem.bombQuestions)return;
        console.log(`🔄 Recarregando PBs com novo maxPairs=${this.maxPairs}`);
        Object.values(window.bombQuestionSystem.bombQuestions).forEach(a=>{
            a.questions.forEach(b=>{
                b.items.length>this.maxPairs&&(
                    b.items=b.items.slice(0,this.maxPairs),
                    b.selectedPairs=this.maxPairs,
                    b.maxPairsApplied=this.maxPairs,
                    b.id=`${b.sheetName}_limited_${Date.now()}_${this.maxPairs}`
                )
            })
        });
        console.log("✅ PBs atualizadas");
        if(window.bombQuestionSystem&&window.bombQuestionSystem.getLoadStatus){
            const status=window.bombQuestionSystem.getLoadStatus();
            console.log(`📊 Após atualização: ${status.totalTables} tabelas, média ${status.averagePairsPerTable} pares`)
        }
    }
    createUI(){
        if(document.getElementById("bomb-config-container"))return;
        const a=document.querySelector(".file-upload-container");
        if(!a)return setTimeout(()=>this.createUI(),300);
        let b="";
        if(window.bombQuestionSystem&&window.bombQuestionSystem.getLoadStatus){
            const a=window.bombQuestionSystem.getLoadStatus();
            a.loaded&&(b=`<div class="bomb-load-info">
                <div class="bomb-load-stat">
                    <span class="bomb-stat-label">📊 Tabelas:</span>
                    <span class="bomb-stat-value">${a.totalTables} carregadas</span>
                </div>
                <div class="bomb-load-stat">
                    <span class="bomb-stat-label">🎯 Disponíveis:</span>
                    <span class="bomb-stat-value">${a.availableTables} tabelas</span>
                </div>
                <div class="bomb-load-stat">
                    <span class="bomb-stat-label">📈 Média:</span>
                    <span class="bomb-stat-value">${a.averagePairsPerTable||0} pares/tabela</span>
                </div>
            </div>`)
        }
        const c=document.createElement("div");
        c.id="bomb-config-container",c.className="bomb-config-container",
        c.innerHTML=`<h3>PERGUNTA BOMBA</h3>${b}
            <div class="bomb-config-controls">
                <div class="bomb-checkbox-container">
                    <label class="bomb-checkbox-label">
                        <input type="checkbox" id="bomb-enabled" ${this.enabled?"checked":""}>
                        <span class="bomb-checkmark"></span>
                        Ativar Pergunta Bomba
                    </label>
                </div>
                <div class="bomb-settings-grid">
                    <div class="bomb-setting">
                        <label for="bomb-max-pairs">Máximo de Perguntas por Tabela:</label>
                        <div><input type="number" id="bomb-max-pairs" min="2" max="20" value="${this.maxPairs}"></div>
                        <div class="bomb-setting-description">Limita quantos pares de cada tabela serão usados</div>
                    </div>
                    <div class="bomb-setting">
                        <label for="bomb-consecutive-activate">Acertos Consecutivos:</label>
                        <div><input type="number" id="bomb-consecutive-activate" min="1" max="10" value="${this.consecutiveToActivate}"></div>
                        <div class="bomb-setting-description">Acertos necessários para ativar uma PB</div>
                    </div>
                </div>
            </div>`;
        const d=document.querySelector(".file-upload");
        d?d.parentNode.insertBefore(c,d.nextSibling):a.prepend(c),this.applyStyles()
    }
    additionalUIModifications(){
        setTimeout(()=>{
            const a=document.getElementById("show-ranking-btn"),
                  b=document.getElementById("open-notes-config");
            a&&b&&(a.style.cssText+="font-size: 20px !important; font-weight: 700 !important; padding: 18px 60px !important; min-width: 280px !important;",
            b.style.cssText+="font-size: 20px !important; font-weight: 700 !important; padding: 18px 60px !important; min-width: 280px !important;",
            console.log("✅ Botões com fonte igual configurados"))
        },1e3)
    }
    applyStyles(){
        if(document.getElementById("bomb-config-styles"))return;
        const a=document.createElement("style");
        a.id="bomb-config-styles",
        a.textContent=`.bomb-config-container{margin:25px 0;padding:25px;background:linear-gradient(145deg,#fff,#f8f9fa);border-radius:12px;border:3px solid #003366;box-shadow:0 6px 15px rgba(0,51,102,0.15)}.bomb-config-container h3{color:#003366;margin-bottom:20px;text-align:center;font-size:1.4em;font-weight:900;text-transform:uppercase;letter-spacing:2px;text-shadow:1px 1px 0 #FFCC00,2px 2px 0 rgba(255,204,0,0.3),0 0 8px rgba(0,51,102,0.3);position:relative;padding:10px 0}.bomb-config-container h3::before,.bomb-config-container h3::after{content:"";position:absolute;left:25%;right:25%;height:2px;background:linear-gradient(90deg,transparent,#003366,#fff,#003366,transparent);border-radius:1px}.bomb-config-container h3::before{top:0}.bomb-config-container h3::after{bottom:0}.bomb-load-info{display:flex;justify-content:space-around;margin-bottom:20px;padding:15px;background:#f8f9fa;border-radius:10px;border:1px solid #dee2e6;flex-wrap:wrap;gap:15px}.bomb-load-stat{display:flex;flex-direction:column;align-items:center;text-align:center}.bomb-stat-label{font-size:0.9em;color:#666;margin-bottom:4px}.bomb-stat-value{font-weight:bold;color:#003366;font-size:1.1em}.bomb-config-controls{display:flex;flex-direction:column;gap:25px}.bomb-checkbox-container{display:flex;justify-content:center;align-items:center}.bomb-checkbox-label{display:flex;align-items:center;cursor:pointer;font-weight:bold;color:#003366;font-size:1.1em;gap:12px;padding:12px 25px;background:#fff;border-radius:10px;border:2px solid #003366;transition:all .3s ease}.bomb-checkbox-label:hover{background:#f0f0f0;transform:translateY(-2px);box-shadow:0 4px 10px rgba(0,0,0,.1)}.bomb-checkbox-label input{width:22px;height:22px;cursor:pointer;accent-color:#dc3545}.bomb-settings-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:25px}.bomb-setting{text-align:center;padding:20px;background:#fff;border-radius:10px;border:2px solid #dee2e6;transition:all .3s ease}.bomb-setting:hover{border-color:#003366;box-shadow:0 4px 12px rgba(0,51,102,.1)}.bomb-setting label{display:block;margin-bottom:12px;font-weight:bold;color:#003366}.bomb-setting-description{font-size:0.85em;color:#666;margin-top:8px;font-style:italic}#bomb-max-pairs,#bomb-consecutive-activate{width:120px;height:42px;text-align:center;font-size:1.2em;font-weight:bold;border:2px solid #003366;border-radius:8px;background:#fff;color:#003366;padding:0 10px}#bomb-max-pairs:focus,#bomb-consecutive-activate:focus{outline:none;box-shadow:0 0 10px rgba(0,51,102,.3);border-color:#FFCC00}@media (max-width:768px){.bomb-settings-grid{grid-template-columns:1fr;gap:20px}.bomb-checkbox-label{font-size:1em;padding:10px 20px}.bomb-setting{padding:15px}#bomb-max-pairs,#bomb-consecutive-activate{width:100px;height:38px;font-size:1.1em}.bomb-load-info{flex-direction:column;align-items:center;gap:10px}}`,
        document.head.appendChild(a)
    }
    setupEvents(){
        setTimeout(()=>{
            const a=document.getElementById("bomb-enabled"),
                  b=document.getElementById("bomb-max-pairs"),
                  c=document.getElementById("bomb-consecutive-activate");
            a&&a.addEventListener("change",a=>{
                this.enabled=a.target.checked,
                this.saveConfig(),
                console.log(`💣 PB ${this.enabled?"ativada":"desativada"}`)
            }),
            b&&b.addEventListener("change",a=>{
                let b=parseInt(a.target.value);
                b<2&&(b=2),b>20&&(b=20),
                this.maxPairs=b,
                a.target.value=b,
                this.saveConfig()
            }),
            c&&c.addEventListener("change",a=>{
                let b=parseInt(a.target.value);
                b<1&&(b=1),b>10&&(b=10),
                this.consecutiveToActivate=b,
                a.target.value=b,
                this.saveConfig()
            })
        },800)
    }
    getConfig(){
        return{
            enabled:this.enabled,
            maxPairs:this.maxPairs,
            consecutiveToActivate:this.consecutiveToActivate
        }
    }
    filterQuestionsForDisplay(a){
        const b=this.maxPairs||3;
        return a.map(a=>a.items.length>b?{
            ...a,
            items:a.items.slice(0,b),
            selectedPairs:b,
            totalPairs:a.items.length,
            maxPairsApplied:b
        }:a)
    }
}
"undefined"==typeof window.bombQuestionConfig&&(window.bombQuestionConfig=new BombQuestionConfig);