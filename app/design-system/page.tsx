import type { Metadata } from "next";
import { DesignSystemPreview } from "@/components/design-system/preview";

export const metadata: Metadata = {
  title: "Sistema de diseño",
  description:
    "Colores, tipografías y componentes compartidos para los sitios, contenidos y la administración de Leyer.",
};

export default function DesignSystemPage() {
  return <DesignSystemPreview />;
}
