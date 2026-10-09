import {login} from '../actions';
export default async function Login({searchParams}:{searchParams:Promise<{erro?:string}>}){
 const {erro}=await searchParams;
 return <main className="login-shell"><section className="card login-card"><div className="login-icon">QR</div><span className="eyebrow">ÁREA RESTRITA</span><h1>Entrar no sistema</h1><p>Acesse a portaria digital com as credenciais autorizadas.</p>
 {erro==='1'&&<p className="login-error" role="alert">E-mail ou senha incorreto. Verifique seus dados e tente novamente.</p>}
 <form action={login}><label>E-mail<input name="email" type="email" required placeholder="seuemail@exemplo.com" autoComplete="email"/></label><label>Senha<input name="password" type="password" required placeholder="Digite sua senha" autoComplete="current-password"/></label><button type="submit">Acessar painel →</button></form></section></main>;
}