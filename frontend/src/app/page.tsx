"use client";

import { useEffect, useState } from "react";
import { Video, FileText, ListVideo, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { Stats } from "@/lib/types";
import VideoCard from "@/components/VideoCard";

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.getStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) {
    return <div className="text-gray-500">Carregando...</div>;
  }

  const cards = [
    { label: "Total de Vídeos", value: stats.total_videos, icon: Video, color: "bg-blue-500" },
    { label: "Completos", value: stats.completed, icon: FileText, color: "bg-green-500" },
    { label: "Processando", value: stats.processing, icon: Video, color: "bg-yellow-500" },
    { label: "Falhas", value: stats.failed, icon: AlertCircle, color: "bg-red-500" },
    { label: "Playlists", value: stats.total_playlists, icon: ListVideo, color: "bg-purple-500" },
    { label: "Transcrições", value: stats.total_transcriptions, icon: FileText, color: "bg-indigo-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className={`${color} p-1.5 rounded text-white`}>
                <Icon size={16} />
              </div>
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {stats.recent_videos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Atividade Recente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recent_videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
