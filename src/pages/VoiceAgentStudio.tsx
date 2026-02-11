import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

import { VoicePlayground } from "@/components/voice/VoicePlayground";
import { Mic, Plus, Save, LogOut, Sparkles, Trash2, Brain, AudioWaveform, Languages, Wrench } from "lucide-react";

type VoiceAssistantRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  language: string;
  conversation_mode: string;
  temperature: number;
  voice_provider: string;
  voice_id: string | null;
  voice_speed: number;
  tools: any;
  created_at: string;
  updated_at: string;
};

const defaultAssistantDraft = (): Partial<VoiceAssistantRow> => ({
  name: "New assistant",
  description: "",
  system_prompt: "You are a friendly voice assistant. Keep responses short, ask clarifying questions, and be helpful.",
  language: "en",
  conversation_mode: "friendly",
  temperature: 0.7,
  voice_provider: "elevenlabs",
  voice_id: "JBFqnCBsd6RMkjVDRZzb",
  voice_speed: 1.0,
  tools: { agentId: "", model: "gpt-4o", transcriber: "deepgram", functions: [] as string[] },
});

const MODELS = [
  { value: "gpt-4o", label: "OpenAI GPT-4o" },
  { value: "gpt-4o-mini", label: "OpenAI GPT-4o Mini" },
  { value: "gpt-3.5-turbo", label: "OpenAI GPT-3.5 Turbo" },
  { value: "claude-3.5-sonnet", label: "Anthropic Claude 3.5 Sonnet" },
  { value: "claude-3-haiku", label: "Anthropic Claude 3 Haiku" },
  { value: "gemini-2.5-flash", label: "Google Gemini 2.5 Flash" },
  { value: "gemini-2.5-pro", label: "Google Gemini 2.5 Pro" },
  { value: "llama-3.1-70b", label: "Meta Llama 3.1 70B" },
];

const VOICES = [
  { value: "JBFqnCBsd6RMkjVDRZzb", label: "George — warm, authoritative" },
  { value: "EXAVITQu4vr4xnSDxMaL", label: "Sarah — clear, professional" },
  { value: "CwhRBWXzGAHq8TQ4Fs17", label: "Roger — calm, narrator" },
  { value: "FGY2WhTYpPnrIDTdsKH5", label: "Laura — gentle, friendly" },
  { value: "IKne3meq5aSn9XLyUdCD", label: "Charlie — energetic, youthful" },
  { value: "pFZP5JQG7iQjIQuC4Bku", label: "Lily — soft, warm" },
  { value: "onwK4e9ZLuTAKqWW03F9", label: "Daniel — deep, confident" },
  { value: "iP95p4xoKVk53GoZ742B", label: "Chris — casual, conversational" },
];

const TRANSCRIBERS = [
  { value: "deepgram", label: "Deepgram Nova-2" },
  { value: "assembly-ai", label: "AssemblyAI" },
  { value: "whisper", label: "OpenAI Whisper" },
  { value: "google-stt", label: "Google Cloud STT" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "hi", label: "Hindi" },
  { value: "ar", label: "Arabic" },
];

const MODES = [
  { value: "friendly", label: "Friendly" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "neutral", label: "Neutral" },
  { value: "professional", label: "Professional" },
];

const FUNCTIONS = [
  { value: "webhook", label: "Webhook POST" },
  { value: "crm-update", label: "CRM Update" },
  { value: "calendar-book", label: "Calendar Booking" },
  { value: "knowledge-lookup", label: "Knowledge Base Lookup" },
  { value: "send-email", label: "Send Email" },
  { value: "transfer-call", label: "Transfer Call" },
];

export default function VoiceAgentStudio() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [assistants, setAssistants] = useState<VoiceAssistantRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<VoiceAssistantRow>>(defaultAssistantDraft());
  const [loading, setLoading] = useState(false);
  const [builderTab, setBuilderTab] = useState("model");

  const navigate = useNavigate();
  const { toast } = useToast();

  const activeAssistant = useMemo(() => assistants.find((a) => a.id === activeId) ?? null, [assistants, activeId]);

  const tools = useMemo(() => (draft.tools ?? {}) as Record<string, any>, [draft.tools]);
  const setTool = useCallback((key: string, val: any) => {
    setDraft((p) => ({ ...p, tools: { ...(p.tools ?? {}), [key]: val } }));
  }, []);

  const load = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("voice_assistants").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as unknown as VoiceAssistantRow[];
      setAssistants(rows);
      if (rows[0] && !activeId) setActiveId(rows[0].id);
    } catch (e: unknown) {
      toast({ variant: "destructive", title: "Load error", description: e instanceof Error ? e.message : "Failed" });
    } finally {
      setLoading(false);
    }
  }, [toast, activeId]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      setSessionChecked(true);
      if (!session) navigate("/auth", { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      setSessionChecked(true);
      if (!uid) navigate("/auth", { replace: true });
      else load(uid);
    });
    return () => data.subscription.unsubscribe();
  }, [navigate, load]);

  useEffect(() => {
    if (!activeAssistant) return;
    setDraft({ ...activeAssistant, tools: activeAssistant.tools ?? defaultAssistantDraft().tools });
  }, [activeAssistant]);

  const createAssistant = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const payload = { user_id: userId, ...defaultAssistantDraft(), name: `Assistant ${assistants.length + 1}` };
      const { data, error } = await supabase.from("voice_assistants").insert(payload).select("*").maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("No data");
      const row = data as unknown as VoiceAssistantRow;
      setAssistants((p) => [row, ...p]);
      setActiveId(row.id);
      toast({ title: "Created" });
    } catch (e: unknown) {
      toast({ variant: "destructive", title: "Error", description: e instanceof Error ? e.message : "Failed" });
    } finally {
      setLoading(false);
    }
  }, [userId, assistants.length, toast]);

  const deleteAssistant = useCallback(async () => {
    if (!activeId) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("voice_assistants").delete().eq("id", activeId);
      if (error) throw error;
      setAssistants((p) => p.filter((a) => a.id !== activeId));
      setActiveId(null);
      toast({ title: "Deleted" });
    } catch (e: unknown) {
      toast({ variant: "destructive", title: "Error", description: e instanceof Error ? e.message : "Failed" });
    } finally {
      setLoading(false);
    }
  }, [activeId, toast]);

  const saveAssistant = useCallback(async () => {
    if (!activeId) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("voice_assistants").update({
        name: draft.name ?? "Untitled",
        description: draft.description ?? null,
        system_prompt: draft.system_prompt ?? "",
        language: draft.language ?? "en",
        conversation_mode: draft.conversation_mode ?? "neutral",
        temperature: Number(draft.temperature ?? 0.7),
        voice_provider: draft.voice_provider ?? "elevenlabs",
        voice_id: draft.voice_id ?? null,
        voice_speed: Number(draft.voice_speed ?? 1.0),
        tools: draft.tools ?? {},
      }).eq("id", activeId);
      if (error) throw error;
      toast({ title: "Saved" });
      if (userId) await load(userId);
    } catch (e: unknown) {
      toast({ variant: "destructive", title: "Error", description: e instanceof Error ? e.message : "Failed" });
    } finally {
      setLoading(false);
    }
  }, [activeId, draft, toast, userId, load]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  }, [navigate]);

  if (!sessionChecked) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Loading studio…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 glass">
        <div className="flex h-12 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-sm font-bold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground"><Mic className="h-3 w-3" /></span>
            VOXAI Studio
          </Link>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={createAssistant} disabled={loading}><Plus className="h-3.5 w-3.5" /> New</Button>
            <Button variant="hero" size="sm" onClick={saveAssistant} disabled={loading || !activeId}><Save className="h-3.5 w-3.5" /> Save</Button>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: assistant list */}
        <aside className="hidden w-64 shrink-0 border-r border-border/40 bg-card/50 lg:block">
          <div className="flex h-full flex-col">
            <div className="border-b border-border/30 px-4 py-3">
              <p className="font-display text-xs font-semibold tracking-wide text-muted-foreground uppercase">Assistants</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {assistants.length === 0 ? (
                <p className="px-2 py-4 text-xs text-muted-foreground">No assistants yet.</p>
              ) : (
                <div className="grid gap-1">
                  {assistants.map((a) => (
                    <button key={a.id} onClick={() => setActiveId(a.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-secondary/60 ${a.id === activeId ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"}`}>
                      <p className="font-display text-xs font-medium truncate">{a.name}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground truncate">{a.conversation_mode} · {a.language}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Builder */}
        <main className="flex flex-1 flex-col overflow-y-auto lg:flex-row">
          <section className="flex-1 overflow-y-auto border-r border-border/30 p-4 lg:p-6">
            {!activeId ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Select or create an assistant to get started.</p>
                  <Button variant="hero" size="sm" className="mt-3" onClick={createAssistant} disabled={loading}>
                    <Plus className="h-3.5 w-3.5" /> Create Assistant
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl">
                {/* Name & description */}
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <Input value={draft.name ?? ""} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                      className="border-none bg-transparent px-0 font-display text-lg font-bold focus-visible:ring-0" placeholder="Assistant name" />
                    <Input value={draft.description ?? ""} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                      className="mt-1 border-none bg-transparent px-0 text-xs text-muted-foreground focus-visible:ring-0" placeholder="Short description…" />
                  </div>
                  <Button variant="ghost" size="icon" onClick={deleteAssistant} disabled={loading} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <Separator className="mb-5" />

                {/* Tabbed builder — Vapi style */}
                <Tabs value={builderTab} onValueChange={setBuilderTab}>
                  <TabsList className="mb-4 grid w-full grid-cols-5">
                    <TabsTrigger value="model" className="gap-1.5 text-xs"><Brain className="h-3 w-3" /> Model</TabsTrigger>
                    <TabsTrigger value="voice" className="gap-1.5 text-xs"><AudioWaveform className="h-3 w-3" /> Voice</TabsTrigger>
                    <TabsTrigger value="transcriber" className="gap-1.5 text-xs"><Languages className="h-3 w-3" /> Transcriber</TabsTrigger>
                    <TabsTrigger value="functions" className="gap-1.5 text-xs"><Wrench className="h-3 w-3" /> Functions</TabsTrigger>
                    <TabsTrigger value="advanced" className="gap-1.5 text-xs"><Sparkles className="h-3 w-3" /> Advanced</TabsTrigger>
                  </TabsList>

                  {/* MODEL TAB */}
                  <TabsContent value="model" className="space-y-4">
                    <Card className="border-border/40 bg-card shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-sm">LLM Provider</CardTitle>
                        <CardDescription className="text-xs">Choose the model that powers your assistant's intelligence.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Model</Label>
                          <Select value={tools.model ?? "gpt-4o"} onValueChange={(v) => setTool("model", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {MODELS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">System Prompt</Label>
                          <Textarea value={draft.system_prompt ?? ""} onChange={(e) => setDraft((p) => ({ ...p, system_prompt: e.target.value }))}
                            className="min-h-[120px] text-xs" placeholder="You are a helpful assistant…" />
                        </div>
                        <div className="grid gap-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Temperature</Label>
                            <span className="text-xs text-muted-foreground">{(draft.temperature ?? 0.7).toFixed(1)}</span>
                          </div>
                          <Slider value={[draft.temperature ?? 0.7]} onValueChange={([v]) => setDraft((p) => ({ ...p, temperature: v }))}
                            min={0} max={2} step={0.1} className="w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* VOICE TAB */}
                  <TabsContent value="voice" className="space-y-4">
                    <Card className="border-border/40 bg-card shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-sm">Voice Configuration</CardTitle>
                        <CardDescription className="text-xs">Select the voice and tune its characteristics.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Voice Provider</Label>
                          <Select value={draft.voice_provider ?? "elevenlabs"} onValueChange={(v) => setDraft((p) => ({ ...p, voice_provider: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                              <SelectItem value="openai-tts">OpenAI TTS</SelectItem>
                              <SelectItem value="playht">PlayHT</SelectItem>
                              <SelectItem value="deepgram-tts">Deepgram Aura</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Voice Preset</Label>
                          <Select value={draft.voice_id ?? ""} onValueChange={(v) => setDraft((p) => ({ ...p, voice_id: v }))}>
                            <SelectTrigger><SelectValue placeholder="Select a voice" /></SelectTrigger>
                            <SelectContent>
                              {VOICES.map((v) => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Custom Voice ID</Label>
                          <Input value={draft.voice_id ?? ""} onChange={(e) => setDraft((p) => ({ ...p, voice_id: e.target.value }))}
                            placeholder="Paste any ElevenLabs / provider voice ID" className="text-xs font-mono" />
                          <p className="text-[10px] text-muted-foreground">Override the preset above with any voice ID from your provider.</p>
                        </div>
                        <div className="grid gap-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Speed</Label>
                            <span className="text-xs text-muted-foreground">{(draft.voice_speed ?? 1.0).toFixed(1)}x</span>
                          </div>
                          <Slider value={[draft.voice_speed ?? 1.0]} onValueChange={([v]) => setDraft((p) => ({ ...p, voice_speed: v }))}
                            min={0.5} max={2.0} step={0.1} className="w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* TRANSCRIBER TAB */}
                  <TabsContent value="transcriber" className="space-y-4">
                    <Card className="border-border/40 bg-card shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-sm">Speech-to-Text</CardTitle>
                        <CardDescription className="text-xs">Choose a transcription provider for real-time STT.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Transcriber</Label>
                          <Select value={tools.transcriber ?? "deepgram"} onValueChange={(v) => setTool("transcriber", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {TRANSCRIBERS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Language</Label>
                          <Select value={draft.language ?? "en"} onValueChange={(v) => setDraft((p) => ({ ...p, language: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* FUNCTIONS TAB */}
                  <TabsContent value="functions" className="space-y-4">
                    <Card className="border-border/40 bg-card shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-sm">Tool Calling & Functions</CardTitle>
                        <CardDescription className="text-xs">Enable actions your assistant can perform during conversations.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2">
                          {FUNCTIONS.map((fn) => {
                            const enabled = ((tools.functions ?? []) as string[]).includes(fn.value);
                            return (
                              <button key={fn.value} onClick={() => {
                                const prev = (tools.functions ?? []) as string[];
                                setTool("functions", enabled ? prev.filter((f: string) => f !== fn.value) : [...prev, fn.value]);
                              }}
                                className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-xs transition ${enabled ? "border-primary/30 bg-primary/5 text-foreground" : "border-border/40 text-muted-foreground hover:border-border"}`}>
                                <span>{fn.label}</span>
                                <span className={`inline-flex h-5 w-9 items-center rounded-full px-0.5 transition ${enabled ? "bg-primary" : "bg-secondary"}`}>
                                  <span className={`h-4 w-4 rounded-full bg-background shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`} />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ADVANCED TAB */}
                  <TabsContent value="advanced" className="space-y-4">
                    <Card className="border-border/40 bg-card shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-sm">Advanced Settings</CardTitle>
                        <CardDescription className="text-xs">Runtime configuration and deployment options.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Conversation Mode</Label>
                          <Select value={draft.conversation_mode ?? "neutral"} onValueChange={(v) => setDraft((p) => ({ ...p, conversation_mode: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {MODES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">First Message</Label>
                          <Input value={tools.firstMessage ?? ""} onChange={(e) => setTool("firstMessage", e.target.value)}
                            placeholder="Hi! How can I help you today?" className="text-xs" />
                          <p className="text-[10px] text-muted-foreground">The greeting your assistant says when a conversation starts.</p>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Max Duration (seconds)</Label>
                          <Input type="number" value={tools.maxDuration ?? 300} onChange={(e) => setTool("maxDuration", Number(e.target.value))}
                            className="text-xs" min={30} max={3600} />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </section>

          {/* Voice playground sidebar */}
          <aside className="w-full shrink-0 overflow-y-auto border-t border-border/30 p-4 lg:w-80 lg:border-t-0 lg:p-4">
            <VoicePlayground
              assistant={
                activeAssistant
                  ? {
                      name: activeAssistant.name,
                      systemPrompt: activeAssistant.system_prompt,
                      language: activeAssistant.language,
                      conversationMode: activeAssistant.conversation_mode,
                      temperature: activeAssistant.temperature,
                      voiceId: activeAssistant.voice_id ?? undefined,
                      voiceProvider: activeAssistant.voice_provider,
                    }
                  : null
              }
            />
          </aside>
        </main>
      </div>
    </div>
  );
}
