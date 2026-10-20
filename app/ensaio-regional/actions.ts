'use server';
import {serverDb} from '../../lib/supabase';
import {revalidatePath} from 'next/cache';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function auth(){const db=await serverDb();const {data:{user}}=await db.auth.getUser();if(!user)throw Error('Sessão expirada. Entre novamente.');return {db,user};}
async function gerente(){const {db,user}=await auth();const {data}=await db.from('operadores').select('perfil').eq('user_id',user.id).maybeSingle();if(!['admin','secretaria'].includes(data?.perfil||''))throw Error('Somente administradores e secretaria podem configurar ensaios.');return db;}
export async function criarRegional(form:FormData){
 const db=await gerente();const titulo=String(form.get('titulo')||'').trim().slice(0,100);const local=String(form.get('local')||'').trim().slice(0,140);const data=String(form.get('data')||'');
 if(!titulo||!/\d{4}-\d{2}-\d{2}/.test(data))throw Error('Informe nome e data.');
 const {error}=await db.from('ensaios_regionais').insert({titulo,local,data});if(error)throw Error(error.message);
 revalidatePath('/ensaio-regional');
}
export async function editarRegional(form:FormData){
 const db=await gerente();const id=String(form.get('id')||'');if(!uuid.test(id))throw Error('Evento inválido.');
 const titulo=String(form.get('titulo')||'').trim().slice(0,100);const local=String(form.get('local')||'').trim().slice(0,140);const data=String(form.get('data')||'');
 const status=String(form.get('status')||'aberto');
 if(!titulo||!/\d{4}-\d{2}-\d{2}/.test(data)||!['aberto','finalizado'].includes(status))throw Error('Dados inválidos.');
 const {error}=await db.from('ensaios_regionais').update({titulo,local,data,status}).eq('id',id);if(error)throw Error(error.message);
 revalidatePath('/ensaio-regional');
}
export async function registrarRegional(id:string,grupo:string,tipo:string,valor:string,delta:number){
 const {db}=await auth();
 if(!uuid.test(id)||!['musicos','organistas'].includes(grupo)||!['cidade','instrumento','nivel'].includes(tipo)||![1,-1].includes(delta))throw Error('Contagem inválida.');
 const {data,error}=await db.rpc('regional_registrar_rapido',{p_ensaio:id,p_grupo:grupo,p_tipo:tipo,p_valor:valor,p_delta:delta});
 if(error)throw Error(error.message);
 return {id:String(data)};
}

export async function zerarContagensRegional(id:string){
 await gerente();
 if(!uuid.test(id))throw Error('Ensaio inválido.');
 const {db}=await auth();
 const {data,error}=await db.rpc('regional_zerar_contagens',{p_ensaio:id});
 if(error)throw Error(error.message);
 revalidatePath('/ensaio-regional');
 return {apagadas:Number(data||0)};
}

export async function definirQuantidadeInstrumento(id:string,instrumento:string,total:number){
 const {db}=await auth();
 if(!uuid.test(id)||!Number.isInteger(total)||total<0||total>9999||!instrumento.trim())throw Error('Quantidade inválida.');
 const {data,error}=await db.rpc('regional_definir_quantidade',{p_ensaio:id,p_grupo:'musicos',p_tipo:'instrumento',p_valor:instrumento,p_total:total});
 if(error)throw Error(error.message);
 return {id:data?String(data):null};
}

export async function salvarFormularioCCB(form:FormData){
 const db=await gerente();const id=String(form.get('ensaio_id')||'');
 if(!uuid.test(id))throw Error('Ensaio inválido');
 const campos=["Anciães","Diáconos","Cooperadores Oficiais","Cooperadores de Jovens e Menores","Encarregados Regionais","Examinadora","Encarregados Locais","Instrutores","Professoras","Irmãos do Dpto Musical","Irmãos/Irmãs Colaboradores (Libras, Porta, Som, Pátio, etc)"];
 const ministerio:Record<string,number>={};
 for(const nome of campos){
  const valor=Number(form.get(nome)??0);
  if(!Number.isInteger(valor)||valor<0||valor>9999)throw Error('Quantidade inválida em '+nome);
  ministerio[nome]=valor;
 }
 const anciao=String(form.get('anciao')||'').trim().slice(0,120);
 const encarregado_regional=String(form.get('encarregado_regional')||'').trim().slice(0,120);
 const {error}=await db.from('regional_dados_formulario').upsert({ensaio_id:id,anciao,encarregado_regional,ministerio,atualizado_em:new Date().toISOString()},{onConflict:'ensaio_id'});
 if(error)throw Error(error.message);
 revalidatePath('/ensaio-regional');
 return {ok:true};
}
