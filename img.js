let config = require('./config');
let inquirer = require('inquirer');
let Rx = require('rxjs');
let { post$, exifRevGeocode$ } = require('./lib/mobile-post');

let photo_exif_prompt = {
	'name':'photo',
	'message':'photo exif',
	'filter': str => str.replace(/\\ /g," ").trim()
};

let photo_prompt = {
	'name':'photo',
	'message':'photo',
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
		INCIDENTSTREET1NAME : str1,
		INCIDENTONSTREETNAME : str2,
		INCIDENTSTREETNAME : str2,
		LOCATIONDETAILS: data.address.Address + ', ' + data.promptData.INCIDENTBOROUGH,
		INCIDENTZIP: data.address.Postal,
		INCIDENTSPATIALXCOORD: data.location.x,
		INCIDENTSPATIALYCOORD: data.location.y,
		//
		INCIDENTBOROUGH : data.promptData.INCIDENTBOROUGH,
		COMPLAINTDETAILS: data.promptData.COMPLAINTDETAILS,
		licensePlate : data.promptData.licensePlate,
	};

	Object.assign(complaint, basics, config.contact_info, incident);
	return complaint;
};

Rx.Observable.fromPromise(
	inquirer.prompt([ photo_prompt, borough_prompt, plate_prompt, complaint_prompt ])
)
	.flatMap( prompt_data => {
		return exifRevGeocode$(prompt_data)
			.map( data => Object.assign(
				formatComplaint(data),
				{ media1 : require('fs').createReadStream(prompt_data.photo)}
			));
	})
	//.flatMap( post$ )
	.do(console.log)
	.subscribe(null,null,() => console.log('done'));
