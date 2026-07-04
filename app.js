const s=document.getElementById('opcao');
s.onchange=()=>document.getElementById('nova').style.display=s.value==='__nova__'?'block':'none';

function enviar(){
const nome=document.getElementById('nome').value.trim();
if(!nome){msg('Informe seu nome');return;}
if(localStorage.getItem('usuario_'+nome.toLowerCase())){msg('Este usuário já respondeu.');return;}
let op=s.value;
if(!op){msg('Escolha uma opção');return;}
if(op==='__nova__'){
 op=document.getElementById('nova').value.trim();
 if(!op){msg('Digite a nova opção');return;}
}
localStorage.setItem('usuario_'+nome.toLowerCase(),op);
msg('Escolha registrada: '+op,true);
}
function msg(t,ok=false){
const d=document.getElementById('msg');
d.innerText=t;
d.style.color=ok?'green':'red';
}
