import Link from 'next/link';
import {redirect,notFound} from 'next/navigation';
import {serverDb} from '../../../../lib/supabase';
import SelecionarEsperados from '../../../../components/SelecionarEsperados';
export default async function Esperados({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const db=await serverDb();
 const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login');
 const [{data:op},{data:evento},{data:pessoas},{data:esperados},{data:presencas}]=await Promise.all([
 db.from('operadores').select('perfil').eq('user_id',user.id).single(),
 db.from('eventos').select('id,titulo,local,aberto,inicio').eq('id',id).maybeSingle(),
 db.from('participantes').select('id,nome,congregacao,categoria,cargo_ministerio').eq('ativo',true).order('nome').limit(2000),
 db.from('presencas_esperadas').select('participante_id').eq('evento_id',id),
 db.from('presencas').select('participante_id').eq('evento_id',id)
 ]);
 if(!evento)notFound();
 const podeEditar=['admin','secretaria'].includes(op?.perfil||'');
 const marcados=(esperados||[]).map(x=>x.participante_id);
 const presentes=new Set((presencas||[]).map(x=>x.participante_id));
 const presentesEsperados=marcados.filter(x=>presentes.has(x)).length;
 return <main><Link href="/eventos">← Voltar aos eventos</Link><span className="eyebrow">LISTA DE PARTICIPAÇÃO</span><h1>Presença esperada</h1><p className="subtitle">{evento.titulo} • {evento.local}</p>
 <div className="grid"><div className="card"><strong>Esperados</strong><h2>{marcados.length}</h2></div><div className="card"><strong>Presentes esperados</strong><h2>{presentesEsperados}</h2></div><div className="card"><strong>Não registrados</strong><h2>{marcados.length-presentesEsperados}</h2></div></div>
 <section className="card"><h2>Participantes previstos para esta atividade</h2><p className="muted">Somente participantes selecionados são considerados no cálculo de frequência. Participantes sem previsão não recebem ausência.</p>
 {podeEditar&&evento.aberto?<SelecionarEsperados evento={id} pessoas={(pessoas||[]) as any} selecionados={marcados}/>:
 <><p className="muted">{!evento.aberto?'Evento finalizado: reabra para editar a lista.':'Somente administradores e secretaria podem editar.'}</p><div className="expected-list">{(pessoas||[]).filter(p=>marcados.includes(p.id)).map(p=><p key={p.id}>{p.nome} — {presentes.has(p.id)?'Presente':'Sem registro'}</p>)}</div></>}
 </section></main>;
}
