package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/yuyi/aiBazi-backend/internal/ai"
	"github.com/yuyi/aiBazi-backend/internal/bazi"
	"golang.org/x/time/rate"
)

// BaziRequest represents the input structure for bazi calculation
type BaziRequest struct {
	Year  int `json:"year" binding:"required"`
	Month int `json:"month" binding:"required"`
	Day   int `json:"day" binding:"required"`
	Hour  int `json:"hour" binding:"required"`
}

// BaziResponse represents the output structure for bazi calculation
type BaziResponse struct {
	YearGanzhi  string `json:"year_ganzhi"`
	MonthGanzhi string `json:"month_ganzhi"`
	DayGanzhi   string `json:"day_ganzhi"`
	HourGanzhi  string `json:"hour_ganzhi"`
}

// AnalysisRequest represents the input structure for AI analysis
type AnalysisRequest struct {
	YearGanzhi  string `json:"year_ganzhi" binding:"required"`
	MonthGanzhi string `json:"month_ganzhi" binding:"required"`
	DayGanzhi   string `json:"day_ganzhi" binding:"required"`
	HourGanzhi  string `json:"hour_ganzhi" binding:"required"`
}

// AnalysisResponse represents the output structure for AI analysis
type AnalysisResponse struct {
	Analysis string `json:"analysis"`
}

// ErrorResponse represents error response structure
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}

// RateLimiter manages rate limiting for clients
type RateLimiter struct {
	visitors map[string]*Visitor
	mu       sync.RWMutex
	rate     rate.Limit
	burst    int
}

// Visitor represents a client with its rate limiter
type Visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// NewRateLimiter creates a new rate limiter instance
func NewRateLimiter(requestsPerHour int, burst int) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*Visitor),
		rate:     rate.Limit(float64(requestsPerHour) / 3600.0), // Convert per hour to per second
		burst:    burst,
	}

	// Clean up old visitors every 10 minutes
	go rl.cleanupVisitors()

	return rl
}

// getVisitor retrieves or creates a visitor for the given IP
func (rl *RateLimiter) getVisitor(ip string) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	visitor, exists := rl.visitors[ip]
	if !exists {
		limiter := rate.NewLimiter(rl.rate, rl.burst)
		rl.visitors[ip] = &Visitor{
			limiter:  limiter,
			lastSeen: time.Now(),
		}
		return limiter
	}

	visitor.lastSeen = time.Now()
	return visitor.limiter
}

// cleanupVisitors removes old visitors to prevent memory leaks
func (rl *RateLimiter) cleanupVisitors() {
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()

	for {
		<-ticker.C
		rl.mu.Lock()
		for ip, visitor := range rl.visitors {
			if time.Since(visitor.lastSeen) > 30*time.Minute {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// Middleware returns a Gin middleware for rate limiting
func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get client IP
		clientIP := c.ClientIP()

		// Get or create rate limiter for this IP
		limiter := rl.getVisitor(clientIP)

		// Check if request is allowed
		if !limiter.Allow() {
			// Rate limit exceeded
			c.JSON(http.StatusTooManyRequests, ErrorResponse{
				Error:   "Rate limit exceeded",
				Message: "You have exceeded the hourly rate limit for AI analysis. Please try again next hour.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// parseRateLimit parses the rate limit from environment variable
func parseRateLimit() (int, int) {
	rateLimitStr := os.Getenv("RATE_LIMIT")
	if rateLimitStr == "" {
		rateLimitStr = "5" // Default: 5 requests per hour
	}
	fmt.Println("rateLimitStr", rateLimitStr)

	rateLimit, err := strconv.Atoi(rateLimitStr)
	if err != nil {
		log.Printf("Warning: Invalid RATE_LIMIT value '%s', using default: 5", rateLimitStr)
		rateLimit = 5
	}

	// Set burst to allow some burstiness, but keep it reasonable for hourly limits
	burst := rateLimit
	if burst < 3 {
		burst = 3 // Minimum burst of 3
	}

	return rateLimit, burst
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Parse rate limit configuration
	rateLimit, burst := parseRateLimit()
	rateLimiter := NewRateLimiter(rateLimit, burst)

	// Create Gin router
	router := gin.Default()

	// CORS middleware
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"https://your-frontend-domain.com", // 在 production 時替換為實際域名
	}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "Accept", "Cache-Control", "X-Requested-With"}
	config.AllowCredentials = true

	router.Use(cors.New(config))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "AI Bazi Backend is running",
			"version": "1.0.0",
		})
	})

	// API routes group
	api := router.Group("/api")
	{
		// Bazi calculation endpoint (no rate limiting)
		api.POST("/bazi", calculateBazi)

		// AI analysis endpoint (with rate limiting)
		api.POST("/analyze", rateLimiter.Middleware(), analyzeBazi)
	}

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("🚀 AI Bazi Backend starting on port %s", port)
	log.Printf("🌐 CORS enabled for frontend origins")
	log.Printf("⚡ Rate limiting enabled: %d requests/hour (burst: %d) for /api/analyze", rateLimit, burst)
	log.Printf("🔗 Health check: http://localhost:%s/health", port)
	log.Printf("📊 Bazi API: http://localhost:%s/api/bazi", port)
	log.Printf("🤖 Analysis API: http://localhost:%s/api/analyze", port)

	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// calculateBazi handles bazi calculation requests
func calculateBazi(c *gin.Context) {
	var req BaziRequest

	// Bind JSON request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request format",
			Message: err.Error(),
		})
		return
	}

	// Validate input ranges
	if req.Year < 1900 || req.Year > 2100 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid year",
			Message: "Year must be between 1900 and 2100",
		})
		return
	}

	if req.Month < 1 || req.Month > 12 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid month",
			Message: "Month must be between 1 and 12",
		})
		return
	}

	if req.Day < 1 || req.Day > 31 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid day",
			Message: "Day must be between 1 and 31",
		})
		return
	}

	if req.Hour < 0 || req.Hour > 23 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid hour",
			Message: "Hour must be between 0 and 23",
		})
		return
	}

	// Calculate bazi
	baziResult, err := bazi.Calculate(req.Year, req.Month, req.Day, req.Hour)
	if err != nil {
		log.Printf("Bazi calculation error: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Calculation failed",
			Message: err.Error(),
		})
		return
	}

	// Create serializable struct with exported fields using SiZhu API
	// response := BaziResponse{
	// 	YearGanzhi:  baziResult.YearPillar["ganzhi"],
	// 	MonthGanzhi: baziResult.MonthPillar["ganzhi"],
	// 	DayGanzhi:   baziResult.DayPillar["ganzhi"],
	// 	HourGanzhi:  baziResult.HourPillar["ganzhi"],
	// }

	// Log the result
	// fmt.Printf("baziResult: %+v\n", response)
	// log.Printf("Bazi calculated for %d-%d-%d %d:00", req.Year, req.Month, req.Day, req.Hour)

	// Return the response as JSON
	c.JSON(http.StatusOK, baziResult)
}

// analyzeBazi handles AI analysis requests
func analyzeBazi(c *gin.Context) {
	var req AnalysisRequest

	// Bind JSON request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request format",
			Message: err.Error(),
		})
		return
	}

	// Validate ganzhi format (basic validation)
	if len(req.YearGanzhi) == 0 || len(req.MonthGanzhi) == 0 ||
		len(req.DayGanzhi) == 0 || len(req.HourGanzhi) == 0 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid ganzhi data",
			Message: "All ganzhi fields must be provided",
		})
		return
	}

	// Create AI analyzer
	analyzer := ai.NewAnalyzer()

	// Get analysis
	analysis, err := analyzer.AnalyzeBazi(req.YearGanzhi, req.MonthGanzhi, req.DayGanzhi, req.HourGanzhi)
	if err != nil {
		log.Printf("AI analysis error: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Analysis failed",
			Message: err.Error(),
		})
		return
	}

	// Return response
	response := AnalysisResponse{
		Analysis: analysis,
	}

	log.Printf("AI analysis completed for bazi: %s %s %s %s", req.YearGanzhi, req.MonthGanzhi, req.DayGanzhi, req.HourGanzhi)
	c.JSON(http.StatusOK, response)
}
