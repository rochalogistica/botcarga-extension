// ============================================
// BotCarga - Módulo de Storage
// ============================================

const BotCargaStorage = {
  // --- Motoristas ---
  getMotoristas(callback) {
    chrome.storage.local.get(['motoristas'], (data) => {
      callback(data.motoristas || []);
    });
  },

  saveMotoristas(motoristas, callback) {
    chrome.storage.local.set({ motoristas }, callback);
  },

  addMotorista(motorista, callback) {
    this.getMotoristas((motoristas) => {
      motorista.id = Date.now().toString();
      motorista.criadoEm = new Date().toISOString();
      motoristas.push(motorista);
      this.saveMotoristas(motoristas, () => callback(motorista));
    });
  },

  updateMotorista(id, dados, callback) {
    this.getMotoristas((motoristas) => {
      const index = motoristas.findIndex(m => m.id === id);
      if (index !== -1) {
        motoristas[index] = { ...motoristas[index], ...dados };
        this.saveMotoristas(motoristas, () => callback(motoristas[index]));
      }
    });
  },

  deleteMotorista(id, callback) {
    this.getMotoristas((motoristas) => {
      const filtered = motoristas.filter(m => m.id !== id);
      this.saveMotoristas(filtered, callback);
    });
  },

  // --- Cargas ---
  getCargas(callback) {
    chrome.storage.local.get(['cargas'], (data) => {
      callback(data.cargas || []);
    });
  },

  saveCargas(cargas, callback) {
    chrome.storage.local.set({ cargas }, callback);
  },

  addCarga(carga, callback) {
    this.getCargas((cargas) => {
      carga.id = Date.now().toString();
      carga.criadoEm = new Date().toISOString();
      carga.status = 'aberta';
      cargas.push(carga);
      this.saveCargas(cargas, () => callback(carga));
    });
  },

  updateCarga(id, dados, callback) {
    this.getCargas((cargas) => {
      const index = cargas.findIndex(c => c.id === id);
      if (index !== -1) {
        cargas[index] = { ...cargas[index], ...dados };
        this.saveCargas(cargas, () => callback(cargas[index]));
      }
    });
  },

  deleteCarga(id, callback) {
    this.getCargas((cargas) => {
      const filtered = cargas.filter(c => c.id !== id);
      this.saveCargas(filtered, callback);
    });
  },

  // --- Interessados ---
  getInteressados(callback) {
    chrome.storage.local.get(['interessados'], (data) => {
      callback(data.interessados || []);
    });
  },

  saveInteressados(interessados, callback) {
    chrome.storage.local.set({ interessados }, callback);
  },

  addInteressado(dados, callback) {
    this.getInteressados((interessados) => {
      dados.id = Date.now().toString();
      dados.criadoEm = new Date().toISOString();
      interessados.push(dados);
      this.saveInteressados(interessados, () => callback(dados));
    });
  },

  getInteressadosPorCarga(cargaId, callback) {
    this.getInteressados((interessados) => {
      callback(interessados.filter(i => i.cargaId === cargaId));
    });
  },

  deleteInteressado(id, callback) {
    this.getInteressados((interessados) => {
      const filtered = interessados.filter(i => i.id !== id);
      this.saveInteressados(filtered, callback);
    });
  },

  getInteressadosContagem(callback) {
    this.getInteressados((interessados) => {
      const contagem = {};
      interessados.forEach(i => {
        contagem[i.cargaId] = (contagem[i.cargaId] || 0) + 1;
      });
      callback(contagem);
    });
  },

  // --- Colaboradores ---
  getColaboradores(callback) {
    chrome.storage.local.get(['colaboradores'], (data) => {
      callback(data.colaboradores || []);
    });
  },

  saveColaboradores(colaboradores, callback) {
    chrome.storage.local.set({ colaboradores }, callback);
  },

  addColaborador(dados, callback) {
    this.getColaboradores((colaboradores) => {
      dados.id = Date.now().toString();
      dados.criadoEm = new Date().toISOString();
      dados.ativo = true;
      colaboradores.push(dados);
      this.saveColaboradores(colaboradores, () => callback(dados));
    });
  },

  updateColaborador(id, dados, callback) {
    this.getColaboradores((colaboradores) => {
      const index = colaboradores.findIndex(c => c.id === id);
      if (index !== -1) {
        colaboradores[index] = { ...colaboradores[index], ...dados };
        this.saveColaboradores(colaboradores, () => callback(colaboradores[index]));
      }
    });
  },

  deleteColaborador(id, callback) {
    this.getColaboradores((colaboradores) => {
      const filtered = colaboradores.filter(c => c.id !== id);
      this.saveColaboradores(filtered, callback);
    });
  },

  // --- Historico de Acoes (logs) ---
  getHistorico(callback) {
    chrome.storage.local.get(['historico'], (data) => {
      callback(data.historico || []);
    });
  },

  saveHistorico(historico, callback) {
    chrome.storage.local.set({ historico }, callback);
  },

  addHistorico(dados, callback) {
    this.getHistorico((historico) => {
      dados.id = Date.now().toString();
      dados.timestamp = new Date().toISOString();
      historico.push(dados);
      // Manter apenas ultimos 500 registros
      if (historico.length > 500) historico = historico.slice(-500);
      this.saveHistorico(historico, () => { if (callback) callback(dados); });
    });
  },

  // --- Colaborador Ativo ---
  getColaboradorAtivo(callback) {
    chrome.storage.local.get(['colaboradorAtivo'], (data) => {
      callback(data.colaboradorAtivo || null);
    });
  },

  setColaboradorAtivo(colaboradorId, callback) {
    chrome.storage.local.set({ colaboradorAtivo: colaboradorId }, callback);
  },

  // --- Dashboard Data (agrega tudo) ---
  getDashboardData(callback) {
    this.getCargas((cargas) => {
      this.getMotoristas((motoristas) => {
        this.getInteressados((interessados) => {
          this.getColaboradores((colaboradores) => {
            this.getHistorico((historico) => {
              callback({ cargas, motoristas, interessados, colaboradores, historico });
            });
          });
        });
      });
    });
  }
};
