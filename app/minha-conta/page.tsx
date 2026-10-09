import {redirect} from 'next/navigation';
import {serverDb} from '../../lib/supabase';
import FormSenha from '../../components/FormSenha';
export default async function MinhaConta(){
 const db=await serverDb();const {data:{user}}=await db.auth.getUser();
 if(!user)redirect('/login');
 return <main><span className="eyebrow">ACESSO PESSOAL</span><h1>Minha conta</h1><p className="subtitle">Gerencie sua senha de acesso ao CCB Presença QR 2026.</p><section className="card account-card"><h2>Alterar minha senha</h2><p className="muted">Conta: {user.email}</p><p className="muted">Informe sua senha atual e escolha uma nova senha. Essa alteração afeta somente seu próprio login.</p><FormSenha/></section></main>;
}
