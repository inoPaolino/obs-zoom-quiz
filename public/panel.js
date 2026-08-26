const socket = io();
const numPlayersSel = document.getElementById('numPlayers');
const playersDiv = document.getElementById('players');
const applyBtn = document.getElementById('applyPlayers');
const gridPanel = document.getElementById('gridPanel');
const awardSelect = document.getElementById('awardPlayer');
const awardBtn = document.getElementById('awardPoints');
const revealBtn = document.getElementById('revealNext');
const closeFullBtn = document.getElementById('closeFull');

let state = {
  players: [],
  scores: [],
  // default cell map: for demo uses images in /images/<difficulty>-<n>.jpg
  cellMap: {} 
};

// create players inputs by default 4
function renderPlayerInputs(count=4){
  playersDiv.innerHTML='';
  for(let i=0;i<count;i++){
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div>
      <input type="text" placeholder="Nome giocatore ${i+1}" id="pname${i}" />
      <div class="score-controls">
        <button data-i="${i}" class="inc">+100</button>
        <button data-i="${i}" class="dec">-100</button>
      </div>
    </div>`;
    playersDiv.appendChild(wrapper);
  }
}

function readPlayers(){
  const inputs = playersDiv.querySelectorAll('input[type=text]');
  const arr = [];
  for(const inp of inputs) arr.push({name: inp.value || inp.placeholder});
  return arr;
}

applyBtn.onclick = ()=>{
  const players = readPlayers();
  state.players = players;
  state.scores = players.map(()=>0);
  syncPlayers();
  renderAwardSelect();
};

function syncPlayers(){
  socket.emit('panel:updatePlayers', {players: state.players, scores: state.scores, title: 'Riconosci l\'oggetto zoomato?'});
}

function renderAwardSelect(){
  awardSelect.innerHTML='';
  state.players.forEach((p,i)=>{
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${i+1} - ${p.name}`;
    awardSelect.appendChild(opt);
  });
}

// prepare grid (6x3) with difficulties: first 6 easy, next 6 medium, last 6 hard
(function prepareGrid(){
  const cols = ['A','B','C','D','E','F'];
  const rows = [1,2,3];
  const cells = [];
  for(const r of rows){
    for(const c of cols){
      cells.push(`${c}${r}`);
    }
  }
  // assign difficulties: first 6 easy, next 6 medium, last 6 hard
  cells.forEach((id, idx)=>{
    const el = document.createElement('div');
    el.className='cell ' + (idx<6?'easy':(idx<12?'medium':'hard'));
    el.textContent = id;
    el.onclick = ()=>openCell(id, (idx<6?'easy':(idx<12?'medium':'hard')));
    gridPanel.appendChild(el);

    // default image mapping: /images/<difficulty>-<n>.jpg (user should add images)
    const seq = (idx%6)+1;
    state.cellMap[id] = {id, difficulty:(idx<6?'easy':(idx<12?'medium':'hard')), src:`/images/${idx<6?'easy':'{m}'}.jpg`};
    // NOTE: we won't rely on these default urls: ask user to add images and edit mapping below.
  });
})();

function openCell(id, difficulty){
  // For demo we expect images in /images/<difficulty>-<n>.jpg
  // Prompt for src quickly: in real app you'd manage a mapping UI
  const src = prompt(`URL immagine per cell ${id} (consigliato: /images/${difficulty}-${id}.jpg)`);
  if(!src) return;
  const cell = {id, difficulty, src};
  socket.emit('panel:openCell', cell);
  // store last selection to possibly award points
  state.currentCell = cell;
}

revealBtn.onclick = ()=> socket.emit('panel:revealNext');
closeFullBtn.onclick = ()=> socket.emit('panel:closeFull');

awardBtn.onclick = ()=>{
  const playerIndex = parseInt(awardSelect.value||'0',10);
  socket.emit('panel:awardPoints', {playerIndex});
  // update local score for display in panel
  state.scores[playerIndex] = (state.scores[playerIndex]||0) + 0; // overlay will compute real points and update
  // request overlay to push scores back might be implemented later
};

playersDiv.addEventListener('click', (e)=>{
  if(e.target.classList.contains('inc')){
    const i = parseInt(e.target.dataset.i,10);
    state.scores[i] = (state.scores[i]||0) + 100;
    socket.emit('panel:updateScores', state.scores);
  } else if(e.target.classList.contains('dec')){
    const i = parseInt(e.target.dataset.i,10);
    state.scores[i] = (state.scores[i]||0) - 100;
    socket.emit('panel:updateScores', state.scores);
  }
});

// initial
renderPlayerInputs(4);
renderAwardSelect();
