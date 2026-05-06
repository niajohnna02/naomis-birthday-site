/* =====================================================
   NAOMI'S BIRTHDAY WEBSITE — script.js
   Interactive logic: navigation, journal, playlist, games
   ===================================================== */

// ---- SPARKLES ----
const sparkleContainer = document.getElementById('sparkleContainer');
const sparkleEmojis = ['✦','⋆','♡','⭐︎','☼','✿','*'];

function createSparkle(x, y) {
  const el = document.createElement('div');
  el.className = 'sparkle';
  el.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
  el.style.left = (x - 12) + 'px';
  el.style.top = (y - 12) + 'px';
  el.style.fontSize = (12 + Math.random() * 14) + 'px';
  el.style.animationDuration = (0.8 + Math.random() * 0.8) + 's';
  sparkleContainer.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}

document.addEventListener('mousemove', (e) => {
  if (Math.random() < 0.06) createSparkle(e.clientX, e.clientY);
});

// ---- FLOATING HEARTS ----
const heartsContainer = document.getElementById('heartsContainer');
function createFloatHeart() {
  const hearts = ['♡','✿','⭐︎','☼','✦'];
  const el = document.createElement('div');
  el.className = 'float-heart';
  el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
  el.style.left = Math.random() * 100 + 'vw';
  el.style.animationDuration = (12 + Math.random() * 16) + 's';
  el.style.animationDelay = Math.random() * 5 + 's';
  el.style.fontSize = (10 + Math.random() * 12) + 'px';
  heartsContainer.appendChild(el);
  setTimeout(() => el.remove(), 28000);
}
for (let i = 0; i < 18; i++) createFloatHeart();
setInterval(createFloatHeart, 2500);

// ---- SCREEN NAVIGATION ----
const screens = {
  welcome: document.getElementById('welcome-screen'),
  home: document.getElementById('home-screen'),
  letter: document.getElementById('letter-screen'),
  journal: document.getElementById('journal-screen'),
  playlist: document.getElementById('playlist-screen'),
  games: document.getElementById('games-screen'),
};

function goTo(screenName) {
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  screens[screenName].classList.remove('hidden');
  window.scrollTo(0, 0);
  // Burst sparkles on transition
  for (let i = 0; i < 12; i++) {
    setTimeout(() => createSparkle(
      Math.random() * window.innerWidth,
      Math.random() * window.innerHeight * 0.5
    ), i * 60);
  }
}

// Welcome → Home
document.getElementById('presentBtn').addEventListener('click', () => {
  // Big sparkle burst!
  for (let i = 0; i < 30; i++) {
    setTimeout(() => createSparkle(
      Math.random() * window.innerWidth,
      Math.random() * window.innerHeight
    ), i * 40);
  }
  setTimeout(() => goTo('home'), 400);
});

// Home buttons
document.getElementById('btn-letter').addEventListener('click', () => goTo('letter'));
document.getElementById('btn-journal').addEventListener('click', () => goTo('journal'));
document.getElementById('btn-playlist').addEventListener('click', () => goTo('playlist'));
document.getElementById('btn-games').addEventListener('click', () => goTo('games'));

// Home → Welcome (back button on main menu)
document.getElementById('home-back-btn').addEventListener('click', () => goTo('welcome'));

// Back buttons
document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => goTo('home'));
});

// =====================================================
// =====================================================
// JOURNAL & STICKER SHOP
// =====================================================
 
// --- State ---
let stickerInventory = {};  // { key: count } — stickers the user owns
let journalStickers  = [];  // sticker keys queued for the current entry
let shopCart         = {};  // quantities being picked in the shop
 
const journalEntriesEl = document.getElementById('journalEntries');
const journalEmptyEl   = document.getElementById('journalEmpty');
 
// Sticker metadata: key → asset path & display label
const STICKERS = {
  'brown-bear':       { src: 'assets/brown-bear.png',       label: 'brown bear' },
  'cherry-bear':      { src: 'assets/cherry-bear.png',      label: 'cherry bear' },
  'cherry-clock':     { src: 'assets/cherry-clock.png',     label: 'cherry clock' },
  'pink-cherry-bear': { src: 'assets/pink-cherry-bear.png', label: 'pink cherry bear' },
  'pink-heart1':      { src: 'assets/pink-heart1.png',      label: 'pink heart' },
  'pink-heart2':      { src: 'assets/pink-heart2.png',      label: 'hot pink heart' },
  'small-brown-bear': { src: 'assets/small-brown-bear.png', label: 'small brown bear' },
  'small-pinkbear':   { src: 'assets/small-pinkbear.png',   label: 'small pink bear' },
};
 
// --- Sticker Shop Modal ---
const shopModal = document.getElementById('sticker-shop-modal');
 
document.getElementById('openStickerShop').addEventListener('click', () => {
  // Reset cart to 0 when opening
  shopCart = {};
  Object.keys(STICKERS).forEach(key => {
    shopCart[key] = 0;
    document.getElementById('qty-' + key).textContent = '0';
  });
  shopModal.classList.add('active');
});
 
// Quantity +/− buttons
document.querySelectorAll('.qty-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key    = btn.dataset.sticker;
    const action = btn.dataset.action;
    shopCart[key] = Math.max(0, (shopCart[key] || 0) + (action === 'plus' ? 1 : -1));
    const display = document.getElementById('qty-' + key);
    display.textContent = shopCart[key];
    display.style.transform = 'scale(1.4)';
    setTimeout(() => display.style.transform = '', 200);
  });
});
 
// "I'm done!" — add cart to inventory, close modal
document.getElementById('shopDoneBtn').addEventListener('click', () => {
  let addedAny = false;
  Object.entries(shopCart).forEach(([key, qty]) => {
    if (qty > 0) {
      stickerInventory[key] = (stickerInventory[key] || 0) + qty;
      addedAny = true;
    }
  });
  shopModal.classList.remove('active');
  renderStickerInventory();
  if (addedAny) {
    for (let i = 0; i < 14; i++) {
      setTimeout(() => createSparkle(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight * 0.6
      ), i * 45);
    }
  }
});
 
// "Leave shop" / ✕ — close without adding
document.getElementById('shopLeaveBtn').addEventListener('click', closeShop);
document.getElementById('closeStickerShopLeave').addEventListener('click', closeShop);
shopModal.addEventListener('click', e => { if (e.target === shopModal) closeShop(); });
 
function closeShop() {
  shopModal.classList.remove('active');
}
 
// --- Inventory panel ---
function renderStickerInventory() {
  const grid    = document.getElementById('stickerInventoryGrid');
  const emptyEl = document.getElementById('inventoryEmpty');
  grid.querySelectorAll('.inventory-sticker').forEach(el => el.remove());
 
  const hasAny = Object.values(stickerInventory).some(c => c > 0);
  emptyEl.style.display = hasAny ? 'none' : '';
 
  Object.entries(stickerInventory).forEach(([key, count]) => {
    if (count <= 0) return;
    const chip = document.createElement('button');
    chip.className = 'inventory-sticker';
    chip.title = `${STICKERS[key].label} (×${count} left)`;
    chip.innerHTML = `
      <img src="${STICKERS[key].src}" alt="${STICKERS[key].label}" class="inv-sticker-img">
      <span class="inv-sticker-count">×${count}</span>
    `;
    chip.addEventListener('click', () => {
      if (stickerInventory[key] <= 0) return;
      stickerInventory[key]--;
      journalStickers.push(key);
      renderStickerInventory();
      renderJournalStickerPreview();
      chip.style.transform = 'scale(1.25) rotate(-5deg)';
      setTimeout(() => chip.style.transform = '', 250);
    });
    grid.appendChild(chip);
  });
}
 
// --- Sticker preview (queued for current entry) ---
function renderJournalStickerPreview() {
  const preview = document.getElementById('journalStickerPreview');
  preview.innerHTML = '';
  journalStickers.forEach((key, idx) => {
    const img = document.createElement('img');
    img.src   = STICKERS[key].src;
    img.alt   = STICKERS[key].label;
    img.className = 'preview-sticker-img';
    img.title = 'click to remove';
    img.addEventListener('click', () => {
      stickerInventory[key] = (stickerInventory[key] || 0) + 1;
      journalStickers.splice(idx, 1);
      renderStickerInventory();
      renderJournalStickerPreview();
    });
    preview.appendChild(img);
  });
}
 
// --- Save journal entry ---
document.getElementById('saveJournalBtn').addEventListener('click', () => {
  const text = document.getElementById('journalText').value.trim();
  if (!text) { shakeEl(document.getElementById('journalText')); return; }
 
  const entry = {
    text,
    stickers: [...journalStickers],
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  };
 
  addJournalEntry(entry);
  document.getElementById('journalText').value = '';
  journalStickers = [];
  renderJournalStickerPreview();
 
  for (let i = 0; i < 10; i++) {
    setTimeout(() => createSparkle(
      Math.random() * window.innerWidth,
      Math.random() * window.innerHeight * 0.6
    ), i * 50);
  }
});
 
function addJournalEntry(entry) {
  journalEmptyEl.style.display = 'none';
  const card = document.createElement('div');
  card.className = 'entry-card';
 
  const stickersHTML = entry.stickers.length
    ? `<div class="entry-stickers">
        ${entry.stickers.map(key =>
          `<img src="${STICKERS[key].src}" alt="${STICKERS[key].label}" class="entry-sticker-img">`
        ).join('')}
       </div>`
    : '';
 
  card.innerHTML = `
    <div class="entry-date">✿ ${entry.date}</div>
    <div class="entry-text">${entry.text}</div>
    ${stickersHTML}
    <button class="entry-delete" title="delete">✕</button>
  `;
  card.querySelector('.entry-delete').addEventListener('click', () => {
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9)';
    card.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      card.remove();
      if (!journalEntriesEl.querySelector('.entry-card')) journalEmptyEl.style.display = '';
    }, 300);
  });
  journalEntriesEl.appendChild(card);
}

// =====================================================
// PLAYLIST
// =====================================================
let songs = [];
const playlistListEl = document.getElementById('playlistList');
const playlistEmptyEl = document.getElementById('playlistEmpty');

document.getElementById('addSongBtn').addEventListener('click', () => {
  const title = document.getElementById('songTitle').value.trim();
  const artist = document.getElementById('songArtist').value.trim();
  if (!title) { shakeEl(document.getElementById('songTitle')); return; }
  
  songs.push({ title, artist });
  renderPlaylist();
  document.getElementById('songTitle').value = '';
  document.getElementById('songArtist').value = '';
  
  for (let i = 0; i < 8; i++) {
    setTimeout(() => createSparkle(
      Math.random() * window.innerWidth,
      Math.random() * 300
    ), i * 40);
  }
});

// Allow enter key on playlist fields
['songTitle','songArtist'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('addSongBtn').click();
  });
});

function renderPlaylist() {
  playlistEmptyEl.style.display = songs.length ? 'none' : '';
  const existing = playlistListEl.querySelectorAll('.song-card');
  existing.forEach(el => el.remove());
  
  songs.forEach((song, i) => {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.innerHTML = `
      <span class="song-num">${i + 1}</span>
      <div class="song-info">
        <div class="song-title">🎵 ${escHtml(song.title)}</div>
        ${song.artist ? `<div class="song-artist">by ${escHtml(song.artist)}</div>` : ''}
      </div>
      <span class="song-note">♡</span>
      <button class="song-delete" data-idx="${i}" title="remove">✕</button>
    `;
    card.querySelector('.song-delete').addEventListener('click', (e) => {
      songs.splice(Number(e.target.dataset.idx), 1);
      renderPlaylist();
    });
    playlistListEl.appendChild(card);
  });
}

// =====================================================
// GAMES
// =====================================================

// Open modals
document.querySelectorAll('[data-game]').forEach(btn => {
  btn.addEventListener('click', () => {
    const game = btn.dataset.game;
    const modal = document.getElementById(game + '-modal');
    modal.classList.add('active');
    if (game === 'scramble') initScramble();
    if (game === 'memory') initMemory();
    if (game === 'wyr') initWYR();
  });
});

// Close modals
document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.game-modal-overlay').forEach(m => m.classList.remove('active'));
  });
});

document.querySelectorAll('.game-modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('active');
  });
});

// ---- WORD SCRAMBLE ----
const scrambleWords = [
  { word: 'CHERRY', hint: '🍒 a sweet red fruit' },
  { word: 'MUSIC', hint: '🎵 something Naomi loves' },
  { word: 'BLOOM', hint: '🌸 what flowers do in spring' },
  { word: 'DREAM', hint: '✨ what you do when you sleep' },
  { word: 'JOURNAL', hint: '📓 write your thoughts here' },
  { word: 'SPARKLE', hint: '💫 to shine and glimmer' },
  { word: 'COZY', hint: '🌙 warm and comfortable' },
  { word: 'HEART', hint: '♡ symbol of love' },
  { word: 'BLOSSOM', hint: '🌸 a flower in full bloom' },
  { word: 'NAOMI', hint: '👑 the birthday girl!' },
];

let scrambleScore = 0;
let scrambleIdx = 0;
let scrambleCurrent = '';

function shuffle(str) {
  let arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join('');
  return result === str && str.length > 1 ? shuffle(str) : result;
}

function initScramble() {
  scrambleScore = 0;
  scrambleIdx = 0;
  loadScrambleWord();
}

function loadScrambleWord() {
  const item = scrambleWords[scrambleIdx % scrambleWords.length];
  scrambleCurrent = item.word;
  document.getElementById('scramble-word').textContent = shuffle(item.word);
  document.getElementById('scramble-hint').textContent = item.hint;
  document.getElementById('scramble-input').value = '';
  document.getElementById('scramble-feedback').textContent = '';
  document.getElementById('scramble-score').textContent = 'score: ' + scrambleScore + ' ♡';
}

document.getElementById('scramble-check').addEventListener('click', () => {
  const answer = document.getElementById('scramble-input').value.trim().toUpperCase();
  const fb = document.getElementById('scramble-feedback');
  if (answer === scrambleCurrent) {
    scrambleScore++;
    fb.textContent = '✨ yay! that is correct! ✨';
    fb.style.color = '#4caf85';
    document.getElementById('scramble-score').textContent = 'score: ' + scrambleScore + ' ♡';
    for (let i = 0; i < 12; i++) setTimeout(() => createSparkle(Math.random()*window.innerWidth, Math.random()*window.innerHeight*0.5), i*40);
  } else {
    fb.textContent = '💕 not quite! try again~';
    fb.style.color = 'var(--pink-rose)';
    shakeEl(document.getElementById('scramble-input'));
  }
});

document.getElementById('scramble-next').addEventListener('click', () => {
  scrambleIdx++;
  loadScrambleWord();
});

document.getElementById('scramble-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('scramble-check').click();
});

// ---- MEMORY GAME ----
const memoryEmojis = ['🌸','🍒','💕','✨','🎀','🌙','🦋','🍓'];
let memoryFlipped = [];
let memoryMatched = 0;
let memoryLocked = false;

function initMemory() {
  memoryMatched = 0;
  memoryFlipped = [];
  memoryLocked = false;
  document.getElementById('memory-score').textContent = 'pairs found: 0 / 8 ♡';
  
  const cards = [...memoryEmojis, ...memoryEmojis];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  
  const grid = document.getElementById('memory-grid');
  grid.innerHTML = '';
  cards.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.emoji = emoji;
    card.dataset.idx = i;
    card.textContent = '♡';
    card.addEventListener('click', flipMemoryCard);
    grid.appendChild(card);
  });
}

function flipMemoryCard(e) {
  const card = e.currentTarget;
  if (memoryLocked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  
  card.textContent = card.dataset.emoji;
  card.classList.add('flipped');
  memoryFlipped.push(card);
  
  if (memoryFlipped.length === 2) {
    memoryLocked = true;
    const [a, b] = memoryFlipped;
    if (a.dataset.emoji === b.dataset.emoji) {
      a.classList.add('matched');
      b.classList.add('matched');
      memoryMatched++;
      document.getElementById('memory-score').textContent = 'pairs found: ' + memoryMatched + ' / 8 ♡';
      memoryFlipped = [];
      memoryLocked = false;
      if (memoryMatched === 8) {
        setTimeout(() => {
          document.getElementById('memory-score').textContent = '🎉 you found them all! ♡';
          for (let i = 0; i < 20; i++) setTimeout(() => createSparkle(Math.random()*window.innerWidth, Math.random()*window.innerHeight), i*60);
        }, 300);
      }
    } else {
      setTimeout(() => {
        a.textContent = '♡'; b.textContent = '♡';
        a.classList.remove('flipped'); b.classList.remove('flipped');
        memoryFlipped = [];
        memoryLocked = false;
      }, 1000);
    }
  }
}

document.getElementById('memory-restart').addEventListener('click', initMemory);

// ---- WOULD YOU RATHER ----
const wyrQuestions = [
  { q: 'Would you rather live in a cozy cottage surrounded by cherry blossoms 🌸 OR in a dreamy apartment with a city skyline view? ✨', a: ['cherry blossom cottage 🌸', 'city skyline apartment 🌃'] },
  { q: 'Would you rather have a never-ending playlist of your favorite songs 🎵 OR unlimited lives in your favorite video game? 🎮', a: ['infinite playlist 🎵', 'unlimited lives 🎮'] },
  { q: 'Would you rather spend a rainy day journaling with hot cocoa ☁️ OR watching your favorite movies with cozy snacks? 🍿', a: ['journaling & cocoa ☁️', 'movies & snacks 🍿'] },
  { q: 'Would you rather have the ability to speak to animals 🦋 OR be able to visit any fictional world you choose? ✨', a: ['talk to animals 🦋', 'visit any fiction world ✨'] },
  { q: 'Would you rather eat strawberry shortcake 🍓 OR chocolate-covered cherries 🍒 for every dessert forever?', a: ['strawberry shortcake 🍓', 'chocolate cherries 🍒'] },
  { q: "Would you rather have a magical journal where anything you write comes true 📓 OR a playlist that perfectly matches every mood you're in? 🎶", a: ["magic journal 📓", "mood playlist 🎶"] },
  { q: 'Would you rather spend a week in Tokyo 🗼 OR Paris 🗼 with unlimited shopping?', a: ['Tokyo 🎌', 'Paris 🗼'] },
  { q: 'Would you rather only wear pink for the rest of your life 🌸 OR only listen to music from one decade?', a: ['only pink forever 🌸', 'one decade of music 🎵'] },
]

let wyrIdx = 0;

function initWYR() {
  wyrIdx = Math.floor(Math.random() * wyrQuestions.length);
  loadWYR();
}

function loadWYR() {
  const q = wyrQuestions[wyrIdx % wyrQuestions.length];
  document.getElementById('wyr-question').textContent = q.q;
  document.getElementById('wyr-result').textContent = '';
  document.getElementById('wyr-count').textContent = 'question ' + (wyrIdx + 1) + ' ♡';
  
  const optEl = document.getElementById('wyr-options');
  optEl.innerHTML = '';
  q.a.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'wyr-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      document.getElementById('wyr-result').textContent = '✨ great choice! ' + opt + ' ✨';
      for (let i = 0; i < 8; i++) setTimeout(() => createSparkle(Math.random()*window.innerWidth, Math.random()*window.innerHeight*0.5), i*50);
    });
    optEl.appendChild(btn);
  });
}

document.getElementById('wyr-next').addEventListener('click', () => {
  wyrIdx++;
  loadWYR();
});

// =====================================================
// UTILITIES
// =====================================================
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function shakeEl(el) {
  el.style.animation = 'none';
  el.style.transform = 'translateX(-6px)';
  setTimeout(() => { el.style.transform = 'translateX(6px)'; }, 80);
  setTimeout(() => { el.style.transform = 'translateX(-4px)'; }, 160);
  setTimeout(() => { el.style.transform = ''; el.style.animation = ''; }, 240);
}