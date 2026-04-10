// ============================================
// BotCarga - Módulo de Disparo de Mensagens
// ============================================

const BotCargaDisparo = {
  motoristasSelecao: [], // motoristas selecionados para disparo
  motoristasBase: [],    // motoristas filtrados da base
  gruposWhatsApp: [],    // grupos detectados do WhatsApp

  init() {
    this.render();
  },

  render() {
    const panel = document.getElementById('bc-panel-disparos');
    if (!panel) return;

    panel.innerHTML = `
      <div style="font-size:14px; font-weight:700; color:#1a1a2e; margin-bottom:12px;">📢 Disparo de Mensagens</div>

      <!-- Selecionar Carga para disparo -->
      <div class="bc-form" style="padding:12px; margin-bottom:10px;">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div class="bc-form-title">📦 Selecionar Carga</div>
          <button class="bc-btn bc-btn-sm" id="bc-disparo-reload-cargas" style="background:#e5e7eb; color:#374151; font-size:10px; padding:4px 8px;">
            🔄 Atualizar
          </button>
        </div>
        <select id="bc-disparo-carga" style="width:100%; padding:8px 12px; border:1px solid #d1d5db; border-radius:8px; font-size:13px; font-family:inherit;">
          <option value="">-- Selecione uma carga aberta --</option>
        </select>
        <div id="bc-disparo-carga-preview" style="margin-top:8px;"></div>
      </div>

      <!-- Destinatarios -->
      <div class="bc-form" style="padding:12px; margin-bottom:10px;">
        <div class="bc-form-title">👥 Destinatarios do Disparo</div>

        <!-- Tabs: Base / Manual / Grupos -->
        <div style="display:flex; gap:4px; margin-bottom:10px; background:white; border-radius:8px; padding:3px; border:1px solid #e5e7eb;">
          <button class="bc-disparo-tab active" data-dtab="base" style="
            flex:1; padding:6px; border:none; border-radius:6px; font-size:10px; font-weight:600; cursor:pointer; font-family:inherit;
            background:#2563eb; color:white;
          ">📋 Base</button>
          <button class="bc-disparo-tab" data-dtab="manual" style="
            flex:1; padding:6px; border:none; border-radius:6px; font-size:10px; font-weight:600; cursor:pointer; font-family:inherit;
            background:transparent; color:#6b7280;
          ">✏️ Manual</button>
          <button class="bc-disparo-tab" data-dtab="grupos" style="
            flex:1; padding:6px; border:none; border-radius:6px; font-size:10px; font-weight:600; cursor:pointer; font-family:inherit;
            background:transparent; color:#6b7280;
          ">👥 Grupos</button>
        </div>

        <!-- Tab Base: Filtros e selecao da base -->
        <div id="bc-disparo-tab-base">
          <div class="bc-form-row">
            <div class="bc-form-group">
              <label>Veiculo</label>
              <select id="bc-disparo-veiculo">
                <option value="">Todos</option>
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
            <div class="bc-form-group">
              <label>Carroceria</label>
              <select id="bc-disparo-carroceria">
                <option value="">Todas</option>
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
          </div>
          <div class="bc-form-row">
            <div class="bc-form-group">
              <label>Regiao</label>
              <select id="bc-disparo-regiao">
                <option value="">Todas</option>
                <option value="Sul">Sul</option>
                <option value="Sudeste">Sudeste</option>
                <option value="Centro-Oeste">Centro-Oeste</option>
                <option value="Nordeste">Nordeste</option>
                <option value="Norte">Norte</option>
              </select>
            </div>
            <div class="bc-form-group">
              <label>Etiqueta</label>
              <select id="bc-disparo-etiqueta">
                <option value="">Todas</option>
                <option value="Novo">Novo</option>
                <option value="Negociando">Negociando</option>
                <option value="Fechado">Fechado</option>
                <option value="VIP">VIP</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>
          <div class="bc-form-group">
            <label>Buscar por Rota</label>
            <input type="text" id="bc-disparo-rota" placeholder="Ex: SP, RJ, MG...">
          </div>
          <button class="bc-btn bc-btn-primary bc-btn-sm" id="bc-disparo-filtrar" style="margin-top:8px; width:100%;">
            🔍 Filtrar e Selecionar
          </button>
          <div id="bc-disparo-base-resultado" style="margin-top:8px;"></div>
        </div>

        <!-- Tab Manual: Adicionar motorista avulso -->
        <div id="bc-disparo-tab-manual" style="display:none;">
          <div class="bc-form-group">
            <label>Nome</label>
            <input type="text" id="bc-disparo-manual-nome" placeholder="Nome do motorista">
          </div>
          <div class="bc-form-group">
            <label>Telefone (WhatsApp)</label>
            <input type="text" id="bc-disparo-manual-telefone" placeholder="(11) 99999-9999">
          </div>
          <button class="bc-btn bc-btn-success bc-btn-sm" id="bc-disparo-manual-add" style="width:100%; margin-top:6px;">
            ➕ Adicionar a Lista
          </button>
        </div>

        <!-- Tab Grupos: Grupos WhatsApp -->
        <div id="bc-disparo-tab-grupos" style="display:none;">
          <div style="font-size:11px; color:#6b7280; margin-bottom:8px;">
            Selecione grupos do WhatsApp para enviar a demanda de carga.
          </div>
          <button class="bc-btn bc-btn-sm" id="bc-disparo-detectar-grupos" style="width:100%; background:#25d366; color:white;">
            🔍 Detectar Meus Grupos
          </button>
          <div id="bc-disparo-grupos-lista" style="margin-top:8px;"></div>
        </div>
      </div>

      <!-- Lista de selecionados -->
      <div class="bc-form" style="padding:12px; margin-bottom:10px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
          <div class="bc-form-title" style="margin:0;">📋 Selecionados (<span id="bc-disparo-count">0</span>)</div>
          <button class="bc-btn bc-btn-sm" id="bc-disparo-limpar" style="background:#fee2e2; color:#ef4444; font-size:10px; padding:3px 8px;">
            🗑️ Limpar
          </button>
        </div>
        <div id="bc-disparo-selecionados" style="max-height:120px; overflow-y:auto;"></div>
      </div>

      <!-- Mensagem template -->
      <div class="bc-form" style="padding:12px; margin-bottom:10px;">
        <div class="bc-form-title">📝 Mensagem do Disparo</div>
        <textarea id="bc-disparo-mensagem" style="width:100%; min-height:100px; padding:10px; border:1px solid #d1d5db; border-radius:8px; font-size:12px; font-family:inherit; line-height:1.5;" placeholder="A mensagem sera gerada automaticamente ao selecionar uma carga"></textarea>
        <div style="display:flex; gap:4px; margin-top:6px; flex-wrap:wrap;">
          <span style="background:#dbeafe; color:#1e40af; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:600;">{nome}</span>
          <span style="background:#dbeafe; color:#1e40af; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:600;">{origem}</span>
          <span style="background:#dbeafe; color:#1e40af; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:600;">{destino}</span>
          <span style="background:#dbeafe; color:#1e40af; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:600;">{valor}</span>
        </div>
      </div>

      <!-- Botao de disparo -->
      <button class="bc-btn bc-btn-success bc-btn-full" id="bc-disparo-iniciar" style="padding:14px; font-size:14px;" disabled>
        📢 Selecione destinatarios
      </button>

      <!-- Progresso -->
      <div id="bc-disparo-progresso" style="margin-top:10px; display:none;"></div>
    `;

    this.carregarCargas();
    this.setupEventListeners();
    this.renderSelecionados();
  },

  carregarCargas() {
    BotCargaStorage.getCargas((cargas) => {
      const select = document.getElementById('bc-disparo-carga');
      if (!select) return;
      // Limpa opcoes anteriores (mantendo placeholder)
      while (select.options.length > 1) select.remove(1);
      const abertas = cargas.filter(c => c.status === 'aberta');
      abertas.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.origem} ➡ ${c.destino} ${c.valor ? '- R$ ' + c.valor : ''}`;
        select.appendChild(opt);
      });
      this.refreshCustomSelect(select);
    });
  },

  refreshCustomSelect(select) {
    const wrapper = select.parentNode && select.parentNode.querySelector('.bc-cs-wrapper');
    if (wrapper) wrapper.remove();
    select.classList.remove('bc-cs-done');
    select.style.cssText = '';
    BotCargaSidebar.initCustomSelects();
  },

  setupEventListeners() {
    // Carga select change
    const selectCarga = document.getElementById('bc-disparo-carga');
    if (selectCarga) selectCarga.addEventListener('change', () => this.onCargaSelecionada());

    // Reload cargas
    document.getElementById('bc-disparo-reload-cargas').addEventListener('click', () => {
      this.carregarCargas();
      BotCargaSidebar.showToast('Cargas atualizadas!');
    });

    // Tabs de destinatarios
    document.querySelectorAll('.bc-disparo-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.bc-disparo-tab').forEach(t => {
          t.style.background = 'transparent';
          t.style.color = '#6b7280';
          t.classList.remove('active');
        });
        tab.style.background = '#2563eb';
        tab.style.color = 'white';
        tab.classList.add('active');
        // Mostra tab correspondente
        document.getElementById('bc-disparo-tab-base').style.display = 'none';
        document.getElementById('bc-disparo-tab-manual').style.display = 'none';
        document.getElementById('bc-disparo-tab-grupos').style.display = 'none';
        document.getElementById(`bc-disparo-tab-${tab.dataset.dtab}`).style.display = 'block';
      });
    });

    // Filtrar motoristas da base
    document.getElementById('bc-disparo-filtrar').addEventListener('click', () => this.filtrarMotoristas());

    // Adicionar manual
    document.getElementById('bc-disparo-manual-add').addEventListener('click', () => this.addManual());

    // Detectar grupos
    document.getElementById('bc-disparo-detectar-grupos').addEventListener('click', () => this.detectarGrupos());

    // Limpar selecionados
    document.getElementById('bc-disparo-limpar').addEventListener('click', () => {
      this.motoristasSelecao = [];
      this.renderSelecionados();
    });

    // Iniciar disparo
    document.getElementById('bc-disparo-iniciar').addEventListener('click', () => this.iniciarDisparo());
  },

  onCargaSelecionada() {
    const cargaId = document.getElementById('bc-disparo-carga').value;
    if (!cargaId) {
      document.getElementById('bc-disparo-carga-preview').innerHTML = '';
      document.getElementById('bc-disparo-mensagem').value = '';
      return;
    }

    BotCargaStorage.getCargas((cargas) => {
      const carga = cargas.find(c => c.id === cargaId);
      if (!carga) return;

      document.getElementById('bc-disparo-carga-preview').innerHTML = `
        <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:8px; font-size:11px; color:#374151;">
          <strong>${carga.origem} ➡ ${carga.destino}</strong><br>
          ${carga.tipoCarga ? carga.tipoCarga + ' | ' : ''}${carga.peso ? carga.peso + ' ton | ' : ''}${carga.veiculo || ''}${carga.carroceria ? ' - ' + carga.carroceria : ''}${carga.valor ? ' | R$ ' + carga.valor : ''}
        </div>
      `;

      let msg = `🚚 *CARGA DISPONIVEL* 🚚\n\n`;
      msg += `Ola {nome}!\n\n`;
      msg += `📍 *Origem:* ${carga.origem}\n`;
      msg += `🏁 *Destino:* ${carga.destino}\n`;
      if (carga.tipoCarga) msg += `📦 *Tipo:* ${carga.tipoCarga}\n`;
      if (carga.peso) msg += `⚖️ *Peso:* ${carga.peso} ton\n`;
      if (carga.veiculo) msg += `🚚 *Veiculo:* ${carga.veiculo}${carga.carroceria ? ' - ' + carga.carroceria : ''}\n`;
      if (carga.valor) msg += `💰 *Valor:* R$ ${carga.valor}\n`;
      if (carga.dataColeta) msg += `📅 *Coleta:* ${this.formatarData(carga.dataColeta)}\n`;
      msg += `\n_Interessado? Responda esta mensagem!_`;

      document.getElementById('bc-disparo-mensagem').value = msg;
      this.atualizarBotaoDisparo();
    });
  },

  // ========== FILTRAR BASE ==========
  filtrarMotoristas() {
    const veiculo = document.getElementById('bc-disparo-veiculo').value;
    const carroceria = document.getElementById('bc-disparo-carroceria').value;
    const regiao = document.getElementById('bc-disparo-regiao').value;
    const etiqueta = document.getElementById('bc-disparo-etiqueta').value;
    const rota = document.getElementById('bc-disparo-rota').value.trim().toLowerCase();

    BotCargaStorage.getMotoristas((motoristas) => {
      let filtered = motoristas;
      if (veiculo) filtered = filtered.filter(m => m.veiculo === veiculo);
      if (carroceria) filtered = filtered.filter(m => m.carroceria === carroceria);
      if (regiao) filtered = filtered.filter(m => m.regiao === regiao);
      if (etiqueta) filtered = filtered.filter(m => m.etiqueta === etiqueta);
      if (rota) filtered = filtered.filter(m => m.rota && m.rota.toLowerCase().includes(rota));

      this.motoristasBase = filtered;
      this.renderBaseResultado(filtered, motoristas.length);
    });
  },

  renderBaseResultado(motoristas, total) {
    const container = document.getElementById('bc-disparo-base-resultado');
    if (motoristas.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:10px; color:#9ca3af; font-size:12px;">Nenhum motorista encontrado</div>`;
      return;
    }

    // Verifica quais ja estao na selecao
    const selIds = new Set(this.motoristasSelecao.map(m => m.id || m.telefone));

    container.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
        <span style="font-size:11px; color:#6b7280;">${motoristas.length} de ${total} motoristas</span>
        <button class="bc-btn bc-btn-sm bc-btn-success" id="bc-disparo-add-todos" style="font-size:10px; padding:3px 8px;">
          ✅ Adicionar Todos
        </button>
      </div>
      <div style="max-height:180px; overflow-y:auto; background:white; border:1px solid #e5e7eb; border-radius:8px;">
        ${motoristas.map(m => {
          const jaAdicionado = selIds.has(m.id) || selIds.has(m.telefone);
          return `
            <div style="padding:6px 10px; border-bottom:1px solid #f0f2f5; font-size:11px; display:flex; justify-content:space-between; align-items:center; ${jaAdicionado ? 'opacity:0.5;' : ''}">
              <div>
                <strong>${this.escapeHtml(m.nome)}</strong>
                <span style="color:#6b7280;"> - ${this.escapeHtml(m.telefone)}</span>
                <div style="font-size:9px; color:#9ca3af;">${this.escapeHtml(m.veiculo || '')} ${m.rota ? '| ' + this.escapeHtml(m.rota) : ''}</div>
              </div>
              ${jaAdicionado
                ? '<span style="font-size:9px; color:#10b981; font-weight:600;">✅ Adicionado</span>'
                : `<button class="bc-btn-icon" data-action="add-motorista-base" data-idx="${motoristas.indexOf(m)}" style="width:26px; height:26px; background:#dcfce7; color:#16a34a; font-size:12px; border:none; border-radius:6px; cursor:pointer;">+</button>`
              }
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Add individual
    container.querySelectorAll('[data-action="add-motorista-base"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const m = motoristas[idx];
        if (m) {
          this.addMotoristaSelecao({ id: m.id, nome: m.nome, telefone: m.telefone, tipo: 'motorista' });
          this.renderBaseResultado(motoristas, total); // refresh
        }
      });
    });

    // Add todos
    document.getElementById('bc-disparo-add-todos').addEventListener('click', () => {
      motoristas.forEach(m => {
        this.addMotoristaSelecao({ id: m.id, nome: m.nome, telefone: m.telefone, tipo: 'motorista' });
      });
      this.renderBaseResultado(motoristas, total);
      BotCargaSidebar.showToast(`${motoristas.length} motoristas adicionados!`);
    });
  },

  // ========== MANUAL ==========
  addManual() {
    const nome = document.getElementById('bc-disparo-manual-nome').value.trim();
    const telefone = document.getElementById('bc-disparo-manual-telefone').value.trim();
    if (!nome || !telefone) {
      BotCargaSidebar.showToast('Preencha nome e telefone!');
      return;
    }
    this.addMotoristaSelecao({ id: 'manual_' + Date.now(), nome, telefone, tipo: 'manual' });
    document.getElementById('bc-disparo-manual-nome').value = '';
    document.getElementById('bc-disparo-manual-telefone').value = '';
    BotCargaSidebar.showToast(`${nome} adicionado!`);
  },

  // ========== GRUPOS WHATSAPP ==========
  detectarGrupos() {
    const container = document.getElementById('bc-disparo-grupos-lista');
    container.innerHTML = `<div style="text-align:center; padding:10px; color:#6b7280; font-size:12px;">🔍 Buscando grupos...</div>`;

    // Busca grupos na lista de conversas do WhatsApp
    setTimeout(() => {
      const grupos = [];
      // WhatsApp Web: grupos tem icone de grupo e titulo no span[title]
      const chatItems = document.querySelectorAll('#pane-side [role="listitem"], #pane-side [data-id]');

      chatItems.forEach(item => {
        const titleSpan = item.querySelector('span[title]');
        if (!titleSpan) return;
        const title = titleSpan.getAttribute('title') || '';

        // Detecta se e grupo (geralmente tem icone de grupo ou data-id com @g.us)
        const dataId = item.getAttribute('data-id') || '';
        const isGroup = dataId.includes('@g.us')
          || item.querySelector('[data-icon="default-group"]')
          || item.querySelector('[data-icon="group"]');

        if (isGroup || title.includes(' - ') || title.includes('|')) {
          // Heuristica: nomes com separadores costumam ser grupos
          grupos.push({ nome: title, dataId: dataId });
        }
      });

      // Tenta outra abordagem se nao encontrou
      if (grupos.length === 0) {
        const allChats = document.querySelectorAll('#pane-side span[title]');
        allChats.forEach(span => {
          const title = span.getAttribute('title') || '';
          // Grupos geralmente tem nomes mais longos ou com emojis/separadores
          if (title.length > 15 || title.includes('🚚') || title.includes('CARGA') || title.includes('FRETE') || title.includes('grupo') || title.includes('Grupo')) {
            grupos.push({ nome: title, dataId: '' });
          }
        });
      }

      this.gruposWhatsApp = grupos;

      if (grupos.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:12px; color:#9ca3af; font-size:12px;">
            Nenhum grupo detectado. Abra o WhatsApp e role a lista de conversas para carregar os grupos.
          </div>
        `;
        return;
      }

      const selIds = new Set(this.motoristasSelecao.filter(m => m.tipo === 'grupo').map(m => m.nome));

      container.innerHTML = `
        <div style="max-height:180px; overflow-y:auto; background:white; border:1px solid #e5e7eb; border-radius:8px;">
          ${grupos.map((g, i) => {
            const jaAdicionado = selIds.has(g.nome);
            return `
              <div style="padding:8px 10px; border-bottom:1px solid #f0f2f5; display:flex; justify-content:space-between; align-items:center; ${jaAdicionado ? 'opacity:0.5;' : ''}">
                <div>
                  <div style="font-size:12px; font-weight:600; color:#1a1a2e;">👥 ${this.escapeHtml(g.nome)}</div>
                </div>
                ${jaAdicionado
                  ? '<span style="font-size:9px; color:#10b981; font-weight:600;">✅</span>'
                  : `<button class="bc-btn-icon" data-action="add-grupo" data-idx="${i}" style="width:26px; height:26px; background:#dcfce7; color:#16a34a; font-size:12px; border:none; border-radius:6px; cursor:pointer;">+</button>`
                }
              </div>
            `;
          }).join('')}
        </div>
      `;

      container.querySelectorAll('[data-action="add-grupo"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const g = grupos[parseInt(btn.dataset.idx)];
          if (g) {
            this.addMotoristaSelecao({ id: 'grupo_' + Date.now(), nome: g.nome, telefone: '', tipo: 'grupo', dataId: g.dataId });
            this.detectarGrupos(); // refresh
          }
        });
      });
    }, 500);
  },

  // ========== SELECIONADOS ==========
  addMotoristaSelecao(item) {
    // Evita duplicatas
    const exists = this.motoristasSelecao.some(m =>
      (m.id && m.id === item.id) || (m.telefone && m.telefone === item.telefone && item.telefone) || (m.nome === item.nome && m.tipo === 'grupo')
    );
    if (!exists) {
      this.motoristasSelecao.push(item);
      this.renderSelecionados();
    }
  },

  renderSelecionados() {
    const container = document.getElementById('bc-disparo-selecionados');
    const countEl = document.getElementById('bc-disparo-count');
    if (!container || !countEl) return;

    countEl.textContent = this.motoristasSelecao.length;

    if (this.motoristasSelecao.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:8px; color:#9ca3af; font-size:11px;">Nenhum destinatario selecionado</div>`;
      this.atualizarBotaoDisparo();
      return;
    }

    const tipoIcons = { motorista: '🚚', manual: '✏️', grupo: '👥' };

    container.innerHTML = this.motoristasSelecao.map((m, i) => `
      <div style="padding:4px 8px; border-bottom:1px solid #f0f2f5; font-size:11px; display:flex; justify-content:space-between; align-items:center;">
        <span>${tipoIcons[m.tipo] || '👤'} <strong>${this.escapeHtml(m.nome)}</strong> ${m.telefone ? '<span style="color:#6b7280;">' + this.escapeHtml(m.telefone) + '</span>' : ''}</span>
        <button class="bc-btn-icon delete" data-action="remove-sel" data-idx="${i}" style="width:22px; height:22px; font-size:10px; border:none; cursor:pointer;">✖</button>
      </div>
    `).join('');

    container.querySelectorAll('[data-action="remove-sel"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.motoristasSelecao.splice(parseInt(btn.dataset.idx), 1);
        this.renderSelecionados();
      });
    });

    this.atualizarBotaoDisparo();
  },

  atualizarBotaoDisparo() {
    const btn = document.getElementById('bc-disparo-iniciar');
    if (!btn) return;
    const cargaId = document.getElementById('bc-disparo-carga').value;
    const total = this.motoristasSelecao.length;

    if (cargaId && total > 0) {
      btn.disabled = false;
      btn.textContent = `📢 Disparar para ${total} destinatario${total > 1 ? 's' : ''}`;
    } else if (!cargaId) {
      btn.disabled = true;
      btn.textContent = '📢 Selecione uma carga primeiro';
    } else {
      btn.disabled = true;
      btn.textContent = '📢 Selecione destinatarios';
    }
  },

  // ========== DISPARO ==========
  async iniciarDisparo() {
    const mensagem = document.getElementById('bc-disparo-mensagem').value;
    if (!mensagem || this.motoristasSelecao.length === 0) {
      BotCargaSidebar.showToast('Configure a mensagem e selecione destinatarios!');
      return;
    }

    const total = this.motoristasSelecao.length;
    const btnIniciar = document.getElementById('bc-disparo-iniciar');
    const progresso = document.getElementById('bc-disparo-progresso');
    btnIniciar.disabled = true;
    progresso.style.display = 'block';

    let enviados = 0;
    for (let i = 0; i < total; i++) {
      const dest = this.motoristasSelecao[i];
      const msgPersonalizada = mensagem.replace(/\{nome\}/g, dest.nome || 'Motorista');

      const pct = Math.round(((i + 1) / total) * 100);
      progresso.innerHTML = `
        <div style="background:#e5e7eb; border-radius:4px; height:8px; margin-bottom:4px;">
          <div style="background:linear-gradient(90deg,#25d366,#10b981); height:100%; border-radius:4px; width:${pct}%; transition:width 0.3s;"></div>
        </div>
        <div style="font-size:11px; color:#6b7280; text-align:center;">${i + 1} de ${total} (${pct}%) - ${dest.tipo === 'grupo' ? 'Grupo' : 'Enviando para'} ${this.escapeHtml(dest.nome)}</div>
      `;

      if (dest.tipo === 'grupo') {
        await this.enviarParaGrupo(dest, msgPersonalizada);
      } else {
        await this.enviarParaMotorista(dest, msgPersonalizada);
      }
      enviados++;

      // Intervalo humano entre envios
      await this.delay(2000 + Math.random() * 3000);
    }

    progresso.innerHTML = `
      <div style="background:#d1fae5; border-radius:8px; padding:12px; text-align:center;">
        <div style="font-size:16px; margin-bottom:4px;">✅</div>
        <div style="font-size:13px; font-weight:600; color:#065f46;">Disparo concluido! ${enviados} mensagens enviadas.</div>
      </div>
    `;
    btnIniciar.disabled = false;
    btnIniciar.textContent = `📢 Disparar novamente`;
    BotCargaSidebar.showToast(`Disparo concluido! ${enviados} mensagens.`);

    // Registra historico
    BotCargaStorage.getColaboradorAtivo((colabId) => {
      BotCargaStorage.addHistorico({
        tipo: 'disparo',
        colaboradorId: colabId,
        detalhes: `${enviados} mensagens enviadas`,
        destinatarios: total
      });
    });
  },

  async enviarParaMotorista(motorista, mensagem) {
    const numero = motorista.telefone.replace(/\D/g, '');
    const searchBox = document.querySelector('div[contenteditable="true"][data-tab="3"]');
    if (!searchBox) return;

    searchBox.focus();
    searchBox.textContent = '';
    document.execCommand('insertText', false, numero);
    searchBox.dispatchEvent(new Event('input', { bubbles: true }));
    await this.delay(2000);

    // Clica no primeiro resultado
    const results = document.querySelectorAll('span[title]');
    for (const result of results) {
      if (result.title && result.title.includes(numero.slice(-4))) {
        result.click();
        await this.delay(1000);
        break;
      }
    }

    await this.colarEEnviar(mensagem);
  },

  async enviarParaGrupo(grupo, mensagem) {
    // Busca o grupo pelo nome na lista de conversas
    const searchBox = document.querySelector('div[contenteditable="true"][data-tab="3"]');
    if (!searchBox) return;

    searchBox.focus();
    searchBox.textContent = '';
    document.execCommand('insertText', false, grupo.nome);
    searchBox.dispatchEvent(new Event('input', { bubbles: true }));
    await this.delay(2000);

    // Clica no resultado com o nome do grupo
    const results = document.querySelectorAll('span[title]');
    for (const result of results) {
      if (result.title && result.title === grupo.nome) {
        result.click();
        await this.delay(1000);
        break;
      }
    }

    await this.colarEEnviar(mensagem);
  },

  async colarEEnviar(mensagem) {
    const messageBox = document.querySelector('div[contenteditable="true"][data-tab="10"]')
      || document.querySelector('footer div[contenteditable="true"]')
      || document.querySelector('div[contenteditable="true"][role="textbox"]');

    if (!messageBox) return;

    messageBox.focus();
    messageBox.innerHTML = '';

    try {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', mensagem);
      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true, cancelable: true, clipboardData: clipboardData
      });
      messageBox.dispatchEvent(pasteEvent);
    } catch (e) {
      const lines = mensagem.split('\n');
      lines.forEach((line, index) => {
        if (index > 0) {
          messageBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, shiftKey: true, bubbles: true, cancelable: true }));
          messageBox.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, shiftKey: true, bubbles: true }));
        }
        if (line) document.execCommand('insertText', false, line);
      });
    }

    messageBox.dispatchEvent(new Event('input', { bubbles: true }));
    await this.delay(500);

    messageBox.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true
    }));
  },

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
  }
};
