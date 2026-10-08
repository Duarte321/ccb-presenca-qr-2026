'use client';
import {useEffect,useRef,useState} from 'react';
import {Html5Qrcode} from 'html5-qrcode';

export default function Scanner({evento}:{evento:string}){
  const [status,setStatus]=useState('Aguardando câmera...');
  const gate=useRef(false);
  useEffect(()=>{
    let cancelled=false;
    const q=new Html5Qrcode('camera');
    q.start(
      {facingMode:'environment'},
      {fps:10,qrbox:230},
      async token=>{
        if(gate.current||cancelled)return;
        gate.current=true;
        try{
          const r=await fetch('/api/checkin',{
            method:'POST',
            headers:{'content-type':'application/json'},
            body:JSON.stringify({evento_id:evento,token})
          });
          const j=await r.json();
          if(!cancelled)setStatus(j.message);
        }catch{
          if(!cancelled)setStatus('Falha de rede');
        }finally{
          setTimeout(()=>{gate.current=false},2000);
        }
      },
      ()=>{}
    ).catch(()=>{if(!cancelled)setStatus('Autorize a câmera e use HTTPS')});
    return ()=>{
      cancelled=true;
      void q.stop().then(()=>{q.clear()}).catch(()=>{});
    };
  },[evento]);
  return <section className="card"><div id="camera" style={{maxWidth:440}}/><p aria-live="polite">{status}</p></section>;
}
