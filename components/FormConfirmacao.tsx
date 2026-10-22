'use client';
import {useRef,useState,type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {avisarSucesso,avisarErro} from '../lib/notificacoes';
export default function FormConfirmacao({action,mensagemSucesso,children,className,limparDepois=false,aoSalvar,confirmacao}:{
 action:(dados:FormData)=>Promise<unknown>;
 mensagemSucesso:string;children:ReactNode;className?:string;limparDepois?:boolean;aoSalvar?:()=>void;confirmacao?:string
}){
 const form=useRef<HTMLFormElement>(null);
 const [salvando,setSalvando]=useState(false);
 const router=useRouter();
 return <form ref={form} className={className} aria-busy={salvando} action={async dados=>{
  if(salvando)return;
  if(confirmacao&&!window.confirm(confirmacao))return;
  setSalvando(true);
  try{
   await action(dados);
   if(limparDepois)form.current?.reset();
   avisarSucesso(mensagemSucesso);
   aoSalvar?.();
   router.refresh();
  }catch(erro){
   avisarErro(erro instanceof Error?erro.message:'Não foi possível salvar. Tente novamente.');
  }finally{setSalvando(false)}
 }}>{children}{salvando&&<p className="ccb-form-saving" role="status">Salvando informações…</p>}</form>;
}
