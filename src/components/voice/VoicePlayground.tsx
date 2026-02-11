import { useCallback, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Square, Sparkles, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type PlaygroundAssistant = {
  name: string;
  systemPrompt: string;
  language: string;
  conversationMode: string;
  temperature: number;
  voiceId?: string;
  voiceProvider?: string;
};

type Message = { role: "user" | "assistant"; text: string };

export function VoicePlayground({ assistant }: { assistant: PlaygroundAssistant | null }) {
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const statusLabel = useMemo(() => {
    switch (status) {
      case "listening": return "Listening…";
      case "thinking": return "Thinking…";
      case "speaking": return "Speaking…";
      default: return "Idle";
    }
  }, [status]);

  const start = useCallback(async () => {
    if (!assistant) {
      toast({ variant: "destructive", title: "No assistant", description: "Select or create an assistant first." });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setStatus("listening");
      toast({ title: "Listening", description: "Speak now. Click Stop when done." });
    } catch (e: unknown) {
      toast({ variant: "destructive", title: "Mic error", description: e instanceof Error ? e.message : "Could not access microphone" });
    }
  }, [assistant, toast]);

  const stop = useCallback(async () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      setStatus("idle");
      return;
    }

    mediaRecorder.onstop = async () => {
      // Stop mic tracks
      streamRef.current?.getTracks().forEach((t) => t.stop());

      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      
      if (audioBlob.size < 100) {
        setStatus("idle");
        toast({ variant: "destructive", title: "No audio", description: "No audio was captured. Try again." });
        return;
      }

      setStatus("thinking");

      // For now, simulate a response since we don't have a full pipeline edge function yet
      // In production this would call a backend function that does STT -> LLM -> TTS
      const userText = "Voice message recorded";
      setMessages((prev) => [...prev, { role: "user", text: userText }]);

      // Simulate assistant response
      setTimeout(() => {
        const responseText = `Hi! I'm ${assistant?.name ?? "your assistant"}. I received your voice message. The full voice pipeline (STT → LLM → TTS) requires backend functions to be configured. For now, the assistant builder is ready for you to configure all settings!`;
        setMessages((prev) => [...prev, { role: "assistant", text: responseText }]);
        setStatus("idle");
        toast({ title: "Response ready" });
      }, 1500);
    };

    mediaRecorder.stop();
  }, [assistant, toast]);

  const cancel = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setStatus("idle");
  }, []);

  return (
    <Card className="border-border/40 bg-card shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-sm">Live Voice Test</CardTitle>
        <CardDescription className="text-[11px]">Record → Transcribe → LLM → Speak</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status bar */}
        <div className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/30 px-3 py-2 text-xs">
          <div className="min-w-0">
            <p className="font-display text-[11px] truncate">{assistant?.name ?? "No assistant"}</p>
            <p className="text-[10px] text-muted-foreground">{statusLabel}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Volume2 className="h-3 w-3" /> {assistant?.voiceProvider ?? "elevenlabs"}
          </span>
        </div>

        {/* Voice ID display */}
        {assistant?.voiceId && (
          <div className="rounded-md border border-border/20 bg-secondary/20 px-3 py-1.5 text-[10px] text-muted-foreground truncate">
            Voice: {assistant.voiceId}
          </div>
        )}

        {/* Orb */}
        <div className="relative grid place-items-center overflow-hidden rounded-xl border border-border/30 bg-background py-8">
          <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-mesh)" }} />
          <motion.div
            className="relative grid h-24 w-24 place-items-center rounded-full border border-primary/20 bg-background/80 shadow-pop"
            animate={reduceMotion ? undefined : {
              scale: status === "listening" ? [1, 1.12, 1] : status === "speaking" ? [1, 1.08, 1] : status === "thinking" ? [1, 1.04, 1] : 1,
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
              {status === "listening" ? <Mic className="h-5 w-5 animate-pulse" /> :
               status === "speaking" ? <Sparkles className="h-5 w-5" /> :
               status === "thinking" ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> :
               <Mic className="h-5 w-5" />}
            </div>
          </motion.div>
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <div className="max-h-32 overflow-y-auto space-y-1.5 rounded-lg border border-border/20 bg-secondary/20 p-2">
            {messages.slice(-4).map((m, i) => (
              <div key={i} className={`text-[10px] leading-relaxed ${m.role === "user" ? "text-muted-foreground" : "text-foreground"}`}>
                <span className="font-display font-semibold">{m.role === "user" ? "You" : assistant?.name ?? "AI"}:</span> {m.text}
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        {status === "listening" ? (
          <div className="flex gap-2">
            <Button variant="hero" className="flex-1" onClick={stop}><Square className="h-3.5 w-3.5" /> Stop & Process</Button>
            <Button variant="outline" size="icon" onClick={cancel}><MicOff className="h-3.5 w-3.5" /></Button>
          </div>
        ) : status === "thinking" || status === "speaking" ? (
          <Button variant="outline" className="w-full" onClick={cancel} disabled={status === "thinking"}>
            <MicOff className="h-3.5 w-3.5" /> Cancel
          </Button>
        ) : (
          <Button variant="hero" className="w-full" onClick={start}>
            <Mic className="h-3.5 w-3.5" /> Start Recording
          </Button>
        )}
        <p className="text-center text-[10px] text-muted-foreground">Requires microphone access.</p>
      </CardContent>
    </Card>
  );
}
