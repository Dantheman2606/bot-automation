export interface Message {
  id: number;
  role: string;
  content: string;
  created_at: string;
}

export interface Session {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}
