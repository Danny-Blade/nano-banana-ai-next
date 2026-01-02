import type { SiteContent } from "@/config/content/types";

export const siteContentKo: SiteContent = {
  header: {
    logo: "Nano Banana Pro AI",
    logoImage: "https://aiimage.pkgames.org/nano-banana/logo.webp",
    navLinks: [
      { label: "홈", href: "/" },
      { label: "대시보드", href: "/dashboard" },
      { label: "요금제", href: "/pricing" },
      { label: "Prompt", href: "/prompt" },
      { label: "기록", href: "/history" },
    ],
    loginButton: "로그인",
    logoutButton: "로그아웃",
    toggleMenuAriaLabel: "메뉴 토글",
  },
  hero: {
    title: "Nano Banana Pro AI — Gemini 3.0 Flash Image 기반 생성·편집 스튜디오",
    subtitle:
      "Google의 혁신적인 Nano Banana Pro AI(Gemini 3.0 Flash Image)로 고급 이미지 생성과 편집을 경험하세요. Nano Banana Pro AI에서 생성, 합성, 보정을 손쉽게 수행할 수 있습니다.",
    ctaPrimary: "지금 시작하기",
    ctaSecondary: "",
    ctaPrimaryHref: "/dashboard",
    ctaSecondaryHref: "",
  },
  editor: {
    title: "Nano Banana Pro AI - 고급 이미지 편집기",
    subtitle:
      "강력한 Nano Banana Pro AI 모델로 이미지를 변환·편집하세요. 간단한 프롬프트만으로 전문가급 결과를 얻을 수 있습니다.",
  },
  textToImage: {
    title: "텍스트로 멋진 이미지 생성",
    subtitle:
      "원하는 것을 설명하기만 하면 Nano Banana Pro AI가 사실적인 이미지로 구현합니다",
    promptLabel: "프롬프트",
    tryItLabel: "체험하기",
    moreLabel: "더 보기",
    items: [
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766628634462-0.png",
        prompt: "중립적인 배경에서 두 손가락 사이에 있는 정교하고 투명한 유리 구체/캡슐의 인물 이미지를 생성합니다. 캡슐 안에는 사실적인 얼굴 특징을 가진 미니 치비 버전의 [인물 이름]이 있습니다 — 큰 머리, 작은 몸의 귀여운 비율. 인물은 가장 상징적인 의상이나 알아볼 수 있는 옷을 입고 있어야 합니다. 유리에는 사실적인 반사가 있고 인물은 내부에서 입체적으로 보여야 합니다. 포토리얼 스타일, 완벽한 조명.",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766628927500-0.png",
        prompt: "인간의 손이 둥글고 모서리가 깎인 미니어처 디스플레이 플랫폼을 부드럽게 들고 있는 하이퍼 리얼리스틱 1080x1080 정사각형 렌더링을 만듭니다. [도시]의 3D 컬렉터블 디오라마를 전시합니다. 가장 상징적인 랜드마크, 소규모 현대 및 역사적 건축물, 풍성한 미니어처 녹지와 나무를 특징으로 합니다. 플랫폼 앞쪽 가장자리에 굵은 3D \"[New York]\" 사인을 깔끔하게 내장합니다. 정제되고 채도가 낮은 색상 구성표와 무광 텍스처로 사실적인 스케일 모델 느낌을 강화합니다. 부드러운 스튜디오 조명, 따뜻한 하이라이트, 미묘한 깊이 그림자로 장면을 조명합니다. 중립적인 회색 그라디언트 배경에 배치하고 일관된 시점과 원근을 유지합니다. 8K 품질의 하이엔드 컬렉터블 미학을 위한 대기 깊이, 포토리얼 텍스처, 초정밀 디테일을 추가합니다.",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766629197849-1.png",
        prompt: "주토피아 촬영장에서 주디 홉스, 닉 와일드와 함께 셀카를 찍었습니다. 피사체는 참조 이미지와 정확히 동일합니다. 얼굴 특징, 골격 구조, 피부톤, 표정, 포즈, 외모가 100% 동일합니다.",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766629711103-0.png",
        prompt: "[에펠탑]의 인포그래픽 이미지를 만듭니다. 랜드마크의 실제 사진과 청사진 스타일의 기술 주석 및 다이어그램을 이미지 위에 오버레이합니다. 모서리에 손으로 그린 상자에 제목 [에펠탑]을 포함합니다. 주요 구조 데이터, 중요 치수, 재료 수량, 내부 다이어그램, 하중 흐름 화살표, 단면도, 평면도, 주목할 만한 건축 또는 공학적 특징을 보여주는 흰색 분필 스타일의 스케치를 추가합니다. 스타일 - 사진 위에 흰색 선 그림을 사용한 청사진 미학, 기술/건축 주석 스타일, 교육용 인포그래픽 느낌, 주석 뒤에 실제 환경이 보임.",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766630256509-0.png",
        prompt: "크리스마스 스킨케어 기프트 세트를 위한 전문 프로모션 카드를 디자인합니다. 세로 레이아웃, 미니멀하고 프리미엄한 미학. 상단의 얼음 눈처럼 흰색에서 하단의 연한 분홍색으로 전환되는 부드러운 그라디언트 배경으로 신선하고 우아한 분위기를 연출합니다. 구도의 상단 중앙 영역에 고급 스킨케어 기프트 박스를 세심하게 배치합니다. 박스는 섬세한 눈송이 패턴이 엠보싱된 무광 흰색 패키지와 브랜드 로고(Dior)가 특징입니다. 박스는 열린 상태로 내부에 크기가 다른 세 개의 스킨케어 병을 보여줍니다. 병은 깔끔하고 모던한 디자인에 골드 캡이 있습니다. 제품 주변에 크리스마스 장식 요소를 미묘하게 배치 - 신선한 소나무 가지 몇 개, 작은 금색 종, 여러 개의 빨간 열매, 흩어진 작은 선물 상자. 모든 소품은 세심하게 조명하여 정제된 하이엔드 제품 사진 느낌을 연출합니다. 카드 상단에 얇고 우아한 폰트로 헤드라인 - 크리스마스 스페셜·리뉴&글로우. 제품 아래 중간 섹션에 빨간색 굵은 텍스트로 프로모션 강조 - 한정 기프트 세트 20% 할인·구매 시 시트 마스크 5장 무료 증정. 하단에 버튼 스타일의 CTA - 지금 구매·한정 수량, 프로모션 유효 기간 - 12월 15일부터 26일. 전체 디자인은 고급 제품 질감과 완벽하게 균형 잡힌 축제 분위기를 강조해야 합니다.",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766630986146-0.png",
        prompt: "당신은 강렬한 개인 손그림 스타일을 가진 일본 만화가입니다. 당신은 '귀멸의 칼날' 오리지널 손그림 초안 스케치의 제작자 중 한 명입니다. 당신의 독특한 만화 선화 초안 스타일을 사용하고 Nano Banana Pro를 호출하여 다음 내용에 대한 이해를 바탕으로 패널 기반 만화 초안 스토리보드를 생성하세요. 분석을 출력하지 마세요. 패널 기반 만화 초안 이미지를 직접 출력하세요.",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766614875845-0.jpeg",
        prompt: "은빛 머리칼이 흩날리는 아름다운 애니메이션 소녀, 벚꽃이 흩날리는 가운데 부드러운 분홍빛 조명",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766615174387-0.png",
        prompt: "미래적인 사이버펑크 도시 야경, 젖은 도로에 반사되는 네온사인, 멀리 비행하는 자동차",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766615566054-1.png",
        prompt: "산봉우리에 앉아 있는 위풍당당한 용, 석양에 빛나는 황금빛 비늘, 판타지 아트 스타일",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766615696417-1.png",
        prompt: "아늑한 카페 인테리어, 가을 오후 따뜻한 빛이 창문을 통해 들어오는, 빈티지 미학",
      },
      // {
      //   image: "https://cdn.ainanobanana.io/nano-banana/d0e1e421-064f-457c-af87-061bbd1a223c.png",
      //   prompt: "발광 생물이 있는 수중 궁전, 산호로 덮인 고대 유적, 신비로운 분위기",
      // },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766616048580-1.png",
        prompt: "빅토리아 시대 런던 상공을 떠다니는 스팀펑크 비행선, 기어와 황동 디테일, 극적인 구름 하늘",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766616112421-0.png",
        prompt: "거대한 발광 버섯이 있는 마법의 숲, 요정 불빛이 점점이, 환상적인 세계",
      },
      // {
      //   image: "https://cdn.ainanobanana.io/nano-banana/0a9719bb-ca39-493f-8b3e-953d3dc30372.png",
      //   prompt: "전통 갑옷을 입은 사무라이가 대나무 숲에 서 있는, 아침 안개, 영화적 조명",
      // },
    ],
  },
  imageToImageExamples: {
    title: "AI로 이미지를 자유롭게 변환",
    subtitle:
      "사진 편집, 보정, 재해석을 강력한 AI로 — 슬라이더를 움직여 마법을 체험하세요",
    beforeLabel: "변경 전",
    afterLabel: "변경 후",
    promptLabel: "편집 프롬프트",
    tryItLabel: "체험하기",
    moreLabel: "더 보기",
    items: [
      {
        before: "https://aiimage.pkgames.org/nano-banana/add-color-0.webp",
        after: "https://aiimage.pkgames.org/nano-banana/add-color-1.webp",
        prompt: "이 그림에 색칠해 주세요",
      },
      {
        before: "https://aiimage.pkgames.org/nano-banana/beach-scenery-0.webp",
        after: "https://aiimage.pkgames.org/nano-banana/beach-scenery-1.webp",
        prompt: "야간 장면으로 전환하고 점광원을 사용합니다",
      },
      {
        before: "https://aiimage.pkgames.org/nano-banana/car-0.webp",
        after: "https://aiimage.pkgames.org/nano-banana/car-1.webp",
        prompt: "배경을 눈 내리는 겨울 풍경으로 바꿔 주세요",
      },
      {
        before: "https://aiimage.pkgames.org/nano-banana/ui-design-0.webp",
        after: "https://aiimage.pkgames.org/nano-banana/ui-design-1.webp",
        prompt: "와이어프레임을 기반으로 UI 목업을 만들어 주세요",
      },
      {
        before: "https://aiimage.pkgames.org/nano-banana/line-art-pose-0.webp",
        after: "https://aiimage.pkgames.org/nano-banana/line-art-pose-1.webp",
        prompt: "오른쪽 상단의 인물을 선화의 포즈로 바꾸고, 전문 스튜디오에서 촬영한 느낌으로 만들어 주세요",
      },
      {
        before: "https://aiimage.pkgames.org/nano-banana/line-drawing-0.webp",
        after: "https://aiimage.pkgames.org/nano-banana/line-drawing-1.webp",
        prompt: "선화에 색을 입혀 주세요",
      },
    ],
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
    title: "Nano Banana Pro AI 커뮤니티 작품",
    subtitle: "아이디어가 현실이 되는 과정을 확인하세요 — 콘셉트부터 결과물까지 단 몇 초",
    promptLabel: "프롬프트",
    videoPromptLabel: "비디오 프롬프트",
    showcases: [
      {
        title: "Nano Banana Pro AI 변환 파이프라인(전체)",
        prompt:
          "이 애니 캐릭터를 피규어 제품 쇼케이스로 변환: 투명한 원형 받침대 위에 서 있는 PVC 피규어를 만들고, 뒤에 캐릭터 아트가 있는 제품 박스를 두며, Blender에서 3D 모델링 과정을 보여주는 모니터를 추가해줘.",
        videoPrompt: "애니 캐릭터를 살아 움직이게: 부드럽게 미소 짓고 자연스럽게 깜빡이며 바람에 머리카락이 살짝 흔들리게",
        image: "https://cdn.ainanobanana.io/ai-poster.png",
        video: "https://image.ainanobanana.io/ai-nanobanana.mp4",
      },
      {
        title: "Nano Banana Pro AI 사이버펑크 인물",
        prompt: "네온과 미래 요소가 있는 사이버펑크 스타일 인물 사진으로 변환",
        image:
          "https://cdn.ainanobanana.io/flux-kontext-dev/1e9de2c2-1fea-473c-a2c0-73191a02940c.png",
      },
      {
        title: "Nano Banana Pro AI 사진 복원",
        prompt: "스크래치와 손상을 복구하고 오래된 사진을 컬러화",
        image: "https://cdn.ainanobanana.io/restore-image.png",
      },
    ],
  },
  whyChoose: {
    title: "크리에이터가 Nano Banana Pro AI를 선택하는 이유",
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
        description: "60초 이내에 프로급 이미지를 생성 — 기존 모델 대비 10배 빠릅니다.",
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
        icon: "🎨",
        title: "다양한 스타일 지원",
        description: "포토리얼에서 애니메이션, 유화에서 수채화까지 — 하나의 모델로 모든 예술 스타일을 구현.",
      },
      {
        icon: "🌐",
        title: "다국어 프롬프트",
        description: "어떤 언어로든 프롬프트 작성 가능 — 한국어, 중국어, 일본어, 영어 등 네이티브 지원.",
      },
      {
        icon: "📱",
        title: "크로스 플랫폼 접근",
        description: "언제 어디서든 창작 — 데스크톱, 태블릿, 모바일에서 끊김 없는 경험.",
      },
    ],
  },
  stats: {
    title: "전 세계 크리에이터가 신뢰합니다",
    subtitle: "성장하는 AI 아티스트와 디자이너 커뮤니티에 참여하세요",
    items: [
      { value: "10만+", label: "활성 사용자" },
      { value: "130만+", label: "생성된 이미지" },
      { value: "99.9%", label: "가동률" },
      { value: "4.9/5", label: "사용자 평점" },
    ],
  },
  testimonials: {
    title: "크리에이터들의 이야기",
    subtitle: "커뮤니티의 실제 피드백",
    items: [
      {
        name: "김서연",
        role: "디지털 아티스트",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        content: "Nano Banana Pro AI는 제 작업 방식을 완전히 바꿔놓았습니다. 이미지 품질이 놀랍고 속도는 비교할 수 없습니다. 이제 컨셉 아트를 이전보다 10배 빠르게 만들 수 있어요.",
        rating: 5,
      },
      {
        name: "박준혁",
        role: "마케팅 디렉터",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        content: "모든 마케팅 캠페인에 Nano Banana를 사용합니다. 캐릭터 생성의 일관성이 브랜드 에셋에 딱 맞아요. 강력 추천합니다!",
        rating: 5,
      },
      {
        name: "이유나",
        role: "게임 개발자",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        content: "애니메이션 스타일 생성이 정말 놀랍습니다. 많은 AI 도구를 사용해봤지만 Nano Banana는 예술적 뉘앙스를 가장 잘 이해합니다.",
        rating: 5,
      },
      {
        name: "Alex Rivera",
        role: "콘텐츠 크리에이터",
        avatar: "https://randomuser.me/api/portraits/men/75.jpg",
        content: "60초 만에 전문가급 이미지를 얻을 수 있다니 게임 체인저입니다. 제 유튜브 썸네일이 그 어느 때보다 멋져졌어요. ROI가 놀랍습니다.",
        rating: 5,
      },
      {
        name: "최민지",
        role: "일러스트레이터",
        avatar: "https://randomuser.me/api/portraits/women/22.jpg",
        content: "Nano Banana Pro AI의 다양한 스타일 지원이 정말 좋아요. 수채화부터 유화까지, 클라이언트가 원하는 어떤 스타일도 빠르게 구현할 수 있습니다.",
        rating: 5,
      },
      {
        name: "정태호",
        role: "UI/UX 디자이너",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        content: "프로토타입용 이미지를 만들 때 필수 도구가 되었습니다. 와이어프레임에서 실제 UI 목업까지 순식간에 변환할 수 있어요.",
        rating: 5,
      },
      {
        name: "한소영",
        role: "사진작가",
        avatar: "https://randomuser.me/api/portraits/women/56.jpg",
        content: "오래된 사진 복원 기능에 감동받았습니다. 할머니의 흑백 사진을 컬러로 복원했는데, 가족 모두 눈물을 글썽였어요.",
        rating: 5,
      },
      {
        name: "윤성민",
        role: "웹툰 작가",
        avatar: "https://randomuser.me/api/portraits/men/58.jpg",
        content: "캐릭터 일관성 기능 덕분에 웹툰 제작 속도가 2배로 빨라졌습니다. 같은 캐릭터를 다양한 각도로 생성하는 게 이렇게 쉬울 줄이야!",
        rating: 5,
      },
      {
        name: "강예린",
        role: "패션 디자이너",
        avatar: "https://randomuser.me/api/portraits/women/33.jpg",
        content: "새 컬렉션 컨셉을 시각화하는 데 완벽한 도구입니다. 아이디어를 빠르게 이미지로 만들어 팀과 공유할 수 있어요.",
        rating: 5,
      },
      {
        name: "임재원",
        role: "영상 편집자",
        avatar: "https://randomuser.me/api/portraits/men/67.jpg",
        content: "영상 썸네일과 커버 이미지 제작에 매일 사용합니다. 클라이언트들이 결과물에 항상 만족해해요. 가격 대비 가치가 뛰어납니다.",
        rating: 5,
      },
      {
        name: "신하늘",
        role: "인디 개발자",
        avatar: "https://randomuser.me/api/portraits/women/41.jpg",
        content: "혼자서 게임을 개발하는데, Nano Banana Pro AI 덕분에 아트 에셋 제작 시간이 크게 단축되었습니다. 정말 강력 추천해요!",
        rating: 5,
      },
      {
        name: "조현우",
        role: "광고 크리에이터",
        avatar: "https://randomuser.me/api/portraits/men/81.jpg",
        content: "소셜 미디어 광고 소재를 대량으로 만들 때 없어서는 안 될 도구가 되었습니다. A/B 테스트용 이미지를 몇 분 만에 생성할 수 있어요.",
        rating: 5,
      },
    ],
  },
  modelComparison: {
    title: "AI 이미지 생성 모델 비교",
    subtitle: "Nano Banana Pro AI와 다른 주요 AI 이미지 생성 도구 비교",
    tableHeaders: {
      model: "모델",
      speed: "속도",
      quality: "품질",
      editingCapability: "편집 기능",
      characterConsistency: "캐릭터 일관성",
      pricing: "가격",
      multiLanguage: "다국어 지원",
    },
    models: [
      {
        name: "Nano Banana Pro AI",
        icon: "🍌",
        isHighlighted: true,
        speed: { value: "60초", rating: 5, label: "초고속" },
        quality: { value: "4K", rating: 5, label: "우수" },
        editingCapability: { value: "완전", rating: 5, label: "텍스트+이미지" },
        characterConsistency: { value: "95%", rating: 5, label: "우수" },
        pricing: { value: "$9.99", rating: 5, label: "저렴" },
        multiLanguage: { value: "지원", rating: 5, label: "50+언어" },
      },
      {
        name: "Midjourney",
        icon: "🎨",
        isHighlighted: false,
        speed: { value: "60초", rating: 4, label: "빠름" },
        quality: { value: "4K", rating: 5, label: "우수" },
        editingCapability: { value: "제한적", rating: 2, label: "텍스트만" },
        characterConsistency: { value: "70%", rating: 3, label: "보통" },
        pricing: { value: "$10+", rating: 4, label: "적당" },
        multiLanguage: { value: "제한적", rating: 2, label: "영어 중심" },
      },
      {
        name: "DALL-E 3",
        icon: "🤖",
        isHighlighted: false,
        speed: { value: "30초", rating: 5, label: "매우 빠름" },
        quality: { value: "HD", rating: 4, label: "양호" },
        editingCapability: { value: "기본", rating: 3, label: "인페인팅" },
        characterConsistency: { value: "60%", rating: 2, label: "낮음" },
        pricing: { value: "$20+", rating: 3, label: "비쌈" },
        multiLanguage: { value: "지원", rating: 4, label: "양호" },
      },
      {
        name: "Stable Diffusion",
        icon: "🖼️",
        isHighlighted: false,
        speed: { value: "가변", rating: 3, label: "환경에 따라" },
        quality: { value: "HD-4K", rating: 4, label: "양호" },
        editingCapability: { value: "고급", rating: 4, label: "설정 필요" },
        characterConsistency: { value: "80%", rating: 4, label: "LoRA 사용시" },
        pricing: { value: "무료/$", rating: 5, label: "오픈소스" },
        multiLanguage: { value: "제한적", rating: 2, label: "영어 중심" },
      },
      {
        name: "Flux",
        icon: "⚡",
        isHighlighted: false,
        speed: { value: "45초", rating: 4, label: "빠름" },
        quality: { value: "4K", rating: 5, label: "우수" },
        editingCapability: { value: "양호", rating: 4, label: "Kontext 편집" },
        characterConsistency: { value: "85%", rating: 4, label: "양호" },
        pricing: { value: "$15+", rating: 3, label: "적당" },
        multiLanguage: { value: "제한적", rating: 3, label: "기본" },
      },
      {
        name: "Adobe Firefly",
        icon: "🔥",
        isHighlighted: false,
        speed: { value: "30초", rating: 4, label: "빠름" },
        quality: { value: "HD", rating: 4, label: "양호" },
        editingCapability: { value: "양호", rating: 4, label: "Adobe 연동" },
        characterConsistency: { value: "65%", rating: 3, label: "보통" },
        pricing: { value: "$23+", rating: 2, label: "비쌈" },
        multiLanguage: { value: "지원", rating: 4, label: "양호" },
      },
    ],
    footer: "* 2025년 공개 정보 기준 비교입니다. 실제 성능은 다를 수 있습니다.",
  },
  pricing: {
    title: "모든 크리에이터를 위한 Nano Banana Pro AI",
    subtitle: "취미부터 프로까지 — 매일 수백만 장을 생성하는 커뮤니티에 참여하세요.",
    toggleLabels: {
      monthly: "월간",
      yearly: "연간",
      yearlyDiscount: "-20%",
      onetime: "크레딧",
    },
    getStartedButton: "지금 구독",
    buyNowButton: "지금 구매",
    creditsLabel: "크레딧",
    onetimeTitle: "💎 크레딧 패키지",
    onetimeSubtitle: "구독 불필요 • 만료 없음 • 언제든 사용",
    monthlyPlans: [
      {
        name: "스타터",
        description: "체험용으로 최적",
        price: "$9.99",
        period: "/월",
        features: [
          "월 200 크레딧",
          "기본 AI 모델",
          "표준 속도",
          "이메일 지원",
          "PNG 다운로드",
          "상업용 라이선스",
        ],
        highlighted: false,
      },
      {
        name: "베이직",
        description: "개인 크리에이터용",
        price: "$24.99",
        period: "/월",
        features: [
          "월 500 크레딧",
          "기본 AI 모델",
          "HD 출력",
          "우선 지원",
          "PNG 다운로드",
          "상업용 라이선스",
        ],
        highlighted: false,
      },
      {
        name: "포퓰러",
        description: "크리에이터와 팀에 최적",
        price: "$49.99",
        period: "/월",
        badge: "⭐ 추천",
        features: [
          "월 1,000 크레딧",
          "모든 AI 모델",
          "HD 출력",
          "배치 생성",
          "우선 지원",
          "상업용 라이선스",
        ],
        highlighted: true,
      },
      {
        name: "프로",
        description: "헤비 유저 & 기업용",
        price: "$99.99",
        period: "/월",
        features: [
          "월 2,000 크레딧",
          "모든 AI 모델",
          "HD 출력",
          "배치 생성",
          "우선 큐",
          "API 액세스",
        ],
        highlighted: false,
      },
    ],
    yearlyPlans: [
      {
        name: "스타터",
        description: "체험용으로 최적",
        price: "$95.90",
        originalPrice: "$119.88",
        period: "/년",
        monthlyEquiv: "$7.99/월 상당",
        saveBadge: "$24 절약",
        features: [
          "연 2,400 크레딧",
          "기본 AI 모델",
          "표준 속도",
          "이메일 지원",
          "PNG 다운로드",
          "상업용 라이선스",
        ],
        highlighted: false,
      },
      {
        name: "베이직",
        description: "개인 크리에이터용",
        price: "$239.90",
        originalPrice: "$299.88",
        period: "/년",
        monthlyEquiv: "$19.99/월 상당",
        saveBadge: "$60 절약",
        features: [
          "연 6,000 크레딧",
          "기본 AI 모델",
          "HD 출력",
          "우선 지원",
          "PNG 다운로드",
          "상업용 라이선스",
        ],
        highlighted: false,
      },
      {
        name: "포퓰러",
        description: "크리에이터와 팀에 최적",
        price: "$479.90",
        originalPrice: "$599.88",
        period: "/년",
        monthlyEquiv: "$39.99/월 상당",
        saveBadge: "$120 절약",
        badge: "⭐ 최고 가성비",
        features: [
          "연 12,000 크레딧",
          "모든 AI 모델",
          "HD 출력",
          "배치 생성",
          "우선 지원",
          "상업용 라이선스",
        ],
        highlighted: true,
      },
      {
        name: "프로",
        description: "헤비 유저 & 기업용",
        price: "$959.90",
        originalPrice: "$1,199.88",
        period: "/년",
        monthlyEquiv: "$79.99/월 상당",
        saveBadge: "$240 절약",
        features: [
          "연 24,000 크레딧",
          "모든 AI 모델",
          "HD 출력",
          "배치 생성",
          "우선 큐",
          "API 액세스",
        ],
        highlighted: false,
      },
    ],
    onetimePlans: [
      {
        name: "스몰",
        description: "시작하기",
        price: "$19.99",
        credits: "400",
        features: [
          "일회성 구매",
          "만료 없음",
          "모든 AI 모델",
          "상업용 라이선스",
        ],
        highlighted: false,
      },
      {
        name: "미디엄",
        description: "인기 선택",
        price: "$49.99",
        credits: "1,000",
        features: [
          "일회성 구매",
          "만료 없음",
          "모든 AI 모델",
          "상업용 라이선스",
          "우선 지원",
        ],
        highlighted: false,
      },
      {
        name: "라지",
        description: "최고 가치",
        price: "$99.99",
        credits: "2,500",
        badge: "💎 최고 가성비",
        features: [
          "일회성 구매",
          "만료 없음",
          "모든 AI 모델",
          "상업용 라이선스",
          "우선 지원",
        ],
        highlighted: true,
      },
      {
        name: "메가",
        description: "헤비 유저용",
        price: "$249.99",
        credits: "6,000",
        features: [
          "일회성 구매",
          "만료 없음",
          "모든 AI 모델",
          "상업용 라이선스",
          "우선 큐",
          "전담 지원",
        ],
        highlighted: false,
      },
    ],
    trustBadges: [
      { icon: "🛡️", text: "30일 환불 보장" },
      { icon: "💳", text: "안전한 결제" },
      { icon: "❌", text: "언제든 취소" },
      { icon: "🎧", text: "24시간 지원" },
    ],
  },
  tweets: {
    title: "Nano Banana Pro AI 트윗 탐색",
    subtitle: "크리에이터들의 이야기를 확인하세요",
  },
  faq: {
    title: "Nano Banana Pro AI 자주 묻는 질문",
    items: [
      {
        question: "Nano Banana Pro AI란 무엇인가요?",
        answer:
          "Nano Banana Pro AI는 Google의 Gemini 3.0 Flash Image 기술로 구동되는 고급 이미지 생성·편집 플랫폼입니다. 간단한 프롬프트로 생성/편집/변환이 가능합니다.",
      },
      {
        question: "생성 속도는 얼마나 빠른가요?",
        answer:
          "최적화된 인프라로 60초 이내에 프로급 이미지를 생성합니다. 기존 AI 모델 대비 10배 빠릅니다.",
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
      {
        question: "Nano Banana Pro AI는 전문 크리에이티브 작업에 적합한가요?",
        answer:
          "물론입니다! Nano Banana Pro AI는 전문 용도를 위해 설계되었으며, 4K 해상도 출력, 상업용 라이선스, 엔터프라이즈급 보안(SOC 2, GDPR, ISO 27001 인증)을 제공합니다. 많은 마케팅 에이전시, 게임 스튜디오, 콘텐츠 크리에이터들이 프로덕션 품질의 에셋 제작에 활용하고 있습니다.",
      },
      {
        question: "Nano Banana Pro AI는 여러 번 편집해도 캐릭터 일관성을 유지할 수 있나요?",
        answer:
          "네, 이것은 저희의 핵심 강점 중 하나입니다. 여러 번 생성해도 95%의 캐릭터 일관성을 유지합니다. 캐릭터를 한 번 만들면 다양한 포즈, 장면, 스타일에서 아이덴티티를 유지하며 생성할 수 있습니다. AI 인플루언서, 브랜드 마스코트, 게임 캐릭터에 완벽합니다.",
      },
      {
        question: "Nano Banana Pro AI로 어떤 종류의 편집을 할 수 있나요?",
        answer:
          "Nano Banana Pro AI는 포괄적인 이미지 편집을 지원합니다: 스타일 변환(애니메이션, 유화, 수채화 등), 배경 교체, 객체 제거/추가, 오래된 사진 복원 및 컬러화, 텍스트-이미지 생성, 이미지-이미지 변환, 와이어프레임에서 UI 목업 제작 등.",
      },
      {
        question: "Nano Banana Pro AI는 Flux Kontext와 어떻게 다른가요?",
        answer:
          "둘 다 강력한 AI 이미지 도구이지만, Nano Banana Pro AI는 여러 장점이 있습니다: 더 빠른 처리 속도(60초 vs 가변 시간), 더 높은 캐릭터 일관성(95% vs 85%), 50개 이상 언어의 네이티브 다국어 지원, $9.99부터 시작하는 더 합리적인 가격, Flux Kontext의 제한적인 편집 옵션에 비해 완전한 텍스트+이미지 편집 기능.",
      },
      {
        question: "Nano Banana Pro AI가 정확히 무엇이고 어떻게 작동하나요?",
        answer:
          "Nano Banana Pro AI는 Google의 Gemini 3.0 Flash Image 기술로 구동되는 고급 AI 이미지 생성 및 편집 플랫폼입니다. 50개 이상 지원 언어 중 원하는 언어로 자연어로 원하는 내용을 설명하고, 선택적으로 참조 이미지를 업로드하면 AI가 약 60초 만에 이미지를 생성하거나 변환합니다. 컨텍스트를 이해하고 캐릭터 일관성을 유지하며 전문 용도에 적합한 4K 품질 출력을 생성합니다.",
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
  prompt: {
    title: "Nano Banana Pro 쇼케이스",
    subtitle: "AI 생성 이미지와 그 뒤에 숨겨진 프롬프트를 탐색하세요",
    textToImageTab: "텍스트→이미지",
    imageToImageTab: "이미지→이미지",
    textToImageTitle: "텍스트→이미지 갤러리",
    textToImageSubtitle: "이미지를 클릭하여 전체 프롬프트 보기",
    imageToImageTitle: "이미지 변환 예시",
    imageToImageSubtitle: "슬라이더를 드래그하여 전후 비교",
    beforeLabel: "변경 전",
    afterLabel: "변경 후",
    promptLabel: "프롬프트",
    copyPrompt: "프롬프트 복사",
    copied: "복사됨!",
    tryItLabel: "바로 체험",
    ctaTitle: "나만의 작품을 만들 준비가 되셨나요?",
    ctaSubtitle: "Nano Banana Pro AI로 멋진 이미지 생성을 시작하세요",
    ctaButton: "지금 Nano Banana 체험하기",
    modelLabel: "Nano Banana Pro"
  },
  explore: {
    title: "Nano Banana Pro AI 탐색",
    subtitle: "100만 개의 프롬프트에서 영감을 찾아 상상력을 펼쳐보세요!",
    emptyMessage: "이미지를 찾을 수 없습니다",
    imageAltPrefix: "탐색 아이템",
    overlayModel: "Nano Banana Pro AI",
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
    titles: {
      support: "지원",
      tos: "서비스 이용약관",
      privacy: "개인정보 처리방침",
      refund: "환불 정책",
    },
    content: {
      support: {
        lastUpdated: "최종 업데이트: 2024년 12월",
        contactTitle: "문의하기",
        contactText: "질문이나 지원 요청은 다음 이메일로 연락해 주세요:",
        contactEmail: "support@ainanobanana.io",
        sections: [
          {
            heading: "어떻게 도와드릴까요?",
            paragraphs: [
              "Nano Banana Pro AI 지원 센터에 오신 것을 환영합니다. 저희 AI 이미지 생성 플랫폼을 최대한 활용하실 수 있도록 도와드리겠습니다.",
              "지원팀에서는 계정 문제, 결제 문의, 기술적 문제, 서비스에 관한 일반적인 문의를 도와드립니다.",
            ],
          },
          {
            heading: "자주 묻는 질문",
            paragraphs: [
              "계정 및 결제: 구독, 크레딧 또는 결제 문제에 관한 질문 시 등록된 이메일 주소를 알려주세요.",
              "기술적 문제: 이미지 생성에 문제가 있는 경우 문제에 대한 자세한 설명과 받은 오류 메시지를 알려주세요.",
              "기능 요청: 사용자의 의견을 듣는 것을 좋아합니다! 새로운 기능이나 개선에 대한 아이디어를 자유롭게 공유해 주세요.",
            ],
          },
          {
            heading: "응답 시간",
            paragraphs: [
              "일반적으로 모든 문의에 24-48 영업시간 내에 응답합니다. 프리미엄 구독자는 더 빠른 응답 시간의 우선 지원을 받습니다.",
              "긴급한 결제 문제의 경우 이메일 제목에 '긴급'을 포함해 주세요.",
            ],
          },
          {
            heading: "셀프 서비스 리소스",
            paragraphs: [
              "지원팀에 연락하기 전에 홈페이지의 FAQ 섹션에서 답을 찾을 수 있습니다. 이미지 생성, 크레딧 및 계정 관리에 관한 많은 일반적인 질문이 다루어져 있습니다.",
            ],
          },
        ],
      },
      tos: {
        lastUpdated: "최종 업데이트: 2024년 12월",
        contactTitle: "문의",
        contactText: "본 약관에 관한 질문은 다음으로 연락해 주세요:",
        contactEmail: "legal@ainanobanana.io",
        sections: [
          {
            heading: "1. 약관 동의",
            paragraphs: [
              "Nano Banana Pro AI(이하 '서비스')에 접근하거나 사용함으로써 본 서비스 이용약관에 구속되는 것에 동의합니다. 본 약관에 동의하지 않는 경우 서비스를 사용하지 마십시오.",
              "당사는 언제든지 본 약관을 수정할 권리를 보유합니다. 변경 후에도 서비스를 계속 사용하면 수정된 약관에 동의하는 것으로 간주됩니다.",
            ],
          },
          {
            heading: "2. 서비스 설명",
            paragraphs: [
              "Nano Banana Pro AI는 AI 기반 이미지 생성 및 편집 서비스를 제공합니다. 사용자는 텍스트 프롬프트와 참조 이미지를 사용하여 이미지를 생성, 편집 및 변환할 수 있습니다.",
              "서비스는 '있는 그대로' 제공되며 당사의 AI 모델을 사용하여 특정 결과나 성과를 보장하지 않습니다.",
            ],
          },
          {
            heading: "3. 사용자 계정",
            paragraphs: [
              "계정 생성 시 정확한 정보를 제공해야 합니다. 계정 자격 증명의 보안을 유지할 책임은 사용자에게 있습니다.",
              "계정을 타인과 공유하거나 무단 접근을 허용할 수 없습니다. 당사는 본 약관을 위반하는 계정을 일시 중지하거나 종료할 권리를 보유합니다.",
            ],
          },
          {
            heading: "4. 허용되는 사용",
            paragraphs: [
              "서비스를 사용하여 불법적이거나 유해하거나 위협적이거나 학대적이거나 명예훼손적이거나 기타 불쾌한 콘텐츠를 생성하지 않는 것에 동의합니다.",
              "타인의 지적 재산권을 침해하는 콘텐츠를 만들거나 오해를 유발하려는 딥페이크나 기만적인 미디어를 생성하기 위해 서비스를 사용할 수 없습니다.",
              "당사는 허용되는 사용 정책을 위반하는 콘텐츠를 제거하고 계정을 일시 중지할 권리를 보유합니다.",
            ],
          },
          {
            heading: "5. 지적 재산권",
            paragraphs: [
              "유료 구독으로 서비스를 사용하여 생성된 이미지에는 상업적 사용권이 포함됩니다. 생성한 이미지의 소유권은 사용자가 보유합니다.",
              "AI 생성 이미지를 판매하거나 라이선스할 때 원본 사진이나 인간이 만든 예술 작품이라고 주장할 수 없습니다.",
              "당사의 플랫폼, 기술 및 브랜드는 당사의 독점적인 지적 재산으로 남습니다.",
            ],
          },
          {
            heading: "6. 결제 및 구독",
            paragraphs: [
              "유료 구독은 월별 또는 연간으로 선불 청구됩니다. 구매한 크레딧은 환불 정책에 명시된 경우를 제외하고 환불되지 않습니다.",
              "당사는 기존 구독자에게 30일 전에 통지하여 가격을 변경할 권리를 보유합니다.",
            ],
          },
          {
            heading: "7. 책임 제한",
            paragraphs: [
              "법률이 허용하는 최대 범위 내에서 Nano Banana Pro AI는 서비스 사용으로 인한 간접적, 우발적, 특별 또는 결과적 손해에 대해 책임을 지지 않습니다.",
              "당사의 총 책임은 청구가 발생하기 전 12개월 동안 서비스에 대해 지불한 금액을 초과하지 않습니다.",
            ],
          },
          {
            heading: "8. 종료",
            paragraphs: [
              "당사는 본 약관 위반 시 언제든지 계정을 종료하거나 일시 중지할 수 있습니다. 계정 설정을 통해 언제든지 계정을 취소할 수 있습니다.",
              "종료 시 서비스를 사용할 권리는 즉시 중단됩니다. 계정 종료 후 데이터를 삭제할 수 있습니다.",
            ],
          },
          {
            heading: "9. 준거법",
            paragraphs: [
              "본 약관은 관련 법률에 따라 해석되고 적용됩니다. 분쟁은 구속력 있는 중재를 통해 해결됩니다.",
            ],
          },
        ],
      },
      privacy: {
        lastUpdated: "최종 업데이트: 2024년 12월",
        contactTitle: "문의하기",
        contactText: "개인정보 관련 문의는 다음으로 연락해 주세요:",
        contactEmail: "privacy@ainanobanana.io",
        sections: [
          {
            heading: "1. 수집하는 정보",
            paragraphs: [
              "계정 정보: 계정 생성 시 이메일 주소와 타사 제공업체(예: Google OAuth)의 인증 정보를 수집합니다.",
              "사용 데이터: 사용된 프롬프트, 생성된 이미지, 기능 사용 패턴 등 서비스 사용 방법에 대한 정보를 수집합니다.",
              "결제 정보: 결제 처리는 타사 제공업체에서 처리합니다. 전체 신용카드 정보는 저장하지 않습니다.",
              "기기 정보: 보안 및 분석 목적으로 브라우저 유형, IP 주소, 기기 식별자 등 표준 기술 정보를 수집합니다.",
            ],
          },
          {
            heading: "2. 정보 사용 방법",
            paragraphs: [
              "서비스 제공 및 유지, 거래 처리, 서비스 관련 커뮤니케이션 전송.",
              "집계된 익명화된 사용 분석을 통해 AI 모델 및 서비스 품질 개선.",
              "사기, 남용 및 보안 사고 감지 및 방지.",
              "법적 의무 준수 및 당국의 합법적인 요청에 대한 응답.",
            ],
          },
          {
            heading: "3. 데이터 공유",
            paragraphs: [
              "개인 정보를 제3자에게 판매하지 않습니다.",
              "서비스 운영을 돕는 서비스 제공업체(결제 처리업체, 클라우드 호스팅, 분석)와 데이터를 공유할 수 있습니다.",
              "법률에서 요구하거나 권리와 안전을 보호하기 위해 정보를 공개할 수 있습니다.",
            ],
          },
          {
            heading: "4. 데이터 보존",
            paragraphs: [
              "계정 데이터는 계정이 활성화되어 있는 동안 보존됩니다. 생성된 이미지는 구독 등급에 따라 저장됩니다.",
              "언제든지 지원팀에 연락하여 계정 및 관련 데이터 삭제를 요청할 수 있습니다.",
              "일부 데이터는 계정 삭제 후에도 법적 준수를 위해 보존될 수 있습니다.",
            ],
          },
          {
            heading: "5. 데이터 보안",
            paragraphs: [
              "암호화, 접근 제어, 정기적인 보안 감사를 포함한 업계 표준 보안 조치를 구현합니다.",
              "당사는 SOC 2, GDPR 및 ISO 27001 인증을 받아 데이터 보호에 대한 약속을 입증합니다.",
              "데이터 보호를 위해 노력하지만 인터넷을 통한 전송 방법이 100% 안전하지는 않습니다.",
            ],
          },
          {
            heading: "6. 사용자 권리",
            paragraphs: [
              "개인 정보에 접근, 수정 또는 삭제할 권리가 있습니다.",
              "언제든지 마케팅 커뮤니케이션을 거부할 수 있습니다.",
              "EU/EEA 사용자는 데이터 이동성 및 처리 반대 권리를 포함한 GDPR에 따른 추가 권리가 있습니다.",
            ],
          },
          {
            heading: "7. 쿠키 및 추적",
            paragraphs: [
              "인증 및 서비스 기능을 위해 필수 쿠키를 사용합니다.",
              "사용자가 서비스와 상호 작용하는 방식을 이해하기 위해 분석 도구를 사용합니다. 브라우저 설정을 통해 쿠키 기본 설정을 제어할 수 있습니다.",
            ],
          },
          {
            heading: "8. 아동 개인정보",
            paragraphs: [
              "서비스는 13세 미만 아동을 대상으로 하지 않습니다. 13세 미만 아동으로부터 의도적으로 정보를 수집하지 않습니다. 그러한 정보를 수집했음을 알게 되면 즉시 삭제합니다.",
            ],
          },
          {
            heading: "9. 국제 데이터 전송",
            paragraphs: [
              "데이터는 거주지 외의 국가에서 처리될 수 있습니다. 국제 전송에 적절한 보호 조치가 마련되어 있습니다.",
            ],
          },
          {
            heading: "10. 정책 변경",
            paragraphs: [
              "본 개인정보 처리방침은 정기적으로 업데이트될 수 있습니다. 중요한 변경 사항은 이메일 또는 서비스를 통해 알려드립니다.",
            ],
          },
        ],
      },
      refund: {
        lastUpdated: "최종 업데이트: 2024년 12월",
        contactTitle: "환불 요청",
        contactText: "환불을 요청하려면 다음으로 연락해 주세요:",
        contactEmail: "billing@ainanobanana.io",
        sections: [
          {
            heading: "환불 대상",
            paragraphs: [
              "Nano Banana Pro AI에 만족하시길 바랍니다. 구매에 만족하지 않으시면 다음 조건에 따라 환불을 제공합니다:",
              "구독 플랜: 할당된 크레딧의 20% 이상을 사용하지 않은 경우 최초 구독 구매 후 7일 이내에 전액 환불을 요청할 수 있습니다.",
              "추가 크레딧 패키지: 크레딧 패키지 구매는 크레딧이 사용된 경우 일반적으로 환불되지 않습니다. 미사용 크레딧 패키지는 구매 후 14일 이내에 환불될 수 있습니다.",
            ],
          },
          {
            heading: "환불 불가 사항",
            paragraphs: [
              "다음의 경우 환불이 제공되지 않습니다:",
              "- 이미지 생성에 이미 사용된 크레딧",
              "- 구독 갱신(요금 청구를 피하려면 갱신 전에 취소해야 합니다)",
              "- 서비스 이용약관 위반으로 종료된 계정",
              "- 대상 환불 기간 이후의 요청",
              "- 프로모션 또는 할인 구매(법률에서 요구하는 경우 제외)",
            ],
          },
          {
            heading: "환불 요청 방법",
            paragraphs: [
              "환불을 요청하려면 다음 정보를 포함하여 결제팀에 이메일을 보내주세요:",
              "- 등록된 이메일 주소",
              "- 구매 날짜",
              "- 주문 또는 거래 ID(있는 경우)",
              "- 환불 요청 사유",
              "5-7 영업일 이내에 요청을 처리합니다. 승인된 환불은 10 영업일 이내에 원래 결제 방법으로 환불됩니다.",
            ],
          },
          {
            heading: "구독 취소",
            paragraphs: [
              "계정 설정을 통해 언제든지 구독을 취소할 수 있습니다. 취소 시:",
              "- 현재 결제 기간이 끝날 때까지 구독 혜택에 대한 액세스를 유지합니다",
              "- 결제 기간의 남은 일수에 대한 부분 환불은 제공되지 않습니다",
              "- 추가 크레딧을 구매하지 않은 한 크레딧은 결제 기간이 끝나면 만료됩니다",
            ],
          },
          {
            heading: "지불 거절",
            paragraphs: [
              "당사에 먼저 연락하지 않고 은행이나 신용카드 회사에 지불 거절을 요청하면 조사가 진행되는 동안 계정이 일시 중지될 수 있습니다.",
              "지불 거절을 시작하기 전에 결제 문제를 해결하기 위해 지원팀에 연락하시기 바랍니다.",
            ],
          },
          {
            heading: "특별한 상황",
            paragraphs: [
              "예외적인 상황이 발생할 수 있음을 이해합니다. 표준 정책 외에 유효한 환불 사유가 있다고 생각되면 연락하여 상황을 설명해 주세요.",
              "서비스 사용 능력에 심각한 영향을 미친 기술적 문제는 케이스별로 비례 환불 또는 크레딧 연장 대상이 될 수 있습니다.",
            ],
          },
        ],
      },
    },
  },
  footer: {
    logo: "Nano Banana Pro AI",
    logoImage: "https://aiimage.pkgames.org/nano-banana/logo.webp",
    tagline: "AI 기반 이미지 생성 및 편집 플랫폼",
    description: "Nano Banana Pro AI로 멋진 이미지를 만들어보세요 - Google Gemini 3.0 Flash 기반. 전문가급 AI 이미지 생성, 편집, 변환을 몇 초 만에.",
    copyright: "© 2025 Nano Banana Pro AI. All rights reserved.",
    sections: {
      product: {
        title: "제품",
        links: [
          { label: "이미지 편집기", href: "/dashboard", description: "AI로 이미지 편집 및 변환" },
          { label: "배치 생성", href: "/dashboard?tab=batch", description: "여러 이미지를 한 번에 생성" },
          { label: "모델 비교", href: "/dashboard?tab=compare", description: "AI 모델을 나란히 비교" },
          { label: "프롬프트 갤러리", href: "/prompt", description: "창의적인 프롬프트 탐색" },
        ],
      },
      resources: {
        title: "리소스",
        links: [
          { label: "가격", href: "/pricing", description: "가격 플랜 보기" },
          { label: "자주 묻는 질문", href: "/#faq", description: "자주 묻는 질문" },
          { label: "생성 기록", href: "/history", description: "과거 작품 보기" },
        ],
      },
      company: {
        title: "회사",
        links: [
          { label: "지원", href: "/support", description: "계정 도움 받기" },
          { label: "이용약관", href: "/tos", description: "약관 읽기" },
          { label: "개인정보처리방침", href: "/privacy-policy", description: "개인정보가 중요합니다" },
          { label: "환불 정책", href: "/refund-policy", description: "환불 관련 정보" },
        ],
      },
    },
    social: {
      title: "팔로우하기",
      links: [
        { platform: "Twitter", href: "https://twitter.com/nanobananaai", icon: "twitter" },
        { platform: "Discord", href: "https://discord.gg/nanobanana", icon: "discord" },
        { platform: "YouTube", href: "https://youtube.com/@nanobananaai", icon: "youtube" },
      ],
    },
    contact: {
      title: "문의하기",
      email: "BlusDanny1230@gmail.com",
      emailLabel: "이메일 보내기",
    },
    badges: [
      { text: "SOC 2 인증", icon: "shield" },
      { text: "GDPR 준수", icon: "lock" },
      { text: "ISO 27001", icon: "certificate" },
    ],
    seoKeywords: "AI 이미지 생성기, 텍스트 투 이미지, 이미지 편집, Gemini 3.0, AI 아트, 이미지 변환",
  },
};
