let config = require('./config');
let dateFormat = require('dateformat');
let dms2dec = require('dms2dec');
let ExifImage = require('exif').ExifImage;
let FormData = require('form-data');
let inquirer = require('inquirer');
let Rx = require('rxjs');
let { post$ } = require('./lib/mobile-post');

let photo_prompt = {
	'name':'photo',
	'message':'photo',
	//'filter': str => require('fs').createReadStream(str.replace(/\\ /g," ").trim())
	'filter': str => str.replace(/\\ /g," ").trim()
};

let borough_prompt = {
	'name':'INCIDENTBOROUGH',
	'message':'borough',
	'filter': str => str.trim()
};
let plate_prompt = {
	'name':'licensePlate',
	'message':'plate',
	'filter': str => str.trim()
};
let complaint_prompt = {
	'name':'COMPLAINTDETAILS',
	'message':'complaint',
	'filter': str => str.trim() + ' - photo attached'
};

let ExifImage$ = image => Rx.Observable.create( ob => {
	new ExifImage({ image }, (err, exif) => {
		if(err){
			console.log(err.code);
		}
		ob.next( err ? {} : exif)
		ob.complete();
	});
});

let formatExif = exif => ({
	time : exif.image.ModifyDate,
	latLong : dms2dec(exif.gps.GPSLatitude,exif.gps.GPSLatitudeRef,exif.gps.GPSLongitude,exif.gps.GPSLongitudeRef),
});
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
let objToFormData = ( obj ) => {
	let data = new FormData();

	Object.keys( obj ).forEach( k => data.append( k, obj[k] ) );
	return data;
};


let revGeocode$ = function({latLong: [ lat, long]}){
	let formData = {
		location : `{ y : ${lat}, x : ${long} }`,
		distance : 150,
		returnIntersection : 'true',
		f : 'json',
	};
	let formDataObj = objToFormData( formData);
	let config = {
		host: 'geocode.arcgis.com',
		path: '/arcgis/rest/services/World/GeocodeServer/reverseGeocode',
		method: 'post'
	};

	return Rx.Observable.bindNodeCallback(formDataObj.submit.bind(formDataObj))(config)
		.flatMap(streamToString)
		.map(JSON.parse)
		.do(console.log)
};

let exifRevGeocode$ = path => ExifImage$(path)
	.flatMap( exifInfo => {
		let datetime = modifyDate(exifInfo.exif.CreateDate);
		return Rx.Observable.if(
		() => !!exifInfo.gps,
		Rx.Observable.of(exifInfo)
			.map( formatExif )
			.flatMap( revGeocode$ )
			.map( addressInfo => Object.assign(addressInfo,{datetime})),
		Rx.Observable.of({ datetime })
	)});

var modifyDate = function(dateAsStr){
	console.log('dateAsStr', dateAsStr );
	let [ imgDate, imgTime] = dateAsStr.split(" ")
	let [ imgYear, imgMonth, imgDay ] = imgDate.split(":");
	let [ imgHour, imgMinute, imgSecond ] = imgTime.split(":");
	return dateFormat(new Date(imgYear, imgMonth - 1, imgDay, imgHour, imgMinute, imgSecond), "mm/dd/yyyy HH:MM:ss" )
}

let formatComplaint = data => {
	let complaint = {
		COMPLAINTTYPE : 'For Hire Vehicle Complaint',
		DESCRIPTOR1 : 'Driver Complaint',
		DESCRIPTOR2 : 'Unsafe Driving',
		FORM : 'TLC FHV Complaint',
		topic : 'Taxi Driver',
		cellPhoneUsage : 'No',
		VEHICLETYPE : 'Car Service',
	};
	let basics = {
		userId : config.userId,
		v :'7',
		MSGSOURCE : '311 Mobile - iPhone',
	};

	let [str1, str2] = data.address.Address.split(' & ')

	let incident = {
		INCIDENTDATETIME : data.datetime,
		INCIDENTONSTREET1NAME : str1,
		INCIDENTONSTREETNAME : str2,
		INCIDENTZIP: data.address.Postal,
		//
		INCIDENTBOROUGH : 'Manhattan',
		COMPLAINTDETAILS: 'Car service stopped in the bike lane - photo atached',
		licensePlate : 'T720102C',
	};

	Object.assign(complaint, basics, config.contact_info, incident);
	return complaint;
};

Rx.Observable.fromPromise(
	inquirer.prompt([ photo_prompt, borough_prompt, plate_prompt, complaint_prompt ])
)
.flatMap( prompt_data => {
	return exifRevGeocode$(prompt_data.photo)
		.map( data => Object.assign(
			formatComplaint(data),
			{ media1 : require('fs').createReadStream(prompt_data.photo)}
		));
})
.flatMap( post$ )
.subscribe(null,null,() => console.log('done'));
