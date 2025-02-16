
import { serve } from "https://deno.land/std@0.204.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const metaToken = Deno.env.get('META_TOKEN')

    if (!supabaseUrl || !supabaseServiceKey || !metaToken) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await req.json()
    
    console.log('Received webhook:', JSON.stringify(body, null, 2))
    
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    
    if (!value?.messages?.[0]) {
      return new Response(JSON.stringify({ status: 'No message in webhook' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    const message = value.messages[0]
    const contact = value.contacts?.[0]
    
    // Handle image messages
    if (message.type === 'image' && message.image) {
      console.log('Processing image message:', message.image)
      
      // 1. Get the media URL from Meta
      const mediaUrlResponse = await fetch(
        `https://graph.facebook.com/v19.0/${message.image.id}`,
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
          imageId: message.image.id
        })
        throw new Error(`Failed to get media URL: ${errorData}`)
      }
      
      const mediaData = await mediaUrlResponse.json()
      
      if (!mediaData.url) {
        console.error('No URL in media data:', mediaData)
        throw new Error('Failed to get media URL from Meta')
      }
      
      console.log('Retrieved media URL from Meta:', {
        imageId: message.image.id,
        hasUrl: !!mediaData.url
      })
      
      // 2. Download the actual image
      const imageResponse = await fetch(mediaData.url, {
        headers: { Authorization: `Bearer ${metaToken}` }
      })
      
      if (!imageResponse.ok) {
        const errorText = await imageResponse.text()
        console.error('Failed to download image:', {
          status: imageResponse.status,
          error: errorText
        })
        throw new Error(`Failed to download image: ${errorText}`)
      }
      
      const imageBlob = await imageResponse.blob()
      console.log('Downloaded image:', {
        size: imageBlob.size,
        type: imageBlob.type
      })
      
      // 3. Generate a unique filename that includes image ID
      const timestamp = Date.now()
      const filePath = `${message.image.id}_${timestamp}.jpg`
      
      console.log('Attempting to upload image with path:', filePath)
      
      // 4. Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat_images')
        .upload(filePath, imageBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) {
        console.error('Upload error:', {
          error: uploadError,
          path: filePath,
          blobSize: imageBlob.size,
          blobType: imageBlob.type
        })
        throw new Error(`Failed to upload to storage: ${uploadError.message}`)
      }
      
      console.log('Successfully uploaded image:', {
        path: filePath,
        uploadData
      })
      
      // 5. Save message to database with attachment path
      const { error: insertError } = await supabase
        .from('conversations')
        .insert({
          contact_id: contact.wa_id,
          text: message.image?.caption || 'Image message',
          attachment_path: filePath,
          attachment_type: 'image/jpeg'
        })
      
      if (insertError) {
        console.error('Insert error:', insertError)
        throw new Error(`Failed to insert message: ${insertError.message}`)
      }
      
      return new Response(
        JSON.stringify({ 
          status: 'Image processed successfully',
          path: filePath,
          message: 'Image uploaded and saved to database'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }
    
    // Handle other message types as before
    const text = message?.text?.body
    const wa_id = contact?.wa_id

    if (!text) {
      return new Response(JSON.stringify({ status: 'No text in webhook' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // Insert data into Supabase
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        { contact_id: wa_id, text: text },
      ])
    
    if (error) {
      console.error('Error inserting data:', error)
      return new Response(JSON.stringify({ error: 'Failed to insert data' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    return new Response(
      JSON.stringify({ data, status: 'Message processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
