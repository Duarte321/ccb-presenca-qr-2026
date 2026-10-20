'use client';
import {useMemo,useState} from 'react';
type Registro={id:number;grupo:'musicos'|'organistas';tipo:'cidade'|'instrumento'|'nivel';valor:string;quantidade:number};
const instrumentos=['Violino','Viola','Violoncelo','Flauta','Oboé','Clarinete','Sax Soprano','Sax Alto','Sax Tenor','Sax Barítono','Trompete','Trombone','Eufônio','Tuba','Outro instrumento'];
const cidades=['Jaciara','Rondonópolis','São Pedro da Cipa','Juscimeira','Cuiabá','Campo Verde','Chapada dos Guimarães','Outra cidade'];
const niveis=['Oficializada','RDJ','Culto Oficial'];
export default function EnsaioRegionalDemo(){
 const [tela,setTela]=useState<'painel'|'musicos'|'organistas'>('painel');
 const [modoMusico,setModoMusico]=useState<'cidade'|'instrumento'>('cidade');
 const [modoOrganista,setModoOrganista]=useState<'cidade'|'nivel'>('nivel');
 const [registros,setRegistros]=useState<Registro[]>([]);
 const [customCidade,setCustomCidade]=useState('');
 const [confirmarLimpeza,setConfirmarLimpeza]=useState(false);
 const [config,setConfig]=useState(false);
 const [nomeEvento,setNomeEvento]=useState('Ensaio Regional');
 const [localEvento,setLocalEvento]=useState('');
 const [dataEvento,setDataEvento]=useState('');
 const [mostrarHistorico,setMostrarHistorico]=useState(false);
 const modo=tela==='musicos'?modoMusico:modoOrganista;
 const grupo=tela==='musicos'?'musicos':'organistas';
 const opcoes=modo==='instrumento'?instrumentos:modo==='nivel'?niveis:cidades;
 const totais=useMemo(()=>{
  const contar=(g:'musicos'|'organistas',t:'cidade'|'instrumento'|'nivel')=>registros.filter(r=>r.grupo===g&&r.tipo===t).reduce((s,r)=>s+r.quantidade,0);
  return {mc:contar('musicos','cidade'),mi:contar('musicos','instrumento'),oc:contar('organistas','cidade'),on:contar('organistas','nivel')};
 },[registros]);
 const add=(tipo:'cidade'|'instrumento'|'nivel',valor:string,quantidade:number)=>setRegistros(a=>[...a,{id:Date.now()+Math.random(),grupo,tipo,valor,quantidade}]);
 const totalPainel=totais.mc===totais.mi&&totais.oc===totais.on?totais.mc+totais.oc:null;
 return <div className="regional">
 <header className="regional-hero">
 <div><span className="regional-eyebrow">CENTRAL DE CONTAGEM MUSICAL</span><h2>{nomeEvento}</h2><p>{localEvento||'Local não informado'} {dataEvento?'• '+dataEvento:''}</p><span className="regional-demo-pill">● Prévia de interface • dados locais</span></div>
 <button type="button" className="regional-settings-button" aria-expanded={config} onClick={()=>setConfig(v=>!v)}>⚙ Configurações</button>
 </header>
 {config&&<section className="card regional-settings"><div className="regional-count-head"><h3>Configurações do ensaio</h3><button type="button" className="muted-button" onClick={()=>setConfig(false)}>Fechar</button></div><p className="muted">Personalize as informações do cabeçalho para visualizar o modelo. Nesta etapa, elas não são salvas no servidor.</p><div className="regional-config-grid"><label>Nome do evento<input value={nomeEvento} onChange={e=>setNomeEvento(e.target.value)} maxLength={90}/></label><label>Congregação / Local<input value={localEvento} onChange={e=>setLocalEvento(e.target.value)} placeholder="Ex.: Central — Jaciara"/></label><label>Data<input type="date" value={dataEvento} onChange={e=>setDataEvento(e.target.value)}/></label></div><div className="regional-settings-info"><strong>Fluxo das equipes</strong><p><b>Equipe A:</b> cidades na entrada; instrumentos após acomodação.</p><p><b>Equipe B:</b> níveis e cidades das organistas na entrada, em contagens independentes.</p></div></section>}
 <div className="regional-shortcuts"><button type="button" onClick={()=>{setTela('musicos');setModoMusico('cidade')}}><span className="regional-shortcut-icon">♫</span><span><strong>Equipe A · Músicos</strong><small>Cidades e instrumentos</small></span><span aria-hidden="true">→</span></button><button type="button" onClick={()=>{setTela('organistas');setModoOrganista('nivel')}}><span className="regional-shortcut-icon">♬</span><span><strong>Equipe B · Organistas</strong><small>Níveis e cidades</small></span><span aria-hidden="true">→</span></button></div>
 <div className="regional-switch" role="group" aria-label="Telas do Ensaio Regional">
 <button type="button" className={tela==='painel'?'active':''} onClick={()=>setTela('painel')}>Painel geral</button>
 <button type="button" className={tela==='musicos'?'active':''} onClick={()=>setTela('musicos')}>Contagem Músicos</button>
 <button type="button" className={tela==='organistas'?'active':''} onClick={()=>setTela('organistas')}>Contagem Organistas</button>
 </div>
 <div className="regional-notice"><strong>Modo demonstração:</strong></strong> os botões permitem simular lançamentos somente nesta tela. As contagens ainda não são salvas no Supabase nem compartilhadas em tempo real entre celulares.</div>
 {tela==='painel'?<><div className="regional-stats">
 {[['Músicos por cidade',totais.mc],['Músicos por instrumento',totais.mi],['Organistas por cidade',totais.oc],['Organistas por nível',totais.on]].map(([nome,total])=><div className="card regional-stat" key={nome}><span>{nome}</span><strong>{total}</strong></div>)}
 </div>
 <div className="regional-checks"><div className="card"><h3>Equipe A — Músicos</h3><p className={totais.mc===totais.mi?'regional-ok':'regional-pending'}>{totais.mc===totais.mi?'✓ Totais iguais':'⚠ Diferença de '+Math.abs(totais.mc-totais.mi)+' músico(s)'}</p></div><div className="card"><h3>Equipe B — Organistas</h3><p className={totais.oc===totais.on?'regional-ok':'regional-pending'}>{totais.oc===totais.on?'✓ Totais iguais':'⚠ Diferença de '+Math.abs(totais.oc-totais.on)+' organista(s)'}</p></div></div>
 <div className="card"><h2>Total geral conferido</h2><strong className="regional-grand-total">{totalPainel===null?'—':totalPainel}</strong><p className="muted">O total é exibido quando as duas conferências estão equilibradas. Números iguais não garantem, por si só, que não houve duplicidade.</p></div>
 </>:<><section className="card"><h2>{tela==='musicos'?'Equipe A — Músicos':'Equipe B — Organistas'}</h2><p className="muted">{tela==='musicos'?'Conte as cidades na entrada e os instrumentos depois que todos estiverem sentados.':'Uma responsável conta os níveis na entrada; outra registra as cidades das organistas.'}</p>
 <div className="regional-switch" role="group" aria-label="Tipo de contagem">{tela==='musicos'?<><button className={modoMusico==='cidade'?'active':''} type="button" onClick={()=>setModoMusico('cidade')}>Por cidade</button><button className={modoMusico==='instrumento'?'active':''} type="button" onClick={()=>setModoMusico('instrumento')}>Por instrumento</button></>:<><button className={modoOrganista==='nivel'?'active':''} type="button" onClick={()=>setModoOrganista('nivel')}>Por nível</button><button className={modoOrganista==='cidade'?'active':''} type="button" onClick={()=>setModoOrganista('cidade')}>Por cidade</button></>}</div>
 <div className="regional-count-head"><h3>{modo==='instrumento'?'Instrumentos':modo==='nivel'?'Níveis das organistas':'Cidades de origem'}</h3><strong>Total: {registros.filter(r=>r.grupo===grupo&&r.tipo===modo).reduce((s,r)=>s+r.quantidade,0)}</strong></div>
 <div className="regional-counter-grid">{opcoes.map(item=>{const valor=registros.filter(r=>r.grupo===grupo&&r.tipo===modo&&r.valor===item).reduce((s,r)=>s+r.quantidade,0);return <div className="regional-counter" key={item}><span>{item}</span><div><button type="button" aria-label={'Remover 1 de '+item} disabled={valor===0} onClick={()=>add(modo,item,-1)}>−</button><strong>{valor}</strong><button type="button" aria-label={'Adicionar 1 a '+item} onClick={()=>add(modo,item,1)}>+</button></div></div>})}</div>
 {modo==='cidade'&&<form className="regional-new-city" onSubmit={e=>{e.preventDefault();if(customCidade.trim()){add('cidade',customCidade.trim(),1);setCustomCidade('')}}}><label>Outra cidade não listada<input value={customCidade} onChange={e=>setCustomCidade(e.target.value)} placeholder="Digite a cidade" /></label><button type="submit" disabled={!customCidade.trim()}>+ Registrar cidade</button></form>}
 </section></>}
 <section className="card"><div className="regional-count-head"><h2>Histórico de lançamentos</h2><button type="button" className="muted-button" aria-expanded={mostrarHistorico} onClick={()=>setMostrarHistorico(v=>!v)}>{mostrarHistorico?'Ocultar':'Mostrar'}</button>{registros.length>0&&<button type="button" className="muted-button" onClick={()=>setConfirmarLimpeza(true)}>Limpar prévia</button>}</div>
 {mostrarHistorico&&(registros.length===0?<p className="muted">Nenhum lançamento nesta demonstração. Escolha uma tela e use os botões + e −.</p>:<div className="regional-log">{[...registros].reverse().slice(0,10).map(r=><div key={r.id}><span>{r.grupo==='musicos'?'Músicos':'Organistas'} • {r.tipo==='cidade'?'Cidade':r.tipo==='nivel'?'Nível':'Instrumento'} • <strong>{r.valor}</strong></span><b>{r.quantidade>0?'+':''}{r.quantidade}</b></div>)}</div>)}
 {confirmarLimpeza&&<div className="regional-confirm"><p>Limpar todos os números desta demonstração?</p><button type="button" onClick={()=>{setRegistros([]);setConfirmarLimpeza(false)}}>Confirmar</button><button type="button" className="muted-button" onClick={()=>setConfirmarLimpeza(false)}>Cancelar</button></div>}
 </section>
 <p className="muted">Próxima etapa: salvar os contadores no Supabase em tempo real e conectar o formulário PDF que será enviado.</p>
 </div>;
}
