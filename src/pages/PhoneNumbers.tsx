import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mic, Plus, Trash2, Phone, LogOut, ArrowLeft, PhoneCall, Link2 } from "lucide-react";

const PROVIDERS = [
  { value: "twilio", label: "Twilio" },
  { value: "vonage", label: "Vonage" },
  { value: "telnyx", label: "Telnyx" },
  { value: "plivo", label: "Plivo" },
  { value: "bandwidth", label: "Bandwidth" },
];

type PhoneNumber = {
  id: string;
  number: string;
  provider: string;
  label: string;
  assistantId: string | null;
  status: "active" | "inactive";
};

type VoiceAssistant = {
  id: string;
  name: string;
};

export default function PhoneNumbers() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [assistants, setAssistants] = useState<VoiceAssistant[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [importProvider, setImportProvider] = useState("twilio");
  const [importNumber, setImportNumber] = useState("");
  const [importLabel, setImportLabel] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionChecked(true);
      if (!data.session) navigate("/auth", { replace: true });
      else {
        // Load assistants
        supabase.from("voice_assistants").select("id, name").then(({ data: rows }) => {
          setAssistants((rows ?? []) as VoiceAssistant[]);
        });
      }
    });
  }, [navigate]);

  const addNumber = useCallback(() => {
    if (!importNumber.trim()) {
      toast({ variant: "destructive", title: "Enter a phone number" });
      return;
    }
    const newNum: PhoneNumber = {
      id: crypto.randomUUID(),
      number: importNumber.trim(),
      provider: importProvider,
      label: importLabel.trim() || importNumber.trim(),
      assistantId: null,
      status: "active",
    };
    setNumbers((prev) => [...prev, newNum]);
    setImportNumber("");
    setImportLabel("");
    setShowImport(false);
    toast({ title: "Number added", description: `${newNum.number} from ${importProvider}` });
  }, [importNumber, importProvider, importLabel, toast]);

  const removeNumber = useCallback((id: string) => {
    setNumbers((prev) => prev.filter((n) => n.id !== id));
    toast({ title: "Number removed" });
  }, [toast]);

  const assignAssistant = useCallback((numberId: string, assistantId: string) => {
    setNumbers((prev) => prev.map((n) => n.id === numberId ? { ...n, assistantId: assistantId || null } : n));
    toast({ title: "Assistant assigned" });
  }, [toast]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  }, [navigate]);

  if (!sessionChecked) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 glass">
        <div className="flex h-12 items-center justify-between px-4">
          <Link to="/app" className="flex items-center gap-2 font-display text-sm font-bold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground"><Mic className="h-3 w-3" /></span>
            VOXAI
          </Link>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" asChild><Link to="/app"><ArrowLeft className="h-3.5 w-3.5" /> Studio</Link></Button>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold">Phone Numbers</h1>
              <p className="text-xs text-muted-foreground">Import numbers from providers and connect them to your assistants.</p>
            </div>
            <Button variant="hero" size="sm" onClick={() => setShowImport(true)}>
              <Plus className="h-3.5 w-3.5" /> Import Number
            </Button>
          </div>

          {/* Import form */}
          {showImport && (
            <Card className="border-border/40 bg-card shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-sm">Import Phone Number</CardTitle>
                <CardDescription className="text-xs">Add a number from your telephony provider.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Provider</Label>
                    <Select value={importProvider} onValueChange={setImportProvider}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PROVIDERS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Phone Number</Label>
                    <Input value={importNumber} onChange={(e) => setImportNumber(e.target.value)} placeholder="+1 (555) 123-4567" className="text-xs" />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Label (optional)</Label>
                  <Input value={importLabel} onChange={(e) => setImportLabel(e.target.value)} placeholder="Sales Line" className="text-xs" />
                </div>
                <div className="flex gap-2">
                  <Button variant="hero" size="sm" onClick={addNumber}><Plus className="h-3.5 w-3.5" /> Add Number</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowImport(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Numbers table */}
          <Card className="border-border/40 bg-card shadow-card">
            <CardContent className="p-0">
              {numbers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-secondary">
                    <Phone className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-display text-sm font-semibold">No phone numbers yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Import a number from Twilio, Vonage, or other providers.</p>
                  <Button variant="hero" size="sm" className="mt-4" onClick={() => setShowImport(true)}>
                    <Plus className="h-3.5 w-3.5" /> Import Number
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Number</TableHead>
                      <TableHead className="text-xs">Provider</TableHead>
                      <TableHead className="text-xs">Label</TableHead>
                      <TableHead className="text-xs">Assistant</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs w-16" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {numbers.map((n) => (
                      <TableRow key={n.id}>
                        <TableCell className="font-mono text-xs">{n.number}</TableCell>
                        <TableCell className="text-xs capitalize">{n.provider}</TableCell>
                        <TableCell className="text-xs">{n.label}</TableCell>
                        <TableCell>
                          <Select value={n.assistantId ?? "none"} onValueChange={(v) => assignAssistant(n.id, v === "none" ? "" : v)}>
                            <SelectTrigger className="h-7 text-[11px]"><SelectValue placeholder="Assign…" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {assistants.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${n.status === "active" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                            <PhoneCall className="h-2.5 w-2.5" /> {n.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeNumber(n.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Provider info */}
          <Card className="border-border/40 bg-card shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-sm flex items-center gap-2"><Link2 className="h-4 w-4" /> Supported Providers</CardTitle>
              <CardDescription className="text-xs">Connect numbers from any of these telephony providers.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {PROVIDERS.map((p) => (
                  <div key={p.value} className="rounded-lg border border-border/30 bg-secondary/30 p-3 text-center">
                    <p className="font-display text-xs font-semibold">{p.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
