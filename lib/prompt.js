const inquirer = require('inquirer');


let cab = {
	//COMPLAINTDETAILS : 'Car service stopped in bike lane / failure to pull to curb. available curb space - photo attached',
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
	//INCIDENTBOROUGH: 'Brooklyn',
	INCIDENTCITY: '',
	//INCIDENTDATETIME: '01/30/2017 09:16:00',
	INCIDENTSTATE : '',
	//INCIDENTONSTREET1NAME : 'Bedford Ave',
	//INCIDENTONSTREETNAME : 'Dekalb Ave',
	//INCIDENTZIP: '11205',
	MSGSOURCE : '311 Mobile - iPhone',
	VEHICLETYPE : 'Car Service',
	cellPhoneUsage : 'No',
	//licensePlate : 'T720102C',
	topic : 'Taxi Driver',
	userId, //:'60323A92-90A8-4035-9D4E-480CA05198A9',
	v :'7',
	//media1: require('fs').createReadStream('/Users/mattk/Desktop/Screen\ Shot\ 2017-02-03\ at\ 4.50.06\ PM.png')
}

const COMPLAINTTYPE : {
	name : 'COMPLAINTTYPE',
	message : 'complaint type',
	type: 'list',
	choices : ['Yellow Taxi','Car Service / Green Taxi'],
	filter: str => {
		let val = '';
		switch( str ){
			case 'Yellow Taxi':
				val = '???';
				break;
			case 'Car Service / Green Taxi':
				val = 'For Hire Vehicle Complaint'
				break;
		}
		return val;
	}
}

const COMPLAINTDETAILS : {
	name : 'COMPLAINTDETAILS',
	message : 'complaint',
}
