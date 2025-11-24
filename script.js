// ========================================
// 🎄 골드스텝 크리스마스 룰렛
// ========================================

// ========================================
// 설정 (여기만 수정하세요!)
// ========================================
const CONFIG = {
  // OneLink 기본 URL (앱스플라이어에서 생성)
  ONELINK_BASE: 'https://goldstep.onelink.me/abcd',
  
  // 앱스토어 URL (OneLink 실패 시 폴백)
  PLAYSTORE_URL: 'https://play.google.com/store/apps/details?id=com.goldstep',
  APPSTORE_URL: 'https://apps.apple.com/app/goldstep/id123456789',
  
  // 이벤트 캠페인 정보
  CAMPAIGN: 'christmas_2024',
  MEDIA_SOURCE: 'web_roulette'
};

// ========================================
// 상품 설정
// ========================================
const PRIZES = [
  {
    id: 'point_50',
    text: '50P',
    points: 50,
    image: 'images/point.png',
    fillStyle: '#2d2d44',
    textFillStyle: '#ffd93d',
    probability: 30
  },
  {
    id: 'point_100',
    text: '100P',
    points: 100,
    image: 'images/point.png',
    fillStyle: '#1a1a2e',
    textFillStyle: '#fff',
    probability: 25
  },
  {
    id: 'point_500',
    text: '500P',
    points: 500,
    image: 'images/point.png',
    fillStyle: '#2d2d44',
    textFillStyle: '#ffd93d',
    probability: 20
  },
  {
    id: 'ramen',
    text: '진라면',
    points: 1500,
    image: 'images/ramen.png',
    fillStyle: '#ff6b6b',
    textFillStyle: '#fff',
    probability: 12
  },
  {
    id: 'coffee',
    text: '커피',
    points: 1800,
    image: 'images/coffee.png',
    fillStyle: '#1a1a2e',
    textFillStyle: '#fff',
    probability: 8
  },
  {
    id: 'cu',
    text: 'CU 3천원',
    points: 3000,
    image: 'images/cu.png',
    fillStyle: '#2d2d44',
    textFillStyle: '#6bcf63',
    probability: 4
  },
  {
    id: 'starbucks',
    text: '스타벅스',
    points: 4500,
    image: 'images/starbucks.png',
    fillStyle: '#00704A',
    textFillStyle: '#fff',
    probability: 1
  }
];

// ========================================
// 전역 변수
// ========================================
let wheel = null;
let isSpinning = false;
let selectedPrize = null;

// ========================================
// 초기화
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  initWheel();
  initEventListeners();
});

// ========================================
// 룰렛 초기화
// ========================================
function initWheel() {
  // Winwheel 세그먼트 생성
  const segments = PRIZES.map(prize => ({
    text: prize.text,
    fillStyle: prize.fillStyle,
    textFillStyle: prize.textFillStyle,
    textFontSize: 14,
    textFontWeight: 'bold'
  }));

  wheel = new Winwheel({
    canvasId: 'wheel',
    numSegments: segments.length,
    segments: segments,
    innerRadius: 30,
    outerRadius: 150,
    textAlignment: 'outer',
    textOrientation: 'curved',
    textMargin: 10,
    lineWidth: 2,
    strokeStyle: '#1a1a2e',
    animation: {
      type: 'spinToStop',
      duration: 5,
      spins: 8,
      callbackFinished: onSpinComplete,
      callbackSound: playTickSound,
      soundTrigger: 'segment'
    }
  });
}

// ========================================
// 이벤트 리스너
// ========================================
function initEventListeners() {
  const spinBtn = document.getElementById('spin-btn');
  spinBtn.addEventListener('click', spin);
  
  // 모달 외부 클릭 시 닫기 방지 (의도적으로 비활성화)
}

// ========================================
// 룰렛 돌리기
// ========================================
function spin() {
  if (isSpinning) return;
  
  isSpinning = true;
  const spinBtn = document.getElementById('spin-btn');
  spinBtn.disabled = true;
  spinBtn.innerHTML = '<span>...</span>';
  
  // 확률 기반 당첨 상품 결정
  selectedPrize = selectPrizeByProbability();
  
  // 해당 상품이 있는 세그먼트 인덱스 찾기
  const prizeIndex = PRIZES.findIndex(p => p.id === selectedPrize.id);
  
  // 세그먼트 각도 계산 (Winwheel은 1부터 시작)
  const segmentAngle = 360 / PRIZES.length;
  const targetAngle = (prizeIndex * segmentAngle) + (segmentAngle / 2);
  
  // 포인터가 위쪽에 있으므로 보정
  const stopAngle = 360 - targetAngle + 90;
  
  // 애니메이션 설정
  wheel.animation.stopAngle = stopAngle;
  
  // 이전 회전 리셋
  wheel.rotationAngle = 0;
  
  // 룰렛 시작
  wheel.startAnimation();
}

// ========================================
// 확률 기반 상품 선택
// ========================================
function selectPrizeByProbability() {
  const totalProbability = PRIZES.reduce((sum, p) => sum + p.probability, 0);
  let random = Math.random() * totalProbability;
  
  for (const prize of PRIZES) {
    random -= prize.probability;
    if (random <= 0) {
      return prize;
    }
  }
  
  // 폴백: 첫 번째 상품
  return PRIZES[0];
}

// ========================================
// 룰렛 완료 콜백
// ========================================
function onSpinComplete(indicatedSegment) {
  isSpinning = false;
  
  // 결과 모달 표시
  showResultModal(selectedPrize);
}

// ========================================
// 결과 모달 표시
// ========================================
function showResultModal(prize) {
  const modal = document.getElementById('result-modal');
  const resultImage = document.getElementById('result-image');
  const resultText = document.getElementById('result-text');
  const downloadBtn = document.getElementById('download-btn');
  
  // 이미지 설정 (fallback 포함)
  resultImage.src = prize.image;
  resultImage.onerror = function() {
    this.src = 'https://via.placeholder.com/80x80?text=' + encodeURIComponent(prize.text);
  };
  
  // 텍스트 설정
  if (prize.id.startsWith('point_')) {
    resultText.textContent = `${prize.points}P 당첨!`;
  } else {
    resultText.textContent = `${prize.text} 당첨!`;
  }
  
  // 다운로드 링크 생성
  const onelinkUrl = generateOneLink(prize);
  downloadBtn.href = onelinkUrl;
  downloadBtn.onclick = function(e) {
    e.preventDefault();
    redirectToStore(onelinkUrl);
  };
  
  // 모달 표시
  modal.classList.remove('hidden');
  
  // 타이머 시작
  startTimer();
}

// ========================================
// OneLink URL 생성
// ========================================
function generateOneLink(prize) {
  const params = new URLSearchParams({
    pid: CONFIG.MEDIA_SOURCE,
    c: CONFIG.CAMPAIGN,
    af_dp: `goldstep://prize?id=${prize.id}&points=${prize.points}`,
    af_web_dp: isIOS() ? CONFIG.APPSTORE_URL : CONFIG.PLAYSTORE_URL,
    product_id: prize.id,
    product_name: prize.text,
    product_points: prize.points
  });
  
  return `${CONFIG.ONELINK_BASE}?${params.toString()}`;
}

// ========================================
// 스토어 리다이렉트
// ========================================
function redirectToStore(onelinkUrl) {
  // 먼저 OneLink로 시도
  window.location.href = onelinkUrl;
  
  // 3초 후에도 페이지가 그대로면 직접 스토어로
  setTimeout(() => {
    if (isIOS()) {
      window.location.href = CONFIG.APPSTORE_URL;
    } else {
      window.location.href = CONFIG.PLAYSTORE_URL;
    }
  }, 3000);
}

// ========================================
// iOS 체크
// ========================================
function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// ========================================
// 타이머
// ========================================
function startTimer() {
  const timerEl = document.getElementById('timer');
  let hours = 23;
  let minutes = 59;
  let seconds = 59;
  
  setInterval(() => {
    seconds--;
    if (seconds < 0) {
      seconds = 59;
      minutes--;
    }
    if (minutes < 0) {
      minutes = 59;
      hours--;
    }
    if (hours < 0) {
      hours = 0;
      minutes = 0;
      seconds = 0;
    }
    
    timerEl.textContent = 
      String(hours).padStart(2, '0') + ':' + 
      String(minutes).padStart(2, '0') + ':' + 
      String(seconds).padStart(2, '0');
  }, 1000);
}

// ========================================
// 틱 사운드 (옵션)
// ========================================
function playTickSound() {
  // 사운드 파일이 있으면 재생
  // const audio = new Audio('sounds/tick.mp3');
  // audio.volume = 0.3;
  // audio.play();
}

// ========================================
// 디버그용 (개발 시 사용)
// ========================================
function debugPrize(prizeId) {
  const prize = PRIZES.find(p => p.id === prizeId);
  if (prize) {
    showResultModal(prize);
  }
}
