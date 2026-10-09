'use client';
import {useEffect,useState} from 'react';
type Kind='violino'|'sax'|'tuba'|'clarineta';
const items:{kind:Kind;label:string;color:string}[]=[
 {kind:'violino',label:'Violino',color:'#de965b'},
 {kind:'sax',label:'Sax alto',color:'#f1bb4d'},
 {kind:'tuba',label:'Tuba',color:'#ecc66a'},
 {kind:'clarineta',label:'Clarineta',color:'#749cda'}
];
function Instrumento({kind,label,color,closed,x,y}:{kind:Kind;label:string;color:string;closed:boolean;x:number;y:number}){
 const eyes=(cx:number,cy:number)=><g aria-hidden="true">{closed?<g stroke="#16293e" strokeWidth="3.5" strokeLinecap="round"><path d={`M${cx-20} ${cy} q8 8 16 0`}/><path d={`M${cx+5} ${cy} q8 8 16 0`}/></g>:<g><ellipse cx={cx-12} cy={cy} rx="10" ry="12" fill="white"/><ellipse cx={cx+13} cy={cy} rx="10" ry="12" fill="white"/><circle cx={cx-12+x} cy={cy+y} r="5" fill="#102035"/><circle cx={cx+13+x} cy={cy+y} r="5" fill="#102035"/></g>}</g>;
 return <div className={'instrument-friend friend-'+kind} aria-label={label} role="img">
 <svg viewBox="0 0 150 180" width="150" height="180" aria-hidden="true" focusable="false">
 <defs><linearGradient id={'grad-'+kind} x1="0" x2="1" y1="0" y2="1"><stop stopColor={color}/><stop offset="1" stopColor="#995a2c"/></linearGradient></defs>
 {kind==='violino'&&<g><rect x="70" y="4" width="10" height="56" rx="4" fill="#b67945"/><rect x="61" y="34" width="28" height="8" rx="3" fill="#f2c480"/><path d="M75 53 C28 44 35 90 52 98 C15 129 40 170 75 165 C110 170 135 129 98 98 C115 90 122 44 75 53Z" fill={color} stroke="#7d472e" strokeWidth="4"/><path d="M72 6V157M78 6V157" stroke="#f5e5bd" strokeWidth="1.3"/><path d="M51 112q-8 8-1 16m49-16q8 8 1 16" stroke="#593e2b" strokeWidth="3" fill="none"/>{eyes(75,86)}<path d="M67 107q8 8 16 0" stroke="#593e2b" fill="none" strokeWidth="2"/></g>}
 {kind==='sax'&&<g><path d="M36 25L58 17L86 74Q102 110 77 129Q53 140 36 120Q28 111 28 100L49 94Q49 114 65 111Q80 107 69 87Z" fill={color} stroke="#a57327" strokeWidth="5"/><path d="M28 100Q8 106 13 131L55 137Q60 115 43 105Z" fill="#e1a43c" stroke="#9f6b20" strokeWidth="4"/><rect x="51" y="45" width="12" height="8" rx="4" fill="#fff0bd"/><rect x="61" y="63" width="12" height="8" rx="4" fill="#fff0bd"/><rect x="71" y="80" width="12" height="8" rx="4" fill="#fff0bd"/>{eyes(67,99)}<path d="M59 118q8 7 16 0" stroke="#574323" strokeWidth="2" fill="none"/></g>}
 {kind==='tuba'&&<g><path d="M38 29H112L131 9L144 20L111 52V125Q111 162 74 162Q32 162 32 123V69H51V119Q51 144 73 144Q94 144 94 118V48H38Z" fill={color} stroke="#a77b2f" strokeWidth="4"/><path d="M107 28Q118 9 137 11L147 20Q129 31 108 36" fill="#f8dc82" stroke="#a77b2f" strokeWidth="3"/><rect x="51" y="61" width="12" height="25" rx="5" fill="#f9e6a9"/><rect x="69" y="61" width="12" height="25" rx="5" fill="#f9e6a9"/>{eyes(72,111)}<path d="M64 129q8 8 16 0" stroke="#64512c" strokeWidth="2" fill="none"/></g>}
 {kind==='clarineta'&&<g transform="rotate(-12 75 90)"><path d="M61 13H89L94 146L108 164H42L56 146Z" fill="#303e56" stroke="#7594be" strokeWidth="4"/><path d="M65 13V3H85V13" fill="#cad7e8"/><path d="M57 55H93M57 104H93M55 137H95" stroke="#cbd8e6" strokeWidth="5"/><circle cx="74" cy="49" r="4" fill="#e0e8ef"/><circle cx="76" cy="95" r="4" fill="#e0e8ef"/>{eyes(75,78)}<path d="M68 101q7 6 14 0" fill="none" stroke="#cbd8e6" strokeWidth="2"/></g>}
 </svg><span>{label}</span></div>;
}
export default function InstrumentosLogin({foco}:{foco:'email'|'senha'|null}){
 const [p,setP]=useState({x:0,y:0});
 useEffect(()=>{const move=(e:PointerEvent)=>{if(e.pointerType==='touch')return;setP({x:Math.max(-4,Math.min(4,(e.clientX/window.innerWidth-.5)*8)),y:Math.max(-4,Math.min(4,(e.clientY/window.innerHeight-.5)*8))})};window.addEventListener('pointermove',move,{passive:true});return()=>window.removeEventListener('pointermove',move)},[]);
 const x=foco==='email'?3:p.x,y=foco==='email'?3:p.y;
 return <aside className="login-orchestra"><div className="orchestra-heading"><span className="eyebrow">MÚSICA E TECNOLOGIA</span><h2>Bem-vindo à nossa orquestra!</h2><p>{foco==='senha'?'Olhinhos fechados para proteger sua senha.':foco==='email'?'Todos atentos ao seu e-mail!':'Seus instrumentos estão de olho por aqui.'}</p></div><div className="instrument-grid">{items.map(i=><Instrumento key={i.kind} {...i} closed={foco==='senha'} x={x} y={y}/>)}</div></aside>;
}
