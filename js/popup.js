// Carrega estatísticas no popup
chrome.storage.local.get(['motoristas', 'cargas'], (data) => {
  const motoristas = data.motoristas || [];
  const cargas = data.cargas || [];
  const cargasAtivas = cargas.filter(c => c.status !== 'finalizada');

  document.getElementById('totalMotoristas').textContent = motoristas.length;
  document.getElementById('totalCargas').textContent = cargasAtivas.length;
});
