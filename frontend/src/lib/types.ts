export interface Video {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  channel_name: string | null;
  status: string;
  error_message: string | null;
  video_path: string | null;
  audio_path: string | null;
  transcription_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  video_count: number;
  created_at: string;
  updated_at: string;
}

export interface PlaylistDetail extends Playlist {
  videos: Video[];
}

export interface Transcription {
  id: string;
  video_id: string;
  engine: string;
  model_name: string | null;
  language: string | null;
  raw_text: string | null;
  markdown_path: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface Stats {
  total_videos: number;
  completed: number;
  processing: number;
  failed: number;
  total_playlists: number;
  total_transcriptions: number;
  recent_videos: Video[];
}

export interface PlatformCredential {
  id: string;
  platform_name: string;
  platform_url: string;
  auth_type: string;
  username: string | null;
  password: string | null;
  cookies_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  whisper_engine: string;
  whisper_model: string;
  openai_api_key_set: boolean;
}
