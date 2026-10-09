'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
const paginas=[['/','Painel'],['/participantes','Participantes'],['/eventos','Eventos'],['/portaria','Portaria'],['/relatorios','Relatórios'],['/usuarios','Usuários'],['/minha-conta','Minha conta']] as const;
export default function Navegacao(){
 const pathname=usePathname();
 const [destino,setDestino]=useState<string|null>(null);
 useEffect(()=>{setDestino(null)},[pathname]);
 return <nav aria-label="Navegação principal">
 {paginas.map(([href,nome])=><Link key={href} href={href} prefetch={true} aria-current={pathname===href?'page':undefined} className={pathname===href?'nav-active':destino===href?'nav-loading':''} onClick={()=>{if(href!==pathname)setDestino(href)}}>{nome}{destino===href&&pathname!==href?<span className="nav-spinner" aria-label="Carregando"/>:null}</Link>)}
 </nav>;
}