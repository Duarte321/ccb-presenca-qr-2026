'use client';
import {useRef,useState} from 'react';
import {QRCodeSVG} from 'qrcode.react';
type Props={token:string;nome:string;congregacao:string;categoria:string;instrumento?:string|null};
export default function Credencial({token,nome,congregacao,categoria,instrumento}:Props){
 const svgRef=useRef<HTMLDivElement>(null);
 const [notice,setNotice]=useState('');
 function svgMarkup(){return svgRef.current?.querySelector('svg')?.outerHTML||'';}
 function safeFileName(){return nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase();}
 function baixar(){
  const svg=svgMarkup();if(!svg){setNotice('Não foi possível gerar a imagem.');return;}
  const img=new Image(),url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
  img.onload=()=>{
   const canvas=document.createElement('canvas');canvas.width=800;canvas.height=1000;
   const ctx=canvas.getContext('2d');if(!ctx){URL.revokeObjectURL(url);return;}
   ctx.fillStyle='#ffffff';ctx.fillRect(0,0,800,1000);
   ctx.fillStyle='#102743';ctx.fillRect(0,0,800,125);
   ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.font='bold 34px Arial';ctx.fillText('CCB PRESENÇA QR',400,73);
   ctx.fillStyle='#102743';ctx.font='bold 29px Arial';const txt=nome.length>38?nome.slice(0,36)+'…':nome;ctx.fillText(txt,400,191);
   ctx.font='21px Arial';ctx.fillText(congregacao.slice(0,53),400,232);
   ctx.font='20px Arial';ctx.fillText([categoria,instrumento].filter(Boolean).join(' • ').slice(0,60),400,272);
   ctx.drawImage(img,160,320,480,480);
   ctx.fillStyle='#526477';ctx.font='20px Arial';ctx.fillText('Apresente na portaria para registrar sua presença',400,853);
   ctx.font='18px Arial';ctx.fillText('Credencial individual — não compartilhe',400,887);
   canvas.toBlob(blob=>{if(blob){const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='credencial-'+safeFileName()+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),30000);setNotice('Imagem PNG gerada para enviar pelo WhatsApp.');}else setNotice('Não foi possível exportar o PNG.');},'image/png');
   URL.revokeObjectURL(url);
  };
  img.onerror=()=>{URL.revokeObjectURL(url);setNotice('Não foi possível carregar o QR Code.');};
  img.src=url;
 }
 function imprimir(){window.print();}
 return <div className="credential-widget"><div className="print-card"><div className="print-card-title">CCB • PRESENÇA QR</div><strong>{nome}</strong><span>{congregacao}</span><span>{[categoria,instrumento].filter(Boolean).join(' • ')}</span><div className="qr-white" ref={svgRef}><QRCodeSVG value={token} size={170} includeMargin level="H"/></div><small>Credencial individual — uso nas reuniões musicais</small></div><div className="credential-actions"><button type="button" onClick={baixar}>↓ Baixar QR (PNG)</button><button type="button" className="print-button" onClick={imprimir}>▤ Imprimir cartão</button></div>{notice&&<p className="credential-notice" role="status">{notice}</p>}</div>;
}