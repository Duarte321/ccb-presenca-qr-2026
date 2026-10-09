import {login} from '../actions';
export default async function Login({searchParams}:{searchParams:Promise<{erro?:string}>}){
 const {erro}=await searchParams;
 return <main className="login-shell login-simple"><section className="card login-card">
 <div className="login-icon" aria-hidden="true">QR</div>
 <span className="eyebrow">ACESSO AO SISTEMA</span>
 <h1>Bem-vindo!</h1>
 <p>Entre com seu e-mail e senha para acessar o CCB Presença QR.</p>
 {erro==='1'&&<p role="alert" className="login-error">E-mail ou senha incorreto. Verifique seus dados e tente novamente.</p>}
 <form action={login}>
 <label>E-mail<input name="email" type="email" required autoComplete="email" placeholder="seuemail@exemplo.com"/></label>
 <label>Senha<input name="password" type="password" required autoComplete="current-password" placeholder="Digite sua senha"/></label>
 <button type="submit">Entrar no sistema →</button>
 </form>
 </section></main>;
}
