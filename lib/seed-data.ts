import type { Capex, Contract, ContractDocument, ContractItem, Opex, Revenue } from "@/lib/types";

const defaultAdjustmentRate = 4;

function contract({
  id,
  city,
  number,
  monthlyValue,
  implementationValue,
  signedAt,
  adjustmentBase,
  pendingMonths,
  expiresAt,
  sourceCompany
}: {
  id: string;
  city: string;
  number: string;
  monthlyValue: number;
  implementationValue: number;
  signedAt: string;
  adjustmentBase: string;
  pendingMonths: number;
  expiresAt: string;
  sourceCompany: "AKLER" | "STARTID";
}): Contract {
  return {
    id,
    city,
    agency: city,
    number,
    object: `Contrato ${sourceCompany} consolidado na Akler. Valor mensal de referencia: ${monthlyValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })}${implementationValue > 0 ? `; implantacao: ${implementationValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` : ""}. Data base de reajuste: ${adjustmentBase}. Fonte: Fluxo_Caixa_Gerencial_2026-04-24.xlsx.`,
    startDate: signedAt,
    endDate: expiresAt,
    status: pendingMonths > 0 ? "active" : "completed",
    totalValue: monthlyValue * 12,
    initialTermMonths: 12,
    renewalCount: pendingMonths > 12 ? Math.max(Math.ceil((pendingMonths - 12) / 12), 0) : 0,
    renewalTermMonths: 12,
    revenueProjectionMonths: pendingMonths,
    revenueAdjustmentRate: defaultAdjustmentRate,
    revenueAdjustmentFrequencyMonths: 12
  };
}

export const contracts: Contract[] = [
  contract({
    id: "e8c58b9d-4eb8-50c0-9e81-333fc9d321a9",
    city: "Linhares",
    number: "356/2024",
    monthlyValue: 536050,
    implementationValue: 0,
    signedAt: "2024-10-15",
    adjustmentBase: "2025-10-15",
    pendingMonths: 101,
    expiresAt: "2034-08-24",
    sourceCompany: "AKLER"
  }),
  contract({
    id: "fcbdb742-2071-5da3-b467-901724322e82",
    city: "Aracruz",
    number: "013/2025",
    monthlyValue: 529100,
    implementationValue: 0,
    signedAt: "2025-02-10",
    adjustmentBase: "2026-02-10",
    pendingMonths: 105,
    expiresAt: "2034-12-20",
    sourceCompany: "AKLER"
  }),
  contract({
    id: "10eb7d4e-57a3-5653-ae84-8250a9eec5c7",
    city: "Marataizes",
    number: "0192/2024",
    monthlyValue: 570630,
    implementationValue: 0,
    signedAt: "2024-09-20",
    adjustmentBase: "2025-09-20",
    pendingMonths: 101,
    expiresAt: "2034-07-31",
    sourceCompany: "AKLER"
  }),
  contract({
    id: "fb485a6a-25b1-511e-92aa-0b2d141155ff",
    city: "Itapemirim",
    number: "529/2024",
    monthlyValue: 527650,
    implementationValue: 0,
    signedAt: "2024-11-05",
    adjustmentBase: "2025-11-05",
    pendingMonths: 102,
    expiresAt: "2034-09-14",
    sourceCompany: "AKLER"
  }),
  contract({
    id: "4a08ff67-9495-5e8f-ad22-9ee24d4659e3",
    city: "CREA-ES",
    number: "001/2025",
    monthlyValue: 0,
    implementationValue: 0,
    signedAt: "2025-05-05",
    adjustmentBase: "2026-06-05",
    pendingMonths: 108,
    expiresAt: "2035-03-14",
    sourceCompany: "AKLER"
  }),
  contract({
    id: "fb50882b-fe4c-5d53-bed6-a17a522d0bf6",
    city: "CREA-ES",
    number: "20/2025",
    monthlyValue: 0,
    implementationValue: 40616,
    signedAt: "2025-05-05",
    adjustmentBase: "2026-06-05",
    pendingMonths: 0,
    expiresAt: "2026-02-28",
    sourceCompany: "AKLER"
  }),
  contract({
    id: "c6717644-6809-5db6-9043-3d2a11269109",
    city: "SEMOBI-ES",
    number: "2025.000006.35101.01",
    monthlyValue: 1712918.6,
    implementationValue: 2959357.7,
    signedAt: "2025-06-06",
    adjustmentBase: "2026-06-06",
    pendingMonths: 109,
    expiresAt: "2035-04-15",
    sourceCompany: "AKLER"
  }),
  contract({
    id: "6cafa3c2-40f9-586a-8cb1-e313cd06bc62",
    city: "TJBA",
    number: "100/2025",
    monthlyValue: 1198257.03,
    implementationValue: 2263831.57,
    signedAt: "2025-06-18",
    adjustmentBase: "2026-06-18",
    pendingMonths: 109,
    expiresAt: "2035-04-27",
    sourceCompany: "AKLER"
  }),
  contract({
    id: "c5c07a6d-4ad6-53ad-b597-c06744fb5bc4",
    city: "SEMOBI/ES",
    number: "011/2020",
    monthlyValue: 24000,
    implementationValue: 0,
    signedAt: "2020-09-30",
    adjustmentBase: "2021-09-30",
    pendingMonths: 0,
    expiresAt: "2025-11-30",
    sourceCompany: "STARTID"
  }),
  contract({
    id: "aea219b4-0fb9-5dae-89e8-0cc24f4fdf61",
    city: "SEMOBI/ES",
    number: "003/2020",
    monthlyValue: 174500,
    implementationValue: 0,
    signedAt: "2020-04-29",
    adjustmentBase: "2021-04-29",
    pendingMonths: 0,
    expiresAt: "2025-11-30",
    sourceCompany: "STARTID"
  }),
  contract({
    id: "dfbbbb2a-1424-5664-a18f-ec03448d348c",
    city: "CEASA/ES",
    number: "005/2020",
    monthlyValue: 28900,
    implementationValue: 0,
    signedAt: "2020-06-30",
    adjustmentBase: "2021-06-30",
    pendingMonths: 0,
    expiresAt: "2025-11-30",
    sourceCompany: "STARTID"
  }),
  contract({
    id: "21eb2efc-27f7-59e4-9fad-462230dc623a",
    city: "Serra/ES (SEDU)",
    number: "146/2022",
    monthlyValue: 187000,
    implementationValue: 0,
    signedAt: "2022-10-04",
    adjustmentBase: "2023-10-04",
    pendingMonths: 38,
    expiresAt: "2029-01-31",
    sourceCompany: "STARTID"
  }),
  contract({
    id: "b56cd9c6-bace-5464-ad8a-ed96c8294129",
    city: "Serra/ES (Saude)",
    number: "024/2023",
    monthlyValue: 46750,
    implementationValue: 0,
    signedAt: "2023-02-01",
    adjustmentBase: "2024-02-01",
    pendingMonths: 35,
    expiresAt: "2028-10-31",
    sourceCompany: "STARTID"
  }),
  contract({
    id: "9bed5756-5c08-59b7-92b7-b2a0b085b029",
    city: "Itapemirim/ES",
    number: "102/2023",
    monthlyValue: 137250,
    implementationValue: 0,
    signedAt: "2023-01-01",
    adjustmentBase: "2024-01-01",
    pendingMonths: 36,
    expiresAt: "2028-11-30",
    sourceCompany: "STARTID"
  }),
  contract({
    id: "1c76b84c-255e-5835-b461-8cbef2962725",
    city: "Anchieta/ES",
    number: "071/2024",
    monthlyValue: 150000,
    implementationValue: 0,
    signedAt: "2024-01-01",
    adjustmentBase: "2025-01-01",
    pendingMonths: 24,
    expiresAt: "2027-11-30",
    sourceCompany: "STARTID"
  }),
  contract({
    id: "d5f7e21d-b9bc-56e6-bd1e-25881d767f7e",
    city: "Anchieta/ES",
    number: "001/2024",
    monthlyValue: 103600,
    implementationValue: 0,
    signedAt: "2024-01-01",
    adjustmentBase: "2025-01-01",
    pendingMonths: 24,
    expiresAt: "2027-11-30",
    sourceCompany: "STARTID"
  })
];

export const contractItems: ContractItem[] = [
  {
    id: "item-linhares-ptz",
    contractId: "e8c58b9d-4eb8-50c0-9e81-333fc9d321a9",
    description: "Ponto de videomonitoramento - camera IP PTZ",
    quantity: 720,
    unitPrice: 5390,
    investmentCategory: "equipment",
    estimatedCost: 0,
    paymentStartOffsetMonths: 0,
    installmentCount: 1,
    paymentSource: "own_cash"
  },
  {
    id: "item-linhares-fixa",
    contractId: "e8c58b9d-4eb8-50c0-9e81-333fc9d321a9",
    description: "Ponto de videomonitoramento - camera IP fixa IR",
    quantity: 120,
    unitPrice: 840,
    investmentCategory: "equipment",
    estimatedCost: 0,
    paymentStartOffsetMonths: 0,
    installmentCount: 1,
    paymentSource: "own_cash"
  },
  {
    id: "item-linhares-lpr",
    contractId: "e8c58b9d-4eb8-50c0-9e81-333fc9d321a9",
    description: "Ponto de leitura de placas veiculares",
    quantity: 600,
    unitPrice: 3390,
    investmentCategory: "equipment",
    estimatedCost: 0,
    paymentStartOffsetMonths: 0,
    installmentCount: 1,
    paymentSource: "own_cash"
  },
  {
    id: "item-linhares-facial",
    contractId: "e8c58b9d-4eb8-50c0-9e81-333fc9d321a9",
    description: "Captura, deteccao, reconhecimento e gestao de imagem facial",
    quantity: 60,
    unitPrice: 6950,
    investmentCategory: "equipment",
    estimatedCost: 0,
    paymentStartOffsetMonths: 0,
    installmentCount: 1,
    paymentSource: "own_cash"
  },
  {
    id: "item-semobi-implantacao",
    contractId: "c6717644-6809-5db6-9043-3d2a11269109",
    description: "Implantacao estimada conforme planilha CFO",
    quantity: 1,
    unitPrice: 2959357.7,
    investmentCategory: "equipment",
    estimatedCost: 0,
    paymentStartOffsetMonths: 0,
    installmentCount: 1,
    paymentSource: "own_cash"
  },
  {
    id: "item-tjba-implantacao",
    contractId: "6cafa3c2-40f9-586a-8cb1-e313cd06bc62",
    description: "Implantacao estimada conforme planilha CFO",
    quantity: 1,
    unitPrice: 2263831.57,
    investmentCategory: "equipment",
    estimatedCost: 0,
    paymentStartOffsetMonths: 0,
    installmentCount: 1,
    paymentSource: "own_cash"
  }
];

export const capex: Capex[] = [];
export const opex: Opex[] = [];
export const revenue: Revenue[] = [];

export const contractDocuments: ContractDocument[] = [
  {
    id: "doc-linhares-356",
    contractId: "e8c58b9d-4eb8-50c0-9e81-333fc9d321a9",
    title: "Contrato Linhares 356/2024",
    type: "contract",
    url: "about:blank",
    uploadedAt: "2024-10-15"
  },
  {
    id: "doc-semobi-2025",
    contractId: "c6717644-6809-5db6-9043-3d2a11269109",
    title: "Contrato SEMOBI 2025.000006.35101.01",
    type: "contract",
    url: "about:blank",
    uploadedAt: "2025-06-06"
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
