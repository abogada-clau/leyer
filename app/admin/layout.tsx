import type { Metadata } from "next";
import { Suspense } from "react";
import { getSelection } from "@/lib/admin/server";
import { AdminFrame } from "@/components/admin/frame";
import "./panel.css";
export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <main
          className="flex min-h-screen items-center justify-center"
          role="status"
        >
          Comprobando tu espacio de trabajo…
        </main>
      }
    >
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </Suspense>
  );
}
async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { context, organization, site } = await getSelection();
  return (
    <AdminFrame
      context={context}
      organizationId={organization?.id}
      siteId={site?.id}
    >
      {children}
    </AdminFrame>
  );
}
