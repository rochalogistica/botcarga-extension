// ============================================
// BotCarga - Inicialização
// ============================================

(function() {
  'use strict';

  // Aguarda o WhatsApp Web carregar completamente
  function waitForWhatsApp() {
    const appEl = document.getElementById('app');
    if (appEl && appEl.querySelector('div')) {
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

    console.log('[BotCarga] Pronto!');
  }

  // Inicia quando o DOM estiver pronto
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    waitForWhatsApp();
  } else {
    document.addEventListener('DOMContentLoaded', waitForWhatsApp);
  }
})();
