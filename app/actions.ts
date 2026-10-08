'use server';import {revalidatePath} from 'next/cache';import {redirect} from 'next/navigation';import {serverDb} from '../lib/supabase';
export async function login(f:FormData){const db=await serverDb();const {error}=await db.auth.signInWithPassword({email:String(f.get('email')||''),password:String(f.get('password')||'')});if(error)redirect('/login?erro=1');redirect('/');}
export async function logout(){const db=await serverDb();await db.auth.signOut();redirect('/login')}
export async function createPerson(f:FormData){const db=await serverDb();const {error}=await db.from('participantes').insert({nome:String(f.get('nome')||'').trim(),congregacao:String(f.get('congregacao')||'').trim(),categoria:String(f.get('categoria')||'Musico'),instrumento:String(f.get('instrumento')||'').trim(),cargo_ministerio:String(f.get('cargo_ministerio')||'').trim()});if(error)throw Error(error.message);revalidatePath('/participantes')}
export async function createEvent(f:FormData){const db=await serverDb();const {error}=await db.from('eventos').insert({titulo:String(f.get('titulo')||''),local:String(f.get('local')||''),inicio:String(f.get('inicio')||'')});if(error)throw Error(error.message);revalidatePath('/eventos')}


async function exigirGestor(apenasAdmin=false){
 const db=await serverDb();
 const {data:{user},error:authError}=await db.auth.getUser();
 if(authError||!user)throw new Error('Faça login novamente.');
 const {data:operador,error}=await db.from('operadores').select('perfil').eq('user_id',user.id).single();
 if(error||!operador||!(apenasAdmin?operador.perfil==='admin':['admin','secretaria'].includes(operador.perfil)))throw new Error('Sem permissão para esta operação.');
 return db;
}
function idEvento(f:FormData){const id=String(f.get('id')||'');if(!/^[0-9a-f-]{36}$/i.test(id))throw new Error('Evento inválido.');return id;}
export async function editarEvento(f:FormData){
 const db=await exigirGestor();const id=idEvento(f);
 const titulo=String(f.get('titulo')||'').trim();const local=String(f.get('local')||'').trim();const inicio=String(f.get('inicio')||'');
 const date=new Date(inicio.endsWith('Z')||/[+-]\d{2}:\d{2}$/.test(inicio)?inicio:inicio+'-04:00');
 if(!titulo||!local||!Number.isFinite(date.getTime()))throw new Error('Preencha corretamente os dados do evento.');
 const {data,error}=await db.from('eventos').update({titulo,local,inicio:date.toISOString()}).eq('id',id).select('id');
 if(error||!data?.length)throw new Error(error?.message||'Não foi possível editar o evento.');
 revalidatePath('/eventos');revalidatePath('/portaria');
}
export async function finalizarPortaria(f:FormData){
 const db=await exigirGestor();const id=idEvento(f);
 const {data,error}=await db.from('eventos').update({aberto:false}).eq('id',id).select('id');
 if(error||!data?.length)throw new Error(error?.message||'Não foi possível finalizar a portaria.');
 revalidatePath('/eventos');revalidatePath('/portaria');
}
export async function reabrirPortaria(f:FormData){
 const db=await exigirGestor();const id=idEvento(f);
 const {data,error}=await db.from('eventos').update({aberto:true}).eq('id',id).select('id');
 if(error||!data?.length)throw new Error(error?.message||'Não foi possível reabrir a portaria.');
 revalidatePath('/eventos');revalidatePath('/portaria');
}
export async function excluirEvento(f:FormData){
 const db=await exigirGestor(true);const id=idEvento(f);
 const {count,error:countError}=await db.from('presencas').select('id',{head:true,count:'exact'}).eq('evento_id',id);
 if(countError)throw new Error('Não foi possível verificar as presenças.');
 if((count??0)>0)throw new Error('O evento possui presenças e não pode ser excluído.');
 const {data,error}=await db.from('eventos').delete().eq('id',id).select('id');
 if(error||!data?.length)throw new Error(error?.message||'Não foi possível excluir o evento.');
 revalidatePath('/eventos');revalidatePath('/portaria');
}

export async function removerPresenca(f:FormData){
 const db=await exigirGestor();
 const id=String(f.get('presenca_id')||'');
 const evento=String(f.get('evento_id')||'');
 if(!/^[0-9a-f-]{36}$/i.test(id)||!/^[0-9a-f-]{36}$/i.test(evento))throw new Error('Registro inválido.');
 const {data,error}=await db.from('presencas').delete().eq('id',id).eq('evento_id',evento).select('id');
 if(error||!data?.length)throw new Error(error?.message||'Presença não encontrada.');
 revalidatePath('/portaria');revalidatePath('/eventos');revalidatePath('/');
}
