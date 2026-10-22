export const MODULOS_USUARIO=[
 {id:'painel',nome:'Painel'},
 {id:'participantes',nome:'Participantes'},
 {id:'eventos',nome:'Eventos'},
 {id:'portaria',nome:'Portaria'},
 {id:'relatorios',nome:'Relatórios'},
 {id:'ensaio-regional',nome:'Ensaio Regional'},
 {id:'minha-conta',nome:'Minha conta'}
] as const;
export type Modulo=typeof MODULOS_USUARIO[number]['id']|'usuarios';
const PADRAO=MODULOS_USUARIO.map(item=>item.id) as Modulo[];
export function abasPermitidas(perfil:string|null|undefined,personalizadas:string[]|null|undefined):Modulo[]{
 if(perfil==='admin')return [...PADRAO,'usuarios'];
 if(!['secretaria','porteiro','consulta'].includes(perfil||''))return [];
 return personalizadas===null||personalizadas===undefined?PADRAO:[...new Set(personalizadas.filter((item):item is Modulo=>PADRAO.includes(item as Modulo)))];
}
export function urlInicial(abas:Modulo[]):string{
 if(abas.includes('painel'))return '/';
 // Acesso restrito: portaria tem prioridade como página inicial do operador.
 if(abas.includes('portaria'))return '/portaria';
 for(const modulo of ['ensaio-regional','participantes','eventos','relatorios','minha-conta','usuarios'] as Modulo[]){
  if(abas.includes(modulo))return '/'+modulo;
 }
 return '/sem-acesso';
}
