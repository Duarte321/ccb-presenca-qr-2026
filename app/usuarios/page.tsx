import {redirect} from 'next/navigation';
import {serverDb} from '../../lib/supabase';
import {mudarPerfil} from './actions';
import Convite from '../../components/ConviteUsuario';
export default async function Usuarios(){
 const db=await serverDb();
 const {data:{user}}=await db.auth.getUser();
 if(!user)redirect('/login');
 const {data:operador}=await db.from('operadores').select('perfil').eq('user_id',user.id).single();
 if(operador?.perfil!=='admin')redirect('/');
 const {data:usuarios,error}=await db.rpc('listar_usuarios_gestao');
 return <main><span className="eyebrow">ADMINISTRAÇÃO</span><h1>Gerenciar usuários</h1><p className="subtitle">Autorize usuários, defina permissões e acompanhe quem tem acesso ao sistema.</p><Convite/><section className="card"><h2>Contas cadastradas</h2><p className="muted">O perfil «Sem acesso» impede operações protegidas pelas permissões da aplicação. Contas novas precisam receber um perfil.</p>{error?<p role="alert">Não foi possível carregar os usuários: {error.message}</p>:!usuarios?.length?<p>Nenhuma conta encontrada.</p>:<div className="user-list">{usuarios.map((u:{user_id:string;email:string|null;perfil:string|null;criado_em:string})=><article className="user-entry" key={u.user_id}><div><strong>{u.email||'Sem e-mail'}</strong><p className="muted">Perfil atual: {u.perfil||'Sem acesso'} {u.user_id===user.id?'• Sua conta':''}</p></div><form action={mudarPerfil} className="user-role-form"><input type="hidden" name="user_id" value={u.user_id}/><label>Permissão<select name="perfil" defaultValue={u.perfil||'bloqueado'}><option value="bloqueado">Sem acesso</option><option value="consulta">Consulta</option><option value="secretaria">Secretaria</option><option value="admin">Administrador</option></select></label><button type="submit">Salvar</button></form></article>)}</div>}</section><p className="status-note">A página é exclusiva do administrador. Conceda acesso administrativo somente a pessoas de confiança. Revogar o perfil não apaga a conta de autenticação.</p></main>
}