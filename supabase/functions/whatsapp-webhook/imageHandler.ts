
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { ImageUploadResult } from './types.ts'

export async function getMediaUrl(imageId: string, metaToken: string): Promise<string> {
  const mediaUrlResponse = await fetch(
    `https://graph.facebook.com/v19.0/${imageId}`,
    {
      headers: {
        Authorization: `Bearer ${metaToken}`
      }
    }
  )
  
  if (!mediaUrlResponse.ok) {
    const errorData = await mediaUrlResponse.text()
    console.error('Failed to get media URL:', {
      status: mediaUrlResponse.status,
      error: errorData,
      imageId: imageId
    })
    throw new Error(`Failed to get media URL: ${errorData}`)
  }
  
  const mediaData = await mediaUrlResponse.json()
  
  if (!mediaData.url) {
    console.error('No URL in media data:', mediaData)
    throw new Error('Failed to get media URL from Meta')
  }
  
  return mediaData.url
}

export async function downloadImage(url: string, metaToken: string): Promise<Blob> {
  const imageResponse = await fetch(url, {
    headers: { Authorization: `Bearer ${metaToken}` }
  })
  
  if (!imageResponse.ok) {
    const errorText = await imageResponse.text()
    throw new Error(`Failed to download image: ${errorText}`)
  }
  
  return await imageResponse.blob()
}

export async function uploadImageToSupabase(
  supabase: ReturnType<typeof createClient>,
  imageBlob: Blob,
  filePath: string
): Promise<void> {
  console.log('Uploading image to Supabase:', { 
    path: filePath, 
    size: imageBlob.size, 
    type: imageBlob.type 
  });

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('chat_images')
    .upload(filePath, imageBlob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: true // Changed to true to handle potential duplicates
    })
  
  if (uploadError) {
    console.error('Upload error:', {
      error: uploadError,
      path: filePath,
      errorMessage: uploadError.message,
      errorDetails: uploadError.details,
      blobSize: imageBlob.size,
      blobType: imageBlob.type
    })
    throw new Error(`Failed to upload to storage: ${uploadError.message}`)
  }

  console.log('Image uploaded successfully:', uploadData);
}

export async function processImage(
  supabase: ReturnType<typeof createClient>,
  metaToken: string,
  imageId: string,
  caption?: string
): Promise<ImageUploadResult> {
  console.log('Processing image:', { imageId, caption })
  
  const mediaUrl = await getMediaUrl(imageId, metaToken)
  console.log('Got media URL:', mediaUrl)
  
  const imageBlob = await downloadImage(mediaUrl, metaToken)
  console.log('Downloaded image:', { size: imageBlob.size, type: imageBlob.type })
  
  const uuid = crypto.randomUUID()
  const timestamp = Date.now()
  const filePath = `${timestamp}_${uuid}.jpg`
  
  await uploadImageToSupabase(supabase, imageBlob, filePath)
  console.log('Image uploaded to storage:', filePath)
  
  return {
    path: filePath,
    type: 'image/jpeg',
    caption
  }
}
