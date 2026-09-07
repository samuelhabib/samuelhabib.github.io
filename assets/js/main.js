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
      entries.forEach(function(e){ e.target.classList.toggle('in', e.isIntersecting); });
    }, {threshold:0.16, rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.reveal, .stagger').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal, .stagger').forEach(function(el){ el.classList.add('in'); });
  }

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

  function initMapJourney(){
    var path = document.getElementById('mapPath');
    var dot = document.getElementById('mapDot');
    if(!path || !dot) return;
    var trails = [document.getElementById('mapTrail0'), document.getElementById('mapTrail1'), document.getElementById('mapTrail2')];
    var stops = [
      {x:262.6,y:72.7, els:['mapTor','mapTorCity','mapTorCh','mapTorYr'], ring:'mapTorRing'},
      {x:157.0,y:159.6, els:['mapAus','mapAusCity','mapAusCh','mapAusYr'], ring:'mapAusRing'},
      {x:293.5,y:91.8, els:['mapNyc','mapNycCity','mapNycCh','mapNycYr'], ring:'mapNycRing'}
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
    var visible = false, raf = null, start = null, lastT = 0, travelDur = 4600, holdDur = 1800, trailGap = 0.018;
    var cycle = travelDur + holdDur;
    function resetLights(){
      stops.forEach(function(s){ s.lit=false; s.els.forEach(function(id){ document.getElementById(id).classList.remove('lit'); }); document.getElementById(s.ring).classList.remove('lit'); });
    }
    function lightStop(s){
      s.lit = true;
      s.els.forEach(function(id){ document.getElementById(id).classList.add('lit'); });
      document.getElementById(s.ring).classList.add('lit');
    }
    function frame(ts){
      if(!start) start = ts;
      var elapsed = ts - start, t = elapsed % cycle;
      if(t < lastT) resetLights();
      lastT = t;
      if(t < travelDur){
        var p = t / travelDur;
        var pt = path.getPointAtLength(len*p);
        dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
        trails.forEach(function(tr,i){ var tp=Math.max(0,p-trailGap*(i+1)), pos=path.getPointAtLength(len*tp); tr.setAttribute('cx',pos.x); tr.setAttribute('cy',pos.y); });
        stops.forEach(function(s){ if(!s.lit && p >= s.frac-0.004) lightStop(s); });
      } else {
        var end = path.getPointAtLength(len);
        dot.setAttribute('cx', end.x); dot.setAttribute('cy', end.y);
        trails.forEach(function(tr){ tr.setAttribute('cx', end.x); tr.setAttribute('cy', end.y); });
        stops.forEach(function(s){ if(!s.lit) lightStop(s); });
      }
      if(visible) raf = requestAnimationFrame(frame);
    }
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ es.forEach(function(e){ visible = e.isIntersecting;
        if(visible){ start=null; lastT=0; raf=requestAnimationFrame(frame); } else if(raf){ cancelAnimationFrame(raf); } }); }, {threshold:0.2}).observe(path.closest('svg'));
    } else { visible = true; raf = requestAnimationFrame(frame); }
  }
  initMapJourney();

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
        entries.forEach(function(e){ if(e.isIntersecting) startCounts(); });
      }, {threshold:0.4});
      sio.observe(statGrid);
    } else { startCounts(); }
  }
  initStatCounts();

  function initSkillConstellation(){
    var canvas = document.getElementById('constCanvas'); if(!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d'), dpr = Math.min(window.devicePixelRatio||1, 2);
    var labels = ['Python','Java','TypeScript','Ruby','SQL','AWS','Spring Boot','React','Docker','LLM','Solr','CI/CD'];
    var nodes = [], W = 0, H = 0, visible = false, raf = null, FONT = '12px -apple-system,sans-serif';
    var mouse = {x:-9999, y:-9999, active:false};
    function resize(){
      var rc = canvas.getBoundingClientRect(); W = rc.width; H = rc.height;
      canvas.width = Math.round(W*dpr); canvas.height = Math.round(H*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.font = FONT;
      nodes = labels.map(function(l){
        var lw = ctx.measureText(l).width;
        var maxX = Math.max(24, W-24-8-lw);
        return { label:l, lw:lw, x:24+Math.random()*(maxX-24 > 0 ? maxX-24 : 1), y:20+Math.random()*(H-40), vx:(Math.random()-0.5)*0.2, vy:(Math.random()-0.5)*0.2 };
      });
    }
    function step(){
      nodes.forEach(function(n){
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<24||n.x+8+n.lw>W-4)n.vx*=-1;
        if(n.y<16||n.y>H-16)n.vy*=-1;
        if(mouse.active){
          var dx=n.x-mouse.x, dy=n.y-mouse.y, d=Math.hypot(dx,dy), rad=100;
          if(d<rad && d>0.01){ var f=(1-d/rad)*0.9; n.x += (dx/d)*f; n.y += (dy/d)*f; }
        }
      });
    }
    function render(){
      ctx.clearRect(0,0,W,H);
      for(var i=0;i<nodes.length;i++) for(var j=i+1;j<nodes.length;j++){
        var a=nodes[i], b=nodes[j], d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<130){ ctx.strokeStyle='rgba(90,170,255,'+(0.3*(1-d/130))+')'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
      }
      nodes.forEach(function(n){
        var near = mouse.active && Math.hypot(n.x-mouse.x, n.y-mouse.y) < 70;
        ctx.fillStyle = near ? '#6be89a' : '#0071e3';
        ctx.beginPath(); ctx.arc(n.x, n.y, near ? 5 : 3.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = near ? '#ffffff' : '#c7cdd8';
        ctx.font = FONT;
        ctx.fillText(n.label, n.x+8, n.y+4);
      });
    }
    function loop(){ if(!reduce) step(); render(); if(visible && !reduce) raf = requestAnimationFrame(loop); }
    resize(); render();
    window.addEventListener('resize', function(){ resize(); render(); });
    canvas.addEventListener('mousemove', function(e){
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.active = true;
      if(reduce) render();
    });
    canvas.addEventListener('mouseleave', function(){ mouse.active = false; if(reduce) render(); });
    if(reduce) return;
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ es.forEach(function(e){ visible = e.isIntersecting;
        if(visible){ raf = requestAnimationFrame(loop); } else if(raf){ cancelAnimationFrame(raf); } }); }, {threshold:0.2}).observe(canvas);
    } else { visible = true; raf = requestAnimationFrame(loop); }
  }
  initSkillConstellation();

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

  function initCrisisChatDemo(){
    var aiBubble = document.getElementById('crisisAiBubble');
    var flag = document.getElementById('crisisFlag');
    if(!aiBubble || !flag) return;
    var reply = "that sounds really heavy, thank you for telling me. i want to make sure you get real support, so i'm connecting you with someone who can help right now.";
    var visible = false, timer = null;
    function loop(){
      flag.classList.remove('show');
      aiBubble.innerHTML = '<span class="chat-dots"><span></span><span></span><span></span></span>';
      timer = setTimeout(function(){
        if(reduce){
          aiBubble.textContent = reply;
          flag.classList.add('show');
          timer = setTimeout(function(){ if(visible) loop(); }, 3200);
          return;
        }
        aiBubble.textContent = '';
        var ci = 0;
        var iv = setInterval(function(){
          aiBubble.textContent = reply.slice(0, ci);
          ci++;
          if(ci > reply.length){
            clearInterval(iv);
            flag.classList.add('show');
            timer = setTimeout(function(){ if(visible) loop(); }, 2800);
          }
        }, 16);
      }, reduce ? 0 : 1000);
    }
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ es.forEach(function(e){
        visible = e.isIntersecting;
        if(visible){ loop(); } else if(timer){ clearTimeout(timer); }
      }); }, {threshold:0.3}).observe(aiBubble.closest('.proj-card'));
    } else { visible = true; loop(); }
  }
  initCrisisChatDemo();

  function initTerminalPopup(){
    var triggers = [document.getElementById('brandLink'), document.getElementById('heroName')].filter(Boolean);
    var modal = document.getElementById('termModal');
    var body = document.getElementById('termModalBody');
    var backdrop = document.getElementById('termBackdrop');
    if(!triggers.length || !modal || !body || !backdrop) return;
    var lines = [
      {p:'$ whoami', o:'samuel-habib, full stack software engineer @ exacare'},
      {p:'$ cat personality.md', o:'builds fast, pairs with AI agents, obsesses over clean systems'},
      {p:'$ echo $MOOD', o:'caffeinated, mid-deploy, probably fine'}
    ];
    var playing = false;
    function typeLines(done){
      body.innerHTML = '';
      var li = 0;
      function nextLine(){
        if(li >= lines.length){ done(); return; }
        var line = lines[li], ci = 0;
        var promptSpan = document.createElement('span');
        promptSpan.className = 'boot-prompt';
        body.appendChild(promptSpan);
        body.appendChild(document.createElement('br'));
        function typeChar(){
          if(reduce){ promptSpan.textContent = line.p; ci = line.p.length + 1; }
          if(ci <= line.p.length){ promptSpan.textContent = line.p.slice(0, ci); ci++; setTimeout(typeChar, reduce ? 0 : 26); }
          else {
            var out = document.createElement('span');
            out.className = 'boot-out';
            out.textContent = line.o;
            body.appendChild(out);
            body.appendChild(document.createElement('br'));
            li++;
            setTimeout(nextLine, reduce ? 0 : 300);
          }
        }
        typeChar();
      }
      nextLine();
    }
    function open(){
      if(playing) return;
      playing = true;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      typeLines(function(){ playing = false; });
    }
    function close(){
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
    triggers.forEach(function(t){ t.addEventListener('click', function(e){ e.preventDefault(); open(); }); });
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });
  }
  initTerminalPopup();
})();
