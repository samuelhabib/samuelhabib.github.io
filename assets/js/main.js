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
})();
