export interface StatsTimelineItem {
  date: string;
  count: number;
}

export interface DistributionItem {
  name: string;
  count: number;
  percentage: number;
}

export interface RetentionMetric {
  eligible: number;
  retained: number;
  percentage: number;
}

export interface DashboardMetrics {
  totalInstalls: number;
  dau: number;
  wau: number;
  mau: number;
  retention7Days: RetentionMetric;
  retention30Days: RetentionMetric;
}

export interface DashboardStats {
  metrics: DashboardMetrics;
  charts: {
    newInstallsTimeline: StatsTimelineItem[];
    activeInstallsTimeline: StatsTimelineItem[];
    versionDistribution: DistributionItem[];
    platformDistribution: DistributionItem[];
  };
  generatedAt: string;
  periodDays: number | 'all';
}
