"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";

interface Props {
  playlistId?: string;
  onAdded?: () => void;
}

export default function AddVideoForm({ playlistId, onAdded }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    try {
      await api.createVideo(url.trim(), playlistId);
      setUrl("");
      onAdded?.();
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar vídeo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Cole a URL do vídeo aqui..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        disabled={loading}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        <Plus size={20} />
        {loading ? "Adicionando..." : "Adicionar"}
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </form>
  );
}
