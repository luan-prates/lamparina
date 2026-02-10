# Lamparina

Sistema full-stack para download de vídeos, extração de áudio e transcrição automática com Whisper.

## Stack

- **Backend:** FastAPI + SQLAlchemy + yt-dlp + Whisper
- **Frontend:** Next.js + TypeScript + Tailwind CSS
- **Banco:** SQLite

## Subindo o projeto

```bash
docker-compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## Autenticação em plataformas privadas

Para baixar vídeos de plataformas que exigem login (ex: Full Cycle, Alura, etc.), você precisa cadastrar uma credencial e fazer upload de um arquivo `cookies.txt`.

### Exportando cookies do navegador

1. Instale a extensão **[Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)** no Chrome/Edge, ou **[cookies.txt](https://addons.mozilla.org/pt-BR/firefox/addon/cookies-txt/)** no Firefox.
2. Acesse a plataforma desejada e faça login normalmente.
3. Com a página da plataforma aberta, clique na extensão e exporte os cookies. Será gerado um arquivo `cookies.txt` no formato Netscape.

### Cadastrando a credencial no Lamparina

1. Acesse **Configurações** no menu lateral.
2. Na seção **Credenciais de Plataformas**, preencha:
   - **Nome da Plataforma** — nome para identificação (ex: "Full Cycle")
   - **URL da Plataforma** — domínio usado nas URLs dos vídeos (ex: `plataforma.fullcycle.com.br`)
   - **Tipo de Autenticação** — selecione "Cookies"
3. Clique em **Adicionar**.
4. Na credencial criada, clique em **Upload Cookies** e selecione o arquivo `cookies.txt` exportado.

### Como funciona

Quando você adiciona uma URL de vídeo para download, o sistema:

1. Extrai o domínio da URL
2. Busca uma credencial cadastrada que corresponda ao domínio
3. Se encontrar, passa o `cookies.txt` para o yt-dlp automaticamente
4. O download acontece como se você estivesse logado no navegador

### Autenticação por login/senha

Para plataformas que suportam login direto pelo yt-dlp:

1. Cadastre a credencial selecionando **Tipo de Autenticação** como "Login"
2. Preencha usuário e senha
3. O sistema passará as credenciais automaticamente ao yt-dlp

> **Nota:** A maioria das plataformas funciona melhor com cookies. Use login/senha apenas se a plataforma suportar esse método no yt-dlp.

### Dicas

- Os cookies expiram. Se o download falhar com erro de autenticação, exporte novamente os cookies e atualize pelo botão **Atualizar Cookies**.
- O domínio cadastrado deve corresponder ao domínio das URLs dos vídeos. Ex: se a URL do vídeo é `https://plataforma.fullcycle.com.br/curso/123/aula/456`, o domínio deve ser `plataforma.fullcycle.com.br`.
- Ao deletar uma credencial, o arquivo `cookies.txt` é removido automaticamente do storage.
