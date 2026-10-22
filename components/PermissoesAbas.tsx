'use client';
import {useState} from 'react';
import FormConfirmacao from './FormConfirmacao';
import {salvarModulosUsuario} from '../app/usuarios/actions';
import {MODULOS_USUARIO} from '../lib/modulos';
export default function PermissoesAbas({usuario,perfil,modulos}:{usuario:string;perfil:string|null;modulos:string[]|null}){
 const padrao=MODULOS_USUARIO.map(m=>m.id) as string[];
 const [selecionados,setSelecionados]=useState<string[]>(modulos??padrao);
 if(!perfil||perfil==='admin')return <p className="muted">{perfil==='admin'?'Administrador: acesso completo.':'Atribua um perfil antes de liberar abas.'}</p>;
 const alternar=(id:string,ativo:boolean)=>setSelecionados(atual=>ativo?[...new Set([...atual,id])]:atual.filter(x=>x!==id));
 return <div className="permissoes-usuario">
  <strong className="permissoes-titulo">Abas permitidas</strong>
  <div className="permissoes-presets">
   <button type="button" className="muted-button" onClick={()=>setSelecionados(['portaria'])}>Somente Portaria</button>
   <button type="button" className="muted-button" onClick={()=>setSelecionados(padrao)}>Selecionar todas</button>
  </div>
  <FormConfirmacao action={salvarModulosUsuario} mensagemSucesso="Abas permitidas atualizadas com sucesso!" className="permissoes-form">
   <input type="hidden" name="user_id" value={usuario}/>
   <div className="permissoes-abas">{MODULOS_USUARIO.map(m=><label key={m.id} className="permissao-opcao"><input type="checkbox" name="modulos" value={m.id} checked={selecionados.includes(m.id)} onChange={e=>alternar(m.id,e.target.checked)}/><span>{m.nome}</span></label>)}</div>
   <button type="submit" disabled={!selecionados.length}>Salvar abas permitidas</button>
   <p className="muted">As abas não selecionadas ficam ocultas no menu e bloqueadas por endereço direto. Clique em salvar para aplicar.</p>
  </FormConfirmacao>
 </div>;
}