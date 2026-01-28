<div align="center">


# 🏋️ GYMBUD AI

**From Struggle to Strength: My Personal Fitness AI**


I built GymBud AI because I personally struggled with staying consistent in my fitness journey. Counting calories always felt like a chore, and I was never sure if my form was correct during workouts, risking injury. I needed a smarter tool—one that could see what I eat and watch how I move. So, I combined my passion for coding with my fitness goals to create this AI companion.

[Live Demo](https://gymbudai.online) · [Report Bug](https://github.com/ighmaZ/GymBudAI/issues) · [Request Feature](https://github.com/ighmaZ/GymBudAI/issues)

</div>

---

## Table of Contents

- [The Story](#-the-story)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Routes](#-api-routes)
- [Contributing](#-contributing)
- [License](#-license)

---

## The Story

I didn't just build this as a project; I built it as a solution to my own problems. I wanted to stop guessing if I was eating right or lifting correctly.

GymBud AI is the result of that journey—a comprehensive platform that combines multiple AI services to provide the guidance I always wished I had:

- **Intelligent Nutrition Tracking**: Snap a photo of your meal and get instant calorie and macronutrient analysis. No more manual entry.
- **Real-time Form Correction**: Upload exercise videos and receive AI-powered feedback on your technique. It's like having a trainer in your pocket.
- **Personalized Workout Planning**: Generate custom workout routines based on your fitness goals, schedule, and preferences.

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

### Validation & Testing

- **Validation**: Zod
- **Testing**: Playwright

### Infrastructure

- **Rate Limiting**: Upstash Redis



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
├── .github/                  # GitHub Actions workflows
├── app/                      # Next.js app directory
│   ├── api/                 # API Routes
│   ├── calories/            # Calorie tracking page
│   ├── form-correction/     # Form correction page
│   ├── workout-planner/     # Workout planner page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/               # React components
│   ├── calories/            # Calorie-related components
│   ├── form-correction/     # Form correction components
│   ├── workout-planner/     # Workout planner components
│   └── ui/                  # Shared UI components
├── hooks/                    # Custom React hooks
│   └── use-camera.ts        # Camera logic hook
├── lib/                      # Utility libraries
│   ├── auth.ts              # Authentication utilities
│   ├── prisma.ts            # Prisma client
│   ├── gemini-*.ts          # Gemini AI integrations
│   └── utils.ts             # General utilities
├── prisma/                   # Database schema
├── public/                   # Static assets
├── stores/                   # Zustand stores
├── tests/                    # Playwright E2E tests
├── types/                    # TypeScript type definitions
└── [config files]           # Next.js, TS, Tailwind, Playwright configs
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
