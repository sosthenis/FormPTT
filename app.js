import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase, ref, onValue, push, set, update, get, child
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

/*
  1) Crie um projeto no Firebase.
  2) Ative Realtime Database.
  3) Cole abaixo o firebaseConfig do seu projeto.
  4) Publique no GitHub Pages.

  Sem isso, não existe bloqueio real entre celulares diferentes.
*/

const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "COLE_AQUI.firebaseapp.com",
  databaseURL: "https://COLE_AQUI-default-rtdb.firebaseio.com",
  projectId: "COLE_AQUI",
  storageBucket: "COLE_AQUI.appspot.com",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI"
};

const configurado = !Object.values(firebaseConfig).some(v => String(v).includes("COLE_AQUI"));

let db = null;
let estado = { opcoes: {}, votos: {} };

const el = id => document.getElementById(id);

function msg(texto, tipo="ok"){
  el("msg").textContent = texto;
  el("msg").className = "msg " + tipo;
}

function normalizar(txt){
  return String(txt || "").trim().toLowerCase();
}

function idUsuario(nome){
  return normalizar(nome)
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]/g,"_");
}

function render(){
  const opcoesBox = el("opcoes");
  const listaAdmin = el("listaAdmin");
  const respostas = el("respostas");

  opcoesBox.innerHTML = "";
  listaAdmin.innerHTML = "";
  respostas.innerHTML = "";

  const votos = Object.values(estado.votos || {});
  const opcoes = Object.entries(estado.opcoes || {});

  if(!opcoes.length){
    opcoesBox.innerHTML = "<p>Nenhuma opção cadastrada. Use '+ Criar nova opção'.</p>";
  }

  for(const [id, op] of opcoes){
    const ocupada = votos.some(v => v.opcaoId === id);
    const label = document.createElement("label");
    label.className = "opcao" + (ocupada ? " indisponivel" : "");
    label.innerHTML = `
      <input type="radio" name="opcao" value="${id}" ${ocupada ? "disabled" : ""}>
      <span>${op.texto}</span>
      <span class="tag">${ocupada ? "Escolhida" : "Livre"}</span>
    `;
    opcoesBox.appendChild(label);

    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `<span>${op.texto}</span><strong>${ocupada ? "ocupada" : "livre"}</strong>`;
    listaAdmin.appendChild(item);
  }

  if(!votos.length){
    respostas.innerHTML = "<p>Nenhuma resposta registrada.</p>";
  } else {
    respostas.innerHTML = `
      <div class="table">
      <table>
        <thead><tr><th>Nome</th><th>Opção</th><th>Data/hora</th></tr></thead>
        <tbody>
          ${votos.map(v => `<tr><td>${v.nome}</td><td>${v.opcaoTexto}</td><td>${v.dataHora}</td></tr>`).join("")}
        </tbody>
      </table>
      </div>
    `;
  }
}

async function bootstrap(){
  if(!configurado){
    msg("Firebase não configurado. Abra app.js e cole o firebaseConfig do seu projeto.", "warn");
    return;
  }

  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);

  onValue(ref(db, "/"), snap => {
    estado = snap.val() || { opcoes: {}, votos: {} };
    render();
  });
}

el("formVoto").addEventListener("submit", async e => {
  e.preventDefault();

  if(!configurado || !db){
    msg("Configure o Firebase antes de usar em grupo real.", "erro");
    return;
  }

  const nome = el("nome").value.trim();
  const nova = el("novaOpcao").value.trim();
  const marcado = document.querySelector("input[name='opcao']:checked");

  if(!nome){
    msg("Informe seu nome.", "erro");
    return;
  }

  const uid = idUsuario(nome);
  const snapVoto = await get(child(ref(db), "votos/" + uid));

  if(snapVoto.exists()){
    msg("Este usuário já escolheu. Só é permitido uma vez.", "erro");
    return;
  }

  let opcaoId = "";
  let opcaoTexto = "";

  if(nova){
    const novaRef = push(ref(db, "opcoes"));
    opcaoId = novaRef.key;
    opcaoTexto = nova;
    await set(novaRef, { texto: nova, criadaEm: new Date().toISOString() });
  } else {
    if(!marcado){
      msg("Selecione uma opção ou crie uma nova.", "erro");
      return;
    }
    opcaoId = marcado.value;
    opcaoTexto = estado.opcoes[opcaoId]?.texto || "";
  }

  const votos = Object.values(estado.votos || {});
  if(votos.some(v => v.opcaoId === opcaoId)){
    msg("Essa opção já foi escolhida por outra pessoa.", "erro");
    return;
  }

  await set(ref(db, "votos/" + uid), {
    nome,
    opcaoId,
    opcaoTexto,
    dataHora: new Date().toLocaleString("pt-BR")
  });

  el("formVoto").reset();
  msg("Escolha registrada com sucesso: " + opcaoTexto, "ok");
});

el("btnAdmin").onclick = () => {
  el("painelAdmin").classList.toggle("hidden");
};

el("addOpcao").onclick = async () => {
  if(!configurado || !db){
    msg("Configure o Firebase antes.", "erro");
    return;
  }
  const texto = el("opcaoAdmin").value.trim();
  if(!texto) return;
  await set(push(ref(db, "opcoes")), { texto, criadaEm: new Date().toISOString() });
  el("opcaoAdmin").value = "";
};

el("exportar").onclick = () => {
  const votos = Object.values(estado.votos || {});
  if(!votos.length){
    msg("Sem respostas para exportar.", "erro");
    return;
  }
  const linhas = [["Nome","Opção","Data/hora"], ...votos.map(v => [v.nome, v.opcaoTexto, v.dataHora])];
  const csv = linhas.map(l => l.map(c => `"${String(c).replaceAll('"','""')}"`).join(";")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "respostas.csv";
  a.click();
  URL.revokeObjectURL(url);
};

render();
bootstrap();
