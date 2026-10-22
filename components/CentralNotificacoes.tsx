'use client';
import {useEffect,useState} from 'react';
import type {MensagemNotificacao} from '../lib/notificacoes';
export default function CentralNotificacoes(){
 const [mensagem,setMensagem]=useState<MensagemNotificacao|null>(null);
 useEffect(()=>{
  let timer:ReturnType<typeof setTimeout>|undefined;
  const receber=(evento:Event)=>{
   const detalhe=(evento as CustomEvent<MensagemNotificacao>).detail;
   if(!detalhe?.texto)return;
   if(timer)clearTimeout(timer);
   setMensagem(detalhe);
   timer=setTimeout(()=>setMensagem(atual=>atual?.id===detalhe.id?null:atual),5000);
  };
  window.addEventListener('ccb:notificacao',receber);
  return()=>{window.removeEventListener('ccb:notificacao',receber);if(timer)clearTimeout(timer)};
 },[]);
 if(!mensagem)return null;
 return <div className={'ccb-toast ccb-toast-'+mensagem.tipo} role={mensagem.tipo==='erro'?'alert':'status'} aria-live={mensagem.tipo==='erro'?'assertive':'polite'}>
  <span className="ccb-toast-icon" aria-hidden="true">{mensagem.tipo==='sucesso'?'✓':mensagem.tipo==='erro'?'!':'i'}</span>
  <div className="ccb-toast-body"><strong>{mensagem.tipo==='sucesso'?'Operação concluída':mensagem.tipo==='erro'?'Não foi possível concluir':'Informação'}</strong><p>{mensagem.texto}</p></div>
  <button type="button" onClick={()=>setMensagem(null)} aria-label="Fechar aviso">×</button>
 </div>;
}
