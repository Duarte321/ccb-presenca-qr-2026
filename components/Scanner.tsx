'use client';
import {useEffect,useRef,useState} from 'react';
import {Html5Qrcode} from 'html5-qrcode';
type Resultado={texto:string;tipo:'info'|'ok'|'aviso'|'erro'};
export default function Scanner({evento}:{evento:string}){
 const [resultado,setResultado]=useState<Resultado>({texto:'Aponte a câmera para o QR Code do participante.',tipo:'info'});
 const [total,setTotal]=useState(0);
 const ocupado=useRef(false);
 const fila=useRef<string[]>([]);
 const [pendentes,setPendentes]=useState(0);
 const eventoRef=useRef(evento);
 useEffect(()=>{eventoRef.current=evento;fila.current=[];setPendentes(0)},[evento]);
 useEffect(()=>{let tentando=false;const retry=async()=>{if(tentando||!navigator.onLine||!fila.current.length)return;tentando=true;const itens=[...fila.current];for(const token of itens){try{const r=await fetch('/api/checkin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({evento_id:eventoRef.current,token})});const j=await r.json();if(!r.ok)break;fila.current=fila.current.filter(v=>v!==token);setPendentes(fila.current.length);setResultado({texto:'Sincronização: '+j.message,tipo:j.message?.startsWith('Presença confirmada')?'ok':'aviso'});}catch{break}}tentando=false};window.addEventListener('online',retry);const interval=setInterval(retry,15000);return()=>{window.removeEventListener('online',retry);clearInterval(interval)}},[]);
 useEffect(()=>{
  let encerrado=false;
  const leitor=new Html5Qrcode('camera');
  const registrar=async(token:string)=>{
   if(ocupado.current||encerrado)return;
   ocupado.current=true;
   setResultado({texto:'Consultando cadastro no Supabase...',tipo:'info'});
   try{
    const resposta=await fetch('/api/checkin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({evento_id:evento,token})});
    const body: {message?:string}=await resposta.json();
    const texto=body.message||'Não foi possível verificar o código.';
    const tipo:Resultado['tipo']=!resposta.ok?'erro':texto.startsWith('Presença confirmada:')?'ok':texto.startsWith('Presença já registrada:')?'aviso':'erro';
    if(!encerrado){setResultado({texto,tipo});if(tipo==='ok')setTotal(v=>v+1);}
   }catch{if(!encerrado){if(!fila.current.includes(token))fila.current.push(token);setPendentes(fila.current.length);setResultado({texto:'Sem conexão. Leitura pendente: mantenha esta página aberta até a sincronização. Nenhuma presença foi confirmada ainda.',tipo:'aviso'});}}
   finally{setTimeout(()=>{ocupado.current=false},2400);}
  };
  // Start é assíncrono: aguarde sua conclusão antes de tentar parar o leitor.
  // Navegar entre páginas durante a inicialização nunca deve gerar rejeição não tratada.
  const inicio=leitor.start({facingMode:'environment'},{fps:10,qrbox:{width:220,height:220}},registrar,()=>{})
   .then(()=>true)
   .catch(()=>{
    if(!encerrado)setResultado({texto:'Não foi possível abrir a câmera. Permita o acesso à câmera e utilize HTTPS.',tipo:'erro'});
    return false;
   });
  return()=>{
   encerrado=true;
   void inicio.then(async(iniciado)=>{
    if(iniciado){try{await leitor.stop()}catch{/* Leitor já foi interrompido. */}}
    try{leitor.clear()}catch{/* Elemento removido ao navegar. */}
   }).catch(()=>{});
  };
 },[evento]);
 return <div className="scanner-simple"><div className="camera-frame"><div id="camera"/></div><div className={'scan-result '+resultado.tipo} role="status" aria-live="polite"><strong>{resultado.tipo==='ok'?'✓ Entrada confirmada':resultado.tipo==='aviso'?'! Presença duplicada':resultado.tipo==='erro'?'× Atenção':'◉ Pronto para leitura'}</strong><p>{resultado.texto}</p></div><p className="status-note">Confirmações realizadas nesta sessão: <strong>{total}</strong>. Leituras pendentes nesta aba: <strong>{pendentes}</strong>. Sem internet, mantenha a página aberta; fechar ou recarregar descarta leituras pendentes.</p></div>;
}