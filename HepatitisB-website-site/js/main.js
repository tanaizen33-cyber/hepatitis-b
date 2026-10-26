/* Hepatitis B site — interactions */
(function(){
  document.documentElement.classList.remove('no-js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* reading progress */
  var bar = document.getElementById('progress');
  function prog(){ var h=document.documentElement; var max=h.scrollHeight-h.clientHeight; bar.style.width=(max>0? (h.scrollTop/max*100):0)+'%'; }
  window.addEventListener('scroll', prog, {passive:true}); prog();

  /* reveal + play-on-view */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add((e.target.id==='manual'||e.target.classList.contains('anim'))?'play':'in'); io.unobserve(e.target);} });
  },{threshold:.18}) : null;
  document.querySelectorAll('.reveal, #manual, .anim').forEach(function(el){ if(io) io.observe(el); else el.classList.add('in','play'); });

  /* departments */
  document.querySelectorAll('.dept').forEach(function(b){
    b.addEventListener('click', function(){ b.setAttribute('aria-expanded', b.getAttribute('aria-expanded')==='true'?'false':'true'); });
  });
  /* flip cards */
  document.querySelectorAll('.flip').forEach(function(b){
    b.addEventListener('click', function(){ b.setAttribute('aria-pressed', b.getAttribute('aria-pressed')==='true'?'false':'true'); });
  });

  /* ---------- years-since-infection slider ---------- */
  var grid=document.getElementById('grid'), range=document.getElementById('range');
  if(grid && range){
    var N=48, cells=[], order=[];
    // scar spreads in bands: order cells by distance to two "scar lines" plus a little noise (seeded)
    var seed=11; function rnd(){ seed=(seed*9301+49297)%233280; return seed/233280; }
    for(var i=0;i<N;i++){
      var r=Math.floor(i/8), c=i%8;
      var d1=Math.abs(c-(2+r*0.5)), d2=Math.abs(r-(4.5-c*0.35));
      order.push({i:i, k:Math.min(d1,d2)+rnd()*1.3});
      var s=document.createElementNS('http://www.w3.org/2000/svg','svg'); s.setAttribute('viewBox','0 0 64 64');
      var u=document.createElementNS('http://www.w3.org/2000/svg','use'); u.setAttribute('href','#worker'); s.appendChild(u);
      grid.appendChild(s); cells.push(u);
    }
    order.sort(function(a,b){return a.k-b.k;});
    /* Order follows how scarred livers usually fail: a swollen belly (ascites) is by far the most common first sign,
       then yellowing and bleeding problems; confusion usually comes last. Each department: [name, reserve, [[symptom, shows below %], ...]] */
    var depts=[['Water-keeping',0.60,[['Swollen belly',60]]],
               ['Cleaning',0.56,[['Yellow skin and eyes',60],['Confusion',25]]],
               ['Clotting',0.53,[['Easy bruising',60]]],
               ['Processing',0.50,[['Tiredness',60]]]];
    var bars=document.getElementById('bars'), sym=document.getElementById('symptoms'), yrs=document.getElementById('yrs');
    var fills=[], pcts=[], badges=[];
    depts.forEach(function(d){
      var row=document.createElement('div'); row.className='bar';
      row.innerHTML='<span>'+d[0]+'</span><span class="track"><span class="fill"></span></span><span class="pct">100%</span>';
      bars.appendChild(row); fills.push(row.querySelector('.fill')); pcts.push(row.querySelector('.pct'));
      badges.push(d[2].map(function(s){ var b=document.createElement('span'); b.className='badge'; b.textContent=s[0]; b.dataset.below=s[1]; return b; }));
    });
    // badges are shown in the order symptoms usually appear
    var badgeOrder=[badges[0][0],badges[1][0],badges[2][0],badges[3][0],badges[1][1]];
    badgeOrder.forEach(function(b){ sym.appendChild(b); });
    function update(){
      var t=+range.value, f=0.9*Math.pow(t/40,1.4), scarN=Math.round(f*N);
      range.style.setProperty('--fill',(t/40*100)+'%');
      yrs.textContent=t+(t===1?' year':' years');
      cells.forEach(function(u){u.setAttribute('href','#worker');});
      for(var j=0;j<scarN;j++) cells[order[j].i].setAttribute('href','#scar');
      var h=1-f;
      depts.forEach(function(d,k){
        var reserve=d[1];   // each department starts to fail at a slightly different point
        var out = h>=reserve ? 100 : Math.max(0,(h-0.12)/(reserve-0.12)*100);
        fills[k].style.width=out+'%';
        fills[k].style.background = out>70? '#3F7D5A' : out>40? '#E8A33D' : '#B8423A';
        pcts[k].textContent=Math.round(out)+'%';
        badges[k].forEach(function(b){ b.classList.toggle('on', out < +b.dataset.below); });
      });
    }
    range.addEventListener('input', update); update();
  }

  /* ---------- notepad quiz ---------- */
  var Q=[
    ['Can you catch hepatitis B from eating seafood?',['Yes, especially raw shellfish','No, it spreads through blood and some body fluids','Only if the seafood is undercooked'],1,
      'No. It spreads through blood and some body fluids, and from mother to baby at birth. You may be thinking of hepatitis A.'],
    ['What does the virus leave behind in the liver cell’s control room?',['A permanent scar','Its own “extra page” of instructions','Nothing, it just passes through'],1,
      'Its own “extra page” of instructions, which is very hard to remove.'],
    ['Who does most of the damage to the liver?',['The virus, by bursting the cells','Your own immune system, removing infected cells','The medicines people take'],1,
      'Your own immune system, removing infected cells. The virus is the reason, but your defences do the damage.'],
    ['Why can someone feel well for decades?',['The virus goes to sleep and does nothing','The liver keeps working, has no pain nerves inside, and has a big safety margin','The damage heals completely every time'],1,
      'The virus doesn’t break the cells, the liver has no pain nerves inside, and it keeps working until many cells are lost.'],
    ['Why does the skin turn yellow?',['The skin is bruised','The liver can no longer clear a yellow pigment from the blood','The blood holds too little water'],1,
      'The liver can no longer clear a yellow pigment left over from old red blood cells.'],
    ['How can hepatitis B lead to liver cancer, even before the liver is badly scarred?',['Scar tissue slowly turns into cancer','Pieces of the virus’s instructions get glued into the worker’s own manual and scramble its growth instructions','The liver stores too much energy'],1,
      'Pieces of the virus’s instructions can get glued into the middle of the worker’s own manual, scrambling the instructions that normally stop a cell from growing out of control.']
  ];
  var card=document.getElementById('qcard'); if(!card) return;
  var qn=document.getElementById('qn'), qt=document.getElementById('qtext'), opts=document.getElementById('opts'),
      ex=document.getElementById('explain'), nx=document.getElementById('next'), pile=document.querySelector('.pile'),
      pc=document.getElementById('pilecount'), sc=document.getElementById('score'), st=document.getElementById('scoretext'),
      sm=document.getElementById('scoremsg'), again=document.getElementById('again');
  var idx=0, right=0, started=false;
  function show(){
    var q=Q[idx]; qn.textContent='Question '+(idx+1)+' of '+Q.length; opts.innerHTML=''; ex.classList.remove('show'); nx.classList.remove('show');
    card.classList.remove('gone'); card.classList.remove('up'); void card.offsetWidth; card.classList.add('up');
    qt.textContent=q[0];
    // shuffle the answer order each time, so the right answer isn't always in the same place
    var order=q[1].map(function(o,k){return k;});
    for(var i=order.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=order[i]; order[i]=order[j]; order[j]=t; }
    order.forEach(function(k){ var b=document.createElement('button'); b.className='opt'; b.textContent=q[1][k];
      b.dataset.right = (k===q[2]) ? '1' : '';
      b.addEventListener('click',function(){ answer(b); }); opts.appendChild(b); });
  }
  function answer(b){
    var q=Q[idx]; var bs=opts.querySelectorAll('.opt'); bs.forEach(function(x){x.disabled=true;});
    if(b.dataset.right){ right++; b.classList.add('right'); b.textContent='✓ '+b.textContent; }
    else { b.classList.add('wrong'); b.textContent='✗ '+b.textContent; opts.querySelector('.opt[data-right="1"]').classList.add('right'); }
    ex.textContent=q[3]; ex.classList.add('show'); nx.textContent = idx===Q.length-1 ? 'See my score →' : 'Next →'; nx.classList.add('show'); nx.focus({preventScroll:true});
  }
  nx.addEventListener('click',function(){
    card.classList.remove('up'); card.classList.add('gone');
    var m=document.createElement('div'); m.className='mini';
    m.style.transform='rotate('+((idx%2?1:-1)*(3+idx*2))+'deg) translate('+(idx*2)+'px,'+(idx*2)+'px)'; pile.insertBefore(m,pc);
    idx++; pc.textContent=idx+' / '+Q.length;
    setTimeout(function(){ if(idx<Q.length) show(); else finish(); }, reduce?0:650);
  });
  function finish(){
    card.style.display='none'; sc.classList.add('show');
    st.textContent=right+' out of '+Q.length;
    sm.textContent = right===Q.length ? 'Perfect. You’ve got the whole story.' : right>=4 ? 'Nicely done. You’ve got the main ideas.' : 'Worth another look. Scroll back up and try again.';
  }
  again.addEventListener('click',function(){
    idx=0; right=0; pc.textContent='0 / '+Q.length; pile.querySelectorAll('.mini').forEach(function(m){m.remove();});
    sc.classList.remove('show'); card.style.display=''; show();
  });
  var qio = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){
    if(es[0].isIntersecting && !started){ started=true; show(); qio.disconnect(); } },{threshold:.35}) : null;
  if(qio) qio.observe(document.getElementById('quiz')); else { started=true; show(); }
})();

/* ---------- contents panel: open/close on small screens + "you are here" ---------- */
(function(){
  var toc=document.getElementById('toc'), btn=document.getElementById('tocBtn'),
      back=document.getElementById('tocBack'), close=document.getElementById('tocClose');
  if(!toc) return;
  var wide=window.matchMedia('(min-width:1100px)');
  function setOpen(o){
    toc.classList.toggle('open',o); btn.setAttribute('aria-expanded',o?'true':'false'); back.hidden=!o;
    if(o){ var a=toc.querySelector('a.active')||toc.querySelector('a'); a.focus({preventScroll:true}); }
  }
  btn.addEventListener('click',function(){ setOpen(!toc.classList.contains('open')); });
  back.addEventListener('click',function(){ setOpen(false); });
  close.addEventListener('click',function(){ setOpen(false); btn.focus(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape' && toc.classList.contains('open')){ setOpen(false); btn.focus(); } });
  toc.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click',function(){
      var t=document.querySelector(a.getAttribute('href'));
      if(t) t.classList.add('in');              // make sure a section you jump to is visible straight away
      if(!wide.matches) setOpen(false);
    });
  });

  /* highlight the section currently on screen */
  var links={}, secs=[];
  toc.querySelectorAll('ol a').forEach(function(a){ var id=a.getAttribute('href').slice(1); links[id]=a; var s=document.getElementById(id); if(s) secs.push(s); });
  function spy(){
    var y=window.innerHeight*0.35, cur=null;
    secs.forEach(function(s){ if(s.getBoundingClientRect().top<=y) cur=s.id; });
    var passed=true;
    secs.forEach(function(s){
      var a=links[s.id]; var on=(s.id===cur);
      a.classList.toggle('active',on); if(on){ a.setAttribute('aria-current','true'); passed=false; } else a.removeAttribute('aria-current');
      a.classList.toggle('done', passed && !on && cur!==null);
    });
    if(wide.matches && cur){ var a=links[cur], r=a.getBoundingClientRect(), tr=toc.getBoundingClientRect();
      if(r.top<tr.top+60 || r.bottom>tr.bottom-20) a.scrollIntoView({block:'nearest'}); }
  }
  var tick=false;
  window.addEventListener('scroll',function(){ if(!tick){ tick=true; requestAnimationFrame(function(){ spy(); tick=false; }); } },{passive:true});
  window.addEventListener('resize',spy); spy();
})();

/* ---------- tap a finished illustration to play it again ---------- */
(function(){
  document.querySelectorAll('#manual, #lockAnim, #flagAnim, #flareAnim').forEach(function(el){
    var fig=el.closest('figure'); if(!fig) return;
    var hint=document.createElement('button'); hint.type='button'; hint.className='replay'; hint.textContent='↻ play again';
    fig.appendChild(hint);
    el.style.cursor='pointer';
    function replay(){
      el.classList.add('noanim'); el.classList.remove('play');
      void el.getBoundingClientRect();
      requestAnimationFrame(function(){ el.classList.remove('noanim'); requestAnimationFrame(function(){ el.classList.add('play'); }); });
    }
    el.addEventListener('click',replay); hint.addEventListener('click',replay);
  });
})();

/* phone: tuck the Contents button away while scrolling down, bring it back when scrolling up */
(function(){
  var btn=document.getElementById('tocBtn'); if(!btn) return; var last=window.scrollY;
  window.addEventListener('scroll',function(){
    var y=window.scrollY;
    if(y>last+8 && y>200) btn.classList.add('away'); else if(y<last-8) btn.classList.remove('away');
    last=y;
  },{passive:true});
})();
