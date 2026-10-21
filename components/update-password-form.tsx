"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [checkingLink, setCheckingLink] = useState(true);
  useEffect(() => {
    let active = true;
    async function acceptLink() {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      try {
        if (hash.get("error_description"))
          throw new Error(hash.get("error_description")!);
        if (accessToken && refreshToken) {
          // Auth admin invitations use implicit callback tokens by default, while
          // the SSR client uses PKCE. Install the verified session explicitly.
          const supabase = createClient({ detectSessionInUrl: false });
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search,
          );
        }
        const params = new URLSearchParams(window.location.search);
        if (params.has("code")) {
          window.location.replace(
            `/auth/callback?code=${encodeURIComponent(params.get("code")!)}&next=/auth/update-password`,
          );
          return;
        }
      } catch (e) {
        if (active)
          setError(
            e instanceof Error
              ? e.message
              : "No se pudo aceptar el enlace. Solicita uno nuevo.",
          );
      } finally {
        if (active) setCheckingLink(false);
      }
    }
    void acceptLink();
    return () => {
      active = false;
    };
  }, []);

  const handleForgotPassword = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/admin");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la contraseña.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Cambiar contraseña</CardTitle>
          <CardDescription>
            Elige una contraseña para acceder a tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Nueva contraseña"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <div
                  role="alert"
                  className="space-y-2 text-sm text-destructive"
                >
                  <p>{error}</p>
                  <Link className="underline" href="/auth/forgot-password">
                    Solicitar un enlace nuevo
                  </Link>
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || checkingLink}
              >
                {checkingLink
                  ? "Comprobando enlace…"
                  : isLoading
                    ? "Guardando…"
                    : "Guardar contraseña"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
