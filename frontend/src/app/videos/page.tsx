"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { Video } from "@/lib/types";
import VideoCard from "@/components/VideoCard";
import AddVideoForm from "@/components/AddVideoForm";
import { usePolling } from "@/hooks/usePolling";

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [search, setSearch] = useState("");

  const loadVideos = useCallback(() => {
    api.listVideos({ search: search || undefined }).then(setVideos).catch(console.error);
  }, [search]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const hasProcessing = videos.some((v) =>
    ["pending", "downloading", "extracting", "transcribing"].includes(v.status)
  );

  usePolling(loadVideos, 3000, hasProcessing);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Vídeos</h1>

      <div className="mb-6">
        <AddVideoForm onAdded={loadVideos} />
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar vídeos..."
          className="px-4 py-2 border border-gray-300 rounded-lg w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {videos.length === 0 ? (
        <p className="text-gray-500">Nenhum vídeo encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
