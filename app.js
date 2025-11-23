// MASTER DATA
const SECTORS = [
  {name:"Construction",hi:"निर्माण",roles:18},
  {name:"Industrial",hi:"औद्योगिक",roles:8},
  {name:"Agriculture",hi:"कृषि",roles:8},
  {name:"Domestic",hi:"घरेलू",roles:8},
  {name:"Transport",hi:"परिवहन",roles:5},
  {name:"Events",hi:"इवेंट्स",roles:6},
  {name:"Retail",hi:"रिटेल",roles:6}
];

const ROLES = [
  ["Mason", "Rajmistri","Construction"],
  ["Carpenter","बढ़ई","Construction"],
  ["Electrician","इलेक्ट्रीशियन","Construction"],
  ["Plumber","प्लंबर","Construction"],
  ["Welder / Fabricator", "वेल्डर","Construction"],
  ["Tile / Marble Worker","टाइल / मार्बल","Construction"],
  ["Painter","पेंटर","Construction"],
  ["Bar Bender","स्टील फिक्सर","Construction"],
  ["Scaffolder","मचान मजदूर","Construction"],
  ["Heavy Machine Operator","JCB/Crane","Construction"],
  ["Surveyor Helper","सर्वे हेल्पर","Construction"],
  ["Helper","निर्माण सहायक","Construction"],
  ["Material Handler","सामान उठाने वाला","Construction"],
  ["Road Worker","सड़क मजदूर","Construction"],
  ["Paver block worker","पेवर ब्लॉक","Construction"],
  ["Machine operator","मशीन ऑपरेटर","Industrial"],
  ["Forklift operator","फॉर्कलिफ्ट","Industrial"],
  ["Warehouse picker","वेयरहाउस","Industrial"],
  ["Sowing labour","बुवाई","Agriculture"],
  ["Harvesting worker","कटाई","Agriculture"],
  ["Tractor driver","ट्रैक्टर ड्राइवर","Agriculture"],
  ["Housemaid","कामवाली","Domestic"],
  ["Cook","रसोईया","Domestic"],
  ["Driver","ड्राइवर","Domestic"],
  ["Watchman","चौकीदार","Domestic"],
  ["Delivery helper","डिलीवरी सहायक","Transport"],
  ["Loader","लोडर","Transport"],
  ["Event setup","इवेंट सेटअप","Events"],
  ["Waiter","वेटर","Events"],
  ["Store helper","दुकान सहायक","Retail"],
  ["Promoter","प्रमोटर","Retail"],
];

// Render Sector roller
const sectorRoller = document.getElementById("sectorRoller");
SECTORS.forEach(sec=>{
  const b=document.createElement("button");
  b.className="sector";
  b.innerHTML=`${sec.name}<br><span class="hi">${sec.hi}</span>`;
  b.onclick=()=>filterSector(sec.name);
  sectorRoller.appendChild(b);
});

// Role grid
const grid = document.getElementById("roleGrid");
function renderRoles(list){
  grid.innerHTML="";
  list.forEach(r=>{
    const div=document.createElement("div");
    div.className="role-card";
    div.dataset.sector=r[2];
    div.textContent=`${r[0]} • ${r[1]}`;
    grid.appendChild(div);
  });
}
renderRoles(ROLES);

function filterSector(sec){
  renderRoles(ROLES.filter(r=>r[2]===sec));
}

// Expand Worker demo
document.addEventListener("click",e=>{
  if(e.target.classList.contains("tech-card")){
    const d=e.target.querySelector(".tech-details");
    document.querySelectorAll(".tech-details").forEach(x=>x.style.display="none");
    d.style.display=(d.style.display==="block")?"none":"block";
  }
});

// Voice Search
const speech = window.SpeechRecognition || window.webkitSpeechRecognition;
if(speech){
  const rec = new speech();
  document.getElementById("voiceBtn").onclick=()=>{
    rec.start();
  };
  rec.onresult=e=>{
    const text=e.results[0][0].transcript;
    document.getElementById("pinInput").value=text;
  };
}

// GPS auto PIN
document.getElementById("locateBtn").onclick=()=>{
  navigator.geolocation.getCurrentPosition(pos=>{
    alert("Location detected! API connect needed for real PIN.");
  });
};
