# 🔮 AI Bazi Backend

一個使用 Go 語言開發的 AI 八字算命後端服務，結合傳統中國命理學與現代 AI 技術。

## ✨ 功能特色

- 🧮 **精確八字計算**：基於傳統干支曆法的準確計算
- 🤖 **AI 智能分析**：整合 OpenAI GPT-4 進行深度命理解讀
- 🚀 **高性能 API**：使用 Gin 框架構建的 RESTful API
- 🔒 **安全可靠**：完整的輸入驗證和錯誤處理
- 🌐 **跨域支持**：配置完善的 CORS 策略

## 🏗️ 項目結構

```
bazi-backend/
├── cmd/
│   └── server/
│       └── main.go        # 應用程式入口點
├── internal/
│   ├── bazi/
│   │   └── bazi.go        # 八字計算核心邏輯
│   └── ai/
│       └── ai.go          # AI 分析服務
├── go.mod                 # Go 模組定義
├── go.sum                 # 依賴版本鎖定
├── env.example            # 環境變數範例
└── README.md              # 項目說明文檔
```

## 🚀 快速開始

### 前置需求

- Go 1.21 或更高版本
- OpenAI API Key（可選，用於 AI 分析功能）

### 安裝步驟

1. **複製項目**
   ```bash
   git clone <repository-url>
   cd bazi-backend
   ```

2. **安裝依賴**
   ```bash
   go mod tidy
   ```

3. **配置環境變數**
   ```bash
   cp env.example .env
   # 編輯 .env 文件，添加您的 OpenAI API Key
   ```

4. **運行服務**
   ```bash
   go run cmd/server/main.go
   ```

   服務將在 `http://localhost:8000` 啟動

## 📡 API 接口

### 健康檢查

```http
GET /health
```

**響應範例:**
```json
{
  "status": "ok",
  "message": "AI Bazi Backend is running",
  "version": "1.0.0"
}
```

### 八字計算

```http
POST /api/bazi
Content-Type: application/json

{
  "year": 1990,
  "month": 5,
  "day": 15,
  "hour": 14
}
```

**響應範例:**
```json
{
  "year_ganzhi": "庚午",
  "month_ganzhi": "辛巳",
  "day_ganzhi": "甲寅",
  "hour_ganzhi": "辛未"
}
```

### AI 分析

```http
POST /api/analyze
Content-Type: application/json

{
  "year_ganzhi": "庚午",
  "month_ganzhi": "辛巳",
  "day_ganzhi": "甲寅",
  "hour_ganzhi": "辛未"
}
```

**響應範例:**
```json
{
  "analysis": "🔮 AI 八字命理分析報告\n\n📊 **您的八字命盤**\n年柱：庚午 ｜ 月柱：辛巳 ｜ 日柱：甲寅 ｜ 時柱：辛未\n\n..."
}
```

## 🔧 環境變數配置

| 變數名 | 說明 | 預設值 | 必需 |
|--------|------|--------|------|
| `PORT` | 服務端口 | `8000` | ❌ |
| `GIN_MODE` | Gin 運行模式 | `debug` | ❌ |
| `OPENAI_API_KEY` | OpenAI API 密鑰 | - | ⚠️ 分析功能需要 |
| `ALLOWED_ORIGINS` | 允許的跨域來源 | `http://localhost:3000` | ❌ |

## 🧮 八字計算原理

本服務採用傳統的干支曆法進行八字計算：

- **年柱**：根據農曆年份計算天干地支
- **月柱**：基於節氣和年干推算月干支
- **日柱**：使用萬年曆算法計算日干支
- **時柱**：根據時辰和日干推算時干支

## 🤖 AI 分析功能

AI 分析模組使用 OpenAI GPT-4 提供：

- 五行分析
- 格局判斷  
- 性格特質解讀
- 事業財運預測
- 感情婚姻分析
- 健康養生建議
- 人生指導建議

### 開發模式

如果未設置 OpenAI API Key，系統將使用模擬數據進行演示。

## 🔒 安全特性

- **輸入驗證**：嚴格的參數範圍檢查
- **錯誤處理**：完善的錯誤響應機制
- **CORS 保護**：可配置的跨域請求策略
- **日期驗證**：防止無效日期輸入

## 📈 性能優化

- 輕量級 Gin 框架
- 高效的干支計算算法
- 合理的 API 響應結構
- 可選的 AI 分析緩存（待實現）

## 🧪 測試示例

```bash
# 健康檢查
curl -X GET http://localhost:8000/health

# 八字計算
curl -X POST http://localhost:8000/api/bazi \
  -H "Content-Type: application/json" \
  -d '{"year":1990,"month":5,"day":15,"hour":14}'

# AI 分析
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"year_ganzhi":"庚午","month_ganzhi":"辛巳","day_ganzhi":"甲寅","hour_ganzhi":"辛未"}'
```

## 🤝 貢獻指南

1. Fork 項目
2. 創建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📄 許可證

本項目採用 MIT 許可證 - 詳見 [LICENSE](LICENSE) 文件。

## 🙏 致謝

- 感謝傳統中國命理學的智慧傳承
- 感謝 OpenAI 提供的強大 AI 技術
- 感謝 Go 社區的優秀開源框架

## 📞 聯絡方式

如有問題或建議，請通過以下方式聯絡：

- 提交 GitHub Issue
- 發送電子郵件到：[your-email@example.com]

---

**⚠️ 免責聲明**

本應用僅供娛樂和參考，不構成專業建議。命運掌握在自己手中，請理性對待算命結果。 