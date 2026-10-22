import {redirect,notFound} from 'next/navigation';
import {serverDb} from '../../../../lib/supabase';
import RegionalPrintButton from '../../../../components/RegionalPrintButton';
export const dynamic='force-dynamic';
const instrumentos=["Violinos","Viola","Violoncelos","Acordeon","Flautas","Oboé","Oboé d'Amore","Corne Inglês","Fagote","Clarinetes","Clarone Alto","Clarone Baixo","Saxofones Sopranos","Saxofones Altos","Saxofones Tenores","Saxofones Barítonos","Cornet","Trompetes","FlugelHorn","Trompa","Trombones","Trombonito","Barítono de pisto","Eufônios","Tubas"];
type Contagem={grupo:string;tipo:string;valor:string;quantidade:number};
function tabela(titulo:string,linhas:[string,number][],total:number){return <section className="rd-section"><h2>{titulo}</h2><table><thead><tr><th>Descrição</th><th>Quantidade</th></tr></thead><tbody>{linhas.map(([nome,qt])=><tr key={nome}><td>{nome}</td><td>{qt}</td></tr>)}<tr className="rd-total"><td>Total</td><td>{total}</td></tr></tbody></table></section>}
export default async function RelatorioRegional({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const db=await serverDb();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login');
 const {data:perfilRegional}=await db.from('operadores').select('perfil').eq('user_id',user.id).maybeSingle();
 if(!['admin','secretaria'].includes(perfilRegional?.perfil||''))redirect('/ensaio-regional');
 const [{data:evento,error},{data:registros,error:erroContagem}]=await Promise.all([db.from('ensaios_regionais').select('id,titulo,local,data,status').eq('id',id).maybeSingle(),db.from('contagens_regionais').select('grupo,tipo,valor,quantidade').eq('ensaio_id',id).limit(50000)]);
 if(error||erroContagem||!evento)notFound();
 const rows=(registros||[]) as Contagem[];
 const quantidade=(grupo:string,tipo:string,nome?:string)=>rows.filter(r=>r.grupo===grupo&&r.tipo===tipo&&(nome===undefined||r.valor===nome)).reduce((n,r)=>n+r.quantidade,0);
 const musicosCidade=quantidade('musicos','cidade'),musicosInstrumento=quantidade('musicos','instrumento'),organistasCidade=quantidade('organistas','cidade'),organistasNivel=quantidade('organistas','nivel');
 const cidades=(grupo:string):[string,number][]=>Array.from(new Set(rows.filter(r=>r.grupo===grupo&&r.tipo==='cidade').map(r=>r.valor))).sort((a,b)=>a.localeCompare(b,'pt-BR')).map(v=>[v,quantidade(grupo,'cidade',v)]).filter(([,n])=>Number(n)>0) as [string,number][];
 const data=evento.data.split('-').reverse().join('/');
 const conferido=musicosCidade===musicosInstrumento&&organistasCidade===organistasNivel;
 return <main className="regional-document"><div className="rd-toolbar"><a href="/ensaio-regional">← Voltar ao ensaio</a><span>Relatório exclusivo para impressão · formato A4</span><RegionalPrintButton/></div>
 <article className="rd-paper"><header className="rd-head"><div className="rd-kicker">RESUMO MUSICAL · ENSAIO REGIONAL</div><h1>{evento.titulo}</h1><p>Relatório consolidado de músicos e organistas</p><div className="rd-meta"><span><strong>Local</strong>{evento.local||'Não informado'}</span><span><strong>Data</strong>{data}</span><span><strong>Situação</strong>{evento.status==='finalizado'?'Finalizado':'Em andamento'}</span></div></header>
 <div className="rd-cards"><div><small>MÚSICOS (INSTRUMENTOS)</small><strong>{musicosInstrumento}</strong></div><div><small>ORGANISTAS (NÍVEIS)</small><strong>{organistasNivel}</strong></div><div><small>TOTAL GERAL</small><strong>{musicosInstrumento+organistasNivel}</strong></div></div>
 <div className={'rd-validation '+(conferido?'rd-valid':'rd-alert')}><strong>{conferido?'✓ Totais correspondentes':'⚠ Contagens ainda não conferidas'}</strong><span>Músicos: cidades {musicosCidade} × instrumentos {musicosInstrumento} · Organistas: cidades {organistasCidade} × níveis {organistasNivel}</span></div>
 {tabela('01 · Músicos por instrumento / naipe',instrumentos.map(v=>[v,quantidade('musicos','instrumento',v)] as [string,number]),musicosInstrumento)}
 {tabela('02 · Músicos por cidade',cidades('musicos'),musicosCidade)}
 {tabela('03 · Organistas por nível',(['Oficializada','RDJ','Culto Oficial'] as string[]).map(v=>[v,quantidade('organistas','nivel',v)]),organistasNivel)}
 {tabela('04 · Organistas por cidade',cidades('organistas'),organistasCidade)}
 <section className="rd-official"><strong>OFICIALIZAÇÃO</strong><span>Músicos: 0</span><span>Organistas: 0</span><span>Total: 0</span></section>
 <footer className="rd-footer"><p>Documento gerado a partir dos registros do Ensaio Regional. Os totais são apresentados por critérios independentes para evitar contagem em duplicidade.</p><p>Os valores devem ser conferidos antes da finalização. Este resumo é complementar ao formulário original da Secretaria da Música.</p></footer></article>

 </main>;
}
