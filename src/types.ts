export interface Timing {
  id: string;
  title: string;
  description: string;
  photo_url: string;
  last_timing: string; // ISO string
  created_at?: string;
}

export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'user';
}
