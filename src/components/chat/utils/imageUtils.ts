
import { supabase } from "@/integrations/supabase/client";

export interface ImageLoadResult {
  publicUrl: string | null;
  error: boolean;
  isOldFormat: boolean;
}

export const isLegacyImagePath = (path: string): boolean => {
  return /^\d+$/.test(path);
};

export const loadImage = async (path: string): Promise<ImageLoadResult> => {
  if (!path) {
    throw new Error('No path provided');
  }

  const isOldFormat = isLegacyImagePath(path);
  
  if (isOldFormat) {
    console.log('Legacy image format detected:', { path });
    throw new Error('Legacy image format');
  }

  const { data: urlData } = supabase.storage
    .from('chat_images')
    .getPublicUrl(path);

  if (!urlData?.publicUrl) {
    throw new Error('Failed to generate public URL');
  }

  // Verify file exists in storage
  const { data: existsData, error: existsError } = await supabase.storage
    .from('chat_images')
    .download(path);

  if (existsError) {
    throw new Error('File not found in storage');
  }

  // Pre-load image
  await new Promise((resolve, reject) => {
    const img = new Image();
    img.src = urlData.publicUrl;
    img.onload = resolve;
    img.onerror = reject;
  });

  return {
    publicUrl: urlData.publicUrl,
    error: false,
    isOldFormat: false
  };
};
