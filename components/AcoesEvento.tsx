'use client';
import {useState} from 'react';
import {editarEvento,finalizarPortaria,reabrirPortaria,excluirEvento} from '../app/actions';
type Props={id:string;titulo:string;local:string;inicio:string;aberto:boolean;role:string;presencas:number};
export default function AcoesEvento({id,titulo,local,inicio,aberto,role,presencas}:Props){
 const [editando,setEditando]=useState(false);
 const [confirmarExclusao,setConfirmarExclusao]=useState(false);
 const podeGerenciar=role==='admin'||role==='secretaria';
 const podeExcluir=role==='admin'&&presencas===0;
 const dataLocal=new Date(inicio).toLocaleString('sv-SE',{timeZone:'America/Cuiaba',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(' ','T');
 if(!podeGerenciar)return null;
 return <div className="event-actions">
  <div className="event-actions-bar">
   <button type="button" className="event-action edit" onClick={()=>setEditando(!editando)}>{editando?'Cancelar edição':'✎ Editar'}</button>
   <form action={aberto?finalizarPortaria:reabrirPortaria} onSubmit={e=>{if(!window.confirm(aberto?'Finalizar a portaria? Não serão aceitas novas entradas neste evento.':'Reabrir a portaria para novas entradas?'))e.preventDefault();}}>
    <input type="hidden" name="id" value={id}/><button type="submit" className="event-action finish">{aberto?'✓ Finalizar portaria':'↻ Reabrir portaria'}</button>
   </form>
   {role==='admin'&&<button className="event-action remove" type="button" disabled={!podeExcluir} title={!podeExcluir?'Este evento possui presenças e deve ser preservado.':undefined} onClick={()=>setConfirmarExclusao(v=>!v)}>Excluir</button>}
  </div>
  {editando&&<form action={editarEvento} className="event-edit-form">
   <input type="hidden" name="id" value={id}/>
   <label>Nome do evento<input name="titulo" defaultValue={titulo} required maxLength={150}/></label>
   <label>Local<input name="local" defaultValue={local} required maxLength={150}/></label>
   <label>Data e horário (MT)<input name="inicio" type="datetime-local" defaultValue={dataLocal} required/></label>
   <button type="submit">Salvar alterações</button>
  </form>}
  {confirmarExclusao&&podeExcluir&&<form action={excluirEvento} className="event-delete-confirm">
   <input type="hidden" name="id" value={id}/>
   <p>Excluir definitivamente este evento sem presenças? Esta ação não pode ser desfeita.</p>
   <button type="submit" className="event-action remove">Confirmar exclusão</button>
   <button type="button" className="event-action edit" onClick={()=>setConfirmarExclusao(false)}>Cancelar</button>
  </form>}
  {presencas>0&&role==='admin'&&<small className="muted">Exclusão bloqueada: {presencas} presença(s) vinculada(s) a este evento.</small>}
 </div>;
}
