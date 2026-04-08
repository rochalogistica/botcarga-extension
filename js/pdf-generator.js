// ============================================
// BotCarga - Gerador de PDF e Landing Page
// ============================================

const BotCargaPDF = {
  // URL da landing page (atualizar quando hospedar no GitHub Pages)
  landingBaseUrl: 'https://SEU-USUARIO.github.io/botcarga-cargas/',

  // Numero WhatsApp padrao (sera substituido pelo do colaborador ativo)
  whatsappNumero: '5511977252175',

  // Gera o HTML da landing page com as cargas atuais
  gerarLandingHTML(cargas, whatsappOverride) {
    const whatsappFinal = whatsappOverride || this.whatsappNumero;
    const cargasAbertas = cargas.filter(c => c.status === 'aberta');

    const cargasJSON = JSON.stringify(cargasAbertas.map(c => ({
      id: c.id,
      origem: c.origem,
      destino: c.destino,
      tipoCarga: c.tipoCarga || '',
      peso: c.peso || '',
      veiculo: c.veiculo || '',
      valor: c.valor || '',
      dataColeta: c.dataColeta ? this.formatarData(c.dataColeta) : '',
      dataEntrega: c.dataEntrega ? this.formatarData(c.dataEntrega) : '',
      observacoes: c.observacoes || ''
    })));

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BotCarga - Cargas Disponiveis</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Tahoma,sans-serif;background:#f0f2f5;color:#1a1a2e;min-height:100vh}
    .header{background:linear-gradient(135deg,#1a3a6b,#2563eb);color:#fff;padding:24px 20px;text-align:center;position:sticky;top:0;z-index:100;box-shadow:0 2px 10px rgba(0,0,0,.15)}
    .header h1{font-size:28px;font-weight:900;letter-spacing:3px}
    .header p{font-size:14px;opacity:.85;margin-top:4px}
    .badge{display:inline-block;background:rgba(255,255,255,.2);padding:4px 14px;border-radius:20px;font-size:12px;margin-top:8px}
    .container{max-width:800px;margin:0 auto;padding:20px 16px 40px}
    .section-title{font-size:16px;font-weight:700;color:#374151;margin-bottom:14px;display:flex;align-items:center;gap:8px}
    .count{background:#2563eb;color:#fff;padding:2px 10px;border-radius:12px;font-size:12px}
    .card{background:#fff;border-radius:16px;padding:20px;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,.06);border:1px solid #e5e7eb;transition:transform .2s,box-shadow .2s}
    .card:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.1)}
    .rota{font-size:18px;font-weight:800;color:#1a3a6b;margin-bottom:12px}
    .rota .arrow{color:#2563eb}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}
    .info-item{display:flex;align-items:center;gap:8px;font-size:14px;color:#4b5563}
    .info-label{font-weight:600;color:#374151}
    .valor{font-size:22px;font-weight:800;color:#059669;margin-bottom:14px}
    .btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;background:#25d366;color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;text-decoration:none;transition:background .2s;font-family:inherit}
    .btn:hover{background:#1da851}
    .footer{text-align:center;padding:30px 20px;color:#9ca3af;font-size:12px}
    @media(max-width:480px){.info-grid{grid-template-columns:1fr}.rota{font-size:16px}.valor{font-size:18px}}
  </style>
</head>
<body>
<div class="header">
  <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:6px">
    <span style="font-size:32px">&#x1F69A;</span>
    <h1>BOTCARGA</h1>
  </div>
  <p>Cargas disponiveis para voce</p>
  <div class="badge">&#x1F4E6; Confira as oportunidades abaixo</div>
</div>
<div class="container">
  <div class="section-title">&#x1F4CB; Cargas em Aberto <span class="count" id="total">0</span></div>
  <div id="lista"></div>
</div>
<div class="footer">BotCarga &copy; 2026</div>
<script>
var WA='${whatsappFinal}';
var CARGAS=${cargasJSON};
function esc(s){if(!s)return'';var d=document.createElement('div');d.textContent=s;return d.innerHTML}
function link(c){var m='Ola! Vi no BotCarga e tenho interesse na carga:\\n\\n'+
'\\u{1F4CD} Origem: '+c.origem+'\\n'+
'\\u{1F3C1} Destino: '+c.destino+'\\n'+
(c.tipoCarga?'\\u{1F4E6} Tipo: '+c.tipoCarga+'\\n':'')+
(c.peso?'\\u{2696}\\u{FE0F} Peso: '+c.peso+' ton\\n':'')+
(c.veiculo?'\\u{1F69A} Veiculo: '+c.veiculo+'\\n':'')+
(c.valor?'\\u{1F4B0} Valor: R$ '+c.valor+'\\n':'')+
'\\nGostaria de mais informacoes!';
return'https://wa.me/'+WA+'?text='+encodeURIComponent(m)}
document.getElementById('total').textContent=CARGAS.length;
var h='';CARGAS.forEach(function(c){
h+='<div class="card"><div class="rota">\\u{1F4CD} '+esc(c.origem)+' <span class="arrow">\\u{27A1}</span> \\u{1F3C1} '+esc(c.destino)+'</div><div class="info-grid">';
if(c.tipoCarga)h+='<div class="info-item">\\u{1F4E6} <span><span class="info-label">Tipo:</span> '+esc(c.tipoCarga)+'</span></div>';
if(c.peso)h+='<div class="info-item">\\u{2696}\\u{FE0F} <span><span class="info-label">Peso:</span> '+esc(c.peso)+' ton</span></div>';
if(c.veiculo)h+='<div class="info-item">\\u{1F69A} <span><span class="info-label">Veiculo:</span> '+esc(c.veiculo)+'</span></div>';
if(c.dataColeta)h+='<div class="info-item">\\u{1F4C5} <span><span class="info-label">Coleta:</span> '+esc(c.dataColeta)+'</span></div>';
h+='</div>';
if(c.valor)h+='<div class="valor">\\u{1F4B0} R$ '+esc(c.valor)+'</div>';
h+='<a class="btn" href="'+link(c)+'" target="_blank">\\u{1F4AC} Tenho Interesse nessa Carga</a></div>';
});
document.getElementById('lista').innerHTML=h||'<div style="text-align:center;padding:40px;color:#9ca3af">Nenhuma carga disponivel</div>';
</script>
</body>
</html>`;
  },

  // Gera PDF simples com link para a landing
  gerarPDF(landingUrl, callback) {
    // Cria um canvas para gerar o PDF como imagem
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 400);
    grad.addColorStop(0, '#1a3a6b');
    grad.addColorStop(1, '#2563eb');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 400);

    // Rounded rect background
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    this.roundRect(ctx, 40, 40, 720, 320, 20);
    ctx.fill();

    // Truck emoji
    ctx.font = '50px serif';
    ctx.textAlign = 'center';
    ctx.fillText('\uD83D\uDE9A', 400, 100);

    // Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Segoe UI, sans-serif';
    ctx.fillText('BOTCARGA', 400, 155);

    // Subtitle
    ctx.font = '18px Segoe UI, sans-serif';
    ctx.globalAlpha = 0.85;
    ctx.fillText('Confira nossas cargas disponiveis!', 400, 190);
    ctx.globalAlpha = 1;

    // Button
    ctx.fillStyle = '#25d366';
    this.roundRect(ctx, 250, 230, 300, 55, 28);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Segoe UI, sans-serif';
    ctx.fillText('\uD83D\uDCE6  Ver Cargas Disponiveis', 400, 265);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px Segoe UI, sans-serif';
    ctx.fillText('Clique no botao acima ou acesse: ' + landingUrl, 400, 340);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (callback) callback(blob, canvas.toDataURL('image/png'));
    }, 'image/png');
  },

  // Helper para rounded rect
  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  },

  // Exporta landing page HTML como arquivo para download
  exportarLanding(cargas, whatsappOverride) {
    const html = this.gerarLandingHTML(cargas, whatsappOverride);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cargas-botcarga.html';
    a.click();
    URL.revokeObjectURL(url);
    BotCargaSidebar.showToast('Landing page exportada!');
  },

  // Copia o codigo da landing para clipboard
  copiarLandingCode(cargas, whatsappOverride) {
    const html = this.gerarLandingHTML(cargas, whatsappOverride);
    navigator.clipboard.writeText(html).then(() => {
      BotCargaSidebar.showToast('Codigo HTML copiado! Cole no GitHub Pages.');
    });
  },

  formatarData(dateStr) {
    if (!dateStr) return '';
    const [ano, mes, dia] = dateStr.split('-');
    return `${dia}/${mes}/${ano}`;
  }
};
