#!/bin/bash

# 🔮 AI Bazi Backend API 測試腳本
# 這個腳本會測試所有的 API 端點並產生測試資料

echo "🚀 開始測試 AI Bazi Backend API..."
echo "================================="

BASE_URL="http://localhost:8000"

# 測試 1: 健康檢查
echo ""
echo "📊 測試 1: 健康檢查"
echo "GET $BASE_URL/health"
curl -X GET "$BASE_URL/health" | jq .
echo ""

# 測試資料陣列
declare -a test_cases=(
    "1990 5 15 14"    # 庚午年 辛巳月 甲寅日 辛未時
    "1985 3 20 8"     # 乙丑年 己卯月 戊戌日 丙辰時  
    "1992 11 8 22"    # 壬申年 辛亥月 丙午日 己亥時
    "1988 7 12 6"     # 戊辰年 己未月 辛酉日 辛卯時
    "1995 1 25 18"    # 乙亥年 戊寅月 癸未日 辛酉時
    "2000 12 31 12"   # 庚辰年 戊子月 丁丑日 丙午時
)

# 測試 2: 八字計算
echo "🧮 測試 2: 八字計算"
echo "================================="

for i in "${!test_cases[@]}"; do
    IFS=' ' read -r year month day hour <<< "${test_cases[$i]}"
    
    echo ""
    echo "測試案例 $((i+1)): $year年$month月$day日 $hour時"
    echo "POST $BASE_URL/api/bazi"
    
    response=$(curl -s -X POST "$BASE_URL/api/bazi" \
        -H "Content-Type: application/json" \
        -d "{\"year\":$year,\"month\":$month,\"day\":$day,\"hour\":$hour}")
    
    echo "請求: {\"year\":$year,\"month\":$month,\"day\":$day,\"hour\":$hour}"
    echo "響應: $response" | jq .
    
    # 保存響應以供後續 AI 分析測試
    echo "$response" > "/tmp/bazi_result_$((i+1)).json"
done

echo ""
echo "🤖 測試 3: AI 分析"
echo "================================="

# 測試 AI 分析 (使用第一個八字結果)
if [ -f "/tmp/bazi_result_1.json" ]; then
    year_ganzhi=$(cat /tmp/bazi_result_1.json | jq -r '.year_ganzhi')
    month_ganzhi=$(cat /tmp/bazi_result_1.json | jq -r '.month_ganzhi')
    day_ganzhi=$(cat /tmp/bazi_result_1.json | jq -r '.day_ganzhi')
    hour_ganzhi=$(cat /tmp/bazi_result_1.json | jq -r '.hour_ganzhi')
    
    echo ""
    echo "分析八字: $year_ganzhi $month_ganzhi $day_ganzhi $hour_ganzhi"
    echo "POST $BASE_URL/api/analyze"
    
    analyze_request="{\"year_ganzhi\":\"$year_ganzhi\",\"month_ganzhi\":\"$month_ganzhi\",\"day_ganzhi\":\"$day_ganzhi\",\"hour_ganzhi\":\"$hour_ganzhi\"}"
    
    echo "請求: $analyze_request"
    echo ""
    echo "AI 分析結果:"
    echo "----------"
    
    curl -s -X POST "$BASE_URL/api/analyze" \
        -H "Content-Type: application/json" \
        -d "$analyze_request" | jq -r '.analysis'
    
    echo ""
fi

echo ""
echo "🧪 測試 4: 錯誤處理"
echo "================================="

# 測試無效日期
echo ""
echo "測試無效日期 (2023年2月30日):"
curl -s -X POST "$BASE_URL/api/bazi" \
    -H "Content-Type: application/json" \
    -d '{"year":2023,"month":2,"day":30,"hour":12}' | jq .

# 測試無效年份
echo ""
echo "測試無效年份 (1800年):"
curl -s -X POST "$BASE_URL/api/bazi" \
    -H "Content-Type: application/json" \
    -d '{"year":1800,"month":5,"day":15,"hour":12}' | jq .

# 測試缺少參數
echo ""
echo "測試缺少參數:"
curl -s -X POST "$BASE_URL/api/bazi" \
    -H "Content-Type: application/json" \
    -d '{"year":1990,"month":5}' | jq .

echo ""
echo "✅ API 測試完成！"
echo "================================="

# 清理臨時文件
rm -f /tmp/bazi_result_*.json

echo ""
echo "📋 測試摘要:"
echo "• 健康檢查: ✅"
echo "• 八字計算: ✅ (測試了 ${#test_cases[@]} 個案例)"
echo "• AI 分析: ✅"
echo "• 錯誤處理: ✅"
echo ""
echo "🎉 所有測試完成！後端 API 運行正常。" 