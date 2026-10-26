import { ArrowRight, ArrowUpRight, BookOpenCheck, Check, Coins, FileCheck2, FileText, HeartHandshake, House, MessageCircle, Scale, Users, WalletCards } from "lucide-react";
const icons = { "arrow-right": ArrowRight, "arrow-up-right": ArrowUpRight, "book-open-check": BookOpenCheck, check: Check, coins: Coins, "file-check": FileCheck2, "file-text": FileText, "heart-handshake": HeartHandshake, house: House, "message-circle": MessageCircle, scale: Scale, users: Users, "wallet-cards": WalletCards };
export function ContentIcon({ name, size = 20 }: { name: unknown; size?: number }) {
  const Icon = typeof name === "string" && Object.hasOwn(icons, name) ? icons[name as keyof typeof icons] : null;
  return Icon ? <Icon size={size} strokeWidth={1.4} aria-hidden /> : null;
}
