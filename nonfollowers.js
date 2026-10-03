(() => {
  'use strict';

  const DEFAULT_MIN_FOLLOWERS = 10000;

  const getCookie = (name) => {
    const m = document.cookie.match('(^|;)\\s*' + name + '=([^;]*)');
    return m ? decodeURIComponent(m[2]) : null;
  };
  const formatCount = (n) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

  if (!location.hostname.endsWith('instagram.com')) {
    alert('Please run this script on instagram.com.');
    return;
  }
  const userId = getCookie('ds_user_id');
  if (!userId) {
    alert('You are not logged in to Instagram.');
    return;
  }

  document.getElementById('nf-root')?.remove();

  function el(tag, style = {}, text) {
    const e = document.createElement(tag);
    Object.assign(e.style, style);
    if (text != null) e.textContent = text;
    return e;
  }

  const C = {
    bg: '#161616', panel: '#1f1f1f', line: '#333', text: '#f2f2f2',
    muted: '#9a9a9a', accent: '#e1306c', accent2: '#0095f6',
  };

  const btnStyle = (bg) => ({
    background: bg, color: '#fff', border: 'none', borderRadius: '8px',
    padding: '10px 18px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  });

  const inputStyle = {
    background: C.panel, color: C.text, border: '1px solid ' + C.line,
    borderRadius: '8px', padding: '8px 10px', fontSize: '14px', outline: 'none',
  };

  const root = el('div', {
    position: 'fixed', inset: '0', zIndex: '999999', background: 'rgba(0,0,0,.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
  });
  root.id = 'nf-root';

  const panel = el('div', {
    width: 'min(520px, calc(100vw - 32px))', maxHeight: '85vh', display: 'flex',
    flexDirection: 'column', background: C.bg, color: C.text, borderRadius: '14px',
    border: '1px solid ' + C.line, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.5)',
  });

  const header = el('div', {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px', borderBottom: '1px solid ' + C.line,
  });
  header.append(el('div', { fontSize: '17px', fontWeight: '700' }, 'Non-Followers'));
  const closeBtn = el('button', {
    background: 'none', border: 'none', color: C.muted, fontSize: '22px', cursor: 'pointer',
  }, '×');
  closeBtn.onclick = () => { stopped = true; root.remove(); };
  header.append(closeBtn);

  const body = el('div', { padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '0', flex: '1' });

  const info = el('div', { color: C.muted, fontSize: '14px', lineHeight: '1.5' },
    'Lists the accounts you follow that do not follow you back.');

  function checkbox(text, checked) {
    const label = el('label', { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', cursor: 'pointer', fontSize: '14px' });
    const cb = el('input', { width: '16px', height: '16px', margin: '0', cursor: 'pointer' });
    cb.type = 'checkbox';
    cb.checked = checked;
    label.append(cb, document.createTextNode(text));
    return { label, cb };
  }

  const options = el('div', {
    display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px',
    background: C.panel, borderRadius: '8px', border: '1px solid ' + C.line,
  });
  options.append(el('div', { fontSize: '13px', fontWeight: '600', color: C.muted }, 'Move to the Celebrities tab:'));
  const optVerified = checkbox('Verified accounts', true);
  const optFollowers = checkbox('Accounts with more than', false);
  const threshold = el('input', { ...inputStyle, width: '100px', padding: '4px 8px' });
  threshold.type = 'number';
  threshold.min = '0';
  threshold.step = '1000';
  threshold.value = String(DEFAULT_MIN_FOLLOWERS);
  threshold.disabled = true;
  optFollowers.label.append(threshold, document.createTextNode('followers'));
  optFollowers.cb.onchange = () => { threshold.disabled = !optFollowers.cb.checked; };
  options.append(optVerified.label, optFollowers.label);

  const startBtn = el('button', btnStyle(C.accent), 'Start');

  const status = el('div', { fontSize: '14px', color: C.muted, display: 'none', lineHeight: '1.4' });
  const barWrap = el('div', { height: '6px', background: C.panel, borderRadius: '3px', overflow: 'hidden', display: 'none' });
  const bar = el('div', { height: '100%', width: '0%', background: C.accent2, transition: 'width .3s' });
  barWrap.append(bar);

  const tabs = el('div', { display: 'none', gap: '8px' });
  const tabButtons = {};
  for (const [key, label] of [['regular', 'Regular'], ['celebrities', 'Celebrities']]) {
    const b = el('button', { ...btnStyle(C.panel), flex: '1', border: '1px solid ' + C.line }, label);
    b.onclick = () => { activeTab = key; renderList(); };
    tabButtons[key] = { button: b, label };
    tabs.append(b);
  }

  const toolbar = el('div', { display: 'none', gap: '8px' });
  const search = el('input', { ...inputStyle, flex: '1' });
  search.placeholder = 'Search';
  const copyBtn = el('button', btnStyle(C.accent2), 'Copy list');
  toolbar.append(search, copyBtn);

  const list = el('div', { overflowY: 'auto', flex: '1', minHeight: '0', display: 'flex', flexDirection: 'column', gap: '4px' });

  body.append(info, options, startBtn, status, barWrap, tabs, toolbar, list);
  panel.append(header, body);
  root.append(panel);
  document.body.append(root);

  let stopped = false;
  let results = { regular: [], celebrities: [] };
  let activeTab = 'regular';

  function setProgress(text, pct) {
    status.textContent = text;
    if (pct != null) bar.style.width = Math.min(100, pct) + '%';
  }

  function renderTabs() {
    for (const [key, { button, label }] of Object.entries(tabButtons)) {
      const active = key === activeTab;
      button.textContent = `${label} (${results[key].length})`;
      button.style.background = active ? C.accent2 : C.panel;
      button.style.borderColor = active ? C.accent2 : C.line;
    }
  }

  function renderList() {
    renderTabs();
    const q = search.value.trim().toLowerCase();
    list.replaceChildren();
    const shown = results[activeTab].filter((u) =>
      !q || u.username.toLowerCase().includes(q) || (u.fullName || '').toLowerCase().includes(q));

    for (const u of shown) {
      const row = el('a', {
        display: 'flex', alignItems: 'center', gap: '12px', padding: '8px',
        borderRadius: '8px', color: C.text, textDecoration: 'none', background: C.panel,
      });
      row.href = 'https://www.instagram.com/' + encodeURIComponent(u.username) + '/';
      row.target = '_blank';
      row.rel = 'noopener';

      const img = el('img', { width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', background: '#333', flexShrink: '0' });
      img.crossOrigin = 'anonymous';
      img.src = u.pic || '';
      img.onerror = () => { img.style.visibility = 'hidden'; };

      const texts = el('div', { display: 'flex', flexDirection: 'column', minWidth: '0' });
      const name = el('div', { fontWeight: '600', fontSize: '14px' }, u.username);
      const details = [
        u.fullName,
        u.verified && 'Verified',
        u.followerCount != null && formatCount(u.followerCount) + ' followers',
        u.private && 'Private',
      ].filter(Boolean).join(' · ');
      const sub = el('div', { color: C.muted, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, details);
      texts.append(name, sub);
      row.append(img, texts);
      list.append(row);
    }

    if (!shown.length) {
      list.append(el('div', { color: C.muted, fontSize: '14px', padding: '8px' },
        results[activeTab].length ? 'No matches.' : 'No accounts in this list.'));
    }
  }

  search.oninput = renderList;
  copyBtn.onclick = async () => {
    const text = results[activeTab].map((u) => u.username).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied';
    } catch {
      console.log(text);
      copyBtn.textContent = 'Printed to console';
    }
    setTimeout(() => (copyBtn.textContent = 'Copy list'), 2000);
  };

  const API_HEADERS = { 'X-IG-App-ID': '936619743392459', 'X-Requested-With': 'XMLHttpRequest' };

  async function api(url) {
    if (stopped) throw new Error('Stopped');
    const res = await fetch(url, { credentials: 'include', headers: API_HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status} (${url.split('?')[0]})`);
    return res.json();
  }

  async function getExpectedFollowingCount() {
    try {
      const j = await api(`/api/v1/users/${userId}/info/`);
      return j?.user?.following_count ?? null;
    } catch {
      return null;
    }
  }

  async function getFollowerCount(u) {
    try {
      const j = await api(`/api/v1/users/${u.pk}/info/`);
      if (typeof j?.user?.follower_count === 'number') return j.user.follower_count;
    } catch (err) {
      if (stopped) throw err;
    }
    try {
      const j = await api(`/api/v1/users/web_profile_info/?username=${encodeURIComponent(u.username)}`);
      const count = j?.data?.user?.edge_followed_by?.count;
      if (typeof count === 'number') return count;
    } catch (err) {
      if (stopped) throw err;
    }
    return null;
  }

  async function fetchList(kind, label, from, to) {
    const users = new Map();
    let maxId = '';
    do {
      const json = await api(`/api/v1/friendships/${userId}/${kind}/?count=50` +
        (maxId ? '&max_id=' + encodeURIComponent(maxId) : ''));
      for (const u of json.users || []) users.set(String(u.pk), u);
      maxId = json.next_max_id || '';
      setProgress(`${label}: ${users.size} loaded`, from + Math.min(to - from - 1, users.size / 20));
    } while (maxId && !stopped);
    return [...users.values()];
  }

  async function scan(opts) {
    setProgress('Loading profile', 0);
    const expectedFollowing = await getExpectedFollowingCount();

    const following = await fetchList('following', 'Loading following', 0, 20);
    if (stopped) return null;
    if (!following.length) throw new Error('Following list is empty');

    const followers = await fetchList('followers', 'Loading followers', 20, 30);
    if (stopped) return null;
    const knownFollowers = new Set(followers.map((u) => String(u.pk)));

    const toCheck = following.filter((u) => !knownFollowers.has(String(u.pk)));
    const checkEnd = opts.checkFollowers ? 70 : 100;
    const nonFollowers = [];
    for (let i = 0; i < toCheck.length; i++) {
      if (stopped) return null;
      const u = toCheck[i];
      const s = await api(`/api/v1/friendships/show/${u.pk}/`);
      if (typeof s?.followed_by !== 'boolean') {
        throw new Error('Unexpected response for ' + u.username);
      }
      if (!s.followed_by) {
        nonFollowers.push({
          pk: u.pk, username: u.username, fullName: u.full_name, pic: u.profile_pic_url,
          verified: u.is_verified, private: u.is_private, followerCount: null,
        });
      }
      setProgress(`Checking ${i + 1} of ${toCheck.length}. Not following back: ${nonFollowers.length}`,
        30 + ((checkEnd - 30) * (i + 1)) / toCheck.length);
    }

    const regular = [];
    const celebrities = [];
    const needCount = [];
    for (const u of nonFollowers) {
      if (opts.separateVerified && u.verified) celebrities.push(u);
      else if (opts.checkFollowers) needCount.push(u);
      else regular.push(u);
    }

    let unknownCounts = 0;
    for (let i = 0; i < needCount.length; i++) {
      if (stopped) return null;
      const u = needCount[i];
      u.followerCount = await getFollowerCount(u);
      if (u.followerCount == null) unknownCounts++;
      if (u.followerCount != null && u.followerCount > opts.minFollowers) celebrities.push(u);
      else regular.push(u);
      setProgress(`Loading follower counts: ${i + 1} of ${needCount.length}`,
        checkEnd + ((100 - checkEnd) * (i + 1)) / needCount.length);
    }

    const byName = (a, b) => a.username.localeCompare(b.username);
    return {
      regular: regular.sort(byName), celebrities: celebrities.sort(byName), unknownCounts,
      expectedFollowing, followingCount: following.length, checkedCount: toCheck.length,
    };
  }

  startBtn.onclick = async () => {
    const opts = {
      separateVerified: optVerified.cb.checked,
      checkFollowers: optFollowers.cb.checked,
      minFollowers: Math.max(0, Number(threshold.value) || 0),
    };
    startBtn.style.display = 'none';
    info.style.display = 'none';
    options.style.display = 'none';
    status.style.display = 'block';
    barWrap.style.display = 'block';
    setProgress('Starting', 0);

    try {
      const r = await scan(opts);
      if (!r || stopped) return;

      results = { regular: r.regular, celebrities: r.celebrities };
      const total = r.regular.length + r.celebrities.length;
      let msg = `Done. Checked ${r.checkedCount} of the ${r.followingCount} accounts you follow. ` +
        `${total} of them do not follow you back.`;
      if (r.unknownCounts) {
        msg += ` Follower count could not be loaded for ${r.unknownCounts} accounts, so they are listed under Regular.`;
      }
      setProgress(msg, 100);
      status.style.color = C.text;
      tabs.style.display = 'flex';
      toolbar.style.display = 'flex';
      renderList();

    } catch (err) {
      if (stopped) return;
      console.error('[non-followers]', err);
      status.style.color = '#ff6b6b';
      setProgress(`Error: ${err.message}`);
    }
  };
})();
