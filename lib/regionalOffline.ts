/** Lançamentos do Ensaio Regional persistidos localmente antes de enviar à internet. */
export type LancamentoFila={
 id:string;operadorId:string;ensaio_id:string;versao:number;
 grupo:'musicos'|'organistas';tipo:'cidade'|'instrumento'|'nivel';
 valor:string;quantidade:1|-1;criado_em:string;
 estado:'pendente'|'confirmado'|'erro';serverId?:string;erro?:string;
};
const NOME='ccb-ensaio-regional-offline';
const COLECAO='lancamentos';
function abrir():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  if(typeof indexedDB==='undefined'){reject(new Error('Este navegador não permite armazenamento offline.'));return}
  const request=indexedDB.open(NOME,1);
  request.onupgradeneeded=()=>{
   if(!request.result.objectStoreNames.contains(COLECAO))
    request.result.createObjectStore(COLECAO,{keyPath:'id'});
  };
  request.onerror=()=>reject(request.error||new Error('Não foi possível abrir a fila offline.'));
  request.onblocked=()=>reject(new Error('Feche outras abas antigas do sistema para liberar a fila offline.'));
  request.onsuccess=()=>resolve(request.result);
 });
}
export async function lerFila(operadorId:string):Promise<LancamentoFila[]>{
 const db=await abrir();
 try{
  return await new Promise((resolve,reject)=>{
   const tx=db.transaction(COLECAO,'readonly');
   const req=tx.objectStore(COLECAO).getAll();
   req.onsuccess=()=>resolve((req.result as LancamentoFila[]).filter(r=>r.operadorId===operadorId).sort((a,b)=>a.criado_em.localeCompare(b.criado_em)));
   req.onerror=()=>reject(req.error||new Error('Falha ao ler contagens salvas neste aparelho.'));
  });
 }finally{db.close()}
}
export async function salvarFila(item:LancamentoFila):Promise<void>{
 const db=await abrir();
 try{
  await new Promise<void>((resolve,reject)=>{
   const tx=db.transaction(COLECAO,'readwrite');
   tx.objectStore(COLECAO).put(item);
   tx.oncomplete=()=>resolve();
   tx.onerror=()=>reject(tx.error||new Error('Não foi possível guardar o lançamento.'));
   tx.onabort=()=>reject(tx.error||new Error('Gravação offline cancelada.'));
  });
 }finally{db.close()}
}
export async function removerFila(id:string):Promise<void>{
 const db=await abrir();
 try{
  await new Promise<void>((resolve,reject)=>{
   const tx=db.transaction(COLECAO,'readwrite');
   tx.objectStore(COLECAO).delete(id);
   tx.oncomplete=()=>resolve();
   tx.onerror=()=>reject(tx.error||new Error('Falha ao remover lançamento confirmado.'));
   tx.onabort=()=>reject(tx.error||new Error('Remoção offline cancelada.'));
  });
 }finally{db.close()}
}
