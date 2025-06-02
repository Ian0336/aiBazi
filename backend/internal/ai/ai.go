package ai

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"google.golang.org/genai"
)

// Analyzer handles AI-powered bazi analysis
type Analyzer struct {
	client     *genai.Client
	model      string
	maxRetries int
}

// NewAnalyzer creates a new AI analyzer instance
func NewAnalyzer() *Analyzer {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		// For development/testing, return a mock analyzer
		return &Analyzer{client: nil}
	}

	// Get model configuration from environment
	model := os.Getenv("GEMINI_MODEL")
	if model == "" {
		model = "gemini-1.5-flash" // Default to more economical model
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		// If client creation fails, return mock analyzer
		return &Analyzer{client: nil}
	}

	return &Analyzer{
		client:     client,
		model:      model,
		maxRetries: 2,
	}
}

// isQuotaExceeded checks if the error is due to quota/rate limit exceeded
func (a *Analyzer) isQuotaExceeded(err error) bool {
	if err == nil {
		return false
	}
	errStr := strings.ToLower(err.Error())
	return strings.Contains(errStr, "quota") ||
		strings.Contains(errStr, "rate limit") ||
		strings.Contains(errStr, "resource_exhausted") ||
		strings.Contains(errStr, "error 429")
}

// callWithRetry calls the Gemini API with retry logic for quota errors
func (a *Analyzer) callWithRetry(ctx context.Context, model string, contents []*genai.Content, config *genai.GenerateContentConfig, maxRetries int) (string, error) {
	var lastErr error

	for attempt := 0; attempt <= maxRetries; attempt++ {
		if attempt > 0 {
			// Wait before retry (exponential backoff)
			waitTime := time.Duration(attempt*attempt) * time.Second
			fmt.Printf("API quota exceeded, retrying in %v... (attempt %d/%d)\n", waitTime, attempt, maxRetries)
			time.Sleep(waitTime)
		}

		resp, err := a.client.Models.GenerateContent(ctx, model, contents, config)
		if err != nil {
			lastErr = err
			if a.isQuotaExceeded(err) && attempt < maxRetries {
				continue // Retry for quota errors
			}
			return "", fmt.Errorf("Gemini API error: %w", err)
		}

		// Success
		analysis := resp.Text()
		return a.formatAnalysis(analysis), nil
	}

	// If we get here, all retries failed
	return "", fmt.Errorf("Gemini API error after %d retries: %w", maxRetries, lastErr)
}

// AnalyzeBazi performs AI analysis of a bazi chart
func (a *Analyzer) AnalyzeBazi(yearGanzhi, monthGanzhi, dayGanzhi, hourGanzhi string) (string, error) {
	// If no Gemini client (development mode), return mock analysis
	if a.client == nil {
		return a.generateMockAnalysis(yearGanzhi, monthGanzhi, dayGanzhi, hourGanzhi), nil
	}

	// Create the system instruction and user prompt
	systemInstruction := a.getSystemPrompt()
	userPrompt := a.createBaziPrompt(yearGanzhi, monthGanzhi, dayGanzhi, hourGanzhi)

	// Combine system instruction with user prompt
	combinedPrompt := systemInstruction + "\n\n" + userPrompt

	// Create content without system role
	contents := []*genai.Content{
		{
			Parts: []*genai.Part{
				{Text: combinedPrompt},
			},
			Role: "user",
		},
	}

	// Generate content config
	temperature := float32(0.7)
	config := &genai.GenerateContentConfig{
		Temperature:     &temperature,
		MaxOutputTokens: 2000,
	}

	ctx := context.Background()

	// Call Gemini API with retry logic
	analysis, err := a.callWithRetry(ctx, a.model, contents, config, a.maxRetries)
	if err != nil {
		// If API still fails, fall back to mock analysis with warning
		if a.isQuotaExceeded(err) {
			fmt.Println("⚠️  API quota exceeded, using mock analysis")
			return a.generateMockAnalysis(yearGanzhi, monthGanzhi, dayGanzhi, hourGanzhi), nil
		}
		return "", err
	}

	return analysis, nil
}

// getSystemPrompt returns the system prompt for the AI
func (a *Analyzer) getSystemPrompt() string {
	return `你是一位專業的八字命理大師，擁有深厚的中國傳統命理學知識。請根據提供的八字（四柱干支），進行詳細的命理分析。

分析要求：
1. 使用繁體中文回答
2. 分析內容要專業、準確，基於傳統八字理論
3. 包含五行分析、用神喜忌、性格特徵、事業財運、感情健康等方面
4. 語調要溫和、正面，避免過於負面的預測
5. 結構清晰，分段明確
6. 字數控制在 800-1200 字之間
7. 請以markdown格式回答
請記住，這是為了幫助用戶更好地了解自己，提供正面的人生指導。`
}

// createBaziPrompt creates the specific prompt for the bazi chart
func (a *Analyzer) createBaziPrompt(yearGanzhi, monthGanzhi, dayGanzhi, hourGanzhi string) string {
	return fmt.Sprintf(`請為以下八字進行詳細分析：

年柱：%s
月柱：%s  
日柱：%s
時柱：%s

請從以下幾個方面進行分析：

1. **五行分析**：分析四柱五行的強弱、缺失與平衡狀況

2. **格局分析**：判斷命格類型，分析格局高低

3. **用神喜忌**：確定用神與忌神，提供調候建議

4. **性格特質**：根據日主和五行配置分析性格特點

5. **事業財運**：分析適合的職業方向和財運趨勢

6. **感情婚姻**：分析感情運勢和婚姻狀況

7. **健康養生**：根據五行偏頗提供健康建議

8. **人生建議**：給出積極正面的人生指導

請用溫和、專業的語調進行分析，重點突出正面指導意義。`,
		yearGanzhi, monthGanzhi, dayGanzhi, hourGanzhi)
}

// formatAnalysis formats the AI analysis response
func (a *Analyzer) formatAnalysis(analysis string) string {
	// Clean up the response
	analysis = strings.TrimSpace(analysis)

	// Ensure proper formatting
	lines := strings.Split(analysis, "\n")
	var formattedLines []string

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line != "" {
			formattedLines = append(formattedLines, line)
		}
	}

	return strings.Join(formattedLines, "\n\n")
}

// generateMockAnalysis generates a mock analysis for development/testing
func (a *Analyzer) generateMockAnalysis(yearGanzhi, monthGanzhi, dayGanzhi, hourGanzhi string) string {
	return fmt.Sprintf(`🔮 AI 八字命理分析報告

📊 **您的八字命盤**
年柱：%s ｜ 月柱：%s ｜ 日柱：%s ｜ 時柱：%s

🌟 **五行分析**
根據您的八字配置，五行呈現出獨特的平衡狀態。日主根基穩固，顯示您擁有堅定的意志力和不屈不撓的精神。五行流通有情，預示著人生運勢將會穩步上升。

💎 **性格特質**
您天生具有領導才能，做事有條不紊，擅長分析問題並提出創新解決方案。性格中兼具理性與感性，既能冷靜思考，又能體察他人情感，是天生的協調者。

🚀 **事業財運**
事業方面，您適合從事需要創新思維和人際溝通的工作，如管理、教育、諮詢或科技行業。財運呈現穩定增長趨勢，通過自身努力和人脈積累，將能獲得不錯的物質回報。

💕 **感情婚姻**
感情運勢總體順利，您具有很強的親和力和責任感，容易獲得他人好感。在選擇伴侶時，建議尋找性格互補、志趣相投的對象，共同成長將使感情更加穩固。

🌿 **健康養生**
身體素質良好，但需注意工作壓力對精神狀態的影響。建議保持規律作息，適度運動，注重心理健康的調節。飲食上應注意營養均衡，避免過度勞累。

🎯 **人生建議**
1. **發揮優勢**：充分利用您的溝通能力和創新思維，在職場中展現領導魅力
2. **補強不足**：加強耐心和持久力的培養，避免因急躁而錯失良機  
3. **把握時機**：未來3-5年是發展的黃金期，適合做重大決策和投資
4. **人際關係**：維護好既有人脈，同時積極拓展新的社交圈子
5. **終身學習**：保持對新知識的渴望，持續提升個人能力

✨ **智慧小語**
"命由天定，運在人為。"您的八字顯示了良好的基礎條件，配合後天的努力和正確的人生態度，必能創造出精彩的人生篇章。

*本分析基於傳統八字理論結合現代AI技術，僅供參考。人生道路需要您自己去走，命運掌握在自己手中。*`,
		yearGanzhi, monthGanzhi, dayGanzhi, hourGanzhi)
}

// AnalyzeCompatibility analyzes compatibility between two bazi charts
func (a *Analyzer) AnalyzeCompatibility(chart1, chart2 map[string]string) (string, error) {
	if a.client == nil {
		return a.generateMockCompatibility(chart1, chart2), nil
	}

	prompt := fmt.Sprintf(`請分析以下兩個八字的合婚配對：

**八字甲**
年柱：%s ｜ 月柱：%s ｜ 日柱：%s ｜ 時柱：%s

**八字乙** 
年柱：%s ｜ 月柱：%s ｜ 日柱：%s ｜ 時柱：%s

請從五行互補、性格匹配、運勢相合等方面進行合婚分析。`,
		chart1["year"], chart1["month"], chart1["day"], chart1["hour"],
		chart2["year"], chart2["month"], chart2["day"], chart2["hour"])

	// Combine system instruction with user prompt
	systemInstruction := "你是八字合婚專家，請進行專業的合婚分析。"
	combinedPrompt := systemInstruction + "\n\n" + prompt

	// Create content without system role
	contents := []*genai.Content{
		{
			Parts: []*genai.Part{
				{Text: combinedPrompt},
			},
			Role: "user",
		},
	}

	// Generate content config
	temperature := float32(0.7)
	config := &genai.GenerateContentConfig{
		Temperature:     &temperature,
		MaxOutputTokens: 1500,
	}

	ctx := context.Background()

	// Call Gemini API with retry logic
	analysis, err := a.callWithRetry(ctx, a.model, contents, config, a.maxRetries)
	if err != nil {
		// If API still fails, fall back to mock analysis with warning
		if a.isQuotaExceeded(err) {
			fmt.Println("⚠️  API quota exceeded, using mock compatibility analysis")
			return a.generateMockCompatibility(chart1, chart2), nil
		}
		return "", err
	}

	return analysis, nil
}

// generateMockCompatibility generates mock compatibility analysis
func (a *Analyzer) generateMockCompatibility(chart1, chart2 map[string]string) string {
	return `💕 **八字合婚分析報告**

🔍 **綜合配對指數：85/100** ⭐⭐⭐⭐⭐

📊 **五行互補分析**
兩人的五行配置呈現良好的互補關係，能夠相互滋養、相互成就。這種五行搭配有利於夫妻感情的穩定發展。

🎭 **性格匹配度**
• **相同點**：都擁有積極向上的人生態度，價值觀相近
• **互補點**：一方理性穩重，一方感性活潑，形成很好的平衡
• **建議**：在溝通中要互相理解，發揮各自優勢

💰 **財運合局**
兩人結合後財運有明顯提升趨勢，適合共同創業或投資理財。建議在財務規劃上多溝通，發揮協同效應。

👶 **子女運勢**
子女宮配置良好，將來的孩子聰明健康，有望成才。建議在教育方式上保持一致，給孩子營造和諧的成長環境。

🏠 **家庭和諧**
兩人都有很強的家庭責任感，能夠共同為家庭幸福努力。建議多培養共同興趣愛好，增進感情交流。

⚠️ **注意事項**
• 避免在決策時過於固執，多聽取對方意見
• 在壓力大時要相互支持，不要將情緒帶回家
• 保持適度的個人空間，給彼此成長的機會

✨ **美滿建議**
1. 定期進行深度溝通，分享內心想法
2. 共同制定人生目標，攜手前進
3. 保持浪漫，不忘初心
4. 在困難時相互扶持，共渡難關

*祝願二位百年好合，幸福美滿！*`
}
