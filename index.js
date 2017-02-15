let fs = require('fs');
let inquirer = require('inquirer');
let { post$, lookup$ } = require('./lib/mobile-post');

let userId = '54cc9827-b305-4960-b088-a44faebb051b';
let redTruck = {
	COMPLAINTDETAILS : 'Red truck parked on mulberry st in front of rei',
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
/*
let car = {
	COMPLAINTDETAILS : 'Car parked directly on flexpost intended to define parking limits. north end of grand army plaza east',
	COMPLAINTTYPE : 'Illegal Parking',
	CONTACTANONFLAG : 'Y',
	CONTACTDAYTIMEPHONE:'6166666561',
	CONTACTFIRSTNAME:'Matt',
	CONTACTLASTNAME:'Kime',
	CONTACTEMAILADDRESS:'matt@mattki.me',
	DESCRIPTIONRECURRINGTIME : 'Yes',
	DESCRIPTOR1 : 'Posted Parking Sign Violation',
	FORM : 'NYPD Quality of Life',
	INCIDENTADDRESSNUMBER : '',
	INCIDENTONSTREET : 'Grand Army Plaza',
	INCIDENTPLACENAME : 'Grand Army Plaza',
	INCIDENTSPATIALXCOORD : '-73.969226',
	INCIDENTSPATIALYCOORD : '40.674912',
	INCIDENTSTATE : 'New York',
	INCIDENTSTREETNAME : 'Grand Army Plaza',
	LOCATIONDETAILS : 'Grand Army Plaza, Brooklyn, NY 11238, USA',
	LOCATIONTYPE : 'Street/Sidewalk',
	MSGSOURCE : '311 Mobile - iPhone',
	topic :'Illegal Parking',
	userId, //:'60323A92-90A8-4035-9D4E-480CA05198A9',
	v :'7'
};
*/

let cab = {
	COMPLAINTDETAILS : 'Car service stopped in bike lane / failure to pull to curb. available curb space - photo attached',
	COMPLAINTTYPE : 'For Hire Vehicle Complaint',
	CONTACTANONFLAG : 'Y',
	CONTACTDAYTIMEPHONE:'6166666561',
	CONTACTFIRSTNAME:'Matt',
	CONTACTLASTNAME:'Kime',
	CONTACTEMAILADDRESS:'matt@mattki.me',
	DESCRIPTOR1 : 'Driver Complaint',
	DESCRIPTOR2 : 'Unsafe Driving',
	FORM : 'TLC FHV Complaint',
	INCIDENTADDRESSNUMBER : '',
	INCIDENTBOROUGH: 'Brooklyn',
	INCIDENTCITY: '',
	INCIDENTDATETIME: '02/14/2017 10:06:00',
	INCIDENTSTATE : '',
	INCIDENTONSTREET1NAME : 'Bedford Ave',
	INCIDENTONSTREETNAME : 'Dekalb Ave',
	INCIDENTZIP: '11205',
	MSGSOURCE : '311 Mobile - iPhone',
	VEHICLETYPE : 'Car Service',
	cellPhoneUsage : 'No',
	licensePlate : 'T720102C',
	topic : 'Taxi Driver',
	userId, //:'60323A92-90A8-4035-9D4E-480CA05198A9',
	v :'7',
	media1: require('fs').createReadStream('/Users/mattk/Desktop/Screen\ Shot\ 2017-02-03\ at\ 4.50.06\ PM.png')
}


//console.log( formDataToConfig(redTruck));
//fetch$('SRcreate.htm', formDataToConfig(cab))
/*
fetch$('SRcreate.htm', formDataToConfig(redTruck))
	.do(console.log)
	.flatMap(res=> Rx.Observable.fromPromise(res.text()))
	.subscribe(console.log);
*/

let lookup = {
	trackingNumber:'4738FFF480CA688BE0540003BA35EB85',
	userId, //:'60323A92-90A8-4035-9D4E-480CA05198A9',
	v :'7'
};
post$(redTruck)
//lookup$(lookup.trackingNumber)
	.do(console.log)
	.subscribe(console.log, console.log, () => console.log('DONE'));

