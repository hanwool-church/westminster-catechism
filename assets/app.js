(function(){
"use strict";
var DATA, STATE, NOTES, Q = {}, L, PARTS, TOTAL;
var app = document.getElementById("app");
var canManage = false;
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function parseDate(s){ var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2]-1, +m[3]) : null; }
function dateOf(d){ var s = parseDate(STATE.startDate); if(!s) return null; var x = new Date(s.getFullYear(), s.getMonth(), s.getDate() + d - 1); return x; }
var WD = "일월화수목금토";
function fmt(x){ return (x.getMonth()+1) + "월 " + x.getDate() + "일 (" + WD[x.getDay()] + ")"; }
function fmtShort(x){ return (x.getMonth()+1) + "/" + x.getDate(); }
function todayDay(){ var s = parseDate(STATE.startDate); if(!s) return null; var t = new Date(); t = new Date(t.getFullYear(), t.getMonth(), t.getDate()); return Math.round((t - s) / 86400000) + 1; }
function qRange(l){ var a = l.qs[0], b = l.qs[l.qs.length-1]; return a === b ? "제" + a + "문" : "제" + a + "~" + b + "문"; }
function partOf(d){ for(var i=0;i<PARTS.length;i++){ if(d >= PARTS[i].from && d <= PARTS[i].to) return PARTS[i]; } return null; }
function linkOf(d){ return STATE.links[d] || {}; }
function safeUrl(u){ return /^https?:\/\/\S+$/i.test(u || "") ? u : ""; }
function ytSearch(l){ return "https://www.youtube.com/results?search_query=" + encodeURIComponent("소요리문답 " + qRange(l)); }

function topbar(showBrand){
  var a = "";
  if(safeUrl(STATE.chatUrl)) a += '<a class="btn small ghost" href="' + esc(STATE.chatUrl) + '" target="_blank" rel="noopener">채팅방 열기</a>';
  if(NOTES.length) a += '<a class="btn small ghost" href="#notes">강의 이야기</a>';
  if(canManage) a += '<a class="btn small ghost" href="#manage">관리</a>';
  return '<div class="top">' + (showBrand ? '<a class="brand" href="#">소요리문답 60일</a>' : '<span></span>') + '<div class="actions">' + a + '</div></div>';
}

function renderHome(){
  var td = todayDay();
  var hero;
  if(td == null){
    hero = '<p class="today-label">시작일이 아직 정해지지 않았어요</p><h2 class="today-title">1일째부터 차례로 열어 보세요</h2><p class="today-q">' + esc(L[0].k) + '</p><a class="btn" href="#day-1">1일째 열기</a>';
  } else if(td < 1){
    hero = '<p class="today-label">' + (1 - td) + '일 뒤에 시작해요</p><h2 class="today-title">' + fmt(dateOf(1)) + ' 시작</h2><p class="today-q">' + esc(L[0].k) + '</p><a class="btn" href="#day-1">1일째 미리 보기</a>';
  } else if(td > TOTAL){
    hero = '<p class="today-label">60일 과정이 끝났어요</p><h2 class="today-title">끝까지 함께해 줘서 고마워요</h2><p class="today-q">빠진 날이 있다면 아래에서 골라 이어서 보세요.</p>';
  } else {
    var l = L[td-1];
    hero = '<p class="today-label">오늘은 ' + td + '일째, ' + qRange(l) + '</p><h2 class="today-title">' + esc(l.t) + '</h2><p class="today-q">' + esc(l.k) + '</p><a class="btn" href="#day-' + td + '">오늘 문답 열기</a>';
  }
  var cells = "";
  L.forEach(function(l){
    var p = partOf(l.d), cls = "cell";
    if(l.d === td) cls += " is-today";
    if(p && p.from === l.d && l.d % 10 !== 1) cls += " part-start";
    cells += '<a class="' + cls + '" href="#day-' + l.d + '" aria-label="' + l.d + '일째 ' + esc(l.t) + '">' + l.d + '</a>';
  });
  var parts = "";
  PARTS.forEach(function(p){
    var rows = "";
    for(var d = p.from; d <= p.to; d++){
      var l = L[d-1], dt = dateOf(d);
      rows += '<a class="row" href="#day-' + d + '"><span class="n">' + d + '</span><span><span class="t">' + esc(l.t) + '</span><span class="m">' + qRange(l) + (dt ? " / " + fmt(dt) : "") + '</span></span><span class="s">' + (safeUrl(linkOf(d).url) ? "강의 있음" : "") + '</span></a>';
    }
    parts += '<section class="part"><h2>' + esc(p.name) + '</h2><p class="range">' + p.from + '~' + p.to + '일째, ' + esc(p.qr) + '</p>' + rows + '</section>';
  });
  app.innerHTML = '<div class="wrap">' + topbar(false) +
    '<header class="masthead"><h1>소요리문답<br>60일</h1><p>하루 한 편, 유튜브 강의를 보고 웨스트민스터 소요리문답을 읽은 뒤 감동 받은 부분을 채팅방에 나눠요.</p></header>' +
    '<section class="today">' + hero + '</section>' + notesCard() +
    '<nav class="grid" aria-label="60일 진도">' + cells + '</nav>' +
    '<div class="legend"><span><i class="dot today"></i>오늘</span><span>노란 선은 새 주제의 시작</span></div>' +
    parts +
    '<footer>본문은 대한예수교장로회(합동) 교단에서 사용하는 소요리문답 번역을 따랐습니다.</footer></div>';
}

function renderDay(d){
  var l = L[d-1]; if(!l){ location.hash = ""; return; }
  var p = partOf(d), dt = dateOf(d), lk = linkOf(d), url = safeUrl(lk.url);
  var video = url
    ? '<p class="vt">' + esc(lk.title || "오늘의 강의") + '</p><a class="btn" href="' + esc(url) + '" target="_blank" rel="noopener">유튜브에서 강의 보기</a>'
    : '<p>아직 강의 링크가 등록되지 않았어요. 아래에서 이 문답 강의를 찾아볼 수 있어요.</p><a class="btn ghost" href="' + ytSearch(l) + '" target="_blank" rel="noopener">유튜브에서 “소요리문답 ' + qRange(l) + '” 찾기</a>';
  var qa = "";
  l.qs.forEach(function(n){
    var q = Q[n];
    qa += '<article class="qa"><p class="qn">제' + n + '문</p><p class="qq">' + esc(q.q) + '</p><p class="qa-a"><b>답.</b> ' + esc(q.a) + '</p>' + (q.r ? '<p class="refs">함께 볼 말씀: ' + esc(q.r) + '</p>' : "") + '</article>';
  });
  app.innerHTML = '<div class="wrap">' + topbar(true) +
    '<div class="crumbs"><a class="btn small ghost" href="#">전체 일정</a></div>' +
    '<header class="lesson-head"><p class="meta">' + d + '일째' + (dt ? ", " + fmt(dt) : "") + (p ? " / " + esc(p.name) : "") + '</p><h1>' + esc(l.t) + '</h1><p class="key">' + esc(l.k) + '</p></header>' +
    '<section class="step"><h2>오늘의 강의</h2><div class="video">' + video + dayNotes(d) + '</div></section>' +
    '<section class="step"><h2>오늘의 문답</h2>' + qa + '</section>' +
    '<div class="btns" style="margin-top:24px"><button class="btn ghost" data-act="announce">오늘 안내 글 복사</button></div>' +
    '<nav class="pager">' + (d > 1 ? '<a class="btn small ghost" href="#day-' + (d-1) + '">' + (d-1) + '일째</a>' : '<span></span>') + (d < TOTAL ? '<a class="btn small ghost" href="#day-' + (d+1) + '">' + (d+1) + '일째</a>' : '<span></span>') + '</nav></div>';

  app.querySelector('[data-act="announce"]').addEventListener("click", function(){ copyText(announceText(l)); });
}


function noteById(id){ for(var i=0;i<NOTES.length;i++){ if(NOTES[i].id === id) return NOTES[i]; } return null; }
function notesForDay(d){ return NOTES.filter(function(n){ return (n.days || []).indexOf(d) >= 0; }); }
function noteRow(n){
  var meta = n.label || "";
  if(n.days && n.days.length) meta += (meta ? " / " : "") + n.days.map(function(d){ return d + "일째"; }).join(", ");
  return '<a class="row" href="#note-' + esc(n.id) + '"><span class="n">' + (n.days && n.days.length ? n.days[0] : "◆") + '</span><span><span class="t">' + esc(n.title) + '</span><span class="m">' + esc(meta) + '</span></span><span class="s">읽기</span></a>';
}
function notesCard(){
  if(!NOTES.length) return "";
  var list = NOTES.slice(-3).reverse().map(noteRow).join("");
  return '<section class="part notes-home"><h2>강의 이야기</h2><p class="range">강의에서 나눈 이야기를 짧게 담았어요. 계속 이어집니다.</p>' + list + (NOTES.length > 3 ? '<p style="margin-top:12px"><a class="btn small ghost" href="#notes">전체 ' + NOTES.length + '편 보기</a></p>' : '') + '</section>';
}
function dayNotes(d){
  var ns = notesForDay(d); if(!ns.length) return "";
  return '<div class="btns" style="margin-top:12px">' + ns.map(function(n){ return '<a class="btn ghost" href="#note-' + esc(n.id) + '">강의 이야기 보기</a>'; }).join("") + '</div>';
}
function renderNotes(){
  app.innerHTML = '<div class="wrap">' + topbar(true) + '<div class="crumbs"><a class="btn small ghost" href="#">전체 일정</a></div>' +
    '<header class="lesson-head"><h1>강의 이야기</h1><p class="meta">' + NOTES.length + '편</p></header>' +
    '<section class="part" style="margin-top:20px">' + NOTES.map(noteRow).join("") + '</section></div>';
}
function renderNote(id){
  var n = noteById(id); if(!n){ location.hash = "notes"; return; }
  var html = "";
  (n.sections || []).forEach(function(sec){
    html += '<section class="note-sec"><h2>' + esc(sec.h) + '</h2>';
    (sec.p || []).forEach(function(p){ html += '<p>' + esc(p) + '</p>'; });
    if(sec.items && sec.items.length){
      html += '<div class="terms' + '' + '">';
      sec.items.forEach(function(it, i){ html += '<div class="term">' + '' + '<div><p class="tt">' + esc(it.t) + '</p><p class="td">' + esc(it.d) + '</p></div></div>'; });
      html += '</div>';
    }
    (sec.after || []).forEach(function(p){ html += '<p>' + esc(p) + '</p>'; });
    html += '</section>';
  });
  if(n.key) html += '<section class="note-sec"><h2>오늘의 한 문장</h2><blockquote class="quote"><p>' + esc(n.key.q) + '</p>' + (n.key.d ? '<span>' + esc(n.key.d) + '</span>' : '') + '</blockquote></section>';
  var vids = (n.videos || []).map(function(v){ var u = safeUrl(v.u); return u ? '<a class="vlink" href="' + esc(u) + '" target="_blank" rel="noopener">▶ ' + esc(v.t) + '</a>' : ""; }).join("");
  var dayLinks = (n.days || []).map(function(d){ return '<a class="btn small ghost" href="#day-' + d + '">' + d + '일째 문답으로</a>'; }).join("");
  app.innerHTML = '<div class="wrap">' + topbar(true) + '<div class="crumbs"><a class="btn small ghost" href="#notes">강의 이야기 목록</a></div>' +
    '<header class="lesson-head"><p class="meta">' + esc(n.label || "강의 이야기") + '</p><h1>' + esc(n.title) + '</h1>' + (n.lead ? '<p class="lead">' + esc(n.lead) + '</p>' : '') + '</header>' +
    (vids ? '<div class="video vids"><p class="vt">강의 영상</p>' + vids + '</div>' : '') +
    html +
    '<div class="btns" style="margin-top:28px"><button class="btn gold" data-act="copynote">채팅방에 공유하기</button>' + dayLinks + '</div></div>';
  app.querySelector('[data-act="copynote"]').addEventListener("click", function(){ copyText(noteText(n)); });
}
function noteText(n){
  var s = "📖 " + (n.label ? "[" + n.label + "] " : "") + n.title + "\n";
  if(n.lead) s += "\n" + n.lead + "\n";
  (n.sections || []).forEach(function(sec){
    s += "\n■ " + sec.h + "\n";
    (sec.p || []).forEach(function(p){ s += p + "\n"; });
    (sec.items || []).forEach(function(it, i){ s += "- " + it.t + ": " + it.d + "\n"; });
    (sec.after || []).forEach(function(p){ s += p + "\n"; });
  });
  if(n.key) s += "\n■ 오늘의 한 문장\n“" + n.key.q + "”\n";
  (n.videos || []).forEach(function(v, i){ if(i === 0) s += "\n🎥 강의\n"; s += v.t + " " + v.u + "\n"; });
  return s.trim();
}

function announceText(l){
  var dt = dateOf(l.d), url = safeUrl(linkOf(l.d).url);
  var s = "📖 소요리문답 60일, " + l.d + "일째" + (dt ? " (" + fmtShort(dt) + ")" : "") + "\n" + l.t + "\n\n💭 " + l.k + "\n\n🎥 오늘의 강의\n" + (url || "(강의 링크 준비 중)") + "\n\n";
  l.qs.forEach(function(n){ var q = Q[n]; s += "제" + n + "문. " + q.q + "\n답. " + q.a + "\n\n"; });
  return s + "✍️ 강의를 보고 문답을 읽은 뒤, 감동 받은 부분을 나눠 주세요!";
}

var toastTimer;
function toast(t){ var el = document.getElementById("toast"); el.textContent = t; el.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(function(){ el.classList.remove("show"); }, 2200); }
function copyText(t){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(t).then(function(){ toast("복사했어요. 채팅방에 붙여 넣으세요."); }, function(){ showCopy(t); });
  } else showCopy(t);
}
function showCopy(t){
  var m = document.createElement("div"); m.className = "modal";
  m.innerHTML = '<div class="box" role="dialog" aria-modal="true" aria-label="복사할 글"><p style="margin:0 0 10px;font-weight:600">아래 글을 전체 선택해서 복사하세요</p><textarea readonly></textarea><div class="btns" style="margin-top:12px"><button class="btn">닫기</button></div></div>';
  m.querySelector("textarea").value = t;
  document.body.appendChild(m);
  var ta = m.querySelector("textarea"); ta.focus(); ta.select();
  function close(){ m.remove(); }
  m.querySelector("button").addEventListener("click", close);
  m.addEventListener("click", function(e){ if(e.target === m) close(); });
}

function route(){
  var h = (location.hash || "").replace(/^#/, "");
  var m = /^day-(\d{1,2})$/.exec(h);
  if(m) renderDay(+m[1]);
    else if(h === "notes") renderNotes();
  else if(/^note-[a-z0-9-]+$/.test(h)) renderNote(h.slice(5));
  else renderHome();
  window.scrollTo(0, 0);
}
function getJSON(p){ return fetch(p, {cache: "no-cache"}).then(function(r){ if(!r.ok) throw new Error(p + " " + r.status); return r.json(); }); }
Promise.all([getJSON("data/catechism.json"), getJSON("data/config.json"), getJSON("data/notes.json")]).then(function(r){
  DATA = r[0]; STATE = r[1] || {}; NOTES = r[2] || [];
  STATE.links = STATE.links || {};
  DATA.qs.forEach(function(q){ Q[q.n] = q; });
  L = DATA.lessons; PARTS = DATA.parts; TOTAL = L.length;
  window.addEventListener("hashchange", route);
  route();
}).catch(function(e){
  app.innerHTML = '<div class="wrap"><div class="notice">내용을 불러오지 못했어요. 잠시 뒤 새로고침해 주세요.</div><p class="hint">관리자 참고: 파일을 더블클릭해 열면 이 화면이 나와요. GitHub Pages에 올리거나 로컬 서버(python -m http.server)로 열어 주세요.</p></div>';
  console.error(e);
});

})();
