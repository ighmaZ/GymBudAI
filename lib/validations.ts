import { z } from "zod/v4";

// ==========================================
// Environment Variables Schema
// ==========================================
export const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.url("BETTER_AUTH_URL must be a valid URL"),
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  NEXT_PUBLIC_APP_URL: z.url("NEXT_PUBLIC_APP_URL must be a valid URL").optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validate environment variables at runtime
 * Call this at app initialization to fail fast if env is misconfigured
 */
export function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`❌ Invalid environment variables:\n${errors}`);
  }
  return result.data;
}

// ==========================================
// API Request Schemas
// ==========================================

// Food Analysis
export const analyzeFoodSchema = z.object({
  imageBase64: z.string().min(1, "Image data is required"),
});

export type AnalyzeFoodInput = z.infer<typeof analyzeFoodSchema>;

// Workout Plan Generation
export const workoutGoalSchema = z.enum(["muscle_gain", "fat_loss", "endurance"]);

export const generateWorkoutSchema = z.object({
  age: z.number().int().min(13, "Must be at least 13 years old").max(120, "Invalid age"),
  weight: z.number().positive("Weight must be positive"),
  height: z.number().positive("Height must be positive"),
  goal: workoutGoalSchema,
  frequency: z.number().int().min(1, "Minimum 1 day per week").max(7, "Maximum 7 days per week"),
});

export type GenerateWorkoutInput = z.infer<typeof generateWorkoutSchema>;

// Food Item in a Meal
export const foodItemSchema = z.object({
  name: z.string().min(1, "Food name is required"),
  portion: z.string().min(1, "Portion is required"),
  calories: z.number().nonnegative("Calories cannot be negative"),
  protein: z.number().nonnegative("Protein cannot be negative"),
  carbs: z.number().nonnegative("Carbs cannot be negative"),
  fat: z.number().nonnegative("Fat cannot be negative"),
  confidence: z.number().min(0).max(1).optional(),
});

export type FoodItemInput = z.infer<typeof foodItemSchema>;

// Create Meal
export const createMealSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Meal name is required"),
  imageUrl: z.url().optional(),
  foods: z.array(foodItemSchema).min(1, "At least one food item is required"),
});

export type CreateMealInput = z.infer<typeof createMealSchema>;

// Get Meals Query
export const getMealsQuerySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
});

export type GetMealsQuery = z.infer<typeof getMealsQuerySchema>;

// Form Analysis
export const analyzeFormSchema = z.object({
  videoUrl: z.string().optional(),
  imageBase64: z.string().optional(),
  exerciseType: z.string().optional(),
}).refine(
  (data) => data.videoUrl || data.imageBase64,
  { message: "Either videoUrl or imageBase64 is required" }
);

export type AnalyzeFormInput = z.infer<typeof analyzeFormSchema>;

// User Settings
export const userSettingsSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.url().optional(),
  dailyCalorieGoal: z.number().int().positive().optional(),
  dailyProteinGoal: z.number().int().nonnegative().optional(),
  dailyCarbsGoal: z.number().int().nonnegative().optional(),
  dailyFatGoal: z.number().int().nonnegative().optional(),
});

export type UserSettingsInput = z.infer<typeof userSettingsSchema>;

// ==========================================
// Utility Functions
// ==========================================

/**
 * Parse and validate request body with a Zod schema
 * Returns { success: true, data } or { success: false, error }
 */
export function parseBody<T>(
  schema: z.ZodType<T>,
  body: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    return { success: false, error: errors };
  }
  return { success: true, data: result.data };
}

/**
 * Parse query parameters from URL
 */
export function parseQuery<T>(
  schema: z.ZodType<T>,
  searchParams: URLSearchParams
): { success: true; data: T } | { success: false; error: string } {
  const params = Object.fromEntries(searchParams.entries());
  return parseBody(schema, params);
}
