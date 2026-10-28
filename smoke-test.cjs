// node smoke-test.cjs [каталог node_modules, содержащий playwright]
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(require.resolve('playwright',{paths:[process.argv[2]||__dirname]}));
const out=path.join(__dirname,'test-output'),fixture={window:{}};
require('node:vm').runInNewContext(fs.readFileSync(path.join(__dirname,'initial-data.js'),'utf8'),fixture);
const initial=fixture.window.ARCHITECTURE_EXAMPLE,BASE_NODES=initial.nodes.length,BASE_EDGES=initial.edges.length,BASE_GROUPS=initial.nodes.filter(n=>n.type==='group').length;
const GROUP_ID=initial.nodes.find(n=>n.type==='group'&&!n.id.startsWith('legend-')).id,groupSelector=`.group[data-id="${GROUP_ID}"]`;
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const installed=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
 const browser=await chromium.launch({headless:true,...(installed?{executablePath:installed}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
  await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  await page.waitForFunction(count=>document.querySelectorAll('.node').length===count,BASE_NODES);
  await page.screenshot({path:path.join(out,'initial.png')});
  assert.equal(await page.locator('.edge-hit').count(),BASE_EDGES);
  // Подписи групп при отдалении растут в экранных пикселях; блоки уменьшаются.
  const screenFonts=()=>page.evaluate(()=>{
    const scale=new DOMMatrixReadOnly(getComputedStyle(document.getElementById('world')).transform).a;
    const head=getComputedStyle(document.querySelector('.group .node-header'));
    return {scale,group:parseFloat(head.fontSize)*scale,worldGroup:parseFloat(head.fontSize),worldWidth:parseFloat(head.minWidth),block:parseFloat(getComputedStyle(document.querySelector('#cards .node-header')).fontSize)*scale};
  });
  await setZoom(.5);const nearFonts=await screenFonts();
  for(let i=0;i<3;i++)await page.locator('#zoom-out').click();
  const farFonts=await screenFonts();assert(farFonts.group>nearFonts.group+.5,'Название группы не увеличилось при отдалении');assert(farFonts.block<nearFonts.block,'Изменился масштаб обычных блоков');
  assert(await page.locator('.group .node-header').evaluateAll(heads=>heads.every(el=>el.scrollHeight<=el.clientHeight+1)),'Название группы обрезано');
  await page.screenshot({path:path.join(out,'zoomed-out.png')});
  async function setZoom(target){
    const current=(await screenFonts()).scale;
    await page.locator('#viewport').evaluate((el,delta)=>{const r=el.getBoundingClientRect();el.dispatchEvent(new WheelEvent('wheel',{deltaY:delta,clientX:r.x+r.width/2,clientY:r.y+r.height/2,bubbles:true,cancelable:true}));},Math.log(current/target)/.0015);
  }
  await setZoom(.23);const limitFonts=await screenFonts();
  for(const scale of [.12,.08]){
    await setZoom(scale);const distant=await screenFonts();
    assert(Math.abs(distant.worldGroup-limitFonts.worldGroup)<.01,'Название продолжило увеличиваться ниже 23%');
    assert(Math.abs(distant.worldWidth-limitFonts.worldWidth)<.01,'Ширина подписи продолжила увеличиваться ниже 23%');
    assert(Math.abs(distant.group/limitFonts.group-scale/.23)<.001,'Название не уменьшается вместе с холстом ниже 23%');
  }
  await page.screenshot({path:path.join(out,'minimum-zoom.png')});await page.locator('#fit').click();
  // Цвет группы: сброс и отмена, затем файловый round-trip.
  await page.locator(groupSelector+' .node-header').click();
  assert(await page.locator('#color-fields').isVisible());
  await page.locator('#node-color').fill('#cc6644');
  assert((await page.locator(groupSelector).evaluate(el=>el.style.backgroundColor)).includes('204, 102, 68'));
  await page.locator('#reset-node-color').click();
  assert.equal(await page.locator(groupSelector).evaluate(el=>el.style.backgroundColor),'');
  await page.locator('#undo').click();
  assert((await page.locator(groupSelector).evaluate(el=>el.style.backgroundColor)).includes('204, 102, 68'));
  await page.screenshot({path:path.join(out,'group-color.png')});
  await page.locator('#add').click();
  assert(await page.locator('#color-fields').isVisible());
  assert.equal(await page.locator('#node-color-label').innerText(),'Цвет фона блока');
  const coloredId=await page.locator('.node.selected').getAttribute('data-id');
  await page.locator('#node-color').fill('#3388dd');
  assert((await page.locator('.node.selected').evaluate(el=>el.style.backgroundImage)).includes('51, 136, 221'));
  await page.locator('#reset-node-color').click();assert.equal(await page.locator('.node.selected').evaluate(el=>el.style.backgroundImage),'');
  await page.locator('#undo').click();
  assert((await page.locator(`.node[data-id="${coloredId}"]`).evaluate(el=>el.style.backgroundImage)).includes('51, 136, 221'));
  await page.locator(`.node[data-id="${coloredId}"] .node-header`).click();
  await page.locator('#node-text').fill('Проверка класса\nПЛАН. Русский текст <script>не выполняется</script>');
  assert.equal(await page.locator('.node').count(),BASE_NODES+1);
  await page.locator('#node-width').fill('420');await page.locator('#node-width').press('Tab');
  await page.locator('#node-height').fill('240');await page.locator('#node-height').press('Tab');
  const node=page.locator('.node.selected');
  let box=await node.boundingBox();const old=box;
  const head=await node.locator('.node-header').boundingBox();
  await page.mouse.move(head.x+head.width/2,head.y+head.height/2);await page.mouse.down();await page.mouse.move(head.x+head.width/2+65,head.y+head.height/2+53,{steps:5});await page.mouse.up();
  box=await page.locator('.node.selected').boundingBox();assert(box.x>old.x+40&&box.y>old.y+35,'Не сработало перемещение');
  const resize=await page.locator('.node.selected .resize').boundingBox();
  await page.mouse.move(resize.x+resize.width/2,resize.y+resize.height/2);await page.mouse.down();await page.mouse.move(resize.x+resize.width/2+62,resize.y+resize.height/2+42,{steps:5});await page.mouse.up();
  const resized=await page.locator('.node.selected').boundingBox();assert(resized.width>box.width+40,'Не изменился размер');
  await page.locator('#group').click();assert.equal(await page.locator('.group').count(),BASE_GROUPS+1);
  await page.locator('#node-text').fill('Проверка группы');
  const g=await page.locator('.group.selected .node-header').boundingBox(),before=await page.locator('.node').filter({has:page.locator('.node-header',{hasText:'Проверка класса'})}).boundingBox();
  await page.mouse.move(g.x+15,g.y+10);await page.mouse.down();await page.mouse.move(g.x+55,g.y+40,{steps:5});await page.mouse.up();
  const moved=await page.locator('.node').filter({has:page.locator('.node-header',{hasText:'Проверка класса'})}).boundingBox();assert(moved.x>before.x+25,'Группа не переместила содержимое');
  await page.locator('#delete').click();assert.equal(await page.locator('.group').count(),BASE_GROUPS);assert.equal(await page.locator('.node').count(),BASE_NODES+1,'Удаление группы затронуло блок');
  // Новый блок остаётся после удаления рамки. Добавляем ещё один для связи.
  await page.locator('#add').click();await page.locator('#node-text').fill('Второй блок\nПЛАН. Получатель');
  const second=page.locator('.node.selected');const secondId=await second.getAttribute('data-id');
  const first=page.locator('.node').filter({has:page.locator('.node-header',{hasText:'Проверка класса'})});
  await first.locator('.node-header').click();await first.locator('.port.right').click();
  await page.locator(`.node[data-id="${secondId}"] .port.left`).click();
  assert.equal(await page.locator('.edge-hit').count(),BASE_EDGES+1);
  await page.locator('#edge-label').fill('Проверенная связь');await page.locator('#from-end').selectOption('arrow');await page.locator('#to-side').selectOption('top');
  const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadPromise;
  const saved=path.join(out,'roundtrip.canvas');await download.saveAs(saved);const exported=JSON.parse(fs.readFileSync(saved,'utf8'));
  assert.equal(exported.nodes.length,BASE_NODES+2);assert.equal(exported.edges.length,BASE_EDGES+1);
  assert.equal(exported.nodes.find(n=>n.id===GROUP_ID).color,'#cc6644');
  assert.equal(exported.nodes.find(n=>n.id===coloredId).color,'#3388dd');
  assert(exported.nodes.some(n=>n.text?.includes('<script>не выполняется</script>')));
  assert(exported.edges.some(e=>e.label==='Проверенная связь'&&e.fromEnd==='arrow'&&e.toSide==='top'));
  await page.locator('#example').click();assert.equal(await page.locator('.node').count(),BASE_NODES);
  await page.locator('#file').setInputFiles(saved);await page.waitForFunction(count=>document.querySelectorAll('.node').length===count,BASE_NODES+2);
  assert((await page.locator(groupSelector).evaluate(el=>el.style.backgroundColor)).includes('204, 102, 68'));
  await page.locator(`.node[data-id="${coloredId}"] .node-header`).click();assert.equal(await page.locator('#node-color').inputValue(),'#3388dd');
  assert((await page.locator(`.node[data-id="${coloredId}"]`).evaluate(el=>el.style.backgroundImage)).includes('51, 136, 221'));
  await page.locator(groupSelector+' .node-header').click();assert.equal(await page.locator('#node-color').inputValue(),'#cc6644');
  const bad=path.join(out,'invalid.canvas');fs.writeFileSync(bad,JSON.stringify({nodes:[],edges:[{id:'broken',fromNode:'x',toNode:'y'}]}));
  await page.locator('#file').setInputFiles(bad);await page.waitForFunction(()=>document.getElementById('message').dataset.error==='true');
  assert.equal(await page.locator('.node').count(),BASE_NODES+2,'Ошибка импорта уничтожила данные');
  await page.locator('#undo').click();assert.equal(await page.locator('.node').count(),BASE_NODES);
  await page.locator('#redo').click();assert.equal(await page.locator('.node').count(),BASE_NODES+2);
  await page.reload();await page.waitForFunction(count=>document.querySelectorAll('.node').length===count,BASE_NODES+2);
  assert((await page.locator('#message').innerText()).includes('Восстановлен'));
  assert((await page.locator(groupSelector).evaluate(el=>el.style.backgroundColor)).includes('204, 102, 68'));
  assert((await page.locator(`.node[data-id="${coloredId}"]`).evaluate(el=>el.style.backgroundImage)).includes('51, 136, 221'));
  await page.locator('#fit').click();
  // Межсистемная стрелка действительно создаётся от рамки к рамке.
  const otherGroup=initial.nodes.find(n=>n.type==='group'&&n.id!==GROUP_ID&&!n.id.startsWith('legend-')).id;
  await page.locator(groupSelector+' .node-header').click();await page.locator(groupSelector+' .port.right').click();
  await page.locator(`.group[data-id="${otherGroup}"] .port.left`).click();await page.locator('#edge-label').fill('Межсистемная проверка');
  const groupsDownload=page.waitForEvent('download');await page.locator('#download').click();
  const groupsFile=path.join(out,'group-connection.canvas');await (await groupsDownload).saveAs(groupsFile);
  assert(JSON.parse(fs.readFileSync(groupsFile,'utf8')).edges.some(e=>e.label==='Межсистемная проверка'&&e.fromNode===GROUP_ID&&e.toNode===otherGroup));
  await page.screenshot({path:path.join(out,'edited.png')});
  await page.setViewportSize({width:390,height:844});await page.locator('#fit').click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Горизонтальный выход за экран на телефоне');
  await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true});
  assert.deepEqual(errors,[],'Ошибки выполнения в браузере');
  console.log('OK: запуск file://; блоки и группы; предел увеличения подписей на 23%, проверка 12% и 8%; цвет блоков и групп, сброс и отмена; связи; экспорт/импорт и черновик с цветами; ошибочный импорт; отмена/возврат; узкий экран; без ошибок JS.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
