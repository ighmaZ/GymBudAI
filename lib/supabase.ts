import { createClient } from "@supabase/supabase-js";

// Create Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper to upload food image
export async function uploadFoodImage(
  file: File,
  userId: string
): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("food-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  // Get public URL
  const { data } = supabase.storage.from("food-images").getPublicUrl(fileName);

  return data.publicUrl;
}
