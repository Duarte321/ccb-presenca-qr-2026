import {redirect} from 'next/navigation';
import {serverDb} from '../../lib/supabase';
import EnsaioRegionalLive from '../../components/EnsaioRegionalLive';
export const dynamic='force-dynamic';
export default async function EnsaioRegional(){
 const db=await serverDb();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login');
 const [{data:ensaios},{data:registros},{data:op}]=await Promise.all([
 db.from('ensaios_regionais').select('id,titulo,local,data,status').order('data',{ascending:false}).limit(100),
 db.from('contagens_regionais').select('id,ensaio_id,grupo,tipo,valor,quantidade,criado_em').order('criado_em',{ascending:true}).limit(20000),
 db.from('operadores').select('perfil').eq('user_id',user.id).maybeSingle()
 ]);
 return <main><span className="eyebrow">GESTÃO MUSICAL</span><h1>Ensaio Regional</h1><p className="subtitle">Contagem compartilhada entre os celulares e conferência por músicos e organistas.</p><EnsaioRegionalLive ensaios={ensaios||[]} registros={registros||[]} podeGerenciar={['admin','secretaria'].includes(op?.perfil||'')}/></main>;
}