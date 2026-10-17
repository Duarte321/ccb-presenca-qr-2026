'use client';
import {useMemo,useState} from 'react';
type Evento={id:string;titulo:string;local:string;inicio:string};
type Pessoa={id:string;nome:string;congregacao:string;categoria:string;cargo_ministerio:string|null};
type Registro={evento_id:string;participante_id:string};
export default function RelatorioGeral({eventos,pessoas,presencas,esperados}:{eventos:Evento[];pessoas:Pessoa[];presencas:Registro[];esperados:Registro[]}){
 const [selecionados,setSelecionados]=useState(eventos.map(e=>e.id));
 const [comum,setComum]=useState('');const [cargo,setCargo]=useState('');const [busca,setBusca]=useState('');
 const comuns=[...new Set(pessoas.map(p=>p.congregacao).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 const cargos=[...new Set(pessoas.map(p=>p.cargo_ministerio||'').filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 const ids=new Set(selecionados);
 const confirmadas=useMemo(()=>new Set(presencas.filter(p=>ids.has(p.evento_id)).map(p=>p.evento_id+'|'+p.participante_id)),[presencas,selecionados]);
 const previstas=useMemo(()=>new Set(esperados.filter(p=>ids.has(p.evento_id)).map(p=>p.evento_id+'|'+p.participante_id)),[esperados,selecionados]);
 const finalizados=new Set(eventos.filter(e=>!('aberto' in e)||!(e as Evento&{aberto:boolean}).aberto).map(e=>e.id));
 const linhas=useMemo(()=>pessoas.filter(p=>(!comum||p.congregacao===comum)&&(!cargo||p.cargo_ministerio===cargo)&&[p.nome,p.congregacao,p.cargo_ministerio,p.categoria].join(' ').toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR'))).map(p=>{
  const presenca=selecionados.filter(id=>confirmadas.has(id+'|'+p.id)).length;
  const previsto=selecionados.filter(id=>finalizados.has(id)&&previstas.has(id+'|'+p.id));
  const acertos=previsto.filter(id=>confirmadas.has(id+'|'+p.id)).length;
  return {...p,presenca,esperados:previsto.length,frequencia:previsto.length?Math.round(acertos/previsto.length*100):null};
 }).sort((a,b)=>b.presenca-a.presenca||a.nome.localeCompare(b.nome,'pt-BR')),[pessoas,comum,cargo,busca,selecionados,confirmadas,previstas]);
 const resumo=useMemo(()=>Object.entries(linhas.reduce<Record<string,{pessoas:number;presencas:number}>>((map,p)=>{const key=p.congregacao||'Não informada';if(!map[key])map[key]={pessoas:0,presencas:0};map[key].pessoas++;map[key].presencas+=p.presenca;return map},{})).sort((a,b)=>a[0].localeCompare(b[0],'pt-BR')),[linhas]);
 return <section className="card report report-geral"><div className="report-head"><div><span className="eyebrow">NOVO RELATÓRIO</span><h2>Relatório Geral de Frequência</h2><p>Compare todas as atividades ou apenas os eventos selecionados.</p></div><button type="button" onClick={()=>window.print()}>Imprimir / Salvar PDF</button></div>
 <div className="general-report-controls"><label>Comum Congregação<select value={comum} onChange={e=>setComum(e.target.value)}><option value="">Todas as congregações</option>{comuns.map(x=><option key={x} value={x}>{x}</option>)}</select></label><label>Cargo / Ministério<select value={cargo} onChange={e=>setCargo(e.target.value)}><option value="">Todos os cargos</option>{cargos.map(x=><option key={x} value={x}>{x}</option>)}</select></label><label>Pesquisar pessoa<input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Nome do participante"/></label></div>
 <div className="general-event-filter"><div className="management-head"><h3>Eventos incluídos ({selecionados.length}/{eventos.length})</h3><div className="management-actions"><button type="button" className="muted-button" onClick={()=>setSelecionados(eventos.map(e=>e.id))}>Todos</button><button type="button" className="muted-button" onClick={()=>setSelecionados([])}>Limpar</button></div></div><div className="general-event-list">{eventos.map(e=><label key={e.id}><input type="checkbox" checked={ids.has(e.id)} onChange={v=>setSelecionados(s=>v.target.checked?[...s,e.id]:s.filter(id=>id!==e.id))}/>{e.titulo} • {new Date(e.inicio).toLocaleDateString('pt-BR',{timeZone:'America/Cuiaba'})}</label>)}</div></div>
 <div className="print-only"><h3>Secretaria da Música — Relatório Geral de Frequência</h3><p>Congregação: {comum||'Todas'} • Cargo: {cargo||'Todos'} • Eventos selecionados: {selecionados.length}</p><p>Eventos: {eventos.filter(e=>ids.has(e.id)).map(e=>e.titulo+' ('+new Date(e.inicio).toLocaleDateString('pt-BR',{timeZone:'America/Cuiaba'})+')').join('; ')||'Nenhum'}</p></div>
 <div className="grid"><div className="card stat"><div className="label">Eventos selecionados</div><div className="number">{selecionados.length}</div></div><div className="card stat"><div className="label">Participantes filtrados</div><div className="number">{linhas.length}</div></div><div className="card stat"><div className="label">Presenças acumuladas</div><div className="number">{linhas.reduce((a,p)=>a+p.presenca,0)}</div></div></div>
 <h3>Resumo por Comum Congregação</h3><div className="report-table-wrap"><table><thead><tr><th>Comum Congregação</th><th>Participantes</th><th>Presenças acumuladas</th></tr></thead><tbody>{resumo.map(([nome,s])=><tr key={nome}><td><strong>{nome}</strong></td><td>{s.pessoas}</td><td>{s.presencas}</td></tr>)}</tbody></table></div>
 <h3>Presenças por participante</h3><div className="report-table-wrap"><table><thead><tr><th>Nome</th><th>Comum Congregação</th><th>Cargo / Ministério</th><th>Vezes presente</th><th>Frequência*</th></tr></thead><tbody>{linhas.map(p=><tr key={p.id}><td><strong>{p.nome}</strong></td><td>{p.congregacao}</td><td>{p.cargo_ministerio||p.categoria}</td><td><strong>{p.presenca}</strong></td><td>{p.frequencia===null?'—':p.frequencia+'% ('+p.esperados+' previstos)'}</td></tr>)}</tbody></table></div>
 <p className="muted">* Frequência: apenas eventos finalizados com lista de presença esperada. “Vezes presente” conta os registros QR dos eventos selecionados, mesmo que não houvesse lista esperada. Para obter PDF, use Imprimir / Salvar PDF e escolha “Salvar como PDF”.</p></section>
}
