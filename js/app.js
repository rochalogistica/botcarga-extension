// ============================================
// BotCarga - Inicialização
// ============================================

(function() {
  'use strict';

  // Aguarda o WhatsApp Web CONECTAR completamente (chats visiveis)
  // NAO injeta nada antes disso para nao interferir no QR code / conexao
  function waitForFullConnection() {
    // Busca elementos que so existem DEPOIS de conectar o celular
    const paneSide = document.querySelector('#pane-side');
    const chatList = document.querySelector('[aria-label="Lista de conversas"]')
      || document.querySelector('[aria-label="Chat list"]')
      || document.querySelector('[data-tab="3"]');
    const mainHeader = document.querySelector('header span[data-icon="menu"]')
      || document.querySelector('header span[data-icon="search"]');

    if (paneSide || (chatList && mainHeader)) {
      console.log('[BotCarga] WhatsApp conectado! Iniciando em 3s...');
      setTimeout(initBotCarga, 3000);
    } else {
      // Verifica a cada 3s sem interferir
      setTimeout(waitForFullConnection, 3000);
    }
  }

  function initBotCarga() {
    // Evita inicialização duplicada
    if (document.getElementById('botcarga-sidebar')) return;

    console.log('[BotCarga] Inicializando modulos...');

    // Inicializa módulos na ordem correta
    BotCargaSidebar.init();
    BotCargaDashboard.init();
    BotCargaMotoristas.init();
    BotCargaCargas.init();
    BotCargaKanban.init();
    BotCargaDisparo.init();
    BotCargaMessageObserver.init();

    // Ajusta layout do WhatsApp
    document.body.classList.add('botcarga-ready');

    console.log('[BotCarga] Pronto!');
  }

  // Inicia monitoramento quando o DOM estiver pronto
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    waitForFullConnection();
  } else {
    document.addEventListener('DOMContentLoaded', waitForFullConnection);
  }
})();
