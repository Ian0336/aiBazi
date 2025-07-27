
/**
 * Convert lunar date to Republic of China (Taiwan) calendar format
 * @param lunarDate - Lunar date string in format "YYYY年MM月DD日"
 * @returns Formatted string with ROC year
 */
export const convertToROCDate = (lunarDate: string): string => {
  try {
    // Extract year from lunar date (format: "YYYY年MM月DD日")
    const yearMatch = lunarDate.match(/(\d{4})年/);
    
    if (!yearMatch) {
      return lunarDate; // Return original if can't parse
    }
    
    const adYear = parseInt(yearMatch[1]);
    const rocYear = adYear - 1911; // Republic of China started in 1912 (1912 - 1911 = 1)
    
    // Replace the year part with ROC year
    return lunarDate.replace(/\d{4}年/, `民國${rocYear}年`);
  } catch (error) {
    console.error('Error converting to ROC date:', error);
    return lunarDate; // Return original on error
  }
};

