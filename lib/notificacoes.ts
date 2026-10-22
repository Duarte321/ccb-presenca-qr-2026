'use client';
export type TipoNotificacao='sucesso'|'erro'|'info';
export type MensagemNotificacao={tipo:TipoNotificacao;texto:string;id:string};
export function notificar(tipo:TipoNotificacao,texto:string){
 if(typeof window==='undefined')return;
 window.dispatchEvent(new CustomEvent<MensagemNotificacao>('ccb:notificacao',{
  detail:{tipo,texto,id:Math.random().toString(36).slice(2)+Date.now()}
 }));
}
export const avisarSucesso=(texto:string)=>notificar('sucesso',texto);
export const avisarErro=(texto:string)=>notificar('erro',texto);
