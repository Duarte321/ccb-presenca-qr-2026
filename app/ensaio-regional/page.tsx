import {garantirAcessoModulo} from '../../lib/acesso';
import {redirect} from 'next/navigation';
import {serverDb} from '../../lib/supabase';
import EnsaioRegionalLive from '../../components/EnsaioRegionalLive';
export const dynamic='force-dynamic';
export default async function EnsaioRegional({searchParams}:{searchParams:Promise<{ensaio?:string}>}){
 const db=await serverDb();
 const {data:{user}}=await db.auth.getUser();
 if(!user)redirect('/login');
 const [{data:ensaios},{data:op},{data:atribuicoes}]=await Promise.all([
  db.from('ensaios_regionais').select('id,titulo,local,data,status,contagem_versao').order('data',{ascending:false}).limit(100),
  db.from('operadores').select('perfil,modulos_permitidos').eq('user_id',user.id).maybeSingle(),
  db.from('regional_responsaveis').select('ensaio_id,usuario_id,funcao')
 ]);
 garantirAcessoModulo(op?.perfil,op?.modulos_permitidos,'ensaio-regional');
 const selecionado=(await searchParams).ensaio;
 const ensaioId=ensaios?.find(e=>e.id===selecionado)?.id||ensaios?.[0]?.id||'';
 const podeGerenciar=['admin','secretaria'].includes(op?.perfil||'');
 const [{data:registros,error:erroRegistros},{data:usuarios}]=await Promise.all([
  ensaioId?db.from('contagens_regionais').select('id,ensaio_id,grupo,tipo,valor,quantidade,criado_em,client_event_id')
   .eq('ensaio_id',ensaioId).order('criado_em',{ascending:true}).limit(10000):Promise.resolve({data:[],error:null}),
  podeGerenciar?db.rpc('regional_usuarios_disponiveis'):Promise.resolve({data:[]})
 ]);
 return <main>
  <span className="eyebrow">GESTÃO MUSICAL</span>
  <h1>Ensaio Regional</h1>
  <p className="subtitle">Contagem compartilhada entre os celulares e conferência por músicos e organistas.</p>
  {erroRegistros&&<p role="alert" className="login-error">Não foi possível carregar as contagens: {erroRegistros.message}</p>}
  <EnsaioRegionalLive operadorId={user.id} ensaios={ensaios||[]} registros={registros||[]}
    ensaioInicialId={ensaioId} podeGerenciar={podeGerenciar} atribuicoes={atribuicoes||[]} usuarios={usuarios||[]}/>
 </main>;
}
