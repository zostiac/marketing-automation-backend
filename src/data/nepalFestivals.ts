export type NepalFestivalScope =
  | "national"
  | "school"
  | "women"
  | "community"
  | "regional";

/** Design guidance used to generate festival social-media posters. */
export interface NepalFestivalDesignGuidelines {
  primary_color: string;
  secondary_color: string;
  key_visuals: string[];
  poster_vibe: string;
}

/** Social-media automation content attached to a festival or themed day. */
export interface NepalFestivalContent {
  caption_template: string;
  hashtags: string[];
  design_guidelines: NepalFestivalDesignGuidelines;
}

export interface NepalFestivalDefinition {
  bs_year: number;
  bs_month: number;
  bs_day: number;
  name: string;
  name_nepali: string;
  description: string;
  scope: NepalFestivalScope;
  is_public_holiday: boolean;
  /** Stable identifier carried over from the automation calendar source. */
  id?: string;
  /** Category label carried over from the automation calendar source. */
  category?: string;
  /**
   * Automation calendar source feed. Concrete 2083 BS dates originally
   * sourced from the Ministry of Home Affairs notice carry no value.
   */
  source?: "content_catalog" | "nepal_calendar_2026";
  /** ISO 8601 Gregorian date supplied by the source feed, if any. */
  source_ad_date?: string;
  /** Lunar reference used by the source feed to derive the date. */
  lunar_reference?: string;
  /** Tithi supplied by the source feed for the date. */
  tithi?: string;
  /** Intended social-media audience for the occasion. */
  target_audience?: string[];
  /** Caption / hashtag / design content used by the poster generator. */
  content?: NepalFestivalContent;
}

/**
 * Festival dates that depend on the lunar calendar must be updated every
 * Bikram Sambat year. This dataset combines three sources so the marketing
 * automation backend can both schedule concrete festival dates and generate
 * culturally appropriate social-media content:
 *
 *  1. Government of Nepal, Ministry of Home Affairs public-holiday notice for
 *     2083 BS (published 2082/11/18). These provide the authoritative full-year
 *     set of public holidays and main Dashain / Tihar observances.
 *  2. The "Nepal Educational Institution Social Media Automation Calendar"
 *     (schema 1.0, timezone Asia/Kathmandu, locale en-NP), aligned with
 *     Hamro Patro / Nepali Patro for August-September 2026
 *     (2083-04-25 to 2083-06-13). Its `nepal_calendar_2026` feed supplies
 *     concrete, tithi-referenced dates that augment and refine the 2083 set.
 *  3. The same calendar's `content_catalog` feed, which supplies caption
 *     templates, hashtags and poster design guidelines for recurring occasions.
 *     These are exported as NEPAL_SOCIAL_MEDIA_CATALOG below, while the
 *     festival-matching entries are also inlined into NEPAL_FESTIVALS.
 *
 * Notes on date reconciliation:
 *  - Indra Jatra is listed by the 2026 calendar on 2083-06-08 (Bhadra Shukla
 *    Chaturdashi, AD 2026-09-24). The earlier MoHA-aligned entry used
 *    2083-06-09; the calendar value is retained here as the live date.
 *  - Public-holiday flags for newly added occasions reflect common observance
 *    and should be reconciled against the official MoHA 2083 notice.
 */
export const NEPAL_FESTIVALS: ReadonlyArray<NepalFestivalDefinition> = [
  {
    bs_year: 2083,
    bs_month: 1,
    bs_day: 1,
    name: "Nepali New Year",
    name_nepali: "नेपाली नयाँ वर्ष",
    description: "The first day of the Bikram Sambat year 2083.",
    scope: "national",
    is_public_holiday: true,
  },
  {
    bs_year: 2083,
    bs_month: 1,
    bs_day: 18,
    name: "Buddha Jayanti and Ubhauli Parva",
    name_nepali: "बुद्ध जयन्ती तथा उभौली पर्व",
    description: "Buddha Jayanti, Chandi Purnima and the Kirat festival of Ubhauli.",
    scope: "national",
    is_public_holiday: true,
    content: {
      caption_template:
        "Happy Buddha Jayanti! Let us remember the timeless messages of peace, non-violence, and compassion taught by Lord Buddha.",
      hashtags: ["#BuddhaJayanti", "#LumbiniNepal", "#PeaceAndCompassion"],
      design_guidelines: {
        primary_color: "#FF8F00",
        secondary_color: "#ECEFF1",
        key_visuals: [
          "Maya Devi Temple / Lumbini",
          "Buddha eyes / Stupa",
          "Lotus flower",
          "Prayer wheels",
        ],
        poster_vibe: "Peaceful, Spiritual, Gold",
      },
    },
  },
  {
    bs_year: 2083,
    bs_month: 4,
    bs_day: 25,
    name: "Shrawan Sombar Fasting (Final Monday)",
    name_nepali: "श्रावण सोमबार व्रत",
    description:
      "The concluding Monday fasting period of Shrawan dedicated to Lord Shiva.",
    scope: "community",
    is_public_holiday: false,
    id: "fest_2026_01",
    category: "Vrata",
    source: "nepal_calendar_2026",
    source_ad_date: "2026-08-10",
    tithi: "Shrawan Krishna Ekadashi",
  },
  {
    bs_year: 2083,
    bs_month: 5,
    bs_day: 1,
    name: "Nag Panchami",
    name_nepali: "नाग पञ्चमी",
    description:
      "Pooja and pasting of Nag (snake deity) pictures on doorways to protect homes from evil spirits and snakebites.",
    scope: "national",
    is_public_holiday: true,
    id: "fest_2026_02",
    category: "Major Festival",
    source: "nepal_calendar_2026",
    source_ad_date: "2026-08-17",
    tithi: "Shrawan Shukla Panchami",
  },
  {
    bs_year: 2083,
    bs_month: 5,
    bs_day: 12,
    name: "Janai Purnima and Rakshya Bandhan",
    name_nepali: "जनै पूर्णिमा तथा रक्षा बन्धन",
    description:
      "A nationwide sacred-thread, family-bond and full-moon festival.",
    scope: "national",
    is_public_holiday: true,
    id: "fest_2026_03",
    category: "Major Festival",
    source: "nepal_calendar_2026",
    source_ad_date: "2026-08-28",
    tithi: "Shrawan Shukla Purnima",
  },
  {
    bs_year: 2083,
    bs_month: 5,
    bs_day: 13,
    name: "Gai Jatra",
    name_nepali: "गाईजात्रा",
    description:
      "The traditional cow festival, especially observed in Kathmandu Valley.",
    scope: "regional",
    is_public_holiday: false,
    id: "fest_2026_04",
    category: "Cultural & Religious",
    source: "nepal_calendar_2026",
    source_ad_date: "2026-08-29",
    tithi: "Bhadra Krishna Pratipada",
  },
  {
    bs_year: 2083,
    bs_month: 5,
    bs_day: 19,
    name: "Shree Krishna Janmashtami",
    name_nepali: "श्रीकृष्ण जन्माष्टमी",
    description: "Celebration of the birth of Lord Krishna.",
    scope: "national",
    is_public_holiday: true,
    id: "fest_2026_05",
    category: "Major Festival",
    source: "nepal_calendar_2026",
    source_ad_date: "2026-09-04",
    tithi: "Bhadra Krishna Ashtami",
  },
  {
    bs_year: 2083,
    bs_month: 5,
    bs_day: 21,
    name: "Gaura Parba",
    name_nepali: "गौरा पर्व",
    description:
      "Major festival observed in the Far-Western region of Nepal honoring Goddess Gauri and Lord Shiva with Deuda dances.",
    scope: "regional",
    is_public_holiday: true,
    id: "fest_2026_06",
    category: "Regional Major Festival",
    source: "nepal_calendar_2026",
    source_ad_date: "2026-09-06",
    tithi: "Bhadra Krishna Dashami",
  },
  {
    bs_year: 2083,
    bs_month: 5,
    bs_day: 25,
    name: "Gokarna Aunsi (Kushe Aunsi / Father's Day)",
    name_nepali: "कुशे औंसी (बुवाको मुख हेर्ने दिन)",
    description:
      "Bringing sacred Kush grass into homes and showing respect to fathers with gifts and special foods.",
    scope: "national",
    is_public_holiday: true,
    id: "fest_2026_07",
    category: "Observance",
    source: "nepal_calendar_2026",
    source_ad_date: "2026-09-10",
    tithi: "Bhadra Amavasya",
  },
  {
    bs_year: 2083,
    bs_month: 5,
    bs_day: 29,
    name: "Haritalika Teej",
    name_nepali: "हरितालिका तीज",
    description: "A major Hindu festival celebrated by women across Nepal.",
    scope: "women",
    is_public_holiday: false,
    id: "fest_2026_08",
    category: "Major Fasting Festival",
    source: "nepal_calendar_2026",
    source_ad_date: "2026-09-14",
    tithi: "Bhadra Shukla Tritiya",
  },
  {
    bs_year: 2083,
    bs_month: 5,
    bs_day: 30,
    name: "Ganesh Chaturthi",
    name_nepali: "गणेश चतुर्थी",
    description:
      "Celebration of the birth of Lord Ganesha, worshiped as the remover of obstacles.",
    scope: "community",
    is_public_holiday: false,
    id: "fest_2026_09",
    category: "Religious Festival",
    source: "nepal_calendar_2026",
    source_ad_date: "2026-09-15",
    tithi: "Bhadra Shukla Chaturthi",
  },
  {
    bs_year: 2083,
    bs_month: 5,
    bs_day: 31,
    name: "Rishi Panchami",
    name_nepali: "ऋषि पञ्चमी",
    description:
      "Ritual bath in holy rivers paying homage to the Saptarshis (Seven Sages) for purification.",
    scope: "women",
    is_public_holiday: false,
    id: "fest_2026_10",
    category: "Vrata & Ritual Cleanse",
    source: "nepal_calendar_2026",
    source_ad_date: "2026-09-16",
    tithi: "Bhadra Shukla Panchami",
  },
  {
    bs_year: 2083,
    bs_month: 6,
    bs_day: 8,
    name: "Indra Jatra (Yenya) and Ananta Chaturdashi",
    name_nepali: "इन्द्रजात्रा / अनन्त चतुर्दशी",
    description:
      "Festival dedicated to Lord Indra and rain, featuring the chariot procession of Living Goddess Kumari in Kathmandu Valley.",
    scope: "regional",
    is_public_holiday: false,
    id: "fest_2026_11",
    category: "Major Festival",
    source: "nepal_calendar_2026",
    source_ad_date: "2026-09-24",
    tithi: "Bhadra Shukla Chaturdashi",
  },
  {
    bs_year: 2083,
    bs_month: 6,
    bs_day: 13,
    name: "Jitia Vrata",
    name_nepali: "जितिया व्रत",
    description:
      "Rigorous Nirjala fast observed predominantly by mothers in the Mithila region for the longevity and prosperity of their children.",
    scope: "women",
    is_public_holiday: false,
    id: "fest_2026_12",
    category: "Regional Fasting Festival",
    source: "nepal_calendar_2026",
    source_ad_date: "2026-09-29",
    tithi: "Ashwin Krishna Ashtami",
  },
  {
    bs_year: 2083,
    bs_month: 6,
    bs_day: 25,
    name: "Ghatasthapana",
    name_nepali: "घटस्थापना",
    description: "The first day of Dashain and the planting of jamara.",
    scope: "national",
    is_public_holiday: true,
  },
  {
    bs_year: 2083,
    bs_month: 6,
    bs_day: 31,
    name: "Phulpati",
    name_nepali: "फूलपाती",
    description:
      "The seventh day of Dashain and the start of the main Dashain holiday period.",
    scope: "national",
    is_public_holiday: true,
  },
  {
    bs_year: 2083,
    bs_month: 7,
    bs_day: 1,
    name: "Maha Ashtami",
    name_nepali: "महाअष्टमी",
    description: "The eighth and one of the principal days of Dashain.",
    scope: "national",
    is_public_holiday: true,
  },
  {
    bs_year: 2083,
    bs_month: 7,
    bs_day: 3,
    name: "Maha Navami",
    name_nepali: "महानवमी",
    description: "A principal day of Dashain dedicated to Goddess Durga.",
    scope: "national",
    is_public_holiday: true,
  },
  {
    bs_year: 2083,
    bs_month: 7,
    bs_day: 4,
    name: "Vijaya Dashami",
    name_nepali: "विजयादशमी",
    description:
      "The main day of Dashain, celebrated with tika, jamara and family blessings.",
    scope: "national",
    is_public_holiday: true,
    content: {
      caption_template:
        "Happy Vijaya Dashami! May this joyous festival bring prosperity, peace, good health, and happiness to all our students, parents, and well-wishers.",
      hashtags: [
        "#HappyDashain",
        "#VijayaDashami",
        "#FestivalOfNepal",
        "#SchoolGreetings",
      ],
      design_guidelines: {
        primary_color: "#D32F2F",
        secondary_color: "#FFD700",
        key_visuals: [
          "Jamara",
          "Tika",
          "Ping (Bamboo Swing)",
          "Kite",
          "Barley sprouts",
        ],
        poster_vibe: "Festive, Vibrant, Traditional",
      },
    },
  },
  {
    bs_year: 2083,
    bs_month: 7,
    bs_day: 22,
    name: "Kukur Tihar and Laxmi Puja",
    name_nepali: "कुकुर तिहार तथा लक्ष्मी पूजा",
    description: "A main day of Tihar honouring dogs and Goddess Laxmi.",
    scope: "national",
    is_public_holiday: true,
    content: {
      caption_template:
        "Wishing everyone a bright and prosperous Tihar! May your lives be filled with color, light, and happiness.",
      hashtags: [
        "#HappyTihar",
        "#Deepawali",
        "#FestivalOfLights",
        "#NepalFestivals",
      ],
      design_guidelines: {
        primary_color: "#FF6F00",
        secondary_color: "#FFF59D",
        key_visuals: [
          "Oil Lamps (Diyo)",
          "Sayapatri (Marigold) Garland",
          "Rangoli",
          "Lights",
        ],
        poster_vibe: "Illuminated, Joyous, Warm",
      },
    },
  },
  {
    bs_year: 2083,
    bs_month: 7,
    bs_day: 24,
    name: "Govardhan Puja, Mha Puja and Nepal Sambat New Year",
    name_nepali: "गोवर्धन पूजा, म्ह पूजा तथा नेपाल संवत् नयाँ वर्ष",
    description:
      "Tihar observances including Newar Mha Puja and the Nepal Sambat New Year.",
    scope: "national",
    is_public_holiday: true,
    content: {
      caption_template:
        "Wishing everyone a bright and prosperous Tihar! May your lives be filled with color, light, and happiness.",
      hashtags: [
        "#HappyTihar",
        "#Deepawali",
        "#FestivalOfLights",
        "#NepalFestivals",
      ],
      design_guidelines: {
        primary_color: "#FF6F00",
        secondary_color: "#FFF59D",
        key_visuals: [
          "Oil Lamps (Diyo)",
          "Sayapatri (Marigold) Garland",
          "Rangoli",
          "Lights",
        ],
        poster_vibe: "Illuminated, Joyous, Warm",
      },
    },
  },
  {
    bs_year: 2083,
    bs_month: 7,
    bs_day: 25,
    name: "Bhai Tika",
    name_nepali: "भाइटीका",
    description:
      "The final main day of Tihar, celebrating the bond between sisters and brothers.",
    scope: "national",
    is_public_holiday: true,
    content: {
      caption_template:
        "Wishing everyone a bright and prosperous Tihar! May your lives be filled with color, light, and happiness.",
      hashtags: [
        "#HappyTihar",
        "#Deepawali",
        "#FestivalOfLights",
        "#NepalFestivals",
      ],
      design_guidelines: {
        primary_color: "#FF6F00",
        secondary_color: "#FFF59D",
        key_visuals: [
          "Oil Lamps (Diyo)",
          "Sayapatri (Marigold) Garland",
          "Rangoli",
          "Lights",
        ],
        poster_vibe: "Illuminated, Joyous, Warm",
      },
    },
  },
  {
    bs_year: 2083,
    bs_month: 7,
    bs_day: 29,
    name: "Chhath Parva",
    name_nepali: "छठ पर्व",
    description:
      "A major festival dedicated to the Sun, especially celebrated in the Terai.",
    scope: "national",
    is_public_holiday: true,
    content: {
      caption_template:
        "Heartfelt greetings on the holy occasion of Chhath Parva. May Surya Dev bless us all with vitality, purity, and good health.",
      hashtags: ["#ChhathParva", "#SuryaUpasana", "#FestivalsOfNepal"],
      design_guidelines: {
        primary_color: "#E65100",
        secondary_color: "#FFF3E0",
        key_visuals: [
          "Setting/Rising Sun",
          "River bank worship",
          "Arghya",
          "Bamboo winnow (Nanglo)",
        ],
        poster_vibe: "Spiritual, Serene, Solar",
      },
    },
  },
  {
    bs_year: 2083,
    bs_month: 9,
    bs_day: 9,
    name: "Yomari Punhi, Dhanya Purnima and Udhauli Parva",
    name_nepali: "योमरी पुन्हि, धान्य पूर्णिमा तथा उधौली पर्व",
    description: "Newar, agricultural and Kirat full-moon celebrations.",
    scope: "national",
    is_public_holiday: true,
  },
  {
    bs_year: 2083,
    bs_month: 9,
    bs_day: 15,
    name: "Tamu Lhosar",
    name_nepali: "तमु ल्होसार",
    description: "The Gurung community New Year celebration.",
    scope: "national",
    is_public_holiday: true,
    content: {
      caption_template:
        "Warm greetings on the auspicious occasion of Lhosar! Wishing peace, happiness, and good fortune to everyone celebrating.",
      hashtags: [
        "#LhosarGreetings",
        "#TamuLhosar",
        "#SonamLhosar",
        "#GyalpoLhosar",
      ],
      design_guidelines: {
        primary_color: "#0D47A1",
        secondary_color: "#FFC107",
        key_visuals: [
          "Prayer flags (Lungta)",
          "Traditional attire",
          "Monastery background",
          "Zodiac animal sign",
        ],
        poster_vibe: "Cultural, Festive, Peaceful",
      },
    },
  },
  {
    bs_year: 2083,
    bs_month: 10,
    bs_day: 1,
    name: "Maghe Sankranti and Maghi Parva",
    name_nepali: "माघे सङ्क्रान्ति तथा माघी पर्व",
    description: "A winter solstice-season festival celebrated throughout Nepal.",
    scope: "national",
    is_public_holiday: true,
  },
  {
    bs_year: 2083,
    bs_month: 10,
    bs_day: 24,
    name: "Sonam Lhosar",
    name_nepali: "सोनाम ल्होसार",
    description: "The Tamang community New Year celebration.",
    scope: "national",
    is_public_holiday: true,
    content: {
      caption_template:
        "Warm greetings on the auspicious occasion of Lhosar! Wishing peace, happiness, and good fortune to everyone celebrating.",
      hashtags: [
        "#LhosarGreetings",
        "#TamuLhosar",
        "#SonamLhosar",
        "#GyalpoLhosar",
      ],
      design_guidelines: {
        primary_color: "#0D47A1",
        secondary_color: "#FFC107",
        key_visuals: [
          "Prayer flags (Lungta)",
          "Traditional attire",
          "Monastery background",
          "Zodiac animal sign",
        ],
        poster_vibe: "Cultural, Festive, Peaceful",
      },
    },
  },
  {
    bs_year: 2083,
    bs_month: 10,
    bs_day: 28,
    name: "Basanta Panchami and Saraswati Puja",
    name_nepali: "वसन्त पञ्चमी तथा सरस्वती पूजा",
    description:
      "A celebration of learning and Goddess Saraswati, especially important to schools.",
    scope: "school",
    is_public_holiday: false,
    content: {
      caption_template:
        "Wishing all students, teachers, and parents a blessed Saraswati Puja! May the Goddess of Knowledge enlighten our minds with wisdom, art, and learning.",
      hashtags: [
        "#SaraswatiPuja",
        "#ShreePanchami",
        "#EducationNepal",
        "#SchoolLife",
      ],
      design_guidelines: {
        primary_color: "#FFC107",
        secondary_color: "#FFFFFF",
        key_visuals: [
          "Goddess Saraswati",
          "Veena",
          "Books",
          "Swastik",
          "Yellow flowers",
        ],
        poster_vibe: "Devotional, Academic, Bright",
      },
    },
  },
  {
    bs_year: 2083,
    bs_month: 11,
    bs_day: 22,
    name: "Maha Shivaratri",
    name_nepali: "महाशिवरात्रि",
    description: "A major Hindu festival dedicated to Lord Shiva.",
    scope: "national",
    is_public_holiday: true,
  },
  {
    bs_year: 2083,
    bs_month: 11,
    bs_day: 25,
    name: "Gyalpo Lhosar",
    name_nepali: "ग्याल्पो ल्होसार",
    description: "A Himalayan community New Year celebration.",
    scope: "national",
    is_public_holiday: true,
    content: {
      caption_template:
        "Warm greetings on the auspicious occasion of Lhosar! Wishing peace, happiness, and good fortune to everyone celebrating.",
      hashtags: [
        "#LhosarGreetings",
        "#TamuLhosar",
        "#SonamLhosar",
        "#GyalpoLhosar",
      ],
      design_guidelines: {
        primary_color: "#0D47A1",
        secondary_color: "#FFC107",
        key_visuals: [
          "Prayer flags (Lungta)",
          "Traditional attire",
          "Monastery background",
          "Zodiac animal sign",
        ],
        poster_vibe: "Cultural, Festive, Peaceful",
      },
    },
  },
  {
    bs_year: 2083,
    bs_month: 12,
    bs_day: 7,
    name: "Fagu Purnima (Holi — Hills and Mountains)",
    name_nepali: "फागु पूर्णिमा (होली — पहाड तथा हिमाल)",
    description:
      "The festival of colours as observed in Nepal’s hill and mountain districts.",
    scope: "regional",
    is_public_holiday: true,
    content: {
      caption_template:
        "Happy Holi! May your life be painted with the vibrant colors of joy, peace, success, and love.",
      hashtags: ["#HappyHoli", "#FaguPurnima", "#FestivalOfColors"],
      design_guidelines: {
        primary_color: "#E91E63",
        secondary_color: "#00BCD4",
        key_visuals: [
          "Color splashes (Gulal)",
          "Water balloons",
          "Pichkari",
          "Joyful silhouettes",
        ],
        poster_vibe: "Playful, Colorful, Energetic",
      },
    },
  },
  {
    bs_year: 2083,
    bs_month: 12,
    bs_day: 8,
    name: "Fagu Purnima (Holi — Terai)",
    name_nepali: "फागु पूर्णिमा (होली — तराई)",
    description:
      "The festival of colours as observed in Nepal’s Terai districts.",
    scope: "regional",
    is_public_holiday: true,
    content: {
      caption_template:
        "Happy Holi! May your life be painted with the vibrant colors of joy, peace, success, and love.",
      hashtags: ["#HappyHoli", "#FaguPurnima", "#FestivalOfColors"],
      design_guidelines: {
        primary_color: "#E91E63",
        secondary_color: "#00BCD4",
        key_visuals: [
          "Color splashes (Gulal)",
          "Water balloons",
          "Pichkari",
          "Joyful silhouettes",
        ],
        poster_vibe: "Playful, Colorful, Energetic",
      },
    },
  },
  {
    bs_year: 2083,
    bs_month: 12,
    bs_day: 23,
    name: "Ghode Jatra",
    name_nepali: "घोडेजात्रा",
    description: "Kathmandu Valley’s traditional horse festival.",
    scope: "regional",
    is_public_holiday: false,
  },
];

/**
 * Recurrence schedule for an annual occasion that does not pin to a single
 * Bikram Sambat year. Mirrors the automation calendar's `schedule` object.
 */
export interface NepalContentSchedule {
  type: "annual_gregorian" | "annual_bs" | "annual_lunar";
  calendar: "gregorian" | "nepali_bs" | "nepali_lunar";
  recurrence: "annual";
  /** Gregorian month number, Bikram Sambat month name, or null for lunar. */
  month: number | string | null;
  /** Calendar day, or null when derived from a lunar reference. */
  day: number | null;
  lunar_reference: string | null;
  tithi: string | null;
  approx_gregorian: string | null;
  approx_gregorian_months: number[] | null;
  note: string | null;
}

/**
 * A recurring social-media content template for occasions that are observed
 * every year but are not pinned to a specific Bikram Sambat date in
 * NEPAL_FESTIVALS (for example, Gregorian international days and recurring
 * national days). Festival occasions that already carry concrete 2083 BS
 * dates in NEPAL_FESTIVALS are inlined there instead, to avoid duplication.
 */
export interface NepalSocialMediaCatalogEntry {
  id: string;
  name_en: string;
  name_np: string;
  category: string;
  schedule: NepalContentSchedule;
  target_audience: string[];
  description: string | null;
  content: NepalFestivalContent;
  source: "content_catalog";
}

/**
 * Annual content templates sourced from the automation calendar's
 * `content_catalog` feed. Each entry pairs a recurring schedule with the
 * caption, hashtags and poster design used to generate social-media content.
 */
export const NEPAL_SOCIAL_MEDIA_CATALOG: ReadonlyArray<NepalSocialMediaCatalogEntry> =
  [
    {
      id: "guru-purnima",
      name_en: "Guru Purnima (Teachers' Day)",
      name_np: "गुरु पूर्णिमा",
      category: "Cultural / Academic",
      schedule: {
        type: "annual_lunar",
        calendar: "nepali_lunar",
        recurrence: "annual",
        month: null,
        day: null,
        lunar_reference: "Ashadh Purnima",
        tithi: null,
        approx_gregorian: "July",
        approx_gregorian_months: [7],
        note: null,
      },
      target_audience: ["Teachers", "Students", "Alumni"],
      description: null,
      content: {
        caption_template:
          "On this sacred day of Guru Purnima, we express our heartfelt gratitude to all our dedicated educators who shape minds and guide future leaders.",
        hashtags: [
          "#GuruPurnima",
          "#ThankYouTeachers",
          "#HonoringEducators",
          "#SchoolCommunity",
        ],
        design_guidelines: {
          primary_color: "#1A237E",
          secondary_color: "#D4AF37",
          key_visuals: [
            "Teacher instructing students",
            "Lamp/Diyo",
            "Open book",
            "Elegantly framed quotes",
          ],
          poster_vibe: "Respectful, Inspiring, Warm",
        },
      },
      source: "content_catalog",
    },
    {
      id: "constitution-day-nepal",
      name_en: "Constitution Day (Samvidhan Diwas)",
      name_np: "संविधान दिवस",
      category: "National Day",
      schedule: {
        type: "annual_bs",
        calendar: "nepali_bs",
        recurrence: "annual",
        month: "Ashoj",
        day: 3,
        lunar_reference: null,
        tithi: null,
        approx_gregorian: "September 19/20",
        approx_gregorian_months: [9],
        note: null,
      },
      target_audience: ["Citizens", "Students", "Parents"],
      description: null,
      content: {
        caption_template:
          "Happy Constitution Day! Today we celebrate the adoption of the Constitution of Nepal and reaffirm our commitment to unity, democracy, and progress.",
        hashtags: [
          "#ConstitutionDayNepal",
          "#SamvidhanDiwas",
          "#ProudNepali",
        ],
        design_guidelines: {
          primary_color: "#C62828",
          secondary_color: "#1565C0",
          key_visuals: [
            "Nepal Flag",
            "National Emblem",
            "Constitution book illustration",
            "Himalayan skyline",
          ],
          poster_vibe: "Patriotic, Formal, Dignified",
        },
      },
      source: "content_catalog",
    },
    {
      id: "national-childrens-day-nepal",
      name_en: "National Children's Day",
      name_np: "राष्ट्रिय बाल दिवस",
      category: "National Day",
      schedule: {
        type: "annual_bs",
        calendar: "nepali_bs",
        recurrence: "annual",
        month: "Bhadra",
        day: 29,
        lunar_reference: null,
        tithi: null,
        approx_gregorian: "September 14",
        approx_gregorian_months: [9],
        note: null,
      },
      target_audience: ["Students", "Parents"],
      description: null,
      content: {
        caption_template:
          "Every child deserves a safe environment, quality education, and the freedom to dream. Happy National Children's Day!",
        hashtags: [
          "#ChildrensDayNepal",
          "#ChildRights",
          "#FutureLeaders",
          "#SchoolCare",
        ],
        design_guidelines: {
          primary_color: "#0288D1",
          secondary_color: "#81C784",
          key_visuals: [
            "Happy children playing/learning",
            "Color pencils",
            "Balloons",
            "Book icons",
          ],
          poster_vibe: "Cheerful, Child-centric, Inspiring",
        },
      },
      source: "content_catalog",
    },
    {
      id: "democracy-day-nepal",
      name_en: "National Democracy Day (Prajatantra Diwas)",
      name_np: "राष्ट्रिय प्रजातन्त्र दिवस",
      category: "National Day",
      schedule: {
        type: "annual_bs",
        calendar: "nepali_bs",
        recurrence: "annual",
        month: "Falgun",
        day: 7,
        lunar_reference: null,
        tithi: null,
        approx_gregorian: "February 19",
        approx_gregorian_months: [2],
        note: null,
      },
      target_audience: ["Citizens", "Students"],
      description: null,
      content: {
        caption_template:
          "Honoring the brave souls who fought for democracy and freedom in Nepal. Happy Democracy Day!",
        hashtags: [
          "#PrajatantraDiwas",
          "#DemocracyDayNepal",
          "#NationalPride",
        ],
        design_guidelines: {
          primary_color: "#B71C1C",
          secondary_color: "#FFFFFF",
          key_visuals: [
            "National flag",
            "Martyrs memorial",
            "Dove/Freedom imagery",
          ],
          poster_vibe: "Patriotic, Historical, Respectful",
        },
      },
      source: "content_catalog",
    },
    {
      id: "national-education-day-nepal",
      name_en: "National Education Day",
      name_np: "राष्ट्रिय शिक्षा दिवस",
      category: "National Day",
      schedule: {
        type: "annual_bs",
        calendar: "nepali_bs",
        recurrence: "annual",
        month: "Ashoj",
        day: 2,
        lunar_reference: null,
        tithi: null,
        approx_gregorian: "September",
        approx_gregorian_months: [9],
        note: "Varies by government notice",
      },
      target_audience: ["Students", "Teachers", "Parents"],
      description: null,
      content: {
        caption_template:
          "Education is the most powerful tool to transform society. On National Education Day, we pledge to empower every learner with quality education.",
        hashtags: [
          "#NationalEducationDay",
          "#QualityEducation",
          "#EmpoweringYouth",
        ],
        design_guidelines: {
          primary_color: "#2E7D32",
          secondary_color: "#00ACC1",
          key_visuals: [
            "Graduation cap",
            "Open book",
            "Digital learning icons",
            "Globe",
          ],
          poster_vibe: "Professional, Academic, Modern",
        },
      },
      source: "content_catalog",
    },
    {
      id: "international-womens-day",
      name_en: "International Women's Day",
      name_np: "अन्तर्राष्ट्रिय महिला दिवस",
      category: "International Day",
      schedule: {
        type: "annual_gregorian",
        calendar: "gregorian",
        recurrence: "annual",
        month: 3,
        day: 8,
        lunar_reference: null,
        tithi: null,
        approx_gregorian: null,
        approx_gregorian_months: null,
        note: null,
      },
      target_audience: ["Staff", "Students", "Parents"],
      description: null,
      content: {
        caption_template:
          "Celebrating the strength, resilience, and achievements of women around the globe. Happy International Women's Day!",
        hashtags: [
          "#IWD",
          "#InternationalWomensDay",
          "#WomenInEducation",
          "#EmpowerGirls",
        ],
        design_guidelines: {
          primary_color: "#6A1B9A",
          secondary_color: "#F06292",
          key_visuals: [
            "Silhouettes of women/girls across professions",
            "Purple floral accents",
            "Empowerment quotes",
          ],
          poster_vibe: "Empowering, Modern, Elegant",
        },
      },
      source: "content_catalog",
    },
    {
      id: "earth-day",
      name_en: "World Earth Day",
      name_np: "विश्व पृथ्वी दिवस",
      category: "International Day",
      schedule: {
        type: "annual_gregorian",
        calendar: "gregorian",
        recurrence: "annual",
        month: 4,
        day: 22,
        lunar_reference: null,
        tithi: null,
        approx_gregorian: null,
        approx_gregorian_months: null,
        note: null,
      },
      target_audience: ["Students", "Parents"],
      description: null,
      content: {
        caption_template:
          "Invest in our planet for a sustainable future. Let us pledge today to protect the environment and keep our Earth green and clean.",
        hashtags: [
          "#EarthDay",
          "#ProtectOurPlanet",
          "#GreenSchool",
          "#Sustainability",
        ],
        design_guidelines: {
          primary_color: "#2E7D32",
          secondary_color: "#0288D1",
          key_visuals: [
            "Planet Earth in hands",
            "Green leaves/trees",
            "Clean water streams",
          ],
          poster_vibe: "Eco-friendly, Fresh, Green",
        },
      },
      source: "content_catalog",
    },
    {
      id: "world-environment-day",
      name_en: "World Environment Day",
      name_np: "विश्व वातावरण दिवस",
      category: "International Day",
      schedule: {
        type: "annual_gregorian",
        calendar: "gregorian",
        recurrence: "annual",
        month: 6,
        day: 5,
        lunar_reference: null,
        tithi: null,
        approx_gregorian: null,
        approx_gregorian_months: null,
        note: null,
      },
      target_audience: ["Students", "Community"],
      description: null,
      content: {
        caption_template:
          "Small actions today lead to a greener tomorrow. Join us in conserving nature on World Environment Day!",
        hashtags: ["#WorldEnvironmentDay", "#EcoFriendly", "#BeatPollution"],
        design_guidelines: {
          primary_color: "#1B5E20",
          secondary_color: "#8BC34A",
          key_visuals: ["Plant sapling", "Recycle symbols", "Nature landscapes"],
          poster_vibe: "Nature-focused, Clean, Urgent",
        },
      },
      source: "content_catalog",
    },
    {
      id: "international-literacy-day",
      name_en: "International Literacy Day",
      name_np: "अन्तर्राष्ट्रिय साक्षरता दिवस",
      category: "International Day",
      schedule: {
        type: "annual_gregorian",
        calendar: "gregorian",
        recurrence: "annual",
        month: 9,
        day: 8,
        lunar_reference: null,
        tithi: null,
        approx_gregorian: null,
        approx_gregorian_months: null,
        note: null,
      },
      target_audience: ["Students", "Teachers"],
      description: null,
      content: {
        caption_template:
          "Literacy opens doors to endless opportunities. Celebrating International Literacy Day with a commitment to lifelong learning!",
        hashtags: ["#LiteracyDay", "#EducationForAll", "#ReadingCulture"],
        design_guidelines: {
          primary_color: "#0D47A1",
          secondary_color: "#FF9800",
          key_visuals: [
            "Stacked books",
            "Reading light",
            "Digital devices with learning apps",
          ],
          poster_vibe: "Intellectual, Inspiring, Warm",
        },
      },
      source: "content_catalog",
    },
    {
      id: "world-teachers-day",
      name_en: "World Teachers' Day",
      name_np: "विश्व शिक्षक दिवस",
      category: "International Day",
      schedule: {
        type: "annual_gregorian",
        calendar: "gregorian",
        recurrence: "annual",
        month: 10,
        day: 5,
        lunar_reference: null,
        tithi: null,
        approx_gregorian: null,
        approx_gregorian_months: null,
        note: null,
      },
      target_audience: ["Teachers", "Students"],
      description: null,
      content: {
        caption_template:
          "To the educators who inspire, encourage, and mold young minds every single day—Happy World Teachers' Day!",
        hashtags: [
          "#WorldTeachersDay",
          "#ThankYouTeachers",
          "#TeacherAppreciation",
        ],
        design_guidelines: {
          primary_color: "#37474F",
          secondary_color: "#FFC107",
          key_visuals: [
            "Chalkboard",
            "Apple/Pen graphic",
            "Inspiring classroom scene",
          ],
          poster_vibe: "Appreciative, Professional, Warm",
        },
      },
      source: "content_catalog",
    },
  ];
