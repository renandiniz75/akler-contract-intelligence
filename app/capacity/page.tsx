import { CapacitySimulator } from "@/components/capacity-simulator";
import { PageHeader } from "@/components/page-header";

export default function CapacityPage() {
  return (
    <>
      <PageHeader
        title="Capacidade de investimento"
        description="Simule se o caixa consolidado da Akler suporta um novo contrato, considerando investimento inicial, prazo do fornecedor e receita recorrente."
      />
      <CapacitySimulator />
    </>
  );
}
