'use server';
import {serverDb} from '../../lib/supabase';
export async function alterarMinhaSenha(_: {ok:boolean;mensagem:string},form:FormData){
 const db=await serverDb();
 const {data:{user},error:authError}=await db.auth.getUser();
 if(authError||!user?.email)return {ok:false,mensagem:'Entre novamente para alterar sua senha.'};
 const atual=String(form.get('atual')||'');
 const nova=String(form.get('nova')||'');
 const confirmar=String(form.get('confirmar')||'');
 if(nova.length<10||nova.length>128)return {ok:false,mensagem:'A nova senha precisa ter entre 10 e 128 caracteres.'};
 if(nova!==confirmar)return {ok:false,mensagem:'A confirmação não corresponde à nova senha.'};
 if(nova===atual)return {ok:false,mensagem:'Escolha uma senha diferente da atual.'};
 const {error:senhaErr}=await db.auth.signInWithPassword({email:user.email,password:atual});
 if(senhaErr)return {ok:false,mensagem:'Senha atual incorreta.'};
 const {error}=await db.auth.updateUser({password:nova});
 if(error)return {ok:false,mensagem:'Não foi possível alterar a senha. Tente novamente.'};
 return {ok:true,mensagem:'Senha alterada com sucesso. Use a nova senha no próximo acesso.'};
}
