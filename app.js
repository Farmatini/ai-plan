/* Локальный редактор JSON Canvas: без сети и зависимостей. */
(() => {
  'use strict';
  const C=window.CanvasCore, $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
  const viewport=$('viewport'), world=$('world');
  const config=window.CANVAS_CONFIG;
  const KEY=config.storageKey;
  document.title=config.name+' · Холст архитектуры';
  $('app-name').textContent=config.name;$('app-subtitle').textContent=config.subtitle;
  $('project-file').textContent=config.projectFileLabel;
  let data=C.validate(window.ARCHITECTURE_EXAMPLE), selected=new Set(), selectedEdge=null;
  let view={x:0,y:0,scale:1}, connecting=null, gesture=null, panMode=false;
  let history=[], future=[], lastExport=JSON.stringify(data), storageOK=true;
  function tell(message,error=false){$('message').textContent=message;$('message').dataset.error=String(error);}
  function store(){
    try{localStorage.setItem(KEY,JSON.stringify({data,savedAt:new Date().toISOString()}));storageOK=true;}
    catch{storageOK=false;}
    $('storage').textContent=storageOK?'Черновик в браузере · файл проекта отдельно':'Черновик недоступен · скачайте файл';
  }
  function remember(){
    const snapshot=JSON.stringify(data);
    if(history.at(-1)!==snapshot){history.push(snapshot);if(history.length>60)history.shift();}
    future=[];
  }
  function changed(){store();render();tell('Изменено. Скачайте .canvas и замените файл в проекте.');}
  function undo(redo=false){
    const from=redo?future:history,to=redo?history:future;
    let target=from.pop();
    while(target===JSON.stringify(data)&&from.length)target=from.pop();
    if(target===undefined){render();return;}
    to.push(JSON.stringify(data));data=JSON.parse(target);selected.clear();selectedEdge=null;connecting=null;
    changed();inspector();tell(redo?'Изменение возвращено.':'Изменение отменено.');
  }
  function point(event){const r=viewport.getBoundingClientRect();return {x:(event.clientX-r.left-view.x)/view.scale,y:(event.clientY-r.top-view.y)/view.scale};}
  function applyView(){
    world.style.transform=`translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
    // Увеличение относительно холста прекращается на 23%: ниже этого
    // порога вся подпись (текст, ширина и отступы) уменьшается с холстом.
    const labelScale=Math.max(.23,Math.min(1,view.scale));
    world.style.setProperty('--group-label-zoom',String(1/labelScale));
    world.style.setProperty('--group-label-font-size',`${(15+6*(1-labelScale))/labelScale}px`);
    viewport.style.backgroundSize=`${24*view.scale}px ${24*view.scale}px`;
    viewport.style.backgroundPosition=`${view.x}px ${view.y}px`;
    $('zoom').textContent=`${Math.round(view.scale*100)}%`;
  }
  function fit(){
    const b=C.bounds(data.nodes),r=viewport.getBoundingClientRect();
    // Верхний запас под подписи, вынесенные за геометрию групп.
    view.scale=Math.max(.08,Math.min(1.2,(r.width-90)/(b.width+50),(r.height-150)/(b.height+50)));
    view.x=(r.width-b.width*view.scale)/2-b.x*view.scale;
    view.y=90+(r.height-135-b.height*view.scale)/2-b.y*view.scale;applyView();
  }
  function zoom(factor,client){
    const r=viewport.getBoundingClientRect(),p=client||{x:r.width/2,y:r.height/2};
    const x=(p.x-view.x)/view.scale,y=(p.y-view.y)/view.scale;
    view.scale=Math.max(.08,Math.min(2.5,view.scale*factor));
    view.x=p.x-x*view.scale;view.y=p.y-y*view.scale;applyView();
  }
  function svg(tag,attrs){const el=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);return el;}
  function render(){
    $('cards').replaceChildren();$('groups').replaceChildren();$('lines').replaceChildren();
    viewport.classList.toggle('connecting',!!connecting);
    for(const n of data.nodes){
      const el=document.createElement('div');el.className=`node ${n.type==='group'?'group':''} ${selected.has(n.id)?'selected':''}`;el.dataset.id=n.id;
      Object.assign(el.style,{left:n.x+'px',top:n.y+'px',width:n.width+'px',height:n.height+'px'});
      const color=C.canvasColor(n.color);
      if(color){
        if(n.type==='group')el.style.backgroundColor=color+'24';
        else el.style.backgroundImage=`linear-gradient(${color}40, ${color}40)`;
        el.style.borderColor=color+'bb';
      }
      const text=n.type==='group'?(n.label||'Группа'):n.text;
      const lines=text.split('\n'),head=document.createElement('div');head.className='node-header';head.textContent=lines.shift()||'Без названия';el.append(head);
      if(n.type==='group')head.title=text;
      head.addEventListener('pointerdown',e=>startNode(e,n));
      if(n.type==='text'){
        const body=document.createElement('div');body.className='node-body';body.textContent=lines.join('\n');el.append(body);
        body.addEventListener('pointerdown',e=>{if(e.button===0&&!e.altKey&&!panMode){e.stopPropagation();choose(n.id,e.shiftKey);}});
      }
      for(const side of C.sides){
        const port=document.createElement('button');port.className=`port ${side}`;port.dataset.side=side;port.type='button';
        port.setAttribute('aria-label',`${head.textContent}: связь ${ {top:'сверху',right:'справа',bottom:'снизу',left:'слева'}[side]}`);
        port.addEventListener('pointerdown',e=>e.stopPropagation());port.addEventListener('click',e=>{e.stopPropagation();connect(n.id,side);});el.append(port);
      }
      const handle=document.createElement('button');handle.className='resize';handle.type='button';handle.setAttribute('aria-label','Изменить размер');
      handle.addEventListener('pointerdown',e=>{
        if(e.button!==0||e.altKey||panMode)return;
        e.stopPropagation();selected=new Set([n.id]);selectedEdge=null;remember();
        gesture={kind:'resize',start:point(e),id:n.id,width:n.width,height:n.height};viewport.setPointerCapture(e.pointerId);render();inspector();
      });el.append(handle);
      (n.type==='group'?$('groups'):$('cards')).append(el);
    }
    const byId=new Map(data.nodes.map(n=>[n.id,n]));
    for(const e of data.edges){
      const a=byId.get(e.fromNode),b=byId.get(e.toNode);if(!a||!b)continue;
      const from=e.fromSide||'right',to=e.toSide||'left',curve=C.curve(C.anchor(a,from),C.anchor(b,to),from,to);
      const line=svg('path',{d:curve.d,class:`edge-line ${selectedEdge===e.id?'selected':''}`});
      if(e.fromEnd==='arrow')line.setAttribute('marker-start','url(#arrow)');
      if(e.toEnd!=='none')line.setAttribute('marker-end','url(#arrow)');
      const hit=svg('path',{d:curve.d,class:'edge-hit','data-edge':e.id});
      hit.addEventListener('pointerdown',event=>{
        if(event.button!==0||event.altKey||panMode)return;
        event.stopPropagation();selected.clear();selectedEdge=e.id;render();inspector();
      });$('lines').append(line,hit);
      if(e.label){const label=svg('text',{x:curve.label.x,y:curve.label.y-10,'text-anchor':'middle',class:`edge-label ${selectedEdge===e.id?'selected':''}`});label.textContent=e.label;$('lines').append(label);}
    }
    $('undo').disabled=!history.length;$('redo').disabled=!future.length;$('delete').disabled=!selected.size&&!selectedEdge;
  }
  function inspector(){
    const n=selected.size===1?data.nodes.find(n=>selected.has(n.id)):null;
    const e=data.edges.find(e=>e.id===selectedEdge);
    $('node-fields').hidden=!n;$('edge-fields').hidden=!e;
    $('color-fields').hidden=!n;
    $('selection-description').textContent=n?(n.type==='group'?'Группа':'Текстовый блок'):e?'Связь между блоками':selected.size?`Выбрано блоков: ${selected.size}`:'Выберите блок или связь.';
    if(n){$('node-text').value=n.type==='group'?n.label||'':n.text;$('text-label').textContent=n.type==='group'?'Название группы':'Текст блока';$('node-width').value=n.width;$('node-height').value=n.height;}
    if(n){$('node-color-label').textContent=n.type==='group'?'Цвет фона группы':'Цвет фона блока';$('node-color').value=C.canvasColor(n.color)||(n.type==='group'?'#7693b0':'#91c8ff');$('reset-node-color').disabled=n.color===undefined;}
    if(e){$('edge-label').value=e.label||'';$('from-side').value=e.fromSide||'right';$('to-side').value=e.toSide||'left';$('from-end').value=e.fromEnd||'none';$('to-end').value=e.toEnd||'arrow';}
  }
  function choose(id,add=false){
    if(add){if(selected.has(id))selected.delete(id);else selected.add(id);}
    else selected=new Set([id]);
    selectedEdge=null;render();inspector();
  }
  function startNode(e,n){
    if(e.button!==0||e.altKey||panMode)return;
    e.stopPropagation();e.preventDefault();
    if(e.shiftKey){choose(n.id,true);if(!selected.has(n.id))return;}
    else if(!selected.has(n.id))choose(n.id);else{selectedEdge=null;inspector();}
    remember();
    const ids=C.moveIds(data.nodes,selected);
    gesture={kind:'move',start:point(e),originals:data.nodes.filter(n=>ids.has(n.id)).map(n=>({id:n.id,x:n.x,y:n.y}))};
    viewport.setPointerCapture(e.pointerId);
  }
  function connect(id,side){
    if(!connecting){connecting={id,side};render();tell('Выберите сторону второго блока. Escape — отменить.');return;}
    if(connecting.id===id&&connecting.side===side){connecting=null;render();tell('Соединение отменено.');return;}
    remember();const edge={id:C.id(),fromNode:connecting.id,fromSide:connecting.side,toNode:id,toSide:side,toEnd:'arrow',label:''};
    data.edges.push(edge);selected.clear();selectedEdge=edge.id;connecting=null;changed();inspector();$('edge-label').focus();
  }
  function center(){const r=viewport.getBoundingClientRect();return{x:Math.round((r.width/2-view.x)/view.scale),y:Math.round((r.height/2-view.y)/view.scale)};}
  function add(group=false){
    remember();let n;
    if(group&&selected.size){const b=C.bounds(data.nodes.filter(n=>selected.has(n.id)));n={id:C.id(),type:'group',x:b.x-30,y:b.y-65,width:b.width+60,height:b.height+95,label:'Новая группа'};}
    else{const p=center();n={id:C.id(),type:group?'group':'text',x:p.x-180,y:p.y-110,width:group?500:360,height:group?350:220,...(group?{label:'Новая группа'}:{text:'Название класса / системы\nПЛАН. Описание на русском.\nИсходник и карточка: пока отсутствуют.'})};}
    if(group)data.nodes.unshift(n);else data.nodes.push(n);
    selected=new Set([n.id]);selectedEdge=null;connecting=null;changed();inspector();$('node-text').focus();
  }
  function remove(){
    if(!selected.size&&!selectedEdge)return;
    remember();data.nodes=data.nodes.filter(n=>!selected.has(n.id));data.edges=data.edges.filter(e=>e.id!==selectedEdge&&!selected.has(e.fromNode)&&!selected.has(e.toNode));
    selected.clear();selectedEdge=null;connecting=null;changed();inspector();
  }
  viewport.addEventListener('pointerdown',e=>{
    if(e.button!==0&&e.button!==1)return;
    if(e.target.closest('.node')&&!e.altKey&&!panMode&&e.button!==1)return;
    e.preventDefault();viewport.setPointerCapture(e.pointerId);
    if(e.button===1||e.altKey||panMode){gesture={kind:'pan',x:e.clientX,y:e.clientY,original:{...view}};return;}
    const p=point(e);gesture={kind:'select',start:p,base:e.shiftKey?new Set(selected):new Set()};
    if(!e.shiftKey)selected.clear();selectedEdge=null;connecting=null;render();inspector();
  });
  window.addEventListener('pointermove',e=>{
    if(!gesture)return;
    if(gesture.kind==='pan'){view.x=gesture.original.x+e.clientX-gesture.x;view.y=gesture.original.y+e.clientY-gesture.y;applyView();return;}
    const p=point(e),dx=Math.round(p.x-gesture.start.x),dy=Math.round(p.y-gesture.start.y);
    if(gesture.kind==='move'){
      for(const original of gesture.originals){const n=data.nodes.find(n=>n.id===original.id);n.x=original.x+dx;n.y=original.y+dy;}render();
    }else if(gesture.kind==='resize'){
      const n=data.nodes.find(n=>n.id===gesture.id);n.width=Math.max(180,Math.min(10000,gesture.width+dx));n.height=Math.max(100,Math.min(10000,gesture.height+dy));render();inspector();
    }else if(gesture.kind==='select'){
      const b={x:Math.min(p.x,gesture.start.x),y:Math.min(p.y,gesture.start.y),width:Math.abs(p.x-gesture.start.x),height:Math.abs(p.y-gesture.start.y)};
      selected=new Set(gesture.base);
      // Рамка выбирает полностью охваченные элементы, в том числе группу.
      for(const n of data.nodes)if(C.contains(b,n))selected.add(n.id);
      const box=$('marquee');box.hidden=false;Object.assign(box.style,{left:b.x*view.scale+view.x+'px',top:b.y*view.scale+view.y+'px',width:b.width*view.scale+'px',height:b.height*view.scale+'px'});render();inspector();
    }
  });
  function endGesture(){
    if(!gesture)return;
    if(['move','resize'].includes(gesture.kind)){store();tell('Положение изменено. Скачайте схему для обновления проекта.');}
    gesture=null;$('marquee').hidden=true;render();
  }
  window.addEventListener('pointerup',endGesture);window.addEventListener('pointercancel',endGesture);
  viewport.addEventListener('wheel',e=>{e.preventDefault();const r=viewport.getBoundingClientRect();zoom(Math.exp(-e.deltaY*.0015),{x:e.clientX-r.left,y:e.clientY-r.top});},{passive:false});
  $('add').onclick=()=>add();$('group').onclick=()=>add(true);$('delete').onclick=remove;
  $('undo').onclick=()=>undo();$('redo').onclick=()=>undo(true);$('fit').onclick=fit;
  $('zoom-in').onclick=()=>zoom(1.2);$('zoom-out').onclick=()=>zoom(1/1.2);
  $('pan').onclick=()=>{panMode=!panMode;$('pan').setAttribute('aria-pressed',String(panMode));viewport.classList.toggle('panning',panMode);};
  function editField(id,apply){
    $(id).addEventListener('focus',remember);
    $(id).addEventListener('input',()=>{
      const n=selected.size===1?data.nodes.find(n=>selected.has(n.id)):null,e=data.edges.find(e=>e.id===selectedEdge);
      if(apply($(id).value,n,e)!==false)changed();
    });
  }
  editField('node-text',(v,n)=>{if(!n)return false;if(n.type==='group')n.label=v;else n.text=v;});
  editField('node-color',(v,n)=>{if(!n||!C.canvasColor(v))return false;n.color=v;$('reset-node-color').disabled=false;});
  $('reset-node-color').onclick=()=>{
    const n=selected.size===1?data.nodes.find(n=>selected.has(n.id)):null;
    if(!n||n.color===undefined)return;
    remember();delete n.color;changed();inspector();
  };
  for(const [id,key,min]of [['node-width','width',180],['node-height','height',100]]){
    editField(id,(v,n)=>{if(!n||!Number.isFinite(Number(v))||Number(v)<min||Number(v)>10000)return false;n[key]=Math.round(Number(v));});
    $(id).addEventListener('change',inspector);
  }
  for(const [id,key]of [['edge-label','label'],['from-side','fromSide'],['to-side','toSide'],['from-end','fromEnd'],['to-end','toEnd']])editField(id,(v,n,e)=>{if(!e)return false;e[key]=v;});
  function download(){
    try{
      C.validate(data);
      const content=JSON.stringify(data,null,2)+'\n',url=URL.createObjectURL(new Blob([content],{type:'application/json'}));
      const a=document.createElement('a');a.href=url;a.download=config.downloadName;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      lastExport=JSON.stringify(data);tell(`Схема отправлена в загрузки. Замените ${config.projectFileLabel} скачанным файлом.`);
    }catch(e){tell('Не удалось сохранить: '+e.message,true);}
  }
  $('download').onclick=download;$('open').onclick=()=>$('file').click();
  $('file').addEventListener('change',async()=>{
    const file=$('file').files[0];if(!file)return;
    try{
      if(file.size>5*1024*1024)throw Error('Файл больше 5 МБ.');
      const next=C.validate(JSON.parse((await file.text()).replace(/^\uFEFF/,'')));
      remember();data=next;selected.clear();selectedEdge=null;connecting=null;lastExport=JSON.stringify(data);store();render();inspector();fit();tell(`Открыт ${file.name}. Текущая схема заменена; доступна отмена.`);
    }catch(e){tell('Импорт отклонён: '+e.message,true);}
    $('file').value='';
  });
  $('example').onclick=()=>{
    remember();data=C.copy(window.ARCHITECTURE_EXAMPLE);selected.clear();selectedEdge=null;connecting=null;changed();inspector();fit();tell('Загружена исходная схема. Предыдущее состояние доступно через «Отменить».');
  };
  window.addEventListener('keydown',e=>{
    const editing=e.target.matches('input,textarea,select');
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();download();return;}
    if(e.key==='Escape'){connecting=null;gesture=null;$('marquee').hidden=true;render();tell('Действие отменено.');return;}
    if(editing)return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo(e.shiftKey);}
    else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();undo(true);}
    else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove();}
  });
  window.addEventListener('beforeunload',e=>{if(JSON.stringify(data)!==lastExport){e.preventDefault();e.returnValue='';}});
  let restored=false;
  try{const draft=JSON.parse(localStorage.getItem(KEY)||'null');if(draft?.data){data=C.validate(draft.data);restored=true;}}
  catch{storageOK=false;}
  $('storage').textContent=storageOK?'Черновик в браузере · файл проекта отдельно':'Черновик недоступен · скачайте файл';
  render();inspector();requestAnimationFrame(fit);
  tell(restored?'Восстановлен черновик браузера. Для актуального файла проекта используйте «Открыть .canvas».':config.initialMessage);
  new ResizeObserver(()=>applyView()).observe(viewport);
})();
