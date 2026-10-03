const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Remplace les chiffres 0-9 par les chiffres arabes orientaux ٠-٩. */
export const toArabicIndicDigits = (text: string): string =>
  text.replace(/[0-9]/g, (digit) => ARABIC_INDIC_DIGITS[Number(digit)] ?? digit);
