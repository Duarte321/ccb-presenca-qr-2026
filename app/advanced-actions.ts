'use server';
import {revalidatePath} from 'next/cache';
import {serverDb} from '../lib/supabase';
async function gestor(){
 const db=await serverDb();const {data:{user}}=await db.auth.getUser();
 if(!user)throw Error('Entre no sistema.');
 const {data:op}=await db.from('operadores').select('perfil').eq('user_id',user.id).single();
 if(!['admin','secretaria'].includes(op?.perfil||''))throw Error('Sem permissão.');
 return db;
}
const uuid=(x:FormDataEntryValue|null)=>{const s=String(x||'');if(!/^[0-9a-f-]{36}$/i.test(s))throw Error('Identificador inválido.');return s;};
export async function editarParticipante(f:FormData){
 const db=await gestor(),id=uuid(f.get('id'));
 const nome=String(f.get('nome')||'').trim(),congregacao=String(f.get('congregacao')||'').trim();
 if(nome.length<2||!congregacao)throw Error('Nome e congregação são obrigatórios.');
 const {error}=await db.from('participantes').update({nome,congregacao,categoria:String(f.get('categoria')||'Musico'),instrumento:String(f.get('instrumento')||'').trim(),cargo_ministerio:String(f.get('cargo_ministerio')||'').trim()}).eq('id',id);
 if(error)throw Error(error.message);revalidatePath('/participantes');revalidatePath('/portaria');
}
export async function alterarCredencial(f:FormData){
 const db=await gestor(),id=uuid(f.get('id')),acao=String(f.get('acao')||'');
 if(!['bloquear','renovar'].includes(acao))throw Error('Ação inválida.');
 const {error}=await db.rpc('administrar_credencial',{p_participante:id,p_acao:acao});
 if(error)throw Error(error.message);revalidatePath('/participantes');
}
export async function registroManual(f:FormData){
 const db=await serverDb(),evento=uuid(f.get('evento')),participante=uuid(f.get('participante'));
 const {data,error}=await db.rpc('registrar_presenca_manual',{p_evento:evento,p_participante:participante});
 if(error)throw Error(error.message);revalidatePath('/portaria');revalidatePath('/eventos');return String(data||'');
}
