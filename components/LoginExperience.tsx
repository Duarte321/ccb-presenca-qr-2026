'use client';
import {useState} from 'react';
import {login} from '../app/actions';
import InstrumentosLogin from './InstrumentosLogin';
export default function LoginExperience({erro}:{erro:boolean}){
 const [foco,setFoco]=useState<'email'|'senha'|null>(null);
 return <div className="login-experience"><InstrumentosLogin foco={foco}/><section className="card login-card"><div className="login-icon">QR</div><span className="eyebrow">ÁREA RESTRITA</span><h1>Entrar no sistema</h1><p>Acesse a portaria digital com as credenciais autorizadas.</p>
 {erro&&<p className="login-error" role="alert">E-mail ou senha incorreto. Verifique seus dados e tente novamente.</p>}
 <form action={login} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setFoco(null)}}>
 <label>E-mail<input name="email" type="email" required placeholder="seuemail@exemplo.com" autoComplete="email" onFocus={()=>setFoco('email')}/></label>
 <label>Senha<input name="password" type="password" required placeholder="Digite sua senha" autoComplete="current-password" onFocus={()=>setFoco('senha')}/></label>
 <button type="submit">Acessar painel →</button></form></section></div>;
}
