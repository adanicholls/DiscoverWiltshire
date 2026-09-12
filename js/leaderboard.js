/* ---------------------------------------------------
   Renders a ranked leaderboard into a container.
   options:
     category   - restrict to one category key
     categories - restrict to a list of category keys (used by the
                  trades hub, which mixes many trade categories the
                  same way the homepage mixes the four core ones)
     showCategoryTag - show each row's category label (used wherever
                  categories are mixed)
     limit      - max rows to render
--------------------------------------------------- */

function renderLeaderboard(containerId, options) {
  options = options || {};
  const container = document.getElementById(containerId);
  if (!container) return;

  let list = Store.getAllBusinesses();
  if (options.category) {
    list = list.filter(b => b.category === options.category);
  } else if (options.categories) {
    list = list.filter(b => options.categories.includes(b.category));
  }

  // Simplified promoted-slot model for this prototype: promoted items
  // are pinned above organic ranking. A real build should cap this at
  // 4 sellable slots per list and backfill any unsold slots with the
  // next-best organic business, per the approval workflow.
  const withVotes = list.map(b => Object.assign({}, b, { liveVotes: Store.votesFor(b) }));
  const promoted = withVotes.filter(b => b.promoted).sort((a, b) => b.liveVotes - a.liveVotes);
  const organic = withVotes.filter(b => !b.promoted).sort((a, b) => b.liveVotes - a.liveVotes);
  let ranked = promoted.concat(organic);
  if (options.limit) ranked = ranked.slice(0, options.limit);

  container.innerHTML = '';
  ranked.forEach((b, i) => {
    container.appendChild(renderRow(b, i + 1, options.showCategoryTag));
  });

  if (ranked.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.style.textAlign = 'center';
    empty.style.opacity = '0.6';
    empty.style.fontSize = '13px';
    empty.textContent = 'Nothing here yet — the first business to be approved in this category takes the top spot.';
    container.appendChild(empty);
  }
}

function renderRow(business, rank, showCategoryTag) {
  const row = document.createElement('div');
  row.className = 'lb-row';

  const rankEl = document.createElement('div');
  rankEl.className = 'lb-rank';
  rankEl.textContent = rank;
  row.appendChild(rankEl);

  const thumb = document.createElement('div');
  thumb.className = 'lb-thumb';
  thumb.style.background = business.photoColor || '#D9C7A3';
  row.appendChild(thumb);

  const info = document.createElement('div');
  info.className = 'lb-info';

  const nameRow = document.createElement('div');
  nameRow.className = 'lb-name-row';

  const link = document.createElement('a');
  link.className = 'lb-name';
  link.href = 'business.html?id=' + encodeURIComponent(business.id);
  link.textContent = business.name;
  nameRow.appendChild(link);

  if (business.promoted) nameRow.appendChild(makeTag('Promoted', 'tag-promoted'));
  if (business.featured) nameRow.appendChild(makeTag('Featured', 'tag-featured'));
  info.appendChild(nameRow);

  const meta = document.createElement('div');
  meta.className = 'lb-meta';
  const catLabel = CATEGORY_LABELS[business.category] || business.category;
  meta.textContent = (showCategoryTag ? catLabel + ' · ' : '') + business.tagline;
  info.appendChild(meta);

  row.appendChild(info);

  const upvote = document.createElement('button');
  upvote.className = 'upvote';
  const voted = Store.hasVoted(business.id);
  upvote.disabled = voted;
  upvote.setAttribute('aria-label', 'Upvote ' + business.name);
  upvote.innerHTML =
    '<span class="upvote-arrow" aria-hidden="true">&#9650;</span>' +
    '<span class="upvote-count">' + business.liveVotes + '</span>';
  upvote.addEventListener('click', () => {
    if (Store.addVote(business.id)) {
      upvote.querySelector('.upvote-count').textContent = business.liveVotes + 1;
      upvote.disabled = true;
    }
  });
  row.appendChild(upvote);

  return row;
}

/* ---------------------------------------------------
   Search — matches name, tagline, description, location,
   and category label against every business (every category,
   not just what's currently displayed), ranked by live votes.
--------------------------------------------------- */

function searchBusinesses(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return Store.getAllBusinesses().filter(b => {
    const category = (CATEGORY_LABELS[b.category] || b.category).toLowerCase();
    return [b.name, b.tagline, b.description, b.location, category]
      .some(field => (field || '').toLowerCase().includes(q));
  });
}

function renderSearchResults(containerId, query) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const matches = searchBusinesses(query)
    .map(b => Object.assign({}, b, { liveVotes: Store.votesFor(b) }))
    .sort((a, b) => b.liveVotes - a.liveVotes);

  container.innerHTML = '';
  matches.forEach((b, i) => container.appendChild(renderRow(b, i + 1, true)));

  if (matches.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.style.textAlign = 'center';
    empty.style.opacity = '0.6';
    empty.style.fontSize = '13px';
    empty.textContent = 'No matches for "' + query.trim() + '" — try a different search.';
    container.appendChild(empty);
  }
}

/* Wires a search input up to a leaderboard container: typing filters
   it live across every category, clearing the box restores whatever
   was rendered there before (passed in as restoreFn). */
function initSearchBox(inputId, containerId, restoreFn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.addEventListener('input', () => {
    const query = input.value;
    if (query.trim()) {
      renderSearchResults(containerId, query);
    } else {
      restoreFn();
    }
  });
}

function makeTag(label, cls) {
  const span = document.createElement('span');
  span.className = 'tag ' + cls;
  span.textContent = label;
  return span;
}

function renderEvents(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  EVENTS.forEach(ev => {
    const row = document.createElement('div');
    row.className = 'card';
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.fontSize = '13px';
    row.innerHTML = '<span>' + ev.name + '</span><span style="opacity:0.6">' + ev.when + '</span>';
    container.appendChild(row);
  });
}
