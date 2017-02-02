let FormData = require('form-data');
let Rx = require('rxjs');

let submitComplaint$ = complaint => {
	let formDataObj = objToFormData( complaint )
	let config = {
		host: 'www1.nyc.gov',
		path: '/NYC311-Mobile-Services-A/SRcreate.htm',
		//protocol: 'https:',
		method: 'post'
	};

	return Rx.Observable.fromNodeCallback(formDataObj(config));
};

/*
objToFormData(cab).submit(config, (err, res) => {
	if(err){
		console.log('error');
		console.log(err);
	}else{
		let body = '';
		res.on('data', chunk => body += chunk);
		res.on('end', () => console.log(body));
	}})
*/

let streamToString = stream =>
	Rx.Observable.create( ob => {
		let body = '';
		res.on('error', ob.error);
		res.on('data', chunk => body += chunk );
		res.on('end', () => {
			ob.next(body);
			ob.complete();
		});
	});

submitComplaint$( data )
	.flatMap(streamToString)
	.subscribe(console.log, console.log, () => console.log('DONE'));

//console.log( formDataToConfig(redTruck));
//fetch$('SRcreate.htm', formDataToConfig(cab))
/*
fetch$('SRcreate.htm', formDataToConfig(redTruck))
	.do(console.log)
	.flatMap(res=> Rx.Observable.fromPromise(res.text()))
	.subscribe(console.log);
*/
