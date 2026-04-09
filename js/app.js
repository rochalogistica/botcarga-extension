// ============================================
// BotCarga - Inicialização
// ============================================

(function() {
  'use strict';

  // Aguarda o WhatsApp Web carregar completamente (lista de chats visivel)
  let waitAttempts = 0;
  function waitForWhatsApp() {
    waitAttempts++;

    // Verifica se a lista de conversas ou o painel principal ja carregou
    const chatList = document.querySelector('[data-tab="3"]')       // search box
      || document.querySelector('div[aria-label="Chat list"]')       // chat list
      || document.querySelector('#pane-side')                        // side pane
      || document.querySelector('header');                           // header do whatsapp

    if (chatList) {
      // Aguarda mais 2s para garantir que tudo carregou
      setTimeout(initBotCarga, 2000);
    } else if (waitAttempts > 120) {
      // Depois de 2 min, inicia mesmo assim (modo offline/lento)
      console.log('[BotCarga] Timeout esperando WhatsApp, iniciando mesmo assim...');
      initBotCarga();
    } else {
      setTimeout(waitForWhatsApp, 1000);
    }
  }

  function initBotCarga() {
    // Evita inicialização duplicada
    if (document.getElementById('botcarga-sidebar')) return;

    console.log('[BotCarga] Inicializando...');

    // Inicializa módulos na ordem correta
    BotCargaSidebar.init();
    BotCargaDashboard.init();
    BotCargaMotoristas.init();
    BotCargaCargas.init();
    BotCargaKanban.init();
    BotCargaDisparo.init();

    // Aplica resize no WhatsApp somente quando conectado (chat list visivel)
    waitForConnected();

    console.log('[BotCarga] Pronto!');
  }

  function waitForConnected() {
    const chatList = document.querySelector('#pane-side')
      || document.querySelector('[data-tab="3"]')
      || document.querySelector('div[aria-label="Chat list"]');

    if (chatList) {
      document.body.classList.add('botcarga-ready');
      console.log('[BotCarga] WhatsApp conectado, layout ajustado.');
    } else {
      setTimeout(waitForConnected, 2000);
    }
  }

  // Inicia quando o DOM estiver pronto
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    waitForWhatsApp();
  } else {
    document.addEventListener('DOMContentLoaded', waitForWhatsApp);
  }
})();
