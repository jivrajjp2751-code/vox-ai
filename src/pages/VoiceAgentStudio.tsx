import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { VoicePlayground } from "@/components/voice/VoicePlayground";
import { Mic, Plus, Save, LogOut, Sparkles } from "lucide-react";

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
  system_prompt:
    "You are a friendly voice assistant. Keep responses short, ask clarifying questions, and be helpful. If you don't know, say so.",
  language: "en",
  conversation_mode: "friendly",
  temperature: 0.7,
  voice_provider: "elevenlabs",
  voice_id: null,
  voice_speed: 1.0,
  tools: { agentId: "" },
});

export default function VoiceAgentStudio() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [assistants, setAssistants] = useState<VoiceAssistantRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<VoiceAssistantRow>>(defaultAssistantDraft());
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const activeAssistant = useMemo(() => assistants.find((a) => a.id === activeId) ?? null, [assistants, activeId]);

  const load = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("voice_assistants")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      const rows = (data ?? []) as unknown as VoiceAssistantRow[];
      setAssistants(rows);
      if (!activeId && rows[0]) setActiveId(rows[0].id);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load assistants";
      toast({ variant: "destructive", title: "Load error", description: message });
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

    // initial fetch
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
    setDraft({
      ...activeAssistant,
      tools: activeAssistant.tools ?? { agentId: "" },
    });
  }, [activeAssistant]);

  const createAssistant = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const payload = {
        user_id: userId,
        ...defaultAssistantDraft(),
        name: `Assistant ${assistants.length + 1}`,
      };
      const { data, error } = await supabase.from("voice_assistants").insert(payload).select("*").maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("No assistant returned");
      const row = data as unknown as VoiceAssistantRow;
      setAssistants((prev) => [row, ...prev]);
      setActiveId(row.id);
      toast({ title: "Assistant created", description: "Customize it and hit Start in the playground." });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to create assistant";
      toast({ variant: "destructive", title: "Create error", description: message });
    } finally {
      setLoading(false);
    }
  }, [userId, assistants.length, toast]);

  const saveAssistant = useCallback(async () => {
    if (!activeId) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("voice_assistants")
        .update({
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
        })
        .eq("id", activeId);

      if (error) throw error;
      toast({ title: "Saved", description: "Assistant updated." });
      // reload list for updated_at ordering
      if (userId) await load(userId);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to save assistant";
      toast({ variant: "destructive", title: "Save error", description: message });
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
      <div className="min-h-screen bg-hero">
        <div className="container grid min-h-screen place-items-center">
          <Card className="w-full max-w-md bg-background/70 shadow-pop backdrop-blur">
            <CardHeader>
              <CardTitle className="font-display">Loading studio…</CardTitle>
              <CardDescription>Checking your session.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
              <Mic className="h-4 w-4" />
            </span>
            <span>Studio</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="hero" size="sm" onClick={createAssistant} disabled={loading}>
              <Plus className="h-4 w-4" />
              New
            </Button>
            <Button variant="playful" size="sm" onClick={saveAssistant} disabled={loading || !activeId}>
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container grid gap-6 py-6 lg:grid-cols-12">
        <section className="lg:col-span-4">
          <Card className="bg-background/70 shadow-pop backdrop-blur">
            <CardHeader>
              <CardTitle className="font-display">Your assistants</CardTitle>
              <CardDescription>Pick one to edit and test live.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {assistants.length === 0 ? (
                <div className="rounded-xl border bg-background/60 p-4 text-sm text-muted-foreground">
                  No assistants yet. Click <span className="font-medium text-foreground">New</span> to create your first.
                </div>
              ) : (
                assistants.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setActiveId(a.id)}
                    className={
                      "w-full rounded-xl border bg-background/60 p-3 text-left shadow-pop transition hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                      (a.id === activeId ? "ring-2 ring-ring" : "")
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display tracking-tight">{a.name}</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                        {a.conversation_mode}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.description || "No description"}</p>
                  </button>
                ))
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Saved per-user in your backend database.
            </CardFooter>
          </Card>
        </section>

        <section className="lg:col-span-5">
          <Card className="bg-background/70 shadow-pop backdrop-blur">
            <CardHeader>
              <CardTitle className="font-display">Assistant builder</CardTitle>
              <CardDescription>Prompt + voice settings + runtime agent id.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={draft.name ?? ""} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
                  value={draft.description ?? ""}
                  onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="prompt">System prompt</Label>
                <Textarea
                  id="prompt"
                  value={draft.system_prompt ?? ""}
                  onChange={(e) => setDraft((p) => ({ ...p, system_prompt: e.target.value }))}
                  className="min-h-[160px]"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="agentId">ElevenLabs Agent ID (public)</Label>
                <Input
                  id="agentId"
                  placeholder="Paste your Agent ID"
                  value={(draft.tools?.agentId as string) ?? ""}
                  onChange={(e) => setDraft((p) => ({ ...p, tools: { ...(p.tools ?? {}), agentId: e.target.value } }))}
                />
                <p className="text-xs text-muted-foreground">
                  For v1 we connect directly with a public Agent ID. Next we can secure this with backend token generation.
                </p>
              </div>

              <Separator />
              <div className="grid gap-2">
                <Label htmlFor="lang">Language (ISO code)</Label>
                <Input
                  id="lang"
                  value={draft.language ?? "en"}
                  onChange={(e) => setDraft((p) => ({ ...p, language: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mode">Conversation mode</Label>
                <Input
                  id="mode"
                  value={draft.conversation_mode ?? "neutral"}
                  onChange={(e) => setDraft((p) => ({ ...p, conversation_mode: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="temp">Temperature</Label>
                <Input
                  id="temp"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={String(draft.temperature ?? 0.7)}
                  onChange={(e) => setDraft((p) => ({ ...p, temperature: Number(e.target.value) }))}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <p className="text-xs text-muted-foreground">Tip: Save, then start the playground.</p>
              <Button variant="playful" size="sm" onClick={saveAssistant} disabled={loading || !activeId}>
                <Save className="h-4 w-4" />
                Save
              </Button>
            </CardFooter>
          </Card>
        </section>

        <section className="lg:col-span-3">
          <VoicePlayground
            assistant={
              activeAssistant
                ? {
                    name: activeAssistant.name,
                    systemPrompt: activeAssistant.system_prompt,
                    language: activeAssistant.language,
                    conversationMode: activeAssistant.conversation_mode,
                    temperature: activeAssistant.temperature,
                    agentId: (activeAssistant.tools as any)?.agentId as string | undefined,
                  }
                : null
            }
          />
        </section>
      </main>
    </div>
  );
}
