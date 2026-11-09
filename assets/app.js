/* ============================================================
   小工具集 —— 共享交互
   ============================================================ */
(function () {
  "use strict";

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 逐字入场 ---------- */
  document.querySelectorAll("[data-split]").forEach(function (line) {
    var txt = line.textContent;
    line.textContent = "";
    Array.prototype.forEach.call(txt, function (ch, i) {
      if (ch === " ") { line.appendChild(document.createTextNode("\u00A0")); return; }
      var m = document.createElement("span"); m.className = "mask";
      var s = document.createElement("span"); s.textContent = ch;
      s.style.transitionDelay = (i * 42) + "ms";
      m.appendChild(s); line.appendChild(m);
    });
  });

  /* ---------- 载入 ---------- */
  function boot() {
    var ld = document.getElementById("loader");
    if (ld) ld.classList.add("done");
    document.body.classList.add("ready");
    document.querySelectorAll(".hero__title .mask > span").forEach(function (s, i) {
      s.style.transitionDelay = (140 + i * 46) + "ms";
    });
  }
  if (document.readyState === "complete") setTimeout(boot, reduce ? 60 : 820);
  else window.addEventListener("load", function () { setTimeout(boot, reduce ? 60 : 820); });

  /* ---------- Canvas 光场 ---------- */
  var cv = document.getElementById("field");
  if (cv) {
    var ctx = cv.getContext("2d");
    var vw = 0, vh = 0, mpx = .5, mpy = .4;
    var blobs = [
      { c: [92, 112, 168], x: .16, y: .20, r: .80, sp: .000075, amp: .20, ph: 0.0, dp: .55 },
      { c: [176, 132, 86], x: .80, y: .26, r: .62, sp: .000095, amp: .17, ph: 2.2, dp: .85 },
      { c: [54, 54, 70],   x: .50, y: .88, r: .90, sp: .000058, amp: .18, ph: 4.4, dp: .35 },
      { c: [132, 96, 150], x: .30, y: .72, r: .50, sp: .000110, amp: .14, ph: 1.1, dp: .70 }
    ];
    var resizeCv = function () {
      var dpr = Math.min(devicePixelRatio || 1, 2);
      vw = innerWidth; vh = innerHeight;
      cv.width = vw * dpr; cv.height = vh * dpr;
      cv.style.width = vw + "px"; cv.style.height = vh + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCv(); addEventListener("resize", resizeCv);

    var t0 = performance.now();
    var drawField = function (now) {
      var t = now - t0;
      ctx.clearRect(0, 0, vw, vh);
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        var cx2 = (b.x + Math.cos(t * b.sp + b.ph) * b.amp) * vw + (mpx - .5) * 120 * b.dp;
        var cy2 = (b.y + Math.sin(t * b.sp * 1.27 + b.ph) * b.amp) * vh + (mpy - .5) * 90 * b.dp;
        var R = b.r * Math.max(vw, vh) * .62;
        var g = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, R);
        g.addColorStop(0, "rgba(" + b.c[0] + "," + b.c[1] + "," + b.c[2] + ",0.155)");
        g.addColorStop(.55, "rgba(" + b.c[0] + "," + b.c[1] + "," + b.c[2] + ",0.045)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, vw, vh);
      }
      requestAnimationFrame(drawField);
    };
    if (!reduce) requestAnimationFrame(drawField);
  }

  /* ---------- 光标 ---------- */
  var cur = document.getElementById("cur"), dotEl = document.getElementById("curdot");
  if (cur && dotEl && matchMedia("(hover:hover)").matches) {
    var tx = innerWidth / 2, ty = innerHeight / 2, lx = tx, ly = ty;
    addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      dotEl.style.transform = "translate(" + tx + "px," + ty + "px)";
      document.documentElement.style.setProperty("--mx", (e.clientX / innerWidth * 100) + "%");
      document.documentElement.style.setProperty("--my", (e.clientY / innerHeight * 100) + "%");
      mpx = e.clientX / innerWidth; mpy = e.clientY / innerHeight;
    }, { passive: true });
    (function loop() {
      lx += (tx - lx) * .16; ly += (ty - ly) * .16;
      cur.style.transform = "translate(" + lx + "px," + ly + "px)";
      requestAnimationFrame(loop);
    })();
    var bindHover = function () {
      document.querySelectorAll("a,button,.frame,.plate,.strip figure,.tool").forEach(function (el) {
        if (el.__hb) return; el.__hb = true;
        el.addEventListener("mouseenter", function () { document.body.classList.add("hovering"); });
        el.addEventListener("mouseleave", function () { document.body.classList.remove("hovering"); });
      });
    };
    bindHover();
    window.__bindHover = bindHover;
  }

  /* ---------- 磁吸按钮 ---------- */
  document.querySelectorAll("[data-magnet]").forEach(function (btn) {
    btn.addEventListener("mousemove", function (e) {
      var r = btn.getBoundingClientRect();
      var dx = (e.clientX - r.left - r.width / 2) / r.width;
      var dy = (e.clientY - r.top - r.height / 2) / r.height;
      btn.style.transform = "translate(" + (dx * 12) + "px," + (dy * 8) + "px)";
    });
    btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
  });

  /* ---------- 渐显 ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  var observe = function (root) {
    (root || document).querySelectorAll(".rv:not(.in)").forEach(function (el) { io.observe(el); });
  };
  observe();

  /* ---------- 导航 / 进度 ---------- */
  var nav = document.getElementById("nav"), prog = document.getElementById("prog");
  var ticking = false;
  var clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };

  var pinEl = document.getElementById("pin");
  var stageInner = document.getElementById("stageInner");
  var stepEls = [].slice.call(document.querySelectorAll("#steps .step"));
  var stripEl = document.getElementById("strip");
  var parallaxEls = [].slice.call(document.querySelectorAll("[data-parallax]"));

  function onScroll() {
    var y = scrollY;
    var h = document.documentElement.scrollHeight - innerHeight;
    if (prog) prog.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
    if (nav) nav.classList.toggle("shrink", y > 60);

    if (pinEl && stageInner && innerWidth > 900) {
      var r = pinEl.getBoundingClientRect();
      var total = pinEl.offsetHeight - innerHeight;
      var p = clamp(-r.top / (total || 1), 0, 1);
      var e = easeOut(p);
      stageInner.style.transform = "rotateX(" + (26 * (1 - e)).toFixed(2) + "deg) scale(" + (.9 + .1 * e).toFixed(3) + ")";
      var active = Math.min(stepEls.length - 1, Math.floor(p * 4.15));
      for (var i = 0; i < stepEls.length; i++) stepEls[i].classList.toggle("on", i === active);
    }

    if (stripEl) {
      var sr = stripEl.parentElement.getBoundingClientRect();
      var sp = clamp((innerHeight - sr.top) / (innerHeight + sr.height), 0, 1);
      stripEl.style.transform = "translate3d(" + (-sp * (stripEl.scrollWidth - innerWidth) * .58).toFixed(1) + "px,0,0)";
    }

    parallaxEls.forEach(function (el) {
      var rr = el.getBoundingClientRect();
      var center = rr.top + rr.height / 2 - innerHeight / 2;
      el.style.transform = "translate3d(0," + (-center * (parseFloat(el.dataset.parallax) || 0)).toFixed(1) + "px,0)";
    });

    ticking = false;
  }
  addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- 跑马灯复制 ---------- */
  var tk = document.getElementById("ticker");
  if (tk) tk.innerHTML += tk.innerHTML;

  /* ---------- 移动端菜单 ---------- */
  var burger = document.getElementById("burger"), mmenu = document.getElementById("mmenu");
  if (burger && mmenu) {
    burger.addEventListener("click", function () {
      var open = mmenu.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      mmenu.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.style.overflow = open ? "hidden" : "";
    });
    mmenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { burger.click(); });
    });
  }

  /* ============================================================
     工具目录（仅首页）
     ============================================================ */
  var grid = document.getElementById("tools");
  if (!grid || !window.TOOLS) return;

  var ICONS = {
    capture: '<svg viewBox="0 0 24 24"><path d="M6 3v3M3 6h3M18 3v3M21 6h-3M6 21v-3M3 18h3M18 21v-3M21 18h-3"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>',
    productivity: '<svg viewBox="0 0 24 24"><path d="M4 6h9M4 12h6M4 18h9"/><path d="m16 15 2 2 4-4"/></svg>',
    system: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>'
  };

  var state = { cat: "all", q: "" };
  var chipsEl = document.getElementById("chips");
  var emptyEl = document.getElementById("empty");
  var countEl = document.getElementById("count");
  var finder = document.getElementById("q");

  var CATS = [
    { key: "all", label: "全部" },
    { key: "capture", label: "截图与标注" },
    { key: "productivity", label: "效率" },
    { key: "system", label: "桌面与系统" }
  ];

  function countOf(key) {
    if (key === "all") return window.TOOLS.length;
    return window.TOOLS.filter(function (t) { return t.cat === key; }).length;
  }

  function renderChips() {
    chipsEl.innerHTML = "";
    CATS.forEach(function (c) {
      var n = countOf(c.key);
      if (n === 0 && c.key !== "all") return;
      var b = document.createElement("button");
      b.className = "chip" + (state.cat === c.key ? " on" : "");
      b.dataset.cat = c.key;
      b.innerHTML = c.label + " <i>" + String(n).padStart(2, "0") + "</i>";
      b.addEventListener("click", function () {
        state.cat = c.key;
        renderChips(); render();
      });
      chipsEl.appendChild(b);
    });
  }

  function match(t) {
    if (state.cat !== "all" && t.cat !== state.cat) return false;
    if (!state.q) return true;
    var hay = (t.name + " " + t.desc + " " + t.tags.join(" ") + " " + t.catName).toLowerCase();
    return hay.indexOf(state.q) > -1;
  }

  function cardHTML(t) {
    var soon = t.status === "dev";
    var tag = soon ? "span" : "a";
    var href = soon ? "" : ' href="' + t.url + '"';
    return '<' + tag + ' class="tool"' + href + ' data-cat="' + t.cat + '">' +
      '<div class="tool__top"><span class="tool__no">' + t.no + '</span>' +
        '<span class="tool__st' + (soon ? " tool__st--dev" : "") + '"><i></i>' + (soon ? "开发中" : "可用") + '</span>' +
      '</div>' +
      '<div class="tool__icon">' + (ICONS[t.cat] || ICONS.system) + '</div>' +
      '<div class="tool__name">' + t.name + '</div>' +
      '<div class="tool__desc">' + t.desc + '</div>' +
      '<div class="tool__foot"><span>' + t.meta + '</span>' +
        (soon ? '' : '<span class="tool__go"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg></span>') +
      '</div>' +
    '</' + tag + '>';
  }

  var SOON_CARD =
    '<div class="tool tool--soon" aria-hidden="true">' +
      '<div class="soon">NEXT</div>' +
      '<p>下一个工具还在白板上。</p>' +
      '<span>工具会一直加，入口不会变。</span>' +
    '</div>';

  function render() {
    var list = window.TOOLS.filter(match);
    var html = list.map(cardHTML).join("");
    var showSoon = state.cat === "all" && !state.q;
    if (showSoon) html += SOON_CARD;

    grid.innerHTML = html;
    if (emptyEl) emptyEl.classList.toggle("on", list.length === 0);
    if (countEl) countEl.textContent = String(list.length).padStart(2, "0");

    document.querySelectorAll(".tool").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--cx", (e.clientX - r.left) + "px");
        el.style.setProperty("--cy", (e.clientY - r.top) + "px");
      });
    });
    if (window.__bindHover) window.__bindHover();
  }

  if (finder) {
    finder.addEventListener("input", function () {
      state.q = finder.value.trim().toLowerCase();
      render();
    });
  }

  /* “/” 聚焦搜索 */
  addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    var typing = tag === "input" || tag === "textarea";
    if (e.key === "/" && !typing) { e.preventDefault(); if (finder) finder.focus(); }
    if (e.key === "Escape" && typing) { finder.value = ""; state.q = ""; render(); finder.blur(); }
  });

  renderChips();
  render();
})();
