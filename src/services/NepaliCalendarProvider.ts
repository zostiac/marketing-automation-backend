import NepaliDateConverter from "nepali-date-converter";
import {
  NEPAL_FESTIVALS,
  NepalFestivalDefinition,
} from "../data/nepalFestivals";

export const NEPAL_CALENDAR_TIMEZONE = "Asia/Kathmandu" as const;

export type NepaliOccasionCategory = "festival";

/**
 * Calendar-provider output. Both dates are date-only ISO strings; date_ad is
 * Gregorian and date_bs is Bikram Sambat.
 */
export interface NepaliCalendarOccasion {
  name: string;
  name_np: string;
  date_ad: string;
  date_bs: string;
  category: NepaliOccasionCategory;
  description: string;
}

export interface NepaliCalendarProviderOptions {
  /** Injectable clock so callers and tests can resolve "today" deterministically. */
  now?: () => Date;
  /**
   * Injectable source data. The default is the repository's curated calendar,
   * allowing an approved API/feed to replace it later without changing callers.
   */
  occasions?: ReadonlyArray<NepalFestivalDefinition>;
}

/**
 * Provides normalized Nepali occasions without depending on PostgreSQL, Redis,
 * the scheduler, or an unofficial website scraper.
 *
 * The default source is the locally curated, year-specific festival data in
 * src/data/nepalFestivals.ts. Lunar dates must be refreshed for each BS year.
 */
export class NepaliCalendarProvider {
  private readonly now: () => Date;
  private readonly sourceOccasions: ReadonlyArray<NepalFestivalDefinition>;

  constructor(options: NepaliCalendarProviderOptions = {}) {
    this.now = options.now || (() => new Date());
    this.sourceOccasions = options.occasions || NEPAL_FESTIVALS;
  }

  /** Return occasions occurring today in Nepal Standard Time. */
  getTodayOccasions(
    referenceTime: Date = this.now(),
  ): NepaliCalendarOccasion[] {
    return this.getOccasionsForDate(this.toKathmanduDate(referenceTime));
  }

  /**
   * Return occasions in a Nepal-time calendar window, including today.
   * For example, days=7 returns today and the following six dates.
   */
  getUpcomingOccasions(
    days: number = 7,
    referenceTime: Date = this.now(),
  ): NepaliCalendarOccasion[] {
    if (!Number.isInteger(days) || days < 1 || days > 366) {
      throw new Error("days must be an integer between 1 and 366");
    }

    const startDate = this.toKathmanduDate(referenceTime);
    const endDate = this.addDays(startDate, days - 1);
    return this.getOccasionsBetween(startDate, endDate);
  }

  /** Return occasions for one Gregorian date (YYYY-MM-DD). */
  getOccasionsForDate(dateAd: string): NepaliCalendarOccasion[] {
    return this.getOccasionsBetween(dateAd, dateAd);
  }

  /** Return occasions in an inclusive Gregorian date range. */
  getOccasionsBetween(
    startDateAd: string,
    endDateAd: string,
  ): NepaliCalendarOccasion[] {
    this.parseIsoDate(startDateAd);
    this.parseIsoDate(endDateAd);

    if (startDateAd > endDateAd) {
      throw new Error("startDateAd must not be after endDateAd");
    }

    const normalized = this.sourceOccasions
      .map((occasion) => this.normalize(occasion))
      .filter(
        (occasion) =>
          occasion.date_ad >= startDateAd && occasion.date_ad <= endDateAd,
      )
      .sort(
        (left, right) =>
          left.date_ad.localeCompare(right.date_ad) ||
          left.name.localeCompare(right.name),
      );

    // Protect callers if two source feeds accidentally contain the same item.
    const seen = new Set<string>();
    return normalized.filter((occasion) => {
      const key = `${occasion.date_ad}:${occasion.name
        .trim()
        .toLocaleLowerCase("en")}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /** Static convenience for code that does not need an injected source/clock. */
  static getTodayOccasions(
    referenceTime: Date = new Date(),
  ): NepaliCalendarOccasion[] {
    return new NepaliCalendarProvider().getTodayOccasions(referenceTime);
  }

  /** Static convenience for querying the default curated source. */
  static getUpcomingOccasions(
    days: number = 7,
    referenceTime: Date = new Date(),
  ): NepaliCalendarOccasion[] {
    return new NepaliCalendarProvider().getUpcomingOccasions(
      days,
      referenceTime,
    );
  }

  private normalize(occasion: NepalFestivalDefinition): NepaliCalendarOccasion {
    const dateBs = this.formatIsoDate(
      occasion.bs_year,
      occasion.bs_month,
      occasion.bs_day,
    );

    return {
      name: occasion.name.trim(),
      name_np: occasion.name_nepali.trim(),
      date_ad: this.bsToAd(
        occasion.bs_year,
        occasion.bs_month,
        occasion.bs_day,
      ),
      date_bs: dateBs,
      category: "festival",
      description: occasion.description.trim(),
    };
  }

  private bsToAd(year: number, month: number, day: number): string {
    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day)
    ) {
      throw new Error(`Invalid Bikram Sambat date: ${year}-${month}-${day}`);
    }

    try {
      // nepali-date-converter expects a zero-based BS month.
      const converted = new NepaliDateConverter(
        year,
        month - 1,
        day,
      ).toJsDate();
      return this.formatIsoDate(
        converted.getFullYear(),
        converted.getMonth() + 1,
        converted.getDate(),
      );
    } catch (_error) {
      throw new Error(
        `Invalid or unsupported Bikram Sambat date: ${year}-${month}-${day}`,
      );
    }
  }

  private toKathmanduDate(value: Date): string {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new Error("referenceTime must be a valid Date");
    }

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: NEPAL_CALENDAR_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(value);
    const getPart = (type: Intl.DateTimeFormatPartTypes): number => {
      const part = parts.find((candidate) => candidate.type === type);
      if (!part) throw new Error(`Unable to resolve ${type} in Nepal time`);
      return Number(part.value);
    };

    return this.formatIsoDate(
      getPart("year"),
      getPart("month"),
      getPart("day"),
    );
  }

  private addDays(dateAd: string, days: number): string {
    const { year, month, day } = this.parseIsoDate(dateAd);
    const result = new Date(Date.UTC(year, month - 1, day + days));
    return this.formatIsoDate(
      result.getUTCFullYear(),
      result.getUTCMonth() + 1,
      result.getUTCDate(),
    );
  }

  private parseIsoDate(value: string): {
    year: number;
    month: number;
    day: number;
  } {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) throw new Error(`Invalid Gregorian date: ${value}`);

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new Error(`Invalid Gregorian date: ${value}`);
    }

    return { year, month, day };
  }

  private formatIsoDate(year: number, month: number, day: number): string {
    return `${year.toString().padStart(4, "0")}-${month
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  }
}

export const nepaliCalendarProvider = new NepaliCalendarProvider();

export default NepaliCalendarProvider;
