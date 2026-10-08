'use client';
import {useRef,useState} from 'react';
import {QRCodeCanvas} from 'qrcode.react';

type Props={token:string;nome:string;congregacao:string;categoria:string;instrumento?:string|null};
export default function Credencial({token,nome,congregacao,categoria,instrumento}:Props){
 const qrRef=useRef<HTMLDivElement>(null);
 const widgetRef=useRef<HTMLDivElement>(null);
 const [notice,setNotice]=useState('');
 const [busy,setBusy]=useState(false);
 const safeName=()=>nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase();
 function drawCenter(ctx:CanvasRenderingContext2D,str:string,y:number,maxWidth=720){
  ctx.fillText(str,400,y,maxWidth);
 }
 function baixar(){
  const original=qrRef.current?.querySelector('canvas');
  if(!original){setNotice('QR Code indisponível. Atualize a página e tente novamente.');return;}
  setBusy(true);setNotice('');
  try{
   const canvas=document.createElement('canvas');canvas.width=800;canvas.height=1000;
   const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas indisponível');
   ctx.fillStyle='#ffffff';ctx.fillRect(0,0,800,1000);
   ctx.fillStyle='#102743';ctx.fillRect(0,0,800,124);
   ctx.textAlign='center';ctx.fillStyle='#ffffff';ctx.font='bold 34px Arial';
   drawCenter(ctx,'CCB PRESENÇA QR',76);
   ctx.fillStyle='#102743';ctx.font='bold 29px Arial';
   drawCenter(ctx,nome,193);
   ctx.font='21px Arial';drawCenter(ctx,congregacao,236);
   ctx.font='20px Arial';drawCenter(ctx,[categoria,instrumento].filter(Boolean).join(' • '),278);
   ctx.imageSmoothingEnabled=false;ctx.drawImage(original,155,320,490,490);
   ctx.fillStyle='#526477';ctx.font='20px Arial';
   drawCenter(ctx,'Apresente na portaria para registrar sua presença',861);
   ctx.font='18px Arial';drawCenter(ctx,'Credencial individual — não compartilhe',896);
   canvas.toBlob(blob=>{
    if(!blob){setNotice('Não foi possível exportar a imagem.');setBusy(false);return;}
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='credencial-'+safeName()+'.png';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),10000);
    setNotice('PNG gerado! Confira a pasta Downloads.');
    setBusy(false);
   },'image/png');
  }catch{setNotice('Erro ao gerar PNG. Tente novamente.');setBusy(false);}
 }
 function imprimir(){
  const el=widgetRef.current;if(!el)return;
  el.classList.add('printing');
  const reset=()=>{el.classList.remove('printing');window.removeEventListener('afterprint',reset);};
  window.addEventListener('afterprint',reset);window.print();
 }
 return <div className="credential-widget" ref={widgetRef}>
  <div className="print-card">
   <div className="print-card-title">CCB • PRESENÇA QR</div>
   <strong>{nome}</strong><span>{congregacao}</span>
   <span>{[categoria,instrumento].filter(Boolean).join(' • ')}</span>
   <div className="qr-white" ref={qrRef}><QRCodeCanvas value={token} size={240} includeMargin level="H" style={{width:170,height:170}}/></div>
   <small>Credencial individual — uso nas reuniões musicais</small>
  </div>
  <div className="credential-actions">
   <button type="button" disabled={busy} onClick={baixar}>{busy?'Gerando...':'↓ Baixar QR (PNG)'}</button>
   <button type="button" className="print-button" onClick={imprimir}>▤ Imprimir cartão</button>
  </div>
  {notice&&<p className="credential-notice" role="status">{notice}</p>}
 </div>;
}
