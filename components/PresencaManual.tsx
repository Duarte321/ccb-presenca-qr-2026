'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {registroManual} from '../app/advanced-actions';import {notificar,avisarErro} from '../lib/notificacoes';
type Pessoa={id:string;nome:string;congregacao:string;instrumento:string|null};
export default function PresencaManual({evento,pessoas}:{evento:string;pessoas:Pessoa[]}){
 const [busca,setBusca]=useState(''),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);
 const router=useRouter();
 return <section className="manual-checkin"><h3>Presença manual</h3><p className="muted">Caso o participante esteja sem o QR Code, confirme a identidade antes de registrar.</p>
 <input aria-label="Pesquisar participante" value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Pesquisar nome ou congregação"/>
 {busca.trim().length>=2&&<div className="manual-results">{pessoas.filter(p=>[p.nome,p.congregacao,p.instrumento].join(' ').toLowerCase().includes(busca.toLowerCase())).slice(0,12).map(p=><div key={p.id} className="manual-person"><div><strong>{p.nome}</strong><small>{p.congregacao} • {p.instrumento||''}</small></div><button disabled={busy} onClick={async()=>{setBusy(true);try{const f=new FormData();f.set('evento',evento);f.set('participante',p.id);const resposta=await registroManual(f);setMsg(resposta);notificar(resposta.startsWith('Presença confirmada')?'sucesso':'info',resposta);router.refresh();}catch(e){const mensagem=e instanceof Error?e.message:'Falha ao registrar';setMsg(mensagem);avisarErro(mensagem);}finally{setBusy(false)}}}>Registrar</button></div>)}</div>}
 {msg&&<p role="status" className="status-note">{msg}</p>}</section>;
}
