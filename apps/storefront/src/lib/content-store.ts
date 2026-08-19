export interface CmsContentBlock {
  id: string
  title: string
  content: string
  type?: "text" | "bullet_list" | "table" | "notice"
}

export interface CmsFaqItem {
  id: string
  category: string
  question: string
  answer: string
}

export interface CmsPromoBanner {
  id: string
  badge: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  image: string
  active: boolean
}

export interface CmsLinkColumn {
  id: string
  title: string
  links: Array<{ label: string; url: string }>
}

export interface CmsHeaderMenuItem {
  id: string
  label: string
  url: string
  position: "left" | "right"
  badge?: string
  openInNewTab?: boolean
  enabled: boolean
}

export interface CmsNavigation {
  leftMenuItems: CmsHeaderMenuItem[]
  rightMenuItems: CmsHeaderMenuItem[]
  mobileDrawerExtraLinks?: Array<{ label: string; url: string; badge?: string }>
}

export interface CmsFeaturedCollection {
  id: string
  title: string
  handle: string
  description: string
  badge?: string
  image: string
  enabled: boolean
}

export interface CmsCollectionSection {
  id: string
  heading: string
  subheading?: string
  badge?: string
  collectionHandle: string
  viewAllLink?: string
  active: boolean
}

export interface CmsHomepageSectionLayout {
  id: string
  name: string
  description: string
  enabled: boolean
}

export const DEFAULT_HOMEPAGE_LAYOUT: CmsHomepageSectionLayout[] = [
  {
    id: "hero",
    name: "Hero Main Banner",
    description: "Full-width hero visual with badge, headline & call-to-action buttons",
    enabled: true,
  },
  {
    id: "brand_values",
    name: "Brand Value Props & Trust Badges",
    description: "Express logistics, zero shrinkage guarantee, and doorstep returns",
    enabled: true,
  },
  {
    id: "featured_collections",
    name: "Featured Collections Grid",
    description: "Curated capsule drop cards with custom covers & badges",
    enabled: true,
  },
  {
    id: "promo_banners",
    name: "Promotional Banners & Cards",
    description: "Split promotional marketing and offer banner cards",
    enabled: true,
  },
  {
    id: "collection_carousels",
    name: "Homepage Collection Carousels",
    description: "Horizontal product card carousels assigned to collections",
    enabled: true,
  },
  {
    id: "featured_products",
    name: "Best Sellers & Featured Products",
    description: "High-velocity rotation product catalog grid",
    enabled: true,
  },
  {
    id: "material_science",
    name: "Material Science & Heritage Block",
    description: "Textile engineering and combed cotton craft narrative",
    enabled: true,
  },
]

export interface AdminContentItem {
  // Legacy / top-level shortcuts for backward compatibility
  hero: {
    badge: string
    headline: string
    subheadline: string
    ctaText: string
    ctaLink: string
    secondaryCtaText: string
    secondaryCtaLink: string
    bannerImage: string
  }
  announcement: {
    text: string
    active: boolean
    link?: string
  }
  faqItems: CmsFaqItem[]

  // Structured Multi-Domain CMS Sections
  homepage: {
    hero: {
      badge: string
      headline: string
      subheadline: string
      ctaText: string
      ctaLink: string
      secondaryCtaText: string
      secondaryCtaLink: string
      bannerImage: string
    }
    announcement: {
      text: string
      active: boolean
      link?: string
    }
    promoBanners: CmsPromoBanner[]
    featuredCollections: CmsFeaturedCollection[]
    collectionSections?: CmsCollectionSection[]
    layoutSections?: CmsHomepageSectionLayout[]

    featuredProducts: {
      badge?: string
      heading: string
      subheading: string
      viewAllText?: string
      viewAllLink?: string
      mode: "auto" | "custom"
      customProductIds: string[]
      displayLimit?: number
      columns?: 2 | 3 | 4
      autoCriteria?: "best_sellers" | "new_arrivals" | "price_high" | "price_low"
    }
    brandValues: Array<{
      id: string
      icon: string
      title: string
      description: string
    }>
  }

  footer: {
    brandBio: string
    locationText: string
    newsletterTitle: string
    newsletterSubtitle: string
    socialLinks: {
      instagram: string
      twitter: string
      youtube: string
      discord: string
    }
    contactInfo: {
      email: string
      phone: string
      address: string
      hours: string
    }
    linkColumns: CmsLinkColumn[]
  }

  pages: {
    about: {
      badge: string
      title: string
      subtitle: string
      bannerImage: string
      storyTitle: string
      storyBody1: string
      storyBody2: string
      pillarsTitle: string
      pillars: Array<{ id: string; title: string; description: string }>
    }
    contact: {
      title: string
      subtitle: string
      email: string
      phone: string
      address: string
      hours: string
      responseTime: string
    }
    faq: {
      title: string
      subtitle: string
      categories: string[]
      items: CmsFaqItem[]
    }
    shipping: {
      title: string
      subtitle: string
      badge: string
      lastUpdated: string
      sections: CmsContentBlock[]
    }
    returns: {
      title: string
      subtitle: string
      badge: string
      lastUpdated: string
      sections: CmsContentBlock[]
    }
    privacy: {
      title: string
      subtitle: string
      lastUpdated: string
      sections: CmsContentBlock[]
    }
    terms: {
      title: string
      subtitle: string
      lastUpdated: string
      sections: CmsContentBlock[]
    }
  }

  navigation: CmsNavigation
}

export const INITIAL_CMS_CONTENT: AdminContentItem = {
  hero: {
    badge: "DROP 04 // LIVE ACROSS INDIA",
    headline: "UNCOMPROMISING STREET LUXURY.",
    subheadline:
      "280–400 GSM custom-milled combed cotton garments engineered for permanent structure, zero shrinkage, and modern luxury silhouettes.",
    ctaText: "Explore Collection",
    ctaLink: "/shop",
    secondaryCtaText: "Shop 280 GSM Core Series",
    secondaryCtaLink: "/collections/core-heavyweight",
    bannerImage:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85",
  },
  announcement: {
    text: "⚡ FREE EXPRESS SHIPPING ON ORDERS OVER ₹1,999 | CRAFTED IN INDIA WITH 280-400 GSM FABRICS",
    active: true,
    link: "/shop",
  },
  faqItems: [
    {
      id: "faq_1",
      category: "Fabric, GSM & Quality",
      question: "What does 280 GSM vs 400 GSM mean?",
      answer:
        "GSM stands for Grams per Square Meter. Standard commercial t-shirts are 140–180 GSM. ADIKT 280 GSM tees are double the density, offering an architectural boxy drape that holds its structure. Our 400 GSM loopback French Terry fleece provides substantial thermal weight and premium hand feel.",
    },
    {
      id: "faq_2",
      category: "Fabric, GSM & Quality",
      question: "Will the garments shrink after washing?",
      answer:
        "No. All ADIKT fabrics undergo a rigorous pre-shrunk bio-wash bath during milling in Tirupur. Post-wash shrinkage is under 1% when following our cold wash instructions.",
    },
    {
      id: "faq_3",
      category: "Fabric, GSM & Quality",
      question: "How should I wash and care for high-density puff prints?",
      answer:
        "Machine wash cold inside out with mild detergent. Never iron directly over 3D puff or screen prints. Lay flat to dry in shade to prevent hanger distortion.",
    },
    {
      id: "faq_4",
      category: "Shipping & Delivery",
      question: "What are your delivery timelines across India?",
      answer:
        "Metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad) receive orders within 2 to 3 business days via Bluedart/Delhivery Air. Rest of India takes 3 to 5 business days.",
    },
    {
      id: "faq_5",
      category: "Shipping & Delivery",
      question: "Is Cash on Delivery (COD) available?",
      answer: "Yes! Cash on Delivery is available across 26,000+ PIN codes in India.",
    },
    {
      id: "faq_6",
      category: "Returns & Exchanges",
      question: "What is your return policy?",
      answer:
        "We offer a 7-day doorstep return and exchange policy from the date of delivery. Items must be unworn, unwashed, and in their original packaging with tags intact.",
    },
    {
      id: "faq_7",
      category: "Returns & Exchanges",
      question: "How are refunds processed?",
      answer:
        "Prepaid orders (Razorpay/UPI/Cards) are refunded directly to the original payment source within 3–5 business days. COD orders are refunded via instant UPI transfer or store credit.",
    },
  ],

  homepage: {
    hero: {
      badge: "DROP 04 // LIVE ACROSS INDIA",
      headline: "UNCOMPROMISING STREET LUXURY.",
      subheadline:
        "280–400 GSM custom-milled combed cotton garments engineered for permanent structure, zero shrinkage, and modern luxury silhouettes.",
      ctaText: "Explore Collection",
      ctaLink: "/shop",
      secondaryCtaText: "Shop 280 GSM Core Series",
      secondaryCtaLink: "/collections/core-heavyweight",
      bannerImage:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85",
    },
    announcement: {
      text: "⚡ FREE EXPRESS SHIPPING ON ORDERS OVER ₹1,999 | CRAFTED IN INDIA WITH 280-400 GSM FABRICS",
      active: true,
      link: "/shop",
    },
    promoBanners: [
      {
        id: "promo_1",
        badge: "ARCHIVAL RESTOCK",
        title: "280 GSM BOXY TEES IN VINTAGE BLACK",
        subtitle: "Custom-milled single jersey knit engineered with zero collar roll.",
        ctaText: "Shop The Heavyweights",
        ctaLink: "/shop?category=tees",
        image:
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
        active: true,
      },
      {
        id: "promo_2",
        badge: "DROP-SHOULDER FLEECE",
        title: "400 GSM FRENCH TERRY HOODIES",
        subtitle: "Double-layered structural hood without drawstrings for clean silhouette lines.",
        ctaText: "Shop Hoodies & Fleeces",
        ctaLink: "/shop?category=hoodies",
        image:
          "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85",
        active: true,
      },
    ],
    featuredCollections: [
      {
        id: "fc_1",
        title: "Core Heavyweight Series",
        handle: "core-heavyweight",
        description: "280 GSM boxy cotton essentials milled for daily rotation.",
        image:
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
        enabled: true,
      },
      {
        id: "fc_2",
        title: "French Terry Fleece",
        handle: "french-terry-fleece",
        description: "400 GSM heavy loopback outerwear built for architectural drape.",
        image:
          "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85",
        enabled: true,
      },
      {
        id: "fc_3",
        title: "Parachute Cargos",
        handle: "parachute-cargos",
        description: "High-tensile structured ripstop bottoms with modular tactical pockets.",
        image:
          "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=85",
        enabled: true,
      },
    ],
    collectionSections: [
      {
        id: "cs_1",
        badge: "280 GSM Essentials",
        heading: "Core Heavyweight Capsule",
        subheading: "Custom-milled 280 GSM single jersey tees engineered for perpetual shape retention.",
        collectionHandle: "core-heavyweight",
        viewAllLink: "/collections/core-heavyweight",
        active: true,
      },
      {
        id: "cs_2",
        badge: "400 GSM Outerwear",
        heading: "French Terry Fleece Drop",
        subheading: "High-density loopback fleece hoodies built with structural drop shoulders.",
        collectionHandle: "french-terry-fleece",
        viewAllLink: "/collections/french-terry-fleece",
        active: true,
      },
    ],
    layoutSections: DEFAULT_HOMEPAGE_LAYOUT,
    featuredProducts: {
      badge: "High Velocity Rotation",
      heading: "Best Selling Streetwear",
      subheading: "Custom-milled 280–400 GSM luxury garments engineered for architectural structure.",
      viewAllText: "Browse All",
      viewAllLink: "/shop",
      mode: "auto",
      customProductIds: [],
      displayLimit: 8,
      columns: 4,
      autoCriteria: "best_sellers",
    },
    brandValues: [
      {
        id: "bv_1",
        icon: "Truck",
        title: "Express Logistics",
        description: "Bluedart & Delhivery air express dispatch across 26,000+ Indian PIN codes.",
      },
      {
        id: "bv_2",
        icon: "ShieldCheck",
        title: "Zero Shrinkage Guarantee",
        description: "Pre-shrunk bio-washed compact combed cotton that holds its architectural shape.",
      },
      {
        id: "bv_3",
        icon: "RefreshCw",
        title: "Doorstep Exchanges",
        description: "Hassle-free 7-day reverse pickup and automated size exchanges.",
      },
    ],
  },

  footer: {
    brandBio:
      "Direct-to-consumer luxury streetwear engineered with 280–400 GSM custom fabrics, raw hems, and architectural drape. Crafted in India.",
    locationText: "Tirupur Textile Mills & Bandra Design Studio, Mumbai",
    newsletterTitle: "Be First To Access 400 GSM Drops & Archival Releases",
    newsletterSubtitle: "Zero spam. Direct SMS & email notifications 30 minutes before public launch.",
    socialLinks: {
      instagram: "https://instagram.com/adiktclothing",
      twitter: "https://twitter.com/adiktclothing",
      youtube: "https://youtube.com/@adiktclothing",
      discord: "https://discord.gg/adikt",
    },
    contactInfo: {
      email: "support@adiktclothing.com",
      phone: "+91 98765 43210",
      address: "ADIKT Apparel Works Pvt Ltd, Linking Road, Bandra West, Mumbai, MH 400050",
      hours: "Mon – Sat: 10:00 AM – 7:00 PM IST",
    },
    linkColumns: [
      {
        id: "col_silhouettes",
        title: "Silhouettes",
        links: [
          { label: "All Products", url: "/shop" },
          { label: "Heavyweight Tees (280 GSM)", url: "/shop?category=tees" },
          { label: "French Terry Hoodies (400 GSM)", url: "/shop?category=hoodies" },
          { label: "Parachute Cargos", url: "/shop?category=cargos" },
          { label: "Core Heavyweight", url: "/collections/core-heavyweight" },
        ],
      },
      {
        id: "col_concierge",
        title: "Customer Concierge",
        links: [
          { label: "Track Your Order", url: "/account" },
          { label: "Shipping Policy & Timelines", url: "/shipping" },
          { label: "7-Day Returns & Exchanges", url: "/returns" },
          { label: "Frequently Asked Questions", url: "/faq" },
          { label: "Contact Customer Support", url: "/contact" },
        ],
      },
      {
        id: "col_brand",
        title: "The Brand",
        links: [
          { label: "Our Story & Textile Philosophy", url: "/about" },
          { label: "Privacy Policy", url: "/privacy" },
          { label: "Terms of Service", url: "/terms" },
        ],
      },
    ],
  },

  pages: {
    about: {
      badge: "Textile Heritage & Engineering",
      title: "The ADIKT Standard",
      subtitle:
        "Born from a refusal to accept thin, flimsy fast-fashion fabrics. Engineered in Mumbai, milled in Tirupur.",
      bannerImage:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=85",
      storyTitle: "Heavyweight Cotton Engineered For Decades, Not Seasons",
      storyBody1:
        "Standard commercial t-shirts are milled at 140 to 180 GSM. They lose structure after 3 machine cycles, their collars bacon, and the side seams twist. At ADIKT, our base tees begin at 280 GSM, knit with 100% combed compact yarn that removes all short, brittle fibers.",
      storyBody2:
        "Our winter fleeces and drop-shoulder hoodies are milled at an uncompromising 400 GSM loopback French Terry. Every piece undergoes a specialized bio-wash bath during milling to achieve zero shrinkage and permanent structural drape.",
      pillarsTitle: "The 4 Pillars of ADIKT Garments",
      pillars: [
        {
          id: "p_1",
          title: "Custom High-GSM Knit",
          description: "280 GSM single jersey and 400 GSM loopback French Terry milled exclusively for ADIKT in Tirupur.",
        },
        {
          id: "p_2",
          title: "High-Density Ribbed Necklines",
          description: "1x1 lycra-infused rib collars that retain their tight, circular shape wear after wear.",
        },
        {
          id: "p_3",
          title: "Pre-Shrunk Bio-Wash",
          description: "Enzyme bio-washing guarantees under 1% post-wash shrinkage for true lifetime fit.",
        },
        {
          id: "p_4",
          title: "Architectural Boxy Cuts",
          description: "Drop-shoulder patterns engineered for a clean, muscular silhouette across all body frames.",
        },
      ],
    },
    contact: {
      title: "Contact Concierge",
      subtitle: "Our customer service team is available Monday to Saturday, 10:00 AM – 7:00 PM IST.",
      email: "support@adiktclothing.com",
      phone: "+91 98765 43210",
      address: "ADIKT Apparel Works Pvt Ltd, Linking Road, Bandra West, Mumbai, MH 400050",
      hours: "Mon – Sat: 10:00 AM – 7:00 PM IST",
      responseTime: "Within 2 to 4 business hours",
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about our custom milling, high-GSM fabrics, orders, and returns.",
      categories: ["Fabric, GSM & Quality", "Shipping & Delivery", "Returns & Exchanges", "Payments & COD"],
      items: [
        {
          id: "faq_1",
          category: "Fabric, GSM & Quality",
          question: "What does 280 GSM vs 400 GSM mean?",
          answer:
            "GSM stands for Grams per Square Meter. Standard commercial t-shirts are 140–180 GSM. ADIKT 280 GSM tees are double the density, offering an architectural boxy drape that holds its structure. Our 400 GSM loopback French Terry fleece provides substantial thermal weight and premium hand feel.",
        },
        {
          id: "faq_2",
          category: "Fabric, GSM & Quality",
          question: "Will the garments shrink after washing?",
          answer:
            "No. All ADIKT fabrics undergo a rigorous pre-shrunk bio-wash bath during milling in Tirupur. Post-wash shrinkage is under 1% when following our cold wash instructions.",
        },
        {
          id: "faq_3",
          category: "Fabric, GSM & Quality",
          question: "How should I wash and care for high-density puff prints?",
          answer:
            "Machine wash cold inside out with mild detergent. Never iron directly over 3D puff or screen prints. Lay flat to dry in shade to prevent hanger distortion.",
        },
        {
          id: "faq_4",
          category: "Shipping & Delivery",
          question: "What are your delivery timelines across India?",
          answer:
            "Metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad) receive orders within 2 to 3 business days via Bluedart/Delhivery Air. Rest of India takes 3 to 5 business days.",
        },
        {
          id: "faq_5",
          category: "Shipping & Delivery",
          question: "Is Cash on Delivery (COD) available?",
          answer: "Yes! Cash on Delivery is available across 26,000+ PIN codes in India.",
        },
        {
          id: "faq_6",
          category: "Returns & Exchanges",
          question: "What is your return policy?",
          answer:
            "We offer a 7-day doorstep return and exchange policy from the date of delivery. Items must be unworn, unwashed, and in their original packaging with tags intact.",
        },
        {
          id: "faq_7",
          category: "Returns & Exchanges",
          question: "How are refunds processed?",
          answer:
            "Prepaid orders (Razorpay/UPI/Cards) are refunded directly to the original payment source within 3–5 business days. COD orders are refunded via instant UPI transfer or store credit.",
        },
      ],
    },
    shipping: {
      title: "Shipping & Delivery Policy",
      subtitle: "Fast, tracked air express delivery across all 26,000+ Indian PIN codes.",
      badge: "Express Nationwide Logistics",
      lastUpdated: "August 2026",
      sections: [
        {
          id: "shp_1",
          title: "1. Order Processing & Dispatch",
          content:
            "All orders placed before 2:00 PM IST on business days are dispatched the same day from our primary warehouse in Tirupur, Tamil Nadu. Orders placed on Sundays or public holidays will be dispatched on the following business day.",
        },
        {
          id: "shp_2",
          title: "2. Delivery Timelines Across India",
          content:
            "• Metro Cities (Mumbai, Delhi NCR, Bengaluru, Chennai, Hyderabad, Kolkata): 2 to 3 business days.\n• Tier 2 & Tier 3 Cities: 3 to 5 business days.\n• Remote & North-East Regions: 5 to 7 business days.",
        },
        {
          id: "shp_3",
          title: "3. Shipping Charges & Free Shipping Threshold",
          content:
            "• Free Express Shipping is automatically applied to all orders above ₹1,999 across India.\n• A nominal flat shipping charge of ₹150 applies to orders below ₹1,999.",
        },
        {
          id: "shp_4",
          title: "4. Cash on Delivery (COD) Orders",
          content:
            "Cash on Delivery is available with an OTP-verified checkout for orders up to ₹10,000. Please have exact cash ready at the time of delivery.",
        },
      ],
    },
    returns: {
      title: "Returns & Exchange Policy",
      subtitle: "7-Day doorstep pickup and automated instant exchanges.",
      badge: "Hassle-Free Doorstep Reverse Logistics",
      lastUpdated: "August 2026",
      sections: [
        {
          id: "ret_1",
          title: "1. 7-Day Doorstep Returns & Exchanges",
          content:
            "We offer a 7-day return and exchange window from the exact delivery timestamp. If the fit or silhouette is not perfect, you can request an instant size exchange or return via My Account > Orders or through our WhatsApp concierge.",
        },
        {
          id: "ret_2",
          title: "2. Eligibility & Condition of Items",
          content:
            "Items must be in original unworn, unwashed condition with all garment tags, branded polybags, and invoice intact. Items with perfume scent, makeup marks, or signs of wear will not be eligible.",
        },
        {
          id: "ret_3",
          title: "3. Reverse Pickup & Timeline",
          content:
            "Our courier partner (Delhivery/Bluedart) will arrive at your address within 24 to 48 hours to collect the return parcel. Doorstep verification is performed upon collection.",
        },
        {
          id: "ret_4",
          title: "4. Refund Settlement Method",
          content:
            "• Prepaid Orders: Refunded to the original payment source (UPI, Credit/Debit Card, NetBanking) within 3–5 banking days after quality check.\n• Cash on Delivery (COD) Orders: Refunded instantly to your verified UPI VPA or Bank Account via NEFT, or as 100% store credit with a bonus 5% shopping credit.",
        },
      ],
    },
    privacy: {
      title: "Privacy & Data Protection Policy",
      subtitle: "How ADIKT collects, uses, and secures your personal and order data under the Digital Personal Data Protection Act (DPDPA).",
      lastUpdated: "August 2026",
      sections: [
        {
          id: "prv_1",
          title: "1. Information We Collect",
          content:
            "We collect name, email address, mobile number, delivery address, order history, and device telemetry when you use our website or place an order. We never store credit card numbers, CVVs, or UPI PINs on our servers.",
        },
        {
          id: "prv_2",
          title: "2. How We Use Your Data",
          content:
            "Your data is used strictly to fulfill orders, send transaction alerts (SMS/WhatsApp/Email), process returns and refunds, and provide optional marketing drops when consented.",
        },
        {
          id: "prv_3",
          title: "3. Third-Party Payment & Logistics Processors",
          content:
            "We share necessary shipping details with certified logistics providers (Bluedart, Delhivery) and RBI-authorized payment gateways (Razorpay). All data transmissions are encrypted via 256-bit TLS.",
        },
        {
          id: "prv_4",
          title: "4. Your Rights & Data Deletion",
          content:
            "You have the right to request access to, update, or permanently delete your customer account and personal data by emailing privacy@adiktclothing.com.",
        },
      ],
    },
    terms: {
      title: "Terms of Service",
      subtitle: "Legal agreement governing your use of ADIKT Clothing Co. store and purchases.",
      lastUpdated: "August 2026",
      sections: [
        {
          id: "trm_1",
          title: "1. Agreement to Terms",
          content:
            "By accessing or purchasing from adiktclothing.com, you agree to be bound by these Terms of Service and our associated Store Policies.",
        },
        {
          id: "trm_2",
          title: "2. Garment Descriptions, Fit & Pricing",
          content:
            "We make every effort to display accurate fabric GSM weights, weave details, and color representations. Prices are in Indian Rupees (INR) and are inclusive of GST. We reserve the right to correct any typographical pricing errors.",
        },
        {
          id: "trm_3",
          title: "3. Orders & Cancellation",
          content:
            "ADIKT reserves the right to decline or cancel any order suspected of fraudulent activity, automated bot checkout, or non-serviceable pin codes. Full refunds are immediately issued for any cancelled orders.",
        },
        {
          id: "trm_4",
          title: "4. Intellectual Property & Brand Rights",
          content:
            "All trademarks, streetwear graphics, puff print typography, lookbook photography, and website content are the exclusive intellectual property of ADIKT Apparel Works Pvt Ltd.",
        },
      ],
    },
  },

  navigation: {
    leftMenuItems: [
      { id: "nav_shop", label: "Shop All", url: "/shop", position: "left", enabled: true },
      { id: "nav_tees", label: "Tees", url: "/shop?category=tees", position: "left", badge: "280 GSM", enabled: true },
      { id: "nav_hoodies", label: "Hoodies", url: "/shop?category=hoodies", position: "left", badge: "400 GSM", enabled: true },
      { id: "nav_cargos", label: "Cargos", url: "/shop?category=cargos", position: "left", enabled: true },
    ],
    rightMenuItems: [
      { id: "nav_core", label: "Core Series", url: "/collections/core-heavyweight", position: "right", badge: "Signature", enabled: true },
      { id: "nav_craft", label: "The Craft", url: "/about", position: "right", enabled: true },
      { id: "nav_help", label: "Help", url: "/faq", position: "right", enabled: true },
    ],
  },
}

function getFsAndPath() {
  if (typeof window === "undefined") {
    try {
      const req = eval("require")
      return { fs: req("fs"), path: req("path") }
    } catch {}
  }
  return { fs: null, path: null }
}

function getCmsFilePath(): string | null {
  const { fs, path } = getFsAndPath()
  if (!fs || !path) return null

  const cwd = process.cwd()
  const possiblePaths = [
    path.join(cwd, "apps", "storefront", "data", "content.json"),
    path.join(cwd, "data", "content.json"),
    path.resolve(cwd, "..", "data", "content.json"),
    path.resolve(cwd, "..", "apps", "storefront", "data", "content.json"),
  ]
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p
  }
  const defaultPath = path.join(cwd, "apps", "storefront", "data", "content.json")
  try {
    const dir = path.dirname(defaultPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  } catch {}
  return defaultPath
}

type ContentChangeListener = () => void

class ContentStore {
  private content: AdminContentItem = { ...INITIAL_CMS_CONTENT }
  private listeners: ContentChangeListener[] = []
  private initialized = false

  getContent(): AdminContentItem {
    if (typeof window === "undefined") {
      try {
        const { fs } = getFsAndPath()
        const filePath = getCmsFilePath()
        if (fs && filePath && fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, "utf-8")
          const parsed = JSON.parse(raw)
          if (parsed) {
            const data = parsed.content || parsed
            this.content = {
              ...INITIAL_CMS_CONTENT,
              ...data,
              navigation: {
                leftMenuItems:
                  data.navigation?.leftMenuItems || INITIAL_CMS_CONTENT.navigation.leftMenuItems,
                rightMenuItems:
                  data.navigation?.rightMenuItems || INITIAL_CMS_CONTENT.navigation.rightMenuItems,
              },
              homepage: {
                ...INITIAL_CMS_CONTENT.homepage,
                ...(data.homepage || {}),
                layoutSections:
                  data.homepage?.layoutSections || data.layoutSections || DEFAULT_HOMEPAGE_LAYOUT,
              },
            }
          }
        }
      } catch (err) {
        console.warn("Could not read persisted CMS content:", err)
      }
    }
    return { ...this.content }
  }

  updateContent(updates: Partial<AdminContentItem>): AdminContentItem {
    // Deep merge helper
    this.content = {
      ...this.content,
      ...updates,
      hero: {
        ...this.content.hero,
        ...(updates.hero || {}),
      },
      announcement: {
        ...this.content.announcement,
        ...(updates.announcement || {}),
      },
      faqItems: updates.faqItems ? [...updates.faqItems] : this.content.faqItems,
      homepage: {
        ...this.content.homepage,
        ...(updates.homepage || {}),
        hero: {
          ...this.content.homepage.hero,
          ...(updates.homepage?.hero || updates.hero || {}),
        },
        announcement: {
          ...this.content.homepage.announcement,
          ...(updates.homepage?.announcement || updates.announcement || {}),
        },
        promoBanners: updates.homepage?.promoBanners || this.content.homepage.promoBanners,
        featuredCollections:
          updates.homepage?.featuredCollections || this.content.homepage.featuredCollections,
        collectionSections:
          updates.homepage?.collectionSections || this.content.homepage.collectionSections || [],
        layoutSections:
          updates.homepage?.layoutSections || this.content.homepage.layoutSections || DEFAULT_HOMEPAGE_LAYOUT,
        featuredProducts: {
          ...this.content.homepage.featuredProducts,
          ...(updates.homepage?.featuredProducts || {}),
        },
      },
      footer: {
        ...this.content.footer,
        ...(updates.footer || {}),
        socialLinks: {
          ...this.content.footer.socialLinks,
          ...(updates.footer?.socialLinks || {}),
        },
        contactInfo: {
          ...this.content.footer.contactInfo,
          ...(updates.footer?.contactInfo || {}),
        },
        linkColumns: updates.footer?.linkColumns || this.content.footer.linkColumns,
      },
      pages: {
        ...this.content.pages,
        ...(updates.pages || {}),
        about: {
          ...this.content.pages.about,
          ...(updates.pages?.about || {}),
        },
        contact: {
          ...this.content.pages.contact,
          ...(updates.pages?.contact || {}),
        },
        faq: {
          ...this.content.pages.faq,
          ...(updates.pages?.faq || {}),
          items: updates.pages?.faq?.items || updates.faqItems || this.content.pages.faq.items,
        },
        shipping: {
          ...this.content.pages.shipping,
          ...(updates.pages?.shipping || {}),
        },
        returns: {
          ...this.content.pages.returns,
          ...(updates.pages?.returns || {}),
        },
        privacy: {
          ...this.content.pages.privacy,
          ...(updates.pages?.privacy || {}),
        },
        terms: {
          ...this.content.pages.terms,
          ...(updates.pages?.terms || {}),
        },
      },
      navigation: {
        leftMenuItems:
          updates.navigation?.leftMenuItems ||
          this.content.navigation?.leftMenuItems ||
          INITIAL_CMS_CONTENT.navigation.leftMenuItems,
        rightMenuItems:
          updates.navigation?.rightMenuItems ||
          this.content.navigation?.rightMenuItems ||
          INITIAL_CMS_CONTENT.navigation.rightMenuItems,
        mobileDrawerExtraLinks:
          updates.navigation?.mobileDrawerExtraLinks ||
          this.content.navigation?.mobileDrawerExtraLinks,
      },
    }

    // Keep legacy top-level shortcuts in sync with homepage
    this.content.hero = { ...this.content.homepage.hero }
    this.content.announcement = { ...this.content.homepage.announcement }
    this.content.faqItems = [...this.content.pages.faq.items]

    try {
      const { fs, path } = getFsAndPath()
      if (fs && path) {
        const payload = {
          content: this.content,
          lastUpdated: new Date().toISOString(),
        }
        const jsonStr = JSON.stringify(payload, null, 2)
        const targets = [
          path.join(process.cwd(), "apps", "storefront", "data", "content.json"),
          path.join(process.cwd(), "data", "content.json"),
          path.join(process.cwd(), "apps", "storefront", "data", "cms-content.json"),
          path.join(process.cwd(), "data", "cms-content.json"),
        ]
        for (const target of targets) {
          try {
            const dir = path.dirname(target)
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
            fs.writeFileSync(target, jsonStr, "utf-8")
          } catch {}
        }
      }
    } catch (err) {
      console.error("Error saving CMS content to disk:", err)
    }

    this.notifyListeners()
    return { ...this.content }
  }

  initFromPersisted(persisted: AdminContentItem) {
    if (persisted) {
      this.updateContent(persisted)
      this.initialized = true
    }
  }

  subscribe(listener: ContentChangeListener): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l())
  }
}

export const contentStore = new ContentStore()
