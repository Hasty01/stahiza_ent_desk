export interface StahizaEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  image_url: string;
}

export interface Shoutout {
  id: string;
  student_name: string;
  message: string;
  song_request?: string;
  created_at: string;
}

export interface CommitteeProfile {
  id: string;
  full_name: string;
  role: string;
  email: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  created_at: string;
}
