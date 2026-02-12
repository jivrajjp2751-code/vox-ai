import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { auth } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AudioWaveform, ChevronRight, Eye, EyeOff } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.union([z.string().min(2, "Name must be at least 2 characters"), z.literal("")]).optional(),
});

type AuthValues = z.infer<typeof authSchema>;

export default function Auth() {
  const [params] = useSearchParams();
  const defaultTab = params.get("tab") === "signup" ? "signup" : "login";
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    auth.getSession().then(({ session }) => {
      if (session) navigate("/app", { replace: true });
    });
  }, [navigate]);

  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "", displayName: "" },
    mode: "onSubmit",
  });

  async function onSubmit(values: AuthValues) {
    setLoading(true);
    try {
      if (tab === "login") {
        await auth.signIn(values.email, values.password, rememberMe);
        toast({ title: "Welcome back!", description: "Accessing your business dashboard..." });
        navigate("/app", { replace: true });
      } else {
        await auth.signUp(values.email, values.password, values.displayName?.trim(), rememberMe);
        toast({ title: "Success!", description: "Your business account has been created." });
        navigate("/app", { replace: true });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      if (message.includes("Invalid email or password")) {
        toast({ variant: "destructive", title: "Login Failed", description: "The email or password you entered is incorrect. Please try again or create a new account." });
      } else if (message.includes("User already exists")) {
        toast({ title: "Account Exists", description: "You already have an account. Please sign in instead." });
        setTab("login");
      } else {
        toast({ variant: "destructive", title: "Error", description: message });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg">
              <AudioWaveform className="h-5 w-5" />
            </div>
            VOX AI
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            {tab === "login" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tab === "login" ? "Enter your email to sign in to your business account" : "Enter your email below to create your business account"}
          </p>
        </div>

        <Card className="border-border/40 shadow-xl bg-card">
          <CardContent className="pt-6">
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 h-10">
                <TabsTrigger value="login" className="font-semibold">Login</TabsTrigger>
                <TabsTrigger value="signup" className="font-semibold">Sign Up</TabsTrigger>
              </TabsList>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {tab === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Business Name</Label>
                    <Input id="displayName" placeholder="Acme Corp" {...form.register("displayName")} className="bg-background" />
                    {form.formState.errors.displayName && <p className="text-xs text-destructive">{form.formState.errors.displayName.message}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" {...form.register("email")} className="bg-background" />
                  {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {tab === "login" && <Link to="#" className="text-xs text-primary hover:underline">Forgot password?</Link>}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...form.register("password")}
                      className="bg-background pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>

                <Button type="submit" className="w-full font-bold" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Processing...</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {tab === "login" ? "Sign In" : "Create Account"} <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link to="#" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="#" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
