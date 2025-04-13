import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { signInWithEmail } from "@/services/supabase";
import type { UserRole } from "../types/auth";

// This hook is used to bypass authentication in development environments
export const useDevAuth = (options?: { role?: UserRole }) => {
  const { login } = useAuth();
  const [bypassAttempted, setBypassAttempted] = useState(false);
  const [bypassSuccessful, setBypassSuccessful] = useState(false);

  useEffect(() => {
    // Only attempt to bypass login in development mode and if not already attempted
    if (import.meta.env.DEV && !bypassAttempted) {
      // Try these credentials in order until one works
      const credentials = [
        // Admin credentials
        {
          email: "admin@example.com",
          password: "admin123",
          role: "admin" as UserRole,
        },
        // Staff credentials
        {
          email: "staff@example.com",
          password: "staff123",
          role: "staff" as UserRole,
        },
        // Viewer credentials
        {
          email: "viewer@example.com",
          password: "viewer123",
          role: "viewer" as UserRole,
        },
        // Default dev credentials
        {
          email: "dev@example.com",
          password: "devpassword123",
          role: "admin" as UserRole,
        },
        // Test credentials
        {
          email: "test@example.com",
          password: "test123",
          role: "admin" as UserRole,
        },
      ];

      // Filter credentials based on requested role if provided
      const filteredCredentials = options?.role
        ? credentials.filter((cred) => cred.role === options.role)
        : credentials;

      console.log(
        `🔑 DEV MODE: Attempting automatic login with ${options?.role || "any"} credentials`,
      );

      // Try direct Supabase auth first (bypasses any custom validation)
      const tryDirectAuth = async () => {
        for (const cred of filteredCredentials) {
          try {
            console.log(
              `Trying direct auth with ${cred.email} (${cred.role})...`,
            );
            const result = await signInWithEmail(cred.email, cred.password);
            if (!result.error) {
              console.log(
                `🔓 DEV MODE: Direct auth successful with role: ${cred.role}!`,
              );
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
        for (const cred of filteredCredentials) {
          try {
            console.log(
              `Trying regular login with ${cred.email} (${cred.role})...`,
            );
            await login(cred.email, cred.password);
            console.log(
              `🔓 DEV MODE: Regular login successful with role: ${cred.role}!`,
            );
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
              `❌ DEV MODE: All auto-login attempts for ${options?.role || "any"} role failed. Please use the dev-login-bypass storyboard.`,
            );
          }
        }
        setBypassAttempted(true);
      };

      attemptLogin();
    }
  }, [login, bypassAttempted, options?.role]);

  return { bypassAttempted, bypassSuccessful };
};
