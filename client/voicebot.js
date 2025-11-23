// ==============================
// Voice & Translator Bot
// ==============================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'hi-IN'; // default Hindi
recognition.continuous = false;

function startVoiceCommand(){
  recognition.start();
}

recognition.onresult = function(event){
  const transcript = event.results[0][0].transcript.toLowerCase();
  console.log('Voice input:', transcript);
  processCommand(transcript);
};

function processCommand(text){
  // Basic commands
  if(text.includes('show jobs') || text.includes('dikhai jobs')){
    alert('Showing all jobs...');
  }
  if(text.includes('recharge wallet') || text.includes('wallet recharge')){
    $('#rechargeBtn').click();
  }
  if(text.includes('search') || text.includes('talash')){
    const input = prompt('Enter category to search:');
    $('#serviceSelect').value = input;
    $('#searchBtn').click();
  }
}

// Language switch buttons (if UI implemented)
function setLanguage(lang){
  recognition.lang = lang==='en' ? 'en-US' : 'hi-IN';
}
