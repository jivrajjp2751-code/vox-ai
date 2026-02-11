import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mic } from "lucide-react";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(2).max(40).optional(),
});

type AuthValues = z.infer<typeof authSchema>;

export default function Auth() {
  const [params] = useSearchParams();
  const defaultTab = params.get("tab") === "signup" ? "signup" : "login";
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/app", { replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "", displayName: "" },
    mode: "onSubmit",
  });

  const title = useMemo(() => (tab === "login" ? "Welcome back" : "Create your account"), [tab]);
  const subtitle = useMemo(() => (tab === "login" ? "Sign in to manage assistants and test voice live." : "Your assistants live in your private studio."), [tab]);

  async function onSubmit(values: AuthValues) {
    setLoading(true);
    try {
      if (tab === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
        if (error) throw error;
        toast({ title: "Signed in", description: "Taking you to the studio…" });
        navigate("/app", { replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email: values.email, password: values.password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: values.displayName?.trim() || undefined } },
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "Confirm your email address to finish signup, then come back to sign in." });
        setTab("login");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      toast({ variant: "destructive", title: "Auth error", description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-hero" />
      <header className="relative container flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-base font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Mic className="h-3.5 w-3.5" /></span>
          VOXAI
        </Link>
        <Button asChild variant="outline" size="sm"><Link to="/">Back</Link></Button>
      </header>

      <main className="relative container grid place-items-center px-4 py-10">
        <Card className="w-full max-w-md border-border/40 bg-card shadow-card">
          <CardHeader>
            <CardTitle className="font-display">{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              <form className="mt-5 grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
                <TabsContent value="signup" className="m-0 grid gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="displayName">Display name</Label>
                    <Input id="displayName" placeholder="Ava" {...form.register("displayName")} />
                  </div>
                </TabsContent>
                <div className="grid gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@company.com" autoComplete="email" {...form.register("email")} />
                  {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" autoComplete={tab === "login" ? "current-password" : "new-password"} {...form.register("password")} />
                  {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" variant="hero" disabled={loading}>
                  {loading ? "Working…" : tab === "login" ? "Sign in" : "Create account"}
                </Button>
              </form>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-between text-xs text-muted-foreground">
            <span>Voice testing requires microphone permission.</span>
            <Link className="underline underline-offset-4 hover:text-foreground" to="/app">Skip →</Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
