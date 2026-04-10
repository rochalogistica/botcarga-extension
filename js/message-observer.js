// ============================================
// BotCarga - Observador de Mensagens WhatsApp
// Auto-detecta interesse de motoristas em cargas
// ============================================

const BotCargaMessageObserver = {
  observer: null,
  processedMessages: new Set(),
  lastCheckTime: Date.now(),

  // Mapa de estados para regioes
  ESTADO_REGIAO: {
    'SP': 'Sudeste', 'RJ': 'Sudeste', 'MG': 'Sudeste', 'ES': 'Sudeste',
    'PR': 'Sul', 'SC': 'Sul', 'RS': 'Sul',
    'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste', 'GO': 'Centro-Oeste', 'DF': 'Centro-Oeste',
    'BA': 'Nordeste', 'SE': 'Nordeste', 'AL': 'Nordeste', 'PE': 'Nordeste',
    'PB': 'Nordeste', 'RN': 'Nordeste', 'CE': 'Nordeste', 'PI': 'Nordeste', 'MA': 'Nordeste',
    'PA': 'Norte', 'AM': 'Norte', 'RO': 'Norte', 'RR': 'Norte',
    'AP': 'Norte', 'TO': 'Norte', 'AC': 'Norte'
  },

  // Mapa de cidades para estados (principais)
  CIDADE_ESTADO: {
    'sao paulo': 'SP', 'rio de janeiro': 'RJ', 'belo horizonte': 'MG',
    'curitiba': 'PR', 'porto alegre': 'RS', 'florianopolis': 'SC',
    'salvador': 'BA', 'recife': 'PE', 'fortaleza': 'CE',
    'brasilia': 'DF', 'goiania': 'GO', 'manaus': 'AM',
    'belem': 'PA', 'vitoria': 'ES', 'natal': 'RN',
    'joao pessoa': 'PB', 'maceio': 'AL', 'aracaju': 'SE',
    'teresina': 'PI', 'sao luis': 'MA', 'cuiaba': 'MT',
    'campo grande': 'MS', 'porto velho': 'RO', 'macapa': 'AP',
    'palmas': 'TO', 'rio branco': 'AC', 'boa vista': 'RR',
    'campinas': 'SP', 'guarulhos': 'SP', 'santos': 'SP',
    'ribeirao preto': 'SP', 'sorocaba': 'SP', 'osasco': 'SP',
    'londrina': 'PR', 'maringa': 'PR', 'cascavel': 'PR',
    'joinville': 'SC', 'blumenau': 'SC',
    'uberlandia': 'MG', 'juiz de fora': 'MG', 'contagem': 'MG',
    'niteroi': 'RJ', 'duque de caxias': 'RJ',
    'feira de santana': 'BA', 'vitoria da conquista': 'BA',
    'caruaru': 'PE', 'petrolina': 'PE',
    'caxias do sul': 'RS', 'pelotas': 'RS',
    'aparecida de goiania': 'GO', 'anapolis': 'GO',
    'rondonopolis': 'MT', 'sinop': 'MT',
    'dourados': 'MS', 'tres lagoas': 'MS',
    'maraba': 'PA', 'santarem': 'PA',
    'imperatriz': 'MA', 'itabuna': 'BA',
    'bauru': 'SP', 'jundiai': 'SP', 'piracicaba': 'SP',
    'sp': 'SP', 'rj': 'RJ', 'mg': 'MG', 'es': 'ES',
    'pr': 'PR', 'sc': 'SC', 'rs': 'RS',
    'ba': 'BA', 'pe': 'PE', 'ce': 'CE', 'ma': 'MA',
    'go': 'GO', 'df': 'DF', 'mt': 'MT', 'ms': 'MS',
    'pa': 'PA', 'am': 'AM', 'to': 'TO', 'ro': 'RO'
  },

  // Palavras-chave de interesse
  INTERESSE_KEYWORDS: [
    'interesse', 'interessado', 'tenho interesse', 'disponivel', 'disponível',
    'aceito', 'quero', 'pego', 'faco', 'faço', 'consigo', 'tenho como',
    'pode me passar', 'manda mais detalhes', 'quanto paga', 'qual valor',
    'tem carga', 'to disponivel', 'estou disponivel', 'estou disponível',
    'carga de', 'carga para', 'pra onde', 'de onde', 'saindo de'
  ],

  init() {
    console.log('[BotCarga] MessageObserver inicializando...');
    // Espera o painel de mensagens estar disponivel
    this.waitForMessagePane();
  },

  waitForMessagePane() {
    const messagePane = document.querySelector('#main');
    if (messagePane) {
      this.startObserving();
    } else {
      setTimeout(() => this.waitForMessagePane(), 3000);
    }
  },

  startObserving() {
    // Observa mudancas no painel principal (troca de conversa e novas mensagens)
    const mainPane = document.querySelector('#main');
    if (!mainPane) {
      setTimeout(() => this.startObserving(), 3000);
      return;
    }

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          this.checkNewMessages(mutation.addedNodes);
        }
      }
    });

    this.observer.observe(mainPane, {
      childList: true,
      subtree: true
    });

    console.log('[BotCarga] MessageObserver ativo - monitorando mensagens');
  },

  checkNewMessages(nodes) {
    nodes.forEach(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      // Busca mensagens recebidas (message-in)
      const messages = node.classList && node.classList.contains('message-in')
        ? [node]
        : (node.querySelectorAll ? Array.from(node.querySelectorAll('.message-in')) : []);

      messages.forEach(msgNode => {
        this.processMessage(msgNode);
      });
    });
  },

  processMessage(msgNode) {
    // Evita processar a mesma mensagem duas vezes
    const msgId = msgNode.getAttribute('data-id') || msgNode.dataset.id;
    const textSpan = msgNode.querySelector('span.selectable-text');
    if (!textSpan) return;

    const texto = textSpan.textContent || textSpan.innerText || '';
    if (!texto || texto.length < 5) return;

    // Gera ID unico baseado no texto + timestamp
    const uniqueId = msgId || this.hashText(texto);
    if (this.processedMessages.has(uniqueId)) return;
    this.processedMessages.add(uniqueId);

    // Limita tamanho do set para nao consumir memoria
    if (this.processedMessages.size > 500) {
      const arr = Array.from(this.processedMessages);
      this.processedMessages = new Set(arr.slice(-250));
    }

    // Verifica se a mensagem indica interesse
    if (this.detectInterest(texto)) {
      this.handleInterest(texto);
    }
  },

  detectInterest(texto) {
    const lower = texto.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // remove acentos

    return this.INTERESSE_KEYWORDS.some(kw => {
      const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return lower.includes(kwNorm);
    });
  },

  handleInterest(texto) {
    // Extrai info do contato atual
    const contactInfo = this.extractContactInfo();
    if (!contactInfo.nome) return;

    // Busca cargas abertas e tenta fazer match
    BotCargaStorage.getCargas((cargas) => {
      const abertas = cargas.filter(c => c.status === 'aberta');
      if (abertas.length === 0) return;

      const matchedCarga = this.matchCarga(texto, abertas);

      if (matchedCarga) {
        this.autoCreateInteressado(matchedCarga, contactInfo, texto);
      } else if (abertas.length === 1) {
        // Se so tem uma carga aberta, assume que o interesse e nela
        this.autoCreateInteressado(abertas[0], contactInfo, texto);
      }
    });
  },

  matchCarga(texto, cargas) {
    const textoLower = texto.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    let bestMatch = null;
    let bestScore = 0;

    cargas.forEach(carga => {
      let score = 0;
      const origemLower = (carga.origem || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const destinoLower = (carga.destino || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      // Verifica se texto menciona origem ou destino
      // Extrai palavras significativas (cidades/estados)
      const origemParts = origemLower.split(/[\s\-,]+/).filter(p => p.length > 1);
      const destinoParts = destinoLower.split(/[\s\-,]+/).filter(p => p.length > 1);

      origemParts.forEach(part => {
        if (textoLower.includes(part) && part.length > 2) score += 3;
      });

      destinoParts.forEach(part => {
        if (textoLower.includes(part) && part.length > 2) score += 3;
      });

      // Bonus se menciona veiculo da carga
      if (carga.veiculo && textoLower.includes(carga.veiculo.toLowerCase())) {
        score += 2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = carga;
      }
    });

    // Score minimo de 3 para considerar match
    return bestScore >= 3 ? bestMatch : null;
  },

  extractContactInfo() {
    const info = { nome: '', telefone: '' };

    // Nome do contato - busca no header da conversa aberta
    const headerTitle = document.querySelector('#main header span[title]');
    if (headerTitle) {
      info.nome = headerTitle.getAttribute('title') || headerTitle.textContent || '';
    }

    // Telefone - tenta extrair do nome (se for numero) ou de outros atributos
    const chatId = document.querySelector('#main header [data-id]');
    if (chatId) {
      const dataId = chatId.getAttribute('data-id') || '';
      const phoneMatch = dataId.match(/(\d{10,15})/);
      if (phoneMatch) info.telefone = phoneMatch[1];
    }

    // Se o nome do contato parece ser um numero de telefone
    if (!info.telefone && info.nome && /^\+?\d[\d\s\-()]{8,}$/.test(info.nome.trim())) {
      info.telefone = info.nome.replace(/\D/g, '');
    }

    // Tenta extrair telefone do link do chat
    if (!info.telefone) {
      const chatLink = document.querySelector('#main header a[href*="phone"]');
      if (chatLink) {
        const href = chatLink.getAttribute('href') || '';
        const phoneMatch = href.match(/(\d{10,15})/);
        if (phoneMatch) info.telefone = phoneMatch[1];
      }
    }

    return info;
  },

  autoCreateInteressado(carga, contactInfo, textoOriginal) {
    // Verifica duplicata antes de criar
    BotCargaStorage.getInteressados((interessados) => {
      const jaExiste = interessados.some(i =>
        i.cargaId === carga.id &&
        (i.nome === contactInfo.nome || (i.telefone && i.telefone === contactInfo.telefone))
      );

      if (jaExiste) return;

      // Pre-diagnostica veiculo e carroceria a partir da carga
      const veiculo = carga.veiculo || '';
      const carroceria = carga.carroceria || '';

      // Detecta regiao a partir da origem/destino da carga
      const regiao = this.detectRegiao(carga.origem, carga.destino);

      const dados = {
        cargaId: carga.id,
        nome: contactInfo.nome,
        telefone: contactInfo.telefone,
        veiculo: veiculo,
        carroceria: carroceria,
        regiao: regiao,
        observacoes: 'Auto-detectado via WhatsApp',
        fonte: 'auto-whatsapp'
      };

      BotCargaStorage.addInteressado(dados, () => {
        console.log(`[BotCarga] Interesse auto-detectado: ${contactInfo.nome} -> ${carga.origem} x ${carga.destino}`);
        BotCargaSidebar.showToast(
          `🎯 Interesse detectado! ${contactInfo.nome} → ${carga.origem} x ${carga.destino}`
        );

        // Atualiza lista de cargas se estiver visivel
        if (typeof BotCargaCargas !== 'undefined') {
          try { BotCargaCargas.renderLista(); } catch(e) {}
        }
        if (typeof BotCargaKanban !== 'undefined') {
          try { BotCargaKanban.renderBoard(); } catch(e) {}
        }
      });
    });
  },

  detectRegiao(origem, destino) {
    // Tenta detectar regiao a partir de origem e destino
    const textos = [origem || '', destino || ''];
    for (const texto of textos) {
      const lower = texto.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      // Verifica cidades
      for (const [cidade, estado] of Object.entries(this.CIDADE_ESTADO)) {
        if (lower.includes(cidade)) {
          return this.ESTADO_REGIAO[estado] || '';
        }
      }

      // Verifica siglas de estado (ex: "SP", "- RJ")
      const estadoMatch = texto.match(/\b([A-Z]{2})\b/);
      if (estadoMatch && this.ESTADO_REGIAO[estadoMatch[1]]) {
        return this.ESTADO_REGIAO[estadoMatch[1]];
      }
    }
    return '';
  },

  hashText(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return 'msg_' + hash + '_' + text.length;
  }
};
