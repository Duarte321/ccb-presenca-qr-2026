'use server';
import {revalidatePath} from 'next/cache';
import {serverDb} from '../../../lib/supabase';
export async function salvarEsperados(form:FormData){
 const evento=String(form.get('evento')||'');
 const ids=[...new Set(form.getAll('participantes').map(String))];
 if(!/^[0-9a-f-]{36}$/i.test(evento)||ids.some(id=>!/^[0-9a-f-]{36}$/i.test(id)))throw Error('Dados inválidos.');
 const db=await serverDb();const {data:{user}}=await db.auth.getUser();
 if(!user)throw Error('Faça login.');
 const {data:op}=await db.from('operadores').select('perfil').eq('user_id',user.id).single();
 if(!['admin','secretaria'].includes(op?.perfil||''))throw Error('Acesso negado.');
 const {data:eventoRow,error:evError}=await db.from('eventos').select('id,aberto').eq('id',evento).single();
 if(evError||!eventoRow)throw Error('Evento não encontrado.');
 if(!eventoRow.aberto)throw Error('Reabra o evento para alterar a lista de participantes esperados.');
 const {data:anteriores,error:readErr}=await db.from('presencas_esperadas').select('participante_id').eq('evento_id',evento);
 if(readErr)throw Error(readErr.message);
 const old=new Set((anteriores||[]).map(p=>p.participante_id));const next=new Set(ids);
 const remover=[...old].filter(id=>!next.has(id));const adicionar=ids.filter(id=>!old.has(id));
 if(remover.length){const {error}=await db.from('presencas_esperadas').delete().eq('evento_id',evento).in('participante_id',remover);if(error)throw Error(error.message);}
 if(adicionar.length){const {error}=await db.from('presencas_esperadas').insert(adicionar.map(id=>({evento_id:evento,participante_id:id})));if(error)throw Error(error.message);}
 revalidatePath('/eventos');revalidatePath('/eventos/'+evento+'/esperados');revalidatePath('/participantes');
}
