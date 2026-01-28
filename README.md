<div align="center">


# 🏋️ GYMBUD AI

**Achieve Your Fitness Goals with AI-Powered Guidance**


An intelligent fitness companion that leverages cutting-edge AI technology to help you track nutrition, perfect your exercise form, and create personalized workout plans.

[Live Demo](https://gymbudai.online) · [Report Bug](https://github.com/ighmaZ/GymBudAI/issues) · [Request Feature](https://github.com/ighmaZ/GymBudAI/issues)

</div>

---

## Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Routes](#-api-routes)
- [Contributing](#-contributing)
- [License](#-license)

---

## About

GYMBUD AI is a comprehensive fitness platform that combines multiple AI services to provide:

- **Intelligent Nutrition Tracking**: Snap a photo of your meal and get instant calorie and macronutrient analysis
- **Real-time Form Correction**: Upload exercise videos and receive AI-powered feedback on your technique
- **Personalized Workout Planning**: Generate custom workout routines based on your fitness goals, schedule, and preferences

Built with modern web technologies and integrated with industry-leading AI models, GYMBUD AI delivers a seamless and responsive user experience across all devices.

---

##  Features

###  Calorie Tracking

- **AI-Powered Food Recognition**: Upload meal photos and instantly identify foods using OpenAI's Vision API
- **Comprehensive Nutritional Analysis**: Get detailed breakdowns of calories, protein, carbs, and fat
- **Daily Progress Tracking**: Visual progress ring showing daily calorie goals
- **Meal History**: Log and review your meals over time
- **Macronutrient Dashboard**: Track protein, carbs, and fat intake throughout the day

###  Form Correction

- **Video Analysis**: Upload videos of your exercises for AI-powered form evaluation
- **Real-time Feedback**: Get instant analysis using Google Gemini AI and MediaPipe
- **Form Scoring**: Receive numerical scores on exercise technique
- **Corrective Suggestions**: Get specific tips to improve your form
- **Multi-Exercise Support**: Works with various exercises including squats, deadlifts, bench press, and more

###  Workout Planner

- **AI-Generated Routines**: Create personalized workout plans based on your goals
- **Customizable Parameters**: Input age, weight, height, fitness goals, and workout frequency
- **Manual Entry**: Manually create and edit workout routines
- **Save & Track**: Save your workouts and track your progress over time
- **Weekly Planning**: Organize workouts by days for optimal scheduling


##  Tech Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom components with Framer Motion animations
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form

### Backend

- **API**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: Better-auth

### AI & ML Services

- **Computer Vision**: Google Gemini AI
- **Food Recognition**: Google Gemini AI



## 📦 Getting Started

### Prerequisites

- Node.js 20.x or higher
- Yarn package manager
- PostgreSQL database (Neon recommended)
- Google Gemini API key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/ighmaZ/GymBudAI.git
cd GymBudAI
```

2. **Install dependencies**

```bash
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory and add the required variables.

4. **Set up the database**

```bash
# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

5. **Run the development server**

```bash
yarn dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Building for Production

```bash
# Build the application
yarn build

# Start the production server
yarn start
```

---

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Authentication
BETTER_AUTH_SECRET="your-random-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# AI Services
GEMINI_API_KEY="your-gemini-api-key"


# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```




---

## 📁 Project Structure

```
gymbudai/
├── app/                          # Next.js app directory
│   ├── calories/                 # Calorie tracking page
│   ├── form-correction/          # Form correction page
│   ├── workout-planner/          # Workout planner page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── calories/                # Calorie-related components
│   ├── form-correction/         # Form correction components
│   ├── workout-planner/         # Workout planner components
│   └── ui/                      # Shared UI components
├── lib/                          # Utility libraries
│   ├── auth.ts                  # Authentication utilities
│   ├── prisma.ts                # Prisma client
│   ├── openai.ts                # OpenAI integration
│   ├── gemini-*.ts              # Gemini AI integrations
│   └── utils.ts                 # General utilities
├── prisma/                       # Database schema
│   └── schema.prisma            # Prisma schema
├── stores/                       # Zustand stores
├── types/                        # TypeScript type definitions
├── constants/                    # App constants
├── public/                       # Static assets
└── [config files]               # Next.js, TypeScript, Tailwind configs
```

---

## 🛡️ API Routes

The application includes several API endpoints:

### Authentication

- `POST /api/auth/*` - Authentication endpoints (handled by Better-auth)

### Calorie Tracking

- `GET /api/meals` - Fetch user meals
- `POST /api/meals` - Create a new meal
- `POST /api/analyze-food` - Analyze food image using AI

### Form Correction

- `POST /api/analyze-form` - Analyze exercise video using AI

### Workout Planner

- `GET /api/workouts` - Fetch user workouts
- `POST /api/workouts` - Save a workout
- `POST /api/generate-workout` - Generate AI workout plan

---




---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Google](https://ai.google.dev/) for Gemini AI
- [Vercel](https://vercel.com/) for hosting platform


---

<div align="center">

**Built with ❤️ using Next.js & AI**

[⬆ Back to Top](#-gymbud-ai)

</div>
