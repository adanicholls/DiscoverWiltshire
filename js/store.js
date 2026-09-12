/* ---------------------------------------------------
   Discover Wiltshire — demo data store
   Everything here uses localStorage so the prototype
   feels alive without a backend. Replace each function
   body with a real API call when one exists; keep the
   function names the same so the pages don't need to
   change.
--------------------------------------------------- */

const Store = {
  _read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  _write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage unavailable, fail quietly */ }
  },

  // Businesses approved after launch, on top of the seed data in data.js
  getApprovedBusinesses() {
    return this._read('dw_approved_businesses', []);
  },
  addApprovedBusiness(business) {
    const list = this.getApprovedBusinesses();
    list.push(business);
    this._write('dw_approved_businesses', list);
  },

  // All businesses: seed data + anything approved this session
  getAllBusinesses() {
    return BUSINESSES.concat(this.getApprovedBusinesses());
  },
  getBusinessById(id) {
    return this.getAllBusinesses().find(b => b.id === id);
  },

  // Vote deltas, keyed by business id, plus which ids this browser already voted for
  getVoteDeltas() {
    return this._read('dw_vote_deltas', {});
  },
  getVotedIds() {
    return this._read('dw_voted_ids', []);
  },
  hasVoted(id) {
    return this.getVotedIds().includes(id);
  },
  addVote(id) {
    if (this.hasVoted(id)) return false;
    const deltas = this.getVoteDeltas();
    deltas[id] = (deltas[id] || 0) + 1;
    this._write('dw_vote_deltas', deltas);
    const voted = this.getVotedIds();
    voted.push(id);
    this._write('dw_voted_ids', voted);
    return true;
  },
  votesFor(business) {
    const deltas = this.getVoteDeltas();
    return business.votes + (deltas[business.id] || 0);
  },

  // Pending queue: new listing submissions and (in a real build) promoted-slot
  // purchases and founding-member sign-ups, all reviewed before going live.
  getPendingItems() {
    return this._read('dw_pending_items', this._seedPending());
  },
  _seedPending() {
    const seeded = [
      {
        id: 'seed-1',
        type: 'listing',
        name: 'Potterne Pantry',
        category: 'shops',
        tagline: 'local deli, cheese counter, coffee to go',
        submittedAgo: '2 hours ago'
      },
      {
        id: 'seed-2',
        type: 'promoted-slot',
        name: 'The Bell, Ramsbury',
        detail: 'homepage slot · 1 week · paid',
        submittedAgo: '40 minutes ago'
      },
      {
        id: 'seed-3',
        type: 'founding-member',
        name: 'Wilton Yard Studios',
        detail: 'founding membership purchased',
        submittedAgo: 'yesterday'
      }
    ];
    this._write('dw_pending_items', seeded);
    return seeded;
  },
  addPendingItem(item) {
    const list = this.getPendingItems();
    list.unshift(item);
    this._write('dw_pending_items', list);
  },
  removePendingItem(id) {
    const list = this.getPendingItems().filter(i => i.id !== id);
    this._write('dw_pending_items', list);
  }
};
