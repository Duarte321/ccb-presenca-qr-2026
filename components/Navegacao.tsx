'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import {createBrowserClient} from '@supabase/ssr';
import {logout} from '../app/actions';
const paginas=[['/','Painel'],['/participantes','Participantes'],['/eventos','Eventos'],['/portaria','Portaria'],['/relatorios','Relatórios'],['/ensaio-regional','Ensaio Regional'],['/usuarios','Usuários'],['/minha-conta','Minha conta']] as const;
const atalhos=[['/','Painel','⌂'],['/participantes','Pessoas','♙'],['/eventos','Eventos','▦'],['/portaria','Portaria','▣']] as const;
export default function Navegacao(){
 const pathname=usePathname();
 const [destino,setDestino]=useState<string|null>(null);
 const [mais,setMais]=useState(false);
 const [modulos,setModulos]=useState<string[]|null>(null);
 useEffect(()=>{setDestino(null);setMais(false)},[pathname]);
 useEffect(()=>{
  if(pathname==='/login')return;
  let cancelado=false;
  const carregar=async()=>{
   try{
    const resposta=await fetch('/api/meus-modulos',{cache:'no-store'});
    if(!resposta.ok)throw Error('Permissões indisponíveis');
    const dados=await resposta.json() as {modulos?:string[]};
    if(!cancelado)setModulos(Array.isArray(dados.modulos)?dados.modulos:[]);
   }catch{if(!cancelado)setModulos([])}
  };
  void carregar();
  return()=>{cancelado=true};
 },[pathname]);
 if(pathname==='/login')return null;
 const visiveis=paginas.filter(([href])=>modulos?.includes(href==='/'?'painel':href.slice(1)));
 const atalhosVisiveis=atalhos.filter(([href])=>modulos?.includes(href==='/'?'painel':href.slice(1)));
 const extras=visiveis.filter(([href])=>!atalhos.some(([a])=>a===href));
 const ir=(href:string)=>{setMais(false);if(href!==pathname)setDestino(href)};
 return <>
 <nav className="desktop-nav" aria-label="Navegação principal">
 {visiveis.map(([href,nome])=><Link key={href} href={href} prefetch={href==='/'||href==='/eventos'} aria-current={pathname===href?'page':undefined} className={pathname===href?'nav-active':destino===href?'nav-loading':''} onClick={()=>ir(href)}>{nome}{destino===href&&pathname!==href?<span className="nav-spinner" aria-label="Carregando"/>:null}</Link>)}
 </nav>
 <nav className="mobile-bottom-nav" aria-label="Navegação rápida">
 {atalhosVisiveis.map(([href,nome,icone])=><Link key={href} href={href} prefetch={href==='/'||href==='/eventos'} aria-current={pathname===href?'page':undefined} className={'mobile-nav-item '+(pathname===href?'selected':'')} onClick={()=>ir(href)}><span className="mobile-nav-icon" aria-hidden="true">{icone}</span><span>{nome}</span></Link>)}
 {extras.length>0&&<button type="button" className={'mobile-nav-item mobile-more-button '+(mais||['/relatorios','/ensaio-regional','/usuarios','/minha-conta'].some(href=>pathname.startsWith(href))?'selected':'')} aria-expanded={mais} aria-controls="mobile-more-panel" onClick={()=>setMais(v=>!v)}><span className="mobile-nav-icon" aria-hidden="true">☰</span><span>Mais</span></button>}
 </nav>
 {mais&&extras.length>0&&<><button className="mobile-menu-backdrop" type="button" aria-label="Fechar menu" onClick={()=>setMais(false)}/><div id="mobile-more-panel" className="mobile-more-panel" role="dialog" aria-label="Mais opções"><strong>Mais opções</strong>{extras.map(([href,nome])=><Link href={href} key={href} onClick={()=>ir(href)} aria-current={pathname===href?'page':undefined}>{nome}</Link>)}<form action={logout}><button type="submit" className="mobile-logout">Sair da conta</button></form></div></>}
 </>;
}
