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
