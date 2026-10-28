// Путь канонической схемы задаётся в config.js.
const fs=require('node:fs');
const path=require('node:path');
const core=require('./canvas-core.js');
const context={window:{}};
require('node:vm').runInNewContext(fs.readFileSync(path.join(__dirname,'config.js'),'utf8'),context);
const source=path.resolve(__dirname,context.window.CANVAS_CONFIG.canvasPath);
const data=core.validate(JSON.parse(fs.readFileSync(source,'utf8')));
fs.writeFileSync(path.join(__dirname,'initial-data.js'),'// Сгенерировано sync-example.cjs. Не редактировать вручную.\nwindow.ARCHITECTURE_EXAMPLE = '+JSON.stringify(data,null,2)+';\n','utf8');
console.log(`Начальный пример обновлён: ${data.nodes.length} блоков, ${data.edges.length} связей.`);
