import NepaliDateConverter from "nepali-date-converter";
import { db } from "../config/database";
import {
  NEPAL_FESTIVALS,
  NepalFestivalDefinition,
} from "../data/nepalFestivals";

export type ContentCalendarStatus = "draft" | "scheduled" | "published";

export interface ContentCalendarEntry {
  event_id: string;
  scheduled_publish_date: Date | string;
  platforms: string[];
  status: ContentCalendarStatus;
  caption?: string;
  hashtags?: string[];
}

export interface NepaliDateInfo {
  year: number;
  month: number;
  day: number;
  iso: string;
  formatted: string;
  formatted_nepali: string;
  month_name: string;
  month_name_nepali: string;
  weekday: string;
  weekday_nepali: string;
}

export interface ContentCalendarRecord {
  id: string;
  school_id: string;
  event_id: string;
  scheduled_publish_date: string;
  platforms: string[];
  status: ContentCalendarStatus;
  caption?: string;
  hashtags: string[];
  name?: string;
  description?: string;
  event_type?: string;
  event_date?: string;
  nepali_date: NepaliDateInfo | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface NepalFestival extends NepalFestivalDefinition {
  ad_date: string;
  nepali_date: NepaliDateInfo;
}

export interface NepaliCalendarDay {
  ad_date: string;
  nepali_date: NepaliDateInfo;
  entries: ContentCalendarRecord[];
  festivals: NepalFestival[];
}

export interface NepaliCalendarMonth {
  calendar: "bikram_sambat";
  timezone: "Asia/Kathmandu";
  year: number;
  month: number;
  month_name: string;
  month_name_nepali: string;
  start_ad_date: string;
  end_ad_date: string;
  days: NepaliCalendarDay[];
}

const NEPAL_TIMEZONE = "Asia/Kathmandu" as const;
const SUPPORTED_STATUS = new Set<ContentCalendarStatus>([
  "draft",
  "scheduled",
  "published",
]);

export class ContentCalendarService {
  /**
   * Create a content-calendar entry for an event belonging to the school.
   * Dates are stored as Gregorian DATE values and returned with their
   * corresponding Bikram Sambat representation.
   */
  static async createCalendarEntry(
    schoolId: string,
    entry: ContentCalendarEntry,
  ): Promise<ContentCalendarRecord> {
    this.validateEntry(entry);

    const scheduledDate = this.normaliseDate(entry.scheduled_publish_date);
    const platforms = this.normaliseStringArray(entry.platforms, "platforms");
    const hashtags = this.normaliseStringArray(
      entry.hashtags || [],
      "hashtags",
    );

    const result = await db.query(
      `INSERT INTO content_calendar
         (school_id, event_id, scheduled_publish_date, platforms, status, caption, hashtags)
       SELECT $1, e.id, $3::date, $4::jsonb, $5, $6, $7::jsonb
       FROM events e
       WHERE e.id = $2 AND e.school_id = $1
       RETURNING *`,
      [
        schoolId,
        entry.event_id,
        scheduledDate,
        JSON.stringify(platforms),
        entry.status,
        entry.caption || null,
        JSON.stringify(hashtags),
      ],
    );

    if (!result.rows.length) {
      throw new Error("Event not found for this school");
    }

    return this.enrichCalendarRow({
      ...result.rows[0],
      scheduled_publish_date: scheduledDate,
    });
  }

  /**
   * Return a Gregorian calendar month, while adding a Nepali date to every
   * scheduled entry. monthOffset=0 is the current month in Kathmandu.
   */
  static async getCalendar(
    schoolId: string,
    monthOffset: number = 0,
  ): Promise<ContentCalendarRecord[]> {
    if (!Number.isInteger(monthOffset)) {
      throw new Error("monthOffset must be an integer");
    }

    const kathmanduToday = this.getKathmanduDateParts(new Date());
    const monthStart = new Date(
      Date.UTC(kathmanduToday.year, kathmanduToday.month - 1 + monthOffset, 1),
    );
    const nextMonthStart = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
    );

    return this.getCalendarBetween(
      schoolId,
      this.utcDateToIso(monthStart),
      this.utcDateToIso(nextMonthStart),
    );
  }

  /**
   * Return a complete Bikram Sambat month. The result combines scheduled
   * school content with the curated Nepal festival list for that BS year.
   */
  static async getNepaliCalendar(
    schoolId: string,
    bsYear: number,
    bsMonth: number,
  ): Promise<NepaliCalendarMonth> {
    this.validateBsMonth(bsYear, bsMonth);

    const monthStart = this.bsToAd(bsYear, bsMonth, 1);
    const nextBsMonth =
      bsMonth === 12
        ? { year: bsYear + 1, month: 1 }
        : { year: bsYear, month: bsMonth + 1 };
    const nextMonthStart = this.bsToAd(nextBsMonth.year, nextBsMonth.month, 1);

    const [entries, festivals] = await Promise.all([
      this.getCalendarBetween(schoolId, monthStart, nextMonthStart),
      Promise.resolve(this.getNepalFestivals(bsYear, bsMonth)),
    ]);

    const entriesByDate = this.groupByDate(
      entries,
      (entry) => entry.scheduled_publish_date,
    );
    const festivalsByDate = this.groupByDate(
      festivals,
      (festival) => festival.ad_date,
    );
    const totalDays = this.daysBetween(monthStart, nextMonthStart);
    const days: NepaliCalendarDay[] = [];

    for (let day = 1; day <= totalDays; day += 1) {
      const adDate = this.bsToAd(bsYear, bsMonth, day);
      days.push({
        ad_date: adDate,
        nepali_date: this.toNepaliDate(adDate),
        entries: entriesByDate.get(adDate) || [],
        festivals: festivalsByDate.get(adDate) || [],
      });
    }

    const firstDay = days[0].nepali_date;
    return {
      calendar: "bikram_sambat",
      timezone: NEPAL_TIMEZONE,
      year: bsYear,
      month: bsMonth,
      month_name: firstDay.month_name,
      month_name_nepali: firstDay.month_name_nepali,
      start_ad_date: monthStart,
      end_ad_date: this.addDays(nextMonthStart, -1),
      days,
    };
  }

  /** Return the current date in Nepal in both calendars. */
  static getTodayInNepal(): { ad_date: string; nepali_date: NepaliDateInfo } {
    const parts = this.getKathmanduDateParts(new Date());
    const adDate = this.formatIsoDate(parts.year, parts.month, parts.day);
    return {
      ad_date: adDate,
      nepali_date: this.toNepaliDate(adDate),
    };
  }

  /**
   * Return curated Nepal festival dates. Lunar festival dates are year
   * specific; currently the repository contains the official 2083 BS set.
   */
  static getNepalFestivals(bsYear: number, bsMonth?: number): NepalFestival[] {
    if (!Number.isInteger(bsYear)) {
      throw new Error("BS year must be an integer");
    }
    if (
      bsMonth !== undefined &&
      (!Number.isInteger(bsMonth) || bsMonth < 1 || bsMonth > 12)
    ) {
      throw new Error("BS month must be between 1 and 12");
    }

    return NEPAL_FESTIVALS.filter(
      (festival) =>
        festival.bs_year === bsYear &&
        (bsMonth === undefined || festival.bs_month === bsMonth),
    ).map((festival) => {
      const adDate = this.bsToAd(
        festival.bs_year,
        festival.bs_month,
        festival.bs_day,
      );
      return {
        ...festival,
        ad_date: adDate,
        nepali_date: this.toNepaliDate(adDate),
      };
    });
  }

  /**
   * Import the curated festivals into a school's events table. Re-running the
   * method updates matching events and removes stale imported events for the
   * year, so festival names and dates can safely be changed in the data file.
   */
  static async syncNepalFestivals(
    schoolId: string,
    bsYear: number,
  ): Promise<any[]> {
    const festivalRows = this.getNepalFestivals(bsYear).map((festival) => ({
      name: `${festival.name} (${festival.name_nepali})`,
      event_date: festival.ad_date,
      description: festival.description,
      relevance: festival.scope,
      custom_instructions:
        `Create culturally respectful school content for ${festival.name_nepali}. ` +
        `Nepali date: ${festival.nepali_date.formatted_nepali}.`,
    }));

    if (!festivalRows.length) {
      throw new Error(
        `No curated Nepal festival data is available for BS ${bsYear}`,
      );
    }

    const yearStart = this.bsToAd(bsYear, 1, 1);
    const nextYearStart = this.bsToAd(bsYear + 1, 1, 1);

    const result = await db.query(
      `WITH festival_data AS (
         SELECT *
         FROM jsonb_to_recordset($2::jsonb) AS festival(
           name text,
           event_date date,
           description text,
           relevance text,
           custom_instructions text
         )
       ),
       deleted_stale_festivals AS (
         DELETE FROM events existing
         WHERE existing.school_id = $1
           AND existing.event_type = 'nepal_festival'
           AND existing.event_date >= $3::date
           AND existing.event_date < $4::date
           AND NOT EXISTS (
             SELECT 1
             FROM festival_data current
             WHERE current.name = existing.name
               AND current.event_date = existing.event_date
           )
         RETURNING existing.id
       )
       INSERT INTO events
         (school_id, name, event_date, event_type, description, relevance,
          design_requirement, preferred_design_type, custom_instructions)
       SELECT $1, name, event_date, 'nepal_festival', description, relevance,
              'Festival social media content', 'social_media_post', custom_instructions
       FROM festival_data
       ON CONFLICT (school_id, name, event_date)
       DO UPDATE SET
         description = EXCLUDED.description,
         relevance = EXCLUDED.relevance,
         design_requirement = EXCLUDED.design_requirement,
         preferred_design_type = EXCLUDED.preferred_design_type,
         custom_instructions = EXCLUDED.custom_instructions,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [schoolId, JSON.stringify(festivalRows), yearStart, nextYearStart],
    );

    return result.rows;
  }

  static async schedulePublishing(
    schoolId: string,
    eventId: string,
    platforms: string[],
  ): Promise<void> {
    const event = await db.query(
      "SELECT event_date::text AS event_date FROM events WHERE id = $1 AND school_id = $2",
      [eventId, schoolId],
    );

    if (!event.rows.length) {
      throw new Error("Event not found for this school");
    }

    const eventDate = this.normaliseDate(event.rows[0].event_date);
    await this.createCalendarEntry(schoolId, {
      event_id: eventId,
      scheduled_publish_date: eventDate,
      platforms,
      status: "scheduled",
    });

    console.log(
      `Publishing scheduled for ${platforms.join(", ")} on ${eventDate} (Asia/Kathmandu)`,
    );
  }

  private static async getCalendarBetween(
    schoolId: string,
    startDate: string,
    endDateExclusive: string,
  ): Promise<ContentCalendarRecord[]> {
    const result = await db.query(
      `SELECT cc.*,
              cc.scheduled_publish_date::text AS scheduled_publish_date,
              e.name,
              e.description,
              e.event_type,
              e.event_date::text AS event_date
       FROM content_calendar cc
       JOIN events e ON cc.event_id = e.id AND cc.school_id = e.school_id
       WHERE cc.school_id = $1
         AND cc.scheduled_publish_date >= $2::date
         AND cc.scheduled_publish_date < $3::date
       ORDER BY cc.scheduled_publish_date ASC, cc.created_at ASC`,
      [schoolId, startDate, endDateExclusive],
    );

    return result.rows.map((row) => this.enrichCalendarRow(row));
  }

  private static enrichCalendarRow(row: any): ContentCalendarRecord {
    const scheduledDate = this.normaliseDate(row.scheduled_publish_date);
    return {
      ...row,
      scheduled_publish_date: scheduledDate,
      platforms: this.parseStringArray(row.platforms),
      hashtags: this.parseStringArray(row.hashtags),
      nepali_date: this.safeToNepaliDate(scheduledDate),
    } as ContentCalendarRecord;
  }

  private static validateEntry(entry: ContentCalendarEntry): void {
    if (!entry.event_id) {
      throw new Error("event_id is required");
    }
    const platforms = this.normaliseStringArray(entry.platforms, "platforms");
    if (!platforms.length) {
      throw new Error("At least one publishing platform is required");
    }
    if (entry.hashtags !== undefined) {
      this.normaliseStringArray(entry.hashtags, "hashtags");
    }
    if (!SUPPORTED_STATUS.has(entry.status)) {
      throw new Error("status must be draft, scheduled or published");
    }
    this.normaliseDate(entry.scheduled_publish_date);
  }

  private static validateBsMonth(year: number, month: number): void {
    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      throw new Error("BS year and month must be integers");
    }
    if (month < 1 || month > 12) {
      throw new Error("BS month must be between 1 and 12");
    }

    // The converter currently carries authoritative month data for 2000-2090 BS.
    if (year < 2000 || year > 2089) {
      throw new Error("Nepali calendar supports BS years 2000 through 2089");
    }
  }

  private static bsToAd(year: number, month: number, day: number): string {
    if (month < 1 || month > 12 || day < 1) {
      throw new Error("Invalid Bikram Sambat date");
    }

    try {
      // NepaliDateConverter uses a zero-based month index.
      const adDate = new NepaliDateConverter(year, month - 1, day).toJsDate();
      return this.localDateToIso(adDate);
    } catch (_error) {
      throw new Error(
        `Invalid or unsupported Bikram Sambat date: ${year}-${month}-${day}`,
      );
    }
  }

  private static toNepaliDate(adDate: string): NepaliDateInfo {
    const { year, month, day } = this.parseIsoDate(adDate);
    const nepaliDate = new NepaliDateConverter(new Date(year, month - 1, day));

    return {
      year: nepaliDate.getYear(),
      month: nepaliDate.getMonth() + 1,
      day: nepaliDate.getDate(),
      iso: nepaliDate.format("YYYY-MM-DD", "en"),
      formatted: nepaliDate.format("ddd, D MMMM YYYY", "en"),
      formatted_nepali: nepaliDate.format("ddd, D MMMM YYYY", "np"),
      month_name: nepaliDate.format("MMMM", "en"),
      month_name_nepali: nepaliDate.format("MMMM", "np"),
      weekday: nepaliDate.format("ddd", "en"),
      weekday_nepali: nepaliDate.format("ddd", "np"),
    };
  }

  private static safeToNepaliDate(adDate: string): NepaliDateInfo | null {
    try {
      return this.toNepaliDate(adDate);
    } catch (_error) {
      return null;
    }
  }

  private static normaliseDate(value: Date | string): string {
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        throw new Error("scheduled_publish_date must be a valid date");
      }
      const parts = this.getKathmanduDateParts(value);
      return this.formatIsoDate(parts.year, parts.month, parts.day);
    }

    if (typeof value !== "string") {
      throw new Error("scheduled_publish_date must be a valid date");
    }

    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
    if (dateOnlyMatch && !value.includes("T")) {
      const dateOnly = `${dateOnlyMatch[1]}-${dateOnlyMatch[2]}-${dateOnlyMatch[3]}`;
      this.parseIsoDate(dateOnly);
      return dateOnly;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("scheduled_publish_date must be a valid date");
    }
    const parts = this.getKathmanduDateParts(parsed);
    return this.formatIsoDate(parts.year, parts.month, parts.day);
  }

  private static parseIsoDate(value: string): {
    year: number;
    month: number;
    day: number;
  } {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      throw new Error(`Invalid ISO date: ${value}`);
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const testDate = new Date(Date.UTC(year, month - 1, day));
    if (
      testDate.getUTCFullYear() !== year ||
      testDate.getUTCMonth() !== month - 1 ||
      testDate.getUTCDate() !== day
    ) {
      throw new Error(`Invalid ISO date: ${value}`);
    }

    return { year, month, day };
  }

  private static getKathmanduDateParts(date: Date): {
    year: number;
    month: number;
    day: number;
  } {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: NEPAL_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(date);
    const value = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value);

    return {
      year: value("year"),
      month: value("month"),
      day: value("day"),
    };
  }

  private static normaliseStringArray(value: unknown, field: string): string[] {
    if (
      !Array.isArray(value) ||
      value.some((item) => typeof item !== "string")
    ) {
      throw new Error(`${field} must be an array of strings`);
    }

    return [...new Set((value as string[]).map((item) => item.trim()))].filter(
      Boolean,
    );
  }

  private static parseStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((item) => typeof item === "string") as string[];
    }
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed)
          ? parsed.filter((item) => typeof item === "string")
          : [];
      } catch (_error) {
        return [];
      }
    }
    return [];
  }

  private static groupByDate<T>(
    items: T[],
    getDate: (item: T) => string,
  ): Map<string, T[]> {
    const grouped = new Map<string, T[]>();
    for (const item of items) {
      const date = getDate(item);
      grouped.set(date, [...(grouped.get(date) || []), item]);
    }
    return grouped;
  }

  private static daysBetween(startDate: string, endDate: string): number {
    const start = this.parseIsoDate(startDate);
    const end = this.parseIsoDate(endDate);
    return Math.round(
      (Date.UTC(end.year, end.month - 1, end.day) -
        Date.UTC(start.year, start.month - 1, start.day)) /
        86_400_000,
    );
  }

  private static addDays(date: string, days: number): string {
    const parts = this.parseIsoDate(date);
    const result = new Date(
      Date.UTC(parts.year, parts.month - 1, parts.day + days),
    );
    return this.utcDateToIso(result);
  }

  private static localDateToIso(date: Date): string {
    return this.formatIsoDate(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    );
  }

  private static utcDateToIso(date: Date): string {
    return this.formatIsoDate(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
    );
  }

  private static formatIsoDate(
    year: number,
    month: number,
    day: number,
  ): string {
    return `${year.toString().padStart(4, "0")}-${month
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  }
}
