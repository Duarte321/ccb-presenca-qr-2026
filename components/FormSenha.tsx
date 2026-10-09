'use client';
import {useActionState} from 'react';
import {alterarMinhaSenha} from '../app/minha-conta/actions';
export default function FormSenha(){
 const [estado,acao,pendente]=useActionState(alterarMinhaSenha,{ok:false,mensagem:''});
 return <form action={acao} className="password-form">
  <label>Senha atual<input name="atual" type="password" autoComplete="current-password" required/></label>
  <label>Nova senha<input name="nova" type="password" autoComplete="new-password" minLength={10} maxLength={128} required placeholder="Pelo menos 10 caracteres"/></label>
  <label>Confirmar nova senha<input name="confirmar" type="password" autoComplete="new-password" minLength={10} maxLength={128} required/></label>
  <button type="submit" disabled={pendente}>{pendente?'Alterando...':'Salvar nova senha'}</button>
  {estado.mensagem&&<p role="status" className={estado.ok?'scan-result ok':'status-note'}>{estado.mensagem}</p>}
 </form>;
}
