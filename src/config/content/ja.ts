import type { SiteContent } from "@/config/content/types";

export const siteContentJa: SiteContent = {
  header: {
    logo: "Nano Banana AI",
    logoImage: "https://cdn.ainanobanana.io/icon.png",
    navLinks: [
      { label: "ホーム", href: "/" },
      { label: "ダッシュボード", href: "/dashboard" },
      { label: "料金", href: "/pricing" },
      { label: "探索", href: "/explore" },
      { label: "画像→動画", href: "/image-to-video" },
      { label: "履歴", href: "/history" },
    ],
    loginButton: "ログイン",
    logoutButton: "ログアウト",
    toggleMenuAriaLabel: "メニュー切替",
  },
  hero: {
    title: "Nano Banana AI — Gemini 2.5 Flash Image 搭載の生成・編集スタジオ",
    subtitle:
      "Google の革新的な Nano Banana AI（Gemini 2.5 Flash Image）で高度な画像生成と編集を体験。Nano Banana AI で画像の作成・合成・強化を行えます（Google AI Studio の代替として）。",
    ctaPrimary: "今すぐ試す",
    ctaSecondary: "画像→動画",
    ctaPrimaryHref: "/dashboard",
    ctaSecondaryHref: "/image-to-video",
  },
  editor: {
    title: "Nano Banana AI - 高度な画像エディター",
    subtitle:
      "強力な Nano Banana AI モデルで画像を編集・変換。短いプロンプトだけでプロ品質の編集を実現します。",
  },
  examples: {
    title: "例：Nano Banana でできること",
    resultAlt: "結果",
    afterLabel: "変更後",
    promptUsedLabel: "使用したプロンプト：",
    items: [
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after: "https://cdn.ainanobanana.io/nanobanana-example-after-2.jpg",
        prompt: "ビキニの色を赤に変更して",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after: "https://cdn.ainanobanana.io/nanobanana-example-2-after.png",
        prompt:
          "このアニメキャラをフィギュアの製品展示に変換：透明の丸台座に立つPVCフィギュアを作り、背面にキャラアートの箱を置き、Blenderでの3Dモデリング作業を表示するモニターも追加する。",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after:
          "https://cdn.ainanobanana.io/nano-banana/cad910b5-b130-4ae6-bf2c-e813d5572835.png",
        prompt: "写真を修復してカラー化して",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after:
          "https://cdn.ainanobanana.io/nano-banana/22a808a5-32d2-4760-812c-07eee8875426.png",
        prompt: "人物を手編みのかぎ針編み人形（チビ風）に変換して",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after:
          "https://cdn.ainanobanana.io/nano-banana/c06bcfe8-b5f1-4a11-9181-21138d1b46d3.png",
        prompt: "写真をゴッホの『星月夜』風に再解釈して",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after:
          "https://cdn.ainanobanana.io/nano-banana/47b04301-79bb-431a-a54f-8fc88674bc3c.png",
        prompt: "髪色を青に変更して",
      },
      {
        before: "https://cdn.ainanobanana.io/nanobanana-example-before.png",
        after:
          "https://cdn.ainanobanana.io/nano-banana/7c7f75bd-84e5-47e6-9b93-f1f2164d2b26.png",
        prompt: "人物をLEGOミニフィグにして、パッケージ箱の中に入れて",
      },
    ],
  },
  communityGallery: {
    title: "Nano Banana AI コミュニティの作品集",
    subtitle:
      "アイデアが現実になる瞬間を体験。コンセプトからプロダクトまで数秒で。",
    promptLabel: "プロンプト",
    videoPromptLabel: "動画プロンプト",
    showcases: [
      {
        title: "Nano Banana AI 変換パイプライン（完全版）",
        prompt:
          "このアニメキャラをフィギュアの製品展示に変換：透明の丸台座に立つPVCフィギュアを作り、背面にキャラアートの箱を置き、Blenderでの3Dモデリング作業を表示するモニターも追加する。",
        videoPrompt:
          "アニメキャラを生き生きと：優しく微笑み、自然に瞬きし、髪がそよ風で揺れる",
        image: "https://cdn.ainanobanana.io/ai-poster.png",
        video: "https://image.ainanobanana.io/ai-nanobanana.mp4",
      },
      {
        title: "Nano Banana AI サイバーパンク・ポートレート",
        prompt: "ネオンと未来要素を加えたサイバーパンク風ポートレートに変換",
        image:
          "https://cdn.ainanobanana.io/flux-kontext-dev/1e9de2c2-1fea-473c-a2c0-73191a02940c.png",
      },
      {
        title: "Nano Banana AI 写真修復",
        prompt: "傷や破損を修復し、古い写真をカラー化する",
        image: "https://cdn.ainanobanana.io/restore-image.png",
      },
    ],
  },
  whyChoose: {
    title: "クリエイターが Nano Banana AI を選ぶ理由",
    subtitle:
      "Flux Kontext を超える、圧倒的な速度と精度の革新的テクノロジー",
    features: [
      {
        icon: "⚡",
        title: "一発で高精度",
        description:
          "自然言語で編集でき、初回成功率は最大95%。複雑なプロンプトは不要です。",
      },
      {
        icon: "🚀",
        title: "超高速処理",
        description:
          "1秒未満でプロ品質の画像を生成。従来モデルの10倍の速さです。",
      },
      {
        icon: "👤",
        title: "顔補完テクノロジー",
        description:
          "フォトリアルな精度でアイデンティティを保ち、自然で一貫した顔を生成します。",
      },
      {
        icon: "🎭",
        title: "キャラクター一貫性",
        description:
          "複数回生成でもキャラの一貫性を維持。AIインフルエンサーにも最適。",
      },
      {
        icon: "🔒",
        title: "エンタープライズ級セキュリティ",
        description:
          "SOC 2 / GDPR / ISO 27001 準拠。プロチームに信頼されています。",
      },
      {
        icon: "💳",
        title: "カード不要",
        description:
          "すぐに開始。登録のハードルなしで強力なAIツールに即アクセスできます。",
      },
    ],
  },
  pricing: {
    title: "すべてのクリエイターへ — Nano Banana AI",
    subtitle:
      "趣味からプロまで。毎日数百万枚を生成するコミュニティへ参加しよう。",
    selectPaymentMethod: "支払い方法を選択",
    addonsTitle: "追加クレジット",
    plans: [
      {
        name: "ベーシック",
        description: "個人・小規模チーム向け",
        price: "$9.99",
        period: "/月",
        features: [
          "月100クレジット",
          "高品質画像 50枚/月",
          "標準速度",
          "基本サポート",
          "PNGダウンロード",
          "年払いで 1200 クレジット（即時付与）",
          "商用ライセンス & 無制限利用",
        ],
        highlighted: false,
      },
      {
        name: "スタンダード",
        description: "個人・小規模チーム向け",
        price: "$19.99",
        period: "/月",
        badge: "🔥最安値：50%お得",
        features: [
          "月500クレジット",
          "高品質画像 250枚/月",
          "優先キュー",
          "優先サポート",
          "PNGダウンロード",
          "年払いで 6000 クレジット（即時付与）",
          "商用ライセンス & 画像編集ツール",
        ],
        highlighted: true,
      },
      {
        name: "プロ",
        description: "大規模チーム・企業向け",
        price: "$49.99",
        period: "/月",
        features: [
          "月2000クレジット",
          "高品質画像 1000枚/月",
          "最速速度",
          "専任アカウント担当",
          "全形式ダウンロード",
          "年払いで 24000 クレジット（即時付与）",
          "商用ライセンス & 高度な編集ツール",
        ],
        highlighted: false,
      },
      {
        name: "年額特別",
        description: "1年まるごと、すべてのプレミアム機能を利用",
        price: "$299",
        period: "/年",
        features: [
          "年額無制限クレジット",
          "プレミアム機能すべて",
          "優先サポート",
          "高度なAIモデル",
          "全形式ダウンロード",
          "商用ライセンス & 無制限利用",
        ],
        highlighted: false,
      },
    ],
    addons: [
      {
        name: "小追加パック",
        description: "もっとクレジットが必要ですか？",
        price: "$9.99",
        credits: "800 クレジット",
        features: ["買い切り", "800 クレジット", "サブスクなし", "高速生成", "履歴保存", "商用ライセンス"],
      },
      {
        name: "大追加パック",
        description: "もっとクレジットが必要ですか？",
        price: "$19.99",
        credits: "1600 クレジット",
        features: ["買い切り", "1600 クレジット", "サブスクなし", "高速生成", "履歴保存", "商用ライセンス"],
      },
    ],
  },
  tweets: {
    title: "Nano Banana AI Tweets 探索",
    subtitle: "クリエイターの声をチェック",
  },
  faq: {
    title: "Nano Banana AI よくある質問",
    items: [
      {
        question: "Nano Banana AI とは？",
        answer:
          "Nano Banana AI は Google の Gemini 2.5 Flash Image 技術を搭載した画像生成・編集プラットフォームです。短いプロンプトで作成・編集・変換ができます。",
      },
      {
        question: "生成速度は？",
        answer:
          "最適化された基盤により、1秒未満でプロ品質の画像を生成。従来モデルの10倍の速さです。",
      },
      {
        question: "顔補完技術とは？",
        answer:
          "アイデンティティを保ちながらフォトリアルに再構成し、自然で一貫した顔を生成します。",
      },
      {
        question: "商用利用できますか？",
        answer:
          "はい。すべての有料プランに商用利用権が含まれます。ビジネスやマーケティング用途にも利用可能です。",
      },
      {
        question: "クレジットカードは必要？",
        answer:
          "不要です。カードなしで今すぐ開始でき、強力なAIツールに即アクセスできます。",
      },
      {
        question: "キャラクター一貫性とは？",
        answer:
          "複数回生成でも同じキャラを保てます。AIインフルエンサーやブランドキャラクター作成に最適です。",
      },
      {
        question: "セキュリティ認証は？",
        answer:
          "SOC 2 / GDPR / ISO 27001 に準拠。企業レベルのセキュリティでデータと作品を保護します。",
      },
      {
        question: "サブスクはいつでも解約できますか？",
        answer:
          "はい。いつでも解約可能で、請求期間終了まで特典を利用できます。",
      },
    ],
  },
  imageToVideo: {
    title: "画像→動画 - 写真を動かそう",
    subtitle: "AIで画像を魅力的な動画に変換",
    model: "Veo3：高品質 • 16:9 • 720p • 8秒",
    uploadPanelTitle: "画像をアップロード",
    uploadPlaceholder: "クリックしてアップロード、またはドラッグ＆ドロップ",
    uploadHint: "対応形式：JPG / PNG / WebP",
    animationPromptLabel: "アニメーションプロンプト",
    animationPromptPlaceholder: "どう動かしたいかを説明してください…",
    generateButton: "動画を生成",
    generatedPanelTitle: "生成動画",
    generatedPlaceholder: "生成された動画がここに表示されます",
    exampleModelLabel: "モデル：Google Veo3",
    examplePromptLabel: "例：",
    examplePrompt:
      "アニメキャラを生き生きと：優しく微笑み、自然に瞬きし、髪がそよ風で揺れる",
  },
  explore: {
    title: "Nano Banana AI 探索",
    subtitle: "100万のプロンプトからインスピレーションを見つけよう！",
    emptyMessage: "画像が見つかりません",
    imageAltPrefix: "探索アイテム",
    overlayModel: "Nano Banana AI",
    overlayPrompt: "クリエイティブ生成…",
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
    title: "生成履歴",
    subtitle: "過去の作品を確認",
    emptyMessage: "履歴がありません。まずは生成してみましょう！",
  },
  legal: {
    contentComingSoon: "コンテンツは準備中です…",
    titles: {
      support: "サポート",
      tos: "利用規約",
      privacy: "プライバシーポリシー",
      refund: "返金ポリシー",
    },
  },
  footer: {
    logo: "ainanobanana.io",
    copyright: "Copyright ainanobanana.io © 2025 - All rights reserved",
    links: [
      { label: "サポート", href: "/support" },
      { label: "規約", href: "/tos" },
      { label: "プライバシー", href: "/privacy-policy" },
      { label: "返金ポリシー", href: "/refund-policy" },
    ],
  },
};
