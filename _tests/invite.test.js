// 초대 스마트 링크 계약 테스트 — `node _tests/invite.test.js`
//   (jekyll 은 _ 로 시작하는 디렉터리를 게시하지 않는다 → 이 파일은 사이트에 안 올라간다)
//
// 잠그는 것:
//  1. 안드로이드 목적지 URL 이 각 앱이 원래 공유하던 링크와 **글자 그대로 같다**(인스톨 레퍼러/AppsFlyer 귀속).
//  2. iOS 는 apps.apple.com/app/id<ID>, PC 는 자동 이동 없음.
//  3. 코드 쿼리는 영숫자 4~12자만(그 외 무시), 화면엔 textContent 로만 들어간다.
//  4. 각 페이지의 OG 메타가 정적으로 있다.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'i/invite.js'), 'utf8');

const UA = {
  android: 'Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
  androidKakao: 'Mozilla/5.0 (Linux; Android 13; SM-G991N Build/TP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0 Mobile Safari/537.36 KAKAOTALK 10.4.0',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  ipad: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  pc: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
};

// 앱이 원래 공유하던 링크(계약 원본) — 각 앱 코드에서 그대로 옮겼다.
//   돈캐드릴 apps/app_gold/lib/config.dart goldPlayInstallLink
//   캐시스텝 apps/app_cashstep/lib/referral/referral_share.dart cashstepPlayInstallLink
//   캐시드릴 CashDrill lib/core/services/appsflyer_service.dart generateReferralLink
const APPS = {
  doncadrill: {
    android: (c) => `https://play.google.com/store/apps/details?id=com.rewardfactory.gold&referrer=${c}`,
    ios: 'https://apps.apple.com/app/id6819602123',
  },
  cashstep: {
    android: (c) => `https://play.google.com/store/apps/details?id=com.rewardfactory.cashstep&referrer=${c}`,
    ios: 'https://apps.apple.com/app/id6819626251',
  },
  cashdrill: {
    android: (c) => `https://cashdrill.onelink.me/CUj4?deep_link_value=${c}&referral_code=${c}&af_sub1=${c}&pid=kakao_share`,
    ios: 'https://apps.apple.com/app/id6760348917',
  },
};

// ── 가짜 DOM: 페이지 HTML 에서 body data-* 와 id 요소만 뽑아 run() 을 돌린다 ──
function fakeDom(html) {
  const bodyTag = /<body([^>]*)>/.exec(html)[1];
  const attrs = {};
  for (const m of bodyTag.matchAll(/(data-[a-z-]+)="([^"]*)"/g)) attrs[m[1]] = m[2];
  const els = {};
  for (const m of html.matchAll(/id="([a-z-]+)"/g)) {
    els[m[1]] = {
      id: m[1], hidden: /hidden/.test(html.split(`id="${m[1]}"`)[1].split('>')[0]),
      textContent: '', href: '', className: '', listeners: {},
      set innerHTML(_) { throw new Error('innerHTML 금지'); },
      addEventListener(t, f) { this.listeners[t] = f; },
    };
  }
  return { attrs, els };
}

function runPage(key, ua, search, lang = 'ko-KR') {
  const html = fs.readFileSync(path.join(ROOT, `i/${key}.html`), 'utf8');
  const { attrs, els } = fakeDom(html);
  const nav = { replaced: null };
  const document = {
    readyState: 'complete',
    documentElement: {},
    body: { getAttribute: (n) => (n in attrs ? attrs[n] : null) },
    getElementById: (id) => els[id] || null,
  };
  const window = { location: { search, replace: (u) => { nav.replaced = u; }, href: '' } };
  const ctx = { document, window, navigator: { userAgent: ua, languages: [lang], language: lang }, URLSearchParams, setTimeout, Promise };
  ctx.this = ctx;
  vm.createContext(ctx);
  vm.runInContext(SRC, ctx);
  return { replaced: nav.replaced, els, html };
}

let n = 0;
function t(name, f) { f(); n++; console.log('ok -', name); }

for (const [key, exp] of Object.entries(APPS)) {
  t(`${key}: 안드로이드 → 원래 공유 링크와 글자 그대로 같은 URL 로 자동 이동`, () => {
    assert.strictEqual(runPage(key, UA.android, '?c=K7QF3P').replaced, exp.android('K7QF3P'));
    assert.strictEqual(runPage(key, UA.androidKakao, '?c=K7QF3P').replaced, exp.android('K7QF3P'));
  });
  t(`${key}: 소문자 코드는 대문자로(서버·앱 파서와 같은 정규화)`, () => {
    assert.strictEqual(runPage(key, UA.android, '?c=k7qf3p').replaced, exp.android('K7QF3P'));
  });
  t(`${key}: 아이폰·아이패드 → 자동 이동 없이 코드 + App Store 버튼`, () => {
    for (const ua of [UA.iphone, UA.ipad]) {
      const r = runPage(key, ua, '?c=TEST1');
      assert.strictEqual(r.replaced, null);
      assert.strictEqual(r.els['ios-btn'].href, exp.ios);
      assert.strictEqual(r.els['ios-btn'].hidden, false);
      assert.strictEqual(r.els['play-btn'].hidden, true, 'iOS 화면엔 플레이 버튼 숨김');
      assert.strictEqual(r.els.code.textContent, 'TEST1');
      assert.strictEqual(r.els['code-card'].hidden, false);
      assert.match(r.els['ios-btn'].textContent, /코드 복사하고 App Store/);
    }
  });
  t(`${key}: PC → 두 스토어 버튼 + 코드, 자동 이동 없음`, () => {
    const r = runPage(key, UA.pc, '?c=TEST1', 'en-US');
    assert.strictEqual(r.replaced, null);
    assert.strictEqual(r.els['ios-btn'].hidden, false);
    assert.strictEqual(r.els['play-btn'].hidden, false);
    assert.strictEqual(r.els['play-btn'].href, exp.android('TEST1'));
    assert.strictEqual(r.els.code.textContent, 'TEST1');
    assert.match(r.els.how.textContent, /TEST1/);
  });
  t(`${key}: 잘못된 코드(XSS·길이)는 버린다 → 코드 없이 스토어로`, () => {
    for (const q of ['?c=%3Cscript%3Ealert(1)%3C%2Fscript%3E', '?c="><img', '?c=AB', '?c=ABCDEFGHIJKLM', '?c=AB-12', '']) {
      const r = runPage(key, UA.pc, q);
      assert.strictEqual(r.els.code.textContent, '');
      assert.strictEqual(r.els['code-card'].hidden, true);
      assert.ok(!/[<>"]/.test(r.els['play-btn'].href));
      const a = runPage(key, UA.android, q).replaced;
      assert.ok(!/referrer=|deep_link_value=/.test(a), a);
      assert.ok(a.startsWith('https://play.google.com/store/apps/details?id='), a);
    }
  });
  t(`${key}: OG 메타가 정적으로 있다(1200x630 이미지 파일 포함)`, () => {
    const html = fs.readFileSync(path.join(ROOT, `i/${key}.html`), 'utf8');
    for (const p of ['og:title', 'og:description', 'og:image', 'og:url']) assert.match(html, new RegExp(`property="${p}" content="[^"]+"`));
    assert.match(html, /name="twitter:card" content="summary_large_image"/);
    assert.match(html, new RegExp(`og:image" content="https://gold-step.kr/i/og_${key}.png"`));
    const png = fs.readFileSync(path.join(ROOT, `i/og_${key}.png`));
    assert.strictEqual(png.readUInt32BE(16), 1200);
    assert.strictEqual(png.readUInt32BE(20), 630);
    // 공개 페이지 — 보상·현금 약속, 외부 스크립트 금지
    assert.ok(!/캐시를 받|원석을 받|\$\d|현금|cash reward|earn/i.test(html.replace(/<!--[\s\S]*?-->/g, '').replace(/CashDrill|CashStep|캐시드릴|캐시스텝/g, '')));
    assert.ok(!/<script[^>]+src="https?:/.test(html));
  });
}

console.log(`\n${n} passed`);
