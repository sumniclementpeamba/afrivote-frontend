export interface PlanFeatures {
  maxVoters: number;
  maxElections: number;
  csvUpload: boolean;
  realtimeResults: boolean;
  exportPdf: boolean;
  auditLogs: boolean;
  customBranding: boolean;
}

export const planFeatures: Record<string, PlanFeatures> = {
  FREE: {
    maxVoters: 100,
    maxElections: 3,
    csvUpload: false,
    realtimeResults: true,
    exportPdf: false,
    auditLogs: false,
    customBranding: false,
  },
  STANDARD: {
    maxVoters: 5000,
    maxElections: 15,
    csvUpload: true,
    realtimeResults: true,
    exportPdf: true,
    auditLogs: false,
    customBranding: false,
  },
  ENTERPRISE: {
    maxVoters: 100000,
    maxElections: 50,
    csvUpload: true,
    realtimeResults: true,
    exportPdf: true,
    auditLogs: true,
    customBranding: true,
  },
};