# Prompt: Pre-commit de migrations

Sua tarefa é garantir que o repositório possua um hook de pré-commit com as
seguintes características **exatamente como descrito abaixo**. Sempre que este
prompt for acionado, você deve verificar e, se necessário, recriar o hook
mantendo o comportamento idêntico.

1. **Local do hook**: o arquivo deve estar em `.githooks/pre-commit` na raiz do
   projeto.
   - O arquivo precisa ser executável (`chmod +x .githooks/pre-commit`).
   - O repositório deve orientar os usuários a configurarem
     `git config core.hooksPath .githooks` (não precisa automatizar, apenas
     mencionar quando apropriado).

2. **Comportamento do script**:
   - Deve rodar em Bash, iniciando com `#!/usr/bin/env bash` e
     `set -euo pipefail`.
   - Determina a raiz do repositório via `git rev-parse --show-toplevel` e faz
     `cd` para lá.
   - Cria `supabase/migrations/` se ainda não existir.
   - Coleta os arquivos **recém-adicionados ao staging** (diff `--cached`,
     filtro `--diff-filter=A`) cujo caminho seja
     `src/api/*/data/migrations/*.sql`.
   - Se não houver novas migrations, encerra com sucesso.
   - Para cada migration nova:
     - Gera um timestamp único (`date +%Y%m%d%H%M%S`) reutilizado dentro da
       execução.
     - Usa um contador incremental (começando em 0) para sufixos `00`, `01`,
       etc., evitando colisões.
     - Monta o destino como
       `supabase/migrations/${timestamp}_${suffix}__${module}__${basename}` onde
       `module` é o nome da pasta do módulo e `basename` é o nome do arquivo
       original.
     - Copia o arquivo e chama `git add` para adicionar o novo destino ao
       staging.
   - Exibe mensagens no stderr informando cada arquivo copiado.

3. **Invólucro**:
   - O script não deve alterar migrations pré-existentes.
   - Qualquer migration que já exista no destino com o mesmo nome deve gerar um
     novo sufixo (incrementando o contador) até encontrar um nome livre.
   - Deve ignorar entradas cujo arquivo fonte não exista fisicamente (ex.: caso
     tenha sido removido antes do commit).

4. **Entrega**:
   - Caso o hook já exista e esteja idêntico ao comportamento descrito, nada
     precisa ser feito.
   - Caso não exista ou esteja divergente, recrie-o ou ajuste-o até que
     corresponda exatamente às regras acima.

Siga estas instruções à risca sempre que o prompt for utilizado.
