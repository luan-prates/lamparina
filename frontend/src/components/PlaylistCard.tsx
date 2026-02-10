"use client";

import Link from "next/link";
import { ListVideo } from "lucide-react";
import type { Playlist } from "@/lib/types";

export default function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <Link href={`/playlists/${playlist.id}`} className="block">
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <ListVideo size={24} className="text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{playlist.name}</h3>
            {playlist.description && (
              <p className="text-sm text-gray-500 truncate">{playlist.description}</p>
            )}
          </div>
          <span className="text-sm text-gray-400">{playlist.video_count} vídeos</span>
        </div>
      </div>
    </Link>
  );
}
