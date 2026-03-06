/* ═══════════════════════════════════════
   PROJECT 3.14159 — App Logic
═══════════════════════════════════════ */

// ── STORAGE KEY ──
const STORAGE_KEY = 'p314159_records';
const ID_KEY = 'p314159_teacherId';

let currentAudioFile = null;
let chartInstances = {};

// ══════════════════════════════════════════
// TAB NAVIGATION
// ══════════════════════════════════════════
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'manage') renderTable();
    if (btn.dataset.tab === 'dashboard') renderDashboard();
  });
});

// ══════════════════════════════════════════
// TEACHER ID SYSTEM
// ══════════════════════════════════════════
function generateTeacherId() {
  const num = String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0');
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  const id = `#${num}${suffix}`;
  localStorage.setItem(ID_KEY, id);
  document.getElementById('teacherIdDisplay').textContent = id;
  document.getElementById('teacherIdInput').value = id;
  return id;
}

function loadTeacherId() {
  const val = document.getElementById('teacherIdInput').value.trim();
  if (!val) return alert('Enter a Teacher ID first.');
  document.getElementById('teacherIdDisplay').textContent = val;
  localStorage.setItem(ID_KEY, val);
}

// Generate sub-ID: #000001XXX → #000001XXX001, etc.
function generateSubId(teacherId) {
  const records = getRecords();
  const mine = records.filter(r => r.teacherId === teacherId);
  const seq = String(mine.length + 1).padStart(3, '0');
  const base = teacherId.replace('#', '');
  return `#${base}${seq}`;
}

// Init stored ID on load
window.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem(ID_KEY);
  if (stored) {
    document.getElementById('teacherIdDisplay').textContent = stored;
    document.getElementById('teacherIdInput').value = stored;
  }
  // Set date fields to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('classDate').value = today;
  document.getElementById('inp_classDate').value = today;

  renderTable();

  // Drag & drop
  const zone = document.getElementById('uploadZone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) processAudioFile(file);
  });
});

// ══════════════════════════════════════════
// AUDIO HANDLING
// ══════════════════════════════════════════
function handleAudioFile(event) {
  const file = event.target.files[0];
  if (file) processAudioFile(file);
}

function processAudioFile(file) {
  if (!file.type.startsWith('audio/')) {
    alert('Please upload an audio file (MP3, WAV, M4A, OGG).');
    return;
  }
  currentAudioFile = file;
  const url = URL.createObjectURL(file);
  document.getElementById('audioPlayer').src = url;
  document.getElementById('audioFileName').textContent = file.name;
  document.getElementById('audioPreview').style.display = 'flex';

  const btn = document.getElementById('openChatGPTBtn');
  btn.disabled = false;
  btn.querySelector('.btn-hint').textContent = file.name;
}

// ══════════════════════════════════════════
// CHATGPT REDIRECT
// ══════════════════════════════════════════
function openChatGPT() {
  copyPrompt();
  // Open ChatGPT — user will manually attach the audio
  window.open('https://chatgpt.com/', '_blank');

  // Sync fields to score entry tab
  const name = document.getElementById('teacherName').value;
  const id = document.getElementById('teacherIdDisplay').textContent;
  const cls = document.getElementById('className').value;
  const date = document.getElementById('classDate').value;

  if (name) document.getElementById('inp_teacherName').value = name;
  if (id && id !== '—') document.getElementById('inp_teacherId').value = id;
  if (cls) document.getElementById('inp_className').value = cls;
  if (date) document.getElementById('inp_classDate').value = date;
}

function copyPrompt() {
  const text = document.getElementById('promptText').innerText;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.btn-copy');
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = '📋 Copy', 2000);
  });
}

// ══════════════════════════════════════════
// SCORE CARDS — LIVE BAR UPDATE
// ══════════════════════════════════════════
function updateScoreCard(input, dim) {
  const val = parseFloat(input.value);
  const barMap = { communication: 'bar_comm', understanding: 'bar_und', curiosity: 'bar_cur', cumulative: 'bar_cum' };
  const bar = document.getElementById(barMap[dim]);
  if (bar && !isNaN(val)) {
    const pct = Math.min(Math.max(val / 10 * 100, 0), 100);
    bar.style.width = pct + '%';
    // Color by score
    if (val >= 8) bar.style.background = '#e8ff47';
    else if (val >= 5) bar.style.background = '#47c8ff';
    else bar.style.background = '#ff6b47';
  }
}

// ══════════════════════════════════════════
// DATA — CRUD
// ══════════════════════════════════════════
function getRecords() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function saveRecord() {
  const teacherName = document.getElementById('inp_teacherName').value.trim();
  const teacherId = document.getElementById('inp_teacherId').value.trim();
  const className = document.getElementById('inp_className').value.trim();
  const classDate = document.getElementById('inp_classDate').value;
  const comm = parseFloat(document.getElementById('score_comm').value);
  const und = parseFloat(document.getElementById('score_und').value);
  const cur = parseFloat(document.getElementById('score_cur').value);
  const cum = parseFloat(document.getElementById('score_cum').value);
  const observation = document.getElementById('inp_observation').value.trim();

  if (!teacherName || !teacherId || !className || !classDate) {
    alert('Please fill in Teacher Name, ID, Class, and Date.');
    return;
  }
  if ([comm, und, cur, cum].some(v => isNaN(v) || v < 0 || v > 10)) {
    alert('All 4 scores must be between 0 and 10.');
    return;
  }

  const records = getRecords();
  const subId = generateSubId(teacherId);

  const record = {
    subId, teacherName, teacherId, className, classDate,
    comm, und, cur, cum, observation,
    createdAt: new Date().toISOString()
  };

  records.push(record);
  saveRecords(records);

  document.getElementById('subIdValue').textContent = subId;
  document.getElementById('subIdDisplay').style.display = 'flex';
  document.getElementById('saveStatus').textContent = '✓ Saved successfully!';
  setTimeout(() => document.getElementById('saveStatus').textContent = '', 3000);

  // Reset scores
  ['score_comm','score_und','score_cur','score_cum'].forEach(id => {
    document.getElementById(id).value = '';
  });
  ['bar_comm','bar_und','bar_cur','bar_cum'].forEach(id => {
    document.getElementById(id).style.width = '0%';
  });
  document.getElementById('inp_observation').value = '';

  renderTable();
}

function deleteRecord(subId) {
  if (!confirm(`Delete record ${subId}?`)) return;
  const records = getRecords().filter(r => r.subId !== subId);
  saveRecords(records);
  renderTable();
}

function clearAllData() {
  if (!confirm('⚠ This will delete ALL records. Are you sure?')) return;
  localStorage.removeItem(STORAGE_KEY);
  renderTable();
}

// ══════════════════════════════════════════
// TABLE RENDER
// ══════════════════════════════════════════
function renderTable() {
  const records = getRecords();
  const tbody = document.getElementById('tableBody');
  const empty = document.getElementById('emptyState');
  if (!tbody) return;

  if (records.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = records.map(r => `
    <tr>
      <td><code style="color:var(--accent);font-size:11px">${r.subId}</code></td>
      <td>${r.teacherName}</td>
      <td><code style="color:var(--text-dim);font-size:11px">${r.teacherId}</code></td>
      <td>${r.className}</td>
      <td>${r.classDate}</td>
      <td>${scorePill(r.comm)}</td>
      <td>${scorePill(r.und)}</td>
      <td>${scorePill(r.cur)}</td>
      <td>${scorePill(r.cum)}</td>
      <td><button class="delete-btn" onclick="deleteRecord('${r.subId}')">✕</button></td>
    </tr>
  `).join('');
}

function scorePill(v) {
  const cls = v >= 8 ? '' : v >= 5 ? 'mid' : 'low';
  return `<span class="score-pill ${cls}">${v}</span>`;
}

// ══════════════════════════════════════════
// EXCEL EXPORT
// ══════════════════════════════════════════
function exportExcel() {
  const records = getRecords();
  if (records.length === 0) { alert('No records to export.'); return; }

  const wsData = [
    ['Sub-ID', 'Teacher Name', 'Teacher ID', 'Class', 'Date', 'Communication', 'Understanding', 'Curiosity', 'Cumulative', 'Average', 'Observation', 'Created At']
  ];

  records.forEach(r => {
    const avg = ((r.comm + r.und + r.cur + r.cum) / 4).toFixed(2);
    wsData.push([r.subId, r.teacherName, r.teacherId, r.className, r.classDate,
      r.comm, r.und, r.cur, r.cum, avg, r.observation, r.createdAt]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = [16,18,14,20,12,14,14,12,12,10,40,22].map(w => ({ wch: w }));

  XLSX.utils.book_append_sheet(wb, ws, 'Records');

  // Summary sheet
  const teachers = [...new Set(records.map(r => r.teacherId))];
  const summaryData = [['Teacher ID', 'Teacher Name', 'Sessions', 'Avg Comm', 'Avg Understanding', 'Avg Curiosity', 'Avg Cumulative', 'Overall Avg']];
  teachers.forEach(tid => {
    const mine = records.filter(r => r.teacherId === tid);
    const avg = d => (mine.reduce((s,r) => s+r[d],0)/mine.length).toFixed(2);
    const overall = ((parseFloat(avg('comm'))+parseFloat(avg('und'))+parseFloat(avg('cur'))+parseFloat(avg('cum')))/4).toFixed(2);
    summaryData.push([tid, mine[0].teacherName, mine.length, avg('comm'), avg('und'), avg('cur'), avg('cum'), overall]);
  });
  const ws2 = XLSX.utils.aoa_to_sheet(summaryData);
  ws2['!cols'] = [16,18,10,12,18,14,16,14].map(w => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

  XLSX.writeFile(wb, `project3.14159_records_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// ══════════════════════════════════════════
// EXCEL IMPORT
// ══════════════════════════════════════════
function importExcel(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const records = getRecords();
      const existingIds = new Set(records.map(r => r.subId));
      let added = 0;

      rows.slice(1).forEach(row => {
        if (row.length < 9) return;
        const [subId, teacherName, teacherId, className, classDate, comm, und, cur, cum, , observation] = row;
        if (!subId || existingIds.has(subId)) return;
        records.push({ subId: String(subId), teacherName, teacherId, className, classDate,
          comm: Number(comm), und: Number(und), cur: Number(cur), cum: Number(cum),
          observation: observation || '', createdAt: new Date().toISOString() });
        added++;
      });

      saveRecords(records);
      renderTable();
      alert(`Imported ${added} new records.`);
    } catch(err) {
      alert('Failed to import: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
  event.target.value = '';
}

// ══════════════════════════════════════════
// DASHBOARD — CHARTS
// ══════════════════════════════════════════
function destroyChart(id) {
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
}

function renderDashboard() {
  let records = getRecords();
  const teacherFilter = document.getElementById('filter_teacherId').value.trim();
  const period = document.getElementById('filter_period').value;

  if (teacherFilter) records = records.filter(r => r.teacherId === teacherFilter);

  // Period filter
  if (period !== 'all') {
    const now = new Date();
    records = records.filter(r => {
      const d = new Date(r.classDate);
      if (period === 'week') {
        const start = new Date(now); start.setDate(now.getDate() - 7);
        return d >= start;
      }
      if (period === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }

  if (records.length === 0) { alert('No records match your filter.'); return; }

  // Sort by date
  records.sort((a, b) => new Date(a.classDate) - new Date(b.classDate));

  const COLORS = { comm: '#e8ff47', und: '#47c8ff', cur: '#ff6b47', cum: '#c47fff' };

  // ─ Chart 1: Trend line ─
  destroyChart('trend');
  chartInstances.trend = new Chart(document.getElementById('chart_trend'), {
    type: 'line',
    data: {
      labels: records.map(r => `${r.classDate} (${r.className})`),
      datasets: [
        { label: 'Communication', data: records.map(r => r.comm), borderColor: COLORS.comm, backgroundColor: 'rgba(232,255,71,0.08)', tension: 0.4, pointRadius: 4 },
        { label: 'Understanding', data: records.map(r => r.und), borderColor: COLORS.und, backgroundColor: 'rgba(71,200,255,0.08)', tension: 0.4, pointRadius: 4 },
        { label: 'Curiosity', data: records.map(r => r.cur), borderColor: COLORS.cur, backgroundColor: 'rgba(255,107,71,0.08)', tension: 0.4, pointRadius: 4 },
        { label: 'Cumulative', data: records.map(r => r.cum), borderColor: COLORS.cum, backgroundColor: 'rgba(196,127,255,0.08)', tension: 0.4, pointRadius: 4 },
      ]
    },
    options: chartOptions('line')
  });

  // ─ Chart 2: Radar ─
  const avg = d => records.reduce((s,r) => s+r[d],0)/records.length;
  destroyChart('radar');
  chartInstances.radar = new Chart(document.getElementById('chart_radar'), {
    type: 'radar',
    data: {
      labels: ['Communication','Understanding','Curiosity','Cumulative'],
      datasets: [{
        label: 'Average Score',
        data: [avg('comm'), avg('und'), avg('cur'), avg('cum')],
        borderColor: '#e8ff47',
        backgroundColor: 'rgba(232,255,71,0.15)',
        pointBackgroundColor: '#e8ff47',
        borderWidth: 2,
        pointRadius: 5
      }]
    },
    options: {
      ...chartOptions('radar'),
      scales: {
        r: {
          min: 0, max: 10,
          ticks: { color: '#7a7a9a', stepSize: 2, backdropColor: 'transparent' },
          grid: { color: '#2a2a40' },
          pointLabels: { color: '#e8e8f0', font: { family: "'Space Mono'", size: 11 } }
        }
      }
    }
  });

  // ─ Chart 3: Bar (avg by dim) ─
  destroyChart('bar');
  chartInstances.bar = new Chart(document.getElementById('chart_bar'), {
    type: 'bar',
    data: {
      labels: ['Communication','Understanding','Curiosity','Cumulative'],
      datasets: [{
        label: 'Average Score',
        data: [avg('comm'), avg('und'), avg('cur'), avg('cum')],
        backgroundColor: [COLORS.comm, COLORS.und, COLORS.cur, COLORS.cum],
        borderRadius: 3,
        borderSkipped: false
      }]
    },
    options: { ...chartOptions('bar'), scales: { y: { min: 0, max: 10, ...darkAxisStyle() }, x: { ...darkAxisStyle() } } }
  });

  // ─ Chart 4: Class comparison ─
  const classes = [...new Set(records.map(r => r.className))];
  const classBars = dim => classes.map(c => {
    const sub = records.filter(r => r.className === c);
    return sub.reduce((s,r) => s+r[dim],0)/sub.length;
  });

  destroyChart('class');
  chartInstances.class = new Chart(document.getElementById('chart_class'), {
    type: 'bar',
    data: {
      labels: classes,
      datasets: [
        { label: 'Communication', data: classBars('comm'), backgroundColor: COLORS.comm, borderRadius: 2 },
        { label: 'Understanding', data: classBars('und'), backgroundColor: COLORS.und, borderRadius: 2 },
        { label: 'Curiosity', data: classBars('cur'), backgroundColor: COLORS.cur, borderRadius: 2 },
        { label: 'Cumulative', data: classBars('cum'), backgroundColor: COLORS.cum, borderRadius: 2 },
      ]
    },
    options: { ...chartOptions('bar'), scales: { y: { min: 0, max: 10, ...darkAxisStyle() }, x: { ...darkAxisStyle() } } }
  });

  // ─ Stats panel ─
  document.getElementById('statsPanel').style.display = 'grid';
  document.getElementById('stat_sessions').textContent = records.length;
  document.getElementById('stat_comm').textContent = avg('comm').toFixed(1);
  document.getElementById('stat_und').textContent = avg('und').toFixed(1);
  document.getElementById('stat_cur').textContent = avg('cur').toFixed(1);
  document.getElementById('stat_cum').textContent = avg('cum').toFixed(1);
}

function chartOptions(type) {
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { labels: { color: '#7a7a9a', font: { family: "'Space Mono'", size: 11 }, boxWidth: 12 } },
      tooltip: {
        backgroundColor: '#1a1a26',
        borderColor: '#2a2a40',
        borderWidth: 1,
        titleColor: '#e8e8f0',
        bodyColor: '#7a7a9a',
        titleFont: { family: "'Space Mono'" },
        bodyFont: { family: "'Space Mono'" }
      }
    }
  };
}

function darkAxisStyle() {
  return {
    ticks: { color: '#7a7a9a', font: { family: "'Space Mono'", size: 11 } },
    grid: { color: '#1a1a26' },
    border: { color: '#2a2a40' }
  };
}
