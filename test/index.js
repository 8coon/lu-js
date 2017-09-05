const watch = require('node-watch');
const express = require('express');
const fs = require('fs');


const app = express();
let changed = false;


const findTests = (dir, first = true) => fs.readdirSync(dir, 'utf8')
	.reduce((tests, testFile) => {
		const filename = `${dir}/${testFile}`;

		if (fs.statSync(filename).isDirectory()) {
			tests.push(...findTests(filename, false));
		} else if (!first) {
			tests.push(`<script>${fs.readFileSync(filename, 'utf8')}</script>`);
		}

		return tests;
	}, [])
	.join('');


app.get('/status', (request, response) => {
	response.send(JSON.stringify({changed}));
});


app.get('/', (request, response) => {
	changed = false;
	response.send(fs.readFileSync('./test/index.html', 'utf8').replace('{tests}', findTests('./test/')));
});

app.use('/mocha', express.static('./node_modules/mocha/'));
app.use('/chai', express.static('./node_modules/chai/'));

app.use('/template', express.static('./template/'));
app.use('/map', express.static('./map/'));


const watcher = () => {
	changed = true;
};

watch('./template', {recursive: true}, watcher);
watch('./map', {recursive: true}, watcher);
watch('./test', {recursive: true}, watcher);


app.listen(3000, () => {
	console.log('Running dev server on port 3000');
});
