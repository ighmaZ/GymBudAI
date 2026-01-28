/**
 * Extracts JSON from a string that might be wrapped in markdown code blocks.
 * Handles both ```json and ``` formats.
 */
export function extractJsonFromMarkdown(text: string): string {
  if (text.includes("```json")) {
    return text.split("```json")[1].split("```")[0].trim();
  } else if (text.includes("```")) {
    return text.split("```")[1].split("```")[0].trim();
  }
  return text;
}

/**
 * Parses JSON from a string that might be wrapped in markdown code blocks.
 * Provides consistent error handling across all AI response parsing.
 * 
 * @param text - The raw response text from an AI model
 * @param context - A descriptive context for error messages (e.g., "workout plan", "food analysis")
 * @returns The parsed JSON object
 * @throws Error with descriptive message if parsing fails
 */
export function parseJsonFromAiResponse<T>(text: string, context: string): T {
  const jsonString = extractJsonFromMarkdown(text);
  
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    console.error(`Failed to parse ${context} response:`, text);
    throw new Error(`Failed to parse ${context} response`);
  }
}
