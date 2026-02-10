"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import type { Settings, PlatformCredential } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [engine, setEngine] = useState("");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Credentials state
  const [credentials, setCredentials] = useState<PlatformCredential[]>([]);
  const [credName, setCredName] = useState("");
  const [credUrl, setCredUrl] = useState("");
  const [credAuthType, setCredAuthType] = useState("cookies");
  const [credUsername, setCredUsername] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credSaving, setCredSaving] = useState(false);
  const [credMessage, setCredMessage] = useState("");
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    api.getSettings().then((s) => {
      setSettings(s);
      setEngine(s.whisper_engine);
      setModel(s.whisper_model);
    });
    loadCredentials();
  }, []);

  function loadCredentials() {
    api.listCredentials().then(setCredentials).catch(() => {});
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const data: any = { whisper_engine: engine, whisper_model: model };
      if (apiKey) data.openai_api_key = apiKey;
      const updated = await api.updateSettings(data) as Settings;
      setSettings(updated);
      setApiKey("");
      setMessage("Configurações salvas!");
    } catch (err: any) {
      setMessage(`Erro: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCredential(e: React.FormEvent) {
    e.preventDefault();
    setCredSaving(true);
    setCredMessage("");
    try {
      const data: any = {
        platform_name: credName,
        platform_url: credUrl,
        auth_type: credAuthType,
      };
      if (credAuthType === "login") {
        data.username = credUsername;
        data.password = credPassword;
      }
      await api.createCredential(data);
      setCredName("");
      setCredUrl("");
      setCredAuthType("cookies");
      setCredUsername("");
      setCredPassword("");
      setCredMessage("Credencial adicionada!");
      loadCredentials();
    } catch (err: any) {
      setCredMessage(`Erro: ${err.message}`);
    } finally {
      setCredSaving(false);
    }
  }

  async function handleDeleteCredential(id: string) {
    try {
      await api.deleteCredential(id);
      loadCredentials();
    } catch (err: any) {
      setCredMessage(`Erro ao deletar: ${err.message}`);
    }
  }

  async function handleUploadCookies(id: string, file: File) {
    try {
      await api.uploadCookies(id, file);
      setCredMessage("Cookies enviados!");
      loadCredentials();
    } catch (err: any) {
      setCredMessage(`Erro no upload: ${err.message}`);
    }
  }

  if (!settings) return <div className="text-gray-500">Carregando...</div>;

  const localModels = ["tiny", "base", "small", "medium", "large"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurações</h1>

      <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 border border-gray-200 max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Engine de Transcrição
          </label>
          <select
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="whisper_local">Whisper Local</option>
            <option value="openai_api">OpenAI API</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modelo
          </label>
          {engine === "whisper_local" ? (
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {localModels.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="whisper-1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          )}
        </div>

        {engine === "openai_api" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={settings.openai_api_key_set ? "••••••• (configurada)" : "sk-..."}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          {message && (
            <span className={`text-sm ${message.startsWith("Erro") ? "text-red-500" : "text-green-600"}`}>
              {message}
            </span>
          )}
        </div>
      </form>

      {/* Platform Credentials Section */}
      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Credenciais de Plataformas</h2>

      {credMessage && (
        <div className={`mb-4 text-sm ${credMessage.startsWith("Erro") ? "text-red-500" : "text-green-600"}`}>
          {credMessage}
        </div>
      )}

      {/* Credentials List */}
      {credentials.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-6 max-w-xl">
          {credentials.map((cred) => (
            <div key={cred.id} className="p-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-gray-900">{cred.platform_name}</div>
                  <div className="text-sm text-gray-500">{cred.platform_url}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Tipo: {cred.auth_type === "cookies" ? "Cookies" : "Login"}
                    {cred.auth_type === "login" && cred.username && ` | Usuário: ${cred.username}`}
                    {cred.auth_type === "cookies" && cred.cookies_path && " | Cookies enviados"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {cred.auth_type === "cookies" && (
                    <>
                      <input
                        type="file"
                        accept=".txt"
                        className="hidden"
                        ref={(el) => { fileInputRefs.current[cred.id] = el; }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadCookies(cred.id, file);
                        }}
                      />
                      <button
                        onClick={() => fileInputRefs.current[cred.id]?.click()}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        {cred.cookies_path ? "Atualizar Cookies" : "Upload Cookies"}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteCredential(cred.id)}
                    className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Credential Form */}
      <form onSubmit={handleAddCredential} className="bg-white rounded-lg shadow p-6 border border-gray-200 max-w-xl space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Adicionar Credencial</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Plataforma
          </label>
          <input
            type="text"
            value={credName}
            onChange={(e) => setCredName(e.target.value)}
            placeholder="Ex: Full Cycle"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL da Plataforma (domínio)
          </label>
          <input
            type="text"
            value={credUrl}
            onChange={(e) => setCredUrl(e.target.value)}
            placeholder="Ex: plataforma.fullcycle.com.br"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Autenticação
          </label>
          <select
            value={credAuthType}
            onChange={(e) => setCredAuthType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="cookies">Cookies</option>
            <option value="login">Login (usuário/senha)</option>
          </select>
        </div>

        {credAuthType === "login" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuário
              </label>
              <input
                type="text"
                value={credUsername}
                onChange={(e) => setCredUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={credPassword}
                onChange={(e) => setCredPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={credSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {credSaving ? "Salvando..." : "Adicionar"}
        </button>
      </form>
    </div>
  );
}
