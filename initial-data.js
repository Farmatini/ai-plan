// Сгенерировано sync-example.cjs. Не редактировать вручную.
window.ARCHITECTURE_EXAMPLE = {
  "nodes": [
    {
      "id": "legend-group",
      "type": "group",
      "x": 0,
      "y": 1400,
      "width": 520,
      "height": 940,
      "label": "Легенда · типы сущностей",
      "color": "#8a9bb0"
    },
    {
      "id": "ui-group",
      "type": "group",
      "label": "Интерфейс",
      "x": 0,
      "y": 0,
      "width": 520,
      "height": 1100,
      "color": "#8a9bb0"
    },
    {
      "id": "editor-group",
      "type": "group",
      "label": "Редактор холста",
      "x": 760,
      "y": 0,
      "width": 940,
      "height": 1100,
      "color": "#8a9bb0"
    },
    {
      "id": "model-group",
      "type": "group",
      "label": "Модель и геометрия",
      "x": 1940,
      "y": 0,
      "width": 520,
      "height": 1100,
      "color": "#8a9bb0"
    },
    {
      "id": "storage-group",
      "type": "group",
      "label": "Файл, настройки и черновик",
      "x": 760,
      "y": 1400,
      "width": 940,
      "height": 1050,
      "color": "#8a9bb0"
    },
    {
      "id": "quality-group",
      "type": "group",
      "label": "Проверки",
      "x": 1940,
      "y": 1400,
      "width": 520,
      "height": 1050,
      "color": "#8a9bb0"
    },
    {
      "id": "html",
      "type": "text",
      "x": 30,
      "y": 80,
      "width": 460,
      "height": 220,
      "color": "#8a9bb0",
      "text": "index.html — точка входа\nРЕАЛИЗОВАНО. Создаёт панели, холст и поля. Подключает модель, настройки, пример и обработчики.\nФайл: index.html"
    },
    {
      "id": "css",
      "type": "text",
      "x": 30,
      "y": 430,
      "width": 460,
      "height": 220,
      "color": "#8a9bb0",
      "text": "style.css — оформление\nРЕАЛИЗОВАНО. Оформляет карточки, группы, порты и подписи; адаптирует панели под узкий экран.\nФайл: style.css"
    },
    {
      "id": "sides",
      "type": "text",
      "x": 30,
      "y": 780,
      "width": 460,
      "height": 220,
      "color": "#b596e0",
      "text": "sides — набор вариантов\nРЕАЛИЗОВАНО. Массив top / right / bottom / left. Это массив строк JavaScript, а не конструкция enum языка.\nФайл: canvas-core.js"
    },
    {
      "id": "render",
      "type": "text",
      "x": 790,
      "y": 80,
      "width": 390,
      "height": 220,
      "color": "#e4a35c",
      "text": "render() — построение схемы\nРЕАЛИЗОВАНО. Создаёт DOM карточек и SVG связей из nodes/edges. Применяет цвета и состояние выделения.\nФайл: app.js"
    },
    {
      "id": "inspector",
      "type": "text",
      "x": 1280,
      "y": 80,
      "width": 390,
      "height": 220,
      "color": "#e4a35c",
      "text": "inspector() — свойства\nРЕАЛИЗОВАНО. Заполняет поля выбранного блока или связи и показывает подходящий выбор цвета.\nФайл: app.js"
    },
    {
      "id": "start-node",
      "type": "text",
      "x": 790,
      "y": 450,
      "width": 390,
      "height": 220,
      "color": "#e4a35c",
      "text": "startNode(e, n) — начало переноса\nРЕАЛИЗОВАНО. Запоминает исходные координаты выбранных узлов; для группы учитывает содержимое.\nФайл: app.js"
    },
    {
      "id": "end-gesture",
      "type": "text",
      "x": 1280,
      "y": 450,
      "width": 390,
      "height": 220,
      "color": "#e4a35c",
      "text": "endGesture() — завершение жеста\nРЕАЛИЗОВАНО. Завершает перетаскивание или выделение; сохраняет черновик после перемещения и размера.\nФайл: app.js"
    },
    {
      "id": "connect",
      "type": "text",
      "x": 790,
      "y": 810,
      "width": 390,
      "height": 220,
      "color": "#e4a35c",
      "text": "connect(id, side) — связь\nРЕАЛИЗОВАНО. Два нажатия на порты создают подписываемую связь. Порты есть у блоков и групп.\nФайл: app.js"
    },
    {
      "id": "undo",
      "type": "text",
      "x": 1280,
      "y": 810,
      "width": 390,
      "height": 220,
      "color": "#e4a35c",
      "text": "undo(redo=false) — история\nРЕАЛИЗОВАНО. Восстанавливает снимки модели, затем обновляет черновик и изображение.\nФайл: app.js"
    },
    {
      "id": "validate",
      "type": "text",
      "x": 1970,
      "y": 80,
      "width": 460,
      "height": 180,
      "color": "#e4a35c",
      "text": "validate(value) — проверка\nРЕАЛИЗОВАНО. Проверяет узлы, размеры, цвета и концы связей. Возвращает копию валидных данных.\nФайл: canvas-core.js"
    },
    {
      "id": "anchor",
      "type": "text",
      "x": 1970,
      "y": 330,
      "width": 460,
      "height": 180,
      "color": "#e4a35c",
      "text": "anchor(n, side) — точка порта\nРЕАЛИЗОВАНО. Вычисляет точку на выбранной стороне прямоугольника.\nФайл: canvas-core.js"
    },
    {
      "id": "curve",
      "type": "text",
      "x": 1970,
      "y": 580,
      "width": 460,
      "height": 180,
      "color": "#e4a35c",
      "text": "curve(a,b,from,to) — линия\nРЕАЛИЗОВАНО. Возвращает SVG путь Безье и положение подписи между портами.\nФайл: canvas-core.js"
    },
    {
      "id": "move-ids",
      "type": "text",
      "x": 1970,
      "y": 830,
      "width": 460,
      "height": 180,
      "color": "#e4a35c",
      "text": "moveIds(nodes,selected) — состав переноса\nРЕАЛИЗОВАНО. Добавляет к выделенным группам полностью содержащиеся в них узлы.\nФайл: canvas-core.js"
    },
    {
      "id": "config",
      "type": "text",
      "x": 790,
      "y": 1480,
      "width": 390,
      "height": 220,
      "color": "#8a9bb0",
      "text": "CANVAS_CONFIG — настройки\nРЕАЛИЗОВАНО. Название, ключ черновика, путь канонической схемы, имя скачивания и сообщение при открытии.\nФайл: config.js"
    },
    {
      "id": "canvas-data",
      "type": "text",
      "x": 1280,
      "y": 1480,
      "width": 390,
      "height": 220,
      "color": "#75bed0",
      "text": "project.canvas — модель схемы\nРЕАЛИЗОВАНО. Массивы nodes и edges. Это файл схемы, который читает и обновляет агент; он же учебный пример.\nФайл: project.canvas"
    },
    {
      "id": "initial-data",
      "type": "text",
      "x": 790,
      "y": 1840,
      "width": 390,
      "height": 220,
      "color": "#75bed0",
      "text": "ARCHITECTURE_EXAMPLE — стартовые данные\nРЕАЛИЗОВАНО. Сгенерированная копия project.canvas для запуска через file:// без сервера.\nФайл: initial-data.js"
    },
    {
      "id": "store",
      "type": "text",
      "x": 1280,
      "y": 1840,
      "width": 390,
      "height": 220,
      "color": "#e4a35c",
      "text": "store() — браузерный черновик\nРЕАЛИЗОВАНО. Сохраняет текущую модель в localStorage под отдельным ключом этой копии.\nФайл: app.js"
    },
    {
      "id": "download",
      "type": "text",
      "x": 790,
      "y": 2190,
      "width": 390,
      "height": 200,
      "color": "#e4a35c",
      "text": "download() — выгрузка файла\nРЕАЛИЗОВАНО. Проверяет данные, создаёт JSON Blob и отправляет .canvas в загрузки. Не заменяет файл проекта сам.\nФайл: app.js"
    },
    {
      "id": "sync",
      "type": "text",
      "x": 1970,
      "y": 1480,
      "width": 460,
      "height": 180,
      "color": "#e4a35c",
      "text": "sync-example.cjs — генерация\nРЕАЛИЗОВАНО. Читает путь из config.js, проверяет схему и обновляет initial-data.js.\nФайл: sync-example.cjs"
    },
    {
      "id": "verify",
      "type": "text",
      "x": 1970,
      "y": 1720,
      "width": 460,
      "height": 180,
      "color": "#e4a35c",
      "text": "verify.cjs — проверки модели\nРЕАЛИЗОВАНО. Проверяет данные, копию примера, локальные ссылки и уровни архитектурных связей.\nФайл: verify.cjs"
    },
    {
      "id": "smoke",
      "type": "text",
      "x": 1970,
      "y": 1960,
      "width": 460,
      "height": 180,
      "color": "#e4a35c",
      "text": "smoke-test.cjs — браузерная проверка\nРЕАЛИЗОВАНО. Проверяет жесты, цвета, связи, сохранение и предел подписей 23% в отдельном браузере.\nФайл: smoke-test.cjs"
    },
    {
      "id": "agent-doc",
      "type": "text",
      "x": 1970,
      "y": 2200,
      "width": 460,
      "height": 200,
      "color": "#8a9bb0",
      "text": "AI_AGENT_INSTRUCTIONS.md — соглашение\nРЕАЛИЗОВАНО. Объясняет агенту назначение карты, типы сущностей, легенду и два уровня связей.\nФайл: AI_AGENT_INSTRUCTIONS.md"
    },
    {
      "id": "legend-class",
      "type": "text",
      "x": 30,
      "y": 1480,
      "width": 460,
      "height": 110,
      "text": "Класс / компонент\nЗелёный — классы и объектные компоненты.",
      "color": "#76bc87"
    },
    {
      "id": "legend-module",
      "type": "text",
      "x": 30,
      "y": 1615,
      "width": 460,
      "height": 110,
      "text": "Модуль / функция\nОранжевый — скрипты, модули и именованные функции.",
      "color": "#e4a35c"
    },
    {
      "id": "legend-data",
      "type": "text",
      "x": 30,
      "y": 1750,
      "width": 460,
      "height": 110,
      "text": "Структура / таблица\nГолубой — данные, структуры, таблицы и определения.",
      "color": "#75bed0"
    },
    {
      "id": "legend-enum",
      "type": "text",
      "x": 30,
      "y": 1885,
      "width": 460,
      "height": 110,
      "text": "Перечисление / варианты\nФиолетовый — enum и наборы именованных вариантов.",
      "color": "#b596e0"
    },
    {
      "id": "legend-external",
      "type": "text",
      "x": 30,
      "y": 2020,
      "width": 460,
      "height": 110,
      "text": "Внешняя служба\nРозовый — внешние службы и хранилища.",
      "color": "#d88b9c"
    },
    {
      "id": "legend-note",
      "type": "text",
      "x": 30,
      "y": 2155,
      "width": 460,
      "height": 110,
      "text": "Описание / настройка\nСеро-синий — интерфейс, настройки и пояснения.",
      "color": "#8a9bb0"
    }
  ],
  "edges": [
    {
      "id": "html-css",
      "fromNode": "html",
      "toNode": "css",
      "fromSide": "bottom",
      "toSide": "top",
      "label": "оформляется правилами"
    },
    {
      "id": "css-sides",
      "fromNode": "html",
      "toNode": "sides",
      "fromSide": "bottom",
      "toSide": "top",
      "label": "выбор сторон в интерфейсе"
    },
    {
      "id": "render-inspector",
      "fromNode": "render",
      "toNode": "inspector",
      "fromSide": "right",
      "toSide": "left",
      "label": "дополняется панелью свойств"
    },
    {
      "id": "start-end",
      "fromNode": "start-node",
      "toNode": "end-gesture",
      "fromSide": "right",
      "toSide": "left",
      "label": "pointermove → завершение жеста"
    },
    {
      "id": "connect-render",
      "fromNode": "connect",
      "toNode": "render",
      "fromSide": "left",
      "toSide": "left",
      "label": "добавляет связь → перерисовка"
    },
    {
      "id": "undo-inspector",
      "fromNode": "undo",
      "toNode": "inspector",
      "fromSide": "right",
      "toSide": "right",
      "label": "восстанавливает модель → обновляет свойства"
    },
    {
      "id": "anchor-curve",
      "fromNode": "anchor",
      "toNode": "curve",
      "fromSide": "bottom",
      "toSide": "top",
      "label": "точки портов → путь"
    },
    {
      "id": "config-initial",
      "fromNode": "config",
      "toNode": "canvas-data",
      "fromSide": "bottom",
      "toSide": "top",
      "label": "задаёт путь исходной схемы"
    },
    {
      "id": "canvas-store",
      "fromNode": "canvas-data",
      "toNode": "store",
      "fromSide": "bottom",
      "toSide": "top",
      "label": "модель в памяти → локальный снимок"
    },
    {
      "id": "initial-download",
      "fromNode": "initial-data",
      "toNode": "download",
      "fromSide": "bottom",
      "toSide": "top",
      "label": "загруженная модель → файл"
    },
    {
      "id": "sync-verify",
      "fromNode": "sync",
      "toNode": "verify",
      "fromSide": "bottom",
      "toSide": "top",
      "label": "стартовая копия проверяется"
    },
    {
      "id": "verify-smoke",
      "fromNode": "verify",
      "toNode": "smoke",
      "fromSide": "bottom",
      "toSide": "top",
      "label": "дополняется проверкой поведения"
    },
    {
      "id": "ui-editor",
      "fromNode": "ui-group",
      "toNode": "editor-group",
      "fromSide": "right",
      "toSide": "left",
      "label": "элементы интерфейса → действия пользователя"
    },
    {
      "id": "editor-model",
      "fromNode": "editor-group",
      "toNode": "model-group",
      "fromSide": "right",
      "toSide": "left",
      "label": "валидация, геометрия и перенос групп"
    },
    {
      "id": "editor-storage",
      "fromNode": "editor-group",
      "toNode": "storage-group",
      "fromSide": "bottom",
      "toSide": "top",
      "label": "читать пример, сохранять черновик, выгружать файл"
    },
    {
      "id": "quality-storage",
      "fromNode": "quality-group",
      "toNode": "storage-group",
      "fromSide": "left",
      "toSide": "right",
      "label": "проверять и обновлять данные примера"
    },
    {
      "id": "quality-model",
      "fromNode": "quality-group",
      "toNode": "model-group",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "проверять формат и поведение"
    }
  ]
};
