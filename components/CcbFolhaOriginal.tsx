import type {ReactNode} from 'react';
type Evento={titulo:string;local:string;data:string};
type Dados={anciao:string;encarregado_regional:string;ministerio:Record<string,number>};
type Contador=(grupo:string,tipo:string,nome?:string)=>number;
const ministerio=["Anciães","Diáconos","Cooperadores Oficiais","Cooperadores de Jovens e Menores","Encarregados Regionais","Examinadora","Encarregados Locais","Instrutores","Professoras","Irmãos do Dpto Musical","Irmãos/Irmãs Colaboradores (Libras, Porta, Som, Pátio, etc)"];
const instrumentos=["Violinos","Viola","Violoncelos","Acordeon","Flautas","Oboé","Oboé d'Amore","Corne Inglês","Fagote","Clarinetes","Clarone Alto","Clarone Baixo","Saxofones Sopranos","Saxofones Altos","Saxofones Tenores","Saxofones Barítonos","Cornet","Trompetes","FlugelHorn","Trompa","Trombones","Trombonito","Barítono de pisto","Eufônios","Tubas"];
const bordasY=[28.38,43.38,57.9,72.42,86.96,88.76,103.28,106.16,120.68,122.48,137,151.52,166.04,180.56,181.64,196.16,210.68,225.2,239.72,254.24,269.51,284.51,286.31,301.55,316.79,332.03,347.27,362.51,377.75,392.99,408.23,423.47,438.71,453.97,469.21,484.45,499.69,514.93,530.17,545.41,560.65,575.89,591.13,606.37,621.64,636.88,652.12,667.36,668.8,684.04,699.28,702.16,717.4,721,733.72,747.16,759.88,773.92];
const ministerioY=[122.48,137,151.52,166.04,181.64,196.16,210.68,225.20,239.72,254.24,269.51,284.51];
const naipesY=Array.from({length:26},(_,i)=>Number((286.31+15.24*i).toFixed(2)));
function central(a:number,b:number){return(a+b)/2+.65;}
function Texto({x,y,children,tamanho=10.9,peso=400,ancora='start',italico=false,comprimento}:{
 x:number;y:number;children:ReactNode;tamanho?:number;peso?:number;ancora?:'start'|'middle'|'end';italico?:boolean;comprimento?:number
}){
 return <text x={x} y={y} textAnchor={ancora} dominantBaseline="middle" fontFamily="Calibri,Carlito,Arial,sans-serif" fontSize={tamanho} fontWeight={peso} fontStyle={italico?'italic':'normal'} textLength={comprimento} lengthAdjust={comprimento?'spacingAndGlyphs':undefined} fill="#111">{children}</text>;
}
export default function CcbFolhaOriginal({evento,dados,qt,musicos,organistas}:{evento:Evento;dados:Dados;qt:Contador;musicos:number;organistas:number}){
 const titulo=evento.local||'LOCAL NÃO INFORMADO';
 const data=evento.data.split('-').reverse().join('/');
 const total=musicos+organistas;
 const vias=[0,278.81];
 return <svg className="ccb-original-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595.32 841.92" role="img" aria-label="Formulário CCB do Ensaio Regional em duas vias idênticas">
 <title>CONGREGAÇÃO CRISTÃ NO BRASIL — ENSAIO REGIONAL</title>
 {vias.map((d,via)=><g key={via} transform={'translate('+d+' 0)'}>
 {/* Fundos e separações medidos diretamente no arquivo original */}
 {[{y:86.90,h:1.92,cor:'#bfbfbf'},{y:120.62,h:1.92,cor:'#bfbfbf'},
 {y:180.50,h:1.20,cor:'#bfbfbf'},{y:284.45,h:1.92,cor:'#bfbfbf'},
 {y:668.74,h:15.36,cor:'#d9d9d9'},{y:684.0,h:15.34,cor:'#d9d9d9'},
 {y:699.22,h:3.0,cor:'#bfbfbf'},{y:720.94,h:12.84,cor:'#bfbfbf'}].map((f,i)=><rect key={i} x={25.92} y={f.y} width={260.45} height={f.h} fill={f.cor}/>)}
 <rect x={25.92} y={684.0} width={34.82} height={15.34} fill="#f2f2f2"/>
 <path d={bordasY.map(y=>'M 25.92 '+y+' H 286.37').join(' ')} stroke="#101010" strokeWidth=".53" fill="none" shapeRendering="crispEdges"/>
 <path d="M 25.92 28.38 V 774.76 M 286.37 28.38 V 774.76" stroke="#0c0c0c" strokeWidth="1" fill="none"/>
 <path d="M 60.68 72.42 V 86.96 M 60.68 88.76 V 103.28 M 60.68 106.16 V 120.68 M 60.68 122.48 V 721 M 60.68 733.72 V 773.92" stroke="#161616" strokeWidth=".62" fill="none"/>
 {/* Cabeçalho original em três linhas */}
 <Texto x={156.14} y={36.1} tamanho={10.6} peso={700} ancora="middle">CONGREGAÇÃO CRISTÃ NO BRASIL</Texto>
 <Texto x={156.14} y={50.6} tamanho={10.8} ancora="middle">ENSAIO REGIONAL</Texto>
 <Texto x={156.14} y={65.1} tamanho={11.0} peso={700} ancora="middle">{titulo.toUpperCase()}</Texto>
 <Texto x={27.6} y={79.9} tamanho={9.0}>DATA:</Texto><Texto x={62.5} y={79.9} tamanho={11.0}>{data}</Texto>
 <Texto x={27.4} y={96.7} tamanho={7.0} peso={700}>ANCIÃO:</Texto><Texto x={62.5} y={96.8} tamanho={11.0}>{dados.anciao}</Texto>
 <Texto x={27.4} y={113.3} tamanho={7.0} peso={700}>ENC. REG.</Texto><Texto x={62.5} y={113.3} tamanho={11.0}>{dados.encarregado_regional}</Texto>
 {/* Linha por linha: ministério com alturas próprias, incluindo espaçamento duplo após o quarto item */}
 {ministerio.map((nome,i)=><g key={nome}>
 <Texto x={43.3} y={central(ministerioY[i],ministerioY[i+1])} tamanho={10.85} ancora="middle">{dados.ministerio[nome]||0}</Texto>
 <Texto x={62.5} y={central(ministerioY[i],ministerioY[i+1])} tamanho={i===10?7.0:10.85}>{nome}</Texto>
 </g>)}
 {/* Naipes em linhas de 15,24 pontos no PDF original */}
 {instrumentos.map((nome,i)=><g key={nome}>
 <Texto x={43.3} y={central(naipesY[i],naipesY[i+1])} tamanho={10.85} ancora="middle">{qt('musicos','instrumento',nome)}</Texto>
 <Texto x={62.5} y={central(naipesY[i],naipesY[i+1])} tamanho={10.85}>{nome}</Texto>
 </g>)}
 <Texto x={43.3} y={676.3} tamanho={11.0} peso={700} ancora="middle">{musicos}</Texto>
 <Texto x={62.5} y={676.3} tamanho={11.0} italico>{via===0?'TOTAL DE MÚSICOS*':'TOTAL DE MÚSICOS'}</Texto>
 <Texto x={43.3} y={692.0} tamanho={11.0} peso={700} ancora="middle">{organistas}</Texto>
 <Texto x={62.5} y={692.0} tamanho={11.0} italico>{via===0?'TOTAL DE ORGANISTA(S)':'TOTAL DE ORGANISTAS'}</Texto>
 <Texto x={43.3} y={709.5} tamanho={11.0} peso={700} ancora="middle">{total}</Texto>
 <Texto x={62.5} y={709.5} tamanho={11.0} peso={700}>TOTAL GERAL DE MÚSICOS E ORGANISTAS</Texto>
 <Texto x={156.14} y={727.7} tamanho={11.0} peso={700} ancora="middle">OFICIALIZAÇÃO</Texto>
 <Texto x={43.3} y={740.0} tamanho={11.0} peso={700} ancora="middle">0</Texto><Texto x={62.5} y={740.0} tamanho={12.0}>Músicos</Texto>
 <Texto x={43.3} y={752.9} tamanho={11.0} peso={700} ancora="middle">0</Texto><Texto x={62.5} y={752.9} tamanho={12.0}>Organistas</Texto>
 <Texto x={43.3} y={766.6} tamanho={11.0} peso={700} ancora="middle">0</Texto><Texto x={62.5} y={766.6} tamanho={10.9} peso={700}>TOTAL DE OFICIALIZADOS</Texto>
 <Texto x={27.6} y={784.5} tamanho={9.0} italico>*Obs. Lista de instrumentos de acordo com o MOO.</Texto>
 </g>)}
 <Texto x={296} y={782.3} tamanho={11} ancora="middle">|</Texto>
 {/* Marcas de margem de corte reproduzidas na página original */}
 <path d="M 15.5 774.8 v 15.5 h 13 M 754 774.8" fill="none" stroke="#111" strokeWidth="1"/>
 </svg>;
}
