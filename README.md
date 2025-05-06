# Gerenciador de Tarefas

Um aplicativo CRUD (Create, Read, Update, Delete) para gerenciamento de tarefas, desenvolvido com Node.js, Express e MySQL.

## Funcionalidades

- Criar novas tarefas
- Listar todas as tarefas
- Atualizar tarefas existentes
- Excluir tarefas
- Interface responsiva com Bootstrap
- Status visual para cada tarefa

## Requisitos

- Node.js
- MySQL
- NPM ou Yarn

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados:
- Crie um banco de dados MySQL
- Execute o script `database.sql` para criar a estrutura do banco de dados

4. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na raiz do projeto
- Adicione as seguintes variáveis:
```
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=tasks_db
PORT=3000
```

5. Inicie o servidor:
```bash
node server.js
```

6. Acesse a aplicação:
- Abra o navegador e acesse `http://localhost:3000`

## Estrutura do Projeto

```
├── server.js          # Servidor Node.js
├── database.sql       # Script do banco de dados
├── public/           # Arquivos estáticos
│   ├── index.html    # Página principal
│   ├── styles.css    # Estilos CSS
│   └── script.js     # JavaScript do cliente
└── package.json      # Dependências do projeto
```

## Tecnologias Utilizadas

- Backend:
  - Node.js
  - Express
  - MySQL2
  - CORS

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Bootstrap 5

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request 