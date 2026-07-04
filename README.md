# Escolha Única — versão correta para grupo

Esta versão usa Firebase Realtime Database para permitir:

- vários usuários acessando o mesmo link;
- cada usuário votar uma única vez;
- opção escolhida ficar indisponível para os demais;
- criação de nova opção pelo próprio usuário;
- painel administrativo simples;
- exportação CSV.

## Arquivos

- `index.html`
- `style.css`
- `app.js`

## Configuração obrigatória

1. Acesse Firebase Console.
2. Crie um projeto.
3. Crie um app Web.
4. Ative Realtime Database.
5. Em `app.js`, substitua:

```js
const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "COLE_AQUI.firebaseapp.com",
  databaseURL: "https://COLE_AQUI-default-rtdb.firebaseio.com",
  projectId: "COLE_AQUI",
  storageBucket: "COLE_AQUI.appspot.com",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI"
};
```

pelo config real do Firebase.

## Regra temporária de teste do Firebase

Use apenas para protótipo:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Para produção, use autenticação.
