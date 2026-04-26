import type { Capex, Contract, ContractDocument, ContractItem, Opex, Revenue } from "@/lib/types";

export const contracts: Contract[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    city: "Linhares",
    agency: "Prefeitura Municipal de Linhares",
    number: "AKL-2026-001",
    object: "Inteligencia contratual, auditoria de medicoes e monitoramento CAPEX/OPEX",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "active",
    totalValue: 1850000,
    initialTermMonths: 12,
    renewalCount: 9,
    renewalTermMonths: 12
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    city: "Aracruz",
    agency: "Prefeitura Municipal de Aracruz",
    number: "AKL-2026-002",
    object: "Gestao integrada de contratos publicos e previsao de fluxo de caixa",
    startDate: "2026-02-01",
    endDate: "2027-01-31",
    status: "active",
    totalValue: 1420000,
    initialTermMonths: 12,
    renewalCount: 9,
    renewalTermMonths: 12
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    city: "Itapemirim",
    agency: "Prefeitura Municipal de Itapemirim",
    number: "AKL-2026-003",
    object: "Controle executivo de contratos, receitas realizadas e despesas operacionais",
    startDate: "2026-03-01",
    endDate: "2027-02-28",
    status: "pending",
    totalValue: 980000,
    initialTermMonths: 12,
    renewalCount: 9,
    renewalTermMonths: 12
  }
];

export const contractItems: ContractItem[] = [
  { id: "item-1", contractId: "11111111-1111-4111-8111-111111111111", description: "Implantacao da plataforma", quantity: 1, unitPrice: 220000 },
  { id: "item-2", contractId: "11111111-1111-4111-8111-111111111111", description: "Monitoramento mensal de contratos", quantity: 12, unitPrice: 95000 },
  { id: "item-3", contractId: "11111111-1111-4111-8111-111111111111", description: "Relatorios executivos e comite mensal", quantity: 12, unitPrice: 41000 },
  { id: "item-4", contractId: "22222222-2222-4222-8222-222222222222", description: "Implantacao e integracao de bases", quantity: 1, unitPrice: 180000 },
  { id: "item-5", contractId: "22222222-2222-4222-8222-222222222222", description: "Gestao de CAPEX/OPEX", quantity: 12, unitPrice: 78000 },
  { id: "item-6", contractId: "22222222-2222-4222-8222-222222222222", description: "Suporte executivo", quantity: 12, unitPrice: 25333.33 },
  { id: "item-7", contractId: "33333333-3333-4333-8333-333333333333", description: "Setup operacional", quantity: 1, unitPrice: 140000 },
  { id: "item-8", contractId: "33333333-3333-4333-8333-333333333333", description: "Auditoria de medicoes", quantity: 10, unitPrice: 62000 },
  { id: "item-9", contractId: "33333333-3333-4333-8333-333333333333", description: "Painel de indicadores", quantity: 10, unitPrice: 22000 }
];

export const capex: Capex[] = [
  { id: "capex-1", contractId: "11111111-1111-4111-8111-111111111111", month: "2026-01", category: "software", description: "Licencas e infraestrutura inicial", amount: 145000 },
  { id: "capex-2", contractId: "11111111-1111-4111-8111-111111111111", month: "2026-02", category: "equipment", description: "Equipamentos de campo", amount: 78000 },
  { id: "capex-3", contractId: "22222222-2222-4222-8222-222222222222", month: "2026-02", category: "software", description: "Ambiente de dados", amount: 118000 },
  { id: "capex-4", contractId: "22222222-2222-4222-8222-222222222222", month: "2026-03", category: "equipment", description: "Dispositivos de acompanhamento", amount: 52000 },
  { id: "capex-5", contractId: "33333333-3333-4333-8333-333333333333", month: "2026-03", category: "software", description: "Setup de plataforma", amount: 88000 }
];

export const opex: Opex[] = [
  { id: "opex-1", contractId: "11111111-1111-4111-8111-111111111111", month: "2026-01", category: "labor", description: "Equipe tecnica", amount: 64000 },
  { id: "opex-2", contractId: "11111111-1111-4111-8111-111111111111", month: "2026-02", category: "labor", description: "Equipe tecnica", amount: 68000 },
  { id: "opex-3", contractId: "11111111-1111-4111-8111-111111111111", month: "2026-03", category: "logistics", description: "Deslocamentos e vistorias", amount: 22000 },
  { id: "opex-4", contractId: "22222222-2222-4222-8222-222222222222", month: "2026-02", category: "labor", description: "Analistas de contratos", amount: 56000 },
  { id: "opex-5", contractId: "22222222-2222-4222-8222-222222222222", month: "2026-03", category: "overhead", description: "Operacao mensal", amount: 39000 },
  { id: "opex-6", contractId: "33333333-3333-4333-8333-333333333333", month: "2026-03", category: "labor", description: "Equipe inicial", amount: 43000 }
];

export const revenue: Revenue[] = [
  { id: "rev-1", contractId: "11111111-1111-4111-8111-111111111111", month: "2026-01", status: "realized", description: "Parcela de implantacao", amount: 210000 },
  { id: "rev-2", contractId: "11111111-1111-4111-8111-111111111111", month: "2026-02", status: "realized", description: "Medicao mensal", amount: 136000 },
  { id: "rev-3", contractId: "11111111-1111-4111-8111-111111111111", month: "2026-03", status: "projected", description: "Medicao projetada", amount: 142000 },
  { id: "rev-4", contractId: "11111111-1111-4111-8111-111111111111", month: "2026-04", status: "projected", description: "Medicao projetada", amount: 148000 },
  { id: "rev-5", contractId: "22222222-2222-4222-8222-222222222222", month: "2026-02", status: "realized", description: "Parcela de implantacao", amount: 170000 },
  { id: "rev-6", contractId: "22222222-2222-4222-8222-222222222222", month: "2026-03", status: "projected", description: "Medicao projetada", amount: 110000 },
  { id: "rev-7", contractId: "22222222-2222-4222-8222-222222222222", month: "2026-04", status: "projected", description: "Medicao projetada", amount: 114000 },
  { id: "rev-8", contractId: "33333333-3333-4333-8333-333333333333", month: "2026-03", status: "projected", description: "Inicio operacional", amount: 130000 },
  { id: "rev-9", contractId: "33333333-3333-4333-8333-333333333333", month: "2026-04", status: "projected", description: "Medicao projetada", amount: 84000 }
];

export const contractDocuments: ContractDocument[] = [
  {
    id: "doc-1",
    contractId: "11111111-1111-4111-8111-111111111111",
    title: "Contrato original Linhares",
    type: "contract",
    url: "https://example.com/linhares-contrato.pdf",
    uploadedAt: "2026-01-01"
  },
  {
    id: "doc-2",
    contractId: "22222222-2222-4222-8222-222222222222",
    title: "Contrato original Aracruz",
    type: "contract",
    url: "https://example.com/aracruz-contrato.pdf",
    uploadedAt: "2026-02-01"
  }
];

export const seedData = {
  contracts,
  contractItems,
  capex,
  opex,
  revenue,
  contractDocuments
};
