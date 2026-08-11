export type NepalFestivalScope =
  "national" | "school" | "women" | "community" | "regional";

export interface NepalFestivalDefinition {
  bs_year: number;
  bs_month: number;
  bs_day: number;
  name: string;
  name_nepali: string;
  description: string;
  scope: NepalFestivalScope;
  is_public_holiday: boolean;
}

/**
 * Festival dates that depend on the lunar calendar must be updated every
 * Bikram Sambat year. The 2083 entries are based on the Government of Nepal,
 * Ministry of Home Affairs public-holiday notice for 2083 BS, published on
 * 2082/11/18, with individual Dashain and Tihar observances included so that
 * schools can plan culturally relevant content.
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
    description:
      "Buddha Jayanti, Chandi Purnima and the Kirat festival of Ubhauli.",
    scope: "national",
    is_public_holiday: true,
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
  },
  {
    bs_year: 2083,
    bs_month: 6,
    bs_day: 9,
    name: "Indra Jatra",
    name_nepali: "इन्द्रजात्रा",
    description:
      "A major Kathmandu Valley festival honouring Indra and featuring Kumari chariots.",
    scope: "regional",
    is_public_holiday: false,
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
  },
  {
    bs_year: 2083,
    bs_month: 10,
    bs_day: 1,
    name: "Maghe Sankranti and Maghi Parva",
    name_nepali: "माघे सङ्क्रान्ति तथा माघी पर्व",
    description:
      "A winter solstice-season festival celebrated throughout Nepal.",
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
