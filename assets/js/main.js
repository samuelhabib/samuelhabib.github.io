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
})();
