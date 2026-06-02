

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
