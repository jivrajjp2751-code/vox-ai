import { useCallback, useMemo, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    onConnect: () => {
      toast({ title: "Connected", description: "Your agent is ready." });
    },
    onDisconnect: () => {
      toast({ title: "Disconnected", description: "Session ended." });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Voice error", description: String(error) });
    },
  });

  const statusLabel = useMemo(() => {
    if (conversation.status === "connected") return conversation.isSpeaking ? "Speaking" : "Listening";
    return conversation.status;
  }, [conversation.status, conversation.isSpeaking]);

  const start = useCallback(async () => {
    if (!assistant?.agentId) {
      toast({
        variant: "destructive",
        title: "Missing Agent ID",
        description: "Paste an ElevenLabs Agent ID in the builder first.",
      });
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
            prompt: {
              prompt: assistant.systemPrompt,
            },
            firstMessage: `Hi! I'm ${assistant.name}. What can I do for you today?`,
            language: assistant.language,
          },
        },
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to start voice session";
      toast({ variant: "destructive", title: "Start failed", description: message });
    } finally {
      setIsConnecting(false);
    }
  }, [assistant, conversation, toast]);

  const stop = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to stop";
      toast({ variant: "destructive", title: "Stop failed", description: message });
    }
  }, [conversation, toast]);

  return (
    <Card className="sticky top-24 bg-background/70 shadow-pop backdrop-blur">
      <CardHeader>
        <CardTitle className="font-display">Live Voice</CardTitle>
        <CardDescription>Start/stop a real-time session and watch the orb react.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between gap-2 rounded-xl border bg-background/60 p-3 text-sm shadow-pop">
          <div className="min-w-0">
            <p className="font-display truncate">{assistant?.name ?? "No assistant selected"}</p>
            <p className="text-xs text-muted-foreground">Status: {statusLabel}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
            <RadioTower className="h-3.5 w-3.5" />
            WebRTC
          </span>
        </div>

        <div className="relative grid place-items-center overflow-hidden rounded-2xl border bg-mesh p-6 shadow-glow">
          <motion.div
            className="absolute inset-0 opacity-80"
            animate={
              reduceMotion
                ? undefined
                : {
                    backgroundPosition: ["0% 0%", "100% 0%", "0% 100%"],
                  }
            }
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            style={{ backgroundImage: "var(--gradient-mesh)", backgroundSize: "200% 200%" }}
          />

          <motion.div
            className="relative grid h-32 w-32 place-items-center rounded-full border bg-background/60 shadow-pop"
            animate={
              reduceMotion
                ? undefined
                : {
                    scale: conversation.status === "connected" ? (conversation.isSpeaking ? [1, 1.1, 1] : [1, 1.04, 1]) : 1,
                    rotate: conversation.status === "connected" ? [0, 3, 0, -3, 0] : 0,
                  }
            }
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
              {conversation.status === "connected" ? <Sparkles className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </div>
          </motion.div>
        </div>

        <div className="grid gap-2">
          {conversation.status === "connected" ? (
            <Button variant="outline" onClick={stop}>
              <MicOff className="h-4 w-4" />
              Stop
            </Button>
          ) : (
            <Button variant="hero" onClick={start} disabled={isConnecting}>
              <Mic className="h-4 w-4" />
              {isConnecting ? "Connecting…" : "Start"}
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        If you get a microphone prompt, allow access to test your assistant.
      </CardFooter>
    </Card>
  );
}
