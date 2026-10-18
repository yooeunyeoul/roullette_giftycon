// 친구 초대 스마트 링크(2026-10-19) — gold-step.kr/i/<app>?c=<CODE>
//
//  · 안드로이드 → 앱이 원래 공유하던 링크와 **글자 그대로 같은** URL 로 바로 이동(인스톨 레퍼러 자동 귀속 유지)
//      돈캐드릴·캐시스텝: https://play.google.com/store/apps/details?id=<패키지>&referrer=<CODE>
//      캐시드릴:          https://cashdrill.onelink.me/CUj4?deep_link_value=<CODE>&referral_code=<CODE>&af_sub1=<CODE>&pid=kakao_share
//    ⚠️ 형식 변경 금지 — 앱 쪽 install_referrer_service / AppsFlyer 파서와의 계약이다(_tests/invite.test.js 가 잠근다).
//  · 아이폰/아이패드 → 코드 크게 + "코드 복사하고 App Store 열기"(iOS 엔 인스톨 레퍼러가 없어 코드를 직접 넣어야 한다)
//  · 그 외(PC) → 두 스토어 버튼 + 코드
//
//  · 쿼리 c 는 영숫자 4~12자만 받는다(그 외는 무시). 화면 출력은 textContent 만 쓴다(innerHTML 금지).
//  · 분석·추적 스크립트 없음. 외부 요청 없음.
(function (root) {
  'use strict';

  var CODE_RE = /^[A-Za-z0-9]{4,12}$/;

  function normalizeCode(raw) {
    if (typeof raw !== 'string' || !CODE_RE.test(raw)) return null;
    return raw.toUpperCase();
  }

  function detectPlatform(ua) {
    ua = String(ua || '');
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    if (/Android/i.test(ua)) return 'android';
    return 'other';
  }

  /// 안드로이드 목적지 — cfg.android: 'play' | 'onelink'
  function androidUrl(cfg, code) {
    if (cfg.android === 'onelink') {
      if (!code) return 'https://play.google.com/store/apps/details?id=' + cfg.pkg;
      return cfg.onelink +
        '?deep_link_value=' + code +
        '&referral_code=' + code +
        '&af_sub1=' + code +
        '&pid=kakao_share';
    }
    return 'https://play.google.com/store/apps/details?id=' + cfg.pkg +
      (code ? '&referrer=' + code : '');
  }

  function iosUrl(cfg) {
    return 'https://apps.apple.com/app/id' + cfg.iosId;
  }

  /// 순수 판정(테스트용): { platform, code, redirect(자동 이동 URL 또는 null), android, ios }
  function resolve(cfg, ua, search) {
    var code = null;
    try {
      code = normalizeCode(new URLSearchParams(search || '').get('c'));
    } catch (e) { code = null; }
    var platform = detectPlatform(ua);
    var a = androidUrl(cfg, code);
    var i = iosUrl(cfg);
    return {
      platform: platform,
      code: code,
      redirect: platform === 'android' ? a : null,
      android: a,
      ios: i,
    };
  }

  var COPY = {
    ko: {
      title: function (n) { return n + ' 친구 초대'; },
      codeLabel: '초대 코드',
      copy: '코드 복사',
      copied: '코드를 복사했어요',
      copyFail: '복사가 안 되면 코드를 길게 눌러 복사해 주세요.',
      copyAndOpen: '코드 복사하고 App Store 열기',
      appStore: 'App Store 에서 받기',
      play: 'Google Play 에서 받기',
      moving: 'Google Play 로 이동하고 있어요…',
      howTo: function (c) { return '설치한 뒤 앱의 친구 초대 화면에서 초대 코드 ' + c + ' 를 입력해 주세요.'; },
      howToNoCode: '설치한 뒤 앱의 친구 초대 화면에서 친구의 초대 코드를 입력해 주세요.',
    },
    en: {
      title: function (n) { return 'Join me on ' + n; },
      codeLabel: 'Invite code',
      copy: 'Copy code',
      copied: 'Code copied',
      copyFail: "If copying didn't work, press and hold the code to copy it.",
      copyAndOpen: 'Copy code & open App Store',
      appStore: 'Download on the App Store',
      play: 'Get it on Google Play',
      moving: 'Opening Google Play…',
      howTo: function (c) { return 'After installing, enter invite code ' + c + ' on the invite screen in the app.'; },
      howToNoCode: "After installing, enter your friend's invite code on the invite screen in the app.",
    },
  };

  function pickLang(nav) {
    var langs = (nav && (nav.languages || [nav.language])) || [];
    var first = String(langs[0] || '').toLowerCase();
    return first === 'ko' || first.indexOf('ko-') === 0 ? 'ko' : 'en';
  }

  function copyText(text, el) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacy(el); });
    }
    return Promise.resolve(legacy(el));
  }

  function legacy(el) {
    try {
      var r = document.createRange();
      r.selectNodeContents(el);
      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
      return !!(document.execCommand && document.execCommand('copy'));
    } catch (e) { return false; }
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
    return el;
  }

  function show(id, on) {
    var el = document.getElementById(id);
    if (el) el.hidden = !on;
    return el;
  }

  function run() {
    var body = document.body;
    var cfg = {
      pkg: body.getAttribute('data-pkg'),
      iosId: body.getAttribute('data-ios-id'),
      android: body.getAttribute('data-android') || 'play',
      onelink: body.getAttribute('data-onelink') || '',
    };
    var r = resolve(cfg, navigator.userAgent, window.location.search);

    // 안드로이드는 바로 이동 — 실패(인앱 브라우저 차단 등)해도 아래 버튼이 남는다.
    if (r.redirect) {
      try { window.location.replace(r.redirect); } catch (e) { /* 버튼으로 진행 */ }
    }

    var lang = pickLang(navigator);
    var t = COPY[lang];
    var name = body.getAttribute(lang === 'ko' ? 'data-name-ko' : 'data-name-en');
    document.documentElement.lang = lang;
    setText('title', t.title(name));
    setText('code-label', t.codeLabel);
    setText('how', r.code ? t.howTo(r.code) : t.howToNoCode);

    var codeEl = document.getElementById('code');
    var msg = document.getElementById('msg');
    if (r.code) {
      codeEl.textContent = r.code;
      show('code-card', true);
    } else {
      show('code-card', false);
    }

    var iosBtn = document.getElementById('ios-btn');
    var playBtn = document.getElementById('play-btn');
    var copyBtn = document.getElementById('copy-btn');
    iosBtn.href = r.ios;
    playBtn.href = r.android;
    iosBtn.textContent = r.platform === 'ios' && r.code ? t.copyAndOpen : t.appStore;
    playBtn.textContent = t.play;
    copyBtn.textContent = t.copy;
    show('ios-btn', r.platform !== 'android');
    show('play-btn', r.platform !== 'ios');
    copyBtn.hidden = !r.code;
    if (r.platform === 'ios') iosBtn.className = 'btn primary';
    if (r.platform === 'android') {
      playBtn.className = 'btn primary';
      setText('moving', t.moving);
    }

    function onCopied(ok) {
      msg.textContent = ok ? t.copied : t.copyFail;
    }
    copyBtn.addEventListener('click', function () {
      copyText(r.code, codeEl).then(onCopied);
    });
    // 아이폰: 버튼 한 번에 코드 복사 + App Store. 복사 결과와 무관하게 이동한다(코드는 공유 문구에도 있다).
    if (r.platform === 'ios' && r.code) {
      iosBtn.addEventListener('click', function (ev) {
        ev.preventDefault();
        copyText(r.code, codeEl).then(function (ok) {
          onCopied(ok);
          setTimeout(function () { window.location.href = r.ios; }, ok ? 300 : 1500);
        });
      });
    }
  }

  var api = { normalizeCode: normalizeCode, detectPlatform: detectPlatform, resolve: resolve };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.GoldStepInvite = api;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
  }
})(this);
