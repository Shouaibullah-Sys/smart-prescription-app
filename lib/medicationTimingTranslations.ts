// lib/medicationTimingTranslations.ts

/**
 * Translation mapping for medication timing values from English to Dari Afghani
 */
export const TIMING_TRANSLATIONS = {
  // English key -> Dari Afghani value
  after_meal: "بعد از غذا",
  before_meal: "قبل از غذا",
  with_meal: "همراه غذا",
  empty_stomach: "ناشتا",
  anytime: "هر زمان",
  at_bedtime: "وقت خواب",
  as_needed: "طبق نیاز",

  // English display values -> Dari Afghani
  "Before meal": "قبل از غذا",
  "After meal": "بعد از غذا",
  "With food": "با غذا",
  "On empty stomach": "ناشتا",
  "At bedtime": "وقت خواب",
  "As needed": "طبق نیاز",

  // Frequency translations
  once_daily: "روزی یک بار",
  twice_daily: "روزی دو بار",
  three_times_daily: "روزی سه بار",
  four_times_daily: "روزی چهار بار",
  every_6_hours: "هر ۶ ساعت",
  every_8_hours: "هر ۸ ساعت",
  every_12_hours: "هر ۱۲ ساعت",
  as_needed_frequency: "طبق نیاز",

  // Duration translations
  "3_days": "۳ روز",
  "5_days": "۵ روز",
  "7_days": "۷ روز",
  "10_days": "۱۰ روز",
  "14_days": "۱۴ روز",
  "30_days": "۳۰ روز",
  until_finished: "تا تمام شدن",
  continuous: "مستمر",
} as const;

/**
 * Translate medication timing value to Dari Afghani
 */
export function translateTiming(timing: string): string {
  return (
    TIMING_TRANSLATIONS[timing as keyof typeof TIMING_TRANSLATIONS] || timing
  );
}

/**
 * Get all available timing options with their Dari translations
 */
export function getTimingOptions(): Array<{ value: string; label: string }> {
  return [
    { value: "before_meal", label: translateTiming("before_meal") },
    { value: "after_meal", label: translateTiming("after_meal") },
    { value: "with_meal", label: translateTiming("with_meal") },
    { value: "empty_stomach", label: translateTiming("empty_stomach") },
    { value: "anytime", label: translateTiming("anytime") },
    { value: "at_bedtime", label: translateTiming("at_bedtime") },
    { value: "as_needed", label: translateTiming("as_needed") },
  ];
}

/**
 * Get all available frequency options with their Dari translations
 */
export function getFrequencyOptions(): Array<{ value: string; label: string }> {
  return [
    { value: "once_daily", label: translateTiming("once_daily") },
    { value: "twice_daily", label: translateTiming("twice_daily") },
    { value: "three_times_daily", label: translateTiming("three_times_daily") },
    { value: "four_times_daily", label: translateTiming("four_times_daily") },
    { value: "every_6_hours", label: translateTiming("every_6_hours") },
    { value: "every_8_hours", label: translateTiming("every_8_hours") },
    { value: "every_12_hours", label: translateTiming("every_12_hours") },
    {
      value: "as_needed_frequency",
      label: translateTiming("as_needed_frequency"),
    },
  ];
}

/**
 * Get all available duration options with their Dari translations
 */
export function getDurationOptions(): Array<{ value: string; label: string }> {
  return [
    { value: "3_days", label: translateTiming("3_days") },
    { value: "5_days", label: translateTiming("5_days") },
    { value: "7_days", label: translateTiming("7_days") },
    { value: "10_days", label: translateTiming("10_days") },
    { value: "14_days", label: translateTiming("14_days") },
    { value: "30_days", label: translateTiming("30_days") },
    { value: "until_finished", label: translateTiming("until_finished") },
    { value: "continuous", label: translateTiming("continuous") },
  ];
}
