(function(root){
  'use strict';
  const sides=['top','right','bottom','left'];
  const palette={'1':'#ef7777','2':'#eea560','3':'#e2ca69','4':'#76bc87','5':'#75bed0','6':'#b596e0'};
  function canvasColor(value){
    if(typeof value!=='string')return null;
    if(/^#[0-9a-f]{6}$/i.test(value))return value.toLowerCase();
    return /^[1-6]$/.test(value)?palette[value]:null;
  }
  const copy=value=>JSON.parse(JSON.stringify(value));
  const id=()=>globalThis.crypto?.randomUUID?.().replaceAll('-','') || `id${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  function validate(value){
    if(!value || typeof value!=='object' || Array.isArray(value)) throw Error('Ожидался объект JSON Canvas.');
    const data=copy(value);
    data.nodes ??= []; data.edges ??= [];
    if(!Array.isArray(data.nodes)||!Array.isArray(data.edges)) throw Error('nodes и edges должны быть массивами.');
    if(data.nodes.length>1500||data.edges.length>5000) throw Error('Для небольшого редактора слишком много элементов (до 1500 блоков / 5000 связей).');
    const nodes=new Set(), edgeIds=new Set();
    for(const n of data.nodes){
      if(!n || typeof n.id!=='string'||!n.id||nodes.has(n.id)) throw Error('У блока отсутствует ID или ID повторяется.');
      nodes.add(n.id);
      if(!['text','group'].includes(n.type)) throw Error('Поддерживаются только текстовые блоки и группы. Файловые и ссылочные узлы не загружены.');
      for(const key of ['x','y','width','height']) if(!Number.isInteger(n[key])||Math.abs(n[key])>10000000) throw Error(`Некорректная геометрия блока ${n.id}.`);
      if(n.width<40||n.height<40||n.width>10000||n.height>10000) throw Error('Размер блока должен быть от 40 до 10000.');
      if(n.type==='text'&&typeof n.text!=='string') throw Error('У текстового блока отсутствует текст.');
      if(n.label!==undefined&&typeof n.label!=='string') throw Error('Название группы должно быть строкой.');
      if(n.color!==undefined&&!canvasColor(n.color)) throw Error('Цвет блока должен быть #RRGGBB или номером палитры 1–6.');
    }
    for(const e of data.edges){
      if(!e||typeof e.id!=='string'||!e.id||edgeIds.has(e.id)||nodes.has(e.id)) throw Error('Некорректный или повторяющийся ID связи.');
      edgeIds.add(e.id);
      if(!nodes.has(e.fromNode)||!nodes.has(e.toNode)) throw Error('Связь ссылается на отсутствующий блок.');
      for(const k of ['fromSide','toSide']) if(e[k]!==undefined&&!sides.includes(e[k])) throw Error('Неизвестная сторона связи.');
      for(const k of ['fromEnd','toEnd']) if(e[k]!==undefined&&!['none','arrow'].includes(e[k])) throw Error('Неизвестный тип стрелки.');
      if(e.label!==undefined&&typeof e.label!=='string') throw Error('Подпись связи должна быть строкой.');
    }
    return data;
  }
  function bounds(nodes){
    if(!nodes.length) return {x:0,y:0,width:600,height:400};
    const x=Math.min(...nodes.map(n=>n.x)),y=Math.min(...nodes.map(n=>n.y));
    return {x,y,width:Math.max(...nodes.map(n=>n.x+n.width))-x,height:Math.max(...nodes.map(n=>n.y+n.height))-y};
  }
  function contains(a,b){return b.x>=a.x&&b.y>=a.y&&b.x+b.width<=a.x+a.width&&b.y+b.height<=a.y+a.height;}
  function intersects(a,b){return b.x<=a.x+a.width&&b.x+b.width>=a.x&&b.y<=a.y+a.height&&b.y+b.height>=a.y;}
  function moveIds(nodes,selected){
    const result=new Set(selected);
    for(const n of nodes) if(selected.has(n.id)&&n.type==='group') for(const other of nodes) if(contains(n,other)) result.add(other.id);
    return result;
  }
  function anchor(n,side){
    return side==='top'?{x:n.x+n.width/2,y:n.y}:side==='bottom'?{x:n.x+n.width/2,y:n.y+n.height}:side==='left'?{x:n.x,y:n.y+n.height/2}:{x:n.x+n.width,y:n.y+n.height/2};
  }
  function curve(a,b,from='right',to='left'){
    const vectors={top:[0,-1],right:[1,0],bottom:[0,1],left:[-1,0]};
    const distance=Math.max(60,Math.min(300,Math.hypot(a.x-b.x,a.y-b.y)/2));
    const p={x:a.x+vectors[from][0]*distance,y:a.y+vectors[from][1]*distance};
    const q={x:b.x+vectors[to][0]*distance,y:b.y+vectors[to][1]*distance};
    return {d:`M ${a.x} ${a.y} C ${p.x} ${p.y}, ${q.x} ${q.y}, ${b.x} ${b.y}`,label:{x:(a.x+3*p.x+3*q.x+b.x)/8,y:(a.y+3*p.y+3*q.y+b.y)/8}};
  }
  const api={sides,canvasColor,copy,id,validate,bounds,contains,intersects,moveIds,anchor,curve};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else root.CanvasCore=api;
})(globalThis);
