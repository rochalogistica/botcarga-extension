// ============================================
// BotCarga - Módulo de Disparo de Mensagens
// ============================================

const BotCargaDisparo = {
  filtros: {
    veiculo: '',
    carroceria: '',
    regiao: '',
    etiqueta: ''
  },
  mensagemTemplate: '',
  motoristasSelecao: [],

  init() {
    this.render();
  },

  render() {
    const panel = document.getElementById('bc-panel-disparos');
    if (!panel) return;

    panel.innerHTML = `
      <div style="font-size:14px; font-weight:700; color:#1a1a2e; margin-bottom:12px;">\uD83D\uDCE2 Disparo de Mensagens</div>

      <!-- Selecionar Carga para disparo -->
      <div class="bc-form" style="padding:12px; margin-bottom:10px;">
        <div class="bc-form-title">\uD83D\uDCE6 Selecionar Carga</div>
        <select id="bc-disparo-carga" style="width:100%; padding:8px 12px; border:1px solid #d1d5db; border-radius:8px; font-size:13px; font-family:inherit;">
          <option value="">-- Selecione uma carga aberta --</option>
        </select>
        <div id="bc-disparo-carga-preview" style="margin-top:8px;"></div>
      </div>

      <!-- Filtros -->
      <div class="bc-form" style="padding:12px; margin-bottom:10px;">
        <div class="bc-form-title">\uD83D\uDD0D Filtrar Motoristas</div>
        <div class="bc-form-row">
          <div class="bc-form-group">
            <label>Veiculo</label>
            <select id="bc-disparo-veiculo" style="width:100%; padding:6px; border:1px solid #d1d5db; border-radius:6px; font-size:12px;">
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
            <select id="bc-disparo-carroceria" style="width:100%; padding:6px; border:1px solid #d1d5db; border-radius:6px; font-size:12px;">
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
            <select id="bc-disparo-regiao" style="width:100%; padding:6px; border:1px solid #d1d5db; border-radius:6px; font-size:12px;">
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
            <select id="bc-disparo-etiqueta" style="width:100%; padding:6px; border:1px solid #d1d5db; border-radius:6px; font-size:12px;">
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
          <input type="text" id="bc-disparo-rota" placeholder="Ex: SP, RJ, MG..." style="width:100%; padding:6px 10px; border:1px solid #d1d5db; border-radius:6px; font-size:12px;">
        </div>
        <button class="bc-btn bc-btn-primary bc-btn-sm" id="bc-disparo-filtrar" style="margin-top:8px; width:100%;">
          \uD83D\uDD0D Filtrar Motoristas
        </button>
      </div>

      <!-- Resultado dos filtros -->
      <div id="bc-disparo-resultado" style="margin-bottom:10px;"></div>

      <!-- Mensagem template -->
      <div class="bc-form" style="padding:12px; margin-bottom:10px;">
        <div class="bc-form-title">\uD83D\uDCDD Mensagem do Disparo</div>
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
        \uD83D\uDCE2 Selecione uma carga e filtre motoristas
      </button>

      <!-- Progresso -->
      <div id="bc-disparo-progresso" style="margin-top:10px; display:none;"></div>
    `;

    this.carregarCargas();
    this.setupEventListeners();
  },

  carregarCargas() {
    BotCargaStorage.getCargas((cargas) => {
      const select = document.getElementById('bc-disparo-carga');
      if (!select) return;
      const abertas = cargas.filter(c => c.status === 'aberta');
      abertas.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.origem} \u27A1 ${c.destino} ${c.valor ? '- R$ ' + c.valor : ''}`;
        select.appendChild(opt);
      });
    });
  },

  setupEventListeners() {
    const selectCarga = document.getElementById('bc-disparo-carga');
    if (selectCarga) {
      selectCarga.addEventListener('change', () => this.onCargaSelecionada());
    }

    const btnFiltrar = document.getElementById('bc-disparo-filtrar');
    if (btnFiltrar) {
      btnFiltrar.addEventListener('click', () => this.filtrarMotoristas());
    }

    const btnIniciar = document.getElementById('bc-disparo-iniciar');
    if (btnIniciar) {
      btnIniciar.addEventListener('click', () => this.iniciarDisparo());
    }
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
          <strong>${carga.origem} \u27A1 ${carga.destino}</strong><br>
          ${carga.tipoCarga ? carga.tipoCarga + ' | ' : ''}${carga.peso ? carga.peso + ' ton | ' : ''}${carga.veiculo || ''}${carga.valor ? ' | R$ ' + carga.valor : ''}
        </div>
      `;

      // Gerar mensagem template
      let msg = `\uD83D\uDE9A *CARGA DISPONIVEL* \uD83D\uDE9A\n\n`;
      msg += `Ola {nome}!\n\n`;
      msg += `\uD83D\uDCCD *Origem:* ${carga.origem}\n`;
      msg += `\uD83C\uDFC1 *Destino:* ${carga.destino}\n`;
      if (carga.tipoCarga) msg += `\uD83D\uDCE6 *Tipo:* ${carga.tipoCarga}\n`;
      if (carga.peso) msg += `\u2696\uFE0F *Peso:* ${carga.peso} ton\n`;
      if (carga.veiculo) msg += `\uD83D\uDE9A *Veiculo:* ${carga.veiculo}\n`;
      if (carga.valor) msg += `\uD83D\uDCB0 *Valor:* R$ ${carga.valor}\n`;
      if (carga.dataColeta) msg += `\uD83D\uDCC5 *Coleta:* ${this.formatarData(carga.dataColeta)}\n`;
      msg += `\n_Interessado? Responda esta mensagem!_`;

      document.getElementById('bc-disparo-mensagem').value = msg;
    });
  },

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

      this.motoristasSelecao = filtered;
      this.renderResultado(filtered, motoristas.length);
    });
  },

  renderResultado(motoristas, total) {
    const container = document.getElementById('bc-disparo-resultado');
    const btnIniciar = document.getElementById('bc-disparo-iniciar');

    if (motoristas.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:16px; color:#9ca3af; font-size:13px;">
          Nenhum motorista encontrado com esses filtros
        </div>
      `;
      btnIniciar.disabled = true;
      btnIniciar.textContent = '\uD83D\uDCE2 Nenhum motorista selecionado';
      return;
    }

    // Stats
    container.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-bottom:8px;">
        <div style="background:white; border:1px solid #e5e7eb; border-radius:8px; padding:8px; text-align:center;">
          <div style="font-size:18px; font-weight:700; color:#2563eb;">${motoristas.length}</div>
          <div style="font-size:10px; color:#6b7280;">Selecionados</div>
        </div>
        <div style="background:white; border:1px solid #e5e7eb; border-radius:8px; padding:8px; text-align:center;">
          <div style="font-size:18px; font-weight:700; color:#6b7280;">${total}</div>
          <div style="font-size:10px; color:#6b7280;">Total Base</div>
        </div>
        <div style="background:white; border:1px solid #e5e7eb; border-radius:8px; padding:8px; text-align:center;">
          <div style="font-size:18px; font-weight:700; color:#10b981;">${Math.round(motoristas.length / total * 100)}%</div>
          <div style="font-size:10px; color:#6b7280;">da Base</div>
        </div>
      </div>
      <div style="max-height:150px; overflow-y:auto; background:white; border:1px solid #e5e7eb; border-radius:8px;">
        ${motoristas.map(m => `
          <div style="padding:6px 10px; border-bottom:1px solid #f0f2f5; font-size:11px; display:flex; justify-content:space-between; align-items:center;">
            <span><strong>${this.escapeHtml(m.nome)}</strong> - ${this.escapeHtml(m.telefone)}</span>
            <span style="font-size:10px; color:#6b7280;">${this.escapeHtml(m.veiculo || '')} ${this.escapeHtml(m.rota || '')}</span>
          </div>
        `).join('')}
      </div>
    `;

    const cargaId = document.getElementById('bc-disparo-carga').value;
    if (cargaId && motoristas.length > 0) {
      btnIniciar.disabled = false;
      btnIniciar.textContent = `\uD83D\uDCE2 Disparar para ${motoristas.length} motorista${motoristas.length > 1 ? 's' : ''}`;
    } else {
      btnIniciar.disabled = true;
      btnIniciar.textContent = '\uD83D\uDCE2 Selecione uma carga primeiro';
    }
  },

  async iniciarDisparo() {
    const mensagem = document.getElementById('bc-disparo-mensagem').value;
    if (!mensagem || this.motoristasSelecao.length === 0) {
      BotCargaSidebar.showToast('Configure a mensagem e selecione motoristas!');
      return;
    }

    const total = this.motoristasSelecao.length;
    const btnIniciar = document.getElementById('bc-disparo-iniciar');
    const progresso = document.getElementById('bc-disparo-progresso');
    btnIniciar.disabled = true;
    progresso.style.display = 'block';

    for (let i = 0; i < total; i++) {
      const motorista = this.motoristasSelecao[i];
      const msgPersonalizada = mensagem.replace(/\{nome\}/g, motorista.nome || 'Motorista');

      // Atualiza progresso
      const pct = Math.round(((i + 1) / total) * 100);
      progresso.innerHTML = `
        <div style="background:#e5e7eb; border-radius:4px; height:8px; margin-bottom:4px;">
          <div style="background:linear-gradient(90deg,#25d366,#10b981); height:100%; border-radius:4px; width:${pct}%; transition:width 0.3s;"></div>
        </div>
        <div style="font-size:11px; color:#6b7280; text-align:center;">${i + 1} de ${total} (${pct}%) - Enviando para ${this.escapeHtml(motorista.nome)}</div>
      `;

      // Busca conversa do motorista e cola mensagem
      await this.enviarParaMotorista(motorista, msgPersonalizada);

      // Aguarda entre envios (simula intervalo humano)
      await this.delay(2000 + Math.random() * 3000);
    }

    progresso.innerHTML = `
      <div style="background:#d1fae5; border-radius:8px; padding:12px; text-align:center;">
        <div style="font-size:16px; margin-bottom:4px;">\u2705</div>
        <div style="font-size:13px; font-weight:600; color:#065f46;">Disparo concluido! ${total} mensagens enviadas.</div>
      </div>
    `;
    btnIniciar.disabled = false;
    btnIniciar.textContent = `\uD83D\uDCE2 Disparar novamente`;
    BotCargaSidebar.showToast(`Disparo concluido! ${total} mensagens.`);
  },

  async enviarParaMotorista(motorista, mensagem) {
    const numero = motorista.telefone.replace(/\D/g, '');

    // Busca na lista de conversas
    const searchBox = document.querySelector('div[contenteditable="true"][data-tab="3"]');
    if (searchBox) {
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

      // Cola a mensagem
      const messageBox = document.querySelector('div[contenteditable="true"][data-tab="10"]')
        || document.querySelector('footer div[contenteditable="true"]')
        || document.querySelector('div[contenteditable="true"][role="textbox"]');

      if (messageBox) {
        messageBox.focus();
        document.execCommand('insertText', false, mensagem);
        messageBox.dispatchEvent(new Event('input', { bubbles: true }));

        await this.delay(500);

        // Envia (pressiona Enter)
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true
        });
        messageBox.dispatchEvent(enterEvent);
      }
    }
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
