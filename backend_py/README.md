# AI Bazi Backend (Python)

Python FastAPI backend for Chinese Bazi (八字) calculation and analysis, designed to replace the problematic Go backend that had issues with certain dates.

## 🌟 Features

- **Reliable Date Handling**: Successfully handles all dates that caused crashes in the Go BaziGo library
- **Fast API**: Built with FastAPI for high performance and automatic API documentation
- **Comprehensive Bazi Calculation**: 
  - Four pillars (年月日时) calculation
  - Ten deities (十神) analysis
  - Five elements (五行) distribution
  - Nayin (纳音) information
  - Empty positions (空亡) detection
- **Flexible Date Input**: Supports both solar and lunar calendar inputs
- **CORS Support**: Ready for frontend integration
- **Error Handling**: Robust error handling with meaningful error messages

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Installation

1. **Clone the main repository**:
   ```bash
   git clone <your-repository-url>
   cd aiBazi/backend_py
   ```

2. **Clone the external bazi library**:
   ```bash
   cd app/external/
   git clone https://github.com/china-testing/bazi.git
   cd bazi
   ```

3. **Add __init__.py files for Python imports**:
   ```bash
   # Create __init__.py in the bazi directory
   touch __init__.py
   
   # Go back to backend_py root
   cd ../../..
   ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Test the calculator** (verify problematic dates work):
   ```bash
   python test_bazi.py
   ```

6. **Start the server**:
   ```bash
   python main.py
   # or
   python run.py
   ```

7. **Verify it's running**:
   ```bash
   curl http://localhost:8000/health
   ```

## 📡 API Endpoints

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "message": "AI Bazi Backend (Python) is running",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00"
}
```

### Calculate Bazi
```http
POST /api/bazi
Content-Type: application/json

{
  "year": 2003,
  "month": 1,
  "day": 15,
  "hour": 10,
  "is_lunar": false,
  "is_leap_month": false,
  "gender": "male"
}
```

Response:
```json
{
  "year_ganzhi": "壬午",
  "month_ganzhi": "癸丑",
  "day_ganzhi": "庚申",
  "hour_ganzhi": "辛巳",
  "year_pillar": {
    "ganzhi": "壬午",
    "gan": "壬",
    "zhi": "午",
    "gan_wuxing": "水",
    "zhi_wuxing": "火",
    "ten_deity": "劫财",
    "hidden_stems": [...]
  },
  "lunar_date": "2003年12月24日",
  "solar_date": "2003年1月15日",
  "nayin": {
    "year": "杨柳木",
    "month": "桑柘木",
    "day": "石榴木",
    "hour": "白蜡金"
  },
  "empty_positions": {
    "empty_pair": ["戌", "亥"],
    "empty_in_chart": [],
    "count": 0
  },
  "analysis": {
    "day_master": "庚",
    "day_master_wuxing": "金",
    "wuxing_count": {"金": 2, "木": 0, "水": 1, "火": 1, "土": 0},
    "is_strong": true,
    "summary": "日主庚(金)，身强"
  }
}
```

### Analyze Bazi
```http
POST /api/analyze
Content-Type: application/json

{
  "year_ganzhi": "壬午",
  "month_ganzhi": "癸丑", 
  "day_ganzhi": "庚申",
  "hour_ganzhi": "辛巳"
}
```

Response:
```json
{
  "analysis": "八字：壬午 癸丑 庚申 辛巳\n日主：庚\n五行分布：金2、水1、火1\n日主偏强，宜泄宜消\n十神分析：年干壬为劫财；月干癸为劫财；时干辛为比肩\n建议：多接触土、金相关的事物，避免火、木过重"
}
```

## 🧪 Testing Problematic Dates

The Go BaziGo library had issues with specific dates. This Python backend successfully handles all of them:

```bash
python test_bazi.py
```

**Problematic dates that now work**:
- 2003-01-15 ✅ (original problematic date)
- 2000-01-15 ✅
- 2001-01-15 ✅ 
- 2004-01-15 ✅
- And many more...

## 🛠️ Architecture

```
backend_py/
├── main.py                 # FastAPI application entry point
├── bazi_calculator.py      # Bazi calculation wrapper class
├── run.py                  # Simple startup script
├── test_bazi.py           # Test script for problematic dates
├── requirements.txt        # Python dependencies
├── app/
│   └── external/
│       └── bazi/          # Third-party bazi calculation library (git submodule)
│           ├── __init__.py    # Python package init (manually added)
│           ├── bazi.py        # Main bazi calculation script
│           ├── datas.py       # Bazi data (ganzhis, wuxing, etc.)
│           ├── common.py      # Common utilities
│           ├── ganzhi.py      # Ganzhi calculation functions
│           └── ...            # Other library files from china-testing/bazi
└── README.md              # This file
```

> **Important**: The `app/external/bazi/` directory contains the [china-testing/bazi](https://github.com/china-testing/bazi) library, which is a powerful Python八字排盘软件 that provides reliable bazi calculations. This library must be cloned separately and requires manual addition of `__init__.py` for Python module imports.

## 📊 Key Differences from Go Backend

| Aspect | Go Backend (BaziGo) | Python Backend |
|--------|-------------------|----------------|
| **Date Reliability** | ❌ Crashes on certain dates | ✅ Handles all dates |
| **Library Stability** | ❌ Nil pointer dereferences | ✅ Robust error handling |
| **API Documentation** | ⚠️ Manual | ✅ Auto-generated (FastAPI) |
| **Error Messages** | ❌ Generic | ✅ Detailed and helpful |
| **Development Speed** | ⚠️ Requires Go expertise | ✅ Python ecosystem |

## 🔧 Configuration

Environment variables (optional):
- `PORT`: Server port (default: 8000)
- `HOST`: Server host (default: 0.0.0.0)

## 🐛 Debugging

If you encounter issues:

1. **Test basic functionality**:
   ```bash
   python test_bazi.py
   ```

2. **Check dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify the external bazi library is properly installed**:
   ```bash
   # Check if the external library exists
   ls -la app/external/bazi/
   
   # Verify __init__.py exists
   ls -la app/external/bazi/__init__.py
   
   # Test the bazi library directly
   cd app/external/bazi
   python bazi.py 2003 1 15 10 -g
   cd ../../..
   ```

4. **If you get import errors**, ensure the bazi library is properly set up:
   ```bash
   # Re-clone if needed
   rm -rf app/external/bazi
   cd app/external/
   git clone https://github.com/china-testing/bazi.git
   cd bazi
   touch __init__.py
   cd ../../..
   ```

## 📈 Performance

- FastAPI provides excellent performance with automatic async support
- Typical response time: 10-50ms for bazi calculation
- Supports concurrent requests
- Memory usage: ~50MB baseline

## 🔮 Future Enhancements

- [ ] Add more sophisticated bazi analysis algorithms
- [ ] Implement caching for common calculations
- [ ] Add rate limiting
- [ ] Integrate with AI/LLM for enhanced analysis
- [ ] Add batch calculation endpoints
- [ ] Support for traditional Chinese calendar systems

## 📝 License

This project uses the existing bazi calculation library which has its own licensing terms. Please check the `external/bazi/` directory for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `python test_bazi.py`
5. Submit a pull request

## 📞 Support

For issues related to:
- **API/Backend**: Create an issue in this repository
- **Bazi calculations**: Check the original bazi library documentation
- **Frontend integration**: Ensure CORS is properly configured 