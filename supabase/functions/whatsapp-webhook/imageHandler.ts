
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { ImageUploadResult } from './types.ts'

export async function getMediaUrl(imageId: string, metaToken: string): Promise<string> {
  console.log('Getting media URL for image:', imageId);
  
  const mediaUrlResponse = await fetch(
    `https://graph.facebook.com/v19.0/${imageId}`,
    {
      headers: {
        Authorization: `Bearer ${metaToken}`
      }
    }
  );
  
  if (!mediaUrlResponse.ok) {
    const errorData = await mediaUrlResponse.text();
    console.error('Failed to get media URL:', {
      status: mediaUrlResponse.status,
      error: errorData,
      imageId: imageId
    });
    throw new Error(`Failed to get media URL: ${errorData}`);
  }
  
  const mediaData = await mediaUrlResponse.json();
  
  if (!mediaData.url) {
    console.error('No URL in media data:', mediaData);
    throw new Error('Failed to get media URL from Meta');
  }
  
  console.log('Successfully retrieved media URL');
  return mediaData.url;
}

export async function downloadImage(url: string, metaToken: string): Promise<Blob> {
  console.log('Downloading image from URL:', url);
  const imageResponse = await fetch(url, {
    headers: { Authorization: `Bearer ${metaToken}` }
  });
  
  if (!imageResponse.ok) {
    const errorText = await imageResponse.text();
    console.error('Failed to download image:', {
      status: imageResponse.status,
      error: errorText,
      url: url
    });
    throw new Error(`Failed to download image: ${errorText}`);
  }
  
  const blob = await imageResponse.blob();
  console.log('Image downloaded successfully:', { 
    size: blob.size, 
    type: blob.type 
  });
  return blob;
}

export async function uploadImageToSupabase(
  supabase: ReturnType<typeof createClient>,
  imageBlob: Blob,
  filePath: string
): Promise<void> {
  console.log('Starting Supabase upload:', { 
    path: filePath, 
    size: imageBlob.size, 
    type: imageBlob.type 
  });

  // First check if bucket exists
  const { data: bucketData, error: bucketError } = await supabase
    .storage
    .getBucket('chat_images');

  if (bucketError) {
    console.error('Error checking bucket:', bucketError);
    throw new Error(`Bucket error: ${bucketError.message}`);
  }

  console.log('Bucket exists:', bucketData);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('chat_images')
    .upload(filePath, imageBlob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: true
    });
  
  if (uploadError) {
    console.error('Upload error:', {
      error: uploadError,
      path: filePath,
      errorMessage: uploadError.message,
      errorDetails: uploadError.details,
      blobSize: imageBlob.size,
      blobType: imageBlob.type
    });
    throw new Error(`Failed to upload to storage: ${uploadError.message}`);
  }

  console.log('Image uploaded successfully:', uploadData);
}

export async function processImage(
  supabase: ReturnType<typeof createClient>,
  metaToken: string,
  imageId: string,
  caption?: string
): Promise<ImageUploadResult> {
  console.log('Starting image processing:', { imageId, caption });
  
  const mediaUrl = await getMediaUrl(imageId, metaToken);
  console.log('Got media URL:', mediaUrl);
  
  const imageBlob = await downloadImage(mediaUrl, metaToken);
  console.log('Downloaded image:', { size: imageBlob.size, type: imageBlob.type });
  
  const timestamp = new Date().toISOString();
  const uuid = crypto.randomUUID();
  const filePath = `${timestamp}_${uuid}.jpg`;
  
  await uploadImageToSupabase(supabase, imageBlob, filePath);
  console.log('Image uploaded to storage:', filePath);
  
  return {
    path: filePath,
    type: 'image/jpeg',
    caption
  };
}
