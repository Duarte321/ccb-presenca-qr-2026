'use client';
import {useActionState,useEffect} from 'react';
import {notificar} from '../lib/notificacoes';
import {convidarUsuario} from '../app/usuarios/actions';
const initial={ok:false,mensagem:''};
export default function Convite(){
 const [state,action,pending]=useActionState(async (_prev:typeof initial,f:FormData)=>convidarUsuario(f),initial);
 useEffect(()=>{if(state.mensagem)notificar(state.ok?'sucesso':'erro',state.mensagem)},[state]);
 return <section className="card"><h2>Convidar por e-mail</h2><p className="muted">Convites exigem uma chave administrativa configurada no servidor. Nunca informe essa chave nesta página.</p><form action={action} className="user-invite"><label>E-mail do novo usuário<input name="email" type="email" autoComplete="email" placeholder="pessoa@exemplo.com" required/></label><button disabled={pending} type="submit">{pending?'Enviando...':'Enviar convite'}</button></form>{state.mensagem&&<p role="status" className="status-note">{state.mensagem}</p>}</section>
}