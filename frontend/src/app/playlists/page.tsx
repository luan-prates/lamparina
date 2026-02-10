"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Playlist } from "@/lib/types";
import PlaylistCard from "@/components/PlaylistCard";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  function loadPlaylists() {
    api.listPlaylists().then(setPlaylists).catch(console.error);
  }

  useEffect(() => {
    loadPlaylists();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await api.createPlaylist(name.trim(), description.trim() || undefined);
      setName("");
      setDescription("");
      loadPlaylists();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Playlists</h1>

      <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da playlist"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            required
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição (opcional)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {creating ? "Criando..." : "Criar Playlist"}
          </button>
        </div>
      </form>

      {playlists.length === 0 ? (
        <p className="text-gray-500">Nenhuma playlist criada.</p>
      ) : (
        <div className="space-y-3">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
}
