import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { signInWithEmail } from "@/services/supabase";

// This hook is used to bypass authentication in development environments
export const useDevAuth = () => {
  const { login } = useAuth();
  const [bypassAttempted, setBypassAttempted] = useState(false);
  const [bypassSuccessful, setBypassSuccessful] = useState(false);

  useEffect(() => {
    // Only attempt to bypass login in development mode and if not already attempted
    if (import.meta.env.DEV && !bypassAttempted) {
      // Try these credentials in order until one works
      const credentials = [
        { email: "admin@example.com", password: "admin123" },
        { email: "dev@example.com", password: "devpassword123" },
        { email: "test@example.com", password: "test123" },
      ];

      console.log(
        "🔑 DEV MODE: Attempting automatic login with dev credentials",
      );

      // Try direct Supabase auth first (bypasses any custom validation)
      const tryDirectAuth = async () => {
        for (const cred of credentials) {
          try {
            console.log(`Trying direct auth with ${cred.email}...`);
            const { error } = await signInWithEmail(cred.email, cred.password);
            if (!error) {
              console.log("🔓 DEV MODE: Direct auth successful!");
              setBypassSuccessful(true);
              return true;
            }
          } catch (err) {
            console.log(
              `Direct auth with ${cred.email} failed, trying next method...`,
            );
          }
        }
        return false;
      };

      // Then try the regular login method as fallback
      const tryRegularLogin = async () => {
        for (const cred of credentials) {
          try {
            console.log(`Trying regular login with ${cred.email}...`);
            await login(cred.email, cred.password);
            console.log("🔓 DEV MODE: Regular login successful!");
            setBypassSuccessful(true);
            return true;
          } catch (err) {
            console.log(
              `Regular login with ${cred.email} failed, trying next credential...`,
            );
          }
        }
        return false;
      };

      // Execute both methods in sequence
      const attemptLogin = async () => {
        const directSuccess = await tryDirectAuth();
        if (!directSuccess) {
          const regularSuccess = await tryRegularLogin();
          if (!regularSuccess) {
            console.error(
              "❌ DEV MODE: All auto-login attempts failed. Please use the dev-login-bypass storyboard.",
            );
          }
        }
        setBypassAttempted(true);
      };

      attemptLogin();
    }
  }, [login, bypassAttempted]);

  return { bypassAttempted, bypassSuccessful };
};
