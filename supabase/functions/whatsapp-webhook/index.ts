
import { serve } from "https://deno.land/std@0.204.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { WhatsAppWebhookPayload } from './types.ts'
import { handleMessage } from './messageHandler.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Add top-level debug logging
  console.log("----- WhatsApp Webhook Function Invoked -----");
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const metaToken = Deno.env.get('META_TOKEN')

    // Log environment variable presence (not their values)
    console.log('Environment variables check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseServiceKey,
      hasMetaToken: !!metaToken
    });

    if (!supabaseUrl || !supabaseServiceKey || !metaToken) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    const body = await req.json() as WhatsAppWebhookPayload
    console.log('Received webhook payload structure:', {
      hasEntry: !!body.entry,
      entryLength: body.entry?.length,
      hasChanges: !!body.entry?.[0]?.changes,
      changesLength: body.entry?.[0]?.changes?.length,
      hasValue: !!body.entry?.[0]?.changes?.[0]?.value,
      hasMessages: !!body.entry?.[0]?.changes?.[0]?.value?.messages,
      messageCount: body.entry?.[0]?.changes?.[0]?.value?.messages?.length
    })
    
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    
    if (!value?.messages?.[0]) {
      console.log('No message found in webhook payload');
      return new Response(
        JSON.stringify({ status: 'No message in webhook' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    const message = value.messages[0]
    const contact = value.contacts?.[0]
    
    if (!contact) {
      console.log('No contact information in webhook payload');
      throw new Error('No contact information in webhook')
    }

    console.log('Processing message:', {
      messageType: message.type,
      hasImage: message.type === 'image' && !!message.image,
      hasText: message.type === 'text' && !!message.text,
      contactId: contact.wa_id
    });

    const result = await handleMessage(supabase, message, contact, metaToken)
    
    console.log('Message processing completed:', result);

    return new Response(
      JSON.stringify({ ...result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error processing webhook:', {
      error: error.message,
      stack: error.stack
    })
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
