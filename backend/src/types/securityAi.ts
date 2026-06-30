export interface AiHeaderRecommendation {
  headerName: string;
  isPresent: boolean;
  currentValue: string | null;
  impactLevel: 'low' | 'medium' | 'high' | 'none';
  analysis: string;
  howToImprove: string;
}

export interface AiSecurityAnalysis {
  generalReview: string;
  recommendations: AiHeaderRecommendation[];
}

export interface ScanStatusResponse {
  jobId: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'unknown';
  progress: number;
  result: AiSecurityAnalysis | null;
  error: string | null;
}