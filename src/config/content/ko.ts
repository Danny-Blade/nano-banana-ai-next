import type { SiteContent } from "@/config/content/types";

export const siteContentKo: SiteContent = {
  header: {
    logo: "Nano Banana AI",
    logoImage: "https://cdn.ainanobanana.io/icon.png",
    navLinks: [
      { label: "홈", href: "/" },
      { label: "대시보드", href: "/dashboard" },
      { label: "요금제", href: "/pricing" },
      { label: "탐색", href: "/explore" },
      { label: "이미지→비디오", href: "/image-to-video" },
      { label: "기록", href: "/history" },
    ],
    loginButton: "로그인",
    logoutButton: "로그아웃",
    toggleMenuAriaLabel: "메뉴 토글",
  },
  hero: {
    title: "Nano Banana AI — Gemini 2.5 Flash Image 기반 생성·편집 스튜디오",
    subtitle:
      "Google의 혁신적인 Nano Banana AI(Gemini 2.5 Flash Image)로 고급 이미지 생성과 편집을 경험하세요. Nano Banana AI에서 생성, 합성, 보정을 손쉽게 수행할 수 있습니다( Google AI Studio 대안).",
    ctaPrimary: "지금 시작하기",
    ctaSecondary: "이미지→비디오",
    ctaPrimaryHref: "/dashboard",
    ctaSecondaryHref: "/image-to-video",
  },
  editor: {
    title: "Nano Banana AI - 고급 이미지 편집기",
    subtitle:
      "강력한 Nano Banana AI 모델로 이미지를 변환·편집하세요. 간단한 프롬프트만으로 전문가급 결과를 얻을 수 있습니다.",
  },
  examples: {
    title: "예시: Nano Banana로 가능한 것들",
    resultAlt: "결과",
    afterLabel: "변경 후",
    promptUsedLabel: "사용한 프롬프트:",
    items: [
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after: "https://cdn.ainanobanana.io/nanobanana-example-after-2.jpg",
        prompt: "비키니 색을 빨간색으로 바꿔줘",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after: "https://cdn.ainanobanana.io/nanobanana-example-2-after.png",
        prompt:
          "이 애니 캐릭터를 피규어 제품 쇼케이스로 변환: 투명한 원형 받침대 위에 서 있는 PVC 피규어를 만들고, 뒤에 캐릭터 아트가 있는 제품 박스를 두며, Blender에서 3D 모델링 과정을 보여주는 모니터를 추가해줘.",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after:
          "https://cdn.ainanobanana.io/nano-banana/cad910b5-b130-4ae6-bf2c-e813d5572835.png",
        prompt: "사진을 복원하고 색을 입혀줘",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after:
          "https://cdn.ainanobanana.io/nano-banana/22a808a5-32d2-4760-812c-07eee8875426.png",
        prompt: "인물을 귀여운 치비 스타일의 손뜨개 인형으로 변환해줘",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after:
          "https://cdn.ainanobanana.io/nano-banana/c06bcfe8-b5f1-4a11-9181-21138d1b46d3.png",
        prompt: "사진을 반 고흐의 '별이 빛나는 밤' 스타일로 재해석해줘",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after:
          "https://cdn.ainanobanana.io/nano-banana/47b04301-79bb-431a-a54f-8fc88674bc3c.png",
        prompt: "머리색을 파란색으로 바꿔줘",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after:
          "https://cdn.ainanobanana.io/nano-banana/7c7f75bd-84e5-47e6-9b93-f1f2164d2b26.png",
        prompt: "사람을 레고 미니피규어로 만들고, 패키지 박스 안에 넣어줘",
      },
    ],
  },
  communityGallery: {
    title: "Nano Banana AI 커뮤니티 작품",
    subtitle: "아이디어가 현실이 되는 과정을 확인하세요 — 콘셉트부터 결과물까지 단 몇 초",
    promptLabel: "프롬프트",
    videoPromptLabel: "비디오 프롬프트",
    showcases: [
      {
        title: "Nano Banana AI 변환 파이프라인(전체)",
        prompt:
          "이 애니 캐릭터를 피규어 제품 쇼케이스로 변환: 투명한 원형 받침대 위에 서 있는 PVC 피규어를 만들고, 뒤에 캐릭터 아트가 있는 제품 박스를 두며, Blender에서 3D 모델링 과정을 보여주는 모니터를 추가해줘.",
        videoPrompt: "애니 캐릭터를 살아 움직이게: 부드럽게 미소 짓고 자연스럽게 깜빡이며 바람에 머리카락이 살짝 흔들리게",
        image: "https://cdn.ainanobanana.io/ai-poster.png",
        video: "https://image.ainanobanana.io/ai-nanobanana.mp4",
      },
      {
        title: "Nano Banana AI 사이버펑크 인물",
        prompt: "네온과 미래 요소가 있는 사이버펑크 스타일 인물 사진으로 변환",
        image:
          "https://cdn.ainanobanana.io/flux-kontext-dev/1e9de2c2-1fea-473c-a2c0-73191a02940c.png",
      },
      {
        title: "Nano Banana AI 사진 복원",
        prompt: "스크래치와 손상을 복구하고 오래된 사진을 컬러화",
        image: "https://cdn.ainanobanana.io/restore-image.png",
      },
    ],
  },
  whyChoose: {
    title: "크리에이터가 Nano Banana AI를 선택하는 이유",
    subtitle: "Flux Kontext를 뛰어넘는 속도와 정확도",
    features: [
      {
        icon: "⚡",
        title: "원샷에 가까운 결과",
        description: "자연어 편집으로 첫 시도 성공률 최대 95% — 복잡한 프롬프트가 필요 없습니다.",
      },
      {
        icon: "🚀",
        title: "번개처럼 빠른 처리",
        description: "1초 미만으로 프로급 이미지를 생성 — 기존 모델 대비 10배 빠릅니다.",
      },
      {
        icon: "👤",
        title: "얼굴 보정/복원 기술",
        description: "사실적인 정확도로 아이덴티티를 유지하며 자연스럽고 일관된 얼굴을 생성합니다.",
      },
      {
        icon: "🎭",
        title: "캐릭터 일관성 편집",
        description: "여러 번 생성해도 캐릭터 일관성을 유지 — AI 인플루언서에 최적.",
      },
      {
        icon: "🔒",
        title: "엔터프라이즈 보안",
        description: "SOC 2, GDPR, ISO 27001 준수 — 전 세계 프로 팀이 신뢰합니다.",
      },
      {
        icon: "💳",
        title: "카드 없이 시작",
        description: "즉시 시작 — 등록 장벽 없이 강력한 AI 도구에 바로 접근하세요.",
      },
    ],
  },
  pricing: {
    title: "모든 크리에이터를 위한 Nano Banana AI",
    subtitle: "취미부터 프로까지 — 매일 수백만 장을 생성하는 커뮤니티에 참여하세요.",
    selectPaymentMethod: "결제 수단 선택",
    addonsTitle: "추가 크레딧",
    plans: [
      {
        name: "베이직",
        description: "개인 및 소규모 팀",
        price: "$9.99",
        period: "/월",
        features: [
          "월 100 크레딧",
          "고품질 이미지 50장/월",
          "표준 속도",
          "기본 지원",
          "PNG 다운로드",
          "연간 결제 시 1200 크레딧(즉시 지급)",
          "상업용 라이선스 & 무제한 사용",
        ],
        highlighted: false,
      },
      {
        name: "스탠다드",
        description: "개인 및 소규모 팀",
        price: "$19.99",
        period: "/월",
        badge: "🔥가성비 최고: 50% 절약",
        features: [
          "월 500 크레딧",
          "고품질 이미지 250장/월",
          "우선 생성 큐",
          "우선 지원",
          "PNG 다운로드",
          "연간 결제 시 6000 크레딧(즉시 지급)",
          "상업용 라이선스 & 이미지 편집 도구",
        ],
        highlighted: true,
      },
      {
        name: "프로",
        description: "대규모 팀 및 기업",
        price: "$49.99",
        period: "/월",
        features: [
          "월 2000 크레딧",
          "고품질 이미지 1000장/월",
          "최고 속도",
          "전담 매니저",
          "모든 포맷 다운로드",
          "연간 결제 시 24000 크레딧(즉시 지급)",
          "상업용 라이선스 & 고급 편집 도구",
        ],
        highlighted: false,
      },
      {
        name: "연간 스페셜",
        description: "1년 동안 프리미엄 기능을 모두 포함한 무제한 사용",
        price: "$299",
        period: "/년",
        features: [
          "연간 무제한 크레딧",
          "프리미엄 기능 모두 포함",
          "우선 지원",
          "고급 AI 모델",
          "모든 포맷 다운로드",
          "상업용 라이선스 & 무제한 사용",
        ],
        highlighted: false,
      },
    ],
    addons: [
      {
        name: "소형 추가 패키지",
        description: "크레딧이 더 필요하신가요?",
        price: "$9.99",
        credits: "800 크레딧",
        features: ["일회성 구매", "800 크레딧", "구독 없음", "더 빠른 생성", "기록 영구 저장", "상업용 라이선스"],
      },
      {
        name: "대형 추가 패키지",
        description: "크레딧이 더 필요하신가요?",
        price: "$19.99",
        credits: "1600 크레딧",
        features: ["일회성 구매", "1600 크레딧", "구독 없음", "더 빠른 생성", "기록 영구 저장", "상업용 라이선스"],
      },
    ],
  },
  tweets: {
    title: "Nano Banana AI 트윗 탐색",
    subtitle: "크리에이터들의 이야기를 확인하세요",
  },
  faq: {
    title: "Nano Banana AI 자주 묻는 질문",
    items: [
      {
        question: "Nano Banana AI란 무엇인가요?",
        answer:
          "Nano Banana AI는 Google의 Gemini 2.5 Flash Image 기술로 구동되는 고급 이미지 생성·편집 플랫폼입니다. 간단한 프롬프트로 생성/편집/변환이 가능합니다.",
      },
      {
        question: "생성 속도는 얼마나 빠른가요?",
        answer:
          "최적화된 인프라로 1초 미만에 프로급 이미지를 생성합니다. 기존 AI 모델 대비 10배 빠릅니다.",
      },
      {
        question: "얼굴 보정 기술이란?",
        answer:
          "사실적인 정확도로 아이덴티티를 유지하며 얼굴을 재구성해, 더 자연스럽고 일관된 결과를 제공합니다.",
      },
      {
        question: "상업적으로 사용해도 되나요?",
        answer:
          "네! 모든 유료 플랜에는 상업적 사용 권한이 포함되어 비즈니스/마케팅 등 상업 목적에 사용할 수 있습니다.",
      },
      {
        question: "시작하려면 카드가 필요하나요?",
        answer:
          "아니요. 카드 없이도 바로 시작할 수 있으며 강력한 AI 도구에 즉시 접근 가능합니다.",
      },
      {
        question: "캐릭터 일관성이란?",
        answer:
          "다양한 포즈/장면에서도 같은 캐릭터를 유지해 생성할 수 있는 기능으로, AI 인플루언서나 브랜드 캐릭터 제작에 적합합니다.",
      },
      {
        question: "어떤 보안 인증을 받았나요?",
        answer:
          "SOC 2, GDPR, ISO 27001 준수. 기업급 보안으로 데이터와 결과물을 안전하게 보호합니다.",
      },
      {
        question: "구독은 언제든 취소할 수 있나요?",
        answer:
          "네. 언제든 취소 가능하며, 현재 결제 기간이 끝날 때까지 혜택을 이용할 수 있습니다.",
      },
    ],
  },
  imageToVideo: {
    title: "이미지→비디오 - 사진을 움직이게",
    subtitle: "AI로 이미지를 멋진 영상으로 변환",
    model: "Veo3: 프리미엄 품질 • 16:9 • 720p • 8초",
    uploadPanelTitle: "이미지 업로드",
    uploadPlaceholder: "클릭하여 업로드 또는 드래그 앤 드롭",
    uploadHint: "지원 형식: JPG, PNG, WebP",
    animationPromptLabel: "애니메이션 프롬프트",
    animationPromptPlaceholder: "이미지가 어떻게 움직이길 원하는지 설명하세요...",
    generateButton: "비디오 생성",
    generatedPanelTitle: "생성된 비디오",
    generatedPlaceholder: "생성된 비디오가 여기에 표시됩니다",
    exampleModelLabel: "모델: Google Veo3",
    examplePromptLabel: "예시 프롬프트:",
    examplePrompt:
      "애니 캐릭터를 살아 움직이게: 부드럽게 미소 짓고 자연스럽게 깜빡이며 바람에 머리카락이 살짝 흔들리게",
  },
  explore: {
    title: "Nano Banana AI 탐색",
    subtitle: "100만 개의 프롬프트에서 영감을 찾아 상상력을 펼쳐보세요!",
    emptyMessage: "이미지를 찾을 수 없습니다",
    imageAltPrefix: "탐색 아이템",
    overlayModel: "Nano Banana AI",
    overlayPrompt: "크리에이티브 생성...",
    images: [
      "https://cdn.ainanobanana.io/nano-banana/20ca34f4-a8cd-4642-a207-052fc9b490ed.png",
      "https://cdn.ainanobanana.io/image-upscale/bcf8dd18-3576-431f-86d2-a04ceb334245.png",
      "https://cdn.ainanobanana.io/image-upscale/d8bdb435-0736-468d-82e1-e1d6a4dcc35b.png",
      "https://cdn.ainanobanana.io/image-upscale/6e7d5257-fb9e-4981-bb62-d92f0c44b216.png",
      "https://cdn.ainanobanana.io/image-upscale/6a5ad36d-518b-437b-ae97-a7f50682d337.png",
      "https://cdn.ainanobanana.io/nano-banana/947423e3-bbfb-43b8-b2fb-69d49cf526d5.png",
      "https://cdn.ainanobanana.io/nano-banana/373c6b42-a0a7-47c6-9141-9d10ba938574.png",
      "https://cdn.ainanobanana.io/nano-banana/5c5225b8-9adf-41e6-868a-9152f0536dac.png",
      "https://cdn.ainanobanana.io/nano-banana/d0e1e421-064f-457c-af87-061bbd1a223c.png",
      "https://cdn.ainanobanana.io/nano-banana/ac48d3f9-e45a-4664-9cbf-7e4c90d6fca8.png",
      "https://cdn.ainanobanana.io/nano-banana/d2384f25-397a-4afe-8148-26c3c1f8e06b.png",
      "https://cdn.ainanobanana.io/nano-banana/0a9719bb-ca39-493f-8b3e-953d3dc30372.png",
      "https://cdn.ainanobanana.io/nano-banana/378c387f-43a3-4f0a-9746-f9fc56b24f6c.png",
      "https://cdn.ainanobanana.io/nano-banana/46e4ec87-9511-4ca6-bac8-fc4e6c315e9b.png",
      "https://cdn.ainanobanana.io/nano-banana/18ed5ae4-cdad-4258-bd98-6c99550722c2.png",
      "https://cdn.ainanobanana.io/nano-banana/336989fa-58eb-46b8-98ac-a8dabc2f2489.png",
      "https://cdn.ainanobanana.io/nano-banana/86cda981-aac4-468c-9cf5-202d520281fb.png",
      "https://cdn.ainanobanana.io/nano-banana/79ecf9d6-1643-4fd3-8d72-46aaf7538ba5.png",
      "https://cdn.ainanobanana.io/nano-banana/1d27dedc-9d65-4712-b513-64b56a20a0cf.png",
      "https://cdn.ainanobanana.io/nano-banana/806536fa-ec8a-4af4-99cf-c20179f2c9ed.png",
    ],
  },
  history: {
    title: "생성 기록",
    subtitle: "이전 생성 결과를 확인하세요",
    emptyMessage: "기록이 없습니다. 지금 생성해 보세요!",
  },
  legal: {
    contentComingSoon: "콘텐츠 준비 중...",
    titles: {
      support: "지원",
      tos: "서비스 이용약관",
      privacy: "개인정보 처리방침",
      refund: "환불 정책",
    },
  },
  footer: {
    logo: "ainanobanana.io",
    copyright: "Copyright ainanobanana.io © 2025 - All rights reserved",
    links: [
      { label: "지원", href: "/support" },
      { label: "약관", href: "/tos" },
      { label: "개인정보", href: "/privacy-policy" },
      { label: "환불 정책", href: "/refund-policy" },
    ],
  },
};
