let cookie = require('cookie');
let exec = require('child_process').exec;
let fetch = require('node-fetch');
let fs = require('fs');
let FormData = require('form-data');
let inquirer = require('inquirer');
let Rx = require('rxjs');
let uuid = require('uuid/v4');

let prompt$ = prompts => Rx.Observable.fromPromise(inquirer.prompt(prompts));
let fetch$ = (url, config) => {
	return Rx.Observable.fromPromise(fetch(`http://www1.nyc.gov/NYC311-Mobile-Services-A/${url}`,config));
}

let captchaPrompt = [{name:'val',message:'whats the text in the image?'}];
let parseSession = res => {
	let cookies = res.headers.get('set-cookie');
	let { JSESSIONID } = cookie.parse(cookies);
	return JSESSIONID;
}

var objToFormData = ( obj ) => {
	let data = new FormData();

	Object.keys( obj ).forEach( k => data.append( k, obj[k] ) );
	return data;
};

fetch$('imageCaptcha.htm')
	//grab and save captcha
	.flatMap(res => {
		const dest = fs.createWriteStream('./captcha.jpg');
		res.body.pipe(dest);
		return Rx.Observable.fromPromise(res.text())
			.map(text => [
				parseSession(res),
				text
			]);
	})
	//display captcha
	.do(() => exec('open captcha.jpg'))
	//prompt to solve captcha
	.flatMap( ([session]) => prompt$(captchaPrompt).map(input => [session,input.val] ))
	//submit solved captcha with session info
	.flatMap( ([session,captchaResponse]) => {
		let userId = uuid();
		let config = {
			method: 'post',
			headers: {
				Cookie: cookie.serialize('JSESSIONID',session)
			},
			body : objToFormData({ captchaResponse, userId })
		};

		return fetch$('registerUser.htm', config)
			.map(res => [userId,res]);
	})
	//get response
	.flatMap(([userId,res]) => Rx.Observable.fromPromise(res.text())
		.map(text => [userId,text]))
	//clean response
	.map(([userId,txt]) => txt || `NEW USER: ${userId}`)
	//display response
	.subscribe(console.log);
