package bazi

import (
	"fmt"
	"time"
)

// BaziChart represents a complete bazi chart
type BaziChart struct {
	YearGanzhi  string `json:"year_ganzhi"`
	MonthGanzhi string `json:"month_ganzhi"`
	DayGanzhi   string `json:"day_ganzhi"`
	HourGanzhi  string `json:"hour_ganzhi"`
}

// Constants for traditional Chinese calendar calculations
var (
	// 天干 (Heavenly Stems)
	tianGan = []string{
		"甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸",
	}

	// 地支 (Earthly Branches)
	diZhi = []string{
		"子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥",
	}

	// 60甲子順序表 (60 Ganzhi Sequence Table)
	ganzhiTable = []string{
		"甲子", "乙丑", "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", "壬申", "癸酉", // 1-10
		"甲戌", "乙亥", "丙子", "丁丑", "戊寅", "己卯", "庚辰", "辛巳", "壬午", "癸未", // 11-20
		"甲申", "乙酉", "丙戌", "丁亥", "戊子", "己丑", "庚寅", "辛卯", "壬辰", "癸巳", // 21-30
		"甲午", "乙未", "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑", "壬寅", "癸卯", // 31-40
		"甲辰", "乙巳", "丙午", "丁未", "戊申", "己酉", "庚戌", "辛亥", "壬子", "癸丑", // 41-50
		"甲寅", "乙卯", "丙辰", "丁巳", "戊午", "己未", "庚申", "辛酉", "壬戌", "癸亥", // 51-60
	}

	// 時辰對應表 (Hour to Earthly Branch mapping)
	hourToDiZhi = map[int]int{
		23: 0, 0: 0, 1: 0, // 子時 (23:00-01:00)
		2: 1, 3: 1, // 丑時 (01:00-03:00)
		4: 2, 5: 2, // 寅時 (03:00-05:00)
		6: 3, 7: 3, // 卯時 (05:00-07:00)
		8: 4, 9: 4, // 辰時 (07:00-09:00)
		10: 5, 11: 5, // 巳時 (09:00-11:00)
		12: 6, 13: 6, // 午時 (11:00-13:00)
		14: 7, 15: 7, // 未時 (13:00-15:00)
		16: 8, 17: 8, // 申時 (15:00-17:00)
		18: 9, 19: 9, // 酉時 (17:00-19:00)
		20: 10, 21: 10, // 戌時 (19:00-21:00)
		22: 11, // 亥時 (21:00-23:00)
	}

	// 月建地支 (Month to Earthly Branch mapping)
	// 正月建寅，二月建卯，以此類推
	monthToDiZhi = []int{
		2,  // 正月 (1月) -> 寅
		3,  // 二月 (2月) -> 卯
		4,  // 三月 (3月) -> 辰
		5,  // 四月 (4月) -> 巳
		6,  // 五月 (5月) -> 午
		7,  // 六月 (6月) -> 未
		8,  // 七月 (7月) -> 申
		9,  // 八月 (8月) -> 酉
		10, // 九月 (9月) -> 戌
		11, // 十月 (10月) -> 亥
		0,  // 十一月 (11月) -> 子
		1,  // 十二月 (12月) -> 丑
	}
)

// Calculate calculates the bazi chart for given date and time
func Calculate(year, month, day, hour int) (*BaziChart, error) {
	// Validate input
	if err := validateInput(year, month, day, hour); err != nil {
		return nil, err
	}

	// 處理子時的特殊情況：子時(23:00-01:00)算下一天
	actualYear := year
	actualMonth := month
	actualDay := day
	actualHour := hour

	if hour == 23 {
		// 23點算隔天
		actualYear, actualMonth, actualDay = getNextDay(year, month, day)
	}

	// Calculate each pillar
	yearGanzhi := calculateYearGanzhi(actualYear)
	monthGanzhi := calculateMonthGanzhi(actualYear, actualMonth)
	dayGanzhi := calculateDayGanzhi(actualYear, actualMonth, actualDay)
	hourGanzhi := calculateHourGanzhi(actualHour, dayGanzhi[:1])

	return &BaziChart{
		YearGanzhi:  yearGanzhi,
		MonthGanzhi: monthGanzhi,
		DayGanzhi:   dayGanzhi,
		HourGanzhi:  hourGanzhi,
	}, nil
}

// getNextDay returns the next day's date
func getNextDay(year, month, day int) (int, int, int) {
	t := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
	nextDay := t.AddDate(0, 0, 1)
	return nextDay.Year(), int(nextDay.Month()), nextDay.Day()
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

// calculateYearGanzhi calculates the ganzhi for the year
func calculateYearGanzhi(year int) string {
	// 公元後年份的干支計算
	// 年干：(年份 - 4) % 10
	// 年支：(年份 - 4) % 12

	tianGanIndex := (year - 4) % 10
	diZhiIndex := (year - 4) % 12

	// Handle negative modulo results
	if tianGanIndex < 0 {
		tianGanIndex += 10
	}
	if diZhiIndex < 0 {
		diZhiIndex += 12
	}

	return tianGan[tianGanIndex] + diZhi[diZhiIndex]
}

// calculateMonthGanzhi calculates the ganzhi for the month
func calculateMonthGanzhi(year, month int) string {
	// 月支固定，月干根據年干推算
	// 甲己年：丙寅開始
	// 乙庚年：戊寅開始
	// 丙辛年：庚寅開始
	// 丁壬年：壬寅開始
	// 戊癸年：甲寅開始

	yearTianGanIndex := (year - 4) % 10
	if yearTianGanIndex < 0 {
		yearTianGanIndex += 10
	}

	// 月干起始位置表
	monthTianGanStart := []int{2, 4, 6, 8, 0} // 對應甲己、乙庚、丙辛、丁壬、戊癸
	startIndex := monthTianGanStart[yearTianGanIndex/2]

	// 計算月干
	monthTianGanIndex := (startIndex + month - 1) % 10

	// 月支
	monthDiZhiIndex := monthToDiZhi[month-1]

	return tianGan[monthTianGanIndex] + diZhi[monthDiZhiIndex]
}

// calculateDayGanzhi calculates the ganzhi for the day using the correct formula from the reference
func calculateDayGanzhi(year, month, day int) string {
	// 根據參考文件中的公式計算日柱
	// 1901年——2000年公式：干支總序數＝5×（西元年最後兩位數－1）﹢〔（西元年最後兩位數－1）÷4〕﹢出生日在當年的天數﹢15
	// 2001年——2100年公式：干支總序數＝5×（西元年最後兩位數－1）﹢〔（西元年最後兩位數－1）÷4〕﹢出生日在當年的天數

	lastTwoDigits := year % 100
	if lastTwoDigits == 0 {
		lastTwoDigits = 100
	}

	// 計算出生日在當年的天數
	dayOfYear := getDayOfYear(year, month, day)

	// 計算干支總序數
	ganzhiTotal := 5*(lastTwoDigits-1) + (lastTwoDigits-1)/4 + dayOfYear

	// 1901-2000年需要加15
	if year >= 1901 && year <= 2000 {
		ganzhiTotal += 15
	}

	// 計算干支序數（餘數）
	ganzhiIndex := ganzhiTotal % 60

	// 餘數為0時對應60（癸亥）
	if ganzhiIndex == 0 {
		ganzhiIndex = 60
	}

	// 從甲子順序表中查找對應的干支
	return ganzhiTable[ganzhiIndex-1]
}

// getDayOfYear calculates the day number in the year (1-365/366)
func getDayOfYear(year, month, day int) int {
	dayCount := 0

	// 累加前面月份的天數
	for m := 1; m < month; m++ {
		dayCount += getDaysInMonth(year, m)
	}

	// 加上當月的天數
	dayCount += day

	return dayCount
}

// calculateHourGanzhi calculates the ganzhi for the hour
func calculateHourGanzhi(hour int, dayTianGan string) string {
	// 時支根據時間確定
	diZhiIndex, exists := hourToDiZhi[hour]
	if !exists {
		// 默認處理
		diZhiIndex = hour / 2
		if hour == 23 {
			diZhiIndex = 0
		}
	}

	// 時干根據日干推算
	// 甲己日：甲子開始
	// 乙庚日：丙子開始
	// 丙辛日：戊子開始
	// 丁壬日：庚子開始
	// 戊癸日：壬子開始

	dayTianGanIndex := 0
	for i, tg := range tianGan {
		if tg == dayTianGan {
			dayTianGanIndex = i
			break
		}
	}

	hourTianGanStart := []int{0, 2, 4, 6, 8} // 對應甲己、乙庚、丙辛、丁壬、戊癸
	startIndex := hourTianGanStart[dayTianGanIndex/2]

	hourTianGanIndex := (startIndex + diZhiIndex) % 10

	return tianGan[hourTianGanIndex] + diZhi[diZhiIndex]
}

// GetGanzhiInfo returns detailed information about ganzhi
func GetGanzhiInfo(ganzhi string) map[string]interface{} {
	if len(ganzhi) < 2 {
		return nil
	}

	tianGanChar := ganzhi[:1]
	diZhiChar := ganzhi[1:]

	// Find indices
	tianGanIndex := -1
	diZhiIndex := -1

	for i, tg := range tianGan {
		if tg == tianGanChar {
			tianGanIndex = i
			break
		}
	}

	for i, dz := range diZhi {
		if dz == diZhiChar {
			diZhiIndex = i
			break
		}
	}

	if tianGanIndex == -1 || diZhiIndex == -1 {
		return nil
	}

	// 五行屬性
	tianGanWuXing := []string{"木", "木", "火", "火", "土", "土", "金", "金", "水", "水"}
	diZhiWuXing := []string{"水", "土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水"}

	// 陰陽屬性
	tianGanYinYang := []string{"陽", "陰", "陽", "陰", "陽", "陰", "陽", "陰", "陽", "陰"}
	diZhiYinYang := []string{"陽", "陰", "陽", "陰", "陽", "陰", "陽", "陰", "陽", "陰", "陽", "陰"}

	return map[string]interface{}{
		"ganzhi":          ganzhi,
		"tiangan":         tianGanChar,
		"dizhi":           diZhiChar,
		"tiangan_wuxing":  tianGanWuXing[tianGanIndex],
		"dizhi_wuxing":    diZhiWuXing[diZhiIndex],
		"tiangan_yinyang": tianGanYinYang[tianGanIndex],
		"dizhi_yinyang":   diZhiYinYang[diZhiIndex],
		"tiangan_index":   tianGanIndex,
		"dizhi_index":     diZhiIndex,
	}
}

// VerifyDayGanzhi 驗證日柱計算是否正確（用於測試）
func VerifyDayGanzhi(year, month, day int, expectedGanzhi string) bool {
	calculated := calculateDayGanzhi(year, month, day)
	return calculated == expectedGanzhi
}
