'use client';
import {useState} from 'react';
import {QRCodeCanvas} from 'qrcode.react';
type P={id:string;nome:string;congregacao:string;cargo_ministerio:string|null;instrumento:string|null;credenciais_qr:{token:string;ativo:boolean}[]};
export default function ImprimirLote({pessoas}:{pessoas:P[]}){
 const [ids,setIds]=useState<string[]>([]),[imprimindo,setImprimindo]=useState(false);
 const selecionadas=pessoas.filter(p=>ids.includes(p.id)&&p.credenciais_qr?.some(c=>c.ativo));
 function imprimir(){setImprimindo(true);const reset=()=>{setImprimindo(false);window.removeEventListener('afterprint',reset)};window.addEventListener('afterprint',reset);setTimeout(()=>window.print(),100);}
 return <section className="card batch-section"><h2>Credenciais em lote</h2><p className="muted">Selecione participantes e imprima cartões QR em uma folha A4. Apenas credenciais ativas são incluídas.</p>
 <div className="actions"><button type="button" onClick={()=>setIds(pessoas.filter(p=>p.credenciais_qr?.some(c=>c.ativo)).map(p=>p.id))}>Selecionar todos ativos</button><button type="button" className="muted-button" onClick={()=>setIds([])}>Limpar seleção</button><button type="button" disabled={!selecionadas.length} onClick={imprimir}>Imprimir {selecionadas.length} cartão(ões)</button></div>
 <div className="batch-options">{pessoas.map(p=><label key={p.id}><input type="checkbox" checked={ids.includes(p.id)} disabled={!p.credenciais_qr?.some(c=>c.ativo)} onChange={e=>setIds(v=>e.target.checked?[...v,p.id]:v.filter(x=>x!==p.id))}/>{p.nome}</label>)}</div>
 {imprimindo&&<div className="batch-print">{selecionadas.map(p=><article key={p.id} className="batch-card"><strong>CCB • PRESENÇA QR</strong><b>{p.nome}</b><small>{p.congregacao}</small><small>{p.cargo_ministerio||''} • {p.instrumento||''}</small><QRCodeCanvas size={135} includeMargin value={p.credenciais_qr.find(c=>c.ativo)!.token}/></article>)}</div>}
 </section>
}