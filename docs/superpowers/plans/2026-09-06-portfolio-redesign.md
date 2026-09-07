# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current HTML5UP-template personal site with a from-scratch, single-page, dark, cinematic, developer-inspired site (terminal-boot hero, real-geography map journey, bespoke per-card live diagrams, a live AI-reply demo, a skill constellation), backed by accurate ExaCare/Apple/Amazon/AMD content, with the old site preserved in `legacy/`.

**Architecture:** Static, zero-build site: `index.html` (markup) + `assets/css/style.css` (all styles) + `assets/js/main.js` (all behavior, one top-level IIFE, one named function per feature). No framework, no bundler, no package.json. Every interactive piece degrades under `prefers-reduced-motion` and stops animating when its section leaves the viewport.

**Tech Stack:** Plain HTML5, CSS3 (custom properties, grid, clip-path, backdrop-filter), vanilla ES5-style JS (`IntersectionObserver`, `requestAnimationFrame`, SVG DOM, Canvas 2D). Google Fonts (Inter) via `<link>`, no other external dependencies.

## Global Constraints

- No em dash (`—`) anywhere in shipped copy or code strings: prose, terminal boot lines, the AI chat demo's reply text, visualization captions. En dashes (`–`) for date ranges are fine; the em dash character specifically is not.
- Respect `prefers-reduced-motion: reduce`: disable typing effects, drifting/looping animation, and blob motion; show end states immediately.
- No personal photo anywhere.
- Do not state a leveling claim ("Software Engineer III", "promoted to"). Title is "Full Stack Software Engineer" (ExaCare) / "Software Development Engineer" (Apple, Amazon) / "Software Engineer Full Stack Intern" (AMD), matching the resume exactly.
- The fitness/calorie-bot project's written description stays intentionally high-level (no invented tech stack or specifics beyond: tracks meals and calories, nudges healthier choices, remembers groceries from a connected Instacart list). The AI-reply demo's exact exchange text (groceries/meal suggestion) was separately validated during brainstorming and may be used verbatim.
- Company marks are simple text badges (e.g. a small rounded pill reading "Apple", "Amazon", "AMD", "ExaCare"), not hand-drawn logo recreations, decided at implementation time in favor of a safer, faster, equally legible approach. Swappable for official brand SVGs later.
- Every animated component that loops or runs continuously must pause when its containing section is not intersecting the viewport (`IntersectionObserver`-gated), matching the existing canvas-visualization pattern.

---

## File Structure

- `index.html` (new): all markup, sections in document order, one `<script src="assets/js/main.js">` at the end.
- `assets/css/style.css` (new): design tokens, reset, and every component's styles, appended to in document order as sections are built.
- `assets/js/main.js` (new): one top-level IIFE. Each task appends one more named function (plus its invocation) immediately before the final `})();` line.
- `legacy/` (new folder): the entire current site, moved intact via `git mv` so relative paths inside it keep working unchanged.
- `Resume.pdf` (already replaced, no further action needed in this plan).

---

### Task 1: Move the old site into `legacy/`

**Files:**
- Move: `index.html` &rarr; `legacy/index.html`
- Move: `assets/` &rarr; `legacy/assets/`
- Move: `images/` &rarr; `legacy/images/`

**Interfaces:** None (repository reorganization only, no code).

- [ ] **Step 1: Confirm a clean working tree before moving anything**

Run: `git status --short`
Expected: no output (clean tree). If there is output, stop and investigate before proceeding; do not move files over uncommitted work.

- [ ] **Step 2: Create the `legacy/` directory and move the old site into it**

```bash
mkdir -p legacy
git mv index.html legacy/index.html
git mv assets legacy/assets
git mv images legacy/images
```

- [ ] **Step 3: Verify the move preserved relative paths**

Run: `python3 -m http.server 8000` (from the repository root, in the background or a separate terminal), then open `http://localhost:8000/legacy/index.html` in a browser.
Expected: the old site renders exactly as before (sidebar nav, Amazon/AMD spotlight sections with their gif backgrounds, the four old project tiles, education, skills). Open the browser console: no 404s for CSS/JS/image assets.
Stop the server (`Ctrl+C`) when done.

- [ ] **Step 4: Confirm the repository root no longer has a live site**

Run: `ls`
Expected: `Resume.pdf`, `legacy/`, `docs/`, `.git`, `.gitignore` (no `index.html`, `assets/`, or `images/` at the root, they now live under `legacy/`). This is expected and temporary; Task 2 creates the new root `index.html`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Move old site into legacy/ ahead of the redesign"
```

---

### Task 2: New page shell, design tokens, and nav

**Files:**
- Create: `index.html`
- Create: `assets/css/style.css`
- Create: `assets/js/main.js`

**Interfaces:**
- Produces: CSS custom properties `--ink`, `--paper`, `--mist`, `--slate`, `--line`, `--accent`, `--accent-deep`, `--night`, `--signal`, `--glow-blue`, `--glow-purple`, `--glow-teal`, `--font`, `--wrap`, `--ease` (every later task's CSS uses these, never hardcoded colors).
- Produces: `.wrap`, `.reveal`, `.stagger`, `.section`, `.band`, `.kicker`, `.h-sec`, `.sec-lead` utility classes (every content section from Task 5 onward uses these).
- Produces: in `main.js`, a `reduce` boolean (from `matchMedia('(prefers-reduced-motion: reduce)')`) declared at the top of the IIFE, in scope for every function appended by later tasks.
- Produces: `#nav`, `#progress` DOM ids and the `.scrolled`/`.in` classes toggled by JS, consumed by CSS in this and later tasks.

- [ ] **Step 1: Create `index.html` with the page shell**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Samuel Habib, Software Engineer</title>
<meta name="description" content="Samuel Habib is a software engineer building dependable data systems for post-acute healthcare. Currently at ExaCare, previously Apple, Amazon, and AMD." />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="assets/css/style.css" />
</head>
<body>

  <header class="nav" id="nav">
    <div class="nav-inner">
      <a class="brand" href="#top">Samuel Habib</a>
      <nav class="nav-links" aria-label="Sections">
        <a href="#now">Now</a>
        <a href="#work">Work</a>
        <a href="#projects" data-optional>Projects</a>
        <a href="#contact">Contact</a>
      </nav>
    </div>
    <div class="nav-progress" id="progress"></div>
  </header>

  <main id="top">
  </main>

  <script src="assets/js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `assets/css/style.css` with tokens, reset, and nav**

```css
:root{
  --ink:#1d1d1f;--paper:#ffffff;--mist:#f5f5f7;--slate:#6e6e73;--line:#d2d2d7;
  --accent:#0071e3;--accent-deep:#0058c9;--night:#06070d;
  --signal:#6be89a;--glow-blue:#2b5cff;--glow-purple:#7b4bff;--glow-teal:#12b8c9;
  --font:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Inter",system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --wrap:1080px;--ease:cubic-bezier(.22,.61,.36,1);
}
*{box-sizing:border-box;}
html{scroll-behavior:smooth;scroll-padding-top:70px;-webkit-text-size-adjust:100%;}
body{margin:0;font-family:var(--font);color:var(--ink);background:var(--paper);line-height:1.5;
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-x:hidden;}
a{color:var(--accent);text-decoration:none;}
:focus-visible{outline:2px solid var(--accent);outline-offset:4px;border-radius:3px;}
.wrap{max-width:var(--wrap);margin:0 auto;padding:0 26px;}

.nav{position:fixed;top:0;left:0;right:0;z-index:200;border-bottom:1px solid transparent;
  transition:background .5s ease,box-shadow .5s ease,border-color .5s ease;}
.nav-inner{max-width:var(--wrap);margin:0 auto;padding:0 26px;height:60px;display:flex;align-items:center;justify-content:space-between;}
.brand{font-weight:600;letter-spacing:-0.01em;font-size:1.0625rem;color:#fff;transition:color .5s ease;}
.nav-links{display:flex;gap:30px;}
.nav-links a{font-size:0.9375rem;color:rgba(255,255,255,.72);transition:color .3s ease;}
.nav-links a:hover{color:#fff;}
.nav.scrolled{background:rgba(255,255,255,.72);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);border-bottom-color:var(--line);}
.nav.scrolled .brand{color:var(--ink);}
.nav.scrolled .nav-links a{color:var(--slate);}
.nav.scrolled .nav-links a:hover{color:var(--ink);}
.nav-progress{height:2px;background:var(--accent);width:0%;opacity:0;transition:width .1s linear;}
.nav.scrolled .nav-progress{opacity:1;}

.section{padding:clamp(84px,13vh,150px) 0;position:relative;}
.band{background:var(--mist);}
.kicker{font-size:0.9375rem;color:var(--accent);font-weight:600;letter-spacing:.02em;margin:0 0 18px;}
.h-sec{font-size:clamp(2.1rem,5.2vw,3.4rem);font-weight:700;letter-spacing:-0.028em;line-height:1.04;margin:0 0 10px;}
.sec-lead{color:var(--slate);font-size:clamp(1.1rem,2.2vw,1.3rem);margin:0 0 clamp(48px,7vw,72px);max-width:52ch;}

.reveal{opacity:0;transform:translateY(30px);filter:blur(10px);transition:opacity .9s var(--ease),transform .9s var(--ease),filter .9s ease;}
.reveal.in{opacity:1;transform:none;filter:none;}
.stagger>*{opacity:0;transform:translateY(26px);filter:blur(8px);transition:opacity .8s var(--ease),transform .8s var(--ease),filter .8s ease;}
.stagger.in>*{opacity:1;transform:none;filter:none;}
.stagger.in>*:nth-child(2){transition-delay:.09s;}
.stagger.in>*:nth-child(3){transition-delay:.18s;}
.stagger.in>*:nth-child(4){transition-delay:.27s;}
.stagger.in>*:nth-child(5){transition-delay:.36s;}

@media (max-width:680px){
  .nav-links{gap:18px;}
}
@media (max-width:430px){.nav-links a[data-optional]{display:none;}}

@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto;}
  .reveal,.stagger>*{opacity:1 !important;transform:none !important;filter:none !important;transition:none !important;}
}
```

- [ ] **Step 3: Create `assets/js/main.js` with the top-level IIFE, nav scroll behavior, and the reveal observer**

```js
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('DOMContentLoaded', function(){
    requestAnimationFrame(function(){ document.body.classList.add('is-ready'); });
  });

  var nav = document.getElementById('nav'), progress = document.getElementById('progress');
  function onScroll(){
    var y = window.scrollY || window.pageYOffset;
    nav.classList.toggle('scrolled', y > window.innerHeight * 0.5);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y/h)*100 : 0) + '%';
  }
  var ticking = false;
  window.addEventListener('scroll', function(){ if(!ticking){ requestAnimationFrame(function(){ onScroll(); ticking=false; }); ticking=true; } }, {passive:true});
  onScroll();

  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:0.16, rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.reveal, .stagger').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal, .stagger').forEach(function(el){ el.classList.add('in'); });
  }
})();
```

- [ ] **Step 4: Verify the JS is syntactically valid**

Run: `node --check assets/js/main.js`
Expected: no output (exit code 0).

- [ ] **Step 5: Verify the empty shell loads cleanly**

Run: `python3 -m http.server 8000` from the repository root, open `http://localhost:8000/`.
Expected: a blank white page with a fixed top nav reading "Samuel Habib" (white text, transparent background) and four nav links. Scroll the (currently empty, non-scrolling) page; open the browser console: zero errors. Stop the server when done.

- [ ] **Step 6: Commit**

```bash
git add index.html assets/css/style.css assets/js/main.js
git commit -m "Add new site shell: tokens, reset, nav, reveal observer"
```

---

### Task 3: Hero: terminal boot dissolving into the name reveal

This is the single most important beat on the page and the one piece never seen in motion during brainstorming (its two halves were validated separately). Build it, then manually check the transition before moving on.

**Files:**
- Modify: `index.html` (insert the hero `<section>` as the first child of `<main id="top">`)
- Modify: `assets/css/style.css` (append hero styles)
- Modify: `assets/js/main.js` (append the boot sequence, insert before the final `})();`)

**Interfaces:**
- Consumes: `reduce` (from Task 2).
- Produces: body class `boot-done`, toggled once the terminal finishes (or immediately if `reduce`). CSS in this task keys hero-content visibility off `.boot-done`; no later task depends on this class.
- Produces: `#ctaContact` id on the primary CTA anchor, consumed by Task 4 (magnetic button).

- [ ] **Step 1: Insert the hero section markup**

Modify `index.html`: insert the following as the first line inside `<main id="top">` (immediately after the `<main id="top">` opening tag):

```html
    <section class="hero">
      <div class="aurora"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span></div>
      <div class="grain"></div>
      <div class="wrap hero-content">
        <div class="hero-stack">
          <div class="boot" id="bootTerminal" aria-hidden="true">
            <div class="boot-bar"><span></span><span></span><span></span></div>
            <div class="boot-body" id="bootBody"></div>
          </div>
          <div class="hero-reveal">
            <p class="kick h-anim d1">Full Stack Software Engineer</p>
            <h1 class="h-anim d2">Samuel Habib</h1>
            <p class="hero-lead h-anim d3">I build dependable systems out of messy, real world data.</p>
            <p class="hero-meta h-anim d4">Currently at ExaCare, working on referrals and data infrastructure for post-acute care. Previously Apple, Amazon, and AMD.</p>
            <div class="hero-cta h-anim d5">
              <a class="btn" id="ctaContact" href="#contact">Get in touch</a>
              <a class="link-ghost" href="#now">See the work</a>
            </div>
          </div>
        </div>
      </div>
      <a class="scrollcue" href="#now" aria-label="Scroll to content"></a>
    </section>
```

- [ ] **Step 2: Append hero styles**

Append to the end of `assets/css/style.css`:

```css
.aurora{position:absolute;inset:-20% -10%;z-index:0;filter:blur(70px);opacity:.9;pointer-events:none;}
.blob{position:absolute;border-radius:50%;mix-blend-mode:screen;will-change:transform;}
.b1{width:60vmax;height:60vmax;left:-10vmax;top:-16vmax;background:radial-gradient(circle at 30% 30%,var(--glow-blue) 0%,rgba(43,92,255,0) 60%);animation:drift1 26s ease-in-out infinite;}
.b2{width:55vmax;height:55vmax;right:-14vmax;top:2vmax;background:radial-gradient(circle at 50% 50%,var(--glow-purple) 0%,rgba(123,75,255,0) 62%);animation:drift2 32s ease-in-out infinite;}
.b3{width:48vmax;height:48vmax;left:22vmax;bottom:-22vmax;background:radial-gradient(circle at 50% 50%,var(--glow-teal) 0%,rgba(18,184,201,0) 60%);animation:drift3 30s ease-in-out infinite;}
@keyframes drift1{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(6vmax,4vmax) scale(1.12);}}
@keyframes drift2{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(-5vmax,5vmax) scale(1.15);}}
@keyframes drift3{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(4vmax,-5vmax) scale(1.1);}}

.hero{position:relative;min-height:100svh;display:flex;align-items:center;background:var(--night);color:#f5f5f7;overflow:hidden;padding:120px 0 90px;}
.hero .grain{position:absolute;inset:0;z-index:1;opacity:.5;background:radial-gradient(120% 90% at 50% 0%,transparent 40%,rgba(0,0,0,.55) 100%);pointer-events:none;}
.hero-content{position:relative;z-index:3;}
.hero-stack{display:grid;}
.hero-stack>*{grid-area:1/1;}

.boot{background:#0a0a0c;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:22px 24px;max-width:420px;
  transition:opacity .6s ease,transform .6s ease;font-family:"SF Mono",ui-monospace,Menlo,Consolas,monospace;}
.boot-bar{display:flex;gap:6px;margin-bottom:14px;}
.boot-bar span{width:9px;height:9px;border-radius:50%;display:inline-block;}
.boot-bar span:nth-child(1){background:#ff5f57;} .boot-bar span:nth-child(2){background:#febc2e;} .boot-bar span:nth-child(3){background:#28c840;}
.boot-body{font-size:13px;line-height:1.9;color:#d7e0ea;min-height:96px;}
.boot-prompt{color:var(--signal);}
.boot-out{color:#9099a8;}
.boot-cursor{display:inline-block;width:7px;height:13px;background:var(--signal);vertical-align:middle;animation:bootBlink .9s step-end infinite;}
@keyframes bootBlink{50%{opacity:0;}}
.boot-done .boot{opacity:0;transform:scale(.94) translateY(-6px);pointer-events:none;}

.hero-reveal{opacity:1;}
.kick{font-size:0.9375rem;font-weight:500;letter-spacing:.04em;color:#9aa3b2;margin:0 0 26px;}
.hero h1{font-size:clamp(3.2rem,12vw,8rem);font-weight:700;letter-spacing:-0.04em;line-height:.96;margin:0;position:relative;display:inline-block;
  background:linear-gradient(180deg,#ffffff 0%,#c9cfdb 100%);-webkit-background-clip:text;background-clip:text;color:transparent;}
.hero-lead{font-size:clamp(1.4rem,3.6vw,2.35rem);font-weight:500;letter-spacing:-0.018em;line-height:1.2;margin:34px 0 0;max-width:19ch;color:#f0f2f6;}
.hero-meta{color:#9aa3b2;font-size:1.0625rem;line-height:1.55;margin:26px 0 0;max-width:52ch;}
.hero-cta{margin-top:42px;display:flex;gap:12px 26px;align-items:center;flex-wrap:wrap;}
.btn{display:inline-block;background:var(--accent);color:#fff;padding:13px 30px;border-radius:980px;font-size:1.0625rem;font-weight:500;box-shadow:0 8px 30px rgba(0,113,227,.35);transition:transform .12s cubic-bezier(.2,.8,.2,1),box-shadow .22s ease,background .22s ease;will-change:transform;}
.btn:hover{background:#1a84ff;box-shadow:0 12px 40px rgba(0,113,227,.45);}
.link-ghost{color:#cdd3de;font-size:1.0625rem;font-weight:500;transition:color .2s ease;}
.link-ghost:hover{color:#fff;}
.scrollcue{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);z-index:3;width:24px;height:38px;border:1.5px solid rgba(255,255,255,.4);border-radius:14px;}
.scrollcue::before{content:"";position:absolute;left:50%;top:8px;width:3px;height:7px;border-radius:2px;background:rgba(255,255,255,.75);transform:translateX(-50%);animation:cue 1.8s var(--ease) infinite;}
@keyframes cue{0%{opacity:0;transform:translate(-50%,0);}30%,70%{opacity:1;}100%{opacity:0;transform:translate(-50%,12px);}}

.h-anim{opacity:0;transform:translateY(26px);filter:blur(14px);}
.boot-done .h-anim{opacity:1;transform:none;filter:none;transition:opacity 1s var(--ease),transform 1s var(--ease),filter 1s ease;}
.boot-done .h-anim.d1{transition-delay:.05s;}
.boot-done .h-anim.d2{transition-delay:.16s;}
.boot-done .h-anim.d3{transition-delay:.30s;}
.boot-done .h-anim.d4{transition-delay:.44s;}
.boot-done .h-anim.d5{transition-delay:.58s;}

@media (max-width:680px){
  .hero-lead{max-width:none;}
  .aurora{filter:blur(50px);}
  .boot{max-width:none;}
}
@media (prefers-reduced-motion:reduce){
  .boot{display:none;}
  .h-anim{opacity:1 !important;transform:none !important;filter:none !important;}
  .blob{animation:none !important;}
  .scrollcue::before{animation:none !important;}
  .btn{transition:none;}
}
```

- [ ] **Step 3: Append the boot-sequence JS**

Modify `assets/js/main.js`: insert the following function definition and its call immediately before the final `})();` line (i.e. directly after the `IntersectionObserver` block added in Task 2):

```js
  function runBootSequence(){
    var body = document.getElementById('bootBody');
    if(reduce || !body){ document.body.classList.add('boot-done'); return; }
    var lines = [
      {p:'$ whoami', o:'samuel-habib, full stack software engineer @ exacare'},
      {p:'$ cat personality.md', o:'builds fast, pairs with AI agents, obsesses over clean systems'},
      {p:'$ status --watch', o:'online, probably shipping something right now'}
    ];
    var li = 0;
    function nextLine(){
      if(li >= lines.length){
        setTimeout(function(){ document.body.classList.add('boot-done'); }, 500);
        return;
      }
      var line = lines[li], full = line.p, ci = 0;
      var promptSpan = document.createElement('span');
      promptSpan.className = 'boot-prompt';
      body.appendChild(promptSpan);
      body.appendChild(document.createElement('br'));
      function typeChar(){
        if(ci <= full.length){ promptSpan.textContent = full.slice(0, ci); ci++; setTimeout(typeChar, 26); }
        else {
          var outSpan = document.createElement('span');
          outSpan.className = 'boot-out';
          outSpan.textContent = line.o;
          body.appendChild(outSpan);
          body.appendChild(document.createElement('br'));
          li++;
          setTimeout(nextLine, 340);
        }
      }
      typeChar();
    }
    nextLine();
  }
  runBootSequence();
```

- [ ] **Step 4: Verify the JS is syntactically valid**

Run: `node --check assets/js/main.js`
Expected: no output.

- [ ] **Step 5: Manually verify the boot-to-reveal transition in the browser**

Run: `python3 -m http.server 8000` from the repository root, open `http://localhost:8000/` in a fresh tab (hard refresh to avoid cache).
Expected, in order: (1) a small dark terminal window appears immediately with three colored dots and types out three lines over roughly 3 seconds; (2) about half a second after the last line finishes, the terminal fades and shrinks slightly while, in the same spot, the kicker/name/lead/meta/buttons fade up from blur in a staggered sequence; (3) the aurora blobs drift slowly behind everything the whole time; (4) no layout jump between the terminal and the text (they occupy the same visual area via the CSS grid overlap). Open the browser's Rendering panel or OS accessibility settings to simulate `prefers-reduced-motion: reduce` (or run `open -a "System Settings"` on macOS and enable Reduce Motion, then reload): the terminal should never appear and the hero text should just be visible immediately.
If the transition feels off (too fast, too slow, jumpy), adjust the `setTimeout` delays and `transition-delay` values in this task's CSS/JS before proceeding; do not move on to Task 4 with an unconvincing hero.

- [ ] **Step 6: Commit**

```bash
git add index.html assets/css/style.css assets/js/main.js
git commit -m "Add hero: terminal boot dissolving into the name reveal"
```

---

### Task 4: Magnetic primary CTA button

**Files:**
- Modify: `assets/js/main.js` (append, insert before the final `})();`)

**Interfaces:**
- Consumes: `#ctaContact` (from Task 3), `reduce` (from Task 2).
- Produces: nothing consumed by later tasks (self-contained interaction).

- [ ] **Step 1: Append the magnetic-button JS**

Modify `assets/js/main.js`: insert immediately before the final `})();`:

```js
  function initMagneticButton(){
    var btn = document.getElementById('ctaContact');
    if(!btn || reduce) return;
    var radius = 90;
    document.addEventListener('mousemove', function(e){
      var r = btn.getBoundingClientRect();
      var mx = e.clientX - (r.left + r.width/2), my = e.clientY - (r.top + r.height/2);
      var dist = Math.hypot(mx, my);
      if(dist < radius){
        btn.style.transform = 'translate(' + (mx*0.28) + 'px,' + (my*0.28) + 'px)';
      } else {
        btn.style.transform = 'translate(0,0)';
      }
    });
  }
  initMagneticButton();
```

- [ ] **Step 2: Verify the JS is syntactically valid**

Run: `node --check assets/js/main.js`
Expected: no output.

- [ ] **Step 3: Manually verify in the browser**

Reload `http://localhost:8000/`. Move the cursor near (within roughly 90px of) the "Get in touch" button: it should pull slightly toward the cursor. Move away or move the cursor far from it: it should snap back to its resting position. Confirm the "See the work" ghost link is unaffected (only the primary button is magnetic).

- [ ] **Step 4: Commit**

```bash
git add assets/js/main.js
git commit -m "Add magnetic pull to the primary hero CTA"
```

---

### Task 5: "Now" section (ExaCare), reusing the existing data visualizations

Ports the two canvas visualizations from the reference file (chaos-into-order, and the referral hub) with updated, verified ExaCare copy, plus the "across the team" list.

**Files:**
- Modify: `index.html` (append section after the hero, inside `<main id="top">`)
- Modify: `assets/css/style.css` (append)
- Modify: `assets/js/main.js` (append, insert before the final `})();`)

**Interfaces:**
- Consumes: `reduce` (from Task 2).
- Produces: `#now` section id, used as a nav anchor target (already linked from Task 2's nav) and Task 13's responsive/reduced-motion audit.

- [ ] **Step 1: Insert the "Now" section markup**

Modify `index.html`: insert immediately after the hero `</section>` closing tag (still inside `<main id="top">`):

```html
    <section class="section band" id="now">
      <div class="wrap">
        <div class="reveal">
          <p class="kicker">Now</p>
          <h2 class="h-sec">What I'm building at ExaCare</h2>
          <p class="sec-lead">A referrals platform and the data foundation underneath it, for post-acute care.</p>
        </div>

        <div class="flag reveal">
          <div class="flag-grid">
            <div class="flag-copy">
              <h3>Provider Directory</h3>
              <p class="flag-role">Researched and designed from scratch</p>
              <p>A pipeline that ingests fragmented public healthcare data, reconciles it, and repairs itself as sources drift, giving our post-acute products a dependable foundation to build on. I mapped an ambiguous source landscape no one had tackled, then designed the system end to end.</p>
            </div>
            <div class="flag-media">
              <canvas class="viz" id="vizHeal" aria-hidden="true"></canvas>
              <p class="viz-cap">Messy sources resolving into structure. Scroll to watch it heal.</p>
            </div>
          </div>
        </div>

        <div class="flag reveal">
          <div class="flag-grid flag-grid--rev">
            <div class="flag-copy">
              <h3>Referral Outbound Center</h3>
              <p class="flag-role">Owned end to end</p>
              <p>The system that moves referrals between care organizations. I took it from proof of concept through launch and ongoing feature work, making the architectural calls at each stage and supporting it in production.</p>
            </div>
            <div class="flag-media">
              <canvas class="viz" id="vizRoute" aria-hidden="true"></canvas>
              <p class="viz-cap">Referrals routed outbound from a central hub to partner organizations.</p>
            </div>
          </div>
        </div>

        <div class="team reveal">
          <h4>Across the team</h4>
          <ul class="stagger">
            <li>Cut a core API endpoint's latency by 42% and its response payload by 70%, and eliminated full-table database scans behind alarms firing about 144 times a day.</li>
            <li>Built an internal on-call report tool adopted team-wide, cutting weekly report prep time in half.</li>
            <li>Became a technical reference for other teams, including Source Classification, helping shape sound technical tradeoffs.</li>
            <li>Introduced AI-assisted engineering workflows and presented them company-wide in Town Hall and Eng Week talks.</li>
          </ul>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Append "Now" section styles**

Append to `assets/css/style.css`:

```css
.flag{border-top:1px solid var(--line);padding:clamp(44px,6vw,64px) 0;}
.flag:first-of-type{border-top:none;padding-top:0;}
.flag-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(28px,5vw,64px);align-items:center;}
.flag-grid .flag-copy{order:1;} .flag-grid .flag-media{order:2;}
.flag-grid--rev .flag-copy{order:2;} .flag-grid--rev .flag-media{order:1;}
.flag h3{font-size:clamp(1.7rem,4.2vw,2.6rem);font-weight:700;letter-spacing:-0.022em;line-height:1.08;margin:0;}
.flag-role{color:var(--accent);font-weight:500;font-size:0.9375rem;margin:14px 0 0;}
.flag p{font-size:1.1875rem;line-height:1.56;margin:20px 0 0;color:var(--ink);}
.viz{width:100%;aspect-ratio:4/3;display:block;border-radius:18px;background:#0b0d16;box-shadow:0 20px 60px rgba(10,12,30,.18);}
.viz-cap{color:var(--slate);font-size:.8125rem;margin:12px 2px 0;text-align:center;}

.team{border-top:1px solid var(--line);margin-top:clamp(44px,6vw,64px);padding-top:clamp(44px,6vw,60px);}
.team h4{font-size:1.0625rem;font-weight:600;margin:0 0 24px;}
.team ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:20px 40px;max-width:900px;}
.team li{position:relative;padding-left:24px;color:var(--slate);font-size:1.0625rem;line-height:1.5;}
.team li::before{content:"";position:absolute;left:0;top:.58em;width:8px;height:8px;background:var(--accent);border-radius:2.5px;}

@media (max-width:820px){
  .flag-grid,.flag-grid--rev{grid-template-columns:1fr;}
  .flag-grid .flag-copy,.flag-grid--rev .flag-copy{order:1;}
  .flag-grid .flag-media,.flag-grid--rev .flag-media{order:2;}
  .team ul{grid-template-columns:1fr;}
}
```

- [ ] **Step 3: Append the two canvas visualizations' JS**

Modify `assets/js/main.js`: insert immediately before the final `})();`:

```js
  function initHealViz(){
    var canvas = document.getElementById('vizHeal'); if(!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d'), COLS=9, ROWS=7, N=COLS*ROWS, pts=[], W=0,H=0, dpr=Math.min(window.devicePixelRatio||1,2);
    function seed(){ pts=[]; for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++)pts.push({ox:Math.random(),oy:Math.random(),gx:(c+0.5)/COLS,gy:(r+0.5)/ROWS,delay:Math.random()*0.35}); }
    function resize(){ var rc=canvas.getBoundingClientRect(); W=rc.width;H=rc.height; canvas.width=Math.round(W*dpr); canvas.height=Math.round(H*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); }
    function ease(t){ return t<0?0:t>1?1:1-Math.pow(1-t,3); }
    function line(a,b){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
    function draw(p){
      ctx.clearRect(0,0,W,H);
      var pad=Math.min(W,H)*0.1, iw=W-pad*2, ih=H-pad*2, pos=[];
      for(var i=0;i<N;i++){ var pt=pts[i]; var l=ease((p-pt.delay)/(1-pt.delay)); pos.push({x:pad+(pt.ox+(pt.gx-pt.ox)*l)*iw,y:pad+(pt.oy+(pt.gy-pt.oy)*l)*ih,t:l}); }
      if(p>0.35){ ctx.strokeStyle='rgba(0,150,255,'+(0.22*ease((p-0.35)/0.65))+')'; ctx.lineWidth=1;
        for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){ var idx=r*COLS+c; if(c<COLS-1)line(pos[idx],pos[idx+1]); if(r<ROWS-1)line(pos[idx],pos[idx+COLS]); } }
      for(var j=0;j<N;j++){ var q=pos[j]; var g=Math.round(120+q.t*80),b=Math.round(200+q.t*55); ctx.fillStyle='rgba(60,'+g+','+b+','+(0.5+q.t*0.5)+')'; ctx.beginPath(); ctx.arc(q.x,q.y,2.2+q.t*1.4,0,Math.PI*2); ctx.fill(); }
    }
    seed(); resize();
    if(reduce){ draw(1); return; }
    var cur=0,tgt=0,run=false;
    function prog(){ var rc=canvas.getBoundingClientRect(),vh=window.innerHeight; return Math.max(0,Math.min(1,(1-(rc.top+rc.height*0.35)/vh)*1.15)); }
    function loop(){ cur+=(tgt-cur)*0.08; draw(cur); if(Math.abs(tgt-cur)>0.002)requestAnimationFrame(loop); else {draw(tgt);run=false;} }
    function kick(){ tgt=prog(); if(!run){run=true;requestAnimationFrame(loop);} }
    window.addEventListener('scroll',kick,{passive:true}); window.addEventListener('resize',function(){resize();kick();});
    draw(0); kick();
  }
  initHealViz();

  function initRouteViz(){
    var canvas = document.getElementById('vizRoute'); if(!canvas || !canvas.getContext) return;
    var ctx=canvas.getContext('2d'), W=0,H=0, dpr=Math.min(window.devicePixelRatio||1,2);
    var hub={x:0,y:0}, nodes=[], packets=[], visible=false, raf=null, last=0, spawnT=0;
    function resize(){ var rc=canvas.getBoundingClientRect(); W=rc.width;H=rc.height; canvas.width=Math.round(W*dpr); canvas.height=Math.round(H*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
      hub.x=W*0.5; hub.y=H*0.5; nodes=[]; var count=6, R=Math.min(W,H)*0.36;
      for(var i=0;i<count;i++){ var a=-Math.PI/2 + i*(Math.PI*2/count); nodes.push({x:hub.x+Math.cos(a)*R,y:hub.y+Math.sin(a)*R,pulse:0}); } }
    function spawn(){ var n=Math.floor(Math.random()*nodes.length); packets.push({to:n,t:0,sp:0.6+Math.random()*0.5}); }
    function frame(ts){
      if(!last)last=ts; var dt=Math.min((ts-last)/1000,0.05); last=ts;
      ctx.clearRect(0,0,W,H);
      ctx.strokeStyle='rgba(120,160,220,0.18)'; ctx.lineWidth=1;
      nodes.forEach(function(n){ ctx.beginPath(); ctx.moveTo(hub.x,hub.y); ctx.lineTo(n.x,n.y); ctx.stroke(); });
      nodes.forEach(function(n){ n.pulse=Math.max(0,n.pulse-dt*1.6);
        var rad=6+n.pulse*7; ctx.fillStyle='rgba(90,170,255,'+(0.5+n.pulse*0.5)+')'; ctx.beginPath(); ctx.arc(n.x,n.y,rad,0,Math.PI*2); ctx.fill(); });
      spawnT-=dt; if(spawnT<=0){ spawn(); spawnT=0.55+Math.random()*0.4; }
      for(var i=packets.length-1;i>=0;i--){ var p=packets[i]; p.t+=dt*p.sp; var n=nodes[p.to];
        var x=hub.x+(n.x-hub.x)*p.t, y=hub.y+(n.y-hub.y)*p.t;
        ctx.fillStyle='#0071e3'; ctx.beginPath(); ctx.arc(x,y,3.2,0,Math.PI*2); ctx.fill();
        if(p.t>=1){ n.pulse=1; packets.splice(i,1); } }
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(hub.x,hub.y,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#0071e3'; ctx.beginPath(); ctx.arc(hub.x,hub.y,6,0,Math.PI*2); ctx.fill();
      if(visible) raf=requestAnimationFrame(frame);
    }
    function drawStatic(){ ctx.clearRect(0,0,W,H); ctx.strokeStyle='rgba(120,160,220,0.2)'; ctx.lineWidth=1;
      nodes.forEach(function(n){ ctx.beginPath(); ctx.moveTo(hub.x,hub.y); ctx.lineTo(n.x,n.y); ctx.stroke(); });
      nodes.forEach(function(n){ ctx.fillStyle='rgba(90,170,255,0.8)'; ctx.beginPath(); ctx.arc(n.x,n.y,6,0,Math.PI*2); ctx.fill(); });
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(hub.x,hub.y,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#0071e3'; ctx.beginPath(); ctx.arc(hub.x,hub.y,6,0,Math.PI*2); ctx.fill(); }
    resize(); window.addEventListener('resize',function(){ resize(); if(reduce||!visible) drawStatic(); });
    if(reduce){ drawStatic(); return; }
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ es.forEach(function(e){ visible=e.isIntersecting;
        if(visible){ last=0; raf=requestAnimationFrame(frame); } else if(raf){ cancelAnimationFrame(raf); } }); },{threshold:0.2}).observe(canvas);
    } else { visible=true; raf=requestAnimationFrame(frame); }
  }
  initRouteViz();
```

- [ ] **Step 4: Verify the JS is syntactically valid**

Run: `node --check assets/js/main.js`
Expected: no output.

- [ ] **Step 5: Manually verify in the browser**

Reload `http://localhost:8000/` and scroll to the "Now" section. Expected: the section heading and lead fade up on scroll; scrolling through the Provider Directory viz shows scattered dots resolving into a 9x7 grid with connecting lines as the section passes through the viewport; the Referral Outbound Center viz shows a white/blue hub with six nodes and small packets continuously flowing outward and pulsing the nodes on arrival, only while that canvas is in view (scroll it out of view and back with the console open; confirm no errors and that it resumes). The four "across the team" bullets fade in staggered.

- [ ] **Step 6: Commit**

```bash
git add index.html assets/css/style.css assets/js/main.js
git commit -m "Add Now section with ported data visualizations"
```

---

### Task 6: Landmark journey on a real map of North America

Adapts the validated map mockup (real lat/long placement for Toronto, Austin, New York; low-poly coastline; comet-trail signal; landmark icons that light up).

**Files:**
- Modify: `index.html` (append section after "Now", inside `<main id="top">`)
- Modify: `assets/css/style.css` (append)
- Modify: `assets/js/main.js` (append, insert before the final `})();`)

**Interfaces:**
- Consumes: `reduce` (from Task 2).
- Produces: `#journey` section id.

- [ ] **Step 1: Insert the journey section markup**

Modify `index.html`: insert immediately after the "Now" section's `</section>`:

```html
    <section class="section" id="journey">
      <div class="wrap">
        <div class="reveal">
          <p class="kicker">The path</p>
          <h2 class="h-sec">Toronto, Austin, New York</h2>
          <p class="sec-lead">Three cities, one throughline: building systems that hold up under real world mess.</p>
        </div>
        <div class="map-stage reveal">
          <svg id="mapSvg" viewBox="-14 -14 368 228" preserveAspectRatio="xMidYMid meet">
            <path class="map-land" d="
              M11.5,38.7 L5.8,77.4 L13.3,111.0 L46.1,143.9 L109.5,200 L167.1,200 L161.4,180.6
              L204.6,167.7 L230.5,161.3 L258.2,189.0 L251.3,159.4 L265.1,136.8 L285.3,127.7
              L282.4,114.2 L293.9,92.3 L316.9,85.8 L328.5,67.7 L340,64.5 L316.9,45.2 L311.2,51.6
              L282.4,61.3 L262.2,72.3 L250.7,61.3 L234.6,54.8 L201.7,45.2 L161.4,32.3 L86.4,32.3
              L28.8,38.7 Z"/>

            <path id="mapPath" d="M262.2,72.3 Q210,102 157.1,159.5 Q232,112 293.9,92.3" fill="none" stroke="#2b5cff" stroke-width="1.4" opacity="0.6" stroke-dasharray="2 3"/>
            <circle id="mapDot" cx="262.2" cy="72.3" r="4" fill="#6be89a"/>
            <circle id="mapTrail0" r="3" fill="#6be89a" opacity="0.35"/>
            <circle id="mapTrail1" r="2.2" fill="#6be89a" opacity="0.2"/>
            <circle id="mapTrail2" r="1.5" fill="#6be89a" opacity="0.1"/>

            <g transform="translate(262.2,72.3)">
              <circle class="map-pin-ring" id="mapTorRing" r="3"/>
              <g class="map-landmark" id="mapTor">
                <line x1="0" y1="0" x2="0" y2="-26" stroke="currentColor" stroke-width="1.6"/>
                <ellipse cx="0" cy="-19" rx="5.5" ry="2.4" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <ellipse cx="0" cy="-13" rx="3.2" ry="1.4" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="0" y1="-26" x2="0" y2="-33" stroke="currentColor" stroke-width="1.2"/>
                <circle cx="0" cy="-33" r="1" fill="currentColor"/>
              </g>
              <text x="6" y="-8" class="map-city" id="mapTorCity">TORONTO</text>
              <text x="6" y="1" class="map-chapter" id="mapTorCh">TMU, AMD, Amazon</text>
              <text x="6" y="9" class="map-years" id="mapTorYr">2019 &#8211; 2023</text>
            </g>

            <g transform="translate(157.1,159.5)">
              <circle class="map-pin-ring" id="mapAusRing" r="3"/>
              <g class="map-landmark" id="mapAus">
                <path d="M -9 -11 L 0 -18 L 9 -11 Z" fill="none" stroke="currentColor" stroke-width="1.1"/>
                <rect x="-9" y="-11" width="18" height="11" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <line x1="-6" y1="-11" x2="-6" y2="0" stroke="currentColor" stroke-width="0.9"/>
                <line x1="0" y1="-11" x2="0" y2="0" stroke="currentColor" stroke-width="0.9"/>
                <line x1="6" y1="-11" x2="6" y2="0" stroke="currentColor" stroke-width="0.9"/>
                <path d="M -9 -11 A 9 10 0 0 1 9 -11" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <line x1="0" y1="-21" x2="0" y2="-26" stroke="currentColor" stroke-width="1.1"/>
                <circle cx="0" cy="-27" r="1" fill="currentColor"/>
              </g>
              <text x="-15" y="18" class="map-city" id="mapAusCity">AUSTIN</text>
              <text x="-8" y="28" class="map-chapter" id="mapAusCh">Apple</text>
              <text x="-9" y="37" class="map-years" id="mapAusYr">2023 &#8211; 2026</text>
            </g>

            <g transform="translate(293.9,92.3)">
              <circle class="map-pin-ring" id="mapNycRing" r="3"/>
              <g class="map-landmark" id="mapNyc">
                <rect x="-5.5" y="-6" width="11" height="6" fill="none" stroke="currentColor" stroke-width="1.1"/>
                <path d="M -3.4 -6 C -4.4 -14 -3.2 -21 0 -25.5 C 3.2 -21 4.4 -14 3.4 -6 Z" fill="none" stroke="currentColor" stroke-width="1.1"/>
                <circle cx="0" cy="-27.5" r="2.1" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="-2.4" y1="-29.2" x2="-3.3" y2="-31.6" stroke="currentColor" stroke-width="0.7"/>
                <line x1="-1.1" y1="-29.9" x2="-1.5" y2="-32.4" stroke="currentColor" stroke-width="0.7"/>
                <line x1="0" y1="-30.1" x2="0" y2="-32.6" stroke="currentColor" stroke-width="0.7"/>
                <line x1="1.1" y1="-29.9" x2="1.5" y2="-32.4" stroke="currentColor" stroke-width="0.7"/>
                <line x1="2.4" y1="-29.2" x2="3.3" y2="-31.6" stroke="currentColor" stroke-width="0.7"/>
                <line x1="-2" y1="-26" x2="-5" y2="-22" stroke="currentColor" stroke-width="1"/>
                <line x1="2.4" y1="-26.5" x2="5.8" y2="-31.5" stroke="currentColor" stroke-width="1.1"/>
                <circle cx="6.1" cy="-32" r="1.3" fill="currentColor"/>
              </g>
              <text x="9" y="-8" class="map-city" id="mapNycCity">NEW YORK</text>
              <text x="9" y="1" class="map-chapter" id="mapNycCh">ExaCare</text>
              <text x="9" y="9" class="map-years" id="mapNycYr">2026 &#8211;</text>
            </g>
          </svg>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Append map styles**

Append to `assets/css/style.css`:

```css
.map-stage{position:relative;background:var(--night);border-radius:20px;padding:clamp(24px,5vw,48px);overflow:hidden;}
.map-stage::before{content:"";position:absolute;inset:0;background:radial-gradient(50% 60% at 55% 45%,rgba(43,92,255,.13),transparent 70%);pointer-events:none;}
#mapSvg{position:relative;z-index:1;width:100%;height:auto;display:block;max-width:680px;margin:0 auto;}
.map-land{fill:#0e1626;stroke:#2a3a5c;stroke-width:1.1;stroke-linejoin:round;}
.map-landmark{color:#8fbcff;opacity:.16;transform:scale(.5);transform-box:fill-box;transform-origin:50% 100%;
  transition:opacity .6s ease,transform .6s cubic-bezier(.2,.8,.2,1),filter .6s ease;filter:drop-shadow(0 0 0 rgba(107,190,255,0));}
.map-landmark.lit{opacity:1;transform:scale(1);filter:drop-shadow(0 0 8px rgba(107,190,255,.6));}
.map-city{fill:#d7e0ea;font-size:9.5px;font-weight:600;letter-spacing:.02em;opacity:.4;transition:opacity .5s ease;}
.map-city.lit{opacity:1;}
.map-chapter{fill:#7a8394;font-size:7px;opacity:0;transition:opacity .5s ease .1s;}
.map-chapter.lit{opacity:1;}
.map-years{fill:#4a5568;font-size:6.5px;font-variant-numeric:tabular-nums;opacity:0;transition:opacity .5s ease .18s;}
.map-years.lit{opacity:1;}
.map-pin-ring{fill:none;stroke:#3d8bff;stroke-width:1;opacity:0;}
.map-pin-ring.lit{opacity:0.55;animation:mapPing 2.4s ease-out infinite;}
@keyframes mapPing{0%{r:3;opacity:.6;}100%{r:13;opacity:0;}}

@media (prefers-reduced-motion:reduce){
  .map-pin-ring.lit{animation:none;}
}
```

- [ ] **Step 3: Append the map journey JS**

Modify `assets/js/main.js`: insert immediately before the final `})();`:

```js
  function initMapJourney(){
    var path = document.getElementById('mapPath');
    var dot = document.getElementById('mapDot');
    if(!path || !dot) return;
    var trails = [document.getElementById('mapTrail0'), document.getElementById('mapTrail1'), document.getElementById('mapTrail2')];
    var stops = [
      {x:262.2,y:72.3, els:['mapTor','mapTorCity','mapTorCh','mapTorYr'], ring:'mapTorRing'},
      {x:157.1,y:159.5, els:['mapAus','mapAusCity','mapAusCh','mapAusYr'], ring:'mapAusRing'},
      {x:293.9,y:92.3, els:['mapNyc','mapNycCity','mapNycCh','mapNycYr'], ring:'mapNycRing'}
    ];
    var len = path.getTotalLength(), samples = 500;
    stops.forEach(function(s){
      var bestD=Infinity, bestL=0;
      for(var i=0;i<=samples;i++){
        var l=len*i/samples, pt=path.getPointAtLength(l), d=Math.hypot(pt.x-s.x,pt.y-s.y);
        if(d<bestD){bestD=d;bestL=l;}
      }
      s.frac = bestL/len; s.lit = false;
    });
    function lightAll(){
      stops.forEach(function(s){
        s.lit = true;
        s.els.forEach(function(id){ document.getElementById(id).classList.add('lit'); });
        document.getElementById(s.ring).classList.add('lit');
      });
      var end = path.getPointAtLength(len);
      dot.setAttribute('cx', end.x); dot.setAttribute('cy', end.y);
    }
    if(reduce){ lightAll(); return; }
    var visible = false, raf = null, start = null, dur = 4600, trailGap = 0.018;
    function resetLights(){
      stops.forEach(function(s){ s.lit=false; s.els.forEach(function(id){ document.getElementById(id).classList.remove('lit'); }); document.getElementById(s.ring).classList.remove('lit'); });
    }
    function frame(ts){
      if(!start) start = ts;
      var raw = (ts-start)/dur, p = raw % 1;
      if(raw>=1 && p<0.015){ resetLights(); }
      var pt = path.getPointAtLength(len*p);
      dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
      trails.forEach(function(t,i){ var tp=Math.max(0,p-trailGap*(i+1)), pos=path.getPointAtLength(len*tp); t.setAttribute('cx',pos.x); t.setAttribute('cy',pos.y); });
      stops.forEach(function(s){
        if(!s.lit && p >= s.frac-0.004){
          s.lit=true;
          s.els.forEach(function(id){ document.getElementById(id).classList.add('lit'); });
          document.getElementById(s.ring).classList.add('lit');
        }
      });
      if(visible) raf = requestAnimationFrame(frame);
    }
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ es.forEach(function(e){ visible = e.isIntersecting;
        if(visible){ start=null; raf=requestAnimationFrame(frame); } else if(raf){ cancelAnimationFrame(raf); } }); }, {threshold:0.2}).observe(path.closest('svg'));
    } else { visible = true; raf = requestAnimationFrame(frame); }
  }
  initMapJourney();
```

- [ ] **Step 4: Verify the JS is syntactically valid**

Run: `node --check assets/js/main.js`
Expected: no output.

- [ ] **Step 5: Manually verify in the browser**

Reload and scroll to the journey section. Expected: a dark map of North America with a thin blue dashed path; scrolling it into view starts a glowing green dot with a short trailing tail traveling from Toronto (which sits right at the Great Lakes notch) down to Austin (inland, no coastline nearby) and up to New York (on the coast), with each city's landmark icon, name, chapter, and years lighting up with a small ping ring exactly as the dot arrives; it loops continuously while the section is in view. Scroll it out of view and confirm (via the Performance tab or just visually) it stops animating, then scroll back and confirm it resumes. Enable reduced motion and reload: all three cities should be lit immediately with no animation.

- [ ] **Step 6: Commit**

```bash
git add index.html assets/css/style.css assets/js/main.js
git commit -m "Add real-geography map journey, replacing the plain timeline"
```

---

### Task 7: Experience section, including a new ExaCare row and company badges

**Files:**
- Modify: `index.html` (append section after journey, inside `<main id="top">`)
- Modify: `assets/css/style.css` (append)

**Interfaces:** None beyond CSS/markup (no new JS; reveal/stagger observer from Task 2 covers this section automatically since it only needs `.reveal` on the section-intro block; individual rows animate via CSS only, see below).

- [ ] **Step 1: Insert the Experience section markup**

Modify `index.html`: insert immediately after the journey section's `</section>`:

```html
    <section class="section band" id="work">
      <div class="wrap">
        <div class="reveal">
          <p class="kicker">Experience</p>
          <h2 class="h-sec">A progression through systems work</h2>
          <p class="sec-lead">Increasingly high-impact backend and data systems across five engineering orgs.</p>
        </div>
        <div class="xp">
          <div class="xp-row reveal">
            <div class="xp-when">Feb 2026 &#8211; Present</div>
            <div>
              <h3 class="xp-co">ExaCare <span class="badge">ExaCare</span></h3>
              <p class="xp-role">Full Stack Software Engineer &middot; Manhattan, NY</p>
              <div class="xp-notes">
                <p>Owned the Referral Outbound Center end to end, from proof of concept through launch in about a month, piloting 25+ sender facilities at a 100% retention rate.</p>
                <p>Self-scoped and built the Provider Directory, an ingestion pipeline over public CMS and NPI healthcare data spanning 40,000+ rows across six rosters, with weekly self-healing reconciliation.</p>
                <p>Cut a core API endpoint's latency by 42% and its response payload by 70%, and built an internal on-call tool that cut weekly report prep time in half.</p>
              </div>
            </div>
          </div>
          <div class="xp-row reveal">
            <div class="xp-when">2023 &#8211; 2026</div>
            <div>
              <h3 class="xp-co">Apple <span class="badge">Apple</span></h3>
              <p class="xp-role">Software Development Engineer &middot; Austin, TX</p>
              <div class="xp-notes">
                <p>Built an AI receipt-parsing service for Apple Travel, pairing LLM extraction with rule-based validation and schema normalization to process third-party receipts reliably.</p>
                <p>Owned receipt integrations and BART, a structured budget reconciliation system that replaced spreadsheets, cutting manual processing about 80% and errors about 95%.</p>
                <p>Designed scalable REST APIs in Java, Spring Boot, and WebFlux, with OIDC and RBAC auth and tuned Oracle SQL and Solr search for faster, auditable lookups.</p>
              </div>
            </div>
          </div>
          <div class="xp-row reveal">
            <div class="xp-when">Summer 2024</div>
            <div>
              <h3 class="xp-co">Amazon <span class="badge">Amazon</span></h3>
              <p class="xp-role">Software Development Engineer, Intern &middot; Toronto, ON</p>
              <div class="xp-notes">
                <p>Built an internal visualization tool for FBA sellers on an S3, SQS, and Lambda pipeline handling 70,000+ requests an hour across regions.</p>
              </div>
            </div>
          </div>
          <div class="xp-row reveal">
            <div class="xp-when">Summer 2023</div>
            <div>
              <h3 class="xp-co">Amazon <span class="badge">Amazon</span></h3>
              <p class="xp-role">Software Development Engineer, Intern &middot; Toronto, ON</p>
              <div class="xp-notes">
                <p>Designed an end-to-end AWS system using SQS, DynamoDB, DAX, and SNS, processing 2B+ records an hour, with DAX caching strategies that cut costs about 45%.</p>
              </div>
            </div>
          </div>
          <div class="xp-row reveal">
            <div class="xp-when">2022 &#8211; 2023</div>
            <div>
              <h3 class="xp-co">AMD <span class="badge">AMD</span></h3>
              <p class="xp-role">Software Engineer Full Stack Intern &middot; Toronto, ON</p>
              <div class="xp-notes">
                <p>Built a self-healing, auto-scaling backend that ran 1,000+ regression tests in parallel and automated the CI/CD logging pipeline.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Append Experience section styles**

Append to `assets/css/style.css`:

```css
.xp{border-top:1px solid var(--line);}
.xp-row{display:grid;grid-template-columns:160px 1fr;gap:36px;padding:clamp(34px,5vw,56px) 0;border-bottom:1px solid var(--line);}
.xp-when{color:var(--slate);font-size:1rem;font-variant-numeric:tabular-nums;padding-top:8px;}
.xp-co{font-size:clamp(1.6rem,3.6vw,2.3rem);font-weight:700;letter-spacing:-0.02em;margin:0;line-height:1.06;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.xp-role{color:var(--slate);font-size:1rem;margin:9px 0 0;}
.xp-notes{margin:22px 0 0;display:grid;gap:15px;}
.xp-notes p{margin:0;font-size:1.0625rem;line-height:1.52;max-width:64ch;}
.badge{font-size:0.6875rem;font-weight:600;letter-spacing:.02em;color:var(--slate);background:var(--mist);border:1px solid var(--line);border-radius:980px;padding:4px 12px;vertical-align:middle;}

@media (max-width:680px){
  .xp-row{grid-template-columns:1fr;gap:12px;}
  .xp-when{padding-top:0;}
}
```

- [ ] **Step 3: Manually verify in the browser**

Reload and scroll to the Experience section. Expected: five rows in order (ExaCare, Apple, Amazon, Amazon, AMD), each with a small rounded badge next to the company name, each fading up on scroll (staggered by natural scroll position since each row has its own `.reveal` class). Confirm no `—` character appears anywhere in this section by eye.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "Add Experience section with ExaCare entry and company badges"
```

---

### Task 8: Stats section

**Files:**
- Modify: `index.html` (append section after Experience)
- Modify: `assets/css/style.css` (append)
- Modify: `assets/js/main.js` (append, insert before the final `})();`)

**Interfaces:**
- Consumes: `reduce` (from Task 2).
- Produces: nothing consumed later.

- [ ] **Step 1: Insert the Stats section markup**

Modify `index.html`: insert immediately after the Experience section's `</section>`:

```html
    <section class="stats" id="stats">
      <div class="wrap stats-inner">
        <div class="reveal">
          <p class="kicker">By the numbers</p>
          <h2 class="h-sec">Measured impact</h2>
        </div>
        <div class="stat-grid" id="statGrid">
          <div class="stat">
            <span class="num" data-to="80" data-prefix="~" data-suffix="%">~0%</span>
            <p class="stat-label">Less manual processing</p>
            <p class="stat-src">Apple Travel &middot; receipt automation</p>
          </div>
          <div class="stat">
            <span class="num" data-to="95" data-prefix="~" data-suffix="%">~0%</span>
            <p class="stat-label">Fewer reconciliation errors</p>
            <p class="stat-src">Apple &middot; BART budget system</p>
          </div>
          <div class="stat">
            <span class="num" data-to="70000" data-suffix="+">0</span>
            <p class="stat-label">Requests handled per hour</p>
            <p class="stat-src">Amazon &middot; S3 / SQS / Lambda pipeline</p>
          </div>
          <div class="stat">
            <span class="num" data-to="42" data-prefix="~" data-suffix="%">~0%</span>
            <p class="stat-label">Latency cut on a core endpoint</p>
            <p class="stat-src">ExaCare &middot; API performance work</p>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Append Stats section styles**

Append to `assets/css/style.css`:

```css
.stats{position:relative;background:var(--night);color:#f5f5f7;overflow:hidden;padding:clamp(84px,12vh,140px) 0;}
.stats::before{content:"";position:absolute;inset:0;background:radial-gradient(80% 120% at 20% 0%,rgba(43,92,255,.28),transparent 55%),radial-gradient(70% 120% at 90% 100%,rgba(123,75,255,.22),transparent 55%);pointer-events:none;}
.stats-inner{position:relative;z-index:2;}
.stats .kicker{color:#7fb3ff;}
.stats .h-sec{color:#fff;}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(28px,4vw,48px);margin-top:clamp(48px,7vw,72px);}
.num{display:block;font-size:clamp(2.6rem,6vw,4.4rem);font-weight:700;letter-spacing:-0.03em;line-height:1;font-variant-numeric:tabular-nums;color:#fff;}
.stat-label{color:#c7cdd8;font-size:1rem;margin:14px 0 0;line-height:1.4;}
.stat-src{color:#7d818c;font-size:0.8125rem;margin:6px 0 0;}

@media (max-width:900px){.stat-grid{grid-template-columns:1fr 1fr;gap:36px 28px;}}
```

- [ ] **Step 3: Append the count-up JS**

Modify `assets/js/main.js`: insert immediately before the final `})();`:

```js
  function initStatCounts(){
    var statGrid = document.getElementById('statGrid');
    if(!statGrid) return;
    function startCounts(){
      document.querySelectorAll('.num').forEach(function(el){
        var to = parseFloat(el.getAttribute('data-to'));
        var pre = el.getAttribute('data-prefix') || '';
        var suf = el.getAttribute('data-suffix') || '';
        function fmt(n){ return pre + Math.round(n).toLocaleString('en-US') + suf; }
        if(reduce){ el.textContent = fmt(to); return; }
        var dur = 1700, start = null;
        function step(ts){ if(!start) start = ts; var p = Math.min((ts-start)/dur,1); var e = 1-Math.pow(1-p,3); el.textContent = fmt(to*e); if(p<1) requestAnimationFrame(step); else el.textContent = fmt(to); }
        requestAnimationFrame(step);
      });
    }
    if('IntersectionObserver' in window){
      var sio = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting){ startCounts(); sio.unobserve(e.target); } });
      }, {threshold:0.4});
      sio.observe(statGrid);
    } else { startCounts(); }
  }
  initStatCounts();
```

- [ ] **Step 4: Verify the JS is syntactically valid**

Run: `node --check assets/js/main.js`
Expected: no output.

- [ ] **Step 5: Manually verify in the browser**

Reload and scroll to the Stats section. Expected: four numbers count up from 0 to their target (~80%, ~95%, 70,000+, ~42%) over about 1.7 seconds once the section is roughly 40% visible, then hold at the final value.

- [ ] **Step 6: Commit**

```bash
git add index.html assets/css/style.css assets/js/main.js
git commit -m "Add Stats section with count-up numbers"
```

---

### Task 9: Skill constellation, replacing the plain skills list

**Files:**
- Modify: `index.html` (append section after Stats)
- Modify: `assets/css/style.css` (append)
- Modify: `assets/js/main.js` (append, insert before the final `})();`)

**Interfaces:**
- Consumes: `reduce` (from Task 2).
- Produces: `#skills` section id.

- [ ] **Step 1: Insert the Skills section markup**

Modify `index.html`: insert immediately after the Stats section's `</section>`:

```html
    <section class="section band" id="skills">
      <div class="wrap">
        <div class="reveal">
          <p class="kicker">Toolkit</p>
          <h2 class="h-sec">What I work with</h2>
          <p class="sec-lead">The tools I reach for most, as a living network rather than a list.</p>
        </div>
        <div class="const-stage reveal">
          <canvas id="constCanvas" aria-hidden="true"></canvas>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Append Skills section styles**

Append to `assets/css/style.css`:

```css
.const-stage{position:relative;background:var(--night);border-radius:20px;padding:clamp(24px,4vw,36px);}
#constCanvas{width:100%;height:360px;display:block;}
@media (max-width:680px){#constCanvas{height:280px;}}
```

- [ ] **Step 3: Append the constellation JS**

Modify `assets/js/main.js`: insert immediately before the final `})();`:

```js
  function initSkillConstellation(){
    var canvas = document.getElementById('constCanvas'); if(!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d'), dpr = Math.min(window.devicePixelRatio||1, 2);
    var labels = ['Python','Java','TypeScript','Ruby','SQL','AWS','Spring Boot','React','Docker','LLM','Solr','CI/CD'];
    var nodes = [], W = 0, H = 0, visible = false, raf = null;
    function resize(){
      var rc = canvas.getBoundingClientRect(); W = rc.width; H = rc.height;
      canvas.width = Math.round(W*dpr); canvas.height = Math.round(H*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
      nodes = labels.map(function(l){ return { label:l, x:Math.random()*W, y:20+Math.random()*(H-40), vx:(Math.random()-0.5)*0.2, vy:(Math.random()-0.5)*0.2 }; });
    }
    function draw(){
      ctx.clearRect(0,0,W,H);
      if(!reduce){
        nodes.forEach(function(n){ n.x+=n.vx; n.y+=n.vy; if(n.x<24||n.x>W-24)n.vx*=-1; if(n.y<16||n.y>H-16)n.vy*=-1; });
      }
      for(var i=0;i<nodes.length;i++) for(var j=i+1;j<nodes.length;j++){
        var a=nodes[i], b=nodes[j], d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<130){ ctx.strokeStyle='rgba(90,170,255,'+(0.3*(1-d/130))+')'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
      }
      nodes.forEach(function(n){
        ctx.fillStyle='#0071e3'; ctx.beginPath(); ctx.arc(n.x,n.y,3.5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#c7cdd8'; ctx.font='12px -apple-system,sans-serif'; ctx.fillText(n.label, n.x+8, n.y+4);
      });
    }
    function loop(){ draw(); if(visible && !reduce) raf = requestAnimationFrame(loop); }
    resize(); draw();
    window.addEventListener('resize', function(){ resize(); draw(); });
    if(reduce) return;
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ es.forEach(function(e){ visible = e.isIntersecting;
        if(visible){ raf = requestAnimationFrame(loop); } else if(raf){ cancelAnimationFrame(raf); } }); }, {threshold:0.2}).observe(canvas);
    } else { visible = true; raf = requestAnimationFrame(loop); }
  }
  initSkillConstellation();
```

- [ ] **Step 4: Verify the JS is syntactically valid**

Run: `node --check assets/js/main.js`
Expected: no output.

- [ ] **Step 5: Manually verify in the browser**

Reload and scroll to the Toolkit section. Expected: twelve labeled dots drifting slowly, with faint connecting lines appearing between nearby dots and fading as they separate; scrolling the section out of view and back confirms it pauses and resumes (check via console for errors, none expected). Enable reduced motion: dots should render at fixed initial positions with no movement.

- [ ] **Step 6: Commit**

```bash
git add index.html assets/css/style.css assets/js/main.js
git commit -m "Replace skills list with an animated skill constellation"
```

---

### Task 10: Projects, part one: Mental Health Crisis Detection with a bespoke live diagram

**Files:**
- Modify: `index.html` (append section after Skills)
- Modify: `assets/css/style.css` (append)

**Interfaces:**
- Produces: `#projects` section id (Task 11 appends its card into this same section's `.proj-grid`, so do not close out the section container assumptions beyond what's specified here; Task 11's markup is inserted as a sibling `.proj-card` immediately after this task's card).

- [ ] **Step 1: Insert the Projects section markup with the Crisis Detection card**

Modify `index.html`: insert immediately after the Skills section's `</section>`:

```html
    <section class="section" id="projects">
      <div class="wrap">
        <div class="reveal">
          <p class="kicker">Selected work</p>
          <h2 class="h-sec">Outside the day job</h2>
        </div>
        <div class="proj-grid">
          <div class="proj-card reveal">
            <div class="proj-viz">
              <svg viewBox="0 0 260 150" aria-hidden="true">
                <path d="M18,20 h70 a6,6 0 0 1 6,6 v22 a6,6 0 0 1 -6,6 h-46 l-10,10 v-10 h-14 a6,6 0 0 1 -6,-6 v-22 a6,6 0 0 1 6,-6 z" fill="#141824" stroke="#2b3550" stroke-width="1.2"/>
                <text x="28" y="40" fill="#c7cdd8" font-size="8" font-family="-apple-system,sans-serif">I do not feel okay</text>
                <path d="M60,64 L60,80" stroke="#233052" stroke-width="1.3"/>
                <g transform="translate(60,100)">
                  <circle r="18" fill="none" stroke="#0071e3" stroke-width="1.2" opacity="0.4"><animate attributeName="r" values="16;20;16" dur="1.8s" repeatCount="indefinite"/></circle>
                  <circle cx="-7" cy="-4" r="2.2" fill="#3d8bff"/>
                  <circle cx="7" cy="-3" r="2.2" fill="#3d8bff"/>
                  <circle cx="0" cy="7" r="2.2" fill="#3d8bff"/>
                  <line x1="-7" y1="-4" x2="7" y2="-3" stroke="#3d8bff" stroke-width="0.8" opacity="0.6"/>
                  <line x1="-7" y1="-4" x2="0" y2="7" stroke="#3d8bff" stroke-width="0.8" opacity="0.6"/>
                  <line x1="7" y1="-3" x2="0" y2="7" stroke="#3d8bff" stroke-width="0.8" opacity="0.6"/>
                </g>
                <path d="M60,120 L60,132" stroke="#233052" stroke-width="1.3"/>
                <rect x="150" y="30" width="90" height="10" rx="5" fill="none" stroke="#2b3550" stroke-width="1.2"/>
                <rect x="150" y="30" width="10" height="10" rx="5" fill="#ff6b6b">
                  <animate attributeName="width" values="10;86;86;10" keyTimes="0;0.4;0.85;1" dur="4s" repeatCount="indefinite"/>
                </rect>
                <text x="150" y="24" fill="#9099a8" font-size="7.5" font-family="-apple-system,sans-serif">risk signal</text>
                <rect x="150" y="54" width="58" height="18" rx="9" fill="#2a1010" stroke="#ff6b6b" stroke-width="1.2" opacity="0">
                  <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.4;0.55;0.85;1" dur="4s" repeatCount="indefinite"/>
                </rect>
                <text x="160" y="66" fill="#ff9c9c" font-size="8" font-weight="700" font-family="-apple-system,sans-serif" opacity="0">
                  ESCALATE
                  <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.4;0.55;0.85;1" dur="4s" repeatCount="indefinite"/>
                </text>
              </svg>
            </div>
            <div class="proj-body">
              <h3>Mental Health Crisis Detection</h3>
              <p>An AI chatbot that recognizes distress in conversation. GPT-3.5 handles dialogue, a fine-tuned RoBERTa model reads sentiment, and NLP flags crisis signals so the system can escalate quickly.</p>
              <p class="proj-tech">Python &middot; Flask &middot; React &middot; GPT-3.5 &middot; RoBERTa &middot; Firebase</p>
              <p><a href="https://github.com/samuelhabib">View on GitHub</a></p>
            </div>
          </div>
        </div>
        <p class="proj-more">More experiments and side projects live on <a href="https://github.com/samuelhabib">GitHub</a>.</p>
      </div>
    </section>
```

- [ ] **Step 2: Append Projects section styles**

Append to `assets/css/style.css`:

```css
.proj-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:32px;}
.proj-card{background:var(--night);border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(10,12,30,.12);}
.proj-viz{background:#06070d;}
.proj-viz svg{display:block;width:100%;height:auto;}
.proj-body{padding:clamp(22px,3vw,32px);color:#f5f5f7;}
.proj-body h3{font-size:clamp(1.3rem,3vw,1.6rem);font-weight:700;letter-spacing:-0.02em;margin:0;}
.proj-body p{font-size:1rem;line-height:1.56;margin:14px 0 0;color:#d7e0ea;}
.proj-body .proj-tech{color:#8a93a3;font-size:0.875rem;margin:16px 0 0;}
.proj-body a{color:#7fb3ff;}
.proj-more{margin:40px 0 0;color:var(--slate);font-size:1.0625rem;}
```

- [ ] **Step 3: Manually verify in the browser**

Reload and scroll to the Projects section. Expected: a dark card showing a message bubble, a small pulsing sentiment network below it, and a risk meter that fills then triggers a red "ESCALATE" badge before resetting, on a four-second loop. This animation runs via SMIL (`<animate>`), not JS, so it always plays regardless of `prefers-reduced-motion`; that is acceptable here since it is a small, contained, non-essential decorative loop rather than a page-wide motion effect (note this decision in the plan and do not add JS motion-gating for this specific SVG).

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "Add Projects section with Crisis Detection bespoke diagram"
```

---

### Task 11: Projects, part two: fitness/calorie bot with the live AI-reply demo

**Files:**
- Modify: `index.html` (insert the second `.proj-card` as a sibling of the first, inside `.proj-grid`)
- Modify: `assets/css/style.css` (append)
- Modify: `assets/js/main.js` (append, insert before the final `})();`)

**Interfaces:**
- Consumes: `.proj-grid` (from Task 10).
- Produces: nothing consumed later.

- [ ] **Step 1: Insert the fitness-bot card markup**

Modify `index.html`: insert immediately after the Crisis Detection `.proj-card`'s closing `</div>` (still inside `.proj-grid`, as the second card):

```html
          <div class="proj-card reveal">
            <div class="proj-viz proj-chat">
              <div class="chat-bubble chat-user">what should I eat tonight?</div>
              <div class="chat-bubble chat-ai" id="chatAiBubble"><span class="chat-dots"><span></span><span></span><span></span></span></div>
            </div>
            <div class="proj-body">
              <h3>AI Fitness and Calorie Tracker</h3>
              <p>An AI companion that tracks meals and calories, nudges healthier choices, and remembers what is already in the kitchen from a connected Instacart grocery list.</p>
              <p class="proj-tech">More on this soon.</p>
            </div>
          </div>
```

- [ ] **Step 2: Append fitness-bot card styles**

Append to `assets/css/style.css`:

```css
.proj-chat{padding:20px;display:flex;flex-direction:column;gap:10px;justify-content:center;min-height:150px;}
.chat-bubble{max-width:80%;padding:9px 13px;border-radius:14px;font-size:0.8125rem;line-height:1.5;}
.chat-user{align-self:flex-end;background:var(--accent);color:#fff;border-bottom-right-radius:4px;}
.chat-ai{align-self:flex-start;background:#1c1f29;color:#e7e9ee;border-bottom-left-radius:4px;min-height:16px;}
.chat-dots span{display:inline-block;width:5px;height:5px;margin-right:3px;border-radius:50%;background:#8891a3;animation:chatDotBounce 1.1s infinite ease-in-out;}
.chat-dots span:nth-child(2){animation-delay:.15s;} .chat-dots span:nth-child(3){animation-delay:.3s;}
@keyframes chatDotBounce{0%,80%,100%{transform:translateY(0);opacity:.5;}40%{transform:translateY(-4px);opacity:1;}}
@media (prefers-reduced-motion:reduce){
  .chat-dots span{animation:none;}
}
```

- [ ] **Step 3: Append the AI-reply demo JS**

Modify `assets/js/main.js`: insert immediately before the final `})();`:

```js
  function initChatDemo(){
    var aiBubble = document.getElementById('chatAiBubble');
    if(!aiBubble) return;
    var reply = "based on the spinach and chicken you grabbed on instacart tuesday, try a grilled chicken bowl. keeps you about 150 calories under today's target.";
    var visible = false, timer = null;
    function loop(){
      aiBubble.innerHTML = '<span class="chat-dots"><span></span><span></span><span></span></span>';
      timer = setTimeout(function(){
        if(reduce){ aiBubble.textContent = reply; timer = setTimeout(function(){ if(visible) loop(); }, 3200); return; }
        aiBubble.textContent = '';
        var ci = 0;
        var iv = setInterval(function(){
          aiBubble.textContent = reply.slice(0, ci);
          ci++;
          if(ci > reply.length){ clearInterval(iv); timer = setTimeout(function(){ if(visible) loop(); }, 2600); }
        }, 18);
      }, reduce ? 0 : 1100);
    }
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ es.forEach(function(e){
        visible = e.isIntersecting;
        if(visible){ loop(); } else if(timer){ clearTimeout(timer); }
      }); }, {threshold:0.3}).observe(aiBubble.closest('.proj-card'));
    } else { visible = true; loop(); }
  }
  initChatDemo();
```

- [ ] **Step 4: Verify the JS is syntactically valid**

Run: `node --check assets/js/main.js`
Expected: no output.

- [ ] **Step 5: Manually verify in the browser**

Reload and scroll to the second project card. Expected: a user bubble reading "what should I eat tonight?" and, after roughly a second of animated thinking dots, an AI reply about the spinach and chicken streams in character by character, holds, then loops. Scroll the card out of view and back: the loop should pause and resume rather than continuing to fire timers in the background (confirm via console, no errors, and no runaway interval by checking the Performance/Memory tab briefly).

- [ ] **Step 6: Commit**

```bash
git add index.html assets/css/style.css assets/js/main.js
git commit -m "Add fitness-bot project card with the live AI-reply demo"
```

---

### Task 12: Education and Contact sections

**Files:**
- Modify: `index.html` (append Education section after Projects, and the Contact `<footer>` after `</main>`)
- Modify: `assets/css/style.css` (append)

**Interfaces:** None beyond markup/CSS.

- [ ] **Step 1: Insert the Education section**

Modify `index.html`: insert immediately after the Projects section's `</section>` (still inside `<main id="top">`, as the last section before `</main>`):

```html
    <section class="section" id="education">
      <div class="wrap">
        <div class="reveal">
          <p class="kicker">Education</p>
          <h2 class="h-sec">Where it started</h2>
        </div>
        <div class="edu reveal">
          <div class="edu-when">2019 &#8211; 2024</div>
          <div>
            <h3 class="edu-school">Toronto Metropolitan University</h3>
            <p class="edu-deg">B.Eng, Computer Engineering &middot; CGPA 3.90</p>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Insert the Contact footer**

Modify `index.html`: insert immediately after `</main>` (as a sibling of `<main>`, before the `<script>` tag):

```html
  <footer class="contact" id="contact">
    <div class="aurora"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span></div>
    <div class="wrap contact-inner">
      <h2 class="reveal">Let's build something dependable.</h2>
      <div class="reveal"><a class="contact-mail" href="mailto:samuel.habib31@gmail.com">samuel.habib31@gmail.com</a></div>
      <div class="contact-links reveal">
        <a href="https://www.linkedin.com/in/samuel-habib-50605a19a/">LinkedIn</a>
        <a href="https://github.com/samuelhabib">GitHub</a>
        <a href="Resume.pdf">Resume</a>
      </div>
      <div class="contact-foot"><span>New York, NY</span><span>&copy; 2026 Samuel Habib</span></div>
    </div>
  </footer>
```

- [ ] **Step 3: Append Education and Contact styles**

Append to `assets/css/style.css`:

```css
.edu{display:grid;grid-template-columns:160px 1fr;gap:36px;max-width:780px;}
.edu-when{color:var(--slate);font-size:1rem;padding-top:8px;}
.edu-school{font-size:clamp(1.5rem,3.4vw,2rem);font-weight:700;letter-spacing:-0.018em;margin:0;line-height:1.1;}
.edu-deg{color:var(--slate);font-size:1.0625rem;margin:11px 0 0;}

.contact{position:relative;background:var(--night);color:#f5f5f7;overflow:hidden;padding:clamp(100px,15vh,170px) 0;}
.contact .aurora{filter:blur(80px);opacity:.7;}
.contact-inner{position:relative;z-index:3;}
.contact h2{font-size:clamp(2.4rem,6.5vw,4rem);font-weight:700;letter-spacing:-0.03em;line-height:1.02;margin:0;max-width:15ch;color:#fff;}
.contact-mail{display:inline-block;margin:36px 0 0;font-size:clamp(1.3rem,3vw,1.9rem);font-weight:500;color:#fff;letter-spacing:-0.01em;transition:color .25s ease;}
.contact-mail:hover{color:#8fbcff;}
.contact-links{margin:44px 0 0;display:flex;gap:30px;flex-wrap:wrap;}
.contact-links a{color:#c7cdd8;font-size:1.0625rem;transition:color .25s ease;}
.contact-links a:hover{color:#fff;}
.contact-foot{margin-top:clamp(60px,10vh,96px);padding-top:26px;border-top:1px solid rgba(255,255,255,.14);display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;color:#7d818c;font-size:0.9375rem;}

@media (max-width:680px){
  .edu{grid-template-columns:1fr;gap:12px;}
  .edu-when{padding-top:0;}
}
```

- [ ] **Step 4: Manually verify in the browser**

Reload and scroll to the bottom. Expected: the Education section shows Toronto Metropolitan University with the correct dates and CGPA; the dark Contact footer shows the aurora blobs again, a large heading, a clickable mailto link, LinkedIn/GitHub/Resume links, and a footer row with location and copyright. Click "Resume": confirm it opens the PDF (the one already swapped into the repository root) in a new context and is not a 404.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "Add Education section and Contact footer"
```

---

### Task 13: Final audit: reduced motion, em dash grep, responsive pass

**Files:**
- Modify: `index.html`, `assets/css/style.css`, `assets/js/main.js` (only if the audit below finds something to fix; otherwise no changes)

**Interfaces:** None (verification and cleanup only).

- [ ] **Step 1: Grep for the em dash character across shipped files**

Run: `grep -n $'—' index.html assets/css/style.css assets/js/main.js`
Expected: no output. If any line is found, replace the em dash with a comma, period, or colon as appropriate to the sentence, re-run the grep, and confirm it is now clean.

- [ ] **Step 2: Verify every animated component respects `prefers-reduced-motion`**

Manually enable Reduce Motion (macOS: System Settings, Accessibility, Display) and hard-reload `http://localhost:8000/`. Walk down the page and confirm: the hero shows the full text immediately with no terminal typing; the aurora blobs are static; the Provider Directory viz is fully resolved; the Referral Outbound Center hub is static (no packets moving); the map journey shows all three cities already lit with no traveling dot; the skill constellation nodes are static; the fitness-bot chat bubble shows the full reply immediately without a per-character stream (it may still loop on a slow interval per Task 11's code, which is acceptable since it is a single small looping caption, not a page-wide motion effect); the Crisis Detection card's SMIL loop still plays (documented exception from Task 10, acceptable as a small contained decorative loop). Disable Reduce Motion afterward and confirm animations return.

- [ ] **Step 3: Responsive pass at three breakpoints**

Using the browser's device toolbar (or manually resizing), check the page at roughly 375px (phone), 768px (tablet), and 1440px (desktop) widths. Confirm: the nav collapses the "Projects" link at the narrowest width per the existing `data-optional` rule; the hero terminal and text never overflow their container; the map SVG scales down without its labels overlapping (zoom in if needed to read the smallest text, this is expected at very small viewport widths); the Experience rows stack to a single column below 680px; the Projects cards stack to one column below roughly 620px combined width (verify visually, since `auto-fit, minmax(320px,1fr)` handles this automatically).

- [ ] **Step 4: Full end-to-end smoke test**

Run: `python3 -m http.server 8000` from the repository root, open `http://localhost:8000/` in a fresh private/incognito window (avoids any cached old assets). Click through every nav link (Now, Work, Projects, Contact) and confirm each scrolls to the correct section. Open the browser console and confirm zero errors or warnings from top to bottom of the page. Confirm `http://localhost:8000/legacy/index.html` still renders the old site correctly (Task 1's verification, re-checked here as a final regression check now that the root site has fully changed around it).

- [ ] **Step 5: Commit (only if Steps 1 to 3 required fixes; otherwise skip this commit)**

```bash
git add index.html assets/css/style.css assets/js/main.js
git commit -m "Final audit fixes: em dash grep, reduced-motion, responsive pass"
```
