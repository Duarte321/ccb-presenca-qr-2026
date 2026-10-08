'use client';
import {useRef,useState} from 'react';
import {QRCodeCanvas} from 'qrcode.react';

type Props={token:string;nome:string;congregacao:string;categoria:string;instrumento?:string|null;cargoMinisterio?:string|null};
export default function Credencial({token,nome,congregacao,categoria,instrumento,cargoMinisterio}:Props){
 const qrRef=useRef<HTMLDivElement>(null);
 const widgetRef=useRef<HTMLDivElement>(null);
 const [notice,setNotice]=useState('');
 const [busy,setBusy]=useState(false);
 const safeName=()=>nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase();
 function drawCenter(ctx:CanvasRenderingContext2D,str:string,y:number,maxWidth=720){
  ctx.fillText(str,400,y,maxWidth);
 }
 function gerarPNG():File{
  const original=qrRef.current?.querySelector('canvas');
  if(!original)throw Error('QR Code indisponível.');
  const canvas=document.createElement('canvas');canvas.width=800;canvas.height=1000;
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas indisponível.');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,800,1000);
  ctx.fillStyle='#102743';ctx.fillRect(0,0,800,124);
  ctx.textAlign='center';ctx.fillStyle='#ffffff';ctx.font='bold 34px Arial';
  drawCenter(ctx,'CCB PRESENÇA QR',76);
  ctx.fillStyle='#102743';ctx.font='bold 29px Arial';drawCenter(ctx,nome,193);
  ctx.font='21px Arial';drawCenter(ctx,'Comum Congregação: '+congregacao,236);
  ctx.font='20px Arial';drawCenter(ctx,'Cargo / Ministério: '+(cargoMinisterio||categoria),278);
  ctx.font='19px Arial';drawCenter(ctx,instrumento?'Instrumento: '+instrumento:'',307);
  ctx.imageSmoothingEnabled=false;ctx.drawImage(original,155,320,490,490);
  ctx.fillStyle='#526477';ctx.font='20px Arial';
  drawCenter(ctx,'Apresente na portaria para registrar sua presença',861);
  ctx.font='18px Arial';drawCenter(ctx,'Credencial individual — não compartilhe',896);
  const encoded=canvas.toDataURL('image/png').split(',')[1];
  if(!encoded)throw Error('Não foi possível gerar o PNG.');
  const binary=atob(encoded);const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return new File([bytes],'credencial-'+safeName()+'.png',{type:'image/png'});
 }
 function salvarArquivo(file:File){
  const url=URL.createObjectURL(file);const a=document.createElement('a');
  a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
 }
 function baixar(){
  setBusy(true);setNotice('');
  try{salvarArquivo(gerarPNG());setNotice('PNG gerado! Confira Downloads.');}
  catch{setNotice('Não foi possível gerar o PNG. Tente novamente.');}
  finally{setBusy(false);}
 }
 async function compartilhar(){
  setBusy(true);setNotice('');
  try{
   const file=gerarPNG();
   if(typeof navigator.share==='function'&&navigator.canShare?.({files:[file]})){
    try{
     await navigator.share({files:[file],title:'Credencial CCB Presença QR',text:'Credencial individual para apresentação na portaria.'});
     setNotice('Compartilhamento aberto. Selecione o WhatsApp e o destinatário.');
    }catch(err){
     if((err as Error).name==='AbortError')setNotice('Compartilhamento cancelado.');
     else setNotice('Não foi possível compartilhar. Utilize Baixar QR (PNG).');
    }
   }else{
    salvarArquivo(file);
    setNotice('Este navegador não permite compartilhar a imagem diretamente. O PNG foi baixado: anexe-o na conversa do WhatsApp.');
   }
  }catch{setNotice('Erro ao preparar o QR. Tente baixar a imagem.');}
  finally{setBusy(false);}
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
   <strong>{nome}</strong><span>Comum Congregação: {congregacao}</span>
   <span>Cargo / Ministério: {cargoMinisterio||categoria}</span>{instrumento&&<span>Instrumento: {instrumento}</span>}
   <div className="qr-white" ref={qrRef}><QRCodeCanvas value={token} size={240} includeMargin level="H" style={{width:170,height:170}}/></div>
   <small>Credencial individual — uso nas reuniões musicais</small>
  </div>
  <div className="credential-actions">
   <button type="button" disabled={busy} onClick={baixar}>{busy?'Gerando...':'↓ Baixar QR (PNG)'}</button>
   <button type="button" disabled={busy} className="whatsapp-button" onClick={compartilhar}>Enviar pelo WhatsApp</button><button type="button" className="print-button" onClick={imprimir}>▤ Imprimir cartão</button>
  </div>
  {notice&&<p className="credential-notice" role="status">{notice}</p>}
 </div>;
}
