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
	return Rx.Observable.fromPromise(fetch(`https://www1.nyc.gov/NYC311-Mobile-Services-A/${url}`,config));
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
	//.subscribe(console.log);
	//
	//
let userId = '54cc9827-b305-4960-b088-a44faebb051b';
let redTruck = {
	COMPLAINTDETAILS : 'Red pickup truck parked on mulberry st in front of rei',
	COMPLAINTTYPE : 'Illegal Parking',
	CONTACTANONFLAG : 'Y',
	CONTACTDAYTIMEPHONE:'6166666561',
	CONTACTFIRSTNAME:'Matt',
	CONTACTLASTNAME:'Kime',
	CONTACTEMAILADDRESS:'matt@mattki.me',
	DESCRIPTIONRECURRINGTIME : 'Yes',
	DESCRIPTOR1 : 'Posted Parking Sign Violation',
	FORM : 'NYPD Quality of Life',
	INCIDENTADDRESSNUMBER : '41',
	INCIDENTONSTREET : 'East Houston Street',
	INCIDENTPLACENAME : 'East Houston Street',
	INCIDENTSPATIALXCOORD : '-73.99491119384766',
	INCIDENTSPATIALYCOORD : '40.72467041015625',
	INCIDENTSTATE : 'New York',
	INCIDENTSTREETNAME : 'East Houston Street',
	LOCATIONDETAILS : '41 E Houston St, New York, NY 10012, USA',
	LOCATIONTYPE : 'Street/Sidewalk',
	MSGSOURCE : '311 Mobile - iPhone',
	topic :'Illegal Parking',
	userId, //:'60323A92-90A8-4035-9D4E-480CA05198A9',
	v :'7'
};

let formDataToConfig = formDataObj => {
	return {
		method: 'post',
		body: objToFormData( formDataObj )
	};
}

console.log( formDataToConfig(redTruck));
fetch$('SRcreate.htm', formDataToConfig(redTruck))
	.do(console.log)
	.flatMap(res=> Rx.Observable.fromPromise(res.text()))
	.subscribe(console.log);
