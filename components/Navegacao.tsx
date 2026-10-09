'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import {logout} from '../app/actions';
const paginas=[['/','Painel'],['/participantes','Participantes'],['/eventos','Eventos'],['/portaria','Portaria'],['/relatorios','Relatórios'],['/usuarios','Usuários'],['/minha-conta','Minha conta']] as const;
const atalhos=[['/','Painel','⌂'],['/participantes','Pessoas','♙'],['/eventos','Eventos','▦'],['/portaria','Portaria','▣']] as const;
export default function Navegacao(){
 const pathname=usePathname();
 const [destino,setDestino]=useState<string|null>(null);
 const [mais,setMais]=useState(false);
 useEffect(()=>{setDestino(null);setMais(false)},[pathname]);
 if(pathname==='/login')return null;
 const ir=(href:string)=>{setMais(false);if(href!==pathname)setDestino(href)};
 return <>
 <nav className="desktop-nav" aria-label="Navegação principal">
 {paginas.map(([href,nome])=><Link key={href} href={href} prefetch={true} aria-current={pathname===href?'page':undefined} className={pathname===href?'nav-active':destino===href?'nav-loading':''} onClick={()=>ir(href)}>{nome}{destino===href&&pathname!==href?<span className="nav-spinner" aria-label="Carregando"/>:null}</Link>)}
 </nav>
 <nav className="mobile-bottom-nav" aria-label="Navegação rápida">
 {atalhos.map(([href,nome,icone])=><Link key={href} href={href} prefetch={true} aria-current={pathname===href?'page':undefined} className={'mobile-nav-item '+(pathname===href?'selected':'')} onClick={()=>ir(href)}><span className="mobile-nav-icon" aria-hidden="true">{icone}</span><span>{nome}</span></Link>)}
 <button type="button" className={'mobile-nav-item mobile-more-button '+(mais||['/relatorios','/usuarios','/minha-conta'].includes(pathname)?'selected':'')} aria-expanded={mais} aria-controls="mobile-more-panel" onClick={()=>setMais(v=>!v)}><span className="mobile-nav-icon" aria-hidden="true">☰</span><span>Mais</span></button>
 </nav>
 {mais&&<><button className="mobile-menu-backdrop" type="button" aria-label="Fechar menu" onClick={()=>setMais(false)}/><div id="mobile-more-panel" className="mobile-more-panel" role="dialog" aria-label="Mais opções"><strong>Mais opções</strong>{paginas.slice(4).map(([href,nome])=><Link href={href} key={href} onClick={()=>ir(href)} aria-current={pathname===href?'page':undefined}>{nome}</Link>)}<form action={logout}><button type="submit" className="mobile-logout">Sair da conta</button></form></div></>}
 </>;
}
