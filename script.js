let startTime, interval;
let elapsed = 0;
let isRunning = false;
let laps = [];
const display = document.getElementById('display');
const lapContainer = document.getElementById('laps');
const history = document.getElementById('history');

function format(ms) {
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
  return `${h}:${m}:${s}:${cs}`;
}

function updateDisplay() {
  display.textContent = format(elapsed);
}

function start() {
  if (!isRunning) {
    startTime = Date.now() - elapsed;
    interval = setInterval(() => {
      elapsed = Date.now() - startTime;
      updateDisplay();
    }, 10);
    isRunning = true;
  }
}

function stop() {
  if (isRunning) {
    clearInterval(interval);
    isRunning = false;
  }
}

function reset() {
  stop();
  elapsed = 0;
  updateDisplay();
  laps = [];
  lapContainer.innerHTML = '';
  localStorage.removeItem('laps');
  history.textContent = 'Session Reset';
}

function addLap() {
  if (isRunning) {
    const lapTime = format(elapsed);
    laps.push(lapTime);
    const lapElem = document.createElement('div');
    lapElem.textContent = `Lap ${laps.length}: ${lapTime}`;
    lapContainer.appendChild(lapElem);
    localStorage.setItem('laps', JSON.stringify(laps));
  }
}

function exportCSV() {
  if (laps.length === 0) return alert('No laps to export');
  const csv = laps.map((lap, i) => `Lap ${i + 1},${lap}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'laps.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Background animation
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particles = [];

for (let i = 0; i < 100; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    d: Math.random() * 1
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff55';
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    p.y += p.d;
    if (p.y > canvas.height) p.y = 0;
  });
  requestAnimationFrame(drawParticles);
}

drawParticles();


window.addEventListener('keydown', e => {
  if (e.key === 's') start();
  else if (e.key === 't') stop();
  else if (e.key === 'r') reset();
  else if (e.key === 'l') addLap();
});

document.getElementById('start').onclick = start;
document.getElementById('stop').onclick = stop;
document.getElementById('reset').onclick = reset;
document.getElementById('lap').onclick = addLap;
document.getElementById('export').onclick = exportCSV;

document.getElementById('themeToggle').onclick = () => {
  document.body.classList.toggle('dark');
};

document.getElementById('voiceToggle').onclick = () => {
  const synth = window.speechSynthesis;
  if (synth.speaking) {
    synth.cancel();
  } else {
    const utter = new SpeechSynthesisUtterance(`Elapsed time is ${format(elapsed).replaceAll(':', ' ')}`);
    synth.speak(utter);
  }
};

window.onload = () => {
  const saved = localStorage.getItem('laps');
  if (saved) {
    laps = JSON.parse(saved);
    laps.forEach((lap, i) => {
      const lapElem = document.createElement('div');
      lapElem.textContent = `Lap ${i + 1}: ${lap}`;
      lapContainer.appendChild(lapElem);
    });
    history.textContent = `Session Restored: ${laps.length} laps`;
  }
};