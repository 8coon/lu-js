Простой шаблонизатор, основанный на тегированных шаблонны строках ES6
[Подробнее](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/template_strings)

## Установка
    npm install lou

## Использование
Для использования шаблонизатора достаточно подключить 
файл `lou.min.js`:  

```html
<script src="path/to/lou/dist/lou.min.js"></script>
```

Если вы используете Webpack или другую систему 
сборки, то подключить Lou можно с помощью import:  

```js
import Lou from 'lou/src/lou';
```

После чего надо создать экземпляр шаблонизатора:  

```js
const b = Lou();
```

### Рендеринг в DOM

По умолчанию Lou рендерит шаблоны в JSON. Для того, чтобы 
получать результаты рендеринга в виде элементов DOM (для вставки на страницу, например), 
необходимо воспользоваться функцией domRender:  

```js
const render = Lou.domRender;
````

После чего, для отрисовки шаблона можно воспользоваться конструкцией вида:  

```js
const domElement = render(b`
    <div class="${['lol', 'kek'].join(' ')}" style="${{backgroundColor: 'black'}}">
        <a href="${location.href}" target="blank">Открой меня в новой вкладке!</a>
    </div>`);
```
    
### Обработка обытий

Lou может сам навешивать обработчики событий на создаваемые им элементы DOM. Для этого
его необходимо передать в функцию domRender опцию `events: true`:  

```js
const render = Lou.domRender;

const clickHandler = (event) => {
    console.log(event);
    alert('Clicked!');
};
    
const domElement = render(b`
    <button type="button" onClick="${clickHandler}">Click me!</button>`, {events: true});
```

### Включения

Вы можете включать один шаблон в другой, к примеру, так:  

```js
const input = b`<input class="my-input"/>`;
const form = b`<form action="http://backend/send"
                     method="post">
                   ${input}
               </form>`;
```

### Перечисление элементов

Lou позволяет отрисовывать массивы элементов. Единственно еограничение -- весь шаблон должен быть обёрнут в
один элемент.

```js
const nodes = [
    b`<div>Node 1</div>`,
    b`<div>Node 2</div>`,
    b`<div>Node 3</div>`,
];

const node = b`
        <div class="node-list">
            ${nodes}
        </div>`;
```

### Замена тегов

Вы можете управлять тем, как Lou обрабатывает различные теги. Для этого надо передать в `options`
словарь обработчиков тегов:

```js
const b = Lou({
    tags: {
        'Avatar': (name, attrs, children) => {
            return b`
                <div class="avatar">
                    <img src="${'http://backend/avatars/' + attrs.user.id}"/>
                    <div class="avatar__text">
                        ${attrs.user.name}
                    </div>
                </div>`;
        }
    }
});

const users = [
    {name: 'Alice', id: 1},
    {name: 'Bob', id: 2},
];

const node = b`
    <div>
        ${users.map(user => b`<Avatar user="${user}"/>`)}
    </div>`;
```