let FormData = require('form-data');
let Rx = require('rxjs');

let userId = '54cc9827-b305-4960-b088-a44faebb051b';

let objToFormData = ( obj ) => {
	let data = new FormData();

	Object.keys( obj ).forEach( k => data.append( k, obj[k] ) );
	return data;
};

let streamToString = stream =>
	Rx.Observable.create( ob => {
		let body = '';
		stream.on('error', ob.error);
		stream.on('data', chunk => body += chunk );
		stream.on('end', () => {
			ob.next(body);
			ob.complete();
		});
	});

let lookup$ = trackingNumber => {
	let formDataObj = objToFormData( {userId, v:7, trackingNumber});
	let config = {
		host: 'www1.nyc.gov',
		path: '/NYC311-Mobile-Services-A/SRlookup.htm',
		method: 'post'
	};

	return Rx.Observable.bindNodeCallback(formDataObj.submit.bind(formDataObj))(config)
		.flatMap(streamToString)
		.map(JSON.parse)
		.do(console.log)
		.flatMap(Rx.Observable.from)
		.do(console.log)
		.pluck('threeOneOneSRLookupResponse');
};

let lookupLoop$ = srnumber => Rx.Observable.of(srnumber)
	.delay(1000)
	.do(() => console.log('.'))
	.flatMap(lookup$)
	.flatMap( res => Rx.Observable.if(() =>
			res.serviceRequestNumber,
		Rx.Observable.of(res.serviceRequestNumber),
		lookupLoop$(srnumber))
	)

exports.post$ = complaint => {
	let formDataObj = objToFormData( complaint );
	let config = {
		host: 'www1.nyc.gov',
		path: '/NYC311-Mobile-Services-A/SRcreate.htm',
		method: 'post'
	};

	return Rx.Observable.bindNodeCallback(formDataObj.submit.bind(formDataObj))(config)
		.flatMap(streamToString)
		.map(JSON.parse)
		.pluck('srnumber')
		.do(console.log)
		.flatMap(lookupLoop$)
};
