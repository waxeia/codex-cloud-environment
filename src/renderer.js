const IDLE_TIME = 30_000;
const titleInput = document.querySelector('#title');
const noteInput = document.querySelector('#note');
const counter = document.querySelector('#counter');
const status = document.querySelector('#status');
const pinButton = document.querySelector('#pinButton');
const hideButton = document.querySelector('#hideButton');

let idleTimer;
let saveTimer;
let ghost = false;

function loadNote() {
  titleInput.value = localStorage.getItem('mimi-title') || '今天也要加油呀';
  noteInput.value = localStorage.getItem('mimi-note') || '';
  updateCounter();
}

function updateCounter() {
  counter.textContent = `${noteInput.value.length} / 2000`;
}

function saveNote() {
  localStorage.setItem('mimi-title', titleInput.value);
  localStorage.setItem('mimi-note', noteInput.value);
  status.textContent = '已自动保存';
}

function scheduleSave() {
  status.textContent = '保存中…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNote, 300);
}

function enterGhostMode() {
  if (ghost) return;
  ghost = true;
  document.body.classList.add('ghost');
}

function wakeUp() {
  clearTimeout(idleTimer);
  if (ghost) {
    ghost = false;
    document.body.classList.remove('ghost');
  }
  idleTimer = setTimeout(enterGhostMode, IDLE_TIME);
}

document.addEventListener('pointerdown', wakeUp, true);
document.addEventListener('keydown', wakeUp, true);
document.addEventListener('wheel', wakeUp, { capture: true, passive: true });

titleInput.addEventListener('input', scheduleSave);
noteInput.addEventListener('input', () => {
  updateCounter();
  scheduleSave();
});

pinButton.addEventListener('click', async () => {
  const pinned = await window.widget.togglePin();
  pinButton.classList.toggle('active', pinned);
  pinButton.title = pinned ? '取消置顶' : '始终置顶';
});

hideButton.addEventListener('click', () => window.widget.hide());

window.widget.onWakeUp(wakeUp);
window.widget.onPinChanged((pinned) => {
  pinButton.classList.toggle('active', pinned);
  pinButton.title = pinned ? '取消置顶' : '始终置顶';
});

window.addEventListener('beforeunload', saveNote);

loadNote();
wakeUp();
