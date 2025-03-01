
import { supabase } from "@/integrations/supabase/client";

export interface ImageLoadResult {
  publicUrl: string | null;
  error: boolean;
  isOldFormat: boolean;
}

export const isLegacyImagePath = (path: string): boolean => {
  return /^\d+$/.test(path) && path.length > 8;
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
  
  // If we reach here, the path might be a Meta image ID
  console.log('Meta image ID detected:', path);
  
  // Try to check if this Meta image ID has a corresponding file in storage
  try {
    // First, check if we have a file with the ID as the name
    const metaImageFileName = `${path}.jpg`;
    const { data: urlData } = supabase.storage
      .from('chat_images')
      .getPublicUrl(metaImageFileName);

    if (urlData?.publicUrl) {
      // Check if the file actually exists
      const { data: existsData, error: existsError } = await supabase.storage
        .from('chat_images')
        .download(metaImageFileName);

      if (!existsError && existsData) {
        console.log('Meta image found in storage:', { path: metaImageFileName, size: existsData?.size });
        return {
          publicUrl: urlData.publicUrl,
          error: false,
          isOldFormat: false
        };
      }
    }

    // Also try without the .jpg extension
    const { data: urlDataWithoutExt } = supabase.storage
      .from('chat_images')
      .getPublicUrl(path);

    if (urlDataWithoutExt?.publicUrl) {
      const { data: existsDataWithoutExt, error: existsErrorWithoutExt } = await supabase.storage
        .from('chat_images')
        .download(path);

      if (!existsErrorWithoutExt && existsDataWithoutExt) {
        console.log('Meta image found in storage without extension:', { path, size: existsDataWithoutExt?.size });
        return {
          publicUrl: urlDataWithoutExt.publicUrl,
          error: false,
          isOldFormat: false
        };
      }
    }
  } catch (error) {
    console.error('Error checking Meta image in storage:', error);
  }
  
  // If we couldn't find the file in storage, check if there's a URL in the database
  try {
    const { data, error } = await supabase
      .from('media_files')
      .select('file_url')
      .eq('media_id', path)
      .maybeSingle();
    
    if (!error && data?.file_url) {
      console.log('Found URL for Meta image ID in database:', data.file_url);
      return {
        publicUrl: data.file_url,
        error: false,
        isOldFormat: false
      };
    }
  } catch (dbError) {
    console.error('Error fetching from media_files table:', dbError);
  }
  
  // If none of the above methods worked, return an error state
  return {
    publicUrl: null,
    error: true,
    isOldFormat: isLegacyImagePath(path)
  };
};
