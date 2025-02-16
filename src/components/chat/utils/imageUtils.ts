
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

  console.log('Loading image with path:', path);
  const isOldFormat = isLegacyImagePath(path);
  
  if (isOldFormat) {
    console.log('Legacy image format detected:', { path });
    throw new Error('Legacy image format');
  }

  const { data: urlData } = supabase.storage
    .from('chat_images')
    .getPublicUrl(path);

  console.log('Generated public URL:', urlData);

  if (!urlData?.publicUrl) {
    console.error('Failed to generate public URL for path:', path);
    throw new Error('Failed to generate public URL');
  }

  // Verify file exists in storage
  try {
    const { data: existsData, error: existsError } = await supabase.storage
      .from('chat_images')
      .download(path);

    if (existsError) {
      console.error('File not found in storage:', { path, error: existsError });
      throw new Error('File not found in storage');
    }

    console.log('File exists in storage:', { path, size: existsData?.size });
  } catch (error) {
    console.error('Error checking file existence:', error);
    throw error;
  }

  // Pre-load image
  try {
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.src = urlData.publicUrl;
      img.onload = resolve;
      img.onerror = reject;
    });
    console.log('Image pre-loaded successfully:', urlData.publicUrl);
  } catch (error) {
    console.error('Error pre-loading image:', error);
    throw error;
  }

  return {
    publicUrl: urlData.publicUrl,
    error: false,
    isOldFormat: false
  };
};
