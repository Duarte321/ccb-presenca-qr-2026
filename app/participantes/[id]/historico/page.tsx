import {exigirModulo} from '../../../../lib/acesso';
import Link from 'next/link';
import {redirect,notFound} from 'next/navigation';
import {serverDb} from '../../../../lib/supabase';
export default async function Historico({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const db=await serverDb();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login');
 await exigirModulo(db,user.id,'participantes');
 const [{data:pessoa},{data:esperados},{data:presencas}]=await Promise.all([
 db.from('participantes').select('id,nome,congregacao,categoria,cargo_ministerio,instrumento').eq('id',id).maybeSingle(),
 db.from('presencas_esperadas').select('evento_id,eventos(id,titulo,local,inicio,aberto)').eq('participante_id',id).limit(1000),
 db.from('presencas').select('evento_id,registrado_em,eventos(id,titulo,local,inicio,aberto)').eq('participante_id',id).limit(1000)]);
 if(!pessoa)notFound();
 type Evento={id:string;titulo:string;local:string;inicio:string;aberto:boolean};
 const tomar=(v:any):Evento|null=>Array.isArray(v)?v[0]||null:v||null;
 const confirmadas=new Map((presencas||[]).map(p=>[p.evento_id,p.registrado_em]));
 const encerrados=(esperados||[]).map(e=>tomar(e.eventos)).filter((e):e is Evento=>!!e&&!e.aberto);
 const pres=encerrados.filter(e=>confirmadas.has(e.id)).length;
 const aus=encerrados.length-pres;
 const taxa=encerrados.length?Math.round(pres/encerrados.length*100):null;
 const historico=new Map<string,{e:Evento;status:string}>();
 for(const e of encerrados)historico.set(e.id,{e,status:confirmadas.has(e.id)?'Presente':'Ausente'});
 for(const p of presencas||[]){const e=tomar(p.eventos);if(e&&!historico.has(e.id))historico.set(e.id,{e,status:e.aberto?'Presença registrada (evento aberto)':'Presente (fora da lista esperada)'});}
 const rows=[...historico.values()].sort((a,b)=>new Date(b.e.inicio).getTime()-new Date(a.e.inicio).getTime());
 return <main><Link href="/participantes">← Participantes</Link><span className="eyebrow">HISTÓRICO INDIVIDUAL</span><h1>{pessoa.nome}</h1><p className="subtitle">{pessoa.congregacao} • {pessoa.cargo_ministerio||pessoa.categoria} {pessoa.instrumento?'• '+pessoa.instrumento:''}</p>
 <div className="grid"><article className="card stat"><div className="label">Presenças previstas confirmadas</div><div className="number">{pres}</div></article><article className="card stat"><div className="label">Ausências em eventos finalizados</div><div className="number">{aus}</div></article><article className="card stat"><div className="label">Frequência</div><div className="number">{taxa===null?'—':taxa+'%'}</div></article></div>
 <p className="muted">Frequência calculada apenas nos eventos finalizados em que este participante consta na lista esperada. Presenças extras e eventos em aberto aparecem no histórico, mas não entram no percentual. Eventos antigos sem lista esperada não geram ausência.</p>
 <section className="card"><h2>Atividades registradas</h2>{rows.length===0?<p className="muted">Ainda não existem atividades com presença registrada ou previsão para este participante.</p>:<div className="presence-list">{rows.map(({e,status})=><div key={e.id} className="presence-item"><div><strong>{e.titulo}</strong><p className="muted">{e.local} • {new Date(e.inicio).toLocaleString('pt-BR',{timeZone:'America/Cuiaba'})}</p></div><span className="pill">{status}</span></div>)}</div>}</section>
 </main>;
}
