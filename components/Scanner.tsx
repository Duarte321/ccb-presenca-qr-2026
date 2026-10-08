'use client';
import {useEffect,useRef,useState} from 'react';
import {Html5Qrcode} from 'html5-qrcode';
type Resultado={texto:string;tipo:'info'|'ok'|'aviso'|'erro'};
export default function Scanner({evento}:{evento:string}){
 const [resultado,setResultado]=useState<Resultado>({texto:'Aponte a câmera para o QR Code do participante.',tipo:'info'});
 const [total,setTotal]=useState(0);
 const ocupado=useRef(false);
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
   }catch{if(!encerrado)setResultado({texto:'Sem conexão. A presença não foi confirmada; tente novamente.',tipo:'erro'});}
   finally{setTimeout(()=>{ocupado.current=false},2400);}
  };
  leitor.start({facingMode:'environment'},{fps:10,qrbox:{width:220,height:220}},registrar,()=>{}).catch(()=>{if(!encerrado)setResultado({texto:'Não foi possível abrir a câmera. Permita o acesso à câmera e utilize HTTPS.',tipo:'erro'});});
  return()=>{encerrado=true;void leitor.stop().then(()=>leitor.clear()).catch(()=>{});};
 },[evento]);
 return <div className="scanner-simple"><div className="camera-frame"><div id="camera"/></div><div className={'scan-result '+resultado.tipo} role="status" aria-live="polite"><strong>{resultado.tipo==='ok'?'✓ Entrada confirmada':resultado.tipo==='aviso'?'! Presença duplicada':resultado.tipo==='erro'?'× Atenção':'◉ Pronto para leitura'}</strong><p>{resultado.texto}</p></div><p className="status-note">Confirmações realizadas nesta sessão: <strong>{total}</strong>. Para consultar todas as presenças, atualize a página.</p></div>;
}