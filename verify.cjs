const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const C=require('./canvas-core.js');
const settings={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'config.js'),'utf8'),settings);
const config=settings.window.CANVAS_CONFIG,root=path.resolve(__dirname,config.projectRoot);
const data=C.validate(JSON.parse(fs.readFileSync(path.resolve(__dirname,config.canvasPath),'utf8')));
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'initial-data.js'),'utf8'),context);
assert.equal(JSON.stringify(context.window.ARCHITECTURE_EXAMPLE),JSON.stringify(data),'Стартовый пример отстал от файла проекта: запустите sync-example.cjs');
if(config.expectPlanned)assert(data.nodes.filter(n=>!n.id.startsWith('legend-')).every(n=>(n.text||n.label).includes('ПЛАН')),'Будущие блоки должны иметь явный статус');
// В эталонной схеме внутренние стрелки связывают сущности одной системы,
// межсистемные — рамки групп. Легенда не участвует в зависимостях.
const groups=data.nodes.filter(n=>n.type==='group');
const owner=n=>groups.filter(g=>g.id!==n.id&&C.contains(g,n)).sort((a,b)=>a.width*a.height-b.width*b.height)[0]?.id;
const byId=new Map(data.nodes.map(n=>[n.id,n]));
for(const edge of data.edges){
  const a=byId.get(edge.fromNode),b=byId.get(edge.toNode);
  assert(!a.id.startsWith('legend-')&&!b.id.startsWith('legend-'),'Легенда не должна участвовать в зависимостях');
  assert(a.type==='group'&&b.type==='group'||a.type==='text'&&b.type==='text'&&owner(a)&&owner(a)===owner(b),'Межсистемные связи должны соединять группы');
}
const sample={nodes:[{id:'g',type:'group',x:0,y:0,width:500,height:500},{id:'a',type:'text',x:30,y:50,width:200,height:150,text:'А'},{id:'b',type:'text',x:600,y:0,width:200,height:150,text:'Б'}],edges:[{id:'e',fromNode:'a',toNode:'b'}]};
assert.deepEqual([...C.moveIds(sample.nodes,new Set(['g']))].sort(),['a','g']);
assert.deepEqual(C.anchor(sample.nodes[1],'bottom'),{x:130,y:200});
assert(C.curve({x:0,y:0},{x:200,y:200},'top','right').d.startsWith('M 0 0 C'));
assert.deepEqual(C.validate(sample),sample);
assert.equal(C.canvasColor('#AACCFF'),'#aaccff');
assert.equal(C.canvasColor('4'),'#76bc87');
assert.equal(C.canvasColor('__proto__'),null);
const colored=C.copy(sample);colored.nodes[0].color='#6299cc';assert.equal(C.validate(colored).nodes[0].color,'#6299cc');
for(const mutate of [d=>d.nodes.push({...d.nodes[1]}),d=>d.edges[0].toNode='missing',d=>d.nodes[1].text=123,d=>d.nodes[1].type='file',d=>d.edges[0].fromSide='unknown',d=>d.nodes[0].width=-1]){
  const bad=C.copy(sample);mutate(bad);assert.throws(()=>C.validate(bad));
}
for(const color of ['__proto__','#123','red',{},7]){const bad=C.copy(sample);bad.nodes[0].color=color;assert.throws(()=>C.validate(bad));}
// Проверка относительных ссылок Markdown в документации.
const markdown=[];
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())walk(p);else if(item.name.endsWith('.md'))markdown.push(p);}}
if(fs.existsSync(path.join(root,'docs')))walk(path.join(root,'docs'));
for(const dir of new Set([root,__dirname]))for(const item of fs.readdirSync(dir,{withFileTypes:true}))if(item.isFile()&&item.name.endsWith('.md'))markdown.push(path.join(dir,item.name));
for(const file of new Set(markdown)){const text=fs.readFileSync(file,'utf8');for(const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){const target=m[1].split('#')[0];if(!target||/^[a-z]+:/i.test(target))continue;assert(fs.existsSync(path.resolve(path.dirname(file),target)),`Не найдена ссылка ${target} в ${file}`);}}
console.log(`OK: модель и некорректный импорт; ${data.nodes.length} блоков / ${data.edges.length} связей; синхронизация примера; ссылки в ${markdown.length} Markdown-файлах.`);
