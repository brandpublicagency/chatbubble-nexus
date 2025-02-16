
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
      const mediaData = await mediaUrlResponse.json()
      
      if (!mediaData.url) {
        throw new Error('Failed to get media URL from Meta')
      }
      
      // 2. Download the actual image
      const imageResponse = await fetch(mediaData.url, {
        headers: { Authorization: `Bearer ${metaToken}` }
      })
      const imageBlob = await imageResponse.blob()
      
      // 3. Generate a unique path for Supabase storage - store directly in root of bucket
      const timestamp = Date.now()
      const filePath = `${timestamp}.jpg`
      
      console.log('Attempting to upload image with path:', filePath)
      
      // 4. Upload to Supabase storage - no subfolder, just the filename
      const { error: uploadError } = await supabase.storage
        .from('chat_images')
        .upload(filePath, imageBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Failed to upload to storage: ${uploadError.message}`)
      }
      
      console.log('Successfully uploaded image to:', filePath)
      
      // 5. Save message to database with the exact same path as used in upload
      const { error: insertError } = await supabase
        .from('conversations')
        .insert({
          contact_id: contact.wa_id,
          text: message.image?.caption || 'Image message',
          attachment_path: filePath, // Store exact same path as used in upload
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
          message: 'Image uploaded directly to bucket root'
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
