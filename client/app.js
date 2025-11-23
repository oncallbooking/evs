// ==============================
// LabourConnect Main JS
// ==============================

// Helpers
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));

// Mock user session
let currentUser = {name:'Guest', wallet:0, unlockedChats:[]};
let technicians = [
  {id:1,name:'Rohit Sharma',category:'Electrician',phone:'912345678901',walletRequired:true},
  {id:2,name:'Imran Khan',category:'Plumber',phone:'919876543210',walletRequired:true},
  {id:3,name:'Rahul Verma',category:'AC',phone:'919998887776',walletRequired:false}
];

let jobs = [
  {id:101,title:'Fix AC',category:'AC',location:'Bengaluru',bidders:[]},
  {id:102,title:'Pipe leakage',category:'Plumber',location:'Mumbai',bidders:[]}
];

// ========== DASHBOARD FUNCTIONS ==========
function renderDashboard(){
  if($('#userName')) $('#userName').textContent = currentUser.name;
  if($('#walletBalance')) $('#walletBalance').textContent = currentUser.wallet;

  // Jobs
  const jobList = $('#jobList');
  if(jobList){
    jobList.innerHTML = jobs.map(job=>{
      return `<div class="job-card">
        <b>${job.title}</b> • <span>${job.category}</span> • <span>${job.location}</span>
        <button class="unlockChatBtn" data-id="${job.id}">Chat / Bid</button>
      </div>`;
    }).join('');
  }

  // Chats
  const chatList = $('#chatList');
  if(chatList){
    chatList.innerHTML = currentUser.unlockedChats.map(chat=>{
      return `<div class="tech-card">${chat.name} • <a href="https://wa.me/${chat.phone}" target="_blank">WhatsApp</a></div>`;
    }).join('');
  }
}

// Unlock chat with wallet deduction
function unlockChat(techId){
  const tech = technicians.find(t=>t.id==techId);
  if(!tech) return;
  if(currentUser.unlockedChats.find(c=>c.id==tech.id)){
    alert('Chat already unlocked!');
    return;
  }
  if(currentUser.wallet < 10){
    alert('Wallet insufficient! Recharge first.');
    return;
  }
  currentUser.wallet -= 10;
  currentUser.unlockedChats.push(tech);
  renderDashboard();
  alert(`Chat with ${tech.name} unlocked! ₹10 deducted.`);
}

// ========== POST JOB ==========
function setupPostJobForm(){
  const form = $('#postJobForm');
  if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const title = $('#jobTitle').value;
    const category = $('#jobCategory').value;
    const desc = $('#jobDesc').value;
    const location = $('#jobLocation').value;
    const id = Date.now();
    jobs.push({id,title,category,desc,location,bidders:[]});
    alert('Job posted!');
    form.reset();
  });
}

// ========== WALLET / RECHARGE ==========
function setupRecharge(){
  const btn = $('#rechargeBtn');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    const amt = prompt('Enter recharge amount (₹100,200,500)');
    if(!amt) return;
    currentUser.wallet += parseInt(amt);
    alert(`Wallet recharged ₹${amt}`);
    renderDashboard();
  });
}

// ========== CATEGORY SEARCH ==========
function setupCategorySearch(){
  const select = $('#serviceSelect');
  const searchBtn = $('#searchBtn');
  if(!searchBtn || !select) return;
  searchBtn.addEventListener('click', ()=>{
    const cat = select.value;
    const filteredTechs = technicians.filter(t=>t.category.toLowerCase() === cat.toLowerCase());
    if(filteredTechs.length==0) alert('No technicians found for this category');
    else alert(`${filteredTechs.length} technicians found`);
  });
}

// ========== TECHNICIAN CHAT BUTTON ==========
function setupChatButtons(){
  $$('.unlockChatBtn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = parseInt(btn.getAttribute('data-id'));
      unlockChat(id);
    });
  });
}

// ========== GPS ==========
function detectLocation(){
  if(!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos=>{
    console.log('User location:', pos.coords.latitude, pos.coords.longitude);
  });
}

// ========== DOM LOAD ==========
document.addEventListener('DOMContentLoaded', ()=>{
  renderDashboard();
  setupPostJobForm();
  setupRecharge();
  setupCategorySearch();
  setupChatButtons();
  detectLocation();
});
