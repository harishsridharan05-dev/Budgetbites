/* ==========================================================================
   Budget Bites — Application Layer
   --------------------------------------------------------------------------
   Three sections, in dependency order:

     1. PLANNING ENGINE  pure functions: targets, eligibility, schedule
                         building, pack costing, brand tiers, platform pricing.
     2. ACCOUNTS         local profile gate and the login screen.
     3. USER INTERFACE   the four-step wizard, live docket, result panels
                         and the recipe popup.

   Reads the tables in data.js, which must load first.
   ========================================================================== */

/* ==========================================================================
   Budget Bites — Planning Engine
   --------------------------------------------------------------------------
   Pure functions, no DOM. Turns a profile into a meal schedule, a pack-costed
   grocery list, a nutrition summary, brand-tier comparisons, platform prices,
   ingredient reuse and a shopping schedule.
   ========================================================================== */

const money = n => '₹' + Math.round(n).toLocaleString('en-IN');

/* --------------------------------------------------------------------------
   1. Nutrition targets — Mifflin-St Jeor with a sex-neutral constant, since
   the intake form does not collect sex.
   -------------------------------------------------------------------------- */
function targets(S) {
  const bmr  = 10 * S.weight + 6.25 * S.height - 5 * S.age - 78;
  const tdee = bmr * 1.4;
  const g    = GOALS[S.goal];

  let kcal = Math.round(tdee * (1 + g.adj));
  kcal = Math.max(1500, Math.min(3600, kcal));          // keep it sane

  const protein = Math.min(160, Math.round(S.weight * g.pro));
  const fat     = Math.round(kcal * 0.27 / 9);
  const carbs   = Math.round((kcal - protein * 4 - fat * 9) / 4);

  const bmi = S.weight / Math.pow(S.height / 100, 2);
  let bmiBand = 'in the healthy range';
  if (bmi < 18.5)     bmiBand = 'below the healthy range';
  else if (bmi >= 30) bmiBand = 'in the obese range';
  else if (bmi >= 25) bmiBand = 'in the overweight range';

  return { kcal, protein, carbs, fat, tdee: Math.round(tdee),
           bmi: Math.round(bmi * 10) / 10, bmiBand };
}

const SHARE_4 = { breakfast: .25, lunch: .34, dinner: .30, snack: .11 };
const SHARE_3 = { breakfast: .28, lunch: .38, dinner: .34 };

/* A serving stretches or shrinks so the day lands near the calorie target. */
function dayFactor(day, T) {
  const k = day.reduce((a, r) => a + (r ? r.kcal : 0), 0);
  return k ? Math.max(.75, Math.min(1.75, T.kcal / k)) : 1;
}

/* --------------------------------------------------------------------------
   2. Cost per serving — at the popular tier, so scoring stays stable no
   matter which tier the shopper is viewing.
   -------------------------------------------------------------------------- */
function costPerServing(r) {
  let c = 0;
  for (const k in r.ing) c += r.ing[k] * ING[k].p;
  return c;
}
RECIPES.forEach(r => { r.cps = costPerServing(r); });

/* --------------------------------------------------------------------------
   3. Eligibility
   Cuisine is a preference, not a hard rule: if the chosen cuisine cannot fill
   a slot on its own, that slot borrows from the rest of the library and the
   plan says so, rather than silently dropping a meal.
   -------------------------------------------------------------------------- */
function eligible(S, { ignoreCuisine = false } = {}) {
  const bad = new Set(S.allergies);
  return RECIPES.filter(r => {
    if (!ignoreCuisine && S.cuisine !== 'any' && r.cuisine !== S.cuisine) return false;
    if (!dietOK(r, S.diet)) return false;
    for (const a of r.allerg) if (bad.has(a)) return false;
    if (r.skill > S.skill) return false;
    if (r.time > S.time + (r.slots.includes('snack') ? 0 : 5)) return false;
    return true;
  });
}

/**
 * Per-slot pools. Returns the pool actually used for each slot plus the list
 * of slots that had to reach outside the chosen cuisine.
 */
function poolsFor(S) {
  const inCuisine  = eligible(S);
  const everything = eligible(S, { ignoreCuisine: true });
  const pools = {}, borrowed = [];

  ['breakfast', 'lunch', 'dinner', 'snack'].forEach(slot => {
    const own = inCuisine.filter(r => r.slots.includes(slot));
    if (own.length >= 3 || S.cuisine === 'any') { pools[slot] = own; return; }
    const wide = everything.filter(r => r.slots.includes(slot));
    if (wide.length > own.length) { pools[slot] = wide; borrowed.push(slot); }
    else pools[slot] = own;
  });

  return { pools, borrowed };
}

/* --------------------------------------------------------------------------
   4. Schedule building
   -------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
   Protein rotation
   --------------------------------------------------------------------------
   Diet is a ranked filter, so a vegan dish is technically allowed for everyone.
   Left alone that hands a non-vegetarian a mostly-vegetarian plan, because the
   cost term always prefers the cheaper dish — and once soya was added it did
   the same thing again, leaning on soya for nearly every meal.

   So each diet names the protein sources that should CARRY it, and main meals
   aim for `share` of them. Crucially the planner also rotates WITHIN that set:
   no single source may take more than its equal slice, so a vegetarian gets
   paneer, soya and tofu in turn rather than one of them all week. The remaining
   ~30% is left free for dal, nuts, curd and the rest.
   -------------------------------------------------------------------------- */
const PROTEIN_PLAN = {
  nonveg: { heroes: ['meat', 'fish', 'egg'],            share: 0.70 },
  egg:    { heroes: ['egg', 'paneer', 'soya', 'tofu'],  share: 0.70 },
  veg:    { heroes: ['paneer', 'soya', 'tofu'],         share: 0.70 },
  vegan:  { heroes: ['soya', 'tofu', 'legume'],         share: 0.70 }
};

function buildOnce(S, pools, costWeight, T, slots, SHARE) {
  const days = [], used = {}, chosenIng = {};
  const plan = PROTEIN_PLAN[S.diet];
  const srcCount = {};                 // main meals served, per protein source
  let mainCount = 0, heroCount = 0;

  for (let d = 0; d < S.days; d++) {
    const day = [], today = new Set();

    for (const slot of slots) {
      const isMain = slot === 'lunch' || slot === 'dinner';
      // How far behind the hero-protein quota we are right now, 0..1.
      const deficit = (plan && isMain)
        ? Math.max(0, plan.share - (mainCount ? heroCount / mainCount : 0))
        : 0;
      // Each hero source's fair slice of the quota.
      const fairShare = plan ? plan.share / plan.heroes.length : 0;
      const cands = pools[slot];
      if (!cands || !cands.length) { day.push(null); continue; }

      const avg = cands.reduce((a, r) => a + r.cps, 0) / cands.length;
      let best = null, bestScore = -1e9;

      for (const r of cands) {
        const want = T.kcal * SHARE[slot];
        let s = -Math.abs(r.kcal - want) / want * 2.2;

        // Variety — a dish cooked in the last two days is pushed right down.
        const u = used[r.id];
        if (u !== undefined) s -= (d - u <= 2 ? 6 : 1.1);

        // Never the same dish twice in one day.
        if (today.has(r.id)) s -= 100;

        // Ingredient reuse — the lever that actually lowers the bill.
        let shared = 0, total = 0;
        for (const k in r.ing) { total++; if (chosenIng[k]) shared++; }
        s += (shared / total) * 1.5;

        // On a borrowed slot the pool is the whole library, so keep pulling
        // towards the chosen cuisine — outside dishes should fill the gap, not
        // take over the slot.
        if (S.cuisine !== 'any' && r.cuisine === S.cuisine) s += 2.5;

        // Protein rotation, main meals only.
        if (plan && isMain) {
          const isHero = plan.heroes.includes(r.psrc);
          if (isHero) {
            // Pushed hard while short of quota, then neutral. Leaving the floor
            // switched on once the quota is met crowds out the remaining 30%,
            // and the dal, nuts and curd never get a look in.
            s += deficit > 0 ? 10 + deficit * 40 : 0;

            // Rotate within the hero set. Once a source has had its equal
            // slice, push away from it hard so the next meal picks a different
            // one — this is what stops soya (or paneer, or chicken) taking over.
            const ownShare = mainCount ? (srcCount[r.psrc] || 0) / mainCount : 0;
            if (ownShare > fairShare) s -= (ownShare - fairShare) * 90;
          } else {
            // Non-hero dishes fill the remaining ~30%: discouraged while the
            // quota is unmet, actively favoured once it is.
            s += deficit > 0 ? -deficit * 12 : 7;
            // Spread that remainder around too, rather than repeating one dal.
            const ownShare = mainCount ? (srcCount[r.psrc] || 0) / mainCount : 0;
            if (ownShare > 0.15) s -= (ownShare - 0.15) * 60;
          }
        }

        s -= costWeight * (r.cps / avg);
        if (S.goal === 'muscle' || S.goal === 'lose') s += (r.pro / r.kcal) * 22;
        s += Math.random() * 0.25;

        if (s > bestScore) { bestScore = s; best = r; }
      }

      day.push(best);
      used[best.id] = d;
      today.add(best.id);
      if (isMain) {
        mainCount++;
        srcCount[best.psrc] = (srcCount[best.psrc] || 0) + 1;
        if (plan && plan.heroes.includes(best.psrc)) heroCount++;
      }
      for (const k in best.ing) chosenIng[k] = (chosenIng[k] || 0) + 1;
    }
    days.push(day);
  }
  return days;
}

/* --------------------------------------------------------------------------
   5. Grocery aggregation — rounded up to whole packs, because that is what
   a shop actually sells you.
   -------------------------------------------------------------------------- */
function aggregate(S, days, factors) {
  const need = {}, usedBy = {};

  days.forEach((day, i) => day.forEach(r => {
    if (!r) return;
    for (const k in r.ing) {
      need[k] = (need[k] || 0) + r.ing[k] * S.people * factors[i];
      (usedBy[k] = usedBy[k] || new Set()).add(r.n);
    }
  }));

  const lines = [];
  for (const k in need) {
    const g     = ING[k];
    const br    = brandFor(k, S.tier);
    const packs = Math.max(1, Math.ceil(need[k] / br.pack));
    lines.push({
      id: k, name: g.n, aisle: g.a, unit: g.u,
      qty: packs * br.pack, cost: packs * br.mrp, packs, brand: br,
      pantry: !!g.pantry, need: need[k],
      meals: usedBy[k].size, mealNames: [...usedBy[k]]
    });
  }
  lines.sort((a, b) => b.cost - a.cost);
  return lines;
}

/* --------------------------------------------------------------------------
   6. Generate — tries increasing cost pressure until the plan fits.
   -------------------------------------------------------------------------- */
function generate(S) {
  const T = targets(S);
  const { pools, borrowed } = poolsFor(S);

  const slots = ['breakfast', 'lunch', 'dinner'];
  const hasSnack = T.kcal >= 2000 && pools.snack && pools.snack.length;
  if (hasSnack) slots.push('snack');
  const SHARE = hasSnack ? SHARE_4 : SHARE_3;

  const missing = slots.filter(s => !pools[s] || !pools[s].length);
  if (missing.length) return { error: missing, S };

  // The budget is judged on what the shopper actually pays this trip, which
  // excludes one-time pantry staples — the same basis the results page shows.
  const payable = lines => lines.filter(l => !l.pantry).reduce((a, l) => a + l.cost, 0);

  let best = null;
  for (let w = 0; w <= 7; w++) {
    const days    = buildOnce(S, pools, w * 0.75, T, slots, SHARE);
    const factors = days.map(d => dayFactor(d, T));
    const lines   = aggregate(S, days, factors);
    const cand    = { days, factors, lines, total: lines.reduce((a, l) => a + l.cost, 0),
                      slots, T, borrowed, S };
    if (!best || payable(cand.lines) < payable(best.lines)) best = cand;
    if (payable(cand.lines) <= S.budget) { best = cand; break; }
  }

  /* Brand tier is the second lever. If the chosen tier does not fit, drop to
     the cheapest one that does and say so, rather than showing a total that
     breaks the cap the user set. The floor is the value tier — nothing this
     library can produce costs less. */
  const chosen = S.tier;
  const byTier = {};
  for (const t in TIERS) { S.tier = t; byTier[t] = payable(aggregate(S, best.days, best.factors)); }
  S.tier = chosen;

  best.autoTier = null;
  best.floor    = byTier.value;

  if (byTier[chosen] > S.budget) {
    const order = ['value', 'popular', 'premium'];
    // The cheapest tier that fits; failing that the cheapest tier outright, so
    // an over-budget plan is still quoted at the best price available rather
    // than at a tier the shopper has no reason to be on.
    const pick = order.find(t => byTier[t] <= S.budget)
              || order.reduce((a, b) => (byTier[b] < byTier[a] ? b : a));

    if (pick !== chosen) {
      S.tier = pick;
      best.autoTier = { from: chosen, to: pick, fits: byTier[pick] <= S.budget };
      best.lines = aggregate(S, best.days, best.factors);
      best.total = best.lines.reduce((a, l) => a + l.cost, 0);
    }
  }

  best.payable = payable(best.lines);
  best.fits    = best.payable <= S.budget;
  return best;
}

/* Re-prices the identical plan at every brand tier. */
function tierTotals(S, days, factors) {
  const keep = S.tier, out = {};
  for (const t in TIERS) { S.tier = t; out[t] = aggregate(S, days, factors); }
  S.tier = keep;
  return out;
}

/* --------------------------------------------------------------------------
   7. Platform pricing
   -------------------------------------------------------------------------- */
function platformRows(basketTotal) {
  return PLATFORMS.map(pf => {
    const basket = basketTotal * pf.idx;
    const ship   = basket >= pf.free ? 0 : pf.ship;
    return { pf, basket, ship, fee: pf.fee, total: basket + ship + pf.fee };
  }).sort((a, b) => a.total - b.total);
}

/* --------------------------------------------------------------------------
   8. Weekly shopping recommendations
   -------------------------------------------------------------------------- */
function shoppingRecs(S, lines, pantryCost, over, shown, hidePantry) {
  const recs = [];
  const fresh     = lines.filter(l => l.aisle === 'Fresh produce');
  const freshCost = fresh.reduce((a, l) => a + l.cost, 0);
  const staples   = lines.filter(l => ['Grains & flour', 'Dal & pulses'].includes(l.aisle));

  if (S.days > 7) {
    recs.push({ tag: 'Split shop', t: 'Two trips, not one',
      p: `Buy grains, dal and pantry items on day 1. Come back around day 7 for the ${money(freshCost / 2)} of produce and dairy — palak and curd will not survive ${S.days} days.` });
  } else {
    recs.push({ tag: 'One trip', t: `A single ${S.days}-day shop works`,
      p: `At ${S.days} days everything on this list keeps. Do it in one go, and pick up the coriander and palak last so they spend the least time in the bag.` });
  }

  if (staples.length) {
    recs.push({ tag: 'Buy bulk', t: 'Grains and dal at the bigger pack size',
      p: `${staples.slice(0, 3).map(l => l.name.toLowerCase()).join(', ')} cost less per kilo in larger packs and do not spoil. The leftover carries into your next plan instead of becoming waste.` });
  }

  const top = lines.filter(l => !l.pantry)[0];
  if (top) {
    recs.push({ tag: 'Biggest line', t: `${top.name} is ${Math.round(top.cost / shown * 100)}% of the bill`,
      p: `At ${money(top.cost)} it is the single largest item. If you need to cut, this is where the rupees are — swapping one dish that uses it moves the total more than trimming five small lines.` });
  }

  if (pantryCost > 0) {
    recs.push({ tag: 'One-time', t: 'Spices are a first-shop cost, not a weekly one',
      p: `Spices, oil and salt come to ${money(pantryCost)} and last well past this plan. ${hidePantry
        ? `They are left out of the ${money(shown)} above — add them to your first shop if the shelf is bare.`
        : `They are included above, so a repeat of this plan costs about ${money(shown - pantryCost)}.`}` });
  }

  if (over) {
    recs.push({ tag: 'Over cap', t: 'Where to find the difference',
      p: `Switch the brand tier to Value above — that alone usually moves the total 15–20%. Failing that, shop produce at a local market rather than a supermarket.` });
  }

  recs.push({ tag: 'Storage', t: 'Prep once, cook faster all week',
    p: `Chop onion and tomato for two or three days at a time and keep them airtight. Most dishes here open with the same base, which is exactly why the same few ingredients keep reappearing on the list.` });

  return recs;
}


/* ==========================================================================
   Budget Bites — Accounts
   --------------------------------------------------------------------------
   WHAT THIS IS, HONESTLY
   Budget Bites is a single static page with no server. Everything here runs in
   the visitor's own browser, so this is a *local profile gate*, not real
   authentication. Anyone who opens devtools can read the account store or skip
   the screen entirely. Treat it as "who is using this browser", not security.

   What it is genuinely good for: keeping one household's answers and plan
   separate from another's on a shared laptop, and not having to re-enter the
   whole form every time.

   Passwords are still never stored in the clear — each account gets a random
   salt and the password is stretched with PBKDF2-SHA256. That does not make
   the gate secure; it means a person who reads the store cannot immediately
   read a password that someone has probably reused elsewhere.

   Making this real would mean a server holding the accounts, doing the hashing
   on its side, and issuing a session cookie the page cannot forge. None of
   that can live in a file you double-click.
   ========================================================================== */

const Auth = (function () {
  'use strict';

  const ACCOUNTS_KEY = 'bb.accounts';
  const SESSION_KEY  = 'bb.session';
  const ITERATIONS   = 150000;

  let current = null;

  /* ------------------------------------------------------------- storage -- */

  function readAccounts() {
    try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || {}; }
    catch { return {}; }
  }

  function writeAccounts(a) {
    try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a)); return true; }
    catch { return false; }
  }

  /* -------------------------------------------------------------- crypto -- */

  const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));

  async function hashPassword(password, saltB64) {
    const salt = saltB64
      ? Uint8Array.from(atob(saltB64), c => c.charCodeAt(0))
      : crypto.getRandomValues(new Uint8Array(16));

    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);

    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, 256);

    return { hash: b64(bits), salt: b64(salt) };
  }

  /** Constant-time-ish compare so the check does not leak by timing. */
  function sameHash(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  /* ------------------------------------------------------------- session -- */

  function saveSession(email, remember) {
    const payload = JSON.stringify({ email, at: Date.now() });
    try {
      if (remember) localStorage.setItem(SESSION_KEY, payload);
      else sessionStorage.setItem(SESSION_KEY, payload);
    } catch { /* storage unavailable — the session simply will not persist */ }
  }

  function clearSession() {
    try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); } catch {}
  }

  function restoreSession() {
    let raw = null;
    try { raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY); } catch {}
    if (!raw) return null;
    try {
      const { email } = JSON.parse(raw);
      const acc = readAccounts()[email];
      return acc || null;
    } catch { return null; }
  }

  /* --------------------------------------------------------------- rules -- */

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function passwordProblem(pw) {
    if (pw.length < 8) return 'Use at least 8 characters.';
    if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'Mix in at least one letter and one number.';
    return null;
  }

  function passwordScore(pw) {
    let n = 0;
    if (pw.length >= 8)  n++;
    if (pw.length >= 12) n++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) n++;
    if (/[0-9]/.test(pw)) n++;
    if (/[^a-zA-Z0-9]/.test(pw)) n++;
    return Math.min(4, n);
  }

  /* ------------------------------------------------------------ accounts -- */

  async function signUp({ name, email, password }) {
    email = String(email).trim().toLowerCase();
    name  = String(name).trim();

    if (!name)                 throw new Error('What should we call you?');
    if (!EMAIL_RE.test(email)) throw new Error('That does not look like an email address.');
    const pwProblem = passwordProblem(password);
    if (pwProblem)             throw new Error(pwProblem);

    const accounts = readAccounts();
    if (accounts[email]) throw new Error('An account already exists for that email on this browser.');

    const { hash, salt } = await hashPassword(password);
    accounts[email] = {
      name, email, hash, salt, iterations: ITERATIONS,
      created: Date.now(), profile: null
    };

    if (!writeAccounts(accounts)) {
      throw new Error('This browser is blocking local storage, so the account cannot be saved.');
    }
    return accounts[email];
  }

  async function signIn({ email, password, remember }) {
    email = String(email).trim().toLowerCase();

    const accounts = readAccounts();
    const acc = accounts[email];

    // Hash regardless of whether the account exists, so a wrong email and a
    // wrong password take the same time and give the same message.
    const { hash } = await hashPassword(password, acc ? acc.salt : b64(new Uint8Array(16)));
    if (!acc || !sameHash(hash, acc.hash)) throw new Error('That email and password do not match.');

    current = acc;
    saveSession(email, remember);
    return acc;
  }

  function signOut() {
    current = null;
    clearSession();
    document.dispatchEvent(new CustomEvent('bb:auth', { detail: { user: null } }));
  }

  /* ------------------------------------------------- profile persistence -- */

  function saveProfile(profile) {
    if (!current) return;                      // guests are not persisted
    const accounts = readAccounts();
    if (!accounts[current.email]) return;
    accounts[current.email].profile = profile;
    accounts[current.email].lastPlan = Date.now();
    writeAccounts(accounts);
    current = accounts[current.email];
  }

  function loadProfile() {
    return current && current.profile ? current.profile : null;
  }

  return {
    signUp, signIn, signOut, saveProfile, loadProfile, restoreSession,
    passwordScore, passwordProblem,
    currentUser: () => current,
    _setCurrent: u => { current = u; },
    isGuest: () => current === null
  };
})();


/* A top-level `const` lives in the global lexical scope, not on `window`, so
   `window.Auth` would be undefined and any `window.Auth && ...` guard would
   silently skip. Publish it explicitly. */
window.Auth = Auth;


/* ==========================================================================
   The login screen itself
   ========================================================================== */

(function () {
  'use strict';

  const $ = s => document.querySelector(s);
  const esc = str => String(str).replace(/[&<>"']/g,
    c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

  const screen = $('#authScreen');
  if (!screen) return;

  let mode = 'in';                                   // 'in' | 'up'
  let busy = false;

  function render() {
    const isUp = mode === 'up';
    screen.innerHTML = `
    <div class="auth">
      <!-- ── brand side ── -->
      <aside class="auth__brand">
        <div class="auth__brandtop">
          <span class="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <defs><linearGradient id="authGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="48" y2="48">
                <stop stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFD8E7"/></linearGradient></defs>
              <rect x="1" y="1" width="46" height="46" rx="14" fill="url(#authGrad)"/>
              <path d="M24.5 9.5 37 22a3.5 3.5 0 0 1 0 5l-9.5 9.5a3.5 3.5 0 0 1-5 0L10 24V13a3.5 3.5 0 0 1 3.5-3.5h11Z" fill="#D2115C"/>
              <circle cx="17.5" cy="16.5" r="2.8" fill="#fff"/>
              <path d="M26 8.5c3.5-1.5 7-1 9 1-2.5 2.5-6 3-9-1Z" fill="#D2115C"/>
            </svg>
          </span>
          <span class="auth__wordmark">Budget<em>Bites</em></span>
        </div>

        <div class="auth__pitch">
          <h2>Your week of meals,<br><span class="script">planned to the rupee.</span></h2>
          <p>Sign in and Budget Bites remembers your household — your body, your cuisine,
             your allergies and your budget — so you never fill the form twice.</p>
          <ul class="auth__list">
            <li><span>🍽️</span> Personalised meal plans, with a recipe for every dish</li>
            <li><span>🛒</span> Grocery lists costed at real pack sizes and brands</li>
            <li><span>♻️</span> Ingredient reuse and a weekly shopping plan</li>
          </ul>
        </div>

        <div class="auth__orbit" aria-hidden="true">
          <span>🍓</span><span>🥥</span><span>🥕</span><span>🫑</span><span>🍅</span>
        </div>
      </aside>

      <!-- ── form side ── -->
      <div class="auth__panel">
        <div class="auth__tabs" role="tablist">
          <button class="auth__tab ${!isUp ? 'is-on' : ''}" data-mode="in"  role="tab" aria-selected="${!isUp}">Sign in</button>
          <button class="auth__tab ${isUp ? 'is-on' : ''}"  data-mode="up"  role="tab" aria-selected="${isUp}">Create account</button>
        </div>

        <h1 class="auth__title">${isUp ? 'Set up your kitchen' : 'Welcome back'}</h1>
        <p class="auth__sub">${isUp
          ? 'One account per household. It lives in this browser only.'
          : 'Pick up exactly where you left off.'}</p>

        <form id="authForm" novalidate autocomplete="on">
          ${isUp ? `
          <label class="field">
            <span class="field__label">Your name</span>
            <div class="field__control">
              <input type="text" id="authName" name="name" autocomplete="name"
                     placeholder="Harish" required>
            </div>
          </label>` : ''}

          <label class="field">
            <span class="field__label">Email</span>
            <div class="field__control">
              <input type="email" id="authEmail" name="email"
                     autocomplete="${isUp ? 'username' : 'username'}"
                     placeholder="you@example.com" required>
            </div>
          </label>

          <label class="field">
            <span class="field__label">Password</span>
            <div class="field__control">
              <input type="password" id="authPw" name="password"
                     autocomplete="${isUp ? 'new-password' : 'current-password'}"
                     placeholder="${isUp ? 'At least 8 characters' : 'Your password'}" required>
              <button type="button" class="field__reveal" id="authReveal"
                      aria-label="Show password" aria-pressed="false">Show</button>
            </div>
          </label>

          ${isUp ? `
          <div class="pwmeter" id="pwMeter" hidden>
            <div class="pwmeter__bar"><i></i></div>
            <span class="pwmeter__label"></span>
          </div>

          <label class="field">
            <span class="field__label">Confirm password</span>
            <div class="field__control">
              <input type="password" id="authPw2" name="confirm"
                     autocomplete="new-password" placeholder="Type it again" required>
            </div>
          </label>` : `
          <label class="auth__remember">
            <input type="checkbox" id="authRemember" checked>
            <span>Keep me signed in on this device</span>
          </label>`}

          <div class="err" id="authErr" role="alert" aria-live="polite"></div>

          <button type="submit" class="btn btn--primary btn--lg auth__submit" id="authSubmit">
            ${isUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button type="button" class="auth__guest" id="authGuest">
          Continue without an account →
        </button>

        <p class="auth__note">
          <b>A word on what this is.</b> Budget Bites has no server — this account lives
          only in this browser, and it separates one household's plan from another's
          rather than protecting anything. Your password is salted and stretched with
          PBKDF2 so it is never stored in readable form, but anyone with access to this
          device can bypass this screen. Please don't reuse an important password here.
        </p>
      </div>
    </div>`;

    bind();
  }

  function bind() {
    document.querySelectorAll('.auth__tab').forEach(t => t.addEventListener('click', () => {
      mode = t.dataset.mode;
      render();
      const first = $('#authName') || $('#authEmail');
      if (first) first.focus();
    }));

    const pw = $('#authPw');
    const reveal = $('#authReveal');
    reveal.addEventListener('click', () => {
      const shown = pw.type === 'text';
      pw.type = shown ? 'password' : 'text';
      reveal.textContent = shown ? 'Show' : 'Hide';
      reveal.setAttribute('aria-pressed', String(!shown));
      reveal.setAttribute('aria-label', shown ? 'Show password' : 'Hide password');
      pw.focus();
    });

    const meter = $('#pwMeter');
    if (meter) {
      pw.addEventListener('input', () => {
        const v = pw.value;
        meter.hidden = v.length === 0;
        const score = Auth.passwordScore(v);
        const label = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][score];
        meter.querySelector('i').style.width = ((score + 1) / 5 * 100) + '%';
        meter.dataset.score = score;
        meter.querySelector('.pwmeter__label').textContent = label;
      });
    }

    $('#authGuest').addEventListener('click', () => {
      Auth._setCurrent(null);
      unlock(null);
    });

    $('#authForm').addEventListener('submit', async e => {
      e.preventDefault();
      if (busy) return;

      const err = $('#authErr');
      const submit = $('#authSubmit');
      err.textContent = '';

      const email = $('#authEmail').value;
      const password = pw.value;

      try {
        busy = true;
        submit.disabled = true;
        submit.textContent = mode === 'up' ? 'Creating account…' : 'Signing in…';

        if (mode === 'up') {
          if (password !== $('#authPw2').value) throw new Error('The two passwords do not match.');
          await Auth.signUp({ name: $('#authName').value, email, password });
          // Straight in after signing up — no reason to make them type it twice.
          await Auth.signIn({ email, password, remember: true });
        } else {
          await Auth.signIn({ email, password, remember: $('#authRemember').checked });
        }
        unlock(Auth.currentUser());
      } catch (ex) {
        err.textContent = ex.message;
        submit.disabled = false;
        submit.textContent = mode === 'up' ? 'Create account' : 'Sign in';
        pw.focus();
        pw.select();
      } finally {
        busy = false;
      }
    });
  }

  /* --------------------------------------------------------- lock/unlock -- */

  function lock() {
    document.body.classList.add('is-locked');
    screen.hidden = false;
    render();
    const first = $('#authEmail');
    if (first) first.focus();
  }

  function unlock(user) {
    document.body.classList.remove('is-locked');
    screen.hidden = true;
    paintAccountChip(user);
    document.dispatchEvent(new CustomEvent('bb:auth', { detail: { user } }));
  }

  function paintAccountChip(user) {
    const slot = document.getElementById('accountSlot');
    if (!slot) return;

    if (!user) {
      slot.innerHTML = `<button class="acct acct--guest" id="signInBtn">Sign in</button>`;
      slot.querySelector('#signInBtn').addEventListener('click', lock);
      return;
    }

    const initial = (user.name || user.email).trim().charAt(0).toUpperCase();
    slot.innerHTML = `
      <div class="acct">
        <span class="acct__av">${esc(initial)}</span>
        <span class="acct__name">${esc(user.name || user.email)}</span>
        <button class="acct__out" id="signOutBtn" title="Sign out" aria-label="Sign out">Sign out</button>
      </div>`;
    slot.querySelector('#signOutBtn').addEventListener('click', () => {
      Auth.signOut();
      lock();
    });
  }

  /* ------------------------------------------------------------ start up -- */

  const resumed = Auth.restoreSession();
  if (resumed) {
    Auth._setCurrent(resumed);
    unlock(resumed);
  } else {
    lock();
  }
})();


/* ==========================================================================
   Budget Bites — UI layer
   Four-step wizard, live docket, results panels and the recipe popup.
   ========================================================================== */

(function () {
  'use strict';

  const $  = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const esc = str => String(str).replace(/[&<>"']/g,
    c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

  /* ------------------------------------------------------------------ state */
  const S = {
    age: null, height: null, weight: null, people: 2,
    cuisine: 'any', diet: null, allergies: [],
    goal: null, skill: null, time: 40, days: 7,
    budget: 2500, tier: 'popular'
  };

  let step = 0, PLAN = null, hidePantry = true;

  // Re-rendering the results (tier switch, pantry toggle) must not bounce the
  // reader back to the first tab or re-scroll the page under them.
  let activeTab = 'mealplan';

  const qtyLabel = l => l.unit === 'pc'
    ? l.qty + (l.qty === 1 ? ' pc' : ' pcs')
    : (l.qty >= 1000 ? (l.qty / 1000).toFixed(l.qty % 1000 ? 1 : 0) + (l.unit === 'ml' ? ' L' : ' kg')
                     : l.qty + ' ' + l.unit);

  /* ------------------------------------------------------- account state */

  /** Copies a saved profile over the defaults, ignoring anything unexpected. */
  function applyProfile(saved) {
    if (!saved) return;
    Object.keys(S).forEach(k => {
      if (saved[k] === undefined) return;
      // Allergies is the only array; copy it rather than sharing the reference.
      S[k] = Array.isArray(saved[k]) ? saved[k].slice() : saved[k];
    });
  }

  function resetProfile() {
    Object.assign(S, {
      age: null, height: null, weight: null, people: 2,
      cuisine: 'any', diet: null, allergies: [],
      goal: null, skill: null, time: 40, days: 7,
      budget: 2500, tier: 'popular'
    });
    step = 0;
    PLAN = null;
    $('#results').hidden = true;
    const nav = $('#navResults');
    if (nav) nav.hidden = true;
  }

  // Signing in or out swaps whose kitchen we are planning, so the form is
  // rebuilt from that account's saved answers rather than the last person's.
  document.addEventListener('bb:auth', e => {
    const user = e.detail && e.detail.user;
    resetProfile();
    if (user && window.Auth) applyProfile(Auth.loadProfile());
    drawForm();
  });

  /* ==================================================================
     Wizard definition
     ================================================================== */
  const STEPS = [
    { key:'who',     icon:'🧍', label:'Who is eating', t:'Who is eating',
      h:'The calorie maths needs a body to work from.', render:s1 },
    { key:'plate',   icon:'🥗', label:'Your plate',    t:'What you eat',
      h:'Pick a cuisine, then what is allowed on the plate and what is never.', render:s2 },
    { key:'kitchen', icon:'👩‍🍳', label:'Your kitchen', t:'Your kitchen',
      h:'Be honest — a plan you will not cook is worse than no plan.', render:s3 },
    { key:'shop',    icon:'💗', label:'The shop',      t:'The shop',
      h:'How far ahead to plan, and what it can cost.', render:s4 }
  ];

  function chip(group, val, label, sub, multi, emoji) {
    const on = multi ? S[group].includes(val) : S[group] === val;
    return `<button type="button" class="chip ${on ? 'is-on' : ''}" role="button"
      aria-pressed="${on}" data-g="${group}" data-v="${val}" data-multi="${multi ? 1 : 0}">
      ${emoji ? `<span class="chip__emoji">${emoji}</span>` : ''}
      <span class="chip__title">${esc(label)}</span>
      ${sub ? `<span class="chip__sub">${esc(sub)}</span>` : ''}</button>`;
  }

  function s1() {
    return `
    <div class="field-grid field-grid--3">
      <label class="field"><span class="field__label">Age</span>
        <div class="field__control"><input type="number" id="age" min="14" max="90"
          value="${S.age ?? ''}" placeholder="28"><span class="field__suffix">yrs</span></div></label>
      <label class="field"><span class="field__label">Height</span>
        <div class="field__control"><input type="number" id="height" min="120" max="220"
          value="${S.height ?? ''}" placeholder="170"><span class="field__suffix">cm</span></div></label>
      <label class="field"><span class="field__label">Weight</span>
        <div class="field__control"><input type="number" id="weight" min="30" max="200"
          value="${S.weight ?? ''}" placeholder="68"><span class="field__suffix">kg</span></div></label>
    </div>

    <span class="group-label">Fitness goal</span>
    <div class="chip-grid">${Object.entries(GOALS)
      .map(([k, v]) => chip('goal', k, v.n, v.d, false,
        { lose:'🔥', maintain:'⚖️', gain:'🌱', muscle:'💪' }[k])).join('')}</div>

    <span class="group-label">Number of consumers <em>— everyone eating from this plan</em></span>
    <div class="slider-card">
      <div class="slider-card__value"><span id="peopleOut">${S.people}</span><em>${S.people > 1 ? 'people' : 'person'}</em></div>
      <input type="range" id="people" class="range" min="1" max="8" step="1" value="${S.people}">
      <div class="slider-card__scale"><span>1</span><span>4</span><span>8</span></div>
    </div>`;
  }

  function s2() {
    return `
    <span class="group-label">Cuisine <em>— every dish in the plan is cooked this way</em></span>
    <div class="chip-grid">${Object.entries(CUISINES)
      .map(([k, v]) => chip('cuisine', k, v.n, v.d, false, v.emoji)).join('')}</div>

    <span class="group-label">Dietary preference</span>
    <div class="chip-grid">${Object.entries(DIETS)
      .map(([k, v]) => chip('diet', k, v.n, v.d, false,
        { vegan:'🌱', veg:'🥕', egg:'🥚', nonveg:'🍗' }[k])).join('')}</div>

    <span class="group-label">Allergies <em>— tap all that apply, leave blank if none</em></span>
    <div class="chip-grid chip-grid--tight">${Object.entries(ALLERGENS)
      .map(([k, v]) => chip('allergies', k, v, '', true,
        { dairy:'🥛', gluten:'🌾', peanut:'🥜', nuts:'🌰', egg:'🥚', fish:'🐟', soy:'🫘', sesame:'🌻' }[k])).join('')}</div>`;
  }

  function s3() {
    return `
    <span class="group-label">Cooking experience</span>
    <div class="chip-grid">${Object.entries(SKILLS)
      .map(([k, v]) => chip('skill', +k, v.n, v.d, false, { 1:'🥄', 2:'🍳', 3:'🔪' }[k])).join('')}</div>

    <span class="group-label">Available cooking time <em>— per meal, start to plate</em></span>
    <div class="slider-card">
      <div class="slider-card__value"><span id="timeOut">${S.time}</span><em>minutes</em></div>
      <input type="range" id="time" class="range" min="10" max="60" step="5" value="${S.time}">
      <div class="slider-card__scale"><span>10 min</span><span>35 min</span><span>60 min</span></div>
    </div>`;
  }

  function s4() {
    return `
    <span class="group-label">Preferred planning duration</span>
    <div class="chip-grid chip-grid--tight">${[3, 5, 7, 14]
      .map(d => chip('days', d, d + ' days', '', false,
        { 3:'🌗', 5:'🗓️', 7:'📅', 14:'📆' }[d])).join('')}</div>

    <span class="group-label">Grocery budget <em>— total for the whole plan, everyone eating</em></span>
    <div class="slider-card">
      <div class="slider-card__value"><span id="budgetOut">${money(S.budget)}</span></div>
      <input type="range" id="budget" class="range" min="500" max="15000" step="100" value="${S.budget}">
      <div class="slider-card__scale"><span>₹500</span><span>₹7,750</span><span>₹15,000</span></div>
    </div>

    <div class="callout callout--soft"><span>🌸</span>
      <p>If the plan will not fit, Budget Bites moves you to cheaper brands automatically and says so.
      It never quietly shrinks your portions to make the number work.</p></div>`;
  }

  /* ==================================================================
     Wizard rendering
     ================================================================== */
  function drawForm() {
    const st = STEPS[step];
    $('#stepno').textContent = `Step ${step + 1} of ${STEPS.length}`;
    $('#formBody').innerHTML =
      `<h3 class="step__legend"><span>${st.icon}</span> ${esc(st.t)}</h3>
       <p class="step__hint">${esc(st.h)}</p>${st.render()}`;

    $('#progressSteps').innerHTML = STEPS.map((s, i) =>
      `<li class="${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}" data-step="${i}">
         <span class="dot">${s.icon}</span><em>${esc(s.label)}</em></li>`).join('');

    $('#progressFill').style.width = ((step + 1) / STEPS.length * 100) + '%';
    $('#backBtn').disabled = step === 0;
    $('#nextBtn').textContent = step === STEPS.length - 1 ? 'Generate my plan' : 'Continue';
    $('#err').textContent = '';

    bindForm();
    drawTally();
  }

  function bindForm() {
    $$('.chip').forEach(c => c.addEventListener('click', () => {
      const g = c.dataset.g, multi = c.dataset.multi === '1';
      let v = c.dataset.v;
      if (g === 'skill' || g === 'days') v = +v;

      if (multi) {
        const i = S[g].indexOf(v);
        i > -1 ? S[g].splice(i, 1) : S[g].push(v);
      } else S[g] = v;

      $$(`.chip[data-g="${g}"]`).forEach(o => {
        const ov = (g === 'skill' || g === 'days') ? +o.dataset.v : o.dataset.v;
        const on = multi ? S[g].includes(ov) : S[g] === ov;
        o.setAttribute('aria-pressed', on);
        o.classList.toggle('is-on', on);
      });
      $('#err').textContent = '';
      drawTally();
    }));

    ['age', 'height', 'weight'].forEach(k => {
      const el = $('#' + k);
      if (el) el.addEventListener('input', () => {
        S[k] = el.value === '' ? null : +el.value;
        drawTally();
      });
    });

    const slider = (id, key, fmt) => {
      const el = $('#' + id);
      if (!el) return;
      el.addEventListener('input', () => {
        S[key] = +el.value;
        $('#' + id + 'Out').textContent = fmt(S[key]);
        if (id === 'people') {
          const em = $('#peopleOut').nextElementSibling;
          if (em) em.textContent = S.people > 1 ? 'people' : 'person';
        }
        drawTally();
      });
    };
    slider('people', 'people', v => v);
    slider('time',   'time',   v => v);
    slider('budget', 'budget', v => money(v));

    $$('#progressSteps li').forEach(li => {
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        const target = +li.dataset.step;
        if (target <= step) { step = target; drawForm(); return; }
        const e = validate();
        if (e) { $('#err').textContent = e; return; }
        step = Math.min(target, step + 1);
        drawForm();
      });
    });
  }

  function drawTally() {
    const ready = S.age && S.height && S.weight;
    const T = ready && S.goal ? targets(S) : null;

    const rows = [
      ['Eaters',   S.people ? S.people + (S.people > 1 ? ' people' : ' person') : null],
      ['Body',     ready ? `${S.age}y · ${S.height}cm · ${S.weight}kg` : null],
      ['Goal',     S.goal ? GOALS[S.goal].n : null],
      ['Target',   T ? T.kcal.toLocaleString('en-IN') + ' kcal/day' : null],
      ['Cuisine',  CUISINES[S.cuisine].n],
      ['Diet',     S.diet ? DIETS[S.diet].n : null],
      ['Avoiding', S.allergies.length ? S.allergies.map(a => ALLERGENS[a]).join(', ') : (S.diet ? 'Nothing' : null)],
      ['Skill',    S.skill ? SKILLS[S.skill].n : null],
      ['Time',     S.skill ? S.time + ' min/meal' : null],
      ['Duration', S.days + ' days'],
      ['Budget',   money(S.budget)],
      ['Per person/day', money(S.budget / (S.days * S.people))]
    ];

    $('#tallyBody').innerHTML = rows.map(([l, v]) =>
      `<div class="tline"><span class="lab">${esc(l)}</span>
       <span class="val ${v ? '' : 'empty'}">${v ? esc(String(v)) : '—'}</span></div>`).join('');

    const pool = (S.diet && S.skill) ? eligible(S).length : null;
    $('#tallyNote').textContent = pool !== null
      ? `${pool} dishes match your cuisine, diet, allergies, skill and time. The plan is drawn from these.`
      : 'Fill in the form and this fills itself. Nothing is sent anywhere — the plan is built in your browser.';
  }

  function validate() {
    if (step === 0) {
      if (!S.age    || S.age < 14     || S.age > 90)     return 'Enter an age between 14 and 90.';
      if (!S.height || S.height < 120 || S.height > 220) return 'Enter a height between 120 and 220 cm.';
      if (!S.weight || S.weight < 30  || S.weight > 200) return 'Enter a weight between 30 and 200 kg.';
      if (!S.goal) return 'Pick a fitness goal.';
    }
    if (step === 1 && !S.diet)  return 'Pick a dietary preference.';
    if (step === 2 && !S.skill) return 'Pick your cooking experience.';
    return null;
  }

  $('#backBtn').addEventListener('click', () => {
    if (step > 0) { step--; drawForm(); $('#plan').scrollIntoView({ behavior:'smooth', block:'start' }); }
  });

  $('#nextBtn').addEventListener('click', () => {
    const e = validate();
    if (e) { $('#err').textContent = e; return; }
    if (step < STEPS.length - 1) {
      step++; drawForm();
      $('#plan').scrollIntoView({ behavior:'smooth', block:'start' });
      return;
    }
    PLAN = generate(S);
    if (window.Auth) Auth.saveProfile(S);   // no-op for guests
    drawResults({ scroll: true, resetTab: true });
  });

  /* ==================================================================
     Results
     ================================================================== */
  const SLOTNAME = { breakfast:'Breakfast', lunch:'Lunch', dinner:'Dinner', snack:'Snack' };
  const SLOTICON = { breakfast:'🌅', lunch:'☀️', dinner:'🌙', snack:'🍓' };
  const DAYNAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  function plinks(query) {
    return `<span class="plinks">` + PLATFORMS.map(pf =>
      `<a class="plink" href="${pf.url(query)}" target="_blank" rel="noopener noreferrer"
          style="background:${pf.c}" title="Find ${esc(query)} on ${pf.n}">${pf.ab}</a>`).join('') + `</span>`;
  }

  function drawResults({ scroll = false, resetTab = false } = {}) {
    const sec = $('#results');
    sec.hidden = false;
    $('#navResults').hidden = false;
    if (resetTab) activeTab = 'mealplan';

    if (PLAN.error) {
      sec.innerHTML = `
        <div class="results__head">
          <span class="eyebrow"><span class="eyebrow__dot"></span> Your plan</span>
          <h2 class="section__title">No dishes left to work with</h2>
        </div>
        <div class="warnings"><div class="warn-item"><span>⚠️</span><p>
          <b>Nothing matches every filter at once.</b> Your cuisine, diet, allergies, skill level and
          ${S.time}-minute limit rule out every option for ${esc(PLAN.error.join(' and '))}.
          Loosen one — raising the time limit or switching cuisine to "a mix of everything" usually opens things up.
        </p></div></div>
        <div class="results__foot"><a href="#plan" class="btn btn--ghost">Go back and adjust</a></div>`;
      sec.scrollIntoView({ behavior:'smooth', block:'start' });
      return;
    }

    const { days, factors, lines, slots, T, borrowed } = PLAN;
    const total      = lines.reduce((a, l) => a + l.cost, 0);
    const pantryCost = lines.filter(l => l.pantry).reduce((a, l) => a + l.cost, 0);
    const shown      = hidePantry ? total - pantryCost : total;
    const over       = shown > S.budget;
    const servings   = days.flat().filter(Boolean).length * S.people;

    const sumBy   = key => days.map((d, i) => d.reduce((a, r) => a + (r ? r[key] : 0), 0) * factors[i]);
    const dayKcal = sumBy('kcal').map(Math.round);
    const avg     = arr => Math.round(arr.reduce((a, b) => a + b, 0) / days.length);
    const avgK = avg(dayKcal), avgP = avg(sumBy('pro')), avgC = avg(sumBy('carb')), avgF = avg(sumBy('fat'));
    const maxK = Math.max(...dayKcal, 1);

    const reuse = lines.filter(l => l.meals > 1 && !l.pantry)
                       .sort((a, b) => b.meals - a.meals).slice(0, 6);

    const allTiers = tierTotals(S, days, factors);
    const tierT = {}, tierLines = {};
    for (const t in allTiers) {
      tierLines[t] = allTiers[t];
      tierT[t] = allTiers[t].filter(l => !(hidePantry && l.pantry)).reduce((a, l) => a + l.cost, 0);
    }

    const swaps = lines.filter(l => !(hidePantry && l.pantry)).map(l => {
      const v  = tierLines.value.find(x => x.id === l.id);
      const pm = tierLines.premium.find(x => x.id === l.id);
      return { name: l.name, cur: l, val: v, prem: pm, save: l.cost - (v ? v.cost : l.cost) };
    }).filter(x => x.save > 0).sort((a, b) => b.save - a.save).slice(0, 6);

    const platRows = platformRows(shown);

    /* ---- notices ---- */
    const notices = [];
    if (PLAN.autoTier) {
      notices.push(PLAN.autoTier.fits
        ? `Your plan did not fit on <b>${TIERS[PLAN.autoTier.from].n}</b> brands, so Budget Bites moved you to
           <b>${TIERS[PLAN.autoTier.to].n}</b> to bring it inside the cap. Switch back on the grocery list if you would rather pay more.`
        : `No brand tier fits this cap, so Budget Bites has put you on <b>${TIERS[PLAN.autoTier.to].n}</b> —
           the cheapest available — and the total below is the best this plan can be bought for.`);
    }
    if (borrowed.length) {
      notices.push(`${CUISINES[S.cuisine].n} did not have enough options for
        <b>${borrowed.map(b => SLOTNAME[b].toLowerCase()).join(' and ')}</b>, so those slots borrow from the wider recipe book.`);
    }
    if (avgP < T.protein * 0.85) {
      notices.push(`Protein averages <b>${avgP}g</b> a day against a ${T.protein}g target for your goal —
        the dishes available under these filters cannot get there on their own. Consider adding curd, eggs or a dal to one meal.`);
    }

    sec.innerHTML = `
    <div class="results__head">
      <span class="eyebrow"><span class="eyebrow__dot"></span> Served</span>
      <h2 class="section__title">${S.days} days, ${S.people} ${S.people > 1 ? 'people' : 'person'}, ${servings} servings</h2>
      <p class="section__lede">${esc(CUISINES[S.cuisine].n.toLowerCase())} · ${esc(DIETS[S.diet].n.toLowerCase())} ·
        ${esc(GOALS[S.goal].n.toLowerCase())} · ${S.time} min a meal${
        S.allergies.length ? ' · no ' + esc(S.allergies.map(a => ALLERGENS[a].toLowerCase()).join(', ')) : ''}</p>
    </div>

    ${notices.length ? `<div class="warnings">${notices.map(n =>
      `<div class="warn-item"><span>⚠️</span><p>${n}</p></div>`).join('')}</div>` : ''}

    <div class="notice ${over ? 'notice--bad' : 'notice--good'}">
      ${over
        ? `<b>This lands ${money(shown - S.budget)} over your cap.</b> Budget Bites already swapped toward the
           cheapest dishes and brands your filters allow — ${money(PLAN.floor)} is the least this plan can cost.
           Raise the cap to that, shorten the plan, or tick the pantry box below if you already own the spices.`
        : `<b>Fits, with ${money(S.budget - shown)} to spare.</b> That is
           ${money(shown / (S.days * S.people))} per person per day across ${lines.filter(l => !(hidePantry && l.pantry)).length} items.`}
    </div>

    <div class="scoreboard">
      <div class="score score--hero">
        <span class="score__emoji">🛒</span>
        <span class="score__label">Estimated grocery cost</span>
        <strong class="score__value">${money(shown)}</strong>
        <p class="score__note">of ${money(S.budget)} budget${hidePantry ? ' · pantry excluded' : ''}</p>
        <div class="score__meter"><i style="width:${Math.min(100, shown / S.budget * 100)}%"></i></div>
      </div>
      <div class="score"><span class="score__emoji">💗</span>
        <span class="score__label">Cost per serving</span>
        <strong class="score__value">${money(shown / servings)}</strong>
        <p class="score__note">${servings} servings cooked</p></div>
      <div class="score"><span class="score__emoji">🔥</span>
        <span class="score__label">Calories per day</span>
        <strong class="score__value">${avgK.toLocaleString('en-IN')}</strong>
        <p class="score__note">target ${T.kcal.toLocaleString('en-IN')} kcal</p></div>
      <div class="score"><span class="score__emoji">💪</span>
        <span class="score__label">Protein per day</span>
        <strong class="score__value">${avgP}<small> g</small></strong>
        <p class="score__note">target ${T.protein} g</p></div>
    </div>

    <div class="tabs" role="tablist">
      ${[['mealplan','🍽️','Meal plan'],['grocery','🛒','Grocery list'],['nutrition','📊','Nutrition'],
         ['brands','🏷️','Brand analysis'],['order','🚚','Where to order']].map(([k,e,l]) =>
        `<button class="tab ${activeTab === k ? 'is-active' : ''}" role="tab" data-panel="${k}"><span>${e}</span> ${l}</button>`).join('')}
    </div>

    <!-- ═══════════ MEAL PLAN ═══════════ -->
    <div class="panel ${activeTab === 'mealplan' ? 'is-active' : ''}" id="panel-mealplan">
      <div class="card">
        <h3 class="card__title">Meal plan</h3>
        <p class="card__sub">Tap any dish to open its full recipe. Quantities assume ${S.people}
          ${S.people > 1 ? 'servings' : 'serving'} of each.</p>
        <div class="plan-scroll"><div class="plan" style="grid-template-columns:repeat(${S.days},225px)">
          ${days.map((d, i) => `<div class="daycol">
            <div class="dayhd"><span>Day ${i + 1}</span><span>${DAYNAMES[i % 7]}</span></div>
            ${d.map((r, j) => r ? `
              <button class="meal-btn" data-recipe="${r.id}" data-factor="${factors[i].toFixed(3)}">
                <span class="slot">${SLOTICON[slots[j]]} ${SLOTNAME[slots[j]]}</span>
                <span class="nm">${esc(r.n)}</span>
                <span class="mt"><span>${Math.round(r.kcal * factors[i])} kcal</span>
                  <span>${r.time} min</span><span>${money(r.cps * S.people * factors[i])}</span></span>
                <span class="openrec">View recipe →</span>
              </button>` : '').join('')}
          </div>`).join('')}
        </div></div>
      </div>
    </div>

    <!-- ═══════════ GROCERY ═══════════ -->
    <div class="panel ${activeTab === 'grocery' ? 'is-active' : ''}" id="panel-grocery">
      <div class="grocery-head">
        <div><h3>Your optimised grocery list</h3>
          <p>Rounded up to real pack sizes, so the total is what you would actually hand over at the till.</p></div>
        <div class="grocery-head__right">
          <div class="grocery-head__total">${money(shown)}</div><p>estimated total</p></div>
      </div>

      <label class="pantry-toggle no-print">
        <input type="checkbox" id="pantryChk" ${hidePantry ? 'checked' : ''}>
        <span><b>I already have the spices, oil and salt.</b><br>
        <span class="muted">${hidePantry
          ? `${money(pantryCost)} of one-time pantry staples is left out of the total. Untick it if you are stocking a kitchen from scratch.`
          : `${money(pantryCost)} of one-time pantry staples is included. Tick it once you own them — they last well beyond this plan.`}</span></span>
      </label>

      <div class="tierbar no-print" role="group" aria-label="Brand tier">
        ${Object.entries(TIERS).map(([k, v]) =>
          `<button class="tierbtn ${S.tier === k ? 'is-on' : ''}" data-tier="${k}" aria-pressed="${S.tier === k}">
             ${v.n}<small>${money(tierT[k])}</small></button>`).join('')}
      </div>

      ${AISLES.map(a => {
        const items = lines.filter(l => l.aisle === a && !(hidePantry && l.pantry));
        if (!items.length) return '';
        const sub = items.reduce((x, l) => x + l.cost, 0);
        return `<section class="aisle">
          <header class="aisle__head"><span class="aisle__emoji">${
            {'Fresh produce':'🥬','Grains & flour':'🌾','Dal & pulses':'🫘',
             'Dairy & protein':'🥚','Spices':'🧂','Oils & pantry':'🫗'}[a]}</span>
            <div><div class="aisle__name">${esc(a)}</div>
              <div class="aisle__count">${items.length} ${items.length === 1 ? 'item' : 'items'}</div></div>
            <span class="aisle__sub">${money(sub)}</span></header>
          ${items.sort((x, y) => x.name.localeCompare(y.name)).map(l => `
            <div class="item" data-item="${esc(l.id)}">
              <span class="item__check" role="checkbox" aria-checked="false" tabindex="0"
                    aria-label="Mark ${esc(l.name)} as bought">✓</span>
              <div class="iblock">
                <div class="item__name">${esc(l.name)}</div>
                <div class="brandline"><span>${esc(l.brand.n)}${l.packs > 1 ? ` × ${l.packs}` : ''}</span>${plinks(l.brand.n)}</div>
              </div>
              <span class="item__qty">${qtyLabel(l)}</span>
              <span class="item__cost">${money(l.cost)}</span>
            </div>`).join('')}
        </section>`;
      }).join('')}
      <div class="grand"><span>ESTIMATED TOTAL</span><span class="n">${money(shown)}</span></div>
    </div>

    <!-- ═══════════ NUTRITION ═══════════ -->
    <div class="panel ${activeTab === 'nutrition' ? 'is-active' : ''}" id="panel-nutrition">
      <div class="nutri-grid">
        <div class="card">
          <h3 class="card__title">Against your targets</h3>
          <p class="card__sub">Per person, per day, averaged across the plan.</p>
          <div class="macro-list">
            ${[['Protein', avgP, T.protein, 'var(--c1)'],
               ['Carbohydrate', avgC, T.carbs, 'var(--c2)'],
               ['Fat', avgF, T.fat, 'var(--c3)']].map(([n, v, t, c]) => `
              <div class="macro">
                <div class="macro__top"><span class="macro__name">${n}</span>
                  <span class="macro__target">target ${t}g</span>
                  <span class="macro__val">${v}g</span></div>
                <div class="bar"><i style="width:${Math.min(100, v / t * 100)}%;background:${c}"></i></div>
              </div>`).join('')}
          </div>
          <div class="body-stats">
            <div class="body-stat"><strong>${T.bmi}</strong><span>BMI — ${esc(T.bmiBand)}</span></div>
            <div class="body-stat"><strong>${T.tdee.toLocaleString('en-IN')}</strong><span>kcal daily burn</span></div>
            <div class="body-stat"><strong>${T.kcal.toLocaleString('en-IN')}</strong><span>kcal target</span></div>
          </div>
        </div>

        <div class="card">
          <h3 class="card__title">Day by day</h3>
          <p class="card__sub">Every bar against a target of ${T.kcal.toLocaleString('en-IN')} kcal.
            Small swings are normal and fine.</p>
          <div class="kcal-chart">
            ${dayKcal.map((k, i) => `<div class="kcal-bar">
              <div class="kcal-bar__fill" style="height:${k / maxK * 100}%"><span>${k}</span></div>
              <span class="kcal-bar__label">D${i + 1}</span></div>`).join('')}
          </div>
          <p class="card__sub" style="margin-top:26px">Estimated daily need is
            ${T.tdee.toLocaleString('en-IN')} kcal; the ${esc(GOALS[S.goal].n.toLowerCase())} goal
            sets the target at ${T.kcal.toLocaleString('en-IN')}.</p>
        </div>
      </div>
    </div>

    <!-- ═══════════ BRANDS ═══════════ -->
    <div class="panel ${activeTab === 'brands' ? 'is-active' : ''}" id="panel-brands">
      <div class="card">
        <h3 class="card__title">Brand cost analysis</h3>
        <p class="card__sub">The same meal plan, shopped three ways. Switching tier on the grocery list re-prices every line.</p>
        <div class="tiergrid">
          ${Object.entries(TIERS).map(([k, v]) => `
            <div class="tiercard ${S.tier === k ? 'is-on' : ''}">
              <div class="lab">${v.n}</div><b>${money(tierT[k])}</b>
              <span class="muted">${k === 'popular' ? 'baseline'
                : (tierT[k] < tierT.popular ? money(tierT.popular - tierT[k]) + ' cheaper than popular'
                                            : money(tierT[k] - tierT.popular) + ' more than popular')}</span>
              <div class="muted tiercard__d">${esc(v.d)}</div>
            </div>`).join('')}
        </div>

        ${swaps.length ? `
        <p class="card__sub" style="margin:26px 0 12px">Where the gap actually sits — the lines worth downgrading first.</p>
        <div class="tablewrap"><table class="ptable">
          <thead><tr><th>Item</th><th>Value option</th><th>Your pick</th><th>Premium</th><th>You'd save</th></tr></thead>
          <tbody>${swaps.map(x => `<tr>
            <td>${esc(x.name)}<div class="brandline" style="margin-top:3px">${plinks(x.name)}</div></td>
            <td><span class="bn">${x.val ? esc(x.val.brand.n) : '—'}</span>${x.val ? money(x.val.cost) : ''}</td>
            <td><span class="bn">${esc(x.cur.brand.n)}</span>${money(x.cur.cost)}</td>
            <td><span class="bn">${x.prem ? esc(x.prem.brand.n) : '—'}</span>${x.prem ? money(x.prem.cost) : ''}</td>
            <td class="save">${money(x.save)}</td></tr>`).join('')}</tbody>
        </table></div>` : `<p class="card__sub">You are already on the cheapest option for every line in this plan.</p>`}
        <p class="card__sub" style="margin-top:16px">Shelf prices are indicative estimates, not live quotes —
          tap the platform buttons on any row to check the real number today.</p>
      </div>
    </div>

    <!-- ═══════════ ORDER ═══════════ -->
    <div class="panel ${activeTab === 'order' ? 'is-active' : ''}" id="panel-order">
      <div class="card">
        <h3 class="card__title">Where to order</h3>
        <p class="card__sub">Same basket, priced across the quick-commerce apps.
          Every ingredient row on the grocery list links straight into that app's search.</p>
        <div class="tablewrap"><table class="ptable">
          <thead><tr><th>Platform</th><th>Basket</th><th>Delivery</th><th>Handling</th><th>Total</th><th>Delivers in</th></tr></thead>
          <tbody>${platRows.map((r, i) => `<tr class="${i === 0 ? 'best' : ''}">
            <td><span class="pdot" style="background:${r.pf.c}"></span>${esc(r.pf.n)}${
              i === 0 ? '<span class="badge">CHEAPEST</span>' : ''}</td>
            <td>${money(r.basket)}</td><td>${r.ship ? money(r.ship) : 'Free'}</td>
            <td>${r.fee ? money(r.fee) : '—'}</td><td><b>${money(r.total)}</b></td>
            <td class="muted">${esc(r.pf.eta)}</td></tr>`).join('')}</tbody>
        </table></div>
        <div class="platgrid no-print">
          ${PLATFORMS.map(pf => {
            const first = lines.filter(l => !(hidePantry && l.pantry))[0] || lines[0];
            return `<a class="platbtn" href="${pf.url(first.brand.n)}" target="_blank" rel="noopener noreferrer">
              <span class="pdot" style="background:${pf.c}"></span>Open ${esc(pf.n)}</a>`;
          }).join('')}
          <button class="platbtn" id="copyBrandBtn">Copy list with brands</button>
        </div>
        <div class="notice notice--good" style="margin-top:20px">
          <b>Read these totals as a starting point, not a quote.</b> Quick-commerce prices move by the hour
          and by dark store, and a browser page cannot read them directly — the numbers above apply each
          platform's typical price position and fee structure to your basket. The links are live: they open
          a real search on that app, where you will see today's price.
        </div>
      </div>
    </div>

    <div class="results__foot no-print">
      <button class="btn btn--ghost" id="editBtn">Change my answers</button>
      <button class="btn btn--primary" id="redoBtn">Regenerate plan</button>
      <button class="btn btn--ghost" id="copyBtn">Copy list</button>
      <button class="btn btn--ghost" id="printBtn">Print / save as PDF</button>
    </div>`;

    bindResults(lines, shown);
    if (scroll) sec.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  /* ------------------------------------------------------------ results wiring */
  function bindResults(lines, shown) {
    $$('.tab').forEach(tab => tab.addEventListener('click', () => {
      activeTab = tab.dataset.panel;
      $$('.tab').forEach(t => t.classList.toggle('is-active', t === tab));
      $$('.panel').forEach(p => p.classList.toggle('is-active', p.id === 'panel-' + activeTab));
    }));

    $$('.meal-btn').forEach(b => b.addEventListener('click', () =>
      openRecipe(b.dataset.recipe, +b.dataset.factor)));

    $$('#panel-grocery .item').forEach(row => {
      const toggle = () => {
        const on = row.classList.toggle('is-checked');
        row.querySelector('.item__check').setAttribute('aria-checked', String(on));
      };
      row.addEventListener('click', e => { if (!e.target.closest('a')) toggle(); });
      row.querySelector('.item__check').addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); toggle(); }
      });
    });

    const chk = $('#pantryChk');
    if (chk) chk.onchange = () => { hidePantry = chk.checked; drawResults(); };

    $$('.tierbtn').forEach(b => b.onclick = () => {
      S.tier = b.dataset.tier;
      PLAN.lines = aggregate(S, PLAN.days, PLAN.factors);
      PLAN.autoTier = null;           // an explicit choice overrides the automatic one
      drawResults();
    });

    $('#printBtn').onclick = () => window.print();
    $('#editBtn').onclick  = () => $('#plan').scrollIntoView({ behavior:'smooth' });
    $('#redoBtn').onclick  = () => { PLAN = generate(S); drawResults({ scroll: true, resetTab: true }); };

    const copy = (btn, text, label) => {
      navigator.clipboard.writeText(text).then(() => {
        const old = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(() => { btn.textContent = old || label; }, 1600);
      }).catch(() => { btn.textContent = 'Copy failed'; });
    };

    $('#copyBtn').onclick = e => {
      const txt = AISLES.map(a => {
        const items = lines.filter(l => l.aisle === a && !(hidePantry && l.pantry));
        return items.length ? a.toUpperCase() + '\n' + items.map(l =>
          `  ${l.name} — ${qtyLabel(l)} — ${money(l.cost)}`).join('\n') : '';
      }).filter(Boolean).join('\n\n') + `\n\nTOTAL ${money(shown)}`;
      copy(e.currentTarget, txt, 'Copy list');
    };

    const cb = $('#copyBrandBtn');
    if (cb) cb.onclick = e => {
      const txt = `BUDGET BITES — ${S.days} days, ${S.people} people (${TIERS[S.tier].n} brands)\n\n` +
        AISLES.map(a => {
          const items = lines.filter(l => l.aisle === a && !(hidePantry && l.pantry));
          return items.length ? a.toUpperCase() + '\n' + items.map(l =>
            `  ${l.brand.n} — ${qtyLabel(l)}${l.packs > 1 ? ` (${l.packs} packs)` : ''} — ${money(l.cost)}`).join('\n') : '';
        }).filter(Boolean).join('\n\n') + `\n\nESTIMATED TOTAL ${money(shown)}`;
      copy(e.currentTarget, txt, 'Copy list with brands');
    };
  }

  /* ==================================================================
     Recipe popup
     ================================================================== */
  const modal = $('#recipeModal');
  let lastFocus = null;

  function openRecipe(id, factor) {
    const r = RECIPES.find(x => x.id === id);
    if (!r) return;

    const scale = (factor || 1) * S.people;
    const ings = Object.entries(r.ing).map(([k, q]) => {
      const g = ING[k], amt = q * scale;
      const label = g.u === 'pc'
        ? (Math.round(amt * 10) / 10) + (amt <= 1 ? ' pc' : ' pcs')
        : (amt >= 1000 ? (amt / 1000).toFixed(1) + (g.u === 'ml' ? ' L' : ' kg')
                       : Math.round(amt) + ' ' + g.u);
      return { name: g.n, label, pantry: g.pantry };
    });

    lastFocus = document.activeElement;
    $('#modalBody').innerHTML = `
      <div class="rec-head">
        <span class="rec-cuisine">${CUISINES[r.cuisine].emoji} ${esc(CUISINES[r.cuisine].n)}</span>
        <h3 id="modalTitle">${esc(r.n)}</h3>
        <div class="rec-meta">
          <span><b>${r.prep}</b> min prep</span>
          <span><b>${r.cook}</b> min cook</span>
          <span><b>${SKILLS[r.skill].n}</b></span>
          <span><b>${esc(DIETS[r.diet].n)}</b></span>
        </div>
        <div class="rec-macros">
          <div><strong>${Math.round(r.kcal * (factor || 1))}</strong><span>kcal / serving</span></div>
          <div><strong>${Math.round(r.pro * (factor || 1))}g</strong><span>protein</span></div>
          <div><strong>${Math.round(r.carb * (factor || 1))}g</strong><span>carbs</span></div>
          <div><strong>${Math.round(r.fat * (factor || 1))}g</strong><span>fat</span></div>
        </div>
      </div>

      <div class="rec-body">
        <div class="rec-col">
          <h4>Ingredients <em>for ${S.people} ${S.people > 1 ? 'servings' : 'serving'}</em></h4>
          <ul class="rec-ing">${ings.map(i =>
            `<li><span>${esc(i.name)}${i.pantry ? '<i class="pantry-dot" title="Pantry staple"></i>' : ''}</span>
                 <b>${esc(i.label)}</b></li>`).join('')}</ul>
          ${r.allerg.length ? `<p class="rec-allerg"><b>Contains:</b> ${
            esc(r.allerg.map(a => ALLERGENS[a] || a).join(', '))}</p>` : ''}
        </div>

        <div class="rec-col rec-col--wide">
          <h4>Method</h4>
          <ol class="rec-steps">${r.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
          ${r.tip ? `<div class="rec-tip"><span>💡</span><p><b>The one that matters.</b> ${esc(r.tip)}</p></div>` : ''}
        </div>
      </div>`;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal__close').focus();
  }

  function closeRecipe() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeRecipe(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeRecipe(); });

  /* ==================================================================
     Kitchen stats
     ================================================================== */
  (function kitchenStats() {
    const brandCount = Object.values(BR).flat().length;
    $('#statRecipes').textContent     = RECIPES.length;
    $('#statIngredients').textContent = Object.keys(ING).length;
    $('#statBrands').textContent      = brandCount;
    $('#statVegan').textContent       = RECIPES.filter(r => r.diet === 'vegan').length;
    $('#heroRecipes').textContent     = RECIPES.length;
    $('#heroBrands').textContent      = brandCount;

    $('#pantryStrip').innerHTML = Object.values(ING)
      .map(g => `<span class="pantry-pill">${esc(g.n)}</span>`).join('');
  })();

  if (window.Auth && Auth.currentUser()) applyProfile(Auth.loadProfile());
  drawForm();
})();
