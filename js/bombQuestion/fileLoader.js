class BombFileLoader{
    constructor(a){this.bombSystem=a}
    loadBombQuestions(a,b){
        if(!this.bombSystem.bombQuestions)this.bombSystem.bombQuestions={};
        this.bombSystem.loadError=null;
        try{
            a.SheetNames.forEach(c=>{
                const d=a.Sheets[c],e=XLSX.utils.sheet_to_json(d,{header:1});
                if(e.length>2){
                    const f=e[1]&&e[1][0]?e[1][0].toString().trim():c,
                          g=e[1]&&e[1][1]?this.formatPerc(e[1][1]):"N/A";
                    console.log(`📄 ${c}: "${f}", ${g}`);
                    const h=this.extractMultipleTables(e,c,f,g);
                    if(!this.bombSystem.bombQuestions[c])this.bombSystem.bombQuestions[c]={
                        name:c,
                        assunto:f,
                        porcentagem:g,
                        questions:[],
                        fileName:b,
                        totalTables:h.length
                    };
                    this.bombSystem.bombQuestions[c].questions.push(...h);
                    console.log(`📦 ${c}: Extraídas ${h.length} tabelas`)
                }
            });
            console.log(`✅ ${Object.keys(this.bombSystem.bombQuestions).length} assuntos carregados`);
            this.debugLoadedTables()
        }catch(a){this.bombSystem.loadError=`Erro: ${a.message}`;console.error("Erro:",a)}
    }
    formatPerc(a){
        try{
            if(!a)return"N/A";
            const b=a.toString().trim();
            if(b.includes("%"))return b;
            const c=parseFloat(b.replace(",","."));
            return isNaN(c)?b:c<=1?(c*100).toFixed(1)+"%":c.toFixed(1)+"%"
        }catch{return"N/A"}
    }
    extractMultipleTables(a,b,c,d){
        const e=[],f=[];
        let k=!1,l=-1,m=0;
        console.log(`🔍 Analisando ${b}: ${a.length} linhas totais`);
        for(let n=0;n<a.length;n++){
            const o=a[n];
            if(o&&o[0]&&o[1]&&o[0].toString().trim().toUpperCase()==="PERGUNTAS"&&o[1].toString().trim().toUpperCase()==="RESPOSTAS"){
                console.log(`📋 Encontrado cabeçalho de tabela na linha ${n+1}`);
                if(k&&f.length>0){
                    const a=this.processTable(f,b,c,d,m,l);
                    a&&a.length>0&&e.push(...a);
                    f.length=0;
                    m++
                }
                k=!0;
                l=n+1;
                continue
            }
            if(k&&o&&o[0]&&o[1]&&o[0].toString().trim()&&o[1].toString().trim()){
                const a=o[0].toString().trim(),e=o[1].toString().trim();
                if(a.toUpperCase()!=="PERGUNTAS"&&e.toUpperCase()!=="RESPOSTAS"&&!a.match(/^[-\s]*$/)&&!e.match(/^[-\s]*$/))f.push([a,e])
            }else if(k&&(!o||!o[0]||!o[1]||!o[0].toString().trim()&&!o[1].toString().trim())){
                if(f.length>0){
                    const a=this.processTable(f,b,c,d,m,l);
                    a&&a.length>0&&e.push(...a);
                    f.length=0;
                    m++;
                    console.log(`📊 Tabela ${m} finalizada com ${f.length} pares`)
                }
                k=!1
            }
        }
        if(k&&f.length>0){
            const a=this.processTable(f,b,c,d,m,l);
            a&&a.length>0&&e.push(...a);
            console.log(`📊 Última tabela finalizada com ${f.length} pares`)
        }
        console.log(`✅ Total de ${e.length} tabelas extraídas de ${b}`);
        return e
    }
    processTable(a,b,c,d,e,f){
        if(!a||0===a.length)return console.warn(`⚠️ Tabela ${e} vazia em ${b}`),[];
        console.log(`🔢 Tabela ${e}: ${a.length} pares disponíveis`);
        if(a.length<2)return console.warn(`⚠️ Tabela ${e} tem apenas ${a.length} par(es) - ignorando`),[];
        const items=a.map((item,index)=>({
            pergunta:item[0].trim(),
            resposta:item[1].trim(),
            originalIndex:index,
            pairId:`${item[0].trim().substring(0,20)}_${item[1].trim().substring(0,20)}_${index}_${e}`
        }));
        let duplicateCount={};
        items.forEach(item=>{
            duplicateCount[item.resposta]=(duplicateCount[item.resposta]||0)+1
        });
        const duplicates=Object.entries(duplicateCount).filter(([resposta,count])=>count>1),
              id=`${b}_table${e}_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
              tableData={
                assunto:c,
                porcentagem:d,
                items:items,
                totalPairs:items.length,
                originalTableSize:a.length,
                sheetName:b,
                tableNumber:e,
                tableStartIndex:f,
                id:id,
                hasDuplicateAnswers:duplicates.length>0,
                isCompleteTable:items.length===a.length
              };
        console.log(`📦 Criada questão da tabela ${e}: ${items.length} pares (todos disponíveis)`);
        return[tableData]
    }
    debugLoadedTables(){
        console.log("=== DEBUG DE TABELAS CARREGADAS ===");
        Object.values(this.bombSystem.bombQuestions).forEach((a,b)=>{
            console.log(`📚 ${b+1}: ${a.name} - ${a.totalTables||a.questions.length} tabelas`);
            a.questions.forEach((a,c)=>{
                console.log(`   Tabela ${c+1}: ${a.items.length} pares (original: ${a.originalTableSize||a.items.length})`);
                console.log(`        ID: ${a.id}`);
                console.log(`        Sheet: ${a.sheetName}, Tabela nº: ${a.tableNumber}`);
                a.hasDuplicateAnswers&&console.log("        ⚠️ Tem respostas duplicadas")
            })
        });
        const a=Object.values(this.bombSystem.bombQuestions).reduce((a,b)=>a+b.questions.length,0);
        console.log(`📈 Total: ${a} tabelas disponíveis`);
        console.log("=== FIM DEBUG ===")
    }
}
if(typeof window!=="undefined")window.BombFileLoader=BombFileLoader;