/* ============================================================
   反馈表单
   提交走 FormSubmit（免费静态表单转发，无需自建后端）
   ============================================================ */
(function () {
  'use strict';

  /* ------------------------------------------------------------
     ⚙️ 配置：把下面换成你的完整邮箱地址即可
     形如  '2445xxxx@qq.com'
     ------------------------------------------------------------ */
  var MAILBOX = '1554990355@qq.com';

  var ENDPOINT = 'https://formsubmit.co/ajax/';

  var form = document.getElementById('fbForm');
  if (!form) return;

  var $ = function (id) { return document.getElementById(id); };
  var toolSel = $('tool'), titleEl = $('title'), detailEl = $('detail'),
      stepsEl = $('steps'), mailEl = $('mail'), msgEl = $('msg'),
      sendBtn = $('sendBtn'), fTool = $('fTool'), fSteps = $('fSteps'),
      detailLabel = $('detailLabel');

  /* ---------- 三种反馈类型 ---------- */
  var TYPES = {
    bug: {
      name: 'Bug 报告', tag: '[Bug]', showTool: true, showSteps: true,
      label: '具体发生了什么', req: true,
      ph: '打开 Snapshot 后按 Ctrl+Shift+X，十字准星闪一下就消失，托盘图标还在，必须重启程序才恢复…',
      titlePh: '按热键没反应，只有第一次能用'
    },
    feature: {
      name: '功能建议', tag: '[建议]', showTool: true, showSteps: false,
      label: '你希望它怎么做', req: true,
      ph: '截图库现在只能按时间排。希望能按标签筛选，或者能搜到标注里的文字…',
      titlePh: '截图库想按标签筛选'
    },
    idea: {
      name: '新工具想法', tag: '[想法]', showTool: false, showSteps: false,
      label: '它该解决什么问题', req: true,
      ph: '每天要在十几个文件夹之间搬文件，想要一个记住常用路径、一键跳过去的工具…',
      titlePh: '想要一个文件跳转工具'
    }
  };
  var current = 'bug';

  /* ---------- 工具下拉 ---------- */
  var opts = ['<option value="">请选择…</option>'];
  (window.TOOLS || []).forEach(function (t) {
    opts.push('<option value="' + t.id + '">' + t.name + ' — ' + t.catName + '</option>');
  });
  opts.push('<option value="other">其他 / 不确定是哪个</option>');
  toolSel.innerHTML = opts.join('');

  /* ---------- 类型切换 ---------- */
  function setType(k) {
    if (!TYPES[k]) return;
    current = k;
    var t = TYPES[k], i;
    var btns = document.querySelectorAll('.type');
    for (i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute('data-type') === k;
      btns[i].classList.toggle('on', on);
      btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    fTool.hidden = !t.showTool;
    fSteps.hidden = !t.showSteps;
    detailLabel.innerHTML = t.label + ' <u>' + (t.req ? '必填' : '选填') + '</u>';
    detailEl.placeholder = t.ph;
    titleEl.placeholder = t.titlePh;
  }

  document.querySelectorAll('.type').forEach(function (b) {
    b.addEventListener('click', function () { setType(b.getAttribute('data-type')); hideMsg(); });
  });

  /* ---------- 从链接参数预填（详情页“报告 Bug”按钮带 ?tool=xxx&type=bug） ---------- */
  try {
    var qs = new URLSearchParams(location.search);
    var pt = qs.get('type');
    if (pt && TYPES[pt]) setType(pt);
    var pTool = qs.get('tool');
    if (pTool) {
      toolSel.value = pTool;
      if (toolSel.value !== pTool) toolSel.value = 'other';
    }
  } catch (e) { /* 老浏览器忽略 */ }
  setType(current);

  /* ---------- 提示 ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function hideMsg() { msgEl.className = 'msg'; msgEl.innerHTML = ''; }
  function showMsg(kind, head, body) {
    msgEl.className = 'msg on msg--' + kind;
    msgEl.innerHTML = '<b>' + head + '</b>' + body;
    if (msgEl.scrollIntoView) msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ---------- 提交 ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideMsg();

    var t = TYPES[current];
    var title = titleEl.value.trim();
    var detail = detailEl.value.trim();
    var mail = mailEl.value.trim();
    var toolId = toolSel.value;
    var toolName = '';

    if (t.showTool) {
      if (!toolId) { showMsg('err', '还差一个工具。', '选一下是哪个工具出的问题，或者选“其他 / 不确定”。'); toolSel.focus(); return; }
      if (toolId === 'other') { toolName = '其他 / 不确定'; }
      else {
        (window.TOOLS || []).forEach(function (x) { if (x.id === toolId) toolName = x.name; });
        if (!toolName) toolName = toolId;
      }
    }
    if (!title) { showMsg('err', '还差一句概括。', '一句话说清问题，我才能快速定位。'); titleEl.focus(); return; }
    if (!detail) { showMsg('err', '还差详细描述。', '多写两句当时的情况、你期待什么结果。'); detailEl.focus(); return; }
    if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      showMsg('err', '邮箱格式不太对。', '要么写对，要么留空——不填也能发。'); mailEl.focus(); return;
    }

    if (MAILBOX.indexOf('REPLACE_ME') === 0) {
      showMsg('err', '反馈通道还没接通。', '页面已经做好了，收件邮箱还没填上。把邮箱告诉我，改一行就能用。');
      return;
    }

    var payload = {
      _subject: t.tag + (toolName ? ' ' + toolName : '') + ' — ' + title,
      _template: 'table',
      _captcha: 'false',
      '类型': t.name,
      '工具': toolName || '未指定（新工具想法）',
      '标题': title,
      '详细描述': detail
    };
    if (t.showSteps) {
      var s = stepsEl.value.trim();
      if (s) payload['复现步骤'] = s;
    }
    if (mail) payload['联系邮箱'] = mail;
    payload['页面'] = location.href;
    payload['时间'] = new Date().toLocaleString('zh-CN', { hour12: false });

    var old = sendBtn.innerHTML;
    sendBtn.disabled = true;
    sendBtn.textContent = '发送中…';

    fetch(ENDPOINT + MAILBOX, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (d) {
        var info = String(d.message || '');
        if (String(d.success) === 'true') {
          form.reset();
          setType(current);
          showMsg('ok', '收到了。',
            '已经进邮箱了。' + (mail
              ? '有结果我直接回 <b style="display:inline;font-family:var(--mono);font-size:.8rem">' + esc(mail) + '</b>。'
              : '没留邮箱的话，我修好了你只能自己来看。'));
          return;
        }
        if (/activat/i.test(info)) {
          showMsg('err', '通道还没激活。',
            '收件邮箱刚收到一封激活邮件（可能在垃圾箱），点其中的 <b style="display:inline">Activate Form</b> 链接即可。激活只做一次，之后所有反馈都会正常转进来。');
          return;
        }
        showMsg('err', '没发出去。',
          '第三方服务返回：' + esc(info || '无响应') + '。也可以直接把内容发到 <a href="mailto:' + MAILBOX +
          '?subject=' + encodeURIComponent(payload._subject) + '">' + esc(MAILBOX) + '</a>。');
      })
      .catch(function () {
        showMsg('err', '没发出去。',
          '网络或第三方服务的问题。也可以直接把内容发到 <a href="mailto:' + MAILBOX +
          '?subject=' + encodeURIComponent(payload._subject) + '">' + esc(MAILBOX) + '</a>。');
      })
      .finally(function () {
        sendBtn.disabled = false;
        sendBtn.innerHTML = old;
      });
  });

  /* ---------- 输入时清掉错误提示 ---------- */
  [titleEl, detailEl].forEach(function (el) {
    el.addEventListener('input', function () { if (msgEl.classList.contains('msg--err')) hideMsg(); });
  });
})();
