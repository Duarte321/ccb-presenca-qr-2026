import {redirect,notFound} from 'next/navigation';
import {serverDb} from '../../../../lib/supabase';
import {salvarFormularioCCB} from '../../actions';
import RegionalPrintButton from '../../../../components/RegionalPrintButton';
export const dynamic='force-dynamic';
const ministerio=["Anciães","Diáconos","Cooperadores Oficiais","Cooperadores de Jovens e Menores","Encarregados Regionais","Examinadora","Encarregados Locais","Instrutores","Professoras","Irmãos do Dpto Musical","Irmãos/Irmãs Colaboradores (Libras, Porta, Som, Pátio, etc)"];
const instrumentos=["Violinos","Viola","Violoncelos","Acordeon","Flautas","Oboé","Oboé d'Amore","Corne Inglês","Fagote","Clarinetes","Clarone Alto","Clarone Baixo","Saxofones Sopranos","Saxofones Altos","Saxofones Tenores","Saxofones Barítonos","Cornet","Trompetes","FlugelHorn","Trompa","Trombones","Trombonito","Barítono de pisto","Eufônios","Tubas"];
type Contagem={grupo:string;tipo:string;valor:string;quantidade:number};
type Valores={anciao:string;encarregado_regional:string;ministerio:Record<string,number>};
function Via({evento,valor,qt,musicos,organistas}:{evento:{titulo:string;local:string;data:string};valor:Valores;qt:(grupo:string,tipo:string,nome?:string)=>number;musicos:number;organistas:number}){
 const linha=(nome:string,n:number,classe='')=><tr key={nome} className={classe}><td className="ccb-num">{n}</td><td>{nome}</td></tr>;
 return <div className="ccb-via"><table className="ccb-form-table"><thead><tr><th colSpan={2} className="ccb-name">CONGREGAÇÃO CRISTÃ NO BRASIL</th></tr><tr><th colSpan={2} className="ccb-subtitle">ENSAIO REGIONAL</th></tr><tr><th colSpan={2} className="ccb-city">{evento.local||'LOCAL NÃO INFORMADO'}</th></tr></thead><tbody>
 <tr><td className="ccb-label">DATA:</td><td>{evento.data.split('-').reverse().join('/')}</td></tr>
 <tr><td className="ccb-label">ANCIÃO:</td><td>{valor.anciao||' '}</td></tr>
 <tr><td className="ccb-label">ENC. REG.</td><td>{valor.encarregado_regional||' '}</td></tr>
 {ministerio.map(nome=>linha(nome,Number(valor.ministerio[nome]||0)))}
 {instrumentos.map(nome=>linha(nome,qt('musicos','instrumento',nome)))}
 {linha('TOTAL DE MÚSICOS*',musicos,'ccb-highlight')}
 {linha('TOTAL DE ORGANISTAS',organistas,'ccb-highlight')}
 {linha('TOTAL GERAL DE MÚSICOS E ORGANISTAS',musicos+organistas,'ccb-grand')}
 <tr><th colSpan={2} className="ccb-section-title">OFICIALIZAÇÃO</th></tr>
 {linha('Músicos',0)}{linha('Organistas',0)}{linha('TOTAL DE OFICIALIZADOS',0,'ccb-grand')}
 </tbody></table><p className="ccb-footnote">*Obs. Lista de instrumentos de acordo com o MOO.</p></div>
}
export default async function FormularioCCB({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const db=await serverDb();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login');
 const [{data:evento},{data:registros},{data:dados},{data:op}]=await Promise.all([
 db.from('ensaios_regionais').select('id,titulo,local,data,status').eq('id',id).maybeSingle(),
 db.from('contagens_regionais').select('grupo,tipo,valor,quantidade').eq('ensaio_id',id).limit(50000),
 db.from('regional_dados_formulario').select('anciao,encarregado_regional,ministerio').eq('ensaio_id',id).maybeSingle(),
 db.from('operadores').select('perfil').eq('user_id',user.id).maybeSingle()
 ]);
 if(!evento)notFound();
 const rows=(registros||[]) as Contagem[];
 const qt=(g:string,t:string,v?:string)=>rows.filter(r=>r.grupo===g&&r.tipo===t&&(v===undefined||r.valor===v)).reduce((n,r)=>n+r.quantidade,0);
 const musicos=qt('musicos','instrumento'),organistas=qt('organistas','nivel');
 const valor:Valores={anciao:dados?.anciao||'',encarregado_regional:dados?.encarregado_regional||'',ministerio:(dados?.ministerio||{}) as Record<string,number>};
 const podeGerenciar=['admin','secretaria'].includes(op?.perfil||'');
 const okM=musicos===qt('musicos','cidade'),okO=organistas===qt('organistas','cidade');
 return <main className="ccb-document">
 <div className="ccb-controls"><a href="/ensaio-regional">← Ensaio Regional</a><div><h1>Gerar PDF CCB</h1><p>Folha A4 com duas vias no formato do modelo original.</p></div><RegionalPrintButton/></div>
 {!okM||!okO?<p className="ccb-alert">Atenção: as contagens ainda têm diferenças entre cidades, instrumentos ou níveis. Confira antes de imprimir.</p>:null}
 {podeGerenciar&&<details className="ccb-editor" open={!dados}><summary>✎ Preencher ancião, encarregado regional e ministério</summary><form action={salvarFormularioCCB}><input type="hidden" name="ensaio_id" value={id}/><div className="ccb-editor-grid"><label>Ancião<input name="anciao" defaultValue={valor.anciao} placeholder="Nome do ancião"/></label><label>Encarregado Regional<input name="encarregado_regional" defaultValue={valor.encarregado_regional} placeholder="Nome do encarregado regional"/></label>{ministerio.map(nome=><label key={nome}>{nome}<input type="number" inputMode="numeric" min={0} max={9999} name={nome} defaultValue={valor.ministerio[nome]||0}/></label>)}</div><button type="submit">Salvar dados do formulário</button><p>Após salvar, os dados aparecem automaticamente nas duas vias. A oficialização permanece sempre em zero.</p></form></details>}
 <div className="ccb-paper"><Via evento={evento} valor={valor} qt={qt} musicos={musicos} organistas={organistas}/><Via evento={evento} valor={valor} qt={qt} musicos={musicos} organistas={organistas}/></div>
 </main>;
}
