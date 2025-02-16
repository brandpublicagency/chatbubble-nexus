
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { WhatsAppMessage, WhatsAppContact, ImageUploadResult } from './types.ts'
import { processImage } from './imageHandler.ts'

export async function handleMessage(
  supabase: ReturnType<typeof createClient>,
  message: WhatsAppMessage,
  contact: WhatsAppContact,
  metaToken: string
): Promise<{ status: string; path?: string }> {
  
  // Handle image messages
  if (message.type === 'image' && message.image) {
    const imageResult = await processImage(
      supabase,
      metaToken,
      message.image.id,
      message.image.caption
    )
    
    const { error: insertError } = await supabase
      .from('conversations')
      .insert({
        contact_id: contact.wa_id,
        text: imageResult.caption || 'Image message',
        attachment_path: imageResult.path,
        attachment_type: imageResult.type,
        meta_id: message.id
      })
    
    if (insertError) {
      console.error('Insert error:', insertError)
      throw new Error(`Failed to insert message: ${insertError.message}`)
    }
    
    return {
      status: 'Image processed successfully',
      path: imageResult.path
    }
  }
  
  // Handle text messages
  if (message.text?.body) {
    const { error } = await supabase
      .from('conversations')
      .insert([
        { contact_id: contact.wa_id, text: message.text.body, meta_id: message.id },
      ])
    
    if (error) {
      console.error('Error inserting data:', error)
      throw new Error('Failed to insert data')
    }
    
    return { status: 'Message processed successfully' }
  }
  
  return { status: 'No processable content in message' }
}
