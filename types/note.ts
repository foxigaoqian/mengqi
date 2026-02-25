export type CrawlResult = {
  id?: string;
  user_id?: string;
  url: string;
  title: string;
  content: string;
  images: string[];
  created_at?: string;
};

export type GeneratedResult = {
  id?: string;
  source_note_id?: string;
  generated_text: string;
  generated_images: string[];
  tags: string[];
  style: string;
  created_at?: string;
};

export type GenerationRequest = {
  source: CrawlResult;
  style?: string;
  imageMode?: 'generate' | 'similar' | 'keep-original';
};
