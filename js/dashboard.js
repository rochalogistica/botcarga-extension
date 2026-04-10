// ============================================
// BotCarga - Modulo Dashboard
// ============================================

const BotCargaDashboard = {
  viewMode: 'geral', // 'geral' ou 'colaborador'
  selectedColaborador: null,
  periodoFiltro: 'todos', // 'hoje', 'semana', 'mes', 'todos'

  init() {
    this.render();
  },

  render() {
    const panel = document.getElementById('bc-panel-dashboard');
    if (!panel) return;

    panel.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <div style="font-size:14px; font-weight:700; color:#1a1a2e; display:flex; align-items:center; gap:6px;">
          \uD83D\uDCCA Dashboard
        </div>
        <button class="bc-btn bc-btn-sm" id="bc-dash-refresh" style="background:#e5e7eb; color:#374151;">
          \uD83D\uDD04
        </button>
      </div>

      <!-- Toggle Geral / Individual -->
      <div style="display:flex; gap:4px; margin-bottom:12px; background:white; border-radius:10px; padding:4px; border:1px solid #e5e7eb;">
        <button class="bc-dash-toggle ${this.viewMode === 'geral' ? 'active' : ''}" data-view="geral" style="
          flex:1; padding:8px; border:none; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s;
          ${this.viewMode === 'geral' ? 'background:linear-gradient(135deg,#1a3a6b,#2563eb); color:white;' : 'background:transparent; color:#6b7280;'}
        ">\uD83C\uDFE2 Operacao Geral</button>
        <button class="bc-dash-toggle ${this.viewMode === 'colaborador' ? 'active' : ''}" data-view="colaborador" style="
          flex:1; padding:8px; border:none; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s;
          ${this.viewMode === 'colaborador' ? 'background:linear-gradient(135deg,#1a3a6b,#2563eb); color:white;' : 'background:transparent; color:#6b7280;'}
        ">\uD83D\uDC64 Por Colaborador</button>
      </div>

      <!-- Filtro periodo -->
      <div style="display:flex; gap:4px; margin-bottom:12px; flex-wrap:wrap;">
        ${['hoje', 'semana', 'mes', 'todos'].map(p => `
          <button class="bc-dash-periodo" data-periodo="${p}" style="
            padding:4px 10px; border-radius:6px; border:1px solid ${this.periodoFiltro === p ? '#2563eb' : '#d1d5db'};
            font-size:10px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s;
            ${this.periodoFiltro === p ? 'background:#2563eb; color:white;' : 'background:white; color:#6b7280;'}
          ">${p === 'hoje' ? 'Hoje' : p === 'semana' ? '7 dias' : p === 'mes' ? '30 dias' : 'Todos'}</button>
        `).join('')}
      </div>

      <div id="bc-dash-content"></div>
    `;

    // Event listeners
    document.getElementById('bc-dash-refresh').addEventListener('click', () => this.renderContent());

    panel.querySelectorAll('.bc-dash-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        this.viewMode = btn.dataset.view;
        this.render();
      });
    });

    panel.querySelectorAll('.bc-dash-periodo').forEach(btn => {
      btn.addEventListener('click', () => {
        this.periodoFiltro = btn.dataset.periodo;
        this.render();
      });
    });

    this.renderContent();
  },

  renderContent() {
    if (this.viewMode === 'geral') {
      this.renderDashGeral();
    } else {
      this.renderDashColaborador();
    }
  },

  // ========== DASHBOARD GERAL ==========
  renderDashGeral() {
    BotCargaStorage.getDashboardData((data) => {
      const container = document.getElementById('bc-dash-content');
      if (!container) return;

      const cargas = this.filtrarPorPeriodo(data.cargas);
      const motoristas = this.filtrarPorPeriodo(data.motoristas);
      const interessados = this.filtrarPorPeriodo(data.interessados);

      const abertas = cargas.filter(c => c.status === 'aberta').length;
      const coleta = cargas.filter(c => c.status === 'coleta').length;
      const viagem = cargas.filter(c => c.status === 'viagem').length;
      const finalizadas = cargas.filter(c => c.status === 'finalizada').length;
      const totalCargas = cargas.length;

      // Calcula valor total
      const valorTotal = cargas.reduce((acc, c) => {
        const val = parseFloat((c.valor || '0').replace(/\./g, '').replace(',', '.'));
        return acc + (isNaN(val) ? 0 : val);
      }, 0);
      const valorFinalizadas = cargas.filter(c => c.status === 'finalizada').reduce((acc, c) => {
        const val = parseFloat((c.valor || '0').replace(/\./g, '').replace(',', '.'));
        return acc + (isNaN(val) ? 0 : val);
      }, 0);

      // Taxa de conversao
      const taxaConversao = interessados.length > 0 ? Math.round((finalizadas / interessados.length) * 100) : 0;

      // Top rotas
      const rotasMap = {};
      cargas.forEach(c => {
        const rota = `${c.origem} \u27A1 ${c.destino}`;
        rotasMap[rota] = (rotasMap[rota] || 0) + 1;
      });
      const topRotas = Object.entries(rotasMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

      // Top veiculos
      const veiculosMap = {};
      motoristas.forEach(m => {
        if (m.veiculo) veiculosMap[m.veiculo] = (veiculosMap[m.veiculo] || 0) + 1;
      });
      const topVeiculos = Object.entries(veiculosMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

      // Etiquetas motoristas
      const etiquetasMap = {};
      motoristas.forEach(m => {
        const et = m.etiqueta || 'Sem etiqueta';
        etiquetasMap[et] = (etiquetasMap[et] || 0) + 1;
      });

      // Performance por colaborador
      const perfColabs = {};
      data.colaboradores.forEach(col => {
        perfColabs[col.id] = { nome: col.nome, cargas: 0, finalizadas: 0, valor: 0 };
      });
      cargas.forEach(c => {
        if (c.colaboradorId && perfColabs[c.colaboradorId]) {
          perfColabs[c.colaboradorId].cargas++;
          if (c.status === 'finalizada') {
            perfColabs[c.colaboradorId].finalizadas++;
            const val = parseFloat((c.valor || '0').replace(/\./g, '').replace(',', '.'));
            perfColabs[c.colaboradorId].valor += isNaN(val) ? 0 : val;
          }
        }
      });

      container.innerHTML = `
        <!-- KPIs Principais -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
          <div style="background:linear-gradient(135deg,#1a3a6b,#2563eb); border-radius:12px; padding:14px; color:white;">
            <div style="font-size:10px; opacity:0.8;">Valor Total em Cargas</div>
            <div style="font-size:22px; font-weight:800; margin-top:4px;">R$ ${this.formatarValor(valorTotal)}</div>
            <div style="font-size:10px; opacity:0.7; margin-top:2px;">${totalCargas} cargas no periodo</div>
          </div>
          <div style="background:linear-gradient(135deg,#059669,#10b981); border-radius:12px; padding:14px; color:white;">
            <div style="font-size:10px; opacity:0.8;">Faturamento (Finalizadas)</div>
            <div style="font-size:22px; font-weight:800; margin-top:4px;">R$ ${this.formatarValor(valorFinalizadas)}</div>
            <div style="font-size:10px; opacity:0.7; margin-top:2px;">${finalizadas} cargas finalizadas</div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-bottom:12px;">
          <div style="background:white; border:1px solid #e5e7eb; border-radius:10px; padding:10px; text-align:center;">
            <div style="font-size:22px; font-weight:800; color:#2563eb;">${totalCargas}</div>
            <div style="font-size:10px; color:#6b7280; font-weight:600;">\uD83D\uDCE6 Cargas</div>
          </div>
          <div style="background:white; border:1px solid #e5e7eb; border-radius:10px; padding:10px; text-align:center;">
            <div style="font-size:22px; font-weight:800; color:#7c3aed;">${motoristas.length}</div>
            <div style="font-size:10px; color:#6b7280; font-weight:600;">\uD83D\uDC64 Motoristas</div>
          </div>
          <div style="background:white; border:1px solid #e5e7eb; border-radius:10px; padding:10px; text-align:center;">
            <div style="font-size:22px; font-weight:800; color:#f59e0b;">${interessados.length}</div>
            <div style="font-size:10px; color:#6b7280; font-weight:600;">\uD83D\uDE4B Interessados</div>
          </div>
        </div>

        <!-- Pipeline Visual -->
        <div style="background:white; border:1px solid #e5e7eb; border-radius:12px; padding:12px; margin-bottom:12px;">
          <div style="font-size:12px; font-weight:700; color:#374151; margin-bottom:10px;">\uD83D\uDCCA Pipeline de Cargas</div>
          ${this.renderBarraStatus(abertas, coleta, viagem, finalizadas, totalCargas)}
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:4px; margin-top:8px;">
            <div style="text-align:center;">
              <div style="font-size:14px; font-weight:700; color:#92400e;">${abertas}</div>
              <div style="font-size:9px; color:#6b7280;">\uD83D\uDFE1 Abertas</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:14px; font-weight:700; color:#1e40af;">${coleta}</div>
              <div style="font-size:9px; color:#6b7280;">\uD83D\uDD35 Coleta</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:14px; font-weight:700; color:#065f46;">${viagem}</div>
              <div style="font-size:9px; color:#6b7280;">\uD83D\uDFE2 Viagem</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:14px; font-weight:700; color:#374151;">${finalizadas}</div>
              <div style="font-size:9px; color:#6b7280;">\u26AA Final.</div>
            </div>
          </div>
        </div>

        <!-- Taxa de Conversao -->
        <div style="background:white; border:1px solid #e5e7eb; border-radius:12px; padding:12px; margin-bottom:12px;">
          <div style="font-size:12px; font-weight:700; color:#374151; margin-bottom:8px;">\uD83C\uDFAF Conversao</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div style="text-align:center; padding:8px; background:#f8fafc; border-radius:8px;">
              <div style="font-size:24px; font-weight:800; color:${taxaConversao >= 30 ? '#059669' : taxaConversao >= 15 ? '#f59e0b' : '#ef4444'};">${taxaConversao}%</div>
              <div style="font-size:10px; color:#6b7280;">Interessado \u27A1 Fechado</div>
            </div>
            <div style="text-align:center; padding:8px; background:#f8fafc; border-radius:8px;">
              <div style="font-size:24px; font-weight:800; color:#2563eb;">${totalCargas > 0 ? Math.round((finalizadas / totalCargas) * 100) : 0}%</div>
              <div style="font-size:10px; color:#6b7280;">Cargas Fechadas</div>
            </div>
          </div>
        </div>

        <!-- Etiquetas dos Motoristas -->
        <div style="background:white; border:1px solid #e5e7eb; border-radius:12px; padding:12px; margin-bottom:12px;">
          <div style="font-size:12px; font-weight:700; color:#374151; margin-bottom:8px;">\uD83C\uDFF7\uFE0F Motoristas por Etiqueta</div>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${Object.entries(etiquetasMap).map(([et, qtd]) => {
              const cores = { Novo: '#fef3c7;color:#92400e', Negociando: '#dbeafe;color:#1e40af', Fechado: '#d1fae5;color:#065f46', VIP: '#fce7f3;color:#9d174d', Inativo: '#e5e7eb;color:#374151' };
              return `<span style="background:${cores[et] || '#f3f4f6;color:#374151'}; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:600;">${et}: ${qtd}</span>`;
            }).join('')}
          </div>
        </div>

        <!-- Top Rotas -->
        ${topRotas.length > 0 ? `
        <div style="background:white; border:1px solid #e5e7eb; border-radius:12px; padding:12px; margin-bottom:12px;">
          <div style="font-size:12px; font-weight:700; color:#374151; margin-bottom:8px;">\uD83D\uDDFA\uFE0F Top Rotas</div>
          ${topRotas.map(([rota, qtd], i) => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 0; ${i < topRotas.length - 1 ? 'border-bottom:1px solid #f0f2f5;' : ''}">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="background:${i === 0 ? '#fef3c7' : '#f3f4f6'}; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:#374151;">${i + 1}</span>
                <span style="font-size:11px; color:#374151;">${this.escapeHtml(rota)}</span>
              </div>
              <span style="background:#dbeafe; color:#1e40af; padding:2px 8px; border-radius:10px; font-size:10px; font-weight:600;">${qtd}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <!-- Top Veiculos -->
        ${topVeiculos.length > 0 ? `
        <div style="background:white; border:1px solid #e5e7eb; border-radius:12px; padding:12px; margin-bottom:12px;">
          <div style="font-size:12px; font-weight:700; color:#374151; margin-bottom:8px;">\uD83D\uDE9A Frota por Veiculo</div>
          ${topVeiculos.map(([veiculo, qtd]) => {
            const pct = motoristas.length > 0 ? Math.round((qtd / motoristas.length) * 100) : 0;
            return `
              <div style="margin-bottom:6px;">
                <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px;">
                  <span style="color:#374151; font-weight:600;">${this.escapeHtml(veiculo)}</span>
                  <span style="color:#6b7280;">${qtd} (${pct}%)</span>
                </div>
                <div style="background:#e5e7eb; border-radius:4px; height:6px;">
                  <div style="background:linear-gradient(90deg,#2563eb,#7c3aed); height:100%; border-radius:4px; width:${pct}%;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ` : ''}

        <!-- Ranking Colaboradores -->
        ${data.colaboradores.length > 0 ? `
        <div style="background:white; border:1px solid #e5e7eb; border-radius:12px; padding:12px; margin-bottom:12px;">
          <div style="font-size:12px; font-weight:700; color:#374151; margin-bottom:8px;">\uD83C\uDFC6 Ranking Colaboradores</div>
          ${Object.values(perfColabs).sort((a, b) => b.finalizadas - a.finalizadas).map((col, i) => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; ${i > 0 ? 'border-top:1px solid #f0f2f5;' : ''}">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:16px;">${i === 0 ? '\uD83E\uDD47' : i === 1 ? '\uD83E\uDD48' : i === 2 ? '\uD83E\uDD49' : '\uD83D\uDC64'}</span>
                <div>
                  <div style="font-size:12px; font-weight:600; color:#1a1a2e;">${this.escapeHtml(col.nome)}</div>
                  <div style="font-size:10px; color:#6b7280;">${col.cargas} cargas | ${col.finalizadas} fechadas</div>
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:13px; font-weight:700; color:#059669;">R$ ${this.formatarValor(col.valor)}</div>
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}
      `;
    });
  },

  // ========== DASHBOARD COLABORADOR ==========
  renderDashColaborador() {
    BotCargaStorage.getDashboardData((data) => {
      const container = document.getElementById('bc-dash-content');
      if (!container) return;

      if (data.colaboradores.length === 0) {
        container.innerHTML = `
          <div style="background:white; border:1px solid #e5e7eb; border-radius:12px; padding:20px; text-align:center;">
            <div style="font-size:40px; margin-bottom:8px;">\uD83D\uDC65</div>
            <div style="font-size:14px; font-weight:600; color:#374151; margin-bottom:4px;">Nenhum colaborador cadastrado</div>
            <div style="font-size:12px; color:#6b7280; margin-bottom:12px;">Cadastre sua equipe para acompanhar o desempenho individual</div>
            <button class="bc-btn bc-btn-primary bc-btn-sm" id="bc-dash-add-colab">\u2795 Cadastrar Colaborador</button>
          </div>
        `;
        document.getElementById('bc-dash-add-colab').addEventListener('click', () => this.showFormColaborador());
        return;
      }

      // Seletor de colaborador
      let html = `
        <div style="background:white; border:1px solid #e5e7eb; border-radius:12px; padding:12px; margin-bottom:12px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
            <div style="font-size:12px; font-weight:700; color:#374151;">\uD83D\uDC65 Equipe</div>
            <button class="bc-btn bc-btn-sm bc-btn-primary" id="bc-dash-add-colab2" style="font-size:10px; padding:3px 8px;">\u2795 Novo</button>
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;" id="bc-colab-lista">
      `;

      data.colaboradores.forEach(col => {
        const isSelected = this.selectedColaborador === col.id;
        html += `
          <button class="bc-colab-chip" data-colab-id="${col.id}" style="
            padding:6px 12px; border-radius:20px; border:2px solid ${isSelected ? '#2563eb' : '#e5e7eb'};
            font-size:11px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s;
            ${isSelected ? 'background:#2563eb; color:white;' : 'background:white; color:#374151;'}
          ">\uD83D\uDC64 ${this.escapeHtml(col.nome)}</button>
        `;
      });

      html += `</div></div>`;

      // Se nenhum selecionado
      if (!this.selectedColaborador) {
        html += `
          <div style="text-align:center; padding:30px; color:#9ca3af;">
            <div style="font-size:32px; margin-bottom:8px;">\u261D\uFE0F</div>
            <div style="font-size:13px;">Selecione um colaborador acima</div>
          </div>
        `;
        container.innerHTML = html;
        this.setupColabListeners(container, data);
        return;
      }

      // Dados do colaborador selecionado
      const col = data.colaboradores.find(c => c.id === this.selectedColaborador);
      if (!col) { container.innerHTML = html; this.setupColabListeners(container, data); return; }

      const cargasColab = this.filtrarPorPeriodo(data.cargas.filter(c => c.colaboradorId === col.id));
      // Motoristas e interessados sao compartilhados (nao tem colaboradorId), mostra todos no periodo
      const motoristasColab = this.filtrarPorPeriodo(data.motoristas);
      const interessadosColab = this.filtrarPorPeriodo(data.interessados);
      const historicoColab = data.historico.filter(h => h.colaboradorId === col.id);

      const finalizadasColab = cargasColab.filter(c => c.status === 'finalizada').length;
      const valorColab = cargasColab.filter(c => c.status === 'finalizada').reduce((acc, c) => {
        const val = parseFloat((c.valor || '0').replace(/\./g, '').replace(',', '.'));
        return acc + (isNaN(val) ? 0 : val);
      }, 0);

      // Disparos feitos
      const disparosColab = historicoColab.filter(h => h.tipo === 'disparo').length;

      html += `
        <!-- Header colaborador -->
        <div style="background:linear-gradient(135deg,#1a3a6b,#2563eb); border-radius:12px; padding:16px; color:white; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
            <div style="width:40px; height:40px; background:rgba(255,255,255,0.2); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px;">
              \uD83D\uDC64
            </div>
            <div>
              <div style="font-size:16px; font-weight:800;">${this.escapeHtml(col.nome)}</div>
              <div style="font-size:11px; opacity:0.8;">${col.cargo || 'Operador'} | \uD83D\uDCF1 ${col.whatsapp || 'Sem WhatsApp'}</div>
              <div style="font-size:10px; opacity:0.6;">Desde ${this.formatarDataCurta(col.criadoEm)}</div>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div style="background:rgba(255,255,255,0.15); border-radius:8px; padding:8px; text-align:center;">
              <div style="font-size:18px; font-weight:800;">R$ ${this.formatarValor(valorColab)}</div>
              <div style="font-size:9px; opacity:0.8;">Faturamento</div>
            </div>
            <div style="background:rgba(255,255,255,0.15); border-radius:8px; padding:8px; text-align:center;">
              <div style="font-size:18px; font-weight:800;">${finalizadasColab}</div>
              <div style="font-size:9px; opacity:0.8;">Cargas Fechadas</div>
            </div>
          </div>
        </div>

        <!-- KPIs individuais -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:6px; margin-bottom:12px;">
          <div style="background:white; border:1px solid #e5e7eb; border-radius:8px; padding:8px; text-align:center;">
            <div style="font-size:18px; font-weight:700; color:#2563eb;">${cargasColab.length}</div>
            <div style="font-size:9px; color:#6b7280;">\uD83D\uDCE6 Cargas</div>
          </div>
          <div style="background:white; border:1px solid #e5e7eb; border-radius:8px; padding:8px; text-align:center;">
            <div style="font-size:18px; font-weight:700; color:#7c3aed;">${motoristasColab.length}</div>
            <div style="font-size:9px; color:#6b7280;">\uD83D\uDC64 Motoristas</div>
          </div>
          <div style="background:white; border:1px solid #e5e7eb; border-radius:8px; padding:8px; text-align:center;">
            <div style="font-size:18px; font-weight:700; color:#f59e0b;">${interessadosColab.length}</div>
            <div style="font-size:9px; color:#6b7280;">\uD83D\uDE4B Interest.</div>
          </div>
          <div style="background:white; border:1px solid #e5e7eb; border-radius:8px; padding:8px; text-align:center;">
            <div style="font-size:18px; font-weight:700; color:#10b981;">${disparosColab}</div>
            <div style="font-size:9px; color:#6b7280;">\uD83D\uDCE2 Disparos</div>
          </div>
        </div>

        <!-- Pipeline individual -->
        <div style="background:white; border:1px solid #e5e7eb; border-radius:12px; padding:12px; margin-bottom:12px;">
          <div style="font-size:12px; font-weight:700; color:#374151; margin-bottom:8px;">\uD83D\uDCCA Pipeline Individual</div>
          ${this.renderBarraStatus(
            cargasColab.filter(c => c.status === 'aberta').length,
            cargasColab.filter(c => c.status === 'coleta').length,
            cargasColab.filter(c => c.status === 'viagem').length,
            finalizadasColab,
            cargasColab.length
          )}
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:4px; margin-top:8px;">
            <div style="text-align:center; font-size:10px; color:#6b7280;">\uD83D\uDFE1 ${cargasColab.filter(c => c.status === 'aberta').length}</div>
            <div style="text-align:center; font-size:10px; color:#6b7280;">\uD83D\uDD35 ${cargasColab.filter(c => c.status === 'coleta').length}</div>
            <div style="text-align:center; font-size:10px; color:#6b7280;">\uD83D\uDFE2 ${cargasColab.filter(c => c.status === 'viagem').length}</div>
            <div style="text-align:center; font-size:10px; color:#6b7280;">\u26AA ${finalizadasColab}</div>
          </div>
        </div>

        <!-- Ultimas cargas do colaborador -->
        <div style="background:white; border:1px solid #e5e7eb; border-radius:12px; padding:12px; margin-bottom:12px;">
          <div style="font-size:12px; font-weight:700; color:#374151; margin-bottom:8px;">\uD83D\uDCCB Ultimas Cargas</div>
          ${cargasColab.length === 0 ? '<div style="text-align:center; padding:12px; color:#9ca3af; font-size:12px;">Nenhuma carga no periodo</div>' :
            cargasColab.slice(-5).reverse().map(c => {
              const statusCores = { aberta: '#fef3c7;color:#92400e', coleta: '#dbeafe;color:#1e40af', viagem: '#d1fae5;color:#065f46', finalizada: '#e5e7eb;color:#374151' };
              const statusEmoji = { aberta: '\uD83D\uDFE1', coleta: '\uD83D\uDD35', viagem: '\uD83D\uDFE2', finalizada: '\u26AA' };
              return `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 0; border-bottom:1px solid #f0f2f5;">
                  <div>
                    <div style="font-size:11px; font-weight:600; color:#1a1a2e;">${this.escapeHtml(c.origem)} \u27A1 ${this.escapeHtml(c.destino)}</div>
                    ${c.valor ? `<div style="font-size:10px; color:#059669; font-weight:600;">R$ ${this.escapeHtml(c.valor)}</div>` : ''}
                  </div>
                  <span style="background:${statusCores[c.status]}; padding:2px 8px; border-radius:10px; font-size:10px; font-weight:600;">${statusEmoji[c.status]} ${c.status}</span>
                </div>
              `;
            }).join('')
          }
        </div>

        <!-- Acoes rapidas -->
        <div style="display:flex; gap:6px;">
          <button class="bc-btn bc-btn-sm" id="bc-dash-edit-colab" style="flex:1; background:#dbeafe; color:#1e40af;">\u270F\uFE0F Editar</button>
          <button class="bc-btn bc-btn-sm" id="bc-dash-delete-colab" style="flex:1; background:#fee2e2; color:#ef4444;">\uD83D\uDDD1\uFE0F Remover</button>
        </div>
      `;

      container.innerHTML = html;
      this.setupColabListeners(container, data);

      // Botoes editar/remover
      const editBtn = document.getElementById('bc-dash-edit-colab');
      if (editBtn) editBtn.addEventListener('click', () => this.showFormColaborador(col));

      const delBtn = document.getElementById('bc-dash-delete-colab');
      if (delBtn) delBtn.addEventListener('click', () => {
        if (confirm(`Remover ${col.nome} da equipe?`)) {
          BotCargaStorage.deleteColaborador(col.id, () => {
            this.selectedColaborador = null;
            BotCargaSidebar.showToast('Colaborador removido!');
            this.render();
          });
        }
      });
    });
  },

  setupColabListeners(container, data) {
    container.querySelectorAll('.bc-colab-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.selectedColaborador = chip.dataset.colabId;
        this.render();
      });
    });

    const addBtn = document.getElementById('bc-dash-add-colab2');
    if (addBtn) addBtn.addEventListener('click', () => this.showFormColaborador());
  },

  // ========== FORM COLABORADOR ==========
  showFormColaborador(col = null) {
    const container = document.getElementById('bc-dash-content');
    if (!container) return;

    container.innerHTML = `
      <div class="bc-form" style="border:2px solid #2563eb;">
        <div class="bc-form-title">${col ? '\u270F\uFE0F Editar Colaborador' : '\u2795 Novo Colaborador'}</div>
        <div class="bc-form-group">
          <label>Nome Completo</label>
          <input type="text" id="bc-colab-form-nome" placeholder="Ex: Maria Silva" value="${col ? col.nome : ''}">
        </div>
        <div class="bc-form-row">
          <div class="bc-form-group">
            <label>Cargo</label>
            <select id="bc-colab-form-cargo">
              <option value="Operador" ${col && col.cargo === 'Operador' ? 'selected' : ''}>Operador</option>
              <option value="Supervisor" ${col && col.cargo === 'Supervisor' ? 'selected' : ''}>Supervisor</option>
              <option value="Gerente" ${col && col.cargo === 'Gerente' ? 'selected' : ''}>Gerente</option>
              <option value="Diretor" ${col && col.cargo === 'Diretor' ? 'selected' : ''}>Diretor</option>
            </select>
          </div>
          <div class="bc-form-group">
            <label>Telefone</label>
            <input type="text" id="bc-colab-form-telefone" placeholder="(11) 99999-9999" value="${col ? (col.telefone || '') : ''}">
          </div>
        </div>
        <div class="bc-form-group">
          <label>WhatsApp (numero com DDD)</label>
          <input type="text" id="bc-colab-form-whatsapp" placeholder="Ex: 5511977252175" value="${col ? (col.whatsapp || '') : ''}">
          <div style="font-size:9px; color:#6b7280; margin-top:2px;">Formato: 55 + DDD + numero (usado na landing page e disparos)</div>
        </div>
        <div class="bc-form-group">
          <label>Email</label>
          <input type="text" id="bc-colab-form-email" placeholder="email@empresa.com" value="${col ? (col.email || '') : ''}">
        </div>
        <div class="bc-form-actions">
          <button class="bc-btn bc-btn-primary bc-btn-sm" id="bc-colab-form-salvar">${col ? 'Atualizar' : 'Salvar'}</button>
          <button class="bc-btn bc-btn-sm" id="bc-colab-form-cancelar" style="background:#e5e7eb; color:#374151;">Cancelar</button>
        </div>
      </div>
    `;

    document.getElementById('bc-colab-form-salvar').addEventListener('click', () => {
      const nome = document.getElementById('bc-colab-form-nome').value.trim();
      const cargo = document.getElementById('bc-colab-form-cargo').value;
      const telefone = document.getElementById('bc-colab-form-telefone').value.trim();
      const whatsapp = document.getElementById('bc-colab-form-whatsapp').value.trim();
      const email = document.getElementById('bc-colab-form-email').value.trim();

      if (!nome) { BotCargaSidebar.showToast('Preencha o nome!'); return; }

      const dados = { nome, cargo, telefone, whatsapp, email };

      if (col) {
        BotCargaStorage.updateColaborador(col.id, dados, () => {
          BotCargaSidebar.showToast('Colaborador atualizado!');
          this.render();
        });
      } else {
        BotCargaStorage.addColaborador(dados, () => {
          BotCargaSidebar.showToast('Colaborador cadastrado!');
          this.render();
        });
      }
    });

    document.getElementById('bc-colab-form-cancelar').addEventListener('click', () => this.render());
  },

  // ========== HELPERS ==========
  renderBarraStatus(abertas, coleta, viagem, finalizadas, total) {
    if (total === 0) return '<div style="background:#e5e7eb; border-radius:4px; height:12px;"></div>';
    const pA = (abertas / total) * 100;
    const pC = (coleta / total) * 100;
    const pV = (viagem / total) * 100;
    const pF = (finalizadas / total) * 100;
    return `
      <div style="display:flex; border-radius:6px; overflow:hidden; height:12px; background:#e5e7eb;">
        ${pA > 0 ? `<div style="width:${pA}%; background:#fbbf24;" title="Abertas: ${abertas}"></div>` : ''}
        ${pC > 0 ? `<div style="width:${pC}%; background:#3b82f6;" title="Coleta: ${coleta}"></div>` : ''}
        ${pV > 0 ? `<div style="width:${pV}%; background:#10b981;" title="Viagem: ${viagem}"></div>` : ''}
        ${pF > 0 ? `<div style="width:${pF}%; background:#6b7280;" title="Finalizadas: ${finalizadas}"></div>` : ''}
      </div>
    `;
  },

  filtrarPorPeriodo(items) {
    if (this.periodoFiltro === 'todos') return items;

    const agora = new Date();
    let dataLimite;

    if (this.periodoFiltro === 'hoje') {
      dataLimite = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    } else if (this.periodoFiltro === 'semana') {
      dataLimite = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (this.periodoFiltro === 'mes') {
      dataLimite = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return items.filter(item => {
      const data = new Date(item.criadoEm || 0);
      return data >= dataLimite;
    });
  },

  formatarValor(valor) {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  formatarDataCurta(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
