package bazi

import (
	"fmt"

	bazigo "github.com/warrially/BaziGo"
)

// BaziChart represents a complete bazi chart
type BaziChart struct {
	YearGanzhi  string `json:"year_ganzhi"`
	MonthGanzhi string `json:"month_ganzhi"`
	DayGanzhi   string `json:"day_ganzhi"`
	HourGanzhi  string `json:"hour_ganzhi"`
}

// Calculate calculates the bazi chart for given date and time using the external BaziGo library
func Calculate(year, month, day, hour int) (*BaziChart, error) {
	// Validate input
	if err := validateInput(year, month, day, hour); err != nil {
		return nil, err
	}

	// Use the external BaziGo library to calculate the bazi
	// Sex parameter: 1 for male, 0 for female (we'll default to male for calculation purposes)
	// The minute and second parameters are set to 0 as we only receive hour precision
	pBazi := bazigo.GetBazi(year, month, day, hour, 0, 0, 1)

	// Extract the four pillars from the BaziGo result
	siZhu := pBazi.SiZhu()
	baziChart := &BaziChart{
		YearGanzhi:  siZhu.YearZhu().GanZhi().String(),
		MonthGanzhi: siZhu.MonthZhu().GanZhi().String(),
		DayGanzhi:   siZhu.DayZhu().GanZhi().String(),
		HourGanzhi:  siZhu.HourZhu().GanZhi().String(),
	}

	return baziChart, nil
}

// validateInput validates the input parameters
func validateInput(year, month, day, hour int) error {
	if year < 1900 || year > 2100 {
		return fmt.Errorf("year must be between 1900 and 2100")
	}
	if month < 1 || month > 12 {
		return fmt.Errorf("month must be between 1 and 12")
	}
	if day < 1 || day > 31 {
		return fmt.Errorf("day must be between 1 and 31")
	}
	if hour < 0 || hour > 23 {
		return fmt.Errorf("hour must be between 0 and 23")
	}

	// Additional validation for days in month
	daysInMonth := getDaysInMonth(year, month)
	if day > daysInMonth {
		return fmt.Errorf("day %d is invalid for month %d", day, month)
	}

	return nil
}

// getDaysInMonth returns the number of days in a given month and year
func getDaysInMonth(year, month int) int {
	daysInMonth := []int{31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31}

	// Handle leap year for February
	if month == 2 && isLeapYear(year) {
		return 29
	}

	return daysInMonth[month-1]
}

// isLeapYear checks if a year is a leap year
func isLeapYear(year int) bool {
	return (year%4 == 0 && year%100 != 0) || (year%400 == 0)
}

// GetGanzhiInfo returns detailed information about ganzhi using the external library
func GetGanzhiInfo(ganzhi string) map[string]interface{} {
	if len(ganzhi) < 2 {
		return nil
	}

	// Parse the ganzhi string
	tianGanChar := ganzhi[:1]
	diZhiChar := ganzhi[1:]

	// For now, return basic information since NewGanzhi might not be available in the expected way
	// We'll need to implement this differently based on the actual library API
	info := map[string]interface{}{
		"ganzhi":  ganzhi,
		"tiangan": tianGanChar,
		"dizhi":   diZhiChar,
	}

	return info
}

// GetDetailedBaziInfo returns comprehensive bazi information using the external library
func GetDetailedBaziInfo(year, month, day, hour int) (map[string]interface{}, error) {
	// Validate input
	if err := validateInput(year, month, day, hour); err != nil {
		return nil, err
	}

	// Get detailed bazi calculation from the external library
	pBazi := bazigo.GetBazi(year, month, day, hour, 0, 0, 1)
	siZhu := pBazi.SiZhu()

	// Build comprehensive result with available methods
	result := map[string]interface{}{
		"basic_chart": map[string]interface{}{
			"year_ganzhi":  siZhu.YearZhu().GanZhi().String(),
			"month_ganzhi": siZhu.MonthZhu().GanZhi().String(),
			"day_ganzhi":   siZhu.DayZhu().GanZhi().String(),
			"hour_ganzhi":  siZhu.HourZhu().GanZhi().String(),
		},
		"year_pillar": map[string]interface{}{
			"ganzhi":     siZhu.YearZhu().GanZhi().String(),
			"gan":        siZhu.YearZhu().Gan().String(),
			"zhi":        siZhu.YearZhu().Zhi().String(),
			"gan_wuxing": siZhu.YearZhu().Gan().ToWuXing().String(),
			"zhi_wuxing": siZhu.YearZhu().Zhi().ToWuXing().String(),
		},
		"month_pillar": map[string]interface{}{
			"ganzhi":     siZhu.MonthZhu().GanZhi().String(),
			"gan":        siZhu.MonthZhu().Gan().String(),
			"zhi":        siZhu.MonthZhu().Zhi().String(),
			"gan_wuxing": siZhu.MonthZhu().Gan().ToWuXing().String(),
			"zhi_wuxing": siZhu.MonthZhu().Zhi().ToWuXing().String(),
		},
		"day_pillar": map[string]interface{}{
			"ganzhi":     siZhu.DayZhu().GanZhi().String(),
			"gan":        siZhu.DayZhu().Gan().String(),
			"zhi":        siZhu.DayZhu().Zhi().String(),
			"gan_wuxing": siZhu.DayZhu().Gan().ToWuXing().String(),
			"zhi_wuxing": siZhu.DayZhu().Zhi().ToWuXing().String(),
		},
		"hour_pillar": map[string]interface{}{
			"ganzhi":     siZhu.HourZhu().GanZhi().String(),
			"gan":        siZhu.HourZhu().Gan().String(),
			"zhi":        siZhu.HourZhu().Zhi().String(),
			"gan_wuxing": siZhu.HourZhu().Gan().ToWuXing().String(),
			"zhi_wuxing": siZhu.HourZhu().Zhi().ToWuXing().String(),
		},
		"dayun":      pBazi.DaYun().String(),
		"lunar_date": pBazi.LunarDate().String(),
		"bazi_html":  pBazi.ToHTML(),
	}

	return result, nil
}

// VerifyDayGanzhi verifies day pillar calculation using the external library
func VerifyDayGanzhi(year, month, day int, expectedGanzhi string) bool {
	pBazi := bazigo.GetBazi(year, month, day, 12, 0, 0, 1) // Use noon as default
	calculated := pBazi.SiZhu().DayZhu().GanZhi().String()
	return calculated == expectedGanzhi
}
