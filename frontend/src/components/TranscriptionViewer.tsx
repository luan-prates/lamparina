"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function TranscriptionViewer({ videoId }: { videoId: string }) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getTranscription(videoId)
      .then((data) => setMarkdown(data.markdown))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [videoId]);

  if (loading) return <div className="text-gray-500">Carregando transcrição...</div>;
  if (error) return <div className="text-gray-400 text-sm">{error}</div>;
  if (!markdown) return <div className="text-gray-400">Sem transcrição disponível.</div>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
        {markdown}
      </pre>
    </div>
  );
}
