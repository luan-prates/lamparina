"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { PlaylistDetail } from "@/lib/types";
import VideoCard from "@/components/VideoCard";
import AddVideoForm from "@/components/AddVideoForm";

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);

  function loadPlaylist() {
    api.getPlaylist(id).then(setPlaylist).catch(console.error);
  }

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  async function handleDelete() {
    if (!confirm("Deletar esta playlist?")) return;
    await api.deletePlaylist(id);
    router.push("/playlists");
  }

  async function handleRemoveVideo(videoId: string) {
    await api.removeVideoFromPlaylist(id, videoId);
    loadPlaylist();
  }

  if (!playlist) return <div className="text-gray-500">Carregando...</div>;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-gray-500 mt-1">{playlist.description}</p>
          )}
          <p className="text-sm text-gray-400 mt-1">{playlist.video_count} vídeos</p>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
        >
          <Trash2 size={14} /> Deletar Playlist
        </button>
      </div>

      <div className="mb-6">
        <AddVideoForm playlistId={id} onAdded={loadPlaylist} />
      </div>

      {playlist.videos.length === 0 ? (
        <p className="text-gray-500">Nenhum vídeo nesta playlist.</p>
      ) : (
        <div className="space-y-3">
          {playlist.videos.map((video, index) => (
            <div key={video.id} className="flex items-center gap-3">
              <span className="text-gray-400 font-mono text-sm w-6 text-right">
                {index + 1}
              </span>
              <div className="flex-1">
                <VideoCard video={video} />
              </div>
              <button
                onClick={() => handleRemoveVideo(video.id)}
                className="text-gray-400 hover:text-red-500 p-1"
                title="Remover da playlist"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
