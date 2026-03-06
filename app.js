/* ═══════════════════════════════════════
   PROsystumm ka logic
═══════════════════════════════════════ */

const STORAGE_KEY = 'p314159_records';
const ID_KEY      = 'p314159_teacherId';

let currentAudioFile = null;
let chartInstances   = {};

// ══════════════════════════════════════
// dhoondhooooooo
// ══════════════════════════════════════
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'manage')    renderTable();
    if (btn.dataset.tab === 'dashboard') renderDashboard();
  });
});

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem(ID_KEY);
  if (stored) {
    document.getElementById('teacherIdDisplay').textContent = stored;
    document.getElementById('teacherIdInput').value = stored;
  }
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('classDate').value   = today;
  document.getElementById('inp_classDate').value = today;

  renderTable();

  // Drag & drop
  const zone = document.getElementById('uploadZone');
  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('dragover');
    const f = e.dataTransfer.files[0];
    if (f) processAudioFile(f);
  });
});

// ══════════════════════════════════════
// asli teacher ki pehchaan 
// ══════════════════════════════════════
function generateTeacherId() {
  const num    = String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0');
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  const id     = `#${num}${suffix}`;
  localStorage.setItem(ID_KEY, id);
  document.getElementById('teacherIdDisplay').textContent = id;
  document.getElementById('teacherIdInput').value         = id;
  return id;
}

function loadTeacherId() {
  const val = document.getElementById('teacherIdInput').value.trim();
  if (!val) { alert('Enter a Teacher ID first.'); return; }
  document.getElementById('teacherIdDisplay').textContent = val;
  localStorage.setItem(ID_KEY, val);
}

function generateSubId(teacherId) {
  const records = getRecords();
  const mine    = records.filter(r => r.teacherId === teacherId);
  const seq     = String(mine.length + 1).padStart(3, '0');
  const base    = teacherId.replace('#', '');
  return `#${base}${seq}`;
}

// ══════════════════════════════════════
// awaaz aane do
// ══════════════════════════════════════
function handleAudioFile(e) {
  const f = e.target.files[0];
  if (f) processAudioFile(f);
}

function processAudioFile(file) {
  if (!file.type.startsWith('audio/')) {
    alert('Please upload an audio file (MP3, WAV, M4A, OGG).');
    return;
  }
  currentAudioFile = file;
  const url = URL.createObjectURL(file);
  document.getElementById('audioPlayer').src    = url;
  document.getElementById('audioFileName').textContent = file.name;
  document.getElementById('audioPreview').style.display = 'flex';

  const btn  = document.getElementById('openChatGPTBtn');
  const hint = document.getElementById('chatgptBtnHint');
  btn.disabled  = false;
  hint.textContent = `Ready — ${file.name}`;
}

// ══════════════════════════════════════
// CHATGPT REDIRECT
// ══════════════════════════════════════
function openChatGPT() {
  copyPrompt();
  window.open('https://chatgpt.com/', '_blank');
  // Sync fields to score tab
  const name = document.getElementById('teacherName').value;
  const id   = document.getElementById('teacherIdDisplay').textContent;
  const cls  = document.getElementById('className').value;
  const date = document.getElementById('classDate').value;
  if (name) document.getElementById('inp_teacherName').value = name;
  if (id && id !== '—') document.getElementById('inp_teacherId').value = id;
  if (cls)  document.getElementById('inp_className').value  = cls;
  if (date) document.getElementById('inp_classDate').value  = date;
}

function copyPrompt() {
  const text = document.getElementById('promptText').innerText;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.btn-copy');
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = '📋 Copy Prompt', 2000);
  });
}

// ══════════════════════════════════════
// SCORE CARDS
// ══════════════════════════════════════
function updateScoreCard(input, dim) {
  const val = parseFloat(input.value);
  const bar = document.getElementById('bar_' + dim);
  if (!bar || isNaN(val)) return;
  const pct = Math.min(Math.max(val / 10 * 100, 0), 100);
  bar.style.width = pct + '%';
  bar.style.background = val >= 8 ? '#1a2e1e' : val >= 5 ? '#c9a84c' : '#b85c38';
}

// ══════════════════════════════════════
// DATA CRUD
// ══════════════════════════════════════
function getRecords() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveRecords(r) { localStorage.setItem(STORAGE_KEY, JSON.stringify(r)); }

function saveRecord() {
  const teacherName = document.getElementById('inp_teacherName').value.trim();
  const teacherId   = document.getElementById('inp_teacherId').value.trim();
  const className   = document.getElementById('inp_className').value.trim();
  const classDate   = document.getElementById('inp_classDate').value;
  const comm = parseFloat(document.getElementById('score_comm').value);
  const und  = parseFloat(document.getElementById('score_und').value);
  const cur  = parseFloat(document.getElementById('score_cur').value);
  const cum  = parseFloat(document.getElementById('score_cum').value);
  const observation = document.getElementById('inp_observation').value.trim();

  if (!teacherName || !teacherId || !className || !classDate) {
    alert('Please fill in Teacher Name, ID, Class, and Date.'); return;
  }
  if ([comm, und, cur, cum].some(v => isNaN(v) || v < 0 || v > 10)) {
    alert('All 4 scores must be between 0 and 10.'); return;
  }

  const records = getRecords();
  const subId   = generateSubId(teacherId);
  records.push({
    subId, teacherName, teacherId, className, classDate,
    comm, und, cur, cum, observation,
    createdAt: new Date().toISOString()
  });
  saveRecords(records);

  document.getElementById('subIdValue').textContent    = subId;
  document.getElementById('subIdDisplay').style.display = 'flex';
  const status = document.getElementById('saveStatus');
  status.textContent = '✓ Record saved successfully';
  setTimeout(() => status.textContent = '', 3500);

  // Reset scores
  ['score_comm','score_und','score_cur','score_cum'].forEach(id => { document.getElementById(id).value = ''; });
  ['bar_comm','bar_und','bar_cur','bar_cum'].forEach(id => { document.getElementById(id).style.width = '0%'; });
  document.getElementById('inp_observation').value = '';

  renderTable();
}

function deleteRecord(subId) {
  if (!confirm(`Delete record ${subId}?`)) return;
  saveRecords(getRecords().filter(r => r.subId !== subId));
  renderTable();
}

function clearAllData() {
  if (!confirm('⚠ This will permanently delete ALL records. Are you sure?')) return;
  localStorage.removeItem(STORAGE_KEY);
  renderTable();
}

// ══════════════════════════════════════
// TABLE
// ══════════════════════════════════════
function renderTable() {
  const records  = getRecords();
  const tbody    = document.getElementById('tableBody');
  const empty    = document.getElementById('emptyState');
  const tbl      = document.getElementById('dataTable');
  if (!tbody) return;

  if (records.length === 0) {
    tbody.innerHTML = '';
    tbl.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  tbl.style.display = '';
  empty.style.display = 'none';

  tbody.innerHTML = records.map(r => `
    <tr>
      <td><span class="mono-id">${r.subId}</span></td>
      <td>${r.teacherName}</td>
      <td><span class="mono-id" style="background:rgba(26,46,30,0.08)">${r.teacherId}</span></td>
      <td>${r.className}</td>
      <td>${r.classDate}</td>
      <td>${pill(r.comm)}</td>
      <td>${pill(r.und)}</td>
      <td>${pill(r.cur)}</td>
      <td>${pill(r.cum)}</td>
      <td><button class="delete-btn" onclick="deleteRecord('${r.subId}')">✕</button></td>
    </tr>
  `).join('');
}

function pill(v) {
  const cls = v >= 8 ? 'high' : v >= 5 ? 'mid' : 'low';
  return `<span class="score-pill ${cls}">${v}</span>`;
}

// ══════════════════════════════════════
// EXCEL EXPORT
// ══════════════════════════════════════
function exportExcel() {
  const records = getRecords();
  if (!records.length) { alert('No records to export.'); return; }

  const wb = XLSX.utils.book_new();

  // Records sheet
  const wsData = [
    ['Sub-ID','Teacher Name','Teacher ID','Class','Date',
     'Communication','Understanding','Curiosity','Cumulative','Average','Observation','Created At']
  ];
  records.forEach(r => {
    const avg = ((r.comm+r.und+r.cur+r.cum)/4).toFixed(2);
    wsData.push([r.subId, r.teacherName, r.teacherId, r.className, r.classDate,
      r.comm, r.und, r.cur, r.cum, avg, r.observation, r.createdAt]);
  });
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [16,18,14,20,12,14,16,12,12,10,40,22].map(w => ({ wch:w }));
  XLSX.utils.book_append_sheet(wb, ws, 'Records');

  // Summary sheet
  const teachers = [...new Set(records.map(r => r.teacherId))];
  const sumData  = [['Teacher ID','Teacher Name','Sessions',
    'Avg Comm','Avg Understanding','Avg Curiosity','Avg Cumulative','Overall Avg']];
  teachers.forEach(tid => {
    const mine = records.filter(r => r.teacherId === tid);
    const a = d => (mine.reduce((s,r) => s+r[d],0)/mine.length).toFixed(2);
    const overall = ((+a('comm')+ +a('und')+ +a('cur')+ +a('cum'))/4).toFixed(2);
    sumData.push([tid, mine[0].teacherName, mine.length, a('comm'), a('und'), a('cur'), a('cum'), overall]);
  });
  const ws2 = XLSX.utils.aoa_to_sheet(sumData);
  ws2['!cols'] = [16,18,10,12,18,14,16,14].map(w => ({ wch:w }));
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

  XLSX.writeFile(wb, `project3.14159_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// ══════════════════════════════════════
// EXCEL IMPORT
// ══════════════════════════════════════
function importExcel(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb   = XLSX.read(e.target.result, { type:'array' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header:1 });
      const records   = getRecords();
      const existing  = new Set(records.map(r => r.subId));
      let added = 0;
      rows.slice(1).forEach(row => {
        if (row.length < 9) return;
        const [subId,teacherName,teacherId,className,classDate,comm,und,cur,cum,,observation] = row;
        if (!subId || existing.has(String(subId))) return;
        records.push({ subId:String(subId), teacherName, teacherId, className, classDate,
          comm:+comm, und:+und, cur:+cur, cum:+cum,
          observation: observation||'', createdAt: new Date().toISOString() });
        added++;
      });
      saveRecords(records);
      renderTable();
      alert(`Imported ${added} new record(s).`);
    } catch(err) { alert('Import failed: ' + err.message); }
  };
  reader.readAsArrayBuffer(file);
  event.target.value = '';
}

// ══════════════════════════════════════
// DASHBOARD CHARTS
// ══════════════════════════════════════
const PALETTE = {
  comm: { line:'#1a2e1e', fill:'rgba(26,46,30,0.08)' },
  und:  { line:'#c9a84c', fill:'rgba(201,168,76,0.10)' },
  cur:  { line:'#b85c38', fill:'rgba(184,92,56,0.10)' },
  cum:  { line:'#7a9e82', fill:'rgba(122,158,130,0.10)' },
};

function destroyChart(id) {
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
}

function renderDashboard() {
  let records = getRecords();
  const teacherFilter = document.getElementById('filter_teacherId').value.trim();
  const period        = document.getElementById('filter_period').value;

  if (teacherFilter) records = records.filter(r => r.teacherId === teacherFilter);

  if (period !== 'all') {
    const now = new Date();
    records = records.filter(r => {
      const d = new Date(r.classDate);
      if (period === 'week') { const s = new Date(now); s.setDate(now.getDate()-7); return d >= s; }
      if (period === 'month') return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
      return true;
    });
  }

  if (!records.length) { alert('No records match your filter.'); return; }
  records.sort((a,b) => new Date(a.classDate)-new Date(b.classDate));

  const avg = d => records.reduce((s,r) => s+r[d],0) / records.length;

  // ── Trend
  destroyChart('trend');
  chartInstances.trend = new Chart(document.getElementById('chart_trend'), {
    type:'line',
    data:{
      labels: records.map(r => `${r.classDate}`),
      datasets:[
        mkLine('Communication', records.map(r=>r.comm), PALETTE.comm),
        mkLine('Understanding', records.map(r=>r.und),  PALETTE.und),
        mkLine('Curiosity',     records.map(r=>r.cur),  PALETTE.cur),
        mkLine('Cumulative',    records.map(r=>r.cum),  PALETTE.cum),
      ]
    },
    options: { ...baseOpts(), scales:{ y:axisStyle(0,10), x:axisStyle() } }
  });

  // ── radar
  destroyChart('radar');
  chartInstances.radar = new Chart(document.getElementById('chart_radar'), {
    type:'radar',
    data:{
      labels:['Communication','Understanding','Curiosity','Cumulative'],
      datasets:[{
        label:'Average', data:[avg('comm'),avg('und'),avg('cur'),avg('cum')],
        borderColor:'#1a2e1e', backgroundColor:'rgba(26,46,30,0.08)',
        pointBackgroundColor:'#c9a84c', pointBorderColor:'#c9a84c',
        borderWidth:2, pointRadius:5
      }]
    },
    options:{ ...baseOpts(), scales:{ r:{
      min:0, max:10,
      ticks:{ color:'#7a6e5a', stepSize:2, backdropColor:'transparent', font:{family:"'DM Mono'",size:10} },
      grid:{ color:'#dfd6c4' },
      pointLabels:{ color:'#2c2416', font:{family:"'Playfair Display'",size:12,weight:'700'} }
    }}}
  });

  // ── averages
  destroyChart('bar');
  chartInstances.bar = new Chart(document.getElementById('chart_bar'), {
    type:'bar',
    data:{
      labels:['Communication','Understanding','Curiosity','Cumulative'],
      datasets:[{
        label:'Average Score',
        data:[avg('comm'),avg('und'),avg('cur'),avg('cum')],
        backgroundColor:['#1a2e1e','#c9a84c','#b85c38','#7a9e82'],
        borderRadius:6, borderSkipped:false
      }]
    },
    options:{ ...baseOpts(), scales:{ y:axisStyle(0,10), x:axisStyle() } }
  });

  // ── comparison
  const classes = [...new Set(records.map(r => r.className))];
  const classBars = d => classes.map(c => {
    const sub = records.filter(r => r.className===c);
    return sub.reduce((s,r)=>s+r[d],0)/sub.length;
  });
  destroyChart('class');
  chartInstances.class = new Chart(document.getElementById('chart_class'), {
    type:'bar',
    data:{
      labels: classes,
      datasets:[
        { label:'Communication', data:classBars('comm'), backgroundColor:'#1a2e1e', borderRadius:4 },
        { label:'Understanding', data:classBars('und'),  backgroundColor:'#c9a84c', borderRadius:4 },
        { label:'Curiosity',     data:classBars('cur'),  backgroundColor:'#b85c38', borderRadius:4 },
        { label:'Cumulative',    data:classBars('cum'),  backgroundColor:'#7a9e82', borderRadius:4 },
      ]
    },
    options:{ ...baseOpts(), scales:{ y:axisStyle(0,10), x:axisStyle() } }
  });

  // Stats
  document.getElementById('statsPanel').style.display = 'grid';
  document.getElementById('stat_sessions').textContent = records.length;
  document.getElementById('stat_comm').textContent     = avg('comm').toFixed(1);
  document.getElementById('stat_und').textContent      = avg('und').toFixed(1);
  document.getElementById('stat_cur').textContent      = avg('cur').toFixed(1);
  document.getElementById('stat_cum').textContent      = avg('cum').toFixed(1);
}

function mkLine(label, data, pal) {
  return {
    label, data,
    borderColor: pal.line, backgroundColor: pal.fill,
    tension: 0.4, pointRadius: 4, pointHoverRadius: 6,
    pointBackgroundColor: pal.line, fill: true, borderWidth: 2
  };
}

function baseOpts() {
  return {
    responsive:true, maintainAspectRatio:true,
    plugins:{
      legend:{ labels:{ color:'#4a3f2f', font:{ family:"'DM Sans'", size:12 }, boxWidth:12, padding:16 } },
      tooltip:{
        backgroundColor:'#1a2e1e', borderColor:'#c9a84c', borderWidth:1,
        titleColor:'#f5f0e8', bodyColor:'#7a9e82',
        titleFont:{ family:"'Playfair Display'", size:13 },
        bodyFont:{ family:"'DM Mono'", size:11 },
        padding:10, cornerRadius:8
      }
    }
  };
}

function axisStyle(min, max) {
  const s = {
    ticks:{ color:'#7a6e5a', font:{ family:"'DM Mono'",size:11 } },
    grid:{ color:'#ede6d8' },
    border:{ color:'#dfd6c4' }
  };
  if (min !== undefined) s.min = min;
  if (max !== undefined) s.max = max;
  return s;
}
