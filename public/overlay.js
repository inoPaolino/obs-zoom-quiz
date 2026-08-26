const socket = io();
const root = document.getElementById('root');
const playersContainer = document.getElementById('players-container');
const titleEl = document.getElementById('title');
const full = document.getElementById('full');
const fullImg = document.getElementById('full-img');
const gridEl = document.getElementById('grid');

let state = {
  players: [],
  scores: [],
  currentCell: null,
  zoomStage: 0,
  zoomStages: [4,2,1], // scale factors for visual zoom: stage0 most zoomed
  cellMap: {}, // cellId -> {src, difficulty}
};

// create helper: generate grid guide cells A1..F3 with difficulty classes
(function generateGrid(){
  const cols = ['A','B','C','D','E','F'];
  const rows = [1,2,3];
  let idx = 0;
  for(const r of rows){
    for(const c of cols){
      const id = `${c}${r}`;
      const div = document.createElement('div');
      // assign difficulty classes consistent with the panel: first 6 easy, next 6 medium, last 6 hard
      const cls = (idx<6)?'easy':(idx<12)?'medium':'hard';
      div.className = 'cell ' + cls;
      div.textContent = id;
      gridEl.appendChild(div);
      idx++;
    }
  }
})();

socket.on('overlay:updatePlayers', (data)=>{
  // data: {players:[{name}], scores:[number], title}
  state.players = data.players || [];
  state.scores = data.scores || state.players.map(()=>0);
  if(data.title) titleEl.textContent = data.title;
  renderPlayers();
});

socket.on('overlay:updateScores', (scores)=>{
  state.scores = scores;
  renderPlayers();
});

socket.on('overlay:openCell', (cell)=>{
  // cell: {id, src, difficulty}
  state.currentCell = cell;
  state.zoomStage = 0;
  if(cell && cell.src){
    fullImg.src = cell.src;
    applyZoom();
    full.classList.remove('hidden');
  }
});

socket.on('overlay:revealNext', ()=>{
  if(state.currentCell==null) return;
  state.zoomStage = Math.min(state.zoomStage+1, state.zoomStages.length-1);
  applyZoom();
});

socket.on('overlay:awardPoints', ({playerIndex})=>{
  if(state.currentCell==null) return;
  const diff = state.currentCell.difficulty || 'easy';
  const maxMap = {easy:100, medium:200, hard:300};
  const maxPoints = maxMap[diff] || 100;
  const stages = state.zoomStages.length;
  const pts = Math.round(maxPoints * ((stages - state.zoomStage) / stages));
  state.scores[playerIndex] = (state.scores[playerIndex]||0) + pts;
  renderPlayers();
  // una volta assegnato chiudi immagine
  state.currentCell = null;
  full.classList.add('hidden');
});

socket.on('overlay:closeFull', ()=>{
  state.currentCell = null;
  full.classList.add('hidden');
});

function applyZoom(){
  const z = state.zoomStages[state.zoomStage] || 1;
  fullImg.style.transform = `scale(${z})`;
}

function renderPlayers(){
  playersContainer.innerHTML='';
  const n = state.players.length;
  // positions based on n: 1 top-left, 2 top-left + top-right, 3 left stacked, 4 corners
  const positions = computePositions(n);
  for(let i=0;i<n;i++){
    const p = state.players[i] || {name:`Player ${i+1}`};
    const box = document.createElement('div');
    box.className='player-box';
    const pos = positions[i];
    box.style.left = pos.left;
    box.style.top = pos.top;
    box.style.width = pos.width;
    box.style.height = pos.height;
    box.style.transform = pos.transform || '';
    box.innerHTML = `<div class="player-video">VIDEO ${i+1}</div>
      <div class="player-name">${p.name}</div>
      <div class="player-score">Punti: ${state.scores[i]||0}</div>`;
    playersContainer.appendChild(box);
  }
}

function computePositions(n){
  // percentages or px; return array length n objects {left,top,width,height,transform}
  if(n===1){
    return [{left:'10px',top:'10px',width:'280px',height:'160px'}];
  } else if(n===2){
    return [
      {left:'10px',top:'10px',width:'280px',height:'160px'},
      {left:'calc(100% - 290px)',top:'10px',width:'280px',height:'160px'}
    ];
  } else if(n===3){
    return [
      {left:'10px',top:'10px',width:'280px',height:'120px'},
      {left:'10px',top:'140px',width:'280px',height:'120px'},
      {left:'10px',top:'270px',width:'280px',height:'120px'}
    ];
  } else { //4
    return [
      {left:'10px',top:'10px',width:'220px',height:'140px'},
      {left:'calc(100% - 230px)',top:'10px',width:'220px',height:'140px'},
      {left:'10px',top:'calc(100% - 150px)',width:'220px',height:'140px'},
      {left:'calc(100% - 230px)',top:'calc(100% - 150px)',width:'220px',height:'140px'}
    ];
  }
}
