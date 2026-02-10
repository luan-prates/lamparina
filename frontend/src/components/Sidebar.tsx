"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Video, ListVideo, Settings } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/videos", label: "Vídeos", icon: Video },
  { href: "/playlists", label: "Playlists", icon: ListVideo },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <h1 className="text-xl font-bold mb-8 px-2">Video Study</h1>
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                active ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
