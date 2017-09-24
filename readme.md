Простой шаблонизатор, основанный на тегированных шаблонны строках ES6
[Подробнее](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/template_strings)

## Установка
`npm install lou`

## Использование
Для использования шаблонизатора достаточно подключить 
файл `lou.min.js`:  

`<script src="path/to/lou/dist/lou.min.js"></script>`

Если вы используете Webpack или другую систему 
сборки, то подключить Lou можно с помощью import:  

`import Lou from 'lou/src/lou';`  

После чего надо создать экземпляр шаблонизатора:  

`const b = Lou();`  

### Рендеринг в DOM

По умолчанию Lou рендерит шаблоны в JSON. Для того, чтобы 
получать результаты рендеринга в виде элементов DOM (для вставки на страницу, например), 
необходимо воспользоваться функцией domRender:  

`const render = Lou.domRender;`  

После чего, для отрисовки шаблона можно воспользоваться конструкцией вида:  

    const domElement = render(b`
        <div class="${['lol', 'kek'].join(' ')}" style="${{backgroundColor: 'black'}}"\>
            <a href="${location.href}" target="blank">Открой меня в новой вкладке!</a>
        </div>`);    
        

    
### Обработка обытий

Lou может сам навешивать обработчики событий на создаваемые им элементы DOM. Для этого
его необходимо передать в функцию domRender опцию `events: true`:  

    const render = Lou.domRender;

    const clickHandler = (event) => {
        console.log(event);
        alert('Clicked!');
    }  
    
    const domElement = render(b`
        <button type="button" onClick="${clickHandler}">Click me!</button>`, {events: true});
        

