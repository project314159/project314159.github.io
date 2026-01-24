export interface ResearchLink {
  title: string;
  url: string;
  source: string;
  type: 'scholar' | 'database' | 'patent' | 'code';
  description: string;
}

export interface ResearchData {
  topic: string;
  overview: string;
  wikipediaUrl: string;
  wikipediaTitle: string;
  imageUrl?: string;
  portals: ResearchLink[];
  relatedTerms: string[];
  isMath?: boolean;
  mathExpression?: string;
}

export interface SearchState {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: ResearchData | null;
  error?: string;
}
