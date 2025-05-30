# AI 八字算命 (AI Bazi Fortune Telling)

A modern, interactive web application that combines traditional Chinese Bazi (八字) fortune telling with artificial intelligence technology to provide users with accurate and insightful personality and life analysis.

![AI Bazi Demo](https://via.placeholder.com/800x400/1e293b/ffffff?text=AI+Bazi+Fortune+Telling)

## ✨ Features

- 🔮 **Accurate Bazi Calculation**: Traditional four-pillar calculation using the Ganzhi system
- 🤖 **AI-Powered Analysis**: Deep personality and life analysis using artificial intelligence
- 🎨 **Cyber Aesthetic Design**: Modern dark theme with neon gradients and smooth animations
- 📱 **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- ⚡ **Real-time Processing**: Instant calculations and analysis results
- 🌟 **Smooth Animations**: Engaging micro-interactions powered by Framer Motion

## 🚀 Tech Stack

- **Next.js 15.3.3** - React framework with App Router
- **React 19** - UI library for building components
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth UI interactions
- **Inter Font** - Modern typography

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd aiBazi/frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Edit the `.env.local` file and configure your API endpoint:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Development Configuration
NODE_ENV=development
```

### 4. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🏗️ Project Structure

```
frontend/
├── docs/                           # Documentation files
│   ├── DirectoryStructure.md      # Project structure documentation
│   ├── ProjectGoals.md            # Project objectives and purpose
│   ├── TASK.md                    # Task tracking and progress
│   └── CHANGELOG.md               # Project modification history
├── public/                        # Static assets
├── src/                          # Source code
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx            # Root layout component
│   │   ├── page.tsx              # Main homepage component
│   │   ├── globals.css           # Global styles and Tailwind setup
│   │   └── favicon.ico           # Favicon
│   ├── components/               # Reusable React components
│   │   ├── BaziForm.tsx         # Bazi input form component
│   │   ├── BaziResult.tsx       # Bazi chart display component
│   │   └── AnalysisModal.tsx    # AI analysis modal component
│   └── types/                   # TypeScript type definitions
│       └── bazi.ts              # Bazi-related interfaces
├── package.json                 # Package configuration and dependencies
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── env.example                 # Environment variables example
```

## 🎯 Usage

### Basic Workflow

1. **Input Birth Information**: Enter your birth year, month, day, and hour in the form
2. **Calculate Bazi**: Click the "計算八字" button to generate your four-pillar chart
3. **View Results**: Explore your personalized Bazi chart with beautiful animations
4. **Get AI Analysis**: Click "獲取 AI 深度分析" for detailed personality insights
5. **Review Analysis**: Read the comprehensive AI-generated analysis in the modal

### Form Validation

The application includes comprehensive input validation:

- **Year**: Must be between 1900 and 2100
- **Month**: Must be between 1 and 12
- **Day**: Must be between 1 and 31
- **Hour**: Must be between 0 and 23

## 🎨 Design Features

### Visual Theme
- **Dark Background**: Elegant dark theme with subtle gradient overlays
- **Neon Accents**: Cyber-blue, purple, and orange highlights
- **Glassmorphism**: Backdrop blur effects for modern aesthetics
- **Smooth Animations**: GPU-accelerated animations throughout

### User Experience
- **Progressive Disclosure**: Information revealed step by step
- **Visual Hierarchy**: Clear typography and spacing
- **Keyboard Navigation**: Full keyboard accessibility support
- **Responsive Feedback**: Immediate visual feedback for all interactions

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npx tsc --noEmit
```

## 🌐 API Integration

The application expects a backend API with the following endpoints:

### Bazi Calculation
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

**Response:**
```json
{
  "year_ganzhi": "庚午",
  "month_ganzhi": "辛巳",
  "day_ganzhi": "丙寅",
  "hour_ganzhi": "乙未"
}
```

### AI Analysis
```http
POST /api/analyze
Content-Type: application/json

{
  "year_ganzhi": "庚午",
  "month_ganzhi": "辛巳",
  "day_ganzhi": "丙寅",
  "hour_ganzhi": "乙未"
}
```

**Response:**
```json
{
  "analysis": "Based on your Bazi chart..."
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Configure environment variables in the Vercel dashboard.

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- **Netlify**: Add build command `npm run build` and publish directory `out`
- **Railway**: Connect your GitHub repository
- **Heroku**: Use the Node.js buildpack

## 🧪 Testing

### Running Tests
```bash
# Run unit tests (when implemented)
npm test

# Run integration tests (when implemented)
npm run test:integration

# Run e2e tests (when implemented)
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use TypeScript for all new components
- Follow the existing component structure
- Use Tailwind CSS for styling
- Add Framer Motion animations for interactions
- Update documentation when adding new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Traditional Chinese metaphysics and Bazi calculation methods
- Modern web development community for tools and inspiration
- AI technology providers for analysis capabilities

## 📞 Support

For support, please:
1. Check the [documentation](./docs/)
2. Search existing [issues](../../issues)
3. Create a new issue with detailed information

---

**Built with ❤️ and modern web technologies**
