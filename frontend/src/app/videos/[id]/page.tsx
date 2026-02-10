"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2, RotateCcw, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import type { Video } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import TranscriptionViewer from "@/components/TranscriptionViewer";
import { usePolling } from "@/hooks/usePolling";

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState("");

  const loadVideo = useCallback(() => {
    api.getVideo(id).then(setVideo).catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  const isProcessing = video
    ? ["pending", "downloading", "extracting", "transcribing"].includes(video.status)
    : false;

  usePolling(loadVideo, 3000, isProcessing);

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja deletar este vídeo?")) return;
    await api.deleteVideo(id);
    router.push("/videos");
  }

  async function handleRetry() {
    await api.retryVideo(id);
    loadVideo();
  }

  async function handleRetranscribe() {
    await api.transcribeVideo(id);
    loadVideo();
  }

  if (error) return <div className="text-red-500">{error}</div>;
  if (!video) return <div className="text-gray-500">Carregando...</div>;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {video.title || video.url}
          </h1>
          {video.channel_name && (
            <p className="text-gray-500 mt-1">{video.channel_name}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={video.status} />
          {video.status === "failed" && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
            >
              <RotateCcw size={14} /> Retentar
            </button>
          )}
          {video.status === "completed" && (
            <button
              onClick={handleRetranscribe}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              <RefreshCw size={14} /> Re-transcrever
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            <Trash2 size={14} /> Deletar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">URL</h3>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm break-all"
          >
            {video.url}
          </a>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Duração</h3>
          <p className="text-gray-900">
            {video.duration_seconds
              ? `${Math.floor(video.duration_seconds / 60)}m ${video.duration_seconds % 60}s`
              : "N/A"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Criado em</h3>
          <p className="text-gray-900">
            {new Date(video.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {video.error_message && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-red-700 mb-1">Erro</h3>
          <pre className="text-xs text-red-600 whitespace-pre-wrap">{video.error_message}</pre>
        </div>
      )}

      {video.status === "completed" && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Transcrição</h2>
          <TranscriptionViewer videoId={video.id} />
        </div>
      )}
    </div>
  );
}
