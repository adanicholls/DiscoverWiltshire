/* Product Hunt style nav: "Explore" and "Advertise" open a
   dropdown of items with descriptions on hover; "What's on" and
   "Our story" are plain links and carry no dropdown. Click is kept
   as a fallback for touch/keyboard, since those can't hover. */

function initNav() {
  const exploreBtn = document.getElementById('nav-explore');
  const businessBtn = document.getElementById('nav-business');
  const explorePanel = document.getElementById('panel-explore');
  const businessPanel = document.getElementById('panel-business');

  if (!exploreBtn || !businessBtn) return;

  const HOVER_CLOSE_DELAY = 150; // tolerates the cursor briefly leaving between button and panel
  let closeTimer = null;

  function show(which) {
    clearTimeout(closeTimer);
    explorePanel.hidden = which !== 'explore';
    businessPanel.hidden = which !== 'business';
    exploreBtn.classList.toggle('active', which === 'explore');
    businessBtn.classList.toggle('active', which === 'business');
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => show('none'), HOVER_CLOSE_DELAY);
  }

  [
    [exploreBtn, explorePanel, 'explore'],
    [businessBtn, businessPanel, 'business'],
  ].forEach(([btn, panel, which]) => {
    btn.addEventListener('mouseenter', () => show(which));
    btn.addEventListener('mouseleave', scheduleClose);
    panel.addEventListener('mouseenter', () => show(which));
    panel.addEventListener('mouseleave', scheduleClose);

    btn.addEventListener('click', () => {
      show(panel.hidden ? which : 'none');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-links') && !e.target.closest('.mega-menu')) {
      show('none');
    }
  });

  populateTradesMenu(explorePanel);
}

/* Trades & services has far more categories (20-30) than the four core
   ones above, so rather than hand-writing that list into every page's
   mega-menu markup (easy to let go stale, as the "hidden" attribute bug
   showed), it's built once here from TRADE_CATEGORIES in data.js and
   appended to the Explore panel on every page that has one. Add a new
   trade in data.js and it appears in the nav everywhere automatically. */
function populateTradesMenu(explorePanel) {
  if (!explorePanel || typeof TRADE_CATEGORIES === 'undefined') return;
  if (explorePanel.querySelector('.mega-trades')) return; // don't double up

  const section = document.createElement('div');
  section.className = 'mega-trades';

  const heading = document.createElement('a');
  heading.className = 'mega-trades-heading';
  heading.href = 'trades.html';
  heading.textContent = 'Trades & services';
  section.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'mega-trades-grid';
  TRADE_CATEGORIES.forEach(cat => {
    const link = document.createElement('a');
    link.className = 'mega-trades-link';
    link.href = 'category.html?slug=' + encodeURIComponent(cat.id);
    link.textContent = cat.label;
    grid.appendChild(link);
  });
  section.appendChild(grid);

  const allLink = document.createElement('a');
  allLink.className = 'mega-trades-all';
  allLink.href = 'trades.html';
  allLink.textContent = 'Browse all trades & services →';
  section.appendChild(allLink);

  explorePanel.appendChild(section);
}

/* Shared chip row for jumping between trade categories, used by both
   trades.html (activeSlug omitted) and category.html (activeSlug set). */
function renderTradeChips(containerId, activeSlug) {
  const container = document.getElementById(containerId);
  if (!container || typeof TRADE_CATEGORIES === 'undefined') return;

  container.innerHTML = '';

  const allChip = document.createElement('a');
  allChip.className = 'tab' + (activeSlug ? '' : ' active');
  allChip.href = 'trades.html';
  allChip.textContent = 'All trades & services';
  container.appendChild(allChip);

  TRADE_CATEGORIES.forEach(cat => {
    const chip = document.createElement('a');
    chip.className = 'tab' + (cat.id === activeSlug ? ' active' : '');
    chip.href = 'category.html?slug=' + encodeURIComponent(cat.id);
    chip.textContent = cat.label;
    container.appendChild(chip);
  });
}

/* The header search box lives on every page. Pages with their own
   leaderboard filter it live (see initSearchBox in leaderboard.js);
   pages without one (business profiles, forms, static copy) jump to
   the homepage's search results on Enter instead. */
function initSearchRedirect(inputId, targetPage) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      window.location.href = (targetPage || 'index.html') + '?q=' + encodeURIComponent(input.value.trim());
    }
  });
}

/* Hamburger toggle for the collapsed mobile header (see the
   @media (max-width: 640px) block in styles.css). Runs on every page —
   unlike initNav, it doesn't depend on the Explore/Advertise dropdown
   buttons existing, since plain-nav pages need the toggle too. */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const collapse = document.getElementById('nav-collapse');
  if (!toggle || !collapse) return;

  function setOpen(open) {
    collapse.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  toggle.addEventListener('click', () => {
    setOpen(!collapse.classList.contains('open'));
  });

  document.addEventListener('click', (e) => {
    if (collapse.classList.contains('open') &&
        !e.target.closest('.nav-collapse') &&
        !e.target.closest('.nav-toggle')) {
      setOpen(false);
    }
  });

  // Following a link out of the flyout should close it, rather than
  // leaving it visibly open underneath while the next page loads.
  collapse.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setOpen(false));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMobileNav();
});
