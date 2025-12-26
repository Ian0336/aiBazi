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
- pip or uv package manager

### Installation

1. **Clone the main repository**:
   ```bash
   git clone <your-repository-url>
   cd aiBazi/backend
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   # or with uv
   uv sync
   ```

3. **Start the server**:
   ```bash
   python main.py
   # or
   uvicorn app.main:app --reload
   ```

4. **Verify it's running**:
   ```bash
   curl http://localhost:8000/health
   ```

## 🛠️ Project Structure

```
backend/
├── main.py                     # Application entry point
├── requirements.txt            # Python dependencies
├── pyproject.toml              # Project configuration
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app factory
│   ├── core/                   # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py           # Application settings
│   │   └── exceptions.py       # Exception handlers
│   ├── api/                    # API layer
│   │   ├── __init__.py
│   │   ├── deps.py             # Dependencies (calculator instance)
│   │   └── routes/             # API route handlers
│   │       ├── __init__.py     # Router aggregation
│   │       ├── health.py       # Health check endpoint
│   │       └── bazi.py         # Bazi calculation endpoints
│   ├── schemas/                # Pydantic models
│   │   ├── __init__.py
│   │   └── bazi.py             # Request/Response models
│   ├── bazi/                   # Internal Bazi logic
│   │   ├── __init__.py
│   │   ├── bazi_calculator.py  # Calculator wrapper class
│   │   ├── bazi_data.py        # Bazi constants and data
│   │   └── bazi_functions.py   # Calculation functions
│   └── external/               # Third-party libraries
│       └── bazi/               # china-testing/bazi library
└── tests/                      # Test files
    └── test_api_enhanced.py
```

### Key Modules

| Module | Description |
|--------|-------------|
| `app/core/config.py` | Application configuration (CORS, metadata, ports) |
| `app/core/exceptions.py` | Custom exception handlers |
| `app/schemas/bazi.py` | All Pydantic models for API validation |
| `app/api/deps.py` | Dependency injection (calculator singleton) |
| `app/api/routes/bazi.py` | Bazi calculation and analysis endpoints |
| `app/api/routes/health.py` | Health check endpoint |

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

Response includes:
- Four pillars with detailed information
- Ten deities (十神) for each pillar
- Hidden stems in earthly branches
- Nayin (纳音) information
- Empty positions (空亡) analysis
- Current Dayun (大運) and Liunian (流年)

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
  "analysis": "八字分析結果..."
}
```

## 🔧 Configuration

Configuration is managed in `app/core/config.py`:

| Setting | Environment Variable | Default |
|---------|---------------------|---------|
| Server Port | `PORT` | 8000 |
| Server Host | `HOST` | 0.0.0.0 |
| CORS Origins | - | localhost:3000 |

## 📊 Key Differences from Go Backend

| Aspect | Go Backend (BaziGo) | Python Backend |
|--------|-------------------|----------------|
| **Date Reliability** | ❌ Crashes on certain dates | ✅ Handles all dates |
| **Library Stability** | ❌ Nil pointer dereferences | ✅ Robust error handling |
| **API Documentation** | ⚠️ Manual | ✅ Auto-generated (FastAPI) |
| **Code Organization** | ⚠️ Single file | ✅ Modular structure |

## 🧪 Testing

Run the test suite:
```bash
pytest tests/
```

## 📈 Performance

- FastAPI provides excellent performance with automatic async support
- Typical response time: 10-50ms for bazi calculation
- Supports concurrent requests

## 📝 License

This project uses the existing bazi calculation library which has its own licensing terms.
