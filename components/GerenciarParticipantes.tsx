'use client';
import {useMemo,useState} from 'react';
import {editarParticipante,alterarCredencial} from '../app/advanced-actions';
type Pessoa={id:string;nome:string;congregacao:string;categoria:string;instrumento:string|null;cargo_ministerio:string|null;credenciais_qr:{token:string;ativo:boolean}[]};
export default function GerenciarParticipantes({pessoas}:{pessoas:Pessoa[]}){
 const [busca,setBusca]=useState('');const [editando,setEditando]=useState<string|null>(null);
 const filtradas=useMemo(()=>pessoas.filter(p=>[p.nome,p.congregacao,p.instrumento,p.cargo_ministerio].join(' ').toLowerCase().includes(busca.toLowerCase())),[pessoas,busca]);
 return <><label className="filter-label">Buscar participante<input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Nome, congregação, instrumento ou cargo" /></label><p className="muted">{filtradas.length} participante(s)</p>
 {filtradas.map(p=><div key={p.id} className="card" style={{padding:16}}>
 <div className="management-head"><div><strong>{p.nome}</strong><p className="muted">Comum: {p.congregacao} • {p.cargo_ministerio||p.categoria} • {p.instrumento||'Sem instrumento'}</p></div>
 <button type="button" onClick={()=>setEditando(editando===p.id?null:p.id)}>{editando===p.id?'Fechar':'Editar cadastro'}</button></div>
 {editando===p.id&&<form action={editarParticipante} className="event-edit-form">
 <input type="hidden" name="id" value={p.id}/>
 <div className="form-grid"><label>Nome<input name="nome" required defaultValue={p.nome}/></label>
 <label>Comum Congregação<input name="congregacao" required defaultValue={p.congregacao}/></label>
 <label>Categoria<select name="categoria" defaultValue={p.categoria}>{['Musico','Organista','Aprendiz','Instrutor','Outro'].map(c=><option key={c} value={c}>{c}</option>)}</select></label>
 <label>Instrumento<input name="instrumento" defaultValue={p.instrumento||''}/></label>
 <label>Cargo / Ministério<input name="cargo_ministerio" defaultValue={p.cargo_ministerio||''}/></label></div><button type="submit">Salvar alterações</button></form>}
 <div className="management-head"><small className="muted">{p.credenciais_qr?.some(c=>c.ativo)?'QR ativo':'QR bloqueado'}</small><div className="management-actions">
 {p.credenciais_qr?.some(c=>c.ativo)&&<form action={alterarCredencial} onSubmit={e=>{if(!confirm('Bloquear QR atual?'))e.preventDefault();}}><input type="hidden" name="id" value={p.id}/><input type="hidden" name="acao" value="bloquear"/><button type="submit" className="muted-button">Bloquear QR</button></form>}
 <form action={alterarCredencial} onSubmit={e=>{if(!confirm('Renovar QR e invalidar o anterior?'))e.preventDefault();}}><input type="hidden" name="id" value={p.id}/><input type="hidden" name="acao" value="renovar"/><button type="submit">Renovar QR</button></form></div></div></div>)}</>;
}