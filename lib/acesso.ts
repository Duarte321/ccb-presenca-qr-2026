import {redirect} from 'next/navigation';
import type {serverDb} from './supabase';
import {abasPermitidas,urlInicial,type Modulo} from './modulos';
type Banco=Awaited<ReturnType<typeof serverDb>>;
export async function exigirModulo(db:Banco,usuarioId:string,modulo:Modulo){
 const {data,error}=await db.from('operadores').select('perfil,modulos_permitidos').eq('user_id',usuarioId).maybeSingle();
 if(error)throw Error('Não foi possível verificar suas permissões. Tente novamente.');
 const modulos=abasPermitidas(data?.perfil, data?.modulos_permitidos);
 if(!modulos.includes(modulo))redirect(urlInicial(modulos));
 return {perfil:data?.perfil||'',modulos};
}
