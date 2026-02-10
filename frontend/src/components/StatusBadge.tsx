"use client";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-gray-100 text-gray-700" },
  downloading: { label: "Baixando", className: "bg-blue-100 text-blue-700 animate-pulse" },
  downloaded: { label: "Baixado", className: "bg-blue-100 text-blue-700" },
  extracting: { label: "Extraindo", className: "bg-yellow-100 text-yellow-700 animate-pulse" },
  extracted: { label: "Extraído", className: "bg-yellow-100 text-yellow-700" },
  transcribing: { label: "Transcrevendo", className: "bg-purple-100 text-purple-700 animate-pulse" },
  completed: { label: "Completo", className: "bg-green-100 text-green-700" },
  failed: { label: "Falhou", className: "bg-red-100 text-red-700" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
