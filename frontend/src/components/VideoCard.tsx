"use client";

import Link from "next/link";
import type { Video } from "@/lib/types";
import StatusBadge from "./StatusBadge";

function formatDuration(seconds: number | null) {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

export default function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/videos/${video.id}`} className="block">
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border border-gray-200">
        {video.thumbnail_url && (
          <img
            src={video.thumbnail_url}
            alt={video.title || ""}
            className="w-full h-40 object-cover rounded mb-3"
          />
        )}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">
            {video.title || video.url}
          </h3>
          <StatusBadge status={video.status} />
        </div>
        {video.channel_name && (
          <p className="text-xs text-gray-500 mt-1">{video.channel_name}</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
          {video.duration_seconds && <span>{formatDuration(video.duration_seconds)}</span>}
          <span>{new Date(video.created_at).toLocaleDateString("pt-BR")}</span>
        </div>
      </div>
    </Link>
  );
}
