
import { supabase } from "@/integrations/supabase/client";

export interface ImageLoadResult {
  publicUrl: string | null;
  error: boolean;
  isOldFormat: boolean;
}

export const isLegacyImagePath = (path: string): boolean => {
  // Remove the legacy check since we're now properly handling numeric IDs
  return false;
};

export const loadImage = async (path: string): Promise<ImageLoadResult> => {
  if (!path) {
    throw new Error('No path provided');
  }

  console.log('Loading image with path:', path);
  
  // Check if the path is a direct filename in storage
  if (path.includes('.')) {
    const { data: urlData } = supabase.storage
      .from('chat_images')
      .getPublicUrl(path);

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
      
      // Pre-load image
      try {
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.src = urlData.publicUrl;
          img.onload = resolve;
          img.onerror = reject;
        });
        console.log('Image pre-loaded successfully:', urlData.publicUrl);
        
        return {
          publicUrl: urlData.publicUrl,
          error: false,
          isOldFormat: false
        };
      } catch (error) {
        console.error('Error pre-loading image:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error checking file existence:', error);
      throw error;
    }
  }
  
  // If we reach here, the path is a Meta image ID
  console.log('Meta image ID detected:', path);
  
  // For Meta image IDs, we need to process them through our webhook
  // Return an error state that will show "Image is being processed"
  return {
    publicUrl: null,
    error: true,
    isOldFormat: false
  };
};
