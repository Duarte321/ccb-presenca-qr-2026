import {serverDb} from '../../../lib/supabase';
import {abasPermitidas} from '../../../lib/modulos';
export const dynamic='force-dynamic';
export async function GET(){
 const db=await serverDb();
 const {data:{user},error:authErro}=await db.auth.getUser();
 if(authErro||!user)return Response.json({modulos:[]},{status:401,headers:{'Cache-Control':'no-store'}});
 const {data:operador,error}=await db.from('operadores').select('perfil,modulos_permitidos').eq('user_id',user.id).maybeSingle();
 if(error)return Response.json({modulos:[]},{status:503,headers:{'Cache-Control':'no-store'}});
 return Response.json({modulos:abasPermitidas(operador?.perfil,operador?.modulos_permitidos)},{headers:{'Cache-Control':'no-store'}});
}
