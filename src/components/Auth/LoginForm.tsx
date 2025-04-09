import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { AlertCircle, Loader2, Mail, Lock } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

const LoginForm = ({ onSuccess, redirectTo = "/" }: LoginFormProps) => {
  const { login, isLoading, error, clearError, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // If user is already logged in, redirect
  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting to", redirectTo);
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, redirectTo]);

  // Clear errors when form inputs change
  useEffect(() => {
    if (email || password) {
      setFormError(null);
      clearError();
    }
  }, [email, password, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    // Basic validation
    if (!email.trim()) {
      setFormError("Email is required");
      return;
    }

    if (!password.trim()) {
      setFormError("Password is required");
      return;
    }

    try {
      const result = await login(email, password);
      if (result.success) {
        console.log("Login successful, redirecting to", redirectTo);
        if (onSuccess) {
          onSuccess();
        } else {
          // Use replace: true to prevent going back to login page
          navigate(redirectTo, { replace: true });
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      // Error is already set in the useAuth hook
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={`pl-10 ${formError && !email.trim() ? "border-destructive" : ""}`}
              />
            </div>
            {formError && !email.trim() && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {formError}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={`pl-10 ${formError && !password.trim() ? "border-destructive" : ""}`}
              />
            </div>
            {formError && !password.trim() && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {formError}
              </p>
            )}
          </div>
          {(error || formError) && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {error || formError}
              </p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => navigate("/signup")}
            disabled={isLoading}
          >
            Sign up
          </Button>
        </div>
        {import.meta.env.DEV && (
          <div className="text-xs text-center text-muted-foreground mt-2 pt-2 border-t border-border">
            <p>
              Development Mode: Use the dev login bypass at
              /tempobook/storyboards/dev-login-bypass
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
