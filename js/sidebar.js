// ============================================
// BotCarga - Sidebar Principal
// ============================================

const BotCargaSidebar = {
  isOpen: true,

  init() {
    this.injectSidebar();
    this.injectToggleButton();
    this.setupTabs();
    this.loadColaboradorAtivo();
    document.body.classList.add('botcarga-ready');
  },

  injectSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'botcarga-sidebar';
    sidebar.innerHTML = `
      <div class="bc-header">
        <div class="bc-header-title">
          <div class="bc-logo-icon">\uD83D\uDE9A</div>
          <div>
            <h2>BOTCARGA</h2>
            <div class="bc-header-subtitle">Negocie fretes com agilidade</div>
          </div>
        </div>
        <div id="bc-colab-selector" style="position:relative;">
          <button id="bc-colab-btn" style="
            background:rgba(255,255,255,0.2); border:none; border-radius:8px; padding:6px 10px;
            color:white; font-size:11px; font-weight:600; cursor:pointer; font-family:inherit;
            display:flex; align-items:center; gap:4px; white-space:nowrap;
          ">
            <span id="bc-colab-nome">\uD83D\uDC64 Entrar</span>
            <span style="font-size:8px;">\u25BC</span>
          </button>
          <div id="bc-colab-dropdown" style="
            display:none; position:absolute; top:100%; right:0; margin-top:4px;
            background:white; border-radius:10px; box-shadow:0 4px 20px rgba(0,0,0,0.15);
            min-width:200px; z-index:10003; overflow:hidden;
          "></div>
        </div>
      </div>

      <div class="bc-tabs">
        <button class="bc-tab active" data-tab="dashboard">
          <span class="bc-tab-icon">\uD83D\uDCCA</span>
          Dash
        </button>
        <button class="bc-tab" data-tab="motoristas">
          <span class="bc-tab-icon">\uD83D\uDC64</span>
          Motor.
        </button>
        <button class="bc-tab" data-tab="cargas">
          <span class="bc-tab-icon">\uD83D\uDCE6</span>
          Cargas
        </button>
        <button class="bc-tab" data-tab="kanban">
          <span class="bc-tab-icon">\uD83D\uDCCB</span>
          Kanban
        </button>
        <button class="bc-tab" data-tab="disparos">
          <span class="bc-tab-icon">\uD83D\uDCE2</span>
          Disparos
        </button>
      </div>

      <div class="bc-content">
        <div class="bc-panel active" id="bc-panel-dashboard"></div>
        <div class="bc-panel" id="bc-panel-motoristas"></div>
        <div class="bc-panel" id="bc-panel-cargas"></div>
        <div class="bc-panel" id="bc-panel-kanban"></div>
        <div class="bc-panel" id="bc-panel-disparos"></div>
      </div>
    `;
    document.body.appendChild(sidebar);

    // Impede que o WhatsApp Web intercepte eventos dentro da sidebar
    // Estrategia dupla:
    // 1) BUBBLE phase (false) - para listeners do WhatsApp em body/document que usam bubble
    // 2) CAPTURE phase no DOCUMENT - intercepta antes do WhatsApp e para se o alvo esta na sidebar
    const eventsToBlock = ['mousedown', 'mouseup', 'click', 'touchstart', 'touchend',
     'focus', 'input', 'change', 'keydown', 'keyup', 'keypress',
     'pointerdown', 'pointerup'];

    // Bubble phase: para propagacao apos o evento borbulhar pela sidebar
    eventsToBlock.forEach(evt => {
      sidebar.addEventListener(evt, (e) => e.stopPropagation(), false);
    });

    // Capture phase no document: intercepta ANTES do WhatsApp e bloqueia se o alvo esta na sidebar
    // Isso impede que listeners capture do WhatsApp (React) processem cliques da sidebar
    eventsToBlock.forEach(evt => {
      document.addEventListener(evt, (e) => {
        if (e.target && (e.target.closest('#botcarga-sidebar') || e.target.closest('#botcarga-toggle'))) {
          e.stopPropagation();
        }
      }, true);
    });
  },

  injectToggleButton() {
    const btn = document.createElement('button');
    btn.id = 'botcarga-toggle';
    btn.innerHTML = '\u25B6';
    btn.title = 'Abrir/Fechar BotCarga';
    btn.addEventListener('click', () => this.toggle());
    document.body.appendChild(btn);
  },

  toggle() {
    this.isOpen = !this.isOpen;
    const sidebar = document.getElementById('botcarga-sidebar');
    const toggle = document.getElementById('botcarga-toggle');

    if (this.isOpen) {
      sidebar.classList.remove('collapsed');
      toggle.classList.remove('collapsed');
      toggle.innerHTML = '\u25B6';
      document.body.classList.add('botcarga-ready');
    } else {
      sidebar.classList.add('collapsed');
      toggle.classList.add('collapsed');
      toggle.innerHTML = '\u25C0';
      document.body.classList.remove('botcarga-ready');
    }
  },

  setupTabs() {
    const tabs = document.querySelectorAll('.bc-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('.bc-panel').forEach(p => p.classList.remove('active'));
        const panelId = `bc-panel-${tab.dataset.tab}`;
        document.getElementById(panelId).classList.add('active');
      });
    });
  },

  // ========== COLABORADOR ATIVO ==========
  loadColaboradorAtivo() {
    BotCargaStorage.getColaboradorAtivo((ativoId) => {
      if (ativoId) {
        BotCargaStorage.getColaboradores((colabs) => {
          const col = colabs.find(c => c.id === ativoId);
          if (col) {
            document.getElementById('bc-colab-nome').textContent = '\uD83D\uDFE2 ' + col.nome.split(' ')[0];
          }
        });
      }
    });

    // Toggle dropdown
    document.getElementById('bc-colab-btn').addEventListener('click', () => this.toggleColabDropdown());

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#bc-colab-selector')) {
        document.getElementById('bc-colab-dropdown').style.display = 'none';
      }
    });
  },

  toggleColabDropdown() {
    const dropdown = document.getElementById('bc-colab-dropdown');
    if (dropdown.style.display === 'none') {
      this.renderColabDropdown();
      dropdown.style.display = 'block';
    } else {
      dropdown.style.display = 'none';
    }
  },

  renderColabDropdown() {
    BotCargaStorage.getColaboradorAtivo((ativoId) => {
      BotCargaStorage.getColaboradores((colabs) => {
        const dropdown = document.getElementById('bc-colab-dropdown');

        let html = `<div style="padding:10px 12px; border-bottom:1px solid #e5e7eb; font-size:11px; font-weight:700; color:#374151;">\uD83D\uDC65 Selecionar Colaborador</div>`;

        if (colabs.length === 0) {
          html += `<div style="padding:12px; text-align:center; font-size:12px; color:#9ca3af;">Nenhum cadastrado</div>`;
        } else {
          colabs.forEach(col => {
            const isAtivo = col.id === ativoId;
            html += `
              <div class="bc-colab-option" data-id="${col.id}" style="
                padding:8px 12px; cursor:pointer; display:flex; align-items:center; justify-content:space-between;
                border-bottom:1px solid #f0f2f5; transition:background 0.2s;
                ${isAtivo ? 'background:#ecfdf5;' : ''}
              ">
                <div>
                  <div style="font-size:12px; font-weight:600; color:#1a1a2e;">${isAtivo ? '\uD83D\uDFE2' : '\u26AA'} ${col.nome}</div>
                  <div style="font-size:10px; color:#6b7280;">${col.cargo || 'Operador'} | \uD83D\uDCF1 ${col.whatsapp || 'Sem WhatsApp'}</div>
                </div>
                ${isAtivo ? '<span style="font-size:10px; color:#059669; font-weight:600;">Ativo</span>' : ''}
              </div>
            `;
          });
        }

        html += `
          <div style="padding:8px 12px; border-top:1px solid #e5e7eb;">
            <button class="bc-btn bc-btn-sm bc-btn-primary" id="bc-colab-add-quick" style="width:100%; font-size:10px;">
              \u2795 Novo Colaborador
            </button>
          </div>
        `;

        dropdown.innerHTML = html;

        // Selecionar colaborador
        dropdown.querySelectorAll('.bc-colab-option').forEach(opt => {
          opt.addEventListener('click', () => {
            const id = opt.dataset.id;
            BotCargaStorage.setColaboradorAtivo(id, () => {
              const col = colabs.find(c => c.id === id);
              document.getElementById('bc-colab-nome').textContent = '\uD83D\uDFE2 ' + col.nome.split(' ')[0];
              dropdown.style.display = 'none';
              this.showToast('Operando como: ' + col.nome);
              // Recarrega abas que dependem do colaborador
              if (typeof BotCargaCargas !== 'undefined') BotCargaCargas.render();
              if (typeof BotCargaKanban !== 'undefined') BotCargaKanban.render();
              if (typeof BotCargaDashboard !== 'undefined') BotCargaDashboard.render();
            });
          });
        });

        // Botao add
        const addBtn = document.getElementById('bc-colab-add-quick');
        if (addBtn) {
          addBtn.addEventListener('click', () => {
            dropdown.style.display = 'none';
            // Vai para aba dashboard no modo colaborador
            if (typeof BotCargaDashboard !== 'undefined') {
              BotCargaDashboard.viewMode = 'colaborador';
              BotCargaDashboard.showFormColaborador();
            }
            // Ativa aba dashboard
            document.querySelectorAll('.bc-tab').forEach(t => t.classList.remove('active'));
            document.querySelector('[data-tab="dashboard"]').classList.add('active');
            document.querySelectorAll('.bc-panel').forEach(p => p.classList.remove('active'));
            document.getElementById('bc-panel-dashboard').classList.add('active');
          });
        }
      });
    });
  },

  // Retorna o ID do colaborador ativo (sync helper)
  getColabAtivoId() {
    return new Promise((resolve) => {
      BotCargaStorage.getColaboradorAtivo((id) => resolve(id));
    });
  },

  showToast(message) {
    const existing = document.querySelector('.bc-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'bc-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
};
