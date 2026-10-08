'use client';
import {useState} from 'react';
type P={id:string;nome:string;congregacao:string;categoria:string;instrumento:string|null;cargo_ministerio:string|null;registrado_em:string;participante_id:string};
export default function Relatorio({titulo,local,inicio,presencas}:{titulo:string;local:string;inicio:string;presencas:P[]}){
 const [busca,setBusca]=useState('');
 const lista=presencas.filter(p=>[p.nome,p.congregacao,p.instrumento,p.cargo_ministerio].join(' ').toLowerCase().includes(busca.toLowerCase()));
 const contar=(chave:'instrumento'|'congregacao'|'cargo_ministerio')=>Object.entries(presencas.reduce<Record<string,number>>((o,p)=>{const k=p[chave]||'Não informado';o[k]=(o[k]||0)+1;return o},{})).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'pt-BR'));
 const musicos=presencas.filter(p=>p.categoria!=='Organista').length,organistas=presencas.filter(p=>p.categoria==='Organista').length;
 return <section className="card report"><div className="report-head"><div><h2>{titulo}</h2><p>{local} • {new Date(inicio).toLocaleString('pt-BR',{timeZone:'America/Cuiaba'})}</p></div><button className="report-print-button" type="button" onClick={()=>window.print()}>Imprimir / Salvar PDF</button></div>
 <div className="grid"><div className="card stat"><div className="label">Total de presenças</div><div className="number">{presencas.length}</div></div><div className="card stat"><div className="label">Músicos e outros</div><div className="number">{musicos}</div></div><div className="card stat"><div className="label">Organistas</div><div className="number">{organistas}</div></div></div>
 <div className="report-groups"><div><h3>Por instrumento</h3>{contar('instrumento').map(([k,v])=><p key={k}>{k}: <strong>{v}</strong></p>)}</div><div><h3>Por congregação</h3>{contar('congregacao').map(([k,v])=><p key={k}>{k}: <strong>{v}</strong></p>)}</div><div><h3>Cargo / Ministério</h3>{contar('cargo_ministerio').map(([k,v])=><p key={k}>{k}: <strong>{v}</strong></p>)}</div></div>
 <label className="report-search">Pesquisar presença<input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Nome, congregação ou instrumento"/></label>
 <div className="report-table-wrap"><table><thead><tr><th>Nome</th><th>Comum Congregação</th><th>Instrumento</th><th>Cargo / Ministério</th><th>Entrada</th></tr></thead><tbody>{lista.map(p=><tr key={p.id}><td>{p.nome}</td><td>{p.congregacao}</td><td>{p.instrumento||'—'}</td><td>{p.cargo_ministerio||'—'}</td><td>{new Date(p.registrado_em).toLocaleTimeString('pt-BR',{timeZone:'America/Cuiaba'})}</td></tr>)}</tbody></table></div>
 <p className="muted">Para gerar o PDF, clique em Imprimir / Salvar PDF e escolha “Salvar como PDF” no navegador. O resumo inclui apenas presenças confirmadas no Supabase.</p>
 </section>;
}
