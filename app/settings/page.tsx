import { KeyRound, ServerCog } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Configuracoes"
        description="Auth.js e variaveis de ambiente preparadas para habilitar login e deploy no Render."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              Auth.js preparado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>O projeto ja inclui adapter Drizzle e tabelas base para usuarios, contas, sessoes e tokens.</p>
            <p>Adicione provedores em `lib/auth.ts` quando as credenciais forem definidas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ServerCog className="h-4 w-4 text-primary" />
              Render
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Configure `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST` e `NEXT_PUBLIC_APP_URL`.</p>
            <p>Build command: `npm run build`. Start command: `npm run start`.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
