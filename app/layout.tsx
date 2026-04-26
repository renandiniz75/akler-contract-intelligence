import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BarChart3, Banknote, Building2, Coins, FileSpreadsheet, FileText, Gauge, Settings, Target, WalletCards } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Akler Contract Intelligence",
  description: "Public-sector contract, CAPEX, OPEX and cash-flow intelligence for Akler."
};

const navigation: Array<{ href: Route; label: string; icon: LucideIcon }> = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/contracts", label: "Contratos", icon: FileText },
  { href: "/capacity", label: "Capacidade", icon: Target },
  { href: "/cfo-model", label: "Modelo CFO", icon: FileSpreadsheet },
  { href: "/capex", label: "CAPEX", icon: Building2 },
  { href: "/opex", label: "OPEX", icon: WalletCards },
  { href: "/revenue", label: "Receita", icon: Banknote },
  { href: "/cash-flow", label: "Fluxo", icon: BarChart3 },
  { href: "/settings", label: "Auth", icon: Settings }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen">
          <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white lg:block">
            <div className="flex h-16 items-center gap-3 border-b px-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Akler</p>
                <p className="text-xs text-muted-foreground">Contract Intelligence</p>
              </div>
            </div>
            <nav className="grid gap-1 p-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="lg:pl-64">
            <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
              <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                <div>
                  <p className="text-sm font-semibold">Akler Contract Intelligence</p>
                  <p className="text-xs text-muted-foreground">Contratos publicos, CAPEX, OPEX e caixa</p>
                </div>
                <div className="hidden rounded-md border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground sm:block">
                  MVP operacional
                </div>
              </div>
              <nav className="flex gap-1 overflow-x-auto border-t px-3 py-2 lg:hidden">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </header>
            <main className="px-4 py-6 sm:px-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
