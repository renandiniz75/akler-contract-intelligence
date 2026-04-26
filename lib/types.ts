export type ContractStatus = "active" | "pending" | "completed" | "at_risk";
export type RevenueStatus = "projected" | "realized";
export type ExpenseCategory = "labor" | "materials" | "equipment" | "software" | "logistics" | "overhead";
export type ContractDocumentType = "contract" | "amendment" | "measurement" | "invoice" | "other";

export type Contract = {
  id: string;
  city: string;
  agency: string;
  number: string;
  object: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  totalValue: number;
  initialTermMonths: number;
  renewalCount: number;
  renewalTermMonths: number;
};

export type ContractItem = {
  id: string;
  contractId: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Capex = {
  id: string;
  contractId: string;
  month: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
};

export type Opex = {
  id: string;
  contractId: string;
  month: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
};

export type Revenue = {
  id: string;
  contractId: string;
  month: string;
  status: RevenueStatus;
  description: string;
  amount: number;
  generated?: boolean;
};

export type ContractDocument = {
  id: string;
  contractId: string;
  title: string;
  type: ContractDocumentType;
  url: string;
  uploadedAt: string;
};

export type CashFlowMonth = {
  month: string;
  projectedRevenue: number;
  realizedRevenue: number;
  capex: number;
  opex: number;
  netProjected: number;
  netRealized: number;
  cumulative: number;
};

export type DashboardSummary = {
  totalContracted: number;
  projectedRevenue: number;
  realizedRevenue: number;
  totalCapex: number;
  totalOpex: number;
  grossMargin: number;
  paybackMonth: string | null;
  optimisticMonths: number;
};
