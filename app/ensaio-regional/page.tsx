import {redirect} from 'next/navigation';
import {serverDb} from '../../lib/supabase';
import EnsaioRegionalDemo from '../../components/EnsaioRegionalDemo';
export default async function EnsaioRegional(){
 const db=await serverDb();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login');
 return <main><span className="eyebrow">GESTÃO MUSICAL</span><h1>Ensaio Regional</h1><p className="subtitle">Contagem de músicos e organistas por equipes, com conferência no painel geral.</p><EnsaioRegionalDemo/></main>;
}