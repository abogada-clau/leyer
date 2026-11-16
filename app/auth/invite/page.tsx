import type { Metadata } from "next";
import { AcceptInvitation } from "@/components/auth-accept-invitation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Invitación al panel",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function Invite() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Invitación al panel</CardTitle>
          <CardDescription>Acepta la invitación para crear tu contraseña.</CardDescription>
        </CardHeader>
        <CardContent><AcceptInvitation /></CardContent>
      </Card>
    </main>
  );
}
