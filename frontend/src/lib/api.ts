const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Videos
  createVideo: (url: string, playlist_id?: string) =>
    request("/videos", {
      method: "POST",
      body: JSON.stringify({ url, playlist_id }),
    }),
  listVideos: (params?: { status?: string; search?: string; page?: number }) => {
    const sp = new URLSearchParams();
    if (params?.status) sp.set("status", params.status);
    if (params?.search) sp.set("search", params.search);
    if (params?.page) sp.set("page", String(params.page));
    const qs = sp.toString();
    return request<import("./types").Video[]>(`/videos${qs ? `?${qs}` : ""}`);
  },
  getVideo: (id: string) => request<import("./types").Video>(`/videos/${id}`),
  deleteVideo: (id: string) =>
    request(`/videos/${id}`, { method: "DELETE" }),
  retryVideo: (id: string) =>
    request(`/videos/${id}/retry`, { method: "POST" }),
  transcribeVideo: (id: string, engine?: string, model_name?: string) =>
    request(`/videos/${id}/transcribe`, {
      method: "POST",
      body: JSON.stringify({ engine, model_name }),
    }),
  getTranscription: (id: string) =>
    request<{ markdown: string }>(`/videos/${id}/transcription`),
  getVideoTranscriptions: (id: string) =>
    request<import("./types").Transcription[]>(`/videos/${id}/transcriptions`),

  // Playlists
  createPlaylist: (name: string, description?: string) =>
    request("/playlists", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    }),
  listPlaylists: () => request<import("./types").Playlist[]>("/playlists"),
  getPlaylist: (id: string) =>
    request<import("./types").PlaylistDetail>(`/playlists/${id}`),
  updatePlaylist: (id: string, data: { name?: string; description?: string }) =>
    request(`/playlists/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePlaylist: (id: string) =>
    request(`/playlists/${id}`, { method: "DELETE" }),
  addVideoToPlaylist: (playlistId: string, videoId: string) =>
    request(`/playlists/${playlistId}/videos`, {
      method: "POST",
      body: JSON.stringify({ video_id: videoId }),
    }),
  removeVideoFromPlaylist: (playlistId: string, videoId: string) =>
    request(`/playlists/${playlistId}/videos/${videoId}`, { method: "DELETE" }),
  reorderPlaylistVideos: (playlistId: string, videoIds: string[]) =>
    request(`/playlists/${playlistId}/videos/reorder`, {
      method: "PUT",
      body: JSON.stringify({ video_ids: videoIds }),
    }),

  // Credentials
  listCredentials: () =>
    request<import("./types").PlatformCredential[]>("/credentials/"),
  createCredential: (data: {
    platform_name: string;
    platform_url: string;
    auth_type: string;
    username?: string;
    password?: string;
  }) =>
    request<import("./types").PlatformCredential>("/credentials/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCredential: (id: string, data: {
    platform_name?: string;
    platform_url?: string;
    auth_type?: string;
    username?: string;
    password?: string;
  }) =>
    request<import("./types").PlatformCredential>(`/credentials/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCredential: (id: string) =>
    request(`/credentials/${id}`, { method: "DELETE" }),
  uploadCookies: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_URL}/credentials/${id}/cookies`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || "Upload failed");
    }
    return res.json() as Promise<import("./types").PlatformCredential>;
  },

  // Settings & Stats
  getSettings: () => request<import("./types").Settings>("/settings"),
  updateSettings: (data: {
    whisper_engine?: string;
    whisper_model?: string;
    openai_api_key?: string;
  }) => request("/settings", { method: "PUT", body: JSON.stringify(data) }),
  getStats: () => request<import("./types").Stats>("/stats"),
  health: () => request<{ status: string }>("/health"),
};
