import type { SiteContent } from "@/config/content/types";

export const siteContentZh: SiteContent = {
  header: {
    logo: "Nano Banana Pro AI",
    logoImage: "https://aiimage.pkgames.org/nano-banana/logo.webp",
    navLinks: [
      { label: "首页", href: "/" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "价格", href: "/pricing" },
      { label: "Prompt", href: "/prompt" },
      { label: "历史", href: "/history" },
    ],
    loginButton: "登录",
    logoutButton: "退出登录",
    toggleMenuAriaLabel: "切换菜单",
  },
  hero: {
    title: "Nano Banana Pro AI —— 由 Gemini 3.0 Flash Image 驱动的生图与编辑工作室",
    subtitle:
      "体验 Google 革命性的 Nano Banana Pro AI（Gemini 3.0 Flash Image），用于高级图像生成与编辑。通过先进的 AI 技术在 Nano Banana Pro AI 中创建、融合与增强图片。",
    ctaPrimary: "开始体验",
    ctaSecondary: "",
    ctaPrimaryHref: "/dashboard",
    ctaSecondaryHref: "",
  },
  editor: {
    title: "Nano Banana Pro AI - 高级图片编辑器",
    subtitle:
      "用强大的 Nano Banana Pro AI 模型编辑与重塑你的图片 —— 只需简单提示词，即可获得专业级效果",
  },
  textToImage: {
    title: "用文字创造惊艳图像",
    subtitle:
      "只需描述你的想象，Nano Banana Pro AI 就能为你呈现照片级真实的图像作品",
    promptLabel: "提示词",
    tryItLabel: "立即体验",
    moreLabel: "查看更多",
    items: [
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766628634462-0.png",
        prompt: "生成一张人像图片：两根手指间夹着一个细节精美的透明玻璃球/胶囊，背景为纯色。胶囊内是一个迷你Q版[人物姓名]，拥有真实的面部特征但比例可爱——大头小身体。人物应穿着其最具标志性的服装或可识别的衣物。玻璃应展示逼真的反射效果，人物应在内部呈现立体感。照片写实风格，完美光线。",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766628927500-0.png",
        prompt: "创建一个超写实的1080x1080正方形渲染图，展示一只人手轻轻托着一个圆润、带倒角的微缩展示平台，上面是[城市]的3D收藏品立体模型。展示其最具标志性的地标、小比例的现代和历史建筑，以及郁郁葱葱的微缩绿植和树木。平台前缘嵌入一个醒目的3D[New York]标志。使用精致、去饱和的配色方案和哑光纹理，增强逼真的比例模型感。使用柔和的工作室照明、暖色高光和细微的景深阴影。背景为中性灰色渐变，保持一致的视角和透视。添加大气深度、照片级纹理和超精细细节，打造8K品质的高端收藏品美感。",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766629197849-1.png",
        prompt: "我在《疯狂动物城》片场与朱迪·霍普斯和尼克·王尔德自拍。主体与参考图完全一致；面部特征、骨骼结构、肤色、表情、姿势和外观100%相同。",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766629711103-0.png",
        prompt: "创建一张[埃菲尔铁塔]的信息图图片，将地标的真实照片与蓝图风格的技术标注和图解叠加在图像上。在角落用手绘框标注标题[埃菲尔铁塔]。添加白色粉笔风格的草图，展示关键结构数据、重要尺寸、材料用量、内部图解、载荷流向箭头、横截面、平面图以及显著的建筑或工程特征。风格 - 蓝图美学，在照片上用白色线条绘制，技术/建筑标注风格，教育信息图感觉，背景可见真实环境。",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766630256509-0.png",
        prompt: "为圣诞护肤礼盒设计一张专业促销卡，采用垂直布局，极简高端美学风格。使用柔和的渐变背景，从顶部的冰雪白色过渡到底部的浅粉色，营造清新优雅的氛围。在构图的上部中央区域，精心放置一个高端护肤礼盒。礼盒采用哑光白色包装，压印精致的雪花图案和品牌标志(Dior)。礼盒呈打开状态，内部展示三瓶不同大小的护肤品。瓶身设计简洁现代，配有金色瓶盖。在产品周围巧妙布置圣诞装饰元素 - 几枝新鲜松枝、小金铃铛、几颗红浆果和散落的小礼盒。所有道具应精细打光，呈现高端产品摄影效果。卡片顶部使用纤细优雅的字体书写标题 - 圣诞特别版·焕新发光。产品下方中间区域用醒目红色文字突出促销信息 - 限定礼盒8折优惠·买即送5片面膜。底部加入按钮风格的行动号召 - 立即购买·限量发售，并标注促销有效期 - 12月15日至26日。整体设计应强调奢华产品质感和完美平衡的节日氛围。",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766630986146-0.png",
        prompt: "你是一位拥有强烈个人手绘风格的日本漫画家。你是《鬼灭之刃》原创手绘草稿的创作者之一。请使用你独特的漫画线稿草图风格，调用Nano Banana Pro根据你对以下内容的理解生成分镜漫画草稿。不要输出任何分析。直接输出分镜漫画草稿图片。",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766614875845-0.jpeg",
        prompt: "一位拥有飘逸银发的美丽动漫少女，樱花飘落在她周围，柔和的粉色光芒",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766615174387-0.png",
        prompt: "未来感赛博朋克城市夜景，霓虹灯倒映在潮湿的街道上，远处飞行汽车穿梭",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766615566054-1.png",
        prompt: "雄伟的巨龙栖息在山巅，金色鳞片在夕阳下闪耀，奇幻艺术风格",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766615696417-1.png",
        prompt: "温馨咖啡馆内景，秋日午后温暖的阳光透过窗户洒入，复古美学风格",
      },
      // {
      //   image: "https://cdn.ainanobanana.io/nano-banana/d0e1e421-064f-457c-af87-061bbd1a223c.png",
      //   prompt: "水下宫殿与发光生物，珊瑚覆盖的古代遗迹，神秘梦幻氛围",
      // },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766616048580-1.png",
        prompt: "蒸汽朋克飞船漂浮在维多利亚时代的伦敦上空，齿轮与黄铜细节，戏剧性多云天空",
      },
      {
        image: "https://aiimage.pkgames.org/nano-banana/gen-1766616112421-0.png",
        prompt: "魔法森林中巨大的发光蘑菇，精灵灯光点缀，梦幻奇异世界",
      },
      // {
      //   image: "https://cdn.ainanobanana.io/nano-banana/0a9719bb-ca39-493f-8b3e-953d3dc30372.png",
      //   prompt: "身穿传统盔甲的武士站立于竹林中，晨雾缭绕，电影感光影",
      // },
    ],
  },
  imageToImageExamples: {
    title: "用 AI 变换任意图像",
    subtitle:
      "编辑、增强、重塑你的照片——拖动滑块，见证 AI 的魔力",
    beforeLabel: "原图",
    afterLabel: "效果",
    promptLabel: "编辑提示词",
    tryItLabel: "立即体验",
    moreLabel: "查看更多",
    items: [
      {
        before: "https://aiimage.pkgames.org/nano-banana/add-color-0.webp",
        after: "https://aiimage.pkgames.org/nano-banana/add-color-1.webp",
        prompt: "给这张图上色",
      },
      {
        before: "https://aiimage.pkgames.org/nano-banana/beach-scenery-0.webp",
        after: "https://aiimage.pkgames.org/nano-banana/beach-scenery-1.webp",
        prompt: "切换到夜景场景，并使用点光源",
      },
      {
        before: "https://aiimage.pkgames.org/nano-banana/car-0.webp",
        after: "https://aiimage.pkgames.org/nano-banana/car-1.webp",
        prompt: "将背景切换为冬季 snowy 场景",
      },
      {
        before: "https://aiimage.pkgames.org/nano-banana/ui-design-0.webp",
        after: "https://aiimage.pkgames.org/nano-banana/ui-design-1.webp",
        prompt: "根据线框图创建 UI 模型",
      },
      {
        before: "https://aiimage.pkgames.org/nano-banana/line-art-pose-0.webp",
        after: "https://aiimage.pkgames.org/nano-banana/line-art-pose-1.webp",
        prompt: "将右上角的人物换成线稿的姿势，专业摄影棚拍摄",
      },
      {
        before: "https://aiimage.pkgames.org/nano-banana/line-drawing-0.webp",
        after: "https://aiimage.pkgames.org/nano-banana/line-drawing-1.webp",
        prompt: "给线稿上色",
      },
    ],
  },
  examples: {
    title: "示例：看看 Nano Banana 能做到什么",
    resultAlt: "结果",
    afterLabel: "生成后",
    promptUsedLabel: "使用的提示词：",
    items: [
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after: "https://cdn.ainanobanana.io/nanobanana-example-after-2.jpg",
        prompt: "把比基尼换成红色",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after: "https://cdn.ainanobanana.io/nanobanana-example-2-after.png",
        prompt:
          "把这个动漫角色变成手办产品展示：制作一个站在透明圆形底座上的 PVC 实体手办，背后放一个印有角色插画的产品盒，并加入一台电脑显示在 Blender 中进行 3D 建模的过程。",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after:
          "https://cdn.ainanobanana.io/nano-banana/cad910b5-b130-4ae6-bf2c-e813d5572835.png",
        prompt: "修复并给这张照片上色",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after:
          "https://cdn.ainanobanana.io/nano-banana/22a808a5-32d2-4760-812c-07eee8875426.png",
        prompt: "把人物改造成可爱的 Q 版手工钩织毛线娃娃风格。",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after:
          "https://cdn.ainanobanana.io/nano-banana/c06bcfe8-b5f1-4a11-9181-21138d1b46d3.png",
        prompt: "把照片重新想象成梵高《星空》的风格。",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after:
          "https://cdn.ainanobanana.io/nano-banana/47b04301-79bb-431a-a54f-8fc88674bc3c.png",
        prompt: "把头发换成蓝色。",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after:
          "https://cdn.ainanobanana.io/nano-banana/7c7f75bd-84e5-47e6-9b93-f1f2164d2b26.png",
        prompt: "把人物变成乐高小人，并放在产品包装盒里。",
      },
    ],
  },
  communityGallery: {
    title: "来自 Nano Banana Pro AI 社区的惊艳作品",
    subtitle: "见证 Nano Banana Pro AI 把你的想法变成现实——从概念到成品只需几秒",
    promptLabel: "提示词",
    videoPromptLabel: "视频提示词",
    showcases: [
      {
        title: "完整的 Nano Banana Pro AI 转化流程",
        prompt:
          "把这个动漫角色变成手办产品展示：制作一个站在透明圆形底座上的 PVC 实体手办，背后放一个印有角色插画的产品盒，并加入一台电脑显示在 Blender 中进行 3D 建模的过程。",
        videoPrompt: "让动漫角色'活起来'：轻轻微笑、自然眨眼，头发在微风中轻轻摆动",
        image: "https://cdn.ainanobanana.io/ai-poster.png",
        video: "https://image.ainanobanana.io/ai-nanobanana.mp4",
      },
      {
        title: "Nano Banana Pro AI 赛博朋克人像",
        prompt: "将人物转换为赛博朋克风格人像，加入霓虹灯与未来元素",
        image:
          "https://cdn.ainanobanana.io/flux-kontext-dev/1e9de2c2-1fea-473c-a2c0-73191a02940c.png",
      },
      {
        title: "Nano Banana Pro AI 老照片修复",
        prompt: "修复划痕与损坏，并为老照片上色",
        image: "https://cdn.ainanobanana.io/restore-image.png",
      },
    ],
  },
  whyChoose: {
    title: "为什么创作者选择 Nano Banana Pro AI",
    subtitle: "以无与伦比的速度与准确率，带来超越 Flux Kontext 的革命性体验",
    features: [
      {
        icon: "⚡",
        title: "一次生成更接近完美",
        description: "自然语言编辑，首试成功率高达 95%——无需复杂提示词。",
      },
      {
        icon: "🚀",
        title: "闪电般的处理速度",
        description: "60 秒内生成专业图片——比传统 AI 模型快 10 倍。",
      },
      {
        icon: "👤",
        title: "面部补全技术",
        description: "高级人脸重建，真实还原身份特征，细节更逼真一致。",
      },
      {
        icon: "🎭",
        title: "角色一致性编辑",
        description: "多次生成保持角色一致——非常适合打造 AI 虚拟人物/网红。",
      },
      {
        icon: "🔒",
        title: "企业级安全",
        description: "通过 SOC 2、GDPR、ISO 27001 认证——专业团队可信赖。",
      },
      {
        icon: "🎨",
        title: "多风格支持",
        description: "从写实到动漫、油画到水彩——一个模型驾驭所有艺术风格。",
      },
      {
        icon: "🌐",
        title: "多语言提示词",
        description: "支持任意语言书写提示词——中文、日文、韩文、英文等原生支持。",
      },
      {
        icon: "📱",
        title: "跨平台访问",
        description: "随时随地创作——桌面端、平板和手机端无缝体验。",
      },
    ],
  },
  stats: {
    title: "全球创作者信赖之选",
    subtitle: "加入日益壮大的 AI 艺术家和设计师社区",
    items: [
      { value: "10万+", label: "活跃用户" },
      { value: "130万+", label: "生成图片" },
      { value: "99.9%", label: "服务可用性" },
      { value: "4.9/5", label: "用户评分" },
    ],
  },
  testimonials: {
    title: "创作者的声音",
    subtitle: "来自社区的真实反馈",
    items: [
      {
        name: "陈思雨",
        role: "数字艺术家",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        content: "Nano Banana Pro AI 彻底改变了我的工作流程。图像质量令人惊叹，速度无与伦比。现在我创作概念图的速度比以前快了10倍。",
        rating: 5,
      },
      {
        name: "李明远",
        role: "市场总监",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        content: "我们所有的营销活动都使用 Nano Banana。角色生成的一致性非常适合我们的品牌素材。强烈推荐！",
        rating: 5,
      },
      {
        name: "田中优希",
        role: "游戏开发者",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        content: "动漫风格的生成效果绝对惊艳。我试过很多 AI 工具，但 Nano Banana 对艺术细节的理解比其他任何工具都要好。",
        rating: 5,
      },
      {
        name: "Alex Rivera",
        role: "内容创作者",
        avatar: "https://randomuser.me/api/portraits/men/75.jpg",
        content: "60秒出专业级图片简直是颠覆性的。我的 YouTube 封面从未如此精彩。投资回报率太惊人了。",
        rating: 5,
      },
      {
        name: "林晓婷",
        role: "自由插画师",
        avatar: "https://randomuser.me/api/portraits/women/22.jpg",
        content: "作为自由职业者，时间就是金钱。Nano Banana 帮我更快地交付客户作品，而且质量丝毫不打折。客户都赞不绝口！",
        rating: 5,
      },
      {
        name: "王浩然",
        role: "电商创业者",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        content: "以前一次产品拍摄要花500+美元，现在几分钟就搞定了。质量堪比专业摄影。对我的生意来说简直是革命性的改变。",
        rating: 5,
      },
      {
        name: "张雨萱",
        role: "社交媒体运营",
        avatar: "https://randomuser.me/api/portraits/women/56.jpg",
        content: "我同时管理10多个品牌账号。Nano Banana 帮我为每个账号创作独特且符合品牌调性的视觉内容。多风格支持太棒了！",
        rating: 5,
      },
      {
        name: "刘志强",
        role: "独立游戏工作室创始人",
        avatar: "https://randomuser.me/api/portraits/men/67.jpg",
        content: "我们节省了数月的美术制作时间。角色一致性功能非常适合我们的游戏素材。物超所值！",
        rating: 5,
      },
      {
        name: "苏敏",
        role: "时尚博主",
        avatar: "https://randomuser.me/api/portraits/women/33.jpg",
        content: "创作穿搭概念和情绪板从未如此简单。写实质量简直惊人。粉丝们超爱这些内容！",
        rating: 5,
      },
      {
        name: "周杰",
        role: "广告创意总监",
        avatar: "https://randomuser.me/api/portraits/men/52.jpg",
        content: "从概念到客户提案只需几小时而不是几天。Nano Banana 彻底革新了我们的创意流程。整个团队都爱用！",
        rating: 5,
      },
      {
        name: "杨雪",
        role: "童书作者",
        avatar: "https://randomuser.me/api/portraits/women/41.jpg",
        content: "以前给书配插图是最难的部分。现在我可以把故事完全按照想象呈现出来。太神奇了！",
        rating: 5,
      },
      {
        name: "赵伟",
        role: "建筑可视化师",
        avatar: "https://randomuser.me/api/portraits/men/28.jpg",
        content: "快速生成建筑概念和效果图的能力彻底改变了我与客户合作的方式。可视化的利器！",
        rating: 5,
      },
    ],
  },
  modelComparison: {
    title: "AI 图像生成模型对比",
    subtitle: "了解 Nano Banana Pro AI 与其他主流 AI 图像生成工具的对比",
    tableHeaders: {
      model: "模型",
      speed: "速度",
      quality: "质量",
      editingCapability: "编辑能力",
      characterConsistency: "角色一致性",
      pricing: "定价",
      multiLanguage: "多语言支持",
    },
    models: [
      {
        name: "Nano Banana Pro AI",
        icon: "🍌",
        isHighlighted: true,
        speed: { value: "60秒", rating: 5, label: "极速" },
        quality: { value: "4K", rating: 5, label: "卓越" },
        editingCapability: { value: "完整", rating: 5, label: "文本+图像" },
        characterConsistency: { value: "95%", rating: 5, label: "卓越" },
        pricing: { value: "$9.99", rating: 5, label: "实惠" },
        multiLanguage: { value: "支持", rating: 5, label: "50+语言" },
      },
      {
        name: "Midjourney",
        icon: "🎨",
        isHighlighted: false,
        speed: { value: "60秒", rating: 4, label: "快速" },
        quality: { value: "4K", rating: 5, label: "卓越" },
        editingCapability: { value: "有限", rating: 2, label: "仅文本" },
        characterConsistency: { value: "70%", rating: 3, label: "中等" },
        pricing: { value: "$10+", rating: 4, label: "适中" },
        multiLanguage: { value: "有限", rating: 2, label: "主要英文" },
      },
      {
        name: "DALL-E 3",
        icon: "🤖",
        isHighlighted: false,
        speed: { value: "30秒", rating: 5, label: "很快" },
        quality: { value: "HD", rating: 4, label: "良好" },
        editingCapability: { value: "基础", rating: 3, label: "局部重绘" },
        characterConsistency: { value: "60%", rating: 2, label: "较低" },
        pricing: { value: "$20+", rating: 3, label: "较贵" },
        multiLanguage: { value: "支持", rating: 4, label: "良好" },
      },
      {
        name: "Stable Diffusion",
        icon: "🖼️",
        isHighlighted: false,
        speed: { value: "不固定", rating: 3, label: "视配置" },
        quality: { value: "HD-4K", rating: 4, label: "良好" },
        editingCapability: { value: "高级", rating: 4, label: "需配置" },
        characterConsistency: { value: "80%", rating: 4, label: "需LoRA" },
        pricing: { value: "免费/$", rating: 5, label: "开源" },
        multiLanguage: { value: "有限", rating: 2, label: "主要英文" },
      },
      {
        name: "Flux",
        icon: "⚡",
        isHighlighted: false,
        speed: { value: "45秒", rating: 4, label: "快速" },
        quality: { value: "4K", rating: 5, label: "卓越" },
        editingCapability: { value: "良好", rating: 4, label: "Kontext编辑" },
        characterConsistency: { value: "85%", rating: 4, label: "良好" },
        pricing: { value: "$15+", rating: 3, label: "适中" },
        multiLanguage: { value: "有限", rating: 3, label: "基础" },
      },
      {
        name: "Adobe Firefly",
        icon: "🔥",
        isHighlighted: false,
        speed: { value: "30秒", rating: 4, label: "快速" },
        quality: { value: "HD", rating: 4, label: "良好" },
        editingCapability: { value: "良好", rating: 4, label: "Adobe套件" },
        characterConsistency: { value: "65%", rating: 3, label: "中等" },
        pricing: { value: "$23+", rating: 2, label: "较贵" },
        multiLanguage: { value: "支持", rating: 4, label: "良好" },
      },
    ],
    footer: "* 对比数据基于2025年公开信息，实际性能可能有所不同。",
  },
  pricing: {
    title: "为每一位创作者准备的 Nano Banana Pro AI",
    subtitle: "从爱好者到专业团队——加入每天生成海量图片的 Nano Banana Pro AI 社区。",
    toggleLabels: {
      monthly: "按月订阅",
      yearly: "按年订阅",
      yearlyDiscount: "-20%",
      onetime: "一次性购买",
    },
    getStartedButton: "立即开始",
    buyNowButton: "立即购买",
    creditsLabel: "积分",
    onetimeTitle: "💎 积分包",
    onetimeSubtitle: "无需订阅 • 永不过期 • 随时使用",
    monthlyPlans: [
      {
        name: "基础版",
        description: "适合个人与小型项目",
        price: "$9.99",
        period: "/月",
        features: [
          "每月 100 积分",
          "50 张高质量图片",
          "标准生成速度",
          "基础客服支持",
          "PNG 格式下载",
          "商业授权",
        ],
        highlighted: false,
      },
      {
        name: "标准版",
        description: "最适合创作者和小团队",
        price: "$19.99",
        period: "/月",
        badge: "🔥 最受欢迎",
        features: [
          "每月 500 积分",
          "250 张高质量图片",
          "优先生成队列",
          "优先客服支持",
          "PNG 格式下载",
          "商业授权与编辑工具",
        ],
        highlighted: true,
      },
      {
        name: "专业版",
        description: "适合大型团队与企业",
        price: "$49.99",
        period: "/月",
        features: [
          "每月 2000 积分",
          "1000 张高质量图片",
          "最快生成速度",
          "专属客户经理",
          "全格式下载",
          "商业授权与高级工具",
        ],
        highlighted: false,
      },
    ],
    yearlyPlans: [
      {
        name: "基础版",
        description: "适合个人与小型项目",
        price: "$95.88",
        originalPrice: "$119.88",
        period: "/年",
        monthlyEquiv: "折合 $7.99/月",
        saveBadge: "省 20%",
        features: [
          "每年 1,200 积分",
          "600 张高质量图片",
          "标准生成速度",
          "基础客服支持",
          "PNG 格式下载",
          "商业授权",
        ],
        highlighted: false,
      },
      {
        name: "标准版",
        description: "最适合创作者和小团队",
        price: "$191.88",
        originalPrice: "$239.88",
        period: "/年",
        monthlyEquiv: "折合 $15.99/月",
        saveBadge: "省 20%",
        badge: "🎉 最超值",
        features: [
          "每年 6,000 积分",
          "3,000 张高质量图片",
          "优先生成队列",
          "优先客服支持",
          "PNG 格式下载",
          "商业授权与编辑工具",
        ],
        highlighted: true,
      },
      {
        name: "专业版",
        description: "适合大型团队与企业",
        price: "$479.88",
        originalPrice: "$599.88",
        period: "/年",
        monthlyEquiv: "折合 $39.99/月",
        saveBadge: "省 20%",
        features: [
          "每年 24,000 积分",
          "12,000 张高质量图片",
          "最快生成速度",
          "专属客户经理",
          "全格式下载",
          "商业授权与高级工具",
        ],
        highlighted: false,
      },
    ],
    onetimePlans: [
      {
        name: "入门包",
        description: "先试试看",
        price: "$9.99",
        credits: "800",
        features: [
          "一次性购买",
          "积分永不过期",
          "快速生成图片",
          "商业授权",
        ],
        highlighted: false,
      },
      {
        name: "超值包",
        description: "最受欢迎的选择",
        price: "$19.99",
        credits: "2,000",
        monthlyEquiv: "比入门包省 25%",
        badge: "💰 最超值",
        features: [
          "一次性购买",
          "积分永不过期",
          "快速生成图片",
          "商业授权",
          "永久历史记录",
        ],
        highlighted: true,
      },
      {
        name: "豪华包",
        description: "重度用户首选",
        price: "$39.99",
        credits: "5,000",
        monthlyEquiv: "比入门包省 40%",
        features: [
          "一次性购买",
          "积分永不过期",
          "最快生成速度",
          "商业授权",
          "永久历史记录",
          "优先客服支持",
        ],
        highlighted: false,
      },
    ],
    trustBadges: [
      { icon: "🛡️", text: "30 天无理由退款" },
      { icon: "💳", text: "安全支付" },
      { icon: "❌", text: "随时取消" },
      { icon: "🎧", text: "24/7 客服支持" },
    ],
  },
  tweets: {
    title: "Nano Banana Pro AI 推文探索",
    subtitle: "看看创作者们如何评价 Nano Banana Pro AI",
  },
  faq: {
    title: "关于 Nano Banana Pro AI 的常见问题",
    items: [
      {
        question: "什么是 Nano Banana Pro AI？",
        answer:
          "Nano Banana Pro AI 是由 Google 的 Gemini 3.0 Flash Image 技术驱动的高级图像生成与编辑平台。你可以通过简单的提示词来创建、编辑与转换图片。",
      },
      {
        question: "出图速度有多快？",
        answer:
          "在优化的基础设施与算法加持下，Nano Banana Pro AI 可在 60 秒内生成专业图片——比传统 AI 模型快 10 倍。",
      },
      {
        question: "什么是面部补全技术？",
        answer:
          "我们的面部重建技术能够以写实精度保留身份特征，让生成图片中的人脸更真实、细节更丰富且一致。",
      },
      {
        question: "可以用于商业项目吗？",
        answer:
          "可以！所有付费套餐都包含商业使用权，你可以将生成图片用于业务、营销或任何商业用途。",
      },
      {
        question: "什么是角色一致性？",
        answer:
          "角色一致性可以让同一角色在不同姿势与场景的多次生成中保持一致，非常适合打造 AI 虚拟人物或品牌角色。",
      },
      {
        question: "Nano Banana Pro AI 有哪些安全认证？",
        answer:
          "我们通过 SOC 2、GDPR、ISO 27001 认证。你的数据与作品受到企业级安全保护，深受专业团队信赖。",
      },
      {
        question: "订阅可以随时取消吗？",
        answer:
          "可以。订阅可随时取消，你仍可使用至当前计费周期结束。",
      },
      {
        question: "Nano Banana Pro AI 适合专业创作工作吗？",
        answer:
          "当然适合！Nano Banana Pro AI 专为专业用途设计，提供 4K 分辨率输出、商业授权以及企业级安全保障（SOC 2、GDPR、ISO 27001 认证）。众多营销机构、游戏工作室和内容创作者都依赖它来制作高质量素材。",
      },
      {
        question: "Nano Banana Pro AI 能在多次编辑中保持角色一致性吗？",
        answer:
          "可以，这是我们的核心优势之一——多次生成中角色一致性高达 95%。你可以创建一个角色后，在不同姿势、场景和风格中生成它，同时保持其身份特征——非常适合 AI 虚拟人、品牌吉祥物或游戏角色。",
      },
      {
        question: "Nano Banana Pro AI 可以进行哪些类型的编辑？",
        answer:
          "Nano Banana Pro AI 支持全面的图像编辑功能，包括：风格转换（动漫、油画、水彩等）、背景替换、物体移除/添加、老照片修复与上色、文生图、图生图转换，以及从线框图创建 UI 设计稿。",
      },
      {
        question: "Nano Banana Pro AI 与 Flux Kontext 有什么不同？",
        answer:
          "虽然两者都是强大的 AI 图像工具，但 Nano Banana Pro AI 具有多项优势：更快的处理速度（60 秒 vs 不固定时间）、更高的角色一致性（95% vs 85%）、原生支持 50+ 种语言、更实惠的价格（起步价 $9.99），以及完整的文本+图像编辑能力，而 Flux Kontext 的编辑选项相对有限。",
      },
      {
        question: "Nano Banana Pro AI 到底是什么，它是如何工作的？",
        answer:
          "Nano Banana Pro AI 是一个由 Google Gemini 3.0 Flash Image 技术驱动的高级 AI 图像生成与编辑平台。你只需用自然语言描述想要的内容（支持 50+ 种语言），可选择性地上传参考图片，我们的 AI 就会在约 60 秒内生成或转换图像。它能理解上下文、保持角色一致性，并生成适合专业用途的 4K 品质输出。",
      },
    ],
  },
  imageToVideo: {
    title: "图转视频 - 让照片动起来",
    subtitle: "用 AI 将你的图片变成惊艳视频",
    model: "Veo3：高品质 • 16:9 • 720p • 8 秒",
    uploadPanelTitle: "上传图片",
    uploadPlaceholder: "点击上传或拖拽到此处",
    uploadHint: "支持格式：JPG、PNG、WebP",
    animationPromptLabel: "动画提示词",
    animationPromptPlaceholder: "描述你希望图片如何动起来……",
    generateButton: "生成视频",
    generatedPanelTitle: "生成结果",
    generatedPlaceholder: "生成的视频会出现在这里",
    exampleModelLabel: "模型：Google Veo3",
    examplePromptLabel: "示例提示词：",
    examplePrompt: "让动漫角色动起来：轻轻微笑、自然眨眼，头发在微风中轻轻摆动",
  },
  prompt: {
    title: "Nano Banana Pro 展示",
    subtitle: "探索精彩的 AI 生成图片，发现背后的提示词",
    textToImageTab: "文生图",
    imageToImageTab: "图生图",
    textToImageTitle: "文生图画廊",
    textToImageSubtitle: "点击任意图片查看完整提示词",
    imageToImageTitle: "图像转换示例",
    imageToImageSubtitle: "拖动滑块对比前后效果",
    beforeLabel: "原图",
    afterLabel: "效果",
    promptLabel: "提示词",
    copyPrompt: "复制提示词",
    copied: "已复制！",
    tryItLabel: "立即体验",
    ctaTitle: "准备好创建你自己的作品了吗？",
    ctaSubtitle: "使用 Nano Banana Pro AI 开始生成精彩图片",
    ctaButton: "立即体验 Nano Banana",
    modelLabel: "Nano Banana Pro"
  },
  explore: {
    title: "Nano Banana Pro AI 探索",
    subtitle: "在 100 万条提示词中寻找灵感，释放你的想象力！",
    emptyMessage: "未找到图片",
    imageAltPrefix: "探索图片",
    overlayModel: "Nano Banana Pro AI",
    overlayPrompt: "创意生成中…",
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
    title: "我的生成历史",
    subtitle: "查看你过去的创作",
    emptyMessage: "暂无历史记录，先开始生成吧！",
  },
  legal: {
    titles: {
      support: "支持",
      tos: "服务条款",
      privacy: "隐私政策",
      refund: "退款政策",
    },
    content: {
      support: {
        lastUpdated: "最后更新：2024年12月",
        contactTitle: "联系我们",
        contactText: "如有任何问题或需要支持，请发送邮件至：",
        contactEmail: "support@ainanobanana.io",
        sections: [
          {
            heading: "我们能如何帮助您？",
            paragraphs: [
              "欢迎来到 Nano Banana Pro AI 支持中心。我们将帮助您充分利用我们的 AI 图像生成平台。",
              "我们的支持团队可以协助您处理账户问题、账单疑问、技术问题以及有关我们服务的一般咨询。",
            ],
          },
          {
            heading: "常见问题",
            paragraphs: [
              "账户与账单：如有关于订阅、积分或付款问题的疑问，请在联系我们时提供您的注册邮箱地址。",
              "技术问题：如果您在图像生成过程中遇到问题，请详细描述问题并附上您收到的任何错误信息。",
              "功能建议：我们非常欢迎用户的反馈！请随时分享您对新功能或改进的想法。",
            ],
          },
          {
            heading: "响应时间",
            paragraphs: [
              "我们通常在 24-48 个工作小时内回复所有咨询。高级订阅用户享有优先支持，响应速度更快。",
              "如有紧急账单问题，请在邮件主题中注明「紧急」。",
            ],
          },
          {
            heading: "自助资源",
            paragraphs: [
              "在联系客服之前，您可以在首页的常见问题部分找到答案。许多关于图像生成、积分和账户管理的常见问题都已在那里涵盖。",
            ],
          },
        ],
      },
      tos: {
        lastUpdated: "最后更新：2024年12月",
        contactTitle: "联系方式",
        contactText: "如对本条款有任何疑问，请联系：",
        contactEmail: "legal@ainanobanana.io",
        sections: [
          {
            heading: "1. 条款接受",
            paragraphs: [
              "访问或使用 Nano Banana Pro AI（「服务」）即表示您同意受本服务条款的约束。如果您不同意这些条款，请勿使用我们的服务。",
              "我们保留随时修改这些条款的权利。在条款变更后继续使用服务即表示接受修改后的条款。",
            ],
          },
          {
            heading: "2. 服务说明",
            paragraphs: [
              "Nano Banana Pro AI 提供基于 AI 的图像生成和编辑服务。用户可以使用文本提示词和参考图像来创建、编辑和转换图像。",
              "服务按「现状」提供，我们不保证使用我们的 AI 模型能获得特定的结果或效果。",
            ],
          },
          {
            heading: "3. 用户账户",
            paragraphs: [
              "创建账户时，您必须提供准确的信息。您有责任维护账户凭据的安全。",
              "您不得与他人共享账户或允许未经授权的访问。我们保留暂停或终止违反这些条款的账户的权利。",
            ],
          },
          {
            heading: "4. 可接受使用",
            paragraphs: [
              "您同意不使用本服务生成非法、有害、威胁性、辱骂性、诽谤性或其他令人反感的内容。",
              "您不得使用本服务创建侵犯他人知识产权的内容，或生成旨在误导的深度伪造或欺骗性媒体。",
              "我们保留删除任何违反可接受使用政策的内容并暂停账户的权利。",
            ],
          },
          {
            heading: "5. 知识产权",
            paragraphs: [
              "使用付费订阅通过我们的服务生成的图像包含商业使用权。您保留对您创建的图像的所有权。",
              "在销售或许可 AI 生成的图像时，您不得声称这些图像是原创照片或人工创作的艺术品。",
              "我们的平台、技术和品牌仍然是我们的专有知识产权。",
            ],
          },
          {
            heading: "6. 付款与订阅",
            paragraphs: [
              "付费订阅按月或按年预付费。购买的积分不可退款，除非退款政策中另有规定。",
              "我们保留在提前 30 天通知现有订阅用户的情况下更改价格的权利。",
            ],
          },
          {
            heading: "7. 责任限制",
            paragraphs: [
              "在法律允许的最大范围内，Nano Banana Pro AI 不对因使用本服务而产生的任何间接、附带、特殊或后果性损害承担责任。",
              "我们的总责任不超过您在索赔发生前 12 个月内为服务支付的金额。",
            ],
          },
          {
            heading: "8. 终止",
            paragraphs: [
              "如果您违反这些条款，我们可能会随时终止或暂停您的账户。您可以随时通过账户设置取消账户。",
              "终止后，您使用服务的权利将立即停止。账户终止后，我们可能会删除您的数据。",
            ],
          },
          {
            heading: "9. 适用法律",
            paragraphs: [
              "本条款应根据适用法律进行解释和管辖。任何争议应通过具有约束力的仲裁解决。",
            ],
          },
        ],
      },
      privacy: {
        lastUpdated: "最后更新：2024年12月",
        contactTitle: "联系我们",
        contactText: "如有隐私相关问题，请联系：",
        contactEmail: "privacy@ainanobanana.io",
        sections: [
          {
            heading: "1. 我们收集的信息",
            paragraphs: [
              "账户信息：当您创建账户时，我们会收集您的电子邮件地址和来自第三方提供商（如 Google OAuth）的身份验证信息。",
              "使用数据：我们收集有关您如何使用我们服务的信息，包括使用的提示词、生成的图像和功能使用模式。",
              "付款信息：付款处理由第三方提供商处理。我们不存储您的完整信用卡详细信息。",
              "设备信息：出于安全和分析目的，我们收集标准技术信息，如浏览器类型、IP 地址和设备标识符。",
            ],
          },
          {
            heading: "2. 我们如何使用您的信息",
            paragraphs: [
              "提供和维护服务，处理交易，发送服务相关通信。",
              "通过汇总的匿名使用分析来改进我们的 AI 模型和服务质量。",
              "检测和防止欺诈、滥用和安全事件。",
              "遵守法律义务并响应当局的合法请求。",
            ],
          },
          {
            heading: "3. 数据共享",
            paragraphs: [
              "我们不会将您的个人信息出售给第三方。",
              "我们可能会与帮助我们运营服务的服务提供商共享数据（支付处理商、云托管、分析）。",
              "当法律要求或为了保护我们的权利和安全时，我们可能会披露信息。",
            ],
          },
          {
            heading: "4. 数据保留",
            paragraphs: [
              "账户数据在您的账户处于活动状态期间保留。生成的图像根据您的订阅级别进行存储。",
              "您可以随时通过联系客服请求删除您的账户和相关数据。",
              "即使在账户删除后，某些数据也可能因法律合规要求而被保留。",
            ],
          },
          {
            heading: "5. 数据安全",
            paragraphs: [
              "我们实施行业标准的安全措施，包括加密、访问控制和定期安全审计。",
              "我们已通过 SOC 2、GDPR 和 ISO 27001 认证，证明我们对数据保护的承诺。",
              "虽然我们努力保护您的数据，但互联网上的传输方式没有 100% 安全的。",
            ],
          },
          {
            heading: "6. 您的权利",
            paragraphs: [
              "您有权访问、更正或删除您的个人信息。",
              "您可以随时选择退出营销通信。",
              "欧盟/欧洲经济区用户根据 GDPR 拥有额外权利，包括数据可移植性和反对处理的权利。",
            ],
          },
          {
            heading: "7. Cookie 和跟踪",
            paragraphs: [
              "我们使用必要的 Cookie 进行身份验证和服务功能。",
              "我们使用分析工具来了解用户如何与我们的服务互动。您可以通过浏览器设置控制 Cookie 偏好。",
            ],
          },
          {
            heading: "8. 儿童隐私",
            paragraphs: [
              "我们的服务不面向 13 岁以下的儿童。我们不会故意收集 13 岁以下儿童的信息。如果我们得知已收集此类信息，我们将立即删除。",
            ],
          },
          {
            heading: "9. 国际数据传输",
            paragraphs: [
              "您的数据可能会在您居住地以外的国家进行处理。我们确保为国际传输采取适当的保障措施。",
            ],
          },
          {
            heading: "10. 政策变更",
            paragraphs: [
              "我们可能会定期更新本隐私政策。重大变更将通过电子邮件或服务通知您。",
            ],
          },
        ],
      },
      refund: {
        lastUpdated: "最后更新：2024年12月",
        contactTitle: "申请退款",
        contactText: "如需申请退款，请联系：",
        contactEmail: "billing@ainanobanana.io",
        sections: [
          {
            heading: "退款资格",
            paragraphs: [
              "我们希望您对 Nano Banana Pro AI 感到满意。如果您对购买不满意，我们在以下条件下提供退款：",
              "订阅计划：如果您使用的积分不超过分配积分的 20%，您可以在首次订阅购买后 7 天内申请全额退款。",
              "加购积分包：一旦积分被使用，积分包购买通常不可退款。未使用的积分包可在购买后 14 天内退款。",
            ],
          },
          {
            heading: "不可退款情况",
            paragraphs: [
              "以下情况不提供退款：",
              "- 已用于图像生成的积分",
              "- 订阅续费（您应在续费前取消以避免收费）",
              "- 因违反服务条款而被终止的账户",
              "- 在符合条件的退款期限后提出的请求",
              "- 促销或折扣购买（除非法律要求）",
            ],
          },
          {
            heading: "如何申请退款",
            paragraphs: [
              "如需申请退款，请发送电子邮件给我们的账单团队，并提供以下信息：",
              "- 您的注册邮箱地址",
              "- 购买日期",
              "- 订单或交易 ID（如有）",
              "- 退款原因",
              "我们将在 5-7 个工作日内处理您的请求。批准的退款将在 10 个工作日内退回到您的原始支付方式。",
            ],
          },
          {
            heading: "订阅取消",
            paragraphs: [
              "您可以随时通过账户设置取消订阅。取消后：",
              "- 您将保留订阅权益直到当前计费周期结束",
              "- 计费周期剩余天数不提供部分退款",
              "- 除非您购买了加购积分，否则您的积分将在计费周期结束时失效",
            ],
          },
          {
            heading: "拒付",
            paragraphs: [
              "如果您在联系我们之前先向银行或信用卡公司发起拒付，您的账户可能会在调查期间被暂停。",
              "我们鼓励您在发起拒付之前联系我们的支持团队解决任何账单问题。",
            ],
          },
          {
            heading: "特殊情况",
            paragraphs: [
              "我们理解可能会出现特殊情况。如果您认为您有超出我们标准政策的有效退款理由，请联系我们并说明您的情况。",
              "严重影响您使用服务能力的技术问题可能有资格按比例退款或延长积分有效期，具体视情况而定。",
            ],
          },
        ],
      },
    },
  },
  footer: {
    logo: "Nano Banana Pro AI",
    logoImage: "https://aiimage.pkgames.org/nano-banana/logo.webp",
    tagline: "AI驱动的图像生成与编辑平台",
    description: "使用 Nano Banana Pro AI 创作精美图像 - 由 Google Gemini 3.0 Flash 驱动。专业级 AI 图像生成、编辑和转换，秒速完成。",
    copyright: "© 2025 Nano Banana Pro AI. 保留所有权利。",
    sections: {
      product: {
        title: "产品",
        links: [
          { label: "图像编辑器", href: "/dashboard", description: "用AI编辑和转换图像" },
          { label: "批量生成", href: "/dashboard?tab=batch", description: "一次生成多张图像" },
          { label: "模型对比", href: "/dashboard?tab=compare", description: "并排比较AI模型" },
          { label: "提示词画廊", href: "/prompt", description: "探索创意提示词" },
        ],
      },
      resources: {
        title: "资源",
        links: [
          { label: "定价", href: "/pricing", description: "查看定价方案" },
          { label: "常见问题", href: "/#faq", description: "常见问题解答" },
          { label: "生成历史", href: "/history", description: "查看您的创作记录" },
        ],
      },
      company: {
        title: "公司",
        links: [
          { label: "支持", href: "/support", description: "获取账户帮助" },
          { label: "服务条款", href: "/tos", description: "阅读服务条款" },
          { label: "隐私政策", href: "/privacy-policy", description: "您的隐私至关重要" },
          { label: "退款政策", href: "/refund-policy", description: "退款相关信息" },
        ],
      },
    },
    social: {
      title: "关注我们",
      links: [
        { platform: "Twitter", href: "https://twitter.com/nanobananaai", icon: "twitter" },
        { platform: "Discord", href: "https://discord.gg/nanobanana", icon: "discord" },
        { platform: "YouTube", href: "https://youtube.com/@nanobananaai", icon: "youtube" },
      ],
    },
    contact: {
      title: "联系我们",
      email: "BlusDanny1230@gmail.com",
      emailLabel: "发送邮件",
    },
    badges: [
      { text: "SOC 2 认证", icon: "shield" },
      { text: "GDPR 合规", icon: "lock" },
      { text: "ISO 27001", icon: "certificate" },
    ],
    seoKeywords: "AI图像生成器, 文生图, 图像编辑, Gemini 3.0, AI艺术, 图像转换",
  },
};
