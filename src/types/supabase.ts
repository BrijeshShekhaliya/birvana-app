export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      artist_follows: {
        Row: {
          artist_id: string;
          created_at: string | null;
          user_id: string;
        };
      };
      liked_songs: {
        Row: {
          created_at: string | null;
          song_id: number;
          user_id: string;
        };
      };
      playlist_songs: {
        Row: {
          added_by: string | null;
          id: number;
          playlist_id: string;
          position: number;
          song_id: number;
        };
      };
      playlists: {
        Row: {
          cover_path: string | null;
          cover_url: string | null;
          created_at: string | null;
          description: string | null;
          follower_count: number | null;
          id: string;
          is_collaborative: boolean | null;
          name: string;
          owner_id: string;
          play_count: number | null;
          share_token: string | null;
          song_count: number | null;
          updated_at: string | null;
          visibility: 'private' | 'public';
        };
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          display_name: string | null;
          email: string | null;
          followers_count: number | null;
          following_count: number | null;
          id: string;
          is_artist: boolean | null;
          public_playlists_count: number | null;
          songs_count: number | null;
          updated_at: string | null;
          username: string | null;
          verified_artist: boolean | null;
        };
      };
      saved_playlists: {
        Row: {
          created_at: string | null;
          playlist_id: string;
          user_id: string;
        };
      };
      songs: {
        Row: {
          album_id: string | null;
          artist_display: string;
          artist_id: string;
          audio_path: string | null;
          audio_url: string;
          cover_path: string | null;
          cover_url: string | null;
          created_at: string | null;
          description: string | null;
          duration_seconds: number | null;
          id: number;
          like_count: number | null;
          play_count: number | null;
          status: 'uploading' | 'processing' | 'ready' | 'failed';
          title: string;
          visibility: 'private' | 'public';
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
