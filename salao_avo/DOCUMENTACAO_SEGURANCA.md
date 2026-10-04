# Documentação de segurança do painel administrativo

**Atualizada em:** 2 de outubro de 2026  
**Escopo:** painel administrativo, API Node/Express, credenciais locais, banco de dados e sessão do WhatsApp.

> Este documento não contém valores de chaves ou senhas. O arquivo foi criado somente na pasta local do projeto; não foi enviado ao GitHub nem a outro serviço.

## 1. Proteção da API administrativa

Todas as rotas sob `/api` exigem uma chave administrativa enviada no cabeçalho HTTP:

```text
Authorization: Bearer <ADMIN_API_KEY>
```

O middleware em `src/server.js` compara a chave recebida com `ADMIN_API_KEY`, configurada no ambiente do servidor. A comparação usa `crypto.timingSafeEqual` quando os tamanhos são iguais.

- Sem `ADMIN_API_KEY` configurada no servidor, a API responde `503`.
- Sem chave ou com chave inválida, responde `401`.
- A chave dá acesso a todas as rotas protegidas. Ela é compartilhada; o sistema ainda não tem contas individuais, perfis ou permissões por funcionário.

No navegador, o painel solicita a chave na primeira chamada à API e a mantém em `sessionStorage` durante a sessão da aba. Se a API responder `401`, o painel remove a chave guardada. O valor real não deve ser colocado no código HTML ou JavaScript.

## 2. Configuração de credenciais

As credenciais são configuradas no arquivo local `.env`, que está excluído do Git. O modelo `.env.example` contém somente nomes de variáveis e campos vazios.

Variáveis usadas pelo projeto:

| Variável | Uso |
|---|---|
| `ADMIN_API_KEY` | Protege as rotas da API administrativa. |
| `TURSO_DATABASE_URL` | Endereço do banco Turso. |
| `TURSO_AUTH_TOKEN` | Credencial de acesso ao Turso. |
| `GEMINI_API_KEY` | Acesso ao serviço Gemini usado pela parte contábil. |
| `EMAIL_USER`, `EMAIL_PASS` | Credenciais de envio de e-mail. |
| `EMAIL_DESTINATARIO` | Destinatário dos avisos por e-mail. |

Depois de alterar o `.env`, reinicie o servidor Node. Em produção, configure as variáveis no painel de ambiente do provedor de hospedagem; o `.env` local não é enviado com o código. Não reutilize uma chave que tenha sido publicada ou compartilhada fora do ambiente privado esperado.

## 3. Navegação local e CORS

O `index.html` na raiz redireciona para `public/admin/`, para que o Live Server abra o painel. O Live Server serve apenas os arquivos estáticos; para consultar dados, o backend também precisa estar ativo na porta `3000`.

O painel usa a API em `localhost:3000` durante a prévia local. O CORS da API aceita origens de loopback (`localhost`, `127.0.0.1` e `::1`) e permite os cabeçalhos `Content-Type` e `Authorization`. Essa regra facilita a prévia local; CORS não substitui a chave administrativa.

Para abrir o painel localmente:

1. Configure `ADMIN_API_KEY` e as demais variáveis necessárias no `.env`.
2. Inicie o backend com `npm start`.
3. Abra o `index.html` da raiz com o Live Server.
4. Informe a chave administrativa quando o painel solicitar.

## 4. Arquivos ignorados pelo Git

O `.gitignore` do projeto exclui dependências, arquivos de ambiente, sessões/cache do WhatsApp, bancos locais SQLite/DB, logs e arquivos do sistema. Entre as regras relevantes estão:

```gitignore
.env
.env.local
.wwebjs_auth/
.wwebjs_cache/
*.sqlite
*.sqlite-journal
*.db
```

Isso impede que esses arquivos sejam adicionados por engano em novos commits. O ignore, por si só, não remove um arquivo já rastreado; por isso o histórico também foi reescrito.

## 5. Limpeza do histórico Git

Foram removidos de todos os commits alcançáveis na branch `main` os caminhos:

- `salao_avo.sqlite` — banco SQLite local;
- `.wwebjs_auth/` — sessão local do WhatsApp Web;
- `.wwebjs_cache/` — cache local do WhatsApp Web.

A branch `main` foi reescrita e publicada com atualização forçada protegida por `--force-with-lease`. Na conferência feita depois da publicação, `main` era a única branch/tag remota listada. As referências temporárias locais ao histórico antigo foram removidas e os objetos Git inalcançáveis foram limpos. As cópias locais dos arquivos ignorados foram preservadas.

A reescrita não apaga cópias que alguém já clonou, forks independentes ou visualizações em cache do GitHub. O conteúdo da sessão do WhatsApp havia sido incluído no histórico antigo; por isso, considere essa sessão comprometida até revogá-la no WhatsApp.

## 6. Dados que continuam sendo armazenados

O projeto continua gravando dados de operação no Turso, entre eles nomes e telefones de clientes, observações/alergias, agendamentos, horários, valores e observações do atendimento. A proteção adicionada controla o acesso a esses dados pelas rotas `/api` deste servidor; ela não apaga dados do Turso nem substitui a proteção do próprio banco.

O WhatsApp é inicializado com `LocalAuth` em `src/services/whatsappService.js`. O serviço envia uma mensagem de boas-vindas após o cadastro e registra informações operacionais no console, incluindo nome e telefone/chat ID. O texto da mensagem enviada não é gravado pelo código nas tabelas SQL. O histórico das conversas continua associado à conta do WhatsApp.

## 7. Ações operacionais ainda necessárias

1. **Revogar a sessão antiga do WhatsApp:** no celular, abra **Dispositivos conectados** e encerre as sessões conectadas. Depois, conecte novamente o sistema pelo novo QR code. A limpeza do Git não invalida uma sessão que alguém já tenha copiado.
2. **Configurar a chave no ambiente de produção:** defina `ADMIN_API_KEY` no provedor de hospedagem, além das credenciais do banco e dos serviços usados. Sem a chave, a API retorna `503`.
3. **Usar HTTPS em produção:** a chave é enviada em um cabeçalho de autorização e deve trafegar por HTTPS fora do computador local.
4. **Considerar cópias antigas:** colaboradores com clones anteriores precisam descartar esses clones e clonar novamente; não devem fazer merge/push da história antiga, pois isso pode reintroduzir os arquivos removidos.
5. **Pedir a remoção de caches antigos ao GitHub, se necessário:** uma atualização forçada limpa as referências da branch, mas o GitHub pode manter visualizações em cache e forks podem continuar com os commits antigos. Os commits que introduziram os arquivos foram `d6ce64d` (banco) e `e2a32e3` (sessão/cache).

## 8. Limites conhecidos

- A chave é única e compartilhada; não há identidade individual, papéis, expiração automática ou revogação por usuário.
- O navegador mantém a chave em `sessionStorage` até a aba/sessão terminar ou a API rejeitá-la. Um problema de script no próprio site poderia expor dados disponíveis nessa origem.
- Não há limite de tentativas ou bloqueio por força bruta implementado neste middleware.
- O painel e os arquivos estáticos são públicos para quem consegue abrir o endereço; a proteção de dados está nas rotas da API. Não publique uma instância sem configurar a chave e o HTTPS.
- O banco Turso mantém os dados existentes. A remoção do arquivo SQLite do Git não remove nem altera os registros remotos.
