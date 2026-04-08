// ============================================
// BotCarga - Modulo Kanban Visual
// ============================================

const BotCargaKanban = {
  filtroVista: 'minhas', // 'minhas' ou 'todas'
  colunas: [
    { id: 'aberta', label: 'Abertas', emoji: '\uD83D\uDFE1', cor: '#fef3c7', corTexto: '#92400e' },
    { id: 'coleta', label: 'Em Coleta', emoji: '\uD83D\uDD35', cor: '#dbeafe', corTexto: '#1e40af' },
    { id: 'viagem', label: 'Em Viagem', emoji: '\uD83D\uDFE2', cor: '#d1fae5', corTexto: '#065f46' },
    { id: 'finalizada', label: 'Finalizadas', emoji: '\u26AA', cor: '#e5e7eb', corTexto: '#374151' }
  ],

  init() {
    this.render();
  },

  render() {
    const panel = document.getElementById('bc-panel-kanban');
    if (!panel) return;

    panel.innerHTML = `
      <div style="font-size:14px; font-weight:700; color:#1a1a2e; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
        \uD83D\uDCCB Pipeline de Cargas
        <button class="bc-btn bc-btn-sm" id="bc-kanban-refresh" style="background:#e5e7eb; color:#374151; margin-left:auto;">
          \uD83D\uDD04 Atualizar
        </button>
      </div>
      <!-- Toggle Minhas / Todas -->
      <div style="display:flex; gap:4px; margin-bottom:10px; background:white; border-radius:8px; padding:3px; border:1px solid #e5e7eb;">
        <button class="bc-kanban-vista ${this.filtroVista === 'minhas' ? 'active' : ''}" data-vista="minhas" style="
          flex:1; padding:6px; border:none; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; font-family:inherit;
          ${this.filtroVista === 'minhas' ? 'background:#2563eb; color:white;' : 'background:transparent; color:#6b7280;'}
        ">\uD83D\uDC64 Minhas</button>
        <button class="bc-kanban-vista ${this.filtroVista === 'todas' ? 'active' : ''}" data-vista="todas" style="
          flex:1; padding:6px; border:none; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; font-family:inherit;
          ${this.filtroVista === 'todas' ? 'background:#2563eb; color:white;' : 'background:transparent; color:#6b7280;'}
        ">\uD83C\uDFE2 Todas</button>
      </div>
      <div id="bc-kanban-stats" style="margin-bottom:12px;"></div>
      <div id="bc-kanban-board"></div>
    `;

    panel.querySelectorAll('.bc-kanban-vista').forEach(btn => {
      btn.addEventListener('click', () => {
        this.filtroVista = btn.dataset.vista;
        this.render();
      });
    });

    document.getElementById('bc-kanban-refresh').addEventListener('click', () => this.renderBoard());
    this.renderBoard();
  },

  renderBoard() {
    BotCargaStorage.getCargas((todasCargas) => {
      BotCargaStorage.getColaboradorAtivo((colabId) => {
      const cargas = (this.filtroVista === 'minhas' && colabId)
        ? todasCargas.filter(c => c.colaboradorId === colabId)
        : todasCargas;
      BotCargaStorage.getInteressados((todosInteressados) => {
      const contagemInt = {};
      todosInteressados.forEach(i => { contagemInt[i.cargaId] = (contagemInt[i.cargaId] || 0) + 1; });

      const statsContainer = document.getElementById('bc-kanban-stats');
      const board = document.getElementById('bc-kanban-board');
      if (!board) return;

      // Stats resumo
      const total = cargas.length;
      const abertas = cargas.filter(c => c.status === 'aberta').length;
      const emAndamento = cargas.filter(c => c.status === 'coleta' || c.status === 'viagem').length;
      const finalizadas = cargas.filter(c => c.status === 'finalizada').length;

      statsContainer.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:6px;">
          <div style="background:white; border:1px solid #e5e7eb; border-radius:10px; padding:10px; text-align:center;">
            <div style="font-size:20px; font-weight:800; color:#2563eb;">${total}</div>
            <div style="font-size:10px; color:#6b7280; font-weight:600;">Total</div>
          </div>
          <div style="background:#fef3c7; border:1px solid #fcd34d; border-radius:10px; padding:10px; text-align:center;">
            <div style="font-size:20px; font-weight:800; color:#92400e;">${abertas}</div>
            <div style="font-size:10px; color:#92400e; font-weight:600;">Abertas</div>
          </div>
          <div style="background:#dbeafe; border:1px solid #93c5fd; border-radius:10px; padding:10px; text-align:center;">
            <div style="font-size:20px; font-weight:800; color:#1e40af;">${emAndamento}</div>
            <div style="font-size:10px; color:#1e40af; font-weight:600;">Andamento</div>
          </div>
          <div style="background:#d1fae5; border:1px solid #6ee7b7; border-radius:10px; padding:10px; text-align:center;">
            <div style="font-size:20px; font-weight:800; color:#065f46;">${finalizadas}</div>
            <div style="font-size:10px; color:#065f46; font-weight:600;">Finalizadas</div>
          </div>
        </div>
      `;

      // Kanban columns
      let html = '';
      this.colunas.forEach(col => {
        const cargasCol = cargas.filter(c => c.status === col.id);

        html += `
          <div class="bc-section">
            <div class="bc-kanban-header">
              <div class="bc-kanban-title">
                ${col.emoji} ${col.label}
                <span class="bc-kanban-count">${cargasCol.length}</span>
              </div>
            </div>
        `;

        if (cargasCol.length === 0) {
          html += `
            <div style="background:${col.cor}; border-radius:10px; padding:16px; text-align:center; color:${col.corTexto}; font-size:12px; opacity:0.6; border:2px dashed ${col.corTexto}33;">
              Nenhuma carga
            </div>
          `;
        } else {
          cargasCol.forEach(c => {
            const qtdInt = contagemInt[c.id] || 0;
            html += `
              <div class="bc-card" style="border-left:4px solid ${col.corTexto}; margin-bottom:8px;">
                <div class="bc-card-header">
                  <div class="bc-card-name" style="font-size:13px;">
                    \uD83D\uDCCD ${this.escapeHtml(c.origem)} \u27A1 \uD83C\uDFC1 ${this.escapeHtml(c.destino)}
                  </div>
                  <span style="display:inline-flex; align-items:center; gap:3px; padding:2px 8px; border-radius:12px; font-size:10px; font-weight:600;
                    ${qtdInt > 0 ? 'background:#dcfce7; color:#16a34a;' : 'background:#f3f4f6; color:#9ca3af;'}
                  ">\uD83D\uDE4B ${qtdInt}</span>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:4px; margin:6px 0;">
                  ${c.tipoCarga ? `<span style="background:#f3f4f6; padding:2px 8px; border-radius:4px; font-size:10px; color:#374151;">\uD83D\uDCE6 ${this.escapeHtml(c.tipoCarga)}</span>` : ''}
                  ${c.peso ? `<span style="background:#f3f4f6; padding:2px 8px; border-radius:4px; font-size:10px; color:#374151;">\u2696\uFE0F ${this.escapeHtml(c.peso)} ton</span>` : ''}
                  ${c.veiculo ? `<span style="background:#f3f4f6; padding:2px 8px; border-radius:4px; font-size:10px; color:#374151;">\uD83D\uDE9A ${this.escapeHtml(c.veiculo)}</span>` : ''}
                </div>
                ${c.valor ? `<div style="font-size:16px; font-weight:800; color:#059669; margin:4px 0;">\uD83D\uDCB0 R$ ${this.escapeHtml(c.valor)}</div>` : ''}
                <div style="display:flex; gap:4px; margin-top:8px;">
                  ${col.id !== 'finalizada' ? `
                    <button class="bc-btn bc-btn-sm bc-btn-primary" data-action="kanban-avancar" data-id="${c.id}" style="flex:1;">
                      \u27A1 Avancar
                    </button>
                  ` : ''}
                  ${col.id !== 'aberta' ? `
                    <button class="bc-btn bc-btn-sm" data-action="kanban-voltar" data-id="${c.id}" style="flex:1; background:#e5e7eb; color:#374151;">
                      \u2B05 Voltar
                    </button>
                  ` : ''}
                  ${col.id === 'aberta' ? `
                    <button class="bc-btn bc-btn-sm bc-btn-success" data-action="kanban-enviar" data-id="${c.id}" style="flex:1;">
                      \uD83D\uDCAC Enviar
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          });
        }

        html += `</div>`;
      });

      board.innerHTML = html;

      // Event listeners - avancar status
      board.querySelectorAll('[data-action="kanban-avancar"]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.mudarStatus(btn.dataset.id, 1, cargas);
        });
      });

      // Event listeners - voltar status
      board.querySelectorAll('[data-action="kanban-voltar"]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.mudarStatus(btn.dataset.id, -1, cargas);
        });
      });

      // Event listeners - enviar no chat
      board.querySelectorAll('[data-action="kanban-enviar"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const carga = cargas.find(c => c.id === btn.dataset.id);
          if (carga) {
            BotCargaCargas.colarNoChat(carga);
          }
        });
      });
      }); // fecha getInteressados
      }); // fecha getColaboradorAtivo
    });
  },

  mudarStatus(cargaId, direcao, cargas) {
    const fluxo = ['aberta', 'coleta', 'viagem', 'finalizada'];
    const carga = cargas.find(c => c.id === cargaId);
    if (!carga) return;

    const indexAtual = fluxo.indexOf(carga.status);
    const novoIndex = indexAtual + direcao;

    if (novoIndex >= 0 && novoIndex < fluxo.length) {
      const novoStatus = fluxo[novoIndex];
      BotCargaStorage.updateCarga(cargaId, { status: novoStatus }, () => {
        const labels = { aberta: '\uD83D\uDFE1 Aberta', coleta: '\uD83D\uDD35 Em Coleta', viagem: '\uD83D\uDFE2 Em Viagem', finalizada: '\u26AA Finalizada' };
        BotCargaSidebar.showToast(`Status: ${labels[novoStatus]}`);
        this.renderBoard();
      });
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
