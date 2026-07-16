/* ---------------- Config ---------------- */
const CATEGORIES = [
  {id:'books', label:'Books & Notes', icon:'📚'},
  {id:'trunks', label:'Trunks & Luggage', icon:'🧳'},
  {id:'mattress', label:'Mattress & Bedding', icon:'🛏️'},
  {id:'cooler', label:'Coolers & Fans', icon:'🌀'},
  {id:'cycle', label:'Cycles', icon:'🚲'},
  {id:'electronics', label:'Electronics & Gadgets', icon:'🔌'},
  {id:'furniture', label:'Furniture', icon:'🪑'},
  {id:'sports', label:'Sports & Fitness', icon:'🏸'},
  {id:'kitchen', label:'Kitchen & Mess Essentials', icon:'🍳'},
  {id:'other', label:'Other Jugaad', icon:'📦'}
];
const BRANCHES = [
  'Not branch-specific',
  '1st Year Core',
  'Chemical Engineering',
  'Civil Engineering',
  'Electrical & Electronics Engineering (EEE)',
  'Electronics & Instrumentation Engineering (EI)',
  'Electronics & Communication Engineering (ECE)',
  'Computer Science Engineering',
  'Mechanical Engineering',
  'Manufacturing Engineering',
  'Pharmacy (B Pharm)',
  'Biological Sciences (M.Sc. Hons.)',
  'Chemistry (M.Sc. Hons.)',
  'Economics (M.Sc. Hons.)',
  'Mathematics (M.Sc. Hons.)',
  'Physics (M.Sc. Hons.)',
  'General / First Year (no branch yet)'
];
const CAMPUS = 'Pilani'; // BITS Dukaan is Pilani-campus-only
const CONDITIONS = ['Like new','Good','Fair','Well-loved (still works!)'];
const YEARS = ['Not year-specific','1st Year','2nd Year','3rd Year','4th Year','5th Year (Dual Degree)'];

/* ---------------- State ---------------- */
let listings = [];
let profile = {name:'', phone:'', email:''};
let currentCategory = 'all';
let revealedContacts = new Set();
let currentUser = null;             // email, name

const grid = document.getElementById('listingsGrid');
const modalRoot = document.getElementById('modalRoot');

/* ---------------- Storage helpers ---------------- */
async function loadListings() {
  try {
    const res = await fetch('/api/listings');

    if (!res.ok) {
      throw new Error('Failed to load listings');
    }

    const data = await res.json();
    console.log("API DATA:", data);

    listings = data.map(item => ({
    id: item.id,
    title: item.title,
    category: item.category,
    branch: item.branch,
    year: item.year,
    campus: item.campus,
    desc: item.description,
    price: item.price,
    condition: item.item_condition,
    sellerName: item.seller_name,
    sellerPhone: item.seller_phone,
    sellerEmail: item.seller_email,
    createdAt: item.created_at,
    sold: Boolean(item.sold),
    verified: true
    }));

    console.log("MAPPED LISTINGS:", listings);

    listings = data.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      branch: item.branch,
      year: item.year,
      campus: item.campus,
      desc: item.description,
      price: item.price,
      condition: item.item_condition,
      sellerName: item.seller_name,
      sellerPhone: item.seller_phone,
      sellerEmail: item.seller_email,
      createdAt: item.created_at,
      sold: Boolean(item.sold),
      verified: true
    }));
  } catch (e) {
    console.error(e);
    listings = [];
  }
}



async function loadProfile(){
  try{
    const res = await window.storage.get('dukaan_my_profile', false);
    profile = res ? JSON.parse(res.value) : {name:'',phone:'',email:''};
  }catch(e){ profile = {name:'',phone:'',email:''}; }
}
async function saveProfile(){
  try{ await window.storage.set('dukaan_my_profile', JSON.stringify(profile), false); }
  catch(e){ console.error('Could not save profile', e); }
}


// email check
function isBitsEmail(email) {
  return email?.toLowerCase().endsWith('@pilani.bits-pilani.ac.in');
}

/* load session before init */
async function loadSession() {
  try {
    const res = await fetch('/api/me', {
        credentials: 'include'
    });

    if (!res.ok) {
      currentUser = null;
      return;
    }

    const user = await res.json();

    if (!isBitsEmail(user.email)) {
      currentUser = null;
      return;
    }

    currentUser = user;
    document.getElementById('btnSell').textContent =
    `Sell as ${user.name.split(' ')[0]}`;
  } catch {
    currentUser = null;
  }
}



/* ---------------- Init ---------------- */
async function init(){
  buildFilterSelects();
  buildChips();
  updateBookFiltersVisibility();
  grid.innerHTML = `<div class="empty-state script">Fetching what's up for grabs…</div>`;
  await Promise.all([
  loadListings(),
  loadProfile(),
  loadSession()
  ]);
  renderGrid();
  wireControls();
}
init();

function buildFilterSelects(){
  const branchSel = document.getElementById('branchFilter');
  branchSel.innerHTML = '<option value="all">All branches</option>' +
    BRANCHES.map(b=>`<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
  const yearSel = document.getElementById('yearFilter');
  yearSel.innerHTML = '<option value="all">All years</option>' +
    YEARS.map(y=>`<option value="${escapeHtml(y)}">${escapeHtml(y)}</option>`).join('');
}
function updateBookFiltersVisibility(){
  const wrap = document.getElementById('bookFiltersWrap');
  const isBooks = currentCategory === 'books';
  wrap.style.display = isBooks ? 'flex' : 'none';
  if(!isBooks){
    document.getElementById('branchFilter').value = 'all';
    document.getElementById('yearFilter').value = 'all';
  }
}
function buildChips(){
  const wrap = document.getElementById('categoryChips');
  const all = [{id:'all', label:'All items', icon:'🛍️'}, ...CATEGORIES];
  wrap.innerHTML = all.map(c=>
    `<button class="chip ${c.id==='all'?'active':''}" data-cat="${c.id}">${c.icon} ${c.label}</button>`
  ).join('');
  wrap.addEventListener('click', e=>{
    const btn = e.target.closest('.chip');
    if(!btn) return;
    currentCategory = btn.dataset.cat;
    [...wrap.children].forEach(ch=>ch.classList.toggle('active', ch===btn));
    updateBookFiltersVisibility();
    renderGrid();
  });
}
function wireControls(){
  document.getElementById('searchInput').addEventListener('input', renderGrid);
  document.getElementById('branchFilter').addEventListener('change', renderGrid);
  document.getElementById('yearFilter').addEventListener('change', renderGrid);
  document.getElementById('sortSelect').addEventListener('change', renderGrid);
  document.getElementById('btnMyListings').addEventListener('click', openMyListingsModal);
  document.getElementById('btnSell').addEventListener('click', async () => {
  if (!currentUser) {
    window.location.href = '/google/auth';
    return;
  }

  openSellModal();
  });
  grid.addEventListener('click', onGridClick);
}

/* ---------------- Rendering ---------------- */
function catInfo(id){ return CATEGORIES.find(c=>c.id===id) || {label:id, icon:'📦'}; }
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function timeAgo(ts){
  const diff = Date.now()-ts;
  const mins = Math.floor(diff/60000);
  if(mins<1) return 'just now';
  if(mins<60) return mins+'m ago';
  const hrs = Math.floor(mins/60);
  if(hrs<24) return hrs+'h ago';
  const days = Math.floor(hrs/24);
  return days+'d ago';
}

function renderGrid(){
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const branch = document.getElementById('branchFilter').value;
  const year = document.getElementById('yearFilter').value;
  const sort = document.getElementById('sortSelect').value;

  let items = listings.filter(l=>{
    if(currentCategory!=='all' && l.category!==currentCategory) return false;
    if(branch!=='all' && l.branch!==branch) return false;
    if(year!=='all' && l.year!==year) return false;
    if(q && !(l.title.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q))) return false;
    return true;
  });

  items.sort((a,b)=>{
    if(sort==='low') return a.price-b.price;
    if(sort==='high') return b.price-a.price;
    return b.createdAt-a.createdAt;
  });
  // unsold first within sort
  items.sort((a,b)=> (a.sold===b.sold) ? 0 : (a.sold ? 1 : -1));

  if(items.length===0){
    grid.innerHTML = `<div class="empty-state">
      <div class="script">Nothing here yet, be the first to pin something up!</div>
      <p>Try a different filter, or list your own book/trunk/cycle for juniors to grab.</p>
    </div>`;
    return;
  }

  grid.innerHTML = items.map(l=>{
    const c = catInfo(l.category);
    const revealed = revealedContacts.has(l.id);
    return `
    <div class="card ${l.sold?'sold':''}" data-id="${l.id}">
      <div class="pin"></div>
      <div class="price-tag">
        <div class="price-tag-shape"><span class="rupee">₹</span>${Number(l.price).toLocaleString('en-IN')}</div>
      </div>
      <div class="card-top">
        <span class="cat-badge">${c.icon} ${c.label}</span>
        ${l.sold?'<span class="sold-stamp">Sold</span>':''}
      </div>
      <div class="card-emoji">${c.icon}</div>
      <h3>${escapeHtml(l.title)}</h3>
      <div class="desc">${escapeHtml(l.desc)}</div>
      <div class="meta-row">
        <span class="meta-pill">${escapeHtml(l.condition)}</span>
        ${l.branch && l.branch!=='Not branch-specific' ? `<span class="meta-pill">${escapeHtml(l.branch)}</span>` : ''}
        ${l.year && l.year!=='Not year-specific' ? `<span class="meta-pill">${escapeHtml(l.year)}</span>` : ''}
        <span class="meta-pill">${timeAgo(l.createdAt)}</span>
      </div>
      <div class="seller-row">
        <span>${escapeHtml(l.sellerName)}</span>
        <span class="verified-badge">✓ Verified</span>
      </div>
      ${revealed ? `
        <div class="contact-box">
          <a href="tel:${escapeHtml(l.sellerPhone)}">📞 ${escapeHtml(l.sellerPhone)}</a>
          <a href="mailto:${escapeHtml(l.sellerEmail)}">✉️ ${escapeHtml(l.sellerEmail)}</a>
        </div>
      ` : `<button class="btn btn-outline btn-sm reveal-btn" data-id="${l.id}">Show contact info</button>`}
    </div>`;
  }).join('');
}

function onGridClick(e){
  const revealBtn = e.target.closest('.reveal-btn');
  if(revealBtn){
    revealedContacts.add(revealBtn.dataset.id);
    renderGrid();
  }
}

/* ---------------- Sell modal ---------------- */
function openSellModal(){
  modalRoot.innerHTML = `
  <div class="overlay" id="overlaySell">
    <div class="modal">
      <button class="modal-close" id="closeSell">&times;</button>
      <h2>List an item</h2>
      <p class="sub">List your item for fellow BITSians. Your BITS email is verified automatically through Google sign-in.</p>

      <div class="field" id="f-title">
        <label>Title</label>
        <input id="in-title" placeholder="e.g. Engineering Mechanics + Thermo combo, barely used" />
        <span class="error">Please add a title.</span>
      </div>

      <div class="field" id="f-category">
        <label>Category</label>
        <select id="in-category">
          ${CATEGORIES.map(c=>`<option value="${c.id}">${c.icon} ${c.label}</option>`).join('')}
        </select>
      </div>

      <div class="two-col" id="f-branch-year-row">
        <div class="field" id="f-branch">
          <label>Branch <span class="hint">(books/notes only)</span></label>
          <select id="in-branch">
            ${BRANCHES.map(b=>`<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('')}
          </select>
        </div>
        <div class="field" id="f-year">
          <label>Year <span class="hint">(books/notes only)</span></label>
          <select id="in-year">
            ${YEARS.map(y=>`<option value="${escapeHtml(y)}">${escapeHtml(y)}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="field" id="f-desc">
        <label>Description</label>
        <textarea id="in-desc" placeholder="Condition, why you're selling, any freebies thrown in…"></textarea>
        <span class="error">Add a short description.</span>
      </div>

      <div class="two-col">
        <div class="field" id="f-price">
          <label>Price (₹)</label>
          <input id="in-price" type="number" min="0" placeholder="e.g. 300" />
          <span class="error">Enter a valid price (0 or more).</span>
        </div>
        <div class="field" id="f-condition">
          <label>Condition</label>
          <select id="in-condition">
            ${CONDITIONS.map(c=>`<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="field" id="f-name">
        <label>Your name</label>
        <div class="field" id="f-name">
            <input
                id="in-name"
                value="${escapeHtml(currentUser?.name || '')}"
                readonly
            />
            </div>
        <span class="error">Please enter your name.</span>
      </div>

      <div class="two-col">
        <div class="field" id="f-phone">
          <label>Mobile number <span class="hint">(mandatory)</span></label>
          <input id="in-phone" placeholder="10-digit number" value="${escapeHtml(profile.phone)}" />
          <span class="error">Enter a valid 10-digit mobile number.</span>
        </div>
        <div class="field" id="f-email">
        <label>BITS email</label>
        <input
            id="in-email"
            readonly value="${escapeHtml(currentUser?.email || '')}"
            readonly
        />
        </div>
      </div>

      <button class="btn btn-primary" id="submitSell" style="width:100%; margin-top:6px;">Publish Listing</button>
    </div>
  </div>`;
  document.getElementById('closeSell').addEventListener('click', closeModal);
  document.getElementById('overlaySell').addEventListener('click', e=>{ if(e.target.id==='overlaySell') closeModal(); });
  document.getElementById('submitSell').addEventListener('click', validateAndProceed);
  document.getElementById('in-category').addEventListener('change', updateSellBranchYearVisibility);
  updateSellBranchYearVisibility();
}

function updateSellBranchYearVisibility(){
  const row = document.getElementById('f-branch-year-row');
  const isBooks = document.getElementById('in-category').value === 'books';
  row.style.display = isBooks ? 'grid' : 'none';
  if(!isBooks){
    document.getElementById('in-branch').value = 'Not branch-specific';
    document.getElementById('in-year').value = 'Not year-specific';
  }
}

function setInvalid(fieldId, invalid){
  document.getElementById(fieldId).classList.toggle('invalid', invalid);
}

async function validateAndProceed(){
  const title = document.getElementById('in-title').value.trim();
  const category = document.getElementById('in-category').value;
  const branch = document.getElementById('in-branch').value;
  const year = document.getElementById('in-year').value;
  const campus = CAMPUS;
  const desc = document.getElementById('in-desc').value.trim();
  const price = document.getElementById('in-price').value;
  const condition = document.getElementById('in-condition').value;
  const name = document.getElementById('in-name').value.trim();
  const phone = document.getElementById('in-phone').value.trim().replace(/[\s-]/g,'');
  const email = document.getElementById('in-email').value.trim();

  let ok = true;
  setInvalid('f-title', !title); if(!title) ok=false;
  setInvalid('f-desc', !desc); if(!desc) ok=false;
  const priceOk = price!=='' && Number(price)>=0;
  setInvalid('f-price', !priceOk); if(!priceOk) ok=false;
  setInvalid('f-name', !name); if(!name) ok=false;

  const phoneOk = /^\+?\d{10,13}$/.test(phone);
  setInvalid('f-phone', !phoneOk); if(!phoneOk) ok=false;

  if (!currentUser) {
  showToast('Please sign in with your BITS account.');
  return;
  }
  if(!ok) return;

  const draft = {
  id: 'l' + Date.now() + Math.floor(Math.random()*1000),
  title,
  category,
  branch,
  year,
  campus,
  desc,
  price: Number(price),
  condition,
  sellerName: name,
  sellerPhone: phone,
  sellerEmail: currentUser.email,
  createdAt: Date.now(),
  sold: false,
  verified: true
};

try {
  const res = await fetch('/api/create-listing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(draft)
  });

  if (!res.ok) {
    throw new Error('Failed to create listing');
  }

  profile = {
    name: draft.sellerName,
    phone: draft.sellerPhone
  };

  await saveProfile();

  closeModal();
  showToast('Listing published!');
} catch (err) {
  console.error(err);
  showToast('Could not publish listing');
}
}



/* ---------------- My listings modal ---------------- */
function openMyListingsModal(){
  const mine = listings.filter(
    l =>
        currentUser &&
        l.sellerEmail &&
        l.sellerEmail.toLowerCase() === currentUser.email.toLowerCase()
    );
  modalRoot.innerHTML = `
  <div class="overlay" id="overlayMine">
    <div class="modal">
      <button class="modal-close" id="closeMine">&times;</button>
      <h2>My listings</h2>
      <p class="sub">Only listings posted from this device/account show up here.</p>
      <div id="mineList">
        ${mine.length===0 ? `<p style="color:var(--ink-soft); font-size:14px;">You haven't listed anything yet.</p>` :
          mine.map(l=>`
          <div class="mylist-item">
            <div>
              <strong>${escapeHtml(l.title)}</strong><br/>
              <span style="font-size:12.5px; color:var(--ink-soft);">₹${Number(l.price).toLocaleString('en-IN')} · ${l.sold?'Sold':'Active'}</span>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-outline btn-sm toggle-sold" data-id="${l.id}">${l.sold?'Mark active':'Mark sold'}</button>
              <button class="btn btn-brick btn-sm delete-listing" data-id="${l.id}">Delete</button>
            </div>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
  document.getElementById('closeMine').addEventListener('click', closeModal);
  document.getElementById('overlayMine').addEventListener('click', e=>{ if(e.target.id==='overlayMine') closeModal(); });
  document.getElementById('mineList').addEventListener('click', async e=>{
    const toggleBtn = e.target.closest('.toggle-sold');
    const delBtn = e.target.closest('.delete-listing');

    if(toggleBtn){
        const l = listings.find(x => x.id === toggleBtn.dataset.id);

        if(l){
        await fetch('/api/toggle-sold', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            id: l.id,
            sold: !l.sold
            })
        });

        await loadListings();
        openMyListingsModal();
        renderGrid();
        }
    }

    if(delBtn){
        await fetch('/api/delete-listing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: delBtn.dataset.id
        })
        });

        await loadListings();
        openMyListingsModal();
        renderGrid();
    }
    });
}

/* ---------------- Utils ---------------- */
function closeModal(){ modalRoot.innerHTML = ''; }
function showToast(msg){
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--navy);color:var(--paper);padding:12px 20px;border-radius:8px;font-size:14px;z-index:100;box-shadow:0 8px 20px rgba(0,0,0,0.3);';
  document.body.appendChild(t);
  setTimeout(()=>t.remove(), 3200);
}