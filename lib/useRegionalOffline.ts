'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {registrarRegionalOffline} from '../app/ensaio-regional/actions';
import {lerFila,removerFila,salvarFila,type LancamentoFila} from './regionalOffline';
export type RegionalEnsaio={id:string;titulo:string;local:string;data:string;status:string;contagem_versao:number};
export type RegionalRegistro={id:string;ensaio_id:string;grupo:string;tipo:string;valor:string;quantidade:number;criado_em:string;client_event_id?:string|null};
function permanente(msg:string){
 return /contagem reiniciada|ensaio finalizado|ensaio fechado|ensaio inexistente|negativa|inválid|não aceita|sem permissão|não encontrado/i.test(msg);
}
export function useRegionalOffline(operadorId:string,ensaios:RegionalEnsaio[],registros:RegionalRegistro[]){
 const [fila,setFila]=useState<LancamentoFila[]>([]);
 const [pronto,setPronto]=useState(false);
 const [online,setOnline]=useState(true);
 const [sincronizando,setSincronizando]=useState(false);
 const [erroFila,setErroFila]=useState('');
 const lista=useRef<LancamentoFila[]>([]);
 const ocupado=useRef(false);
 const inicio=useRef(false);
 const dbRegistros=useRef(registros);
 const eventos=useRef(ensaios);
 const operador=useRef(operadorId);
 dbRegistros.current=registros;eventos.current=ensaios;operador.current=operadorId;
 const atualizar=useCallback((proximo:LancamentoFila[])=>{
  const ordenado=[...proximo].sort((a,b)=>a.criado_em.localeCompare(b.criado_em));
  lista.current=ordenado;setFila(ordenado);
 },[]);
 const limparConfirmados=useCallback(async()=>{
  const confirmados=new Set(dbRegistros.current.map(r=>r.client_event_id).filter(Boolean));
  const paraApagar=lista.current.filter(r=>(r.estado==='confirmado'&&confirmados.has(r.id))||
   (r.estado==='confirmado'&&eventos.current.some(e=>e.id===r.ensaio_id&&e.contagem_versao!==r.versao)));
  for(const item of paraApagar){
   try{await removerFila(item.id);atualizar(lista.current.filter(r=>r.id!==item.id))}
   catch(e){setErroFila(e instanceof Error?e.message:'Falha ao limpar confirmações locais.')}
  }
 },[atualizar]);
 useEffect(()=>{void limparConfirmados()},[registros,ensaios,limparConfirmados]);
 const sincronizar=useCallback(async()=>{
  if(ocupado.current||!inicio.current||typeof navigator==='undefined'||!navigator.onLine)return;
  ocupado.current=true;setSincronizando(true);
  try{
   for(const item of [...lista.current]){
    if(!navigator.onLine)break;
    const atual=lista.current.find(r=>r.id===item.id);
    if(!atual||atual.estado!=='pendente')continue;
    try{
     const resposta=await registrarRegionalOffline(atual.id,atual.ensaio_id,atual.versao,atual.grupo,atual.tipo,atual.valor,atual.quantidade);
     const ok:LancamentoFila={...atual,estado:'confirmado',serverId:resposta.id,erro:undefined};
     await salvarFila(ok);
     atualizar(lista.current.map(r=>r.id===ok.id?ok:r));
     setErroFila('');
    }catch(err){
     const msg=err instanceof Error?err.message:'Falha na comunicação com o servidor';
     if(permanente(msg)){
      const falha:LancamentoFila={...atual,estado:'erro',erro:msg};
      try{await salvarFila(falha);atualizar(lista.current.map(r=>r.id===falha.id?falha:r))}
      catch(e){setErroFila('Falha ao salvar erro da fila: '+String(e));break}
      setErroFila('Há lançamentos que precisam de revisão.');
      continue;
     }
     setErroFila('Sem confirmação do servidor. Os lançamentos permanecem guardados neste aparelho.');
     break;
    }
   }
  }finally{ocupado.current=false;setSincronizando(false)}
 },[atualizar]);
 useEffect(()=>{
  let ativo=true;
  inicio.current=false;setPronto(false);lista.current=[];setFila([]);
  setOnline(typeof navigator!=='undefined'?navigator.onLine:true);
  void lerFila(operadorId).then(items=>{
   if(!ativo)return;
   atualizar(items);inicio.current=true;setPronto(true);void sincronizar();
  }).catch(e=>{if(ativo){setErroFila('Não foi possível abrir o armazenamento do celular: '+String(e));setPronto(false)}});
  return()=>{ativo=false;inicio.current=false};
 },[operadorId,atualizar,sincronizar]);
 useEffect(()=>{
  const ligado=()=>{setOnline(true);void sincronizar()};
  const desligado=()=>setOnline(false);
  window.addEventListener('online',ligado);window.addEventListener('offline',desligado);
  const timer=setInterval(()=>{setOnline(navigator.onLine);void sincronizar()},10000);
  const focus=()=>{void sincronizar()};
  document.addEventListener('visibilitychange',focus);
  return()=>{clearInterval(timer);window.removeEventListener('online',ligado);window.removeEventListener('offline',desligado);document.removeEventListener('visibilitychange',focus)};
 },[sincronizar]);
 const registrar=useCallback((evento:RegionalEnsaio,grupo:'musicos'|'organistas',tipo:'cidade'|'instrumento'|'nivel',valor:string,delta:1|-1)=>{
  if(!inicio.current){setErroFila('Aguarde o carregamento do armazenamento offline.');return false}
  if(evento.status!=='aberto')return false;
  if(!valor.trim())return false;
  const chave=valor.trim();
  const total=dbRegistros.current.filter(r=>r.ensaio_id===evento.id&&r.grupo===grupo&&r.tipo===tipo&&r.valor===chave).reduce((n,r)=>n+r.quantidade,0)
   +lista.current.filter(r=>r.ensaio_id===evento.id&&r.versao===evento.contagem_versao&&r.estado!=='erro'&&r.grupo===grupo&&r.tipo===tipo&&r.valor===chave&&!dbRegistros.current.some(db=>db.client_event_id===r.id)).reduce((n,r)=>n+r.quantidade,0);
  if(delta===-1&&total<=0)return false;
  const item:LancamentoFila={
   id:crypto.randomUUID(),operadorId:operador.current,ensaio_id:evento.id,versao:evento.contagem_versao,
   grupo,tipo,valor:chave,quantidade:delta,criado_em:new Date().toISOString(),estado:'pendente'
  };
  // Resposta instantânea ao toque. O envio só começa após gravar no IndexedDB.
  atualizar([...lista.current,item]);
  void salvarFila(item).then(()=>{void sincronizar()}).catch(e=>{
   atualizar(lista.current.filter(r=>r.id!==item.id));
   setErroFila('Não foi possível guardar a contagem no celular. Lançamento NÃO contabilizado: '+String(e));
  });
  return true;
 },[atualizar,sincronizar]);
 const tentarNovamente=useCallback(async(id?:string)=>{
  for(const item of lista.current.filter(r=>r.estado==='erro'&&(!id||r.id===id))){
   const atualizado:LancamentoFila={...item,estado:'pendente',erro:undefined};
   try{await salvarFila(atualizado);atualizar(lista.current.map(r=>r.id===item.id?atualizado:r))}
   catch(e){setErroFila(String(e))}
  }
  void sincronizar();
 },[atualizar,sincronizar]);
 const descartar=useCallback(async(id:string)=>{
  const item=lista.current.find(r=>r.id===id);
  if(!item||item.estado!=='erro')return;
  await removerFila(id);
  atualizar(lista.current.filter(r=>r.id!==id));
 },[atualizar]);
 const registrosEfetivos=useMemo(()=>{
  const idsServidor=new Set(registros.map(r=>r.client_event_id).filter(Boolean));
  return [...registros,...fila.filter(item=>item.estado!=='erro'&&!idsServidor.has(item.id)&&
   ensaios.some(e=>e.id===item.ensaio_id&&e.contagem_versao===item.versao)).map(item=>({
    id:item.id,ensaio_id:item.ensaio_id,grupo:item.grupo,tipo:item.tipo,
    valor:item.valor,quantidade:item.quantidade,criado_em:item.criado_em,client_event_id:item.id
   }))];
 },[registros,fila,ensaios]);
 const pendentes=fila.filter(item=>item.estado==='pendente');
 const problemas=fila.filter(item=>item.estado==='erro');
 return {fila,pronto,online,sincronizando,erroFila,setErroFila,registrosEfetivos,pendentes,problemas,
  registrar,sincronizar,tentarNovamente,descartar,limparConfirmados};
}
