import { useCallback, useMemo, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, RadioTower, Sparkles } from "lucide-react";

export type PlaygroundAssistant = {
  name: string;
  systemPrompt: string;
  language: string;
  conversationMode: string;
  temperature: number;
  agentId?: string;
};

export function VoicePlayground({ assistant }: { assistant: PlaygroundAssistant | null }) {
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();
  const [isConnecting, setIsConnecting] = useState(false);

  const conversation = useConversation({
    onConnect: () => toast({ title: "Connected" }),
    onDisconnect: () => toast({ title: "Disconnected" }),
    onError: (error) => toast({ variant: "destructive", title: "Voice error", description: String(error) }),
  });

  const statusLabel = useMemo(() => {
    if (conversation.status === "connected") return conversation.isSpeaking ? "Speaking" : "Listening";
    return "Idle";
  }, [conversation.status, conversation.isSpeaking]);

  const start = useCallback(async () => {
    if (!assistant?.agentId) {
      toast({ variant: "destructive", title: "Missing Agent ID", description: "Go to Advanced tab and paste your ElevenLabs Agent ID." });
      return;
    }
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: assistant.agentId,
        connectionType: "webrtc",
        overrides: {
          agent: {
            prompt: { prompt: assistant.systemPrompt },
            firstMessage: `Hi! I'm ${assistant.name}. How can I help?`,
            language: assistant.language,
          },
        },
      });
    } catch (e: unknown) {
      toast({ variant: "destructive", title: "Failed", description: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      setIsConnecting(false);
    }
  }, [assistant, conversation, toast]);

  const stop = useCallback(async () => {
    try { await conversation.endSession(); } catch {}
  }, [conversation]);

  return (
    <Card className="border-border/40 bg-card shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-sm">Live Voice Test</CardTitle>
        <CardDescription className="text-[11px]">Test your assistant with real-time voice via WebRTC.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status bar */}
        <div className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/30 px-3 py-2 text-xs">
          <div className="min-w-0">
            <p className="font-display text-[11px] truncate">{assistant?.name ?? "No assistant"}</p>
            <p className="text-[10px] text-muted-foreground">{statusLabel}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <RadioTower className="h-3 w-3" /> WebRTC
          </span>
        </div>

        {/* Orb */}
        <div className="relative grid place-items-center overflow-hidden rounded-xl border border-border/30 bg-background py-8">
          <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-mesh)" }} />
          <motion.div
            className="relative grid h-24 w-24 place-items-center rounded-full border border-primary/20 bg-background/80 shadow-pop"
            animate={reduceMotion ? undefined : {
              scale: conversation.status === "connected" ? (conversation.isSpeaking ? [1, 1.12, 1] : [1, 1.04, 1]) : 1,
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
              {conversation.status === "connected" ? <Sparkles className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        {conversation.status === "connected" ? (
          <Button variant="outline" className="w-full" onClick={stop}><MicOff className="h-3.5 w-3.5" /> Stop</Button>
        ) : (
          <Button variant="hero" className="w-full" onClick={start} disabled={isConnecting}>
            <Mic className="h-3.5 w-3.5" /> {isConnecting ? "Connecting…" : "Start Conversation"}
          </Button>
        )}
        <p className="text-center text-[10px] text-muted-foreground">Requires microphone access.</p>
      </CardContent>
    </Card>
  );
}
