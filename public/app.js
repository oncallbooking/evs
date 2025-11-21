// app.js - minimal frontend interactions
const API = ''; // same origin

const main = document.getElementById('main');
const btnShowPost = document.getElementById('btnShowPost');
const btnShowJobs = document.getElementById('btnShowJobs');
const btnShowTechs = document.getElementById('btnShowTechs');
const btnDemoReset = document.getElementById('btnDemoReset');

btnShowPost.addEventListener('click', showPostForm);
btnShowJobs.addEventListener('click', showJobs);
btnShowTechs.addEventListener('click', showTechs);
btnDemoReset.addEventListener('click', loadDemo);

document.addEventListener('DOMContentLoaded', () => {
  showJobs();
});

function mk(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild;
}

async function fetchJSON(url, opts) {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) {
      const err = await res.json().catch(()=>({error:res.statusText}));
      throw err;
    }
    return await res.json();
  } catch (err) {
    console.error('fetch error', err);
    alert('Network error: '+ (err.error || JSON.stringify(err)));
    throw err;
  }
}

function showPostForm() {
  main.innerHTML = '';
  const c = mk(`
    <div class="container">
      <div class="card">
        <div class="job-title">Post a Job</div>
        <div class="small">Customers post quick jobs; technicians will bid.</div>
        <div style="margin-top:12px">
          <label class="field">Title <input id="jobTitle" class="input" placeholder="eg. AC not cooling"></label>
          <label class="field">Description <textarea id="jobDesc" class="input" rows="4"></textarea></label>
          <div class="row">
            <label class="field" style="flex:1">Pincode<input id="jobPin" class="input" placeholder="110001"></label>
            <label class="field" style="width:140px">Budget<input id="jobBudget" class="input" placeholder="₹"></label>
          </div>
          <div class="row">
            <select id="jobUrgency" class="input" style="width:160px">
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
            <button class="btn" id="postJobBtn">Post Job</button>
          </div>
        </div>
      </div>
    </div>
  `);
  main.appendChild(c);

  document.getElementById('postJobBtn').addEventListener('click', async () => {
    const title = document.getElementById('jobTitle').value.trim();
    const description = document.getElementById('jobDesc').value.trim();
    const pincode = document.getElementById('jobPin').value.trim();
    const budget = Number(document.getElementById('jobBudget').value || 0);
    const urgency = document.getElementById('jobUrgency').value;

    if (!title || !pincode) return alert('Please enter title and pincode.');
    const job = await fetchJSON('/api/jobs', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ title, description, pincode, budget, urgency })
    });
    alert('Job posted: ' + job.id);
    showJobs();
  });
}

async function showJobs() {
  main.innerHTML = '';
  const container = mk('<div class="container"></div>');
  container.innerHTML = '<div class="card"><div class="job-title">Open Jobs</div></div>';
  const listCard = mk('<div></div>');
  container.appendChild(listCard);
  main.appendChild(container);

  const jobs = await fetchJSON('/api/jobs');
  if (jobs.length === 0) {
    listCard.innerHTML = '<div class="card small">No jobs yet. Post the first job!</div>';
    return;
  }

  jobs.forEach(job => {
    const jobEl = mk(`
      <div class="card">
        <div class="job-title">${escapeHtml(job.title)}</div>
        <div class="job-meta">Pincode: ${job.pincode} • Budget: ${job.budget ? '₹' + job.budget : 'NA'} • ${job.urgency} • Status: ${job.status}</div>
        <div style="margin-top:8px">${escapeHtml(job.description || '')}</div>
        <div id="bids-${job.id}" style="margin-top:10px"></div>
        <div style="margin-top:10px" class="row">
          <button class="btn" onclick="openJob('${job.id}')">View / Bid</button>
        </div>
      </div>
    `);
    listCard.appendChild(jobEl);
    loadBids(job.id);
  });
}

// open single job view
async function openJob(jobId) {
  const job = await fetchJSON('/api/jobs/' + jobId);
  main.innerHTML = '';
  const container = mk('<div class="container"></div>');
  container.innerHTML = `
    <div class="card">
      <div class="job-title">${escapeHtml(job.title)}</div>
      <div class="job-meta">Pincode: ${job.pincode} • Budget: ${job.budget ? '₹' + job.budget : 'NA'}</div>
      <div style="margin-top:8px">${escapeHtml(job.description)}</div>
      <div id="bids-area"></div>
      <div style="margin-top:8px" class="row">
        <button class="btn" id="goBack">Back</button>
      </div>
    </div>
  `;
  main.appendChild(container);

  document.getElementById('goBack').addEventListener('click', showJobs);
  renderBidSection(job);
}

async function renderBidSection(job) {
  const bidsArea = document.getElementById('bids-area');
  bidsArea.innerHTML = '';
  const bcard = mk('<div class="card"></div>');
  bcard.innerHTML = `
    <div class="small">Place a bid (simulate being a technician). Choose technician & amount.</div>
    <div style="margin-top:8px" class="row">
      <select id="selTech" class="input" style="flex:1"></select>
      <input id="bidAmt" class="input" style="width:120px" placeholder="Amount">
      <button class="btn" id="placeBidBtn">Bid</button>
    </div>
    <div style="margin-top:12px" id="existingBidsArea"></div>
  `;
  bidsArea.appendChild(bcard);

  // load technicians
  const techs = await fetchJSON('/api/technicians');
  const sel = document.getElementById('selTech');
  sel.innerHTML = techs.map(t => `<option value="${t.id}">${escapeHtml(t.name)} • ${t.skills.join(', ')}</option>`).join('');

  document.getElementById('placeBidBtn').addEventListener('click', async () => {
    const techId = sel.value;
    const amount = Number(document.getElementById('bidAmt').value || 0);
    if (!amount || amount <= 0) return alert('Enter valid amount');
    const bid = await fetchJSON('/api/bids', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ jobId: job.id, technicianId: techId, amount, note: 'From prototype UI' })
    });
    alert('Bid placed: ' + bid.bid.id);
    loadBids(job.id);
    renderBidSection(job); // refresh
  });

  // load existing bids
  loadBids(job.id, document.getElementById('existingBidsArea'));
}

async function loadBids(jobId, targetEl) {
  const bids = await fetchJSON('/api/bids?jobId=' + encodeURIComponent(jobId));
  const area = targetEl || document.getElementById('bids-' + jobId);
  if (!area) return;
  if (bids.length === 0) {
    area.innerHTML = '<div class="small">No bids yet.</div>';
    return;
  }
  area.innerHTML = '';
  const tb = mk('<div></div>');
  bids.forEach(b => {
    const el = mk(`
      <div class="bid-item">
        <div><strong>₹${b.amount}</strong> • <span class="small">${new Date(b.createdAt).toLocaleString()}</span></div>
        <div class="small">Note: ${escapeHtml(b.note || '')}</div>
        <div style="margin-top:8px">
          <button class="btn" onclick="acceptBid('${b.jobId}','${b.id}')">Accept</button>
        </div>
      </div>
    `);
    tb.appendChild(el);
  });
  area.appendChild(tb);
}

async function acceptBid(jobId, bidId) {
  if (!confirm('Accept this bid? (This will mark job assigned in demo)')) return;
  const res = await fetchJSON(`/api/jobs/${jobId}/accept`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ bidId })
  });
  alert('Bid accepted. Job assigned.');
  showJobs();
}

async function showTechs() {
  main.innerHTML = '';
  const container = mk('<div class="container"></div>');
  container.innerHTML = '<div class="card"><div class="job-title">Technicians</div><div class="small">Tap a technician to see details</div></div>';
  const list = mk('<div></div>');
  container.appendChild(list);
  main.appendChild(container);

  const techs = await fetchJSON('/api/technicians');
  if (techs.length === 0) {
    list.innerHTML = '<div class="card small">No technicians yet.</div>';
    return;
  }

  techs.forEach(t => {
    const techEl = mk(`
      <div class="card tech-card" style="flex-direction:row;justify-content:space-between">
        <div style="display:flex;gap:12px;align-items:center">
          <div class="tech-avatar">${escapeHtml(t.name.split(' ').map(n=>n[0]).slice(0,2).join(''))}</div>
          <div>
            <div style="font-weight:700">${escapeHtml(t.name)}</div>
            <div class="small">${t.skills.join(', ')} • ₹${t.priceFrom} onwards</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
          <div class="small">⭐ ${t.rating}</div>
          <button class="btn" onclick="viewTech('${t.id}')">View</button>
        </div>
      </div>
    `);
    list.appendChild(techEl);
  });
}

async function viewTech(id) {
  const techs = await fetchJSON('/api/technicians');
  const t = techs.find(x=>x.id===id);
  if (!t) return alert('Not found');
  main.innerHTML = '';
  const c = mk(`
    <div class="container">
      <div class="card">
        <div style="display:flex;gap:12px;align-items:center">
          <div class="tech-avatar" style="width:80px;height:80px;border-radius:12px">${escapeHtml(t.name.split(' ').map(n=>n[0]).slice(0,2).join(''))}</div>
          <div>
            <div style="font-weight:800;font-size:18px">${escapeHtml(t.name)}</div>
            <div class="small">${t.skills.join(', ')}</div>
            <div class="small">Rating: ${t.rating}</div>
            <div class="small">Coverage: ${t.pincodeCoverage.join(', ')}</div>
          </div>
        </div>
        <div style="margin-top:12px" class="row">
          <button class="btn" onclick="showTechs()">Back</button>
        </div>
      </div>
    </div>
  `);
  main.appendChild(c);
}

async function loadDemo() {
  if (!confirm('Load demo data? This will replace current demo DB.')) return;
  await fetchJSON('/api/__reset_demo', { method: 'POST' });
  alert('Demo data loaded.');
  showJobs();
}

// small helpers
function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// expose some functions to window for inline handlers
window.openJob = openJob;
window.acceptBid = acceptBid;
window.viewTech = viewTech;
