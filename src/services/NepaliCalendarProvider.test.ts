import assert from "node:assert/strict";
import test from "node:test";
import {
  NepaliCalendarProvider,
  NepaliCalendarOccasion,
} from "./NepaliCalendarProvider";

test("getTodayOccasions resolves today in Asia/Kathmandu", () => {
  // 18:30 UTC is already the next calendar day in Nepal.
  const provider = new NepaliCalendarProvider({
    now: () => new Date("2026-08-16T18:30:00.000Z"),
  });

  assert.deepEqual(provider.getTodayOccasions(), [
    {
      name: "Nag Panchami",
      name_np: "नाग पञ्चमी",
      date_ad: "2026-08-17",
      date_bs: "2083-05-01",
      category: "festival",
      description:
        "A festival honouring serpent deities and praying for protection and wellbeing.",
    },
  ] satisfies NepaliCalendarOccasion[]);
});

test("getUpcomingOccasions returns a sorted, inclusive Nepal-time window", () => {
  const provider = new NepaliCalendarProvider({
    now: () => new Date("2026-08-16T12:00:00.000Z"),
  });

  const occasions = provider.getUpcomingOccasions(13);

  assert.equal(occasions[0].name, "Nag Panchami");
  assert.equal(occasions[0].date_ad, "2026-08-17");
  assert.equal(occasions[1].name, "Janai Purnima and Rakshya Bandhan");
  assert.equal(occasions[1].date_ad, "2026-08-28");
});

test("getOccasionsForDate rejects invalid Gregorian dates", () => {
  const provider = new NepaliCalendarProvider();

  assert.throws(
    () => provider.getOccasionsForDate("2026-02-30"),
    /Invalid Gregorian date/,
  );
});

test("getUpcomingOccasions validates the requested range", () => {
  const provider = new NepaliCalendarProvider();

  assert.throws(
    () => provider.getUpcomingOccasions(0),
    /days must be an integer between 1 and 366/,
  );
});
