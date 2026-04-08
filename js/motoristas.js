// ============================================
// BotCarga - Módulo de Motoristas
// ============================================

const BotCargaMotoristas = {
  searchTerm: '',
  editingId: null,

  init() {
    this.render();
  },

  render() {
    const panel = document.getElementById('bc-panel-motoristas');
    panel.innerHTML = `
      <div class="bc-search">
        <span class="bc-search-icon">\uD83D\uDD0D</span>
        <input type="text" id="bc-search-motorista" placeholder="Buscar motorista por nome ou rota..." value="${this.searchTerm}">
      </div>
      <button class="bc-btn bc-btn-primary bc-btn-full" id="bc-add-motorista">
        + Novo Motorista
      </button>
      <div id="bc-form-motorista-container" style="margin-top: 12px;"></div>
      <div id="bc-lista-motoristas" style="margin-top: 12px;"></div>
    `;

    document.getElementById('bc-search-motorista').addEventListener('input', (e) => {
      this.searchTerm = e.target.value;
      this.renderLista();
    });

    document.getElementById('bc-add-motorista').addEventListener('click', () => {
      this.editingId = null;
      this.showForm();
    });

    this.renderLista();
  },

  showForm(motorista = null) {
    const container = document.getElementById('bc-form-motorista-container');
    container.innerHTML = `
      <div class="bc-form">
        <div class="bc-form-title">${motorista ? '\u270F\uFE0F Editar Motorista' : '\u2795 Novo Motorista'}</div>
        <div class="bc-form-group">
          <label>Nome Completo</label>
          <input type="text" id="bc-mot-nome" placeholder="Ex: Joao Silva" value="${motorista ? motorista.nome : ''}">
        </div>
        <div class="bc-form-row">
          <div class="bc-form-group">
            <label>Telefone (WhatsApp)</label>
            <input type="text" id="bc-mot-telefone" placeholder="(11) 99999-9999" value="${motorista ? motorista.telefone : ''}">
          </div>
          <div class="bc-form-group">
            <label>Tipo Veiculo</label>
            <select id="bc-mot-veiculo">
              <option value="">Selecione</option>
              <option value="Truck" ${motorista && motorista.veiculo === 'Truck' ? 'selected' : ''}>Truck</option>
              <option value="Toco" ${motorista && motorista.veiculo === 'Toco' ? 'selected' : ''}>Toco</option>
              <option value="Carreta" ${motorista && motorista.veiculo === 'Carreta' ? 'selected' : ''}>Carreta</option>
              <option value="Carreta LS" ${motorista && motorista.veiculo === 'Carreta LS' ? 'selected' : ''}>Carreta LS</option>
              <option value="Bitruck" ${motorista && motorista.veiculo === 'Bitruck' ? 'selected' : ''}>Bitruck</option>
              <option value="Bitrem" ${motorista && motorista.veiculo === 'Bitrem' ? 'selected' : ''}>Bitrem</option>
              <option value="Rodotrem" ${motorista && motorista.veiculo === 'Rodotrem' ? 'selected' : ''}>Rodotrem</option>
              <option value="VUC" ${motorista && motorista.veiculo === 'VUC' ? 'selected' : ''}>VUC</option>
              <option value="3/4" ${motorista && motorista.veiculo === '3/4' ? 'selected' : ''}>3/4</option>
              <option value="Van" ${motorista && motorista.veiculo === 'Van' ? 'selected' : ''}>Van</option>
            </select>
          </div>
        </div>
        <div class="bc-form-group">
          <label>Rota de Interesse</label>
          <input type="text" id="bc-mot-rota" placeholder="Ex: SP - RJ, MG - BA" value="${motorista ? motorista.rota : ''}">
        </div>
        <div class="bc-form-row">
          <div class="bc-form-group">
            <label>Carroceria</label>
            <select id="bc-mot-carroceria">
              <option value="">Selecione</option>
              <option value="Bau" ${motorista && motorista.carroceria === 'Bau' ? 'selected' : ''}>Bau</option>
              <option value="Sider" ${motorista && motorista.carroceria === 'Sider' ? 'selected' : ''}>Sider</option>
              <option value="Graneleiro" ${motorista && motorista.carroceria === 'Graneleiro' ? 'selected' : ''}>Graneleiro</option>
              <option value="Tanque" ${motorista && motorista.carroceria === 'Tanque' ? 'selected' : ''}>Tanque</option>
              <option value="Plataforma" ${motorista && motorista.carroceria === 'Plataforma' ? 'selected' : ''}>Plataforma</option>
              <option value="Cacamba" ${motorista && motorista.carroceria === 'Cacamba' ? 'selected' : ''}>Cacamba</option>
              <option value="Refrigerado" ${motorista && motorista.carroceria === 'Refrigerado' ? 'selected' : ''}>Refrigerado</option>
              <option value="Porta Container" ${motorista && motorista.carroceria === 'Porta Container' ? 'selected' : ''}>Porta Container</option>
            </select>
          </div>
          <div class="bc-form-group">
            <label>Regiao</label>
            <select id="bc-mot-regiao">
              <option value="">Selecione</option>
              <option value="Sul" ${motorista && motorista.regiao === 'Sul' ? 'selected' : ''}>Sul</option>
              <option value="Sudeste" ${motorista && motorista.regiao === 'Sudeste' ? 'selected' : ''}>Sudeste</option>
              <option value="Centro-Oeste" ${motorista && motorista.regiao === 'Centro-Oeste' ? 'selected' : ''}>Centro-Oeste</option>
              <option value="Nordeste" ${motorista && motorista.regiao === 'Nordeste' ? 'selected' : ''}>Nordeste</option>
              <option value="Norte" ${motorista && motorista.regiao === 'Norte' ? 'selected' : ''}>Norte</option>
            </select>
          </div>
        </div>
        <div class="bc-form-group">
          <label>Etiqueta</label>
          <select id="bc-mot-etiqueta">
            <option value="Novo" ${motorista && motorista.etiqueta === 'Novo' ? 'selected' : ''}>Novo</option>
            <option value="Negociando" ${motorista && motorista.etiqueta === 'Negociando' ? 'selected' : ''}>Negociando</option>
            <option value="Fechado" ${motorista && motorista.etiqueta === 'Fechado' ? 'selected' : ''}>Fechado</option>
            <option value="VIP" ${motorista && motorista.etiqueta === 'VIP' ? 'selected' : ''}>VIP</option>
            <option value="Inativo" ${motorista && motorista.etiqueta === 'Inativo' ? 'selected' : ''}>Inativo</option>
          </select>
        </div>
        <div class="bc-form-group">
          <label>Observacoes</label>
          <textarea id="bc-mot-obs" placeholder="Ex: Prefere cargas de retorno, disponivel seg a sex">${motorista ? (motorista.observacoes || '') : ''}</textarea>
        </div>
        <div class="bc-form-actions">
          <button class="bc-btn bc-btn-primary" id="bc-salvar-motorista">
            ${motorista ? 'Atualizar' : 'Salvar'}
          </button>
          <button class="bc-btn" id="bc-cancelar-motorista" style="background: #e5e7eb; color: #374151;">
            Cancelar
          </button>
        </div>
      </div>
    `;

    document.getElementById('bc-salvar-motorista').addEventListener('click', () => this.salvar());
    document.getElementById('bc-cancelar-motorista').addEventListener('click', () => {
      container.innerHTML = '';
      this.editingId = null;
    });
  },

  salvar() {
    const nome = document.getElementById('bc-mot-nome').value.trim();
    const telefone = document.getElementById('bc-mot-telefone').value.trim();
    const veiculo = document.getElementById('bc-mot-veiculo').value;
    const rota = document.getElementById('bc-mot-rota').value.trim();
    const carroceria = document.getElementById('bc-mot-carroceria').value;
    const regiao = document.getElementById('bc-mot-regiao').value;
    const etiqueta = document.getElementById('bc-mot-etiqueta').value;
    const observacoes = document.getElementById('bc-mot-obs').value.trim();

    if (!nome || !telefone) {
      BotCargaSidebar.showToast('Preencha nome e telefone!');
      return;
    }

    const dados = { nome, telefone, veiculo, rota, carroceria, regiao, etiqueta, observacoes };

    if (this.editingId) {
      BotCargaStorage.updateMotorista(this.editingId, dados, () => {
        BotCargaSidebar.showToast('Motorista atualizado!');
        this.editingId = null;
        document.getElementById('bc-form-motorista-container').innerHTML = '';
        this.renderLista();
      });
    } else {
      BotCargaStorage.addMotorista(dados, () => {
        BotCargaSidebar.showToast('Motorista cadastrado!');
        document.getElementById('bc-form-motorista-container').innerHTML = '';
        this.renderLista();
      });
    }
  },

  renderLista() {
    BotCargaStorage.getMotoristas((motoristas) => {
      const container = document.getElementById('bc-lista-motoristas');
      let filtered = motoristas;

      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filtered = motoristas.filter(m =>
          m.nome.toLowerCase().includes(term) ||
          (m.rota && m.rota.toLowerCase().includes(term)) ||
          (m.telefone && m.telefone.includes(term))
        );
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="bc-empty">
            <div class="bc-empty-icon">\uD83D\uDC64</div>
            <p>${this.searchTerm ? 'Nenhum motorista encontrado' : 'Nenhum motorista cadastrado ainda'}</p>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(m => `
        <div class="bc-card" data-id="${m.id}">
          <div class="bc-card-header">
            <div class="bc-card-name">${this.escapeHtml(m.nome)}</div>
            <div class="bc-card-actions">
              <button class="bc-btn-icon send" title="Enviar mensagem" data-action="msg" data-id="${m.id}">\uD83D\uDCAC</button>
              <button class="bc-btn-icon edit" title="Editar" data-action="edit" data-id="${m.id}">\u270F\uFE0F</button>
              <button class="bc-btn-icon delete" title="Excluir" data-action="delete" data-id="${m.id}">\uD83D\uDDD1\uFE0F</button>
            </div>
          </div>
          ${m.etiqueta ? `<span class="bc-status ${m.etiqueta === 'Novo' ? 'coleta' : m.etiqueta === 'Negociando' ? 'aberta' : m.etiqueta === 'Fechado' ? 'viagem' : m.etiqueta === 'VIP' ? 'coleta' : 'finalizada'}" style="margin-left:4px;font-size:10px;">${this.escapeHtml(m.etiqueta)}</span>` : ''}
          <div class="bc-card-info">
            <div class="bc-card-detail">
              <span class="bc-card-detail-icon">\uD83D\uDCF1</span>
              ${this.escapeHtml(m.telefone)}
            </div>
            ${m.veiculo ? `<div class="bc-card-detail"><span class="bc-card-detail-icon">\uD83D\uDE9A</span>${this.escapeHtml(m.veiculo)}${m.carroceria ? ' - ' + this.escapeHtml(m.carroceria) : ''}</div>` : ''}
            ${m.rota ? `<div class="bc-card-detail"><span class="bc-card-detail-icon">\uD83D\uDDFA\uFE0F</span>${this.escapeHtml(m.rota)}</div>` : ''}
            ${m.regiao ? `<div class="bc-card-detail"><span class="bc-card-detail-icon">\uD83C\uDF0E</span>${this.escapeHtml(m.regiao)}</div>` : ''}
            ${m.observacoes ? `<div class="bc-card-detail"><span class="bc-card-detail-icon">\uD83D\uDCDD</span>${this.escapeHtml(m.observacoes)}</div>` : ''}
          </div>
        </div>
      `).join('');

      // Event listeners
      container.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const motorista = motoristas.find(m => m.id === id);
          if (motorista) {
            this.editingId = id;
            this.showForm(motorista);
          }
        });
      });

      container.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (confirm('Tem certeza que deseja excluir este motorista?')) {
            BotCargaStorage.deleteMotorista(btn.dataset.id, () => {
              BotCargaSidebar.showToast('Motorista excluido!');
              this.renderLista();
            });
          }
        });
      });

      container.querySelectorAll('[data-action="msg"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const motorista = motoristas.find(m => m.id === btn.dataset.id);
          if (motorista) {
            this.buscarConversaWhatsApp(motorista.telefone);
          }
        });
      });
    });
  },

  buscarConversaWhatsApp(telefone) {
    // Limpa o telefone para apenas números
    const numero = telefone.replace(/\D/g, '');
    // Tenta buscar na lista de conversas do WhatsApp
    const searchBox = document.querySelector('div[contenteditable="true"][data-tab="3"]');
    if (searchBox) {
      searchBox.focus();
      searchBox.textContent = numero;
      searchBox.dispatchEvent(new Event('input', { bubbles: true }));
      BotCargaSidebar.showToast('Buscando conversa...');
    } else {
      BotCargaSidebar.showToast('Abra o WhatsApp Web primeiro');
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
