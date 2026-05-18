export type ReportDefinition = {
  id: number;
  name: string;
  slug?: string | null;
  module?: string | null;
  description?: string | null;
  enabled?: boolean | null;
};

export type KpiSnapshot = {
  id: number;
  metric_key: string;
  metric_label: string;
  module?: string | null;
  value?: number | null;
  unit?: string | null;
  captured_at?: string | null;
};

export type ReportMetric = {
  label: string;
  value: number | string;
  helper: string;
};

export type ModuleSummary = {
  module: string;
  primary: string;
  secondary: string;
  status: string;
};
