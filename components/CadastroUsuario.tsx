'use client';
import {useActionState} from 'react';
import {criarUsuarioComSenha} from '../app/usuarios/actions';
const inicial={ok:false,mensagem:''};
export default function CadastroUsuario(){
 const [estado,acao,pendente]=useActionState(async(_anterior:typeof inicial,dados:FormData)=>criarUsuarioComSenha(dados),inicial);
 return <section className="card"><h2>Cadastrar usuário com senha</h2><p className="muted">Defina um e-mail, uma senha inicial e o nível de acesso. As senhas existentes não são exibidas nem armazenadas nesta página.</p><form action={acao} className="form-grid"><label>E-mail<input name="email" type="email" autoComplete="off" required placeholder="usuario@exemplo.com"/></label><label>Senha inicial<input name="password" type="password" minLength={10} maxLength={128} autoComplete="new-password" required placeholder="Mínimo de 10 caracteres"/></label><label>Perfil<select name="perfil" defaultValue="consulta"><option value="consulta">Consulta</option><option value="porteiro">Portaria</option><option value="secretaria">Secretaria</option><option value="admin">Administrador</option></select></label><div className="user-create-submit"><button type="submit" disabled={pendente}>{pendente?'Cadastrando...':'Cadastrar usuário'}</button></div></form>{estado.mensagem&&<p className="status-note" role="status">{estado.mensagem}</p>}</section>;
}
