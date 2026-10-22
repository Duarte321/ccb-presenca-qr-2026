'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';
import {editarParticipante,alterarCredencial} from '../app/advanced-actions';import Credencial from './Credencial';import FormConfirmacao from './FormConfirmacao';
type Pessoa={id:string;nome:string;congregacao:string;categoria:string;instrumento:string|null;cargo_ministerio:string|null;credenciais_qr:{token:string;ativo:boolean}[]};
export default function GerenciarParticipantes({pessoas}:{pessoas:Pessoa[]}){
 const [busca,setBusca]=useState('');
 const [cargo,setCargo]=useState('todos');
 const [congregacao,setCongregacao]=useState('todas');
 const [editando,setEditando]=useState<string|null>(null);
 const normalizar=(valor:string)=>valor.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
 const cargos=useMemo(()=>[...new Set(pessoas.map(p=>p.cargo_ministerio?.trim()||'').filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR')),[pessoas]);
 const congregacoes=useMemo(()=>[...new Set(pessoas.map(p=>p.congregacao?.trim()||'').filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR')),[pessoas]);
 const filtradas=useMemo(()=>pessoas.filter(p=>
 (cargo==='todos'||normalizar(p.cargo_ministerio||'')===normalizar(cargo))&&
 (congregacao==='todas'||normalizar(p.congregacao)===normalizar(congregacao))&&
 [p.nome,p.congregacao,p.categoria,p.instrumento,p.cargo_ministerio].join(' ').toLocaleLowerCase('pt-BR').includes(busca.trim().toLocaleLowerCase('pt-BR'))
 ),[pessoas,busca,cargo,congregacao]);
 return <><div className="participant-filters">
 <label className="filter-label">Buscar participante<input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Nome, congregação, instrumento ou cargo" /></label>
 <label className="filter-label">Cargo / Ministério<select value={cargo} onChange={e=>setCargo(e.target.value)}><option value="todos">Todos os cargos</option>{cargos.map(item=><option key={item} value={item}>{item}</option>)}</select></label>
 <label className="filter-label">Congregação<select value={congregacao} onChange={e=>setCongregacao(e.target.value)}><option value="todas">Todas as congregações</option>{congregacoes.map(item=><option key={item} value={item}>{item}</option>)}</select></label>
 </div><p className="muted" role="status">{filtradas.length} de {pessoas.length} participante(s) exibidos</p>

 {filtradas.map(p=><div key={p.id} className="card participant-unified" style={{padding:16}}>
 <div className="management-head"><div><strong>{p.nome}</strong><p className="muted">Comum: {p.congregacao} • {p.cargo_ministerio||p.categoria} • {p.instrumento||'Sem instrumento'}</p></div>
 <div className="management-actions"><Link href={'/participantes/'+p.id+'/historico'} className="action-link secondary">Histórico de presença</Link><button type="button" onClick={()=>setEditando(editando===p.id?null:p.id)}>{editando===p.id?'Fechar':'Editar cadastro'}</button></div></div>
 {editando===p.id&&<FormConfirmacao action={editarParticipante} mensagemSucesso="Cadastro do participante atualizado com sucesso!" aoSalvar={()=>setEditando(null)} className="event-edit-form">
 <input type="hidden" name="id" value={p.id}/>
 <div className="form-grid"><label>Nome<input name="nome" required defaultValue={p.nome}/></label>
 <label>Comum Congregação<input name="congregacao" required defaultValue={p.congregacao}/></label>
 <label>Categoria<select name="categoria" defaultValue={p.categoria}>{['Musico','Organista','Aprendiz','Instrutor','Outro'].map(c=><option key={c} value={c}>{c}</option>)}</select></label>
 <label>Instrumento<input name="instrumento" defaultValue={p.instrumento||''}/></label>
 <label>Cargo / Ministério<input name="cargo_ministerio" defaultValue={p.cargo_ministerio||''}/></label></div><button type="submit">Salvar alterações</button></FormConfirmacao>}
 <div className="management-head"><small className="muted">{p.credenciais_qr?.some(c=>c.ativo)?'QR ativo':'QR bloqueado'}</small><div className="management-actions">
 {p.credenciais_qr?.some(c=>c.ativo)&&<FormConfirmacao action={alterarCredencial} mensagemSucesso="QR Code bloqueado com sucesso!" confirmacao="Bloquear QR atual?"><input type="hidden" name="id" value={p.id}/><input type="hidden" name="acao" value="bloquear"/><button type="submit" className="muted-button">Bloquear QR</button></FormConfirmacao>}
 <FormConfirmacao action={alterarCredencial} mensagemSucesso="QR Code renovado com sucesso!" confirmacao="Renovar QR e invalidar o anterior?"><input type="hidden" name="id" value={p.id}/><input type="hidden" name="acao" value="renovar"/><button type="submit">Renovar QR</button></FormConfirmacao></div></div>{p.credenciais_qr?.find(q=>q.ativo)&&<Credencial token={p.credenciais_qr.find(q=>q.ativo)!.token} nome={p.nome} congregacao={p.congregacao} categoria={p.categoria} instrumento={p.instrumento} cargoMinisterio={p.cargo_ministerio}/>}</div>)}</>;
}