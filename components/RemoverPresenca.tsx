'use client';
import {useState} from 'react';
import {removerPresenca} from '../app/actions';
export default function RemoverPresenca({id,evento,nome}:{id:string;evento:string;nome:string}){
 const [confirmando,setConfirmando]=useState(false);
 return <div className="remove-presence">
  {!confirmando?<button type="button" className="remove-presence-button" onClick={()=>setConfirmando(true)} title={'Remover presença de '+nome}>Remover</button>:
  <form action={removerPresenca} className="remove-presence-confirm">
   <input type="hidden" name="presenca_id" value={id}/><input type="hidden" name="evento_id" value={evento}/>
   <small>Remover a presença de {nome} somente deste evento?</small>
   <div className="remove-presence-actions"><button type="submit" className="remove-presence-button">Confirmar</button><button type="button" className="remove-presence-cancel" onClick={()=>setConfirmando(false)}>Cancelar</button></div>
  </form>}
 </div>;
}