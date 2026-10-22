import {exigirModulo} from '../../../../lib/acesso';
import {redirect,notFound} from 'next/navigation';
import {serverDb} from '../../../../lib/supabase';
import {salvarFormularioCCB} from '../../actions';
import RegionalPrintButton from '../../../../components/RegionalPrintButton';
import FormConfirmacao from '../../../../components/FormConfirmacao';
import CcbFolhaOriginal from '../../../../components/CcbFolhaOriginal';
export const dynamic='force-dynamic';
type Contagem={grupo:string;tipo:string;valor:string;quantidade:number};
type Valores={anciao:string;encarregado_regional:string;ministerio:Record<string,number>};
const ministerio=["Anciães","Diáconos","Cooperadores Oficiais","Cooperadores de Jovens e Menores","Encarregados Regionais","Examinadora","Encarregados Locais","Instrutores","Professoras","Irmãos do Dpto Musical","Irmãos/Irmãs Colaboradores (Libras, Porta, Som, Pátio, etc)"];
export default async function FormularioCCB({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const db=await serverDb();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login');
 await exigirModulo(db,user.id,'ensaio-regional');
 const {data:perfilRegional}=await db.from('operadores').select('perfil').eq('user_id',user.id).maybeSingle();
 if(!['admin','secretaria'].includes(perfilRegional?.perfil||''))redirect('/ensaio-regional');
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
 {podeGerenciar&&<details className="ccb-editor" open={!dados}><summary>✎ Preencher ancião, encarregado regional e ministério</summary><FormConfirmacao action={salvarFormularioCCB} mensagemSucesso="Dados do formulário CCB salvos com sucesso!"><input type="hidden" name="ensaio_id" value={id}/><div className="ccb-editor-grid"><label>Ancião<input name="anciao" defaultValue={valor.anciao} placeholder="Nome do ancião"/></label><label>Encarregado Regional<input name="encarregado_regional" defaultValue={valor.encarregado_regional} placeholder="Nome do encarregado regional"/></label>{ministerio.map(nome=><label key={nome}>{nome}<input type="number" inputMode="numeric" min={0} max={9999} name={nome} defaultValue={valor.ministerio[nome]||0}/></label>)}</div><button type="submit">Salvar dados do formulário</button><p>Após salvar, os dados aparecem automaticamente nas duas vias. A oficialização permanece sempre em zero.</p></FormConfirmacao></details>}
 <div className="ccb-paper ccb-original-container"><CcbFolhaOriginal evento={evento} dados={valor} qt={qt} musicos={musicos} organistas={organistas}/></div>
 </main>;
}
