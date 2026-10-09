'use server';
import {revalidatePath} from 'next/cache';
import {serverDb} from '../../lib/supabase';
import {createClient} from '@supabase/supabase-js';
async function admin(){
 const db=await serverDb();const {data:{user}}=await db.auth.getUser();
 if(!user)throw Error('Faça login novamente.');
 const {data:op}=await db.from('operadores').select('perfil').eq('user_id',user.id).single();
 if(op?.perfil!=='admin')throw Error('Somente administradores podem gerenciar usuários.');
 return {db,user};
}
export async function mudarPerfil(f:FormData){
 const {db}=await admin();
 const id=String(f.get('user_id')||'');const perfil=String(f.get('perfil')||'');
 if(!/^[a-f0-9-]{36}$/i.test(id)||!['admin','secretaria','porteiro','consulta','bloqueado'].includes(perfil))throw Error('Dados inválidos.');
 const {error}=await db.rpc('definir_perfil_usuario',{p_usuario:id,p_perfil:perfil});
 if(error)throw Error(error.message);
 revalidatePath('/usuarios');
}
export async function convidarUsuario(f:FormData){
 await admin();
 const email=String(f.get('email')||'').trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return {ok:false,mensagem:'Informe um e-mail válido.'};
 const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!secret)return {ok:false,mensagem:'Convites ainda não estão habilitados: configure SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente da Vercel (somente servidor). Enquanto isso, crie o usuário em Authentication → Users no Supabase.'};
 const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {error}=await client.auth.admin.inviteUserByEmail(email);
 if(error)return {ok:false,mensagem:'Não foi possível enviar o convite: '+error.message};
 revalidatePath('/usuarios');
 return {ok:true,mensagem:'Convite enviado. Após aceitar, atribua o perfil na lista abaixo.'};
}
