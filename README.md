# 🎄 골드스텝 크리스마스 룰렛 이벤트

## 📁 폴더 구조

```
christmas-roulette/
├── index.html          # 메인 페이지
├── style.css           # 스타일
├── script.js           # 룰렛 로직
├── README.md           # 이 파일
└── images/             # 상품 이미지 폴더 (직접 추가!)
    ├── starbucks.png   # 스타벅스 이미지
    ├── cu.png          # CU 상품권 이미지
    ├── ramen.png       # 진라면 이미지
    ├── coffee.png      # 커피 이미지
    └── point.png       # 포인트 아이콘 (선택)
```

---

## 🖼️ 이미지 추가하기

1. `images` 폴더 생성
2. 상품 이미지 추가 (권장 크기: 100x100px, PNG)
3. 파일명 맞추기:
   - `starbucks.png`
   - `cu.png`
   - `ramen.png`
   - `coffee.png`
   - `point.png` (포인트용, 선택)

> ⚠️ 이미지 없으면 placeholder로 대체됩니다

---

## ⚙️ 설정 변경하기

`script.js` 파일 상단의 `CONFIG` 수정:

```javascript
const CONFIG = {
  // 앱스플라이어 OneLink URL (필수!)
  ONELINK_BASE: 'https://goldstep.onelink.me/abcd',
  
  // 앱스토어 URL
  PLAYSTORE_URL: 'https://play.google.com/store/apps/details?id=com.goldstep',
  APPSTORE_URL: 'https://apps.apple.com/app/goldstep/id123456789',
  
  // 캠페인 정보
  CAMPAIGN: 'christmas_2024',
  MEDIA_SOURCE: 'web_roulette'
};
```

---

## 🎰 상품/확률 변경하기

`script.js`의 `PRIZES` 배열 수정:

```javascript
const PRIZES = [
  {
    id: 'point_50',        // 고유 ID (앱에서 파싱용)
    text: '50P',           // 룰렛에 표시될 텍스트
    points: 50,            // 지급할 포인트
    image: 'images/point.png',  // 이미지 경로
    fillStyle: '#2d2d44',  // 배경 색상
    textFillStyle: '#ffd93d',   // 글자 색상
    probability: 30        // 당첨 확률 (%)
  },
  // ... 다른 상품들
];
```

### 확률 예시
```
50P:       30%
100P:      25%
500P:      20%
진라면:    12%
커피:       8%
CU 3천원:   4%
스타벅스:   1%
-----------
합계:     100%
```

---

## 🚀 GitHub Pages 배포

### 1. GitHub 레포지토리 생성
```
레포 이름: goldstep-christmas
```

### 2. 파일 업로드
```bash
git init
git add .
git commit -m "크리스마스 룰렛 이벤트"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/goldstep-christmas.git
git push -u origin main
```

### 3. GitHub Pages 활성화
```
Settings → Pages → Source: main branch → Save
```

### 4. 접속 URL
```
https://YOUR_USERNAME.github.io/goldstep-christmas
```

---

## 📱 앱 연동 (디퍼드 딥링크)

### OneLink 파라미터

앱에서 받을 수 있는 파라미터:
```
product_id: 상품 ID (예: ramen, starbucks)
product_name: 상품명 (예: 진라면)
product_points: 포인트 (예: 1500)
```

### Flutter 예시

```dart
// AppsFlyer 딥링크 수신
appsflyerSdk.onDeepLinking((DeepLinkResult dp) {
  if (dp.deepLink != null) {
    final productId = dp.deepLink!.getStringValue("product_id");
    final points = dp.deepLink!.getStringValue("product_points");
    
    // 로컬 저장
    prefs.setString('event_product_id', productId);
    prefs.setInt('event_points', int.parse(points));
    
    // 모달 표시
    showEventModal();
  }
});
```

---

## 🎨 커스터마이징

### 색상 변경
`style.css`에서 수정:

```css
/* 메인 그라데이션 배경 */
body {
  background: linear-gradient(180deg, #0a0a0a, #1a1a2e, #16213e);
}

/* 포인터 색상 */
.roulette-pointer {
  color: #ff6b6b;
}

/* 스핀 버튼 */
.spin-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
}
```

### 이벤트 기간 변경
`index.html`에서:
```html
<li>이벤트 기간: 2024.12.1 ~ 2024.12.25</li>
```

---

## ⚠️ 주의사항

1. **이미지 필수**: `images` 폴더에 상품 이미지 추가
2. **OneLink 설정**: 앱스플라이어에서 템플릿 먼저 생성
3. **HTTPS 필수**: GitHub Pages는 자동으로 HTTPS
4. **모바일 테스트**: 실제 기기에서 테스트 권장

---

## 📞 문의

개발 관련 문의: [your-email@example.com]
