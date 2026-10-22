'use client';
import {useMemo,useState} from 'react';
import {salvarEsperados} from '../app/eventos/[id]/esperados/actions';import FormConfirmacao from './FormConfirmacao';
type Pessoa={id:string;nome:string;congregacao:string;categoria:string;cargo_ministerio:string|null};
export default function SelecionarEsperados({evento,pessoas,selecionados}:{evento:string;pessoas:Pessoa[];selecionados:string[]}){
 const [ids,setIds]=useState<string[]>(selecionados);const [busca,setBusca]=useState('');const [congregacao,setCongregacao]=useState('');
 const congregacoes=[...new Set(pessoas.map(p=>p.congregacao))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 const visiveis=useMemo(()=>pessoas.filter(p=>(!congregacao||p.congregacao===congregacao)&&[p.nome,p.congregacao,p.cargo_ministerio,p.categoria].join(' ').toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR'))),[busca,congregacao,pessoas]);
 const marcar=(id:string,on:boolean)=>setIds(atual=>on?[...new Set([...atual,id])]:atual.filter(x=>x!==id));
 return <FormConfirmacao action={salvarEsperados} mensagemSucesso="Lista de participantes esperados salva com sucesso!" className="expected-form"><input type="hidden" name="evento" value={evento}/>{ids.map(id=><input key={id} type="hidden" name="participantes" value={id}/>)}
 <div className="participant-filters"><label>Buscar<input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Nome, cargo ou congregação"/></label><label>Congregação<select value={congregacao} onChange={e=>setCongregacao(e.target.value)}><option value="">Todas</option>{congregacoes.map(v=><option value={v} key={v}>{v}</option>)}</select></label></div>
 <p className="muted">{ids.length} selecionado(s) • {visiveis.length} resultado(s)</p>
 <div className="management-actions"><button type="button" className="muted-button" onClick={()=>setIds(atual=>[...new Set([...atual,...visiveis.map(p=>p.id)])])}>Selecionar visíveis</button><button type="button" className="muted-button" onClick={()=>setIds(atual=>atual.filter(id=>!visiveis.some(p=>p.id===id)))}>Desmarcar visíveis</button></div>
 <div className="expected-list">{visiveis.map(p=><label key={p.id} className="expected-item"><input type="checkbox" checked={ids.includes(p.id)} onChange={e=>marcar(p.id,e.target.checked)}/><span><strong>{p.nome}</strong><small>{p.congregacao} • {p.cargo_ministerio||p.categoria}</small></span></label>)}</div>
 <button type="submit">Salvar lista de participantes esperados</button>
 </FormConfirmacao>;
}
