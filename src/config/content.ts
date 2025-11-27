export const siteContent = {
    header: {
        logo: "Nano Banana AI",
        logoImage: "https://ainanobanana.io/logo.png",
        navLinks: [
            { label: "Home", href: "/" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Pricing", href: "/pricing" },
            { label: "Explore", href: "/explore" },
            { label: "Image to Video", href: "/image-to-video" },
            { label: "History", href: "/history" },
        ],
        loginButton: "Login",
    },
    hero: {
        title: "Nano Banana AI -- Powered By Gemini 2.5 Flash Image Generation & Editing Studio",
        subtitle: "Experience Google's revolutionary Nano Banana AI (Gemini 2.5 Flash Image) for advanced image generation and editing. Create, blend, and enhance images with state-of-the-art AI technology in Nano Banana AI (alternative Google AI Studio).",
        ctaPrimary: "Try Nano Banana",
        ctaSecondary: "Image to Video",
        ctaPrimaryHref: "/dashboard",
        ctaSecondaryHref: "/image-to-video",
    },
    editor: {
        title: "Nano Banana AI - Advanced Image Editor",
        subtitle: "Transform and edit your images with the powerful Nano Banana AI model - achieve professional-grade image editing with simple text prompts",
    },
    examples: {
        title: "Examples: See what Nano Banana can do",
        items: [
            {
                before: "/examples/before-1.jpg",
                after: "/examples/after-1.jpg",
                prompt: "change the bikini to red"
            },
            {
                before: "/examples/before-2.jpg",
                after: "/examples/after-2.jpg",
                prompt: "Transform this anime character into a collectible figure product showcase: Create a physical PVC figure standing on a clear round base, place a product box with the character artwork behind it, and add a computer monitor showing the 3D modeling process in Blender."
            },
            {
                before: "/examples/before-3.jpg",
                after: "/examples/after-3.jpg",
                prompt: "Repair and color this photo"
            },
            {
                before: "/examples/before-4.jpg",
                after: "/examples/after-4.jpg",
                prompt: "Transform the subject into a handmade crocheted yarn doll with a cute, chibi-style appearance."
            },
            {
                before: "/examples/before-5.jpg",
                after: "/examples/after-5.jpg",
                prompt: "Reimagine the photo in the style of Van Gogh's 'Starry Night'."
            },
            {
                before: "/examples/before-6.jpg",
                after: "/examples/after-6.jpg",
                prompt: "Change the hair to blue."
            },
            {
                before: "/examples/before-7.jpg",
                after: "/examples/after-7.jpg",
                prompt: "Transform the person into a LEGO minifigure, inside its packaging box."
            },
        ]
    },
    communityGallery: {
        title: "Stunning Creations from Nano Banana AI Community",
        subtitle: "Watch as Nano Banana AI transforms your ideas into stunning reality - from concept to product in seconds",
        showcases: [
            {
                title: "Complete Nano Banana AI Transformation Pipeline",
                prompt: "Transform this anime character into a collectible figure product showcase: Create a physical PVC figure standing on a clear round base, place a product box with the character artwork behind it, and add a computer monitor showing the 3D modeling process in Blender.",
                videoPrompt: "Let the anime character come to life: make her smile gently, blink naturally, and have her hair sway softly in the breeze",
                image: "/gallery/showcase-1.jpg",
                video: "/gallery/showcase-1.mp4"
            },
            {
                title: "Nano Banana AI Cyberpunk Portrait",
                prompt: "Transform into a cyberpunk style portrait with neon lights and futuristic elements",
                image: "/gallery/showcase-2.jpg"
            },
            {
                title: "Nano Banana AI Restore Image",
                prompt: "fix scratches and damage, and colorize old photos",
                image: "/gallery/showcase-3.jpg"
            }
        ]
    },
    whyChoose: {
        title: "Why Creators Choose Nano Banana AI",
        subtitle: "Revolutionary technology that outperforms Flux Kontext with unmatched speed and accuracy",
        features: [
            {
                icon: "⚡",
                title: "One-Shot Perfect Generation",
                description: "Nano Banana AI Achieve 95% first-try success with natural language editing - no complex prompts needed."
            },
            {
                icon: "🚀",
                title: "Lightning-Fast Processing",
                description: "Nano Banana AI Generate professional images in under 1 second - 10x faster than traditional AI models."
            },
            {
                icon: "👤",
                title: "Face Completion Technology",
                description: "Nano Banana AI Advanced facial reconstruction that preserves identity with photorealistic accuracy."
            },
            {
                icon: "🎭",
                title: "Consistent Character Editing",
                description: "Nano Banana AI Maintain character consistency across multiple generations - perfect for AI influencers."
            },
            {
                icon: "🔒",
                title: "Enterprise Security",
                description: "SOC 2, GDPR, and ISO 27001 certified - Nano Banana AI trusted by professional teams worldwide."
            },
            {
                icon: "💳",
                title: "No Credit Card Required",
                description: "Nano Banana AI Start creating immediately - no registration barriers, just instant access to powerful AI."
            }
        ]
    },
    pricing: {
        title: "Nano Banana AI for Every Creator",
        subtitle: "From hobbyists to professionals - join the Nano Banana AI community generating millions of images daily.",
        plans: [
            {
                name: "Basic",
                description: "for individual use and small team",
                price: "$9.99",
                period: "/month",
                features: [
                    "100 credits per month",
                    "50 high-quality images/month",
                    "Standard generation speed",
                    "Basic customer support",
                    "PNG format downloads",
                    "1200 credits (delivered instantly) with annual billing",
                    "Commercial license & Unrestricted usage rights"
                ],
                highlighted: false
            },
            {
                name: "Standard",
                description: "for individual use and small team",
                price: "$19.99",
                period: "/month",
                badge: "🔥Best value with 50% savings",
                features: [
                    "500 credits per month",
                    "250 high-quality images/month",
                    "Priority generation queue",
                    "Priority customer support",
                    "PNG format downloads",
                    "6000 credits (delivered instantly) with annual billing",
                    "Commercial license & Image editing tools"
                ],
                highlighted: true
            },
            {
                name: "Pro",
                description: "for large team and enterprise",
                price: "$49.99",
                period: "/month",
                features: [
                    "2000 credits per month",
                    "1000 high-quality images/month",
                    "Fastest generation speed",
                    "Dedicated account manager",
                    "All format downloads",
                    "24000 credits (delivered instantly) with annual billing",
                    "Commercial license & Advanced editing tools"
                ],
                highlighted: false
            },
            {
                name: "Special Offer Yearly",
                description: "Unlimited usage for a full year with all premium features",
                price: "$299",
                period: "/year",
                features: [
                    "Unlimited credits per year",
                    "All premium features included",
                    "Priority support",
                    "Advanced AI models",
                    "All format downloads",
                    "Commercial license & Unrestricted usage rights"
                ],
                highlighted: false
            }
        ],
        addons: [
            {
                name: "Small Add-on Package",
                description: "You need more credits",
                price: "$9.99",
                credits: "800 credits",
                features: [
                    "One-Time Plan",
                    "800 credits",
                    "No subscription",
                    "Faster Image generation",
                    "Permanent History Records",
                    "Commercial License"
                ]
            },
            {
                name: "Large Add-on Package",
                description: "You need more credits",
                price: "$19.99",
                credits: "1600 credits",
                features: [
                    "One-Time Plan",
                    "1600 credits",
                    "No subscription",
                    "Faster Image generation",
                    "Permanent History Records",
                    "Commercial License"
                ]
            }
        ]
    },
    tweets: {
        title: "Nano Banana AI Tweets Explore",
        subtitle: "See what creators are saying about Nano Banana AI"
    },
    faq: {
        title: "Frequently Asked Question about Nano Banana AI",
        items: [
            {
                question: "What is Nano Banana AI?",
                answer: "Nano Banana AI is an advanced image generation and editing platform powered by Google's Gemini 2.5 Flash Image technology. It allows you to create, edit, and transform images using simple text prompts."
            },
            {
                question: "How fast is image generation?",
                answer: "Nano Banana AI generates professional images in under 1 second - 10x faster than traditional AI models, thanks to our optimized infrastructure and advanced algorithms."
            },
            {
                question: "What is face completion technology?",
                answer: "Our advanced facial reconstruction technology preserves identity with photorealistic accuracy, ensuring that faces in generated images are realistic, detailed, and consistent."
            },
            {
                question: "Can I use Nano Banana AI for commercial projects?",
                answer: "Yes! All our paid plans include commercial usage rights. You can use the generated images for your business, marketing, or any commercial purpose."
            },
            {
                question: "Do I need a credit card to start?",
                answer: "No, you can start creating immediately without a credit card. We offer instant access to our powerful AI tools."
            },
            {
                question: "What is character consistency?",
                answer: "Character consistency allows you to maintain the same character across multiple generations in different poses and settings - perfect for creating AI influencers or consistent brand characters."
            },
            {
                question: "What security certifications does Nano Banana AI have?",
                answer: "We are SOC 2, GDPR, and ISO 27001 certified. Your data and creations are protected by enterprise-grade security trusted by professional teams worldwide."
            },
            {
                question: "Can I cancel my subscription anytime?",
                answer: "Yes, subscriptions can be cancelled at any time. You'll continue to have access to your plan benefits until the end of your billing period."
            }
        ]
    },
    imageToVideo: {
        title: "Image to Video - Bring Your Photos to Life",
        subtitle: "Transform your images into stunning videos with AI",
        model: "Veo3: Premium quality • 16:9 • 720p • 8 seconds",
        examplePrompt: "Let the anime character come to life: make her smile gently, blink naturally, and have her hair sway softly in the breeze"
    },
    explore: {
        title: "Nano Banana AI Explore",
        subtitle: "Discover the ideal inspiration among 1 million prompts and unleash your imagination!",
        emptyMessage: "No images found"
    },
    footer: {
        logo: "ainanobanana.io",
        copyright: "Copyright ainanobanana.io © 2025 - All rights reserved",
        links: [
            { label: "Support", href: "/support" },
            { label: "Terms", href: "/tos" },
            { label: "Privacy", href: "/privacy-policy" },
            { label: "Refund Policy", href: "/refund-policy" },
        ],
    },
};
