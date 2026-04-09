// ============================================
// BotCarga - Módulo de Cargas
// ============================================

const BotCargaCargas = {
  filtroStatus: 'todas',
  filtroVista: 'minhas', // 'minhas' ou 'todas'
  editingId: null,

  statusConfig: {
    aberta: { label: 'Aberta', emoji: '\uD83D\uDFE1', cor: '#fef3c7' },
    coleta: { label: 'Em Coleta', emoji: '\uD83D\uDD35', cor: '#dbeafe' },
    viagem: { label: 'Em Viagem', emoji: '\uD83D\uDFE2', cor: '#d1fae5' },
    finalizada: { label: 'Finalizada', emoji: '\u26AA', cor: '#e5e7eb' }
  },

  init() {
    this.render();
  },

  render() {
    const panel = document.getElementById('bc-panel-cargas');
    panel.innerHTML = `
      <!-- Toggle Minhas / Todas -->
      <div style="display:flex; gap:4px; margin-bottom:10px; background:white; border-radius:8px; padding:3px; border:1px solid #e5e7eb;">
        <button class="bc-vista-toggle ${this.filtroVista === 'minhas' ? 'active' : ''}" data-vista="minhas" style="
          flex:1; padding:6px; border:none; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; font-family:inherit;
          ${this.filtroVista === 'minhas' ? 'background:#2563eb; color:white;' : 'background:transparent; color:#6b7280;'}
        ">\uD83D\uDC64 Minhas Cargas</button>
        <button class="bc-vista-toggle ${this.filtroVista === 'todas' ? 'active' : ''}" data-vista="todas" style="
          flex:1; padding:6px; border:none; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; font-family:inherit;
          ${this.filtroVista === 'todas' ? 'background:#2563eb; color:white;' : 'background:transparent; color:#6b7280;'}
        ">\uD83C\uDFE2 Todas da Operacao</button>
      </div>
      <button class="bc-btn bc-btn-primary bc-btn-full" id="bc-add-carga">
        + Nova Carga
      </button>
      <div style="display: flex; gap: 6px; margin-top: 8px; margin-bottom: 12px;">
        <button class="bc-btn bc-btn-success bc-btn-sm" id="bc-exportar-landing" style="flex:1;" title="Exportar pagina com cargas abertas">
          \uD83D\uDCC4 Exportar Landing
        </button>
        <button class="bc-btn bc-btn-sm" id="bc-copiar-landing-code" style="flex:1; background:#6366f1; color:white;" title="Copiar codigo HTML da landing">
          \uD83D\uDCCB Copiar HTML
        </button>
      </div>
      <div style="display:flex; gap:6px; margin-bottom:12px;">
        <button class="bc-btn bc-btn-sm" id="bc-importar-planilha" style="flex:1; background:#f59e0b; color:white;" title="Importar cargas de planilha CSV/Excel">
          📊 Importar Planilha
        </button>
        <button class="bc-btn bc-btn-sm" id="bc-colar-demanda" style="flex:1; background:#8b5cf6; color:white;" title="Colar texto de demanda de cargas">
          📋 Colar Demanda
        </button>
      </div>
      <div id="bc-form-carga-container" style="margin-top: 12px;"></div>
      <div id="bc-filtros-carga" style="margin-top: 12px;"></div>
      <div id="bc-lista-cargas" style="margin-top: 8px;"></div>
    `;

    // Toggle Minhas / Todas
    panel.querySelectorAll('.bc-vista-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        this.filtroVista = btn.dataset.vista;
        this.render();
      });
    });

    document.getElementById('bc-add-carga').addEventListener('click', () => {
      this.editingId = null;
      this.showForm();
    });

    document.getElementById('bc-exportar-landing').addEventListener('click', () => {
      BotCargaStorage.getCargas((cargas) => {
        BotCargaStorage.getColaboradorAtivo((colabId) => {
          BotCargaStorage.getColaboradores((colabs) => {
            const colab = colabId ? colabs.find(c => c.id === colabId) : null;
            const whatsapp = colab && colab.whatsapp ? colab.whatsapp : null;
            BotCargaPDF.exportarLanding(cargas, whatsapp);
          });
        });
      });
    });

    document.getElementById('bc-copiar-landing-code').addEventListener('click', () => {
      BotCargaStorage.getCargas((cargas) => {
        BotCargaStorage.getColaboradorAtivo((colabId) => {
          BotCargaStorage.getColaboradores((colabs) => {
            const colab = colabId ? colabs.find(c => c.id === colabId) : null;
            const whatsapp = colab && colab.whatsapp ? colab.whatsapp : null;
            BotCargaPDF.copiarLandingCode(cargas, whatsapp);
          });
        });
      });
    });

    document.getElementById('bc-importar-planilha').addEventListener('click', () => {
      this.importarPlanilha();
    });

    document.getElementById('bc-colar-demanda').addEventListener('click', () => {
      this.mostrarColarDemanda();
    });

    this.renderFiltros();
    this.renderLista();
  },

  showForm(carga = null) {
    const container = document.getElementById('bc-form-carga-container');
    container.innerHTML = `
      <div class="bc-form">
        <div class="bc-form-title">${carga ? '\u270F\uFE0F Editar Carga' : '\u2795 Nova Carga'}</div>
        <div class="bc-form-row">
          <div class="bc-form-group">
            <label>Origem</label>
            <input type="text" id="bc-carga-origem" placeholder="Ex: Sao Paulo - SP" value="${carga ? carga.origem : ''}">
          </div>
          <div class="bc-form-group">
            <label>Destino</label>
            <input type="text" id="bc-carga-destino" placeholder="Ex: Rio de Janeiro - RJ" value="${carga ? carga.destino : ''}">
          </div>
        </div>
        <div class="bc-form-row">
          <div class="bc-form-group">
            <label>Tipo de Carga</label>
            <input type="text" id="bc-carga-tipo" placeholder="Ex: Carga seca, Granel" value="${carga ? (carga.tipoCarga || '') : ''}">
          </div>
          <div class="bc-form-group">
            <label>Peso (ton)</label>
            <input type="text" id="bc-carga-peso" placeholder="Ex: 25" value="${carga ? (carga.peso || '') : ''}">
          </div>
        </div>
        <div class="bc-form-row">
          <div class="bc-form-group">
            <label>Veiculo Necessario</label>
            <select id="bc-carga-veiculo">
              <option value="">Selecione</option>
              <option value="Truck" ${carga && carga.veiculo === 'Truck' ? 'selected' : ''}>Truck</option>
              <option value="Toco" ${carga && carga.veiculo === 'Toco' ? 'selected' : ''}>Toco</option>
              <option value="Carreta" ${carga && carga.veiculo === 'Carreta' ? 'selected' : ''}>Carreta</option>
              <option value="Carreta LS" ${carga && carga.veiculo === 'Carreta LS' ? 'selected' : ''}>Carreta LS</option>
              <option value="Bitruck" ${carga && carga.veiculo === 'Bitruck' ? 'selected' : ''}>Bitruck</option>
              <option value="Bitrem" ${carga && carga.veiculo === 'Bitrem' ? 'selected' : ''}>Bitrem</option>
              <option value="Rodotrem" ${carga && carga.veiculo === 'Rodotrem' ? 'selected' : ''}>Rodotrem</option>
              <option value="VUC" ${carga && carga.veiculo === 'VUC' ? 'selected' : ''}>VUC</option>
              <option value="3/4" ${carga && carga.veiculo === '3/4' ? 'selected' : ''}>3/4</option>
              <option value="Van" ${carga && carga.veiculo === 'Van' ? 'selected' : ''}>Van</option>
            </select>
          </div>
          <div class="bc-form-group">
            <label>Valor do Frete (R$)</label>
            <input type="text" id="bc-carga-valor" placeholder="Ex: 5.000,00" value="${carga ? (carga.valor || '') : ''}">
          </div>
        </div>
        <div class="bc-form-row">
          <div class="bc-form-group">
            <label>Data Coleta</label>
            <input type="date" id="bc-carga-data-coleta" value="${carga ? (carga.dataColeta || '') : ''}">
          </div>
          <div class="bc-form-group">
            <label>Data Entrega</label>
            <input type="date" id="bc-carga-data-entrega" value="${carga ? (carga.dataEntrega || '') : ''}">
          </div>
        </div>
        <div class="bc-form-group">
          <label>Observacoes</label>
          <textarea id="bc-carga-obs" placeholder="Ex: Carga paletizada, necessita lona...">${carga ? (carga.observacoes || '') : ''}</textarea>
        </div>
        ${carga ? `
        <div class="bc-form-group">
          <label>Status</label>
          <select id="bc-carga-status">
            <option value="aberta" ${carga.status === 'aberta' ? 'selected' : ''}>Aberta</option>
            <option value="coleta" ${carga.status === 'coleta' ? 'selected' : ''}>Em Coleta</option>
            <option value="viagem" ${carga.status === 'viagem' ? 'selected' : ''}>Em Viagem</option>
            <option value="finalizada" ${carga.status === 'finalizada' ? 'selected' : ''}>Finalizada</option>
          </select>
        </div>
        ` : ''}
        <div class="bc-form-actions">
          <button class="bc-btn bc-btn-primary" id="bc-salvar-carga">
            ${carga ? 'Atualizar' : 'Salvar'}
          </button>
          <button class="bc-btn" id="bc-cancelar-carga" style="background: #e5e7eb; color: #374151;">
            Cancelar
          </button>
        </div>
      </div>
    `;

    document.getElementById('bc-salvar-carga').addEventListener('click', () => this.salvar());
    document.getElementById('bc-cancelar-carga').addEventListener('click', () => {
      container.innerHTML = '';
      this.editingId = null;
    });
  },

  salvar() {
    const origem = document.getElementById('bc-carga-origem').value.trim();
    const destino = document.getElementById('bc-carga-destino').value.trim();
    const tipoCarga = document.getElementById('bc-carga-tipo').value.trim();
    const peso = document.getElementById('bc-carga-peso').value.trim();
    const veiculo = document.getElementById('bc-carga-veiculo').value;
    const valor = document.getElementById('bc-carga-valor').value.trim();
    const dataColeta = document.getElementById('bc-carga-data-coleta').value;
    const dataEntrega = document.getElementById('bc-carga-data-entrega').value;
    const observacoes = document.getElementById('bc-carga-obs').value.trim();

    if (!origem || !destino) {
      BotCargaSidebar.showToast('Preencha origem e destino!');
      return;
    }

    const dados = { origem, destino, tipoCarga, peso, veiculo, valor, dataColeta, dataEntrega, observacoes };

    if (this.editingId) {
      const statusEl = document.getElementById('bc-carga-status');
      if (statusEl) dados.status = statusEl.value;

      BotCargaStorage.updateCarga(this.editingId, dados, () => {
        BotCargaSidebar.showToast('Carga atualizada!');
        this.editingId = null;
        document.getElementById('bc-form-carga-container').innerHTML = '';
        this.renderFiltros();
        this.renderLista();
      });
    } else {
      // Vincula ao colaborador ativo
      BotCargaStorage.getColaboradorAtivo((colabId) => {
        if (colabId) dados.colaboradorId = colabId;
        BotCargaStorage.addCarga(dados, () => {
          BotCargaSidebar.showToast('Carga cadastrada!');
          document.getElementById('bc-form-carga-container').innerHTML = '';
          this.renderFiltros();
          this.renderLista();
        });
      });
    }
  },

  renderFiltros() {
    BotCargaStorage.getCargas((todasCargas) => {
      BotCargaStorage.getColaboradorAtivo((colabId) => {
      const cargas = (this.filtroVista === 'minhas' && colabId)
        ? todasCargas.filter(c => c.colaboradorId === colabId)
        : todasCargas;
      const container = document.getElementById('bc-filtros-carga');
      const contagem = {
        todas: cargas.length,
        aberta: cargas.filter(c => c.status === 'aberta').length,
        coleta: cargas.filter(c => c.status === 'coleta').length,
        viagem: cargas.filter(c => c.status === 'viagem').length,
        finalizada: cargas.filter(c => c.status === 'finalizada').length
      };

      container.innerHTML = `
        <div class="bc-status-filters">
          <button class="bc-status-filter ${this.filtroStatus === 'todas' ? 'active' : ''}" data-filter="todas">
            Todas <span class="count">${contagem.todas}</span>
          </button>
          <button class="bc-status-filter ${this.filtroStatus === 'aberta' ? 'active' : ''}" data-filter="aberta">
            \uD83D\uDFE1 Abertas <span class="count">${contagem.aberta}</span>
          </button>
          <button class="bc-status-filter ${this.filtroStatus === 'coleta' ? 'active' : ''}" data-filter="coleta">
            \uD83D\uDD35 Coleta <span class="count">${contagem.coleta}</span>
          </button>
          <button class="bc-status-filter ${this.filtroStatus === 'viagem' ? 'active' : ''}" data-filter="viagem">
            \uD83D\uDFE2 Viagem <span class="count">${contagem.viagem}</span>
          </button>
          <button class="bc-status-filter ${this.filtroStatus === 'finalizada' ? 'active' : ''}" data-filter="finalizada">
            \u26AA Finalizadas <span class="count">${contagem.finalizada}</span>
          </button>
        </div>
      `;

      container.querySelectorAll('.bc-status-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          this.filtroStatus = btn.dataset.filter;
          this.renderFiltros();
          this.renderLista();
        });
      });
      }); // fecha getColaboradorAtivo
    });
  },

  renderLista() {
    BotCargaStorage.getCargas((todasCargas) => {
      BotCargaStorage.getColaboradorAtivo((colabId) => {
      BotCargaStorage.getColaboradores((colaboradores) => {
      const cargas = (this.filtroVista === 'minhas' && colabId)
        ? todasCargas.filter(c => c.colaboradorId === colabId)
        : todasCargas;
      const container = document.getElementById('bc-lista-cargas');
      let filtered = cargas;

      if (this.filtroStatus !== 'todas') {
        filtered = cargas.filter(c => c.status === this.filtroStatus);
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="bc-empty">
            <div class="bc-empty-icon">\uD83D\uDCE6</div>
            <p>Nenhuma carga ${this.filtroStatus !== 'todas' ? 'com esse status' : 'cadastrada ainda'}</p>
          </div>
        `;
        return;
      }

      // Busca contagem de interessados
      BotCargaStorage.getInteressados((interessados) => {
        const contagemMap = {};
        interessados.forEach(i => {
          contagemMap[i.cargaId] = (contagemMap[i.cargaId] || 0) + 1;
        });

        container.innerHTML = filtered.map(c => {
          const cfg = this.statusConfig[c.status] || this.statusConfig.aberta;
          const textoEnvio = this.gerarTextoEnvio(c);
          const qtdInteressados = contagemMap[c.id] || 0;

          return `
            <div class="bc-card">
              <div class="bc-card-header">
                <div>
                  <div class="bc-card-name">${this.escapeHtml(c.origem)} \u27A1 ${this.escapeHtml(c.destino)}</div>
                  <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
                    <span class="bc-status ${c.status}">${cfg.emoji} ${cfg.label}</span>
                    <button class="bc-interessados-badge" data-action="ver-interessados" data-id="${c.id}" title="Ver interessados" style="
                      display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600;
                      border:none; cursor:pointer; font-family:inherit; transition:all 0.2s;
                      ${qtdInteressados > 0 ? 'background:#dcfce7; color:#16a34a;' : 'background:#f3f4f6; color:#9ca3af;'}
                    ">
                      \uD83D\uDE4B ${qtdInteressados} interessado${qtdInteressados !== 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
                <div class="bc-card-actions">
                  ${this.filtroVista === 'todas' && c.colaboradorId ? (() => { const col = colaboradores.find(x => x.id === c.colaboradorId); return col ? `<span style="background:#ede9fe; color:#6d28d9; padding:2px 8px; border-radius:10px; font-size:9px; font-weight:600;">\uD83D\uDC64 ${this.escapeHtml(col.nome.split(' ')[0])}</span>` : ''; })() : ''}
                  <button class="bc-btn-icon" title="Adicionar interessado" data-action="add-interessado" data-id="${c.id}" style="background:#dcfce7; color:#16a34a; font-size:12px;">\u2795</button>
                  <button class="bc-btn-icon edit" title="Editar" data-action="edit" data-id="${c.id}">\u270F\uFE0F</button>
                  <button class="bc-btn-icon delete" title="Excluir" data-action="delete" data-id="${c.id}">\uD83D\uDDD1\uFE0F</button>
                </div>
              </div>
              <div id="bc-interessados-lista-${c.id}" style="display:none;"></div>
              <div class="bc-card-info">
                ${c.tipoCarga ? `<div class="bc-card-detail"><span class="bc-card-detail-icon">\uD83D\uDCE6</span>${this.escapeHtml(c.tipoCarga)}</div>` : ''}
                ${c.peso ? `<div class="bc-card-detail"><span class="bc-card-detail-icon">\u2696\uFE0F</span>${this.escapeHtml(c.peso)} ton</div>` : ''}
                ${c.veiculo ? `<div class="bc-card-detail"><span class="bc-card-detail-icon">\uD83D\uDE9A</span>${this.escapeHtml(c.veiculo)}</div>` : ''}
                ${c.valor ? `<div class="bc-card-detail"><span class="bc-card-detail-icon">\uD83D\uDCB0</span>R$ ${this.escapeHtml(c.valor)}</div>` : ''}
                ${c.dataColeta ? `<div class="bc-card-detail"><span class="bc-card-detail-icon">\uD83D\uDCC5</span>Coleta: ${this.formatarData(c.dataColeta)}</div>` : ''}
                ${c.dataEntrega ? `<div class="bc-card-detail"><span class="bc-card-detail-icon">\uD83C\uDFC1</span>Entrega: ${this.formatarData(c.dataEntrega)}</div>` : ''}
                ${c.observacoes ? `<div class="bc-card-detail"><span class="bc-card-detail-icon">\uD83D\uDCDD</span>${this.escapeHtml(c.observacoes)}</div>` : ''}
              </div>
              <div class="bc-cargo-preview" id="bc-preview-${c.id}">${this.escapeHtml(textoEnvio)}</div>
              <div class="bc-cargo-preview-actions">
                <button class="bc-btn bc-btn-sm bc-btn-success" data-action="copiar" data-id="${c.id}" title="Copiar texto da carga">
                  \uD83D\uDCCB Copiar
                </button>
                <button class="bc-btn bc-btn-sm bc-btn-primary" data-action="colar" data-id="${c.id}" title="Colar no chat aberto">
                  \uD83D\uDCAC Colar no Chat
                </button>
                <button class="bc-btn bc-btn-sm" data-action="status-next" data-id="${c.id}" style="background: #e5e7eb; color: #374151;" title="Avancar status">
                  \u27A1 Avancar Status
                </button>
              </div>
            </div>
          `;
        }).join('');

      // Event listeners para editar
      container.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const carga = cargas.find(c => c.id === btn.dataset.id);
          if (carga) {
            this.editingId = carga.id;
            this.showForm(carga);
          }
        });
      });

      // Event listeners para excluir
      container.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (confirm('Tem certeza que deseja excluir esta carga?')) {
            BotCargaStorage.deleteCarga(btn.dataset.id, () => {
              BotCargaSidebar.showToast('Carga excluida!');
              this.renderFiltros();
              this.renderLista();
            });
          }
        });
      });

      // Event listeners para copiar
      container.querySelectorAll('[data-action="copiar"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const carga = cargas.find(c => c.id === btn.dataset.id);
          if (carga) {
            const texto = this.gerarTextoEnvio(carga);
            navigator.clipboard.writeText(texto).then(() => {
              BotCargaSidebar.showToast('Texto copiado! Cole no chat.');
            });
          }
        });
      });

      // Event listeners para colar no chat
      container.querySelectorAll('[data-action="colar"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const carga = cargas.find(c => c.id === btn.dataset.id);
          if (carga) {
            this.colarNoChat(carga);
          }
        });
      });

      // Event listeners para avancar status
      container.querySelectorAll('[data-action="status-next"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const carga = cargas.find(c => c.id === btn.dataset.id);
          if (carga) {
            this.avancarStatus(carga);
          }
        });
      });

      // Event listeners para ver interessados
      container.querySelectorAll('[data-action="ver-interessados"]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.toggleInteressados(btn.dataset.id);
        });
      });

      // Event listeners para adicionar interessado
      container.querySelectorAll('[data-action="add-interessado"]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.showFormInteressado(btn.dataset.id);
        });
      });

      }); // fecha getInteressados
      }); // fecha getColaboradores
      }); // fecha getColaboradorAtivo
    });
  },

  gerarTextoEnvio(carga) {
    let texto = `\uD83D\uDE9A *CARGA DISPONIVEL* \uD83D\uDE9A\n\n`;
    texto += `\uD83D\uDCCD *Origem:* ${carga.origem}\n`;
    texto += `\uD83C\uDFC1 *Destino:* ${carga.destino}\n`;
    if (carga.tipoCarga) texto += `\uD83D\uDCE6 *Tipo:* ${carga.tipoCarga}\n`;
    if (carga.peso) texto += `\u2696\uFE0F *Peso:* ${carga.peso} ton\n`;
    if (carga.veiculo) texto += `\uD83D\uDE9A *Veiculo:* ${carga.veiculo}\n`;
    if (carga.valor) texto += `\uD83D\uDCB0 *Valor:* R$ ${carga.valor}\n`;
    if (carga.dataColeta) texto += `\uD83D\uDCC5 *Coleta:* ${this.formatarData(carga.dataColeta)}\n`;
    if (carga.dataEntrega) texto += `\uD83D\uDCC5 *Entrega:* ${this.formatarData(carga.dataEntrega)}\n`;
    if (carga.observacoes) texto += `\n\uD83D\uDCDD *Obs:* ${carga.observacoes}\n`;
    texto += `\n_Interessado? Responda esta mensagem!_`;
    return texto;
  },

  colarNoChat(carga) {
    const texto = this.gerarTextoEnvio(carga);
    const messageBox = document.querySelector('div[contenteditable="true"][data-tab="10"]')
      || document.querySelector('footer div[contenteditable="true"]')
      || document.querySelector('div[contenteditable="true"][role="textbox"]');

    if (messageBox) {
      messageBox.focus();
      // Clear existing content
      messageBox.innerHTML = '';
      // Split by newlines and insert with proper line breaks for WhatsApp
      const lines = texto.split('\n');
      lines.forEach((line, index) => {
        if (index > 0) {
          // Insert a Shift+Enter (line break) for each newline
          messageBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, shiftKey: true, bubbles: true }));
        }
        if (line) {
          document.execCommand('insertText', false, line);
        }
      });
      messageBox.dispatchEvent(new Event('input', { bubbles: true }));
      BotCargaSidebar.showToast('Texto colado no chat! Envie a mensagem.');
    } else {
      navigator.clipboard.writeText(texto).then(() => {
        BotCargaSidebar.showToast('Abra uma conversa primeiro! Texto copiado para colar manualmente.');
      });
    }
  },

  avancarStatus(carga) {
    const fluxo = ['aberta', 'coleta', 'viagem', 'finalizada'];
    const indexAtual = fluxo.indexOf(carga.status);
    if (indexAtual < fluxo.length - 1) {
      const novoStatus = fluxo[indexAtual + 1];
      const cfg = this.statusConfig[novoStatus];
      BotCargaStorage.updateCarga(carga.id, { status: novoStatus }, () => {
        BotCargaSidebar.showToast(`Status: ${cfg.emoji} ${cfg.label}`);
        this.renderFiltros();
        this.renderLista();
      });
    } else {
      BotCargaSidebar.showToast('Carga ja esta finalizada!');
    }
  },

  // ========== INTERESSADOS ==========

  toggleInteressados(cargaId) {
    const lista = document.getElementById(`bc-interessados-lista-${cargaId}`);
    if (!lista) return;

    if (lista.style.display === 'none' || !lista.style.display) {
      BotCargaStorage.getInteressadosPorCarga(cargaId, (interessados) => {
        if (interessados.length === 0) {
          lista.innerHTML = `
            <div style="background:#fefce8; border:1px solid #fde68a; border-radius:8px; padding:10px; margin:8px 0; text-align:center;">
              <div style="font-size:12px; color:#92400e;">Nenhum interessado ainda</div>
              <button class="bc-btn bc-btn-sm bc-btn-primary" data-action="add-interessado-inline" data-id="${cargaId}" style="margin-top:6px; font-size:11px;">
                \u2795 Adicionar Interessado
              </button>
            </div>
          `;
          lista.querySelector('[data-action="add-interessado-inline"]').addEventListener('click', () => {
            this.showFormInteressado(cargaId);
          });
        } else {
          lista.innerHTML = `
            <div style="background:white; border:1px solid #d1fae5; border-radius:8px; margin:8px 0; overflow:hidden;">
              <div style="background:#ecfdf5; padding:8px 12px; font-size:12px; font-weight:700; color:#065f46; display:flex; align-items:center; justify-content:space-between;">
                <span>\uD83D\uDE4B ${interessados.length} Interessado${interessados.length !== 1 ? 's' : ''}</span>
                <button class="bc-btn bc-btn-sm" data-action="add-interessado-inline" data-id="${cargaId}" style="background:#10b981; color:white; font-size:10px; padding:3px 8px;">
                  \u2795 Novo
                </button>
              </div>
              ${interessados.map(i => `
                <div style="padding:8px 12px; border-bottom:1px solid #f0f2f5; display:flex; align-items:center; justify-content:space-between; cursor:pointer; transition:background 0.2s;"
                     class="bc-interessado-item" data-telefone="${this.escapeHtml(i.telefone)}" data-nome="${this.escapeHtml(i.nome)}">
                  <div>
                    <div style="font-size:13px; font-weight:600; color:#1a1a2e;">${this.escapeHtml(i.nome)}</div>
                    <div style="font-size:11px; color:#6b7280; display:flex; gap:8px; margin-top:2px;">
                      <span>\uD83D\uDCF1 ${this.escapeHtml(i.telefone)}</span>
                      ${i.veiculo ? `<span>\uD83D\uDE9A ${this.escapeHtml(i.veiculo)}</span>` : ''}
                      ${i.regiao ? `<span>\uD83C\uDF0E ${this.escapeHtml(i.regiao)}</span>` : ''}
                    </div>
                    ${i.observacoes ? `<div style="font-size:10px; color:#9ca3af; margin-top:2px;">\uD83D\uDCDD ${this.escapeHtml(i.observacoes)}</div>` : ''}
                  </div>
                  <div style="display:flex; gap:4px; align-items:center;">
                    <button class="bc-btn-icon send" title="Abrir conversa" data-action="chat-interessado" data-telefone="${this.escapeHtml(i.telefone)}" style="width:30px; height:30px;">
                      \uD83D\uDCAC
                    </button>
                    <button class="bc-btn-icon" title="Salvar como motorista" data-action="salvar-motorista" data-interessado-id="${i.id}" style="width:30px; height:30px; background:#dbeafe; color:#2563eb; font-size:12px;">
                      \uD83D\uDCBE
                    </button>
                    <button class="bc-btn-icon delete" title="Remover" data-action="remover-interessado" data-interessado-id="${i.id}" style="width:30px; height:30px;">
                      \u2716
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `;

          // Clique no item abre WhatsApp
          lista.querySelectorAll('.bc-interessado-item').forEach(item => {
            item.addEventListener('click', (e) => {
              if (e.target.closest('button')) return;
              this.buscarConversaWhatsApp(item.dataset.telefone);
            });
          });

          // Botao chat direto
          lista.querySelectorAll('[data-action="chat-interessado"]').forEach(btn => {
            btn.addEventListener('click', () => {
              this.buscarConversaWhatsApp(btn.dataset.telefone);
            });
          });

          // Botao salvar como motorista
          lista.querySelectorAll('[data-action="salvar-motorista"]').forEach(btn => {
            btn.addEventListener('click', () => {
              const intId = btn.dataset.interessadoId;
              const interessado = interessados.find(i => i.id === intId);
              if (interessado) {
                this.salvarComoMotorista(interessado);
              }
            });
          });

          // Botao remover
          lista.querySelectorAll('[data-action="remover-interessado"]').forEach(btn => {
            btn.addEventListener('click', () => {
              if (confirm('Remover este interessado?')) {
                BotCargaStorage.deleteInteressado(btn.dataset.interessadoId, () => {
                  BotCargaSidebar.showToast('Interessado removido!');
                  this.renderLista();
                });
              }
            });
          });

          // Botao adicionar novo
          const addBtn = lista.querySelector('[data-action="add-interessado-inline"]');
          if (addBtn) {
            addBtn.addEventListener('click', () => {
              this.showFormInteressado(cargaId);
            });
          }
        }
        lista.style.display = 'block';
      });
    } else {
      lista.style.display = 'none';
    }
  },

  showFormInteressado(cargaId) {
    const lista = document.getElementById(`bc-interessados-lista-${cargaId}`);
    if (!lista) return;

    lista.style.display = 'block';
    lista.innerHTML = `
      <div class="bc-form" style="padding:12px; margin:8px 0; border:2px solid #10b981;">
        <div class="bc-form-title">\u2795 Novo Interessado</div>
        <div class="bc-form-group">
          <label>Nome</label>
          <input type="text" id="bc-int-nome-${cargaId}" placeholder="Nome do motorista">
        </div>
        <div class="bc-form-row">
          <div class="bc-form-group">
            <label>Telefone</label>
            <input type="text" id="bc-int-telefone-${cargaId}" placeholder="(11) 99999-9999">
          </div>
          <div class="bc-form-group">
            <label>Veiculo</label>
            <select id="bc-int-veiculo-${cargaId}">
              <option value="">Selecione</option>
              <option value="Truck">Truck</option>
              <option value="Toco">Toco</option>
              <option value="Carreta">Carreta</option>
              <option value="Carreta LS">Carreta LS</option>
              <option value="Bitruck">Bitruck</option>
              <option value="Bitrem">Bitrem</option>
              <option value="Rodotrem">Rodotrem</option>
              <option value="VUC">VUC</option>
              <option value="3/4">3/4</option>
              <option value="Van">Van</option>
            </select>
          </div>
        </div>
        <div class="bc-form-row">
          <div class="bc-form-group">
            <label>Carroceria</label>
            <select id="bc-int-carroceria-${cargaId}">
              <option value="">Selecione</option>
              <option value="Bau">Bau</option>
              <option value="Sider">Sider</option>
              <option value="Graneleiro">Graneleiro</option>
              <option value="Tanque">Tanque</option>
              <option value="Plataforma">Plataforma</option>
              <option value="Cacamba">Cacamba</option>
              <option value="Refrigerado">Refrigerado</option>
              <option value="Porta Container">Porta Container</option>
            </select>
          </div>
          <div class="bc-form-group">
            <label>Regiao</label>
            <select id="bc-int-regiao-${cargaId}">
              <option value="">Selecione</option>
              <option value="Sul">Sul</option>
              <option value="Sudeste">Sudeste</option>
              <option value="Centro-Oeste">Centro-Oeste</option>
              <option value="Nordeste">Nordeste</option>
              <option value="Norte">Norte</option>
            </select>
          </div>
        </div>
        <div class="bc-form-group">
          <label>Observacoes</label>
          <input type="text" id="bc-int-obs-${cargaId}" placeholder="Ex: Disponivel imediato">
        </div>
        <div class="bc-form-actions">
          <button class="bc-btn bc-btn-success bc-btn-sm" id="bc-int-salvar-${cargaId}">Salvar</button>
          <button class="bc-btn bc-btn-sm" id="bc-int-cancelar-${cargaId}" style="background:#e5e7eb; color:#374151;">Cancelar</button>
        </div>
      </div>
    `;

    document.getElementById(`bc-int-salvar-${cargaId}`).addEventListener('click', () => {
      const nome = document.getElementById(`bc-int-nome-${cargaId}`).value.trim();
      const telefone = document.getElementById(`bc-int-telefone-${cargaId}`).value.trim();
      const veiculo = document.getElementById(`bc-int-veiculo-${cargaId}`).value;
      const carroceria = document.getElementById(`bc-int-carroceria-${cargaId}`).value;
      const regiao = document.getElementById(`bc-int-regiao-${cargaId}`).value;
      const observacoes = document.getElementById(`bc-int-obs-${cargaId}`).value.trim();

      if (!nome || !telefone) {
        BotCargaSidebar.showToast('Preencha nome e telefone!');
        return;
      }

      BotCargaStorage.addInteressado({ cargaId, nome, telefone, veiculo, carroceria, regiao, observacoes }, () => {
        BotCargaSidebar.showToast('Interessado adicionado!');
        this.renderLista();
      });
    });

    document.getElementById(`bc-int-cancelar-${cargaId}`).addEventListener('click', () => {
      lista.style.display = 'none';
      lista.innerHTML = '';
    });
  },

  salvarComoMotorista(interessado) {
    const dados = {
      nome: interessado.nome,
      telefone: interessado.telefone,
      veiculo: interessado.veiculo || '',
      rota: '',
      carroceria: interessado.carroceria || '',
      regiao: interessado.regiao || '',
      etiqueta: 'Novo',
      observacoes: interessado.observacoes || ''
    };

    BotCargaStorage.addMotorista(dados, () => {
      BotCargaSidebar.showToast(`${interessado.nome} salvo como motorista!`);
    });
  },

  buscarConversaWhatsApp(telefone) {
    const numero = telefone.replace(/\D/g, '');
    const searchBox = document.querySelector('div[contenteditable="true"][data-tab="3"]');
    if (searchBox) {
      searchBox.focus();
      searchBox.textContent = '';
      document.execCommand('insertText', false, numero);
      searchBox.dispatchEvent(new Event('input', { bubbles: true }));
      BotCargaSidebar.showToast('Buscando conversa...');
    } else {
      BotCargaSidebar.showToast('Abra o WhatsApp Web primeiro');
    }
  },

  formatarData(dateStr) {
    if (!dateStr) return '';
    const [ano, mes, dia] = dateStr.split('-');
    return `${dia}/${mes}/${ano}`;
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // ========== IMPORTAR PLANILHA ==========

  importarPlanilha() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.txt';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length === 0) {
          BotCargaSidebar.showToast('Arquivo vazio!');
          return;
        }

        let startIndex = 0;
        const firstLine = lines[0].toLowerCase();
        if (firstLine.includes('origem') || firstLine.includes('destino')) {
          startIndex = 1;
        }

        const colunas = ['origem', 'destino', 'tipoCarga', 'peso', 'veiculo', 'valor', 'dataColeta', 'dataEntrega', 'observacoes'];
        let importCount = 0;
        let pending = 0;

        BotCargaStorage.getColaboradorAtivo((colabId) => {
          for (let i = startIndex; i < lines.length; i++) {
            const cols = lines[i].split(/[;,\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
            if (cols.length < 2 || !cols[0] || !cols[1]) continue;

            const dados = {};
            colunas.forEach((key, idx) => {
              if (cols[idx] && cols[idx].trim()) {
                dados[key] = cols[idx].trim();
              }
            });
            dados.status = 'aberta';
            if (colabId) dados.colaboradorId = colabId;

            pending++;
            BotCargaStorage.addCarga(dados, () => {
              pending--;
              importCount++;
              if (pending === 0) {
                BotCargaSidebar.showToast(`${importCount} carga${importCount !== 1 ? 's' : ''} importada${importCount !== 1 ? 's' : ''}!`);
                this.renderFiltros();
                this.renderLista();
              }
            });
          }

          if (pending === 0) {
            BotCargaSidebar.showToast('Nenhuma linha valida encontrada no arquivo.');
          }
        });
      };
      reader.readAsText(file, 'UTF-8');
      document.body.removeChild(input);
    });

    input.click();
  },

  // ========== COLAR DEMANDA ==========

  mostrarColarDemanda() {
    const container = document.getElementById('bc-form-carga-container');
    container.innerHTML = `
      <div class="bc-form">
        <div class="bc-form-title">📋 Colar Demanda de Carga</div>
        <div class="bc-form-group">
          <label>Texto da demanda</label>
          <textarea id="bc-demanda-texto" style="min-height:150px; font-size:12px; line-height:1.5;" placeholder="Cole aqui o texto da demanda de carga recebida pelo WhatsApp..."></textarea>
        </div>
        <div class="bc-form-actions">
          <button class="bc-btn bc-btn-primary" id="bc-processar-demanda">
            Processar
          </button>
          <button class="bc-btn" id="bc-cancelar-demanda" style="background: #e5e7eb; color: #374151;">
            Cancelar
          </button>
        </div>
      </div>
    `;

    document.getElementById('bc-processar-demanda').addEventListener('click', () => {
      const texto = document.getElementById('bc-demanda-texto').value.trim();
      if (!texto) {
        BotCargaSidebar.showToast('Cole o texto da demanda!');
        return;
      }
      this.processarDemandaTexto(texto);
    });

    document.getElementById('bc-cancelar-demanda').addEventListener('click', () => {
      container.innerHTML = '';
    });
  },

  processarDemandaTexto(texto) {
    const dados = {};

    // Helper: find value after a label pattern
    const extrair = (patterns, text) => {
      for (const pattern of patterns) {
        const regex = new RegExp(pattern + '\\s*[:\\-]?\\s*(.+)', 'im');
        const match = text.match(regex);
        if (match && match[1]) return match[1].trim().replace(/[*_~`]/g, '');
      }
      return '';
    };

    // Origem
    dados.origem = extrair(['origem', 'de', 'coleta', 'saida', 'carregamento'], texto);

    // Destino
    dados.destino = extrair(['destino', 'para', 'entrega', 'descarga', 'chegada'], texto);

    // Peso
    const pesoMatch = texto.match(/peso\s*[:\-]?\s*([\d.,]+)\s*(ton|t|kg)?/i);
    if (pesoMatch) {
      dados.peso = pesoMatch[1].replace(',', '.');
    }

    // Valor / Frete
    const valorMatch = texto.match(/(?:valor|frete|preco|R\$)\s*[:\-]?\s*R?\$?\s*([\d.,]+)/i);
    if (valorMatch) {
      dados.valor = valorMatch[1];
    }

    // Veiculo - detect vehicle types
    const veiculos = ['Truck', 'Toco', 'Carreta', 'Carreta LS', 'Bitruck', 'Bitrem', 'Rodotrem', 'VUC', '3/4', 'Van'];
    const textoLower = texto.toLowerCase();
    for (const v of veiculos) {
      if (textoLower.includes(v.toLowerCase())) {
        dados.veiculo = v;
        break;
      }
    }

    // Tipo de carga
    dados.tipoCarga = extrair(['tipo', 'tipo de carga', 'produto', 'mercadoria', 'carga'], texto);

    // Data coleta
    const dataColetaMatch = texto.match(/(?:coleta|carregamento|saida)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]?\d{2,4}?)/i);
    if (dataColetaMatch) {
      dados.dataColeta = this.parseDataTexto(dataColetaMatch[1]);
    }

    // Data entrega
    const dataEntregaMatch = texto.match(/(?:entrega|descarga|chegada)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]?\d{2,4}?)/i);
    if (dataEntregaMatch) {
      dados.dataEntrega = this.parseDataTexto(dataEntregaMatch[1]);
    }

    // Clean up empty values
    Object.keys(dados).forEach(k => { if (!dados[k]) delete dados[k]; });

    // Check if we have minimum data
    if (dados.origem && dados.destino) {
      dados.status = 'aberta';
      BotCargaStorage.getColaboradorAtivo((colabId) => {
        if (colabId) dados.colaboradorId = colabId;
        BotCargaStorage.addCarga(dados, () => {
          BotCargaSidebar.showToast('Carga criada a partir da demanda!');
          document.getElementById('bc-form-carga-container').innerHTML = '';
          this.renderFiltros();
          this.renderLista();
        });
      });
    } else {
      // Could not parse enough data - open form pre-filled
      BotCargaSidebar.showToast('Dados insuficientes. Complete manualmente.');
      this.editingId = null;
      this.showForm({
        origem: dados.origem || '',
        destino: dados.destino || '',
        tipoCarga: dados.tipoCarga || '',
        peso: dados.peso || '',
        veiculo: dados.veiculo || '',
        valor: dados.valor || '',
        dataColeta: dados.dataColeta || '',
        dataEntrega: dados.dataEntrega || '',
        observacoes: texto,
        status: 'aberta'
      });
    }
  },

  parseDataTexto(dataStr) {
    if (!dataStr) return '';
    const parts = dataStr.split(/[\/\-]/);
    if (parts.length >= 2) {
      const dia = parts[0].padStart(2, '0');
      const mes = parts[1].padStart(2, '0');
      let ano = parts[2] || new Date().getFullYear().toString();
      if (ano.length === 2) ano = '20' + ano;
      return `${ano}-${mes}-${dia}`;
    }
    return '';
  }
};
