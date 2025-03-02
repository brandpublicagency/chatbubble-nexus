
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
  
  // Check if it's a WhatsApp ID with standard format (wamid.*)
  const isWhatsAppId = path.startsWith('wamid.');
  if (isWhatsAppId) {
    console.log('WhatsApp media ID format detected');
  }
  
  // First, check if the path matches the pattern used in the AWS bot (messageId as filename)
  try {
    // Check if we have a file with the full Meta ID as the name
    if (isWhatsAppId) {
      // Format used in the AWS bot: ${messageId}.jpg 
      const metaImageFileNameWithExt = `${path}.jpg`;
      const { data: urlData } = supabase.storage
        .from('chat_images')
        .getPublicUrl(metaImageFileNameWithExt);

      if (urlData?.publicUrl) {
        // Check if the file actually exists
        const { data: existsData, error: existsError } = await supabase.storage
          .from('chat_images')
          .download(metaImageFileNameWithExt);

        if (!existsError && existsData) {
          console.log('Meta image found in storage with extension:', { path: metaImageFileNameWithExt, size: existsData?.size });
          return {
            publicUrl: urlData.publicUrl,
            error: false,
            isOldFormat: false
          };
        }
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
  
  // Check if the image is stored in the conversations table
  try {
    // Look for the meta_id in the conversations table
    const { data, error } = await supabase
      .from('conversations')
      .select('attachment_path')
      .eq('meta_id', path)
      .maybeSingle();
    
    if (!error && data?.attachment_path) {
      console.log('Found file path for Meta image ID in conversations table:', data.attachment_path);
      
      // Get public URL for this file path
      const { data: urlData } = supabase.storage
        .from('chat_images')
        .getPublicUrl(data.attachment_path);
        
      if (urlData?.publicUrl) {
        return {
          publicUrl: urlData.publicUrl,
          error: false,
          isOldFormat: false
        };
      }
    }
  } catch (dbError) {
    console.error('Error fetching from conversations table:', dbError);
  }
  
  // Check if we have a chat attachment record
  try {
    const { data, error } = await supabase
      .from('chat_attachments')
      .select('file_path')
      .eq('message_id', path)
      .maybeSingle();
    
    if (!error && data?.file_path) {
      console.log('Found path in chat_attachments table:', data.file_path);
      
      // Get public URL for this file path
      const { data: urlData } = supabase.storage
        .from('chat_images')
        .getPublicUrl(data.file_path);
        
      if (urlData?.publicUrl) {
        return {
          publicUrl: urlData.publicUrl,
          error: false,
          isOldFormat: false
        };
      }
    }
  } catch (dbError) {
    console.error('Error fetching from chat_attachments table:', dbError);
  }
  
  // If none of the above methods worked, return an error state
  return {
    publicUrl: null,
    error: true,
    isOldFormat: isLegacyImagePath(path)
  };
};
