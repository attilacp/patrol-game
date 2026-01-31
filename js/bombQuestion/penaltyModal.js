// bombQuestion/penaltyModal.js
class PenaltyModal {
    constructor(bombSystem) {
        this.bombSystem = bombSystem;
        this.modal = null;
        this.selectedTeam = null;
        this.penaltyAlreadyApplied = false; // NOVA FLAG
        this.init();
    }

    init() {
        const existing = document.getElementById('bomb-penalty-modal');
        if (existing) existing.remove();

        this.modal = document.createElement('div');
        this.modal.className = 'penalty-modal';
        this.modal.id = 'bomb-penalty-modal';
        this.modal.style.display = 'none';
        this.modal.innerHTML = `
            <div class="penalty-modal-content">
                <div class="penalty-title">🎉 PERGUNTA BOMBA ACERTADA!</div>
                <div class="penalty-instructions" id="bomb-penalty-instructions"></div>
                <div class="penalty-teams-list" id="bomb-penalty-teams-list"></div>
                <div class="penalty-buttons">
                    <button class="confirm-penalty-btn" id="bomb-confirm-penalty-btn" disabled>✅ Aplicar Penalidade (-1)</button>
                    <button class="cancel-penalty-btn" id="bomb-cancel-penalty-btn">❌ Cancelar</button>
                </div>
            </div>`;
        document.body.appendChild(this.modal);
        
        document.getElementById('bomb-confirm-penalty-btn').addEventListener('click', () => this.confirmPenalty());
        document.getElementById('bomb-cancel-penalty-btn').addEventListener('click', () => this.cancelPenalty());
        console.log('✅ Modal inicializado');
    }

    showPenaltyModal(penalizingTeam) {
        return new Promise((resolve) => {
            console.log('📋 Abrindo modal para:', penalizingTeam.name);
            this.bombSystem.penaltyResolve = resolve;
            this.selectedTeam = null;
            this.penaltyAlreadyApplied = false; // RESETAR FLAG

            const inst = document.getElementById('bomb-penalty-instructions');
            if (inst) inst.innerHTML = `<strong>${penalizingTeam.name}</strong> acertou a PB!<br><strong>Selecione qual equipe perderá 1 ponto:</strong>`;
            
            const list = document.getElementById('bomb-penalty-teams-list');
            if (list) {
                list.innerHTML = '';
                console.log('📊 Equipes:');
                window.teams.forEach(team => {
                    console.log(`- ${team.name} (${team.score})`);
                    if (team.name !== penalizingTeam.name) {
                        const opt = document.createElement('div');
                        opt.className = 'penalty-team-option';
                        opt.dataset.teamId = team.id;
                        opt.innerHTML = `<span class="penalty-team-name">${team.name} (${team.score})</span>`;
                        opt.addEventListener('click', () => {
                            console.log(`🎯 Selecionada: ${team.name}`);
                            document.querySelectorAll('.penalty-team-option').forEach(o => o.classList.remove('selected'));
                            opt.classList.add('selected');
                            this.selectedTeam = team;
                            document.getElementById('bomb-confirm-penalty-btn').disabled = false;
                        });
                        list.appendChild(opt);
                    }
                });
                if (!list.children.length) list.innerHTML = '<div style="color:#666;text-align:center">Sem equipes</div>';
            }
            
            document.getElementById('bomb-confirm-penalty-btn').disabled = true;
            this.modal.style.display = 'block';
            console.log('✅ Modal exibido');
        });
    }

    confirmPenalty() {
        if (this.penaltyAlreadyApplied) { // VERIFICAÇÃO
            console.log('⚠️ Penalidade já aplicada, ignorando...');
            this.modal.style.display = 'none';
            this.bombSystem.penaltyResolve(this.selectedTeam);
            this.cleanup();
            return;
        }
        
        console.log('✅ Confirmando:', this.selectedTeam?.name);
        if (this.selectedTeam) {
            console.log(`📉 Antes: ${this.selectedTeam.score}`);
            this.selectedTeam.score = Math.max(0, this.selectedTeam.score - 1);
            console.log(`📊 Depois: ${this.selectedTeam.score}`);
            console.log('🔍 Todas:');
            window.teams.forEach(t => console.log(`- ${t.name}: ${t.score}`));
            
            this.penaltyAlreadyApplied = true; // MARCA COMO APLICADA
            
            if (typeof window.updateTeamsDisplay === 'function') window.updateTeamsDisplay();
            this.modal.style.display = 'none';
            this.bombSystem.penaltyResolve(this.selectedTeam);
            this.cleanup();
        }
    }

    cancelPenalty() {
        console.log('❌ Cancelado');
        this.modal.style.display = 'none';
        this.bombSystem.penaltyResolve(null);
        this.cleanup();
    }

    cleanup() {
        this.bombSystem.penaltyResolve = null;
        this.selectedTeam = null;
        const btn = document.getElementById('bomb-confirm-penalty-btn');
        if (btn) btn.disabled = true;
    }
}

if (typeof window !== 'undefined') window.PenaltyModal = PenaltyModal;
console.log('✅ penaltyModal.js - COM PROTEÇÃO CONTRA DUPLA PENALIDADE');