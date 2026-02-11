import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Mic, Plus, Trash2, Phone, LogOut, ArrowLeft, PhoneCall,
  PhoneIncoming, PhoneOutgoing, Settings, Copy, Check, X, Search
} from "lucide-react";
import voxaiLogo from "@/assets/voxai-logo.png";

/* ── Provider config ────────────────────────────────── */
const PROVIDERS = [
  {
    value: "twilio",
    label: "Twilio",
    fields: [
      { key: "accountSid", label: "Account SID", placeholder: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      { key: "authToken", label: "Auth Token", placeholder: "Your Twilio Auth Token", secret: true },
      { key: "phoneNumber", label: "Phone Number", placeholder: "+14155551234" },
    ],
  },
  {
    value: "vonage",
    label: "Vonage",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "Your Vonage API Key" },
      { key: "apiSecret", label: "API Secret", placeholder: "Your Vonage API Secret", secret: true },
      { key: "phoneNumber", label: "Phone Number", placeholder: "+14155551234" },
    ],
  },
  {
    value: "telnyx",
    label: "Telnyx",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "KEY0xxxxxxxxxxxxxxxxxxxxxxxx", secret: true },
      { key: "phoneNumber", label: "Phone Number", placeholder: "+14155551234" },
    ],
  },
  {
    value: "vapi",
    label: "Vapi (Free Number)",
    fields: [
      { key: "phoneNumber", label: "Phone Number", placeholder: "+14155551234" },
    ],
  },
];

type PhoneNumber = {
  id: string;
  number: string;
  provider: string;
  label: string;
  assistantId: string | null;
  inboundEnabled: boolean;
  outboundEnabled: boolean;
  status: "active" | "inactive";
  credentials: Record<string, string>;
  createdAt: string;
};

type VoiceAssistant = { id: string; name: string };

type CallLog = {
  id: string;
  numberId: string;
  direction: "inbound" | "outbound";
  to: string;
  from: string;
  duration: number;
  status: "completed" | "failed" | "in-progress" | "ringing";
  timestamp: string;
  assistantName?: string;
};

export default function PhoneNumbers() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [assistants, setAssistants] = useState<VoiceAssistant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Import dialog state
  const [importOpen, setImportOpen] = useState(false);
  const [importProvider, setImportProvider] = useState("twilio");
  const [importFields, setImportFields] = useState<Record<string, string>>({});
  const [importLabel, setImportLabel] = useState("");

  // Outbound call state
  const [outboundTo, setOutboundTo] = useState("");
  const [outboundAssistant, setOutboundAssistant] = useState("none");
  const [calling, setCalling] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const selectedNumber = numbers.find((n) => n.id === selectedId) ?? null;
  const providerConfig = PROVIDERS.find((p) => p.value === importProvider);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionChecked(true);
      if (!data.session) navigate("/auth", { replace: true });
      else {
        supabase.from("voice_assistants").select("id, name").then(({ data: rows }) => {
          setAssistants((rows ?? []) as VoiceAssistant[]);
        });
      }
    });
  }, [navigate]);

  const importNumber = useCallback(() => {
    const phoneNumber = importFields.phoneNumber?.trim();
    if (!phoneNumber) {
      toast({ variant: "destructive", title: "Phone number is required" });
      return;
    }
    const newNum: PhoneNumber = {
      id: crypto.randomUUID(),
      number: phoneNumber,
      provider: importProvider,
      label: importLabel.trim() || phoneNumber,
      assistantId: null,
      inboundEnabled: true,
      outboundEnabled: true,
      status: "active",
      credentials: { ...importFields },
      createdAt: new Date().toISOString(),
    };
    setNumbers((prev) => [...prev, newNum]);
    setSelectedId(newNum.id);
    setImportFields({});
    setImportLabel("");
    setImportOpen(false);
    toast({ title: "Number imported", description: `${newNum.number} via ${importProvider}` });
  }, [importFields, importProvider, importLabel, toast]);

  const removeNumber = useCallback((id: string) => {
    setNumbers((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
    setCallLogs((prev) => prev.filter((l) => l.numberId !== id));
    toast({ title: "Number removed" });
  }, [selectedId, toast]);

  const updateNumber = useCallback((id: string, updates: Partial<PhoneNumber>) => {
    setNumbers((prev) => prev.map((n) => n.id === id ? { ...n, ...updates } : n));
  }, []);

  const makeOutboundCall = useCallback(() => {
    if (!selectedNumber || !outboundTo.trim()) {
      toast({ variant: "destructive", title: "Enter a destination number" });
      return;
    }
    setCalling(true);
    const log: CallLog = {
      id: crypto.randomUUID(),
      numberId: selectedNumber.id,
      direction: "outbound",
      from: selectedNumber.number,
      to: outboundTo.trim(),
      duration: 0,
      status: "ringing",
      timestamp: new Date().toISOString(),
      assistantName: outboundAssistant !== "none" ? assistants.find((a) => a.id === outboundAssistant)?.name : undefined,
    };
    setCallLogs((prev) => [log, ...prev]);

    // Simulate call progression
    setTimeout(() => {
      setCallLogs((prev) => prev.map((l) => l.id === log.id ? { ...l, status: "in-progress" } : l));
    }, 2000);
    setTimeout(() => {
      setCallLogs((prev) => prev.map((l) => l.id === log.id ? { ...l, status: "completed", duration: Math.floor(Math.random() * 120) + 15 } : l));
      setCalling(false);
      toast({ title: "Call completed", description: `Called ${outboundTo}` });
      setOutboundTo("");
    }, 6000);
  }, [selectedNumber, outboundTo, outboundAssistant, assistants, toast]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  }, [navigate]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredNumbers = numbers.filter((n) =>
    n.number.includes(searchQuery) || n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.provider.includes(searchQuery)
  );

  const numberCallLogs = selectedNumber ? callLogs.filter((l) => l.numberId === selectedNumber.id) : [];

  if (!sessionChecked) {
    return <div className="grid min-h-screen place-items-center bg-background"><p className="text-sm text-muted-foreground">Loading…</p></div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 glass">
        <div className="flex h-12 items-center justify-between px-4">
          <Link to="/app" className="flex items-center gap-2 font-display text-sm font-bold tracking-tight">
            <img src={voxaiLogo} alt="VOXAI" className="h-7 w-7 rounded-lg" />
            VOXAI
          </Link>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" asChild><Link to="/app"><ArrowLeft className="h-3.5 w-3.5" /> Studio</Link></Button>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: Number list */}
        <aside className="w-80 shrink-0 border-r border-border/40 bg-card/50 flex flex-col">
          <div className="border-b border-border/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-display text-xs font-semibold tracking-wide text-muted-foreground uppercase">Phone Numbers</p>
              <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" size="sm"><Plus className="h-3 w-3" /> Import</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-display">Import Phone Number</DialogTitle>
                    <DialogDescription>Connect a number from your telephony provider to use for inbound and outbound calls.</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    {/* Provider selector as cards */}
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Provider</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {PROVIDERS.map((p) => (
                          <button key={p.value} onClick={() => { setImportProvider(p.value); setImportFields({}); }}
                            className={`rounded-lg border px-3 py-2.5 text-left text-xs transition ${importProvider === p.value ? "border-primary/40 bg-primary/5 text-foreground" : "border-border/40 text-muted-foreground hover:border-border"}`}>
                            <span className="font-display font-semibold">{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Dynamic credential fields */}
                    {providerConfig?.fields.map((field) => (
                      <div key={field.key} className="grid gap-1.5">
                        <Label className="text-xs">{field.label}</Label>
                        <Input
                          type={field.secret ? "password" : "text"}
                          value={importFields[field.key] ?? ""}
                          onChange={(e) => setImportFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="text-xs font-mono"
                        />
                      </div>
                    ))}

                    <div className="grid gap-1.5">
                      <Label className="text-xs">Label (optional)</Label>
                      <Input value={importLabel} onChange={(e) => setImportLabel(e.target.value)} placeholder="e.g. Sales Line, Support" className="text-xs" />
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
                    <Button variant="hero" size="sm" onClick={importNumber}><Plus className="h-3 w-3" /> Import Number</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search numbers…" className="h-8 pl-8 text-xs" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredNumbers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-secondary">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="font-display text-xs font-semibold">No numbers yet</p>
                <p className="mt-1 text-[10px] text-muted-foreground">Import from Twilio, Vonage, or others.</p>
              </div>
            ) : (
              <div className="grid gap-1">
                {filteredNumbers.map((n) => (
                  <button key={n.id} onClick={() => setSelectedId(n.id)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left transition ${n.id === selectedId ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/60"}`}>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-xs font-medium">{n.number}</p>
                      <Badge variant={n.status === "active" ? "default" : "secondary"} className="text-[9px] px-1.5 py-0">
                        {n.status}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="text-[10px] capitalize">{n.provider}</span>
                      <span className="text-[10px]">·</span>
                      <span className="text-[10px] truncate">{n.label}</span>
                    </div>
                    <div className="mt-1 flex gap-1">
                      {n.inboundEnabled && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-primary/70"><PhoneIncoming className="h-2.5 w-2.5" /> In</span>
                      )}
                      {n.outboundEnabled && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-accent/70"><PhoneOutgoing className="h-2.5 w-2.5" /> Out</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Right panel: Number detail */}
        <main className="flex-1 overflow-y-auto">
          {!selectedNumber ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-secondary">
                  <Phone className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-display text-sm font-semibold">Select a phone number</p>
                <p className="mt-1 text-xs text-muted-foreground">Or import a new one to get started with inbound & outbound calling.</p>
                <Button variant="hero" size="sm" className="mt-4" onClick={() => setImportOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> Import Number
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 lg:p-6">
              <div className="mx-auto max-w-3xl space-y-6">
                {/* Number header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-display text-lg font-bold">{selectedNumber.label}</h1>
                      <Badge variant={selectedNumber.status === "active" ? "default" : "secondary"} className="text-[10px]">
                        {selectedNumber.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-mono text-sm text-muted-foreground">{selectedNumber.number}</span>
                      <button onClick={() => copyToClipboard(selectedNumber.number, "number")} className="text-muted-foreground hover:text-foreground transition">
                        {copiedId === "number" ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="capitalize">{selectedNumber.provider}</span>
                      <span>·</span>
                      <span>ID: {selectedNumber.id.slice(0, 8)}</span>
                      <button onClick={() => copyToClipboard(selectedNumber.id, "id")} className="text-muted-foreground hover:text-foreground transition">
                        {copiedId === "id" ? <Check className="h-2.5 w-2.5 text-primary" /> : <Copy className="h-2.5 w-2.5" />}
                      </button>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeNumber(selectedNumber.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <Separator />

                {/* Tabs: Inbound / Outbound / Settings / Logs */}
                <Tabs defaultValue="inbound">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="inbound" className="gap-1.5 text-xs"><PhoneIncoming className="h-3 w-3" /> Inbound</TabsTrigger>
                    <TabsTrigger value="outbound" className="gap-1.5 text-xs"><PhoneOutgoing className="h-3 w-3" /> Outbound</TabsTrigger>
                    <TabsTrigger value="logs" className="gap-1.5 text-xs"><PhoneCall className="h-3 w-3" /> Logs</TabsTrigger>
                    <TabsTrigger value="settings" className="gap-1.5 text-xs"><Settings className="h-3 w-3" /> Settings</TabsTrigger>
                  </TabsList>

                  {/* INBOUND TAB */}
                  <TabsContent value="inbound" className="space-y-4 mt-4">
                    <Card className="border-border/40 bg-card shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-sm">Inbound Call Handling</CardTitle>
                        <CardDescription className="text-xs">When someone calls this number, the assigned assistant will answer and handle the conversation.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Enable Inbound</Label>
                          <button onClick={() => updateNumber(selectedNumber.id, { inboundEnabled: !selectedNumber.inboundEnabled })}
                            className={`inline-flex h-5 w-9 items-center rounded-full px-0.5 transition ${selectedNumber.inboundEnabled ? "bg-primary" : "bg-secondary"}`}>
                            <span className={`h-4 w-4 rounded-full bg-background shadow transition-transform ${selectedNumber.inboundEnabled ? "translate-x-4" : "translate-x-0"}`} />
                          </button>
                        </div>

                        <div className="grid gap-1.5">
                          <Label className="text-xs">Assigned Assistant</Label>
                          <Select value={selectedNumber.assistantId ?? "none"} onValueChange={(v) => updateNumber(selectedNumber.id, { assistantId: v === "none" ? null : v })}>
                            <SelectTrigger><SelectValue placeholder="Select assistant…" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No assistant assigned</SelectItem>
                              {assistants.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <p className="text-[10px] text-muted-foreground">The assistant that will handle incoming calls on this number.</p>
                        </div>

                        {selectedNumber.assistantId && selectedNumber.inboundEnabled && (
                          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                            <p className="text-xs font-medium text-primary">✓ Ready for inbound calls</p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                              Calls to {selectedNumber.number} will be answered by "{assistants.find((a) => a.id === selectedNumber.assistantId)?.name}".
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* OUTBOUND TAB */}
                  <TabsContent value="outbound" className="space-y-4 mt-4">
                    <Card className="border-border/40 bg-card shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-sm">Make Outbound Call</CardTitle>
                        <CardDescription className="text-xs">Place a call from this number to any destination. An assistant will handle the conversation.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Enable Outbound</Label>
                          <button onClick={() => updateNumber(selectedNumber.id, { outboundEnabled: !selectedNumber.outboundEnabled })}
                            className={`inline-flex h-5 w-9 items-center rounded-full px-0.5 transition ${selectedNumber.outboundEnabled ? "bg-primary" : "bg-secondary"}`}>
                            <span className={`h-4 w-4 rounded-full bg-background shadow transition-transform ${selectedNumber.outboundEnabled ? "translate-x-4" : "translate-x-0"}`} />
                          </button>
                        </div>

                        {selectedNumber.outboundEnabled && (
                          <>
                            <Separator />
                            <div className="grid gap-1.5">
                              <Label className="text-xs">Destination Number</Label>
                              <Input value={outboundTo} onChange={(e) => setOutboundTo(e.target.value)}
                                placeholder="+1 (555) 987-6543" className="text-xs font-mono" />
                            </div>
                            <div className="grid gap-1.5">
                              <Label className="text-xs">Assistant</Label>
                              <Select value={outboundAssistant} onValueChange={setOutboundAssistant}>
                                <SelectTrigger><SelectValue placeholder="Select assistant…" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No assistant (silent)</SelectItem>
                                  {assistants.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button variant="hero" size="sm" onClick={makeOutboundCall} disabled={calling || !outboundTo.trim()} className="w-full">
                              <PhoneOutgoing className="h-3.5 w-3.5" />
                              {calling ? "Calling…" : `Call from ${selectedNumber.number}`}
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* API reference */}
                    <Card className="border-border/40 bg-card shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-sm">API Reference</CardTitle>
                        <CardDescription className="text-xs">Use the API to programmatically place outbound calls.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-lg bg-secondary/50 p-3 font-mono text-[11px] text-muted-foreground overflow-x-auto">
                          <pre>{`POST /api/calls
{
  "phoneNumberId": "${selectedNumber.id}",
  "assistantId": "${outboundAssistant !== "none" ? outboundAssistant : "<assistant-id>"}",
  "customer": {
    "number": "${outboundTo || "+1XXXXXXXXXX"}"
  }
}`}</pre>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* LOGS TAB */}
                  <TabsContent value="logs" className="space-y-4 mt-4">
                    <Card className="border-border/40 bg-card shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-sm">Call Logs</CardTitle>
                        <CardDescription className="text-xs">Recent calls on this number.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {numberCallLogs.length === 0 ? (
                          <div className="py-8 text-center">
                            <PhoneCall className="mx-auto h-8 w-8 text-muted-foreground/40" />
                            <p className="mt-2 text-xs text-muted-foreground">No calls yet on this number.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {numberCallLogs.map((log) => (
                              <div key={log.id} className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2">
                                <div className="flex items-center gap-2">
                                  {log.direction === "inbound" ? (
                                    <PhoneIncoming className="h-3.5 w-3.5 text-primary" />
                                  ) : (
                                    <PhoneOutgoing className="h-3.5 w-3.5 text-accent" />
                                  )}
                                  <div>
                                    <p className="font-mono text-xs">{log.direction === "inbound" ? log.from : log.to}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {log.direction} · {log.assistantName ?? "No assistant"} · {new Date(log.timestamp).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge variant={log.status === "completed" ? "default" : log.status === "failed" ? "destructive" : "secondary"} className="text-[9px]">
                                    {log.status}
                                  </Badge>
                                  {log.duration > 0 && (
                                    <p className="mt-0.5 text-[10px] text-muted-foreground">{Math.floor(log.duration / 60)}m {log.duration % 60}s</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* SETTINGS TAB */}
                  <TabsContent value="settings" className="space-y-4 mt-4">
                    <Card className="border-border/40 bg-card shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-sm">Number Settings</CardTitle>
                        <CardDescription className="text-xs">Configure this phone number's properties.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Label</Label>
                          <Input value={selectedNumber.label} onChange={(e) => updateNumber(selectedNumber.id, { label: e.target.value })}
                            className="text-xs" />
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Status</Label>
                          <Select value={selectedNumber.status} onValueChange={(v) => updateNumber(selectedNumber.id, { status: v as "active" | "inactive" })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Number ID</Label>
                          <div className="flex items-center gap-2">
                            <Input value={selectedNumber.id} readOnly className="text-xs font-mono text-muted-foreground" />
                            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(selectedNumber.id, "settings-id")}>
                              {copiedId === "settings-id" ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>

                        <Separator />

                        <div className="grid gap-1.5">
                          <Label className="text-xs text-destructive">Danger Zone</Label>
                          <Button variant="outline" size="sm" className="w-fit border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => removeNumber(selectedNumber.id)}>
                            <Trash2 className="h-3 w-3" /> Delete Number
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
