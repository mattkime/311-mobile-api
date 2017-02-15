let dateFormat = require('dateformat');
let dms2dec = require('dms2dec');
let ExifImage = require('exif').ExifImage;
let FormData = require('form-data');
let Rx = require('rxjs');

let userId = '54cc9827-b305-4960-b088-a44faebb051b';

let objToFormData = ( obj ) => {
	let data = new FormData();

	Object.keys( obj ).forEach( k => data.append( k, obj[k] ) );
	data.submit = data.submit.bind(data);
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

let configCreator = (service,method='post') => ({
	host: 'www1.nyc.gov',
	path: `/NYC311-Mobile-Services-A/SR${service}.htm`,
	method
});

let lookup$ = trackingNumber => {
	let formDataObj = objToFormData( {userId, v:7, trackingNumber});

	return Rx.Observable.bindNodeCallback(formDataObj.submit)(configCreator('lookup'))
		.flatMap(streamToString)
		.map(JSON.parse)
		.flatMap(Rx.Observable.from)
		.pluck('threeOneOneSRLookupResponse');
};

exports.lookup$ = lookup$;

let lookupLoop$ = srnumber => Rx.Observable.of(srnumber)
	.delay(1000)
	.do(() => console.log('.'))
	.flatMap(lookup$)
	.flatMap( res => Rx.Observable.if(
			() => res.serviceRequestNumber,
		Rx.Observable.of(res.serviceRequestNumber),
		lookupLoop$(srnumber))
	);

var modifyDate = function(dateAsStr){
	console.log('dateAsStr', dateAsStr );
	let [ imgDate, imgTime] = dateAsStr.split(" ")
	let [ imgYear, imgMonth, imgDay ] = imgDate.split(":");
	let [ imgHour, imgMinute, imgSecond ] = imgTime.split(":");
	return dateFormat(new Date(imgYear, imgMonth - 1, imgDay, imgHour, imgMinute, imgSecond), "mm/dd/yyyy HH:MM:ss" )
};

let revGeocode$ = function({latLong: [ lat, long]}){
	let config = {
		host: 'geocode.arcgis.com',
		path: '/arcgis/rest/services/World/GeocodeServer/reverseGeocode',
		method: 'post'
	};
	let formDataObj = objToFormData({
		location : `{ y : ${lat}, x : ${long} }`,
		distance : 150,
		returnIntersection : 'true',
		f : 'json',
	});

	return Rx.Observable.bindNodeCallback(formDataObj.submit)(config)
		.flatMap(streamToString)
		.map(JSON.parse)
		.do(console.log)
};

let formatExif = exif => ({
	time : exif.image.ModifyDate,
	latLong : dms2dec(exif.gps.GPSLatitude,exif.gps.GPSLatitudeRef,exif.gps.GPSLongitude,exif.gps.GPSLongitudeRef),
});

exports.exifRevGeocode$ = promptData => ExifImage$(promptData.photo)
	.flatMap( exifInfo => {
		let datetime = modifyDate(exifInfo.exif.CreateDate);
		return Rx.Observable.if(
		() => !!exifInfo.gps,
		Rx.Observable.of(exifInfo)
			.map( formatExif )
			.flatMap( revGeocode$ )
			.do(console.log)
			.map( addressInfo => Object.assign(addressInfo,{datetime, promptData}))
			.do(console.log),
		Rx.Observable.of({ datetime, promptData })
	)});
	
let ExifImage$ = image => Rx.Observable.create( ob => {
	new ExifImage({ image }, (err, exif) => {
		if(err){
			console.log(err.code);
		}
		ob.next( err ? {} : exif)
		ob.complete();
	});
});

exports.post$ = complaint => {
	let formDataObj = objToFormData( complaint );

	return Rx.Observable.bindNodeCallback(formDataObj.submit)(configCreator('create'))
		.flatMap(streamToString)
		.map(JSON.parse)
		.pluck('srnumber')
		.do(console.log)
		.flatMap(lookupLoop$)
};
