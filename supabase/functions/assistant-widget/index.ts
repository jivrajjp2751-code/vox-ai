import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const apiKey = url.searchParams.get("apiKey") || req.headers.get("x-voxai-api-key");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing apiKey" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up assistant by api_key
    const { data: assistant, error } = await supabase
      .from("voice_assistants")
      .select("id, name, system_prompt, language, conversation_mode, temperature, voice_provider, voice_id, voice_speed, tools")
      .eq("api_key", apiKey)
      .maybeSingle();

    if (error || !assistant) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST = chat endpoint, GET = config endpoint
    if (req.method === "POST") {
      const { userMessage, conversationHistory } = await req.json();

      if (!userMessage) {
        return new Response(JSON.stringify({ error: "userMessage is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const antigravityApiKey = Deno.env.get("ANTIGRAVITY_API_KEY");
      if (!antigravityApiKey) throw new Error("ANTIGRAVITY_API_KEY not configured");

      const messages = [
        { role: "system", content: assistant.system_prompt || "You are a helpful voice assistant." },
        ...(conversationHistory || []),
        { role: "user", content: userMessage },
      ];

      const aiResponse = await fetch("https://ai.gateway.antigravity.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${antigravityApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
          temperature: assistant.temperature ?? 0.7,
          max_tokens: 300,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI error: ${aiResponse.status} - ${errorText}`);
      }

      const aiData = await aiResponse.json();
      const reply = aiData.choices?.[0]?.message?.content ?? "Sorry, I couldn't process that.";

      return new Response(JSON.stringify({ reply, assistantId: assistant.id, assistantName: assistant.name }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET = return assistant config
    return new Response(JSON.stringify({
      id: assistant.id,
      name: assistant.name,
      language: assistant.language,
      conversationMode: assistant.conversation_mode,
      voiceProvider: assistant.voice_provider,
      voiceId: assistant.voice_id,
      firstMessage: (assistant.tools as any)?.firstMessage || "Hi! How can I help you today?",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("assistant-widget error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
