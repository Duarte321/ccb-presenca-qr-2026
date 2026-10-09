'use client';
import {useEffect} from 'react';
import {login} from '../actions';
export default function LoginError({error,reset}:{error:Error & {digest?:string};reset:()=>void}){
 useEffect(()=>{console.error('Erro ao exibir login:',error)},[error]);
 return <main className="login-shell"><section className="card login-card"><span className="eyebrow">ÁREA RESTRITA</span><h1>Entrar no sistema</h1><p>O efeito visual não pôde ser carregado. Você ainda pode entrar normalmente.</p><form action={login}><label>E-mail<input type="email" name="email" autoComplete="email" required/></label><label>Senha<input type="password" name="password" autoComplete="current-password" required/></label><button type="submit">Acessar painel →</button></form><button type="button" className="muted-button" onClick={reset}>Tentar carregar animações novamente</button></section></main>;
}
