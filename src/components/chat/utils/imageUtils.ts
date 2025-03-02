
import { supabase } from "@/integrations/supabase/client";

export interface ImageLoadResult {
  publicUrl: string | null;
  error: boolean;
  isOldFormat: boolean;
  errorDetails?: string | null;
  mediaId?: string | null;
}

export const isLegacyImagePath = (path: string): boolean => {
  return /^\d+$/.test(path) && path.length > 8;
};

export const isWhatsAppMediaId = (path: string): boolean => {
  // Common patterns for WhatsApp media IDs
  return path.startsWith('wamid.') || 
         path.includes('WhatsApp') || 
         path.includes('3A') && path.length > 20;
};

export const extractMediaIdFromPath = (path: string): string | null => {
  if (!path) return null;
  
  // Try to extract the media ID from various formats
  if (path.includes('_')) {
    const parts = path.split('_');
    return parts[0];
  }
  
  if (path.includes('.')) {
    const parts = path.split('.');
    return parts[0];
  }
  
  return path;
};

export const loadImage = async (path: string): Promise<ImageLoadResult> => {
  if (!path) {
    throw new Error('No path provided');
  }

  console.log('Loading image with path:', path);
  const mediaId = extractMediaIdFromPath(path);
  
  // Case 1: Check if the path is a direct filename in storage
  if (path.includes('.')) {
    try {
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
            isOldFormat: false,
            mediaId
          };
        } catch (error) {
          console.error('Error pre-loading image:', error);
          throw error;
        }
      } catch (error) {
        console.error('Error checking file existence:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error with file path that includes dot:', error);
      // Continue to other methods
    }
  }
  
  // Case 2: WhatsApp media ID detection and handling
  const isWhatsApp = isWhatsAppMediaId(path);
  if (isWhatsApp) {
    console.log('WhatsApp media ID detected:', path);
  }
  
  // First, check if we have a file with the WhatsApp message ID as the filename
  try {
    // Try with multiple extensions and formats
    const possiblePathsToCheck = [
      `${path}.jpg`,            // Standard format: messageId.jpg
      path,                     // Raw path/ID
      `${path}.jpeg`,           // Alternative extension
      `${path}.png`,            // Alternative extension
      `${path}_image.jpg`,      // Another possible format
      `${path.split('_')[0]}.jpg`, // First part of ID with .jpg
      `${mediaId}.jpg`,         // Extracted media ID with .jpg
      `${mediaId}.jpeg`,        // Extracted media ID with .jpeg
      `${mediaId}.png`          // Extracted media ID with .png
    ];
    
    for (const pathToCheck of possiblePathsToCheck) {
      try {
        const { data: urlData } = supabase.storage
          .from('chat_images')
          .getPublicUrl(pathToCheck);

        if (urlData?.publicUrl) {
          // Check if the file actually exists
          const { data: existsData, error: existsError } = await supabase.storage
            .from('chat_images')
            .download(pathToCheck);

          if (!existsError && existsData) {
            console.log('Image found in storage with path:', { path: pathToCheck, size: existsData?.size });
            return {
              publicUrl: urlData.publicUrl,
              error: false,
              isOldFormat: false,
              mediaId
            };
          }
        }
      } catch (checkError) {
        console.log(`Checked path ${pathToCheck} - not found`);
        // Continue checking other paths
      }
    }
  } catch (error) {
    console.error('Error checking multiple potential file paths:', error);
  }
  
  // Case 3: Check if the image is stored in the conversations table
  try {
    // Look for the meta_id in the conversations table
    const { data, error } = await supabase
      .from('conversations')
      .select('attachment_path')
      .eq('meta_id', path)
      .maybeSingle();
    
    if (!error && data?.attachment_path) {
      console.log('Found file path for Meta ID in conversations table:', data.attachment_path);
      
      // Get public URL for this file path
      const { data: urlData } = supabase.storage
        .from('chat_images')
        .getPublicUrl(data.attachment_path);
        
      if (urlData?.publicUrl) {
        return {
          publicUrl: urlData.publicUrl,
          error: false,
          isOldFormat: false,
          mediaId
        };
      }
    }
  } catch (dbError) {
    console.error('Error fetching from conversations table:', dbError);
  }
  
  // Case 4: Check if we have a chat attachment record
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
          isOldFormat: false,
          mediaId
        };
      }
    }
  } catch (dbError) {
    console.error('Error fetching from chat_attachments table:', dbError);
  }
  
  // If none of the above methods worked, return an error state with details
  let errorDetails = '';
  if (isWhatsApp) {
    errorDetails = 'The WhatsApp media file could not be retrieved from storage. This is likely due to an issue with the AWS Lambda function that processes media.';
  } else {
    errorDetails = 'File not found in storage or database records';
  }

  return {
    publicUrl: null,
    error: true,
    isOldFormat: isLegacyImagePath(path),
    errorDetails,
    mediaId
  };
};
