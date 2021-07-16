let color = require('./terminalcolors')
let diskspace = require('diskspace');
let os = require('os-utils');
var _os = require('os');
const fs = require('fs');


let red = color.FgRed;
let green = color.FgGreen;

let paths = ['C', 'D']
//Look into loading up this path file, and/or having the user input their drives
/*
fs.writeFile("/tmp/test", "Hey there!", function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
}); 

// Or
fs.writeFileSync('/tmp/test-sync', 'Hey there!');
*/

const checkCPUFree = async () => {
	getCPUUsage(i => {
		let formatted = Math.floor(i * 100)
		console.log('CPU Free: ' + `${formatted < 30 ? red : green}%s\x1b[0m`, formatted, '%');
	},true)
}
const checkFreeMem = async () => {
	let formatted = Math.floor(os.freememPercentage() * 100)
	console.log('Mem Free: ' + `${formatted < 30 ? red : green}%s\x1b[0m`, formatted,'%');
}

const checkSys = async (flag) => {

	await checkCPUFree()
	checkFreeMem()
	getAllDriveSpaces();
}
function getFreeSpace(path) {
	diskspace.check(path, function (err, result) {
		let percent = Math.floor(result.used / result.total * 100)
		let totalByteReducer = Math.floor(result.total / 1000000000)
		let tbr = totalByteReducer.toString()
		if(tbr[0] == 1 && tbr[1] == 0 && tbr.toString().length === 4){
			totalByteReducer = tbr[0] + 'TB'
		}else if(tbr[0] == 2 && tbr[1] ==5){
			
			totalByteReducer = '256' + 'GB'
		}
		else{
			totalByteReducer = tbr + 'GB'
		}
		console.log(path + ':' + `\\` + totalByteReducer +' ' + `${percent > 60 ? red : green}%s\x1b[0m`,percent  ,'%');
	});
}
async function getAllDriveSpaces() {
	paths.forEach(path => getFreeSpace(path))
}
function getCPUInfo(callback){ 
    var cpus = _os.cpus();
    var user = 0;
    var nice = 0;
    var sys = 0;
    var idle = 0;
    var irq = 0;
    var total = 0;
    for(var cpu in cpus){
        user += cpus[cpu].times.user;
        nice += cpus[cpu].times.nice;
        sys += cpus[cpu].times.sys;
        irq += cpus[cpu].times.irq;
        idle += cpus[cpu].times.idle;
    }
    var total = user + nice + sys + idle + irq;
    return {
        'idle': idle, 
        'total': total
    };
}

function getCPUUsage(callback, free){ 
    var stats1 = getCPUInfo();
    var startIdle = stats1.idle;
    var startTotal = stats1.total;
	
    setTimeout(function() {
        var stats2 = getCPUInfo();
        var endIdle = stats2.idle;
        var endTotal = stats2.total;
		
        var idle 	= endIdle - startIdle;
        var total 	= endTotal - startTotal;
        var perc	= idle / total;
	  	
        if(free === true)
            callback( perc );
        else
            callback( (1 - perc) );
	  		
    }, 1 );
}


checkSys()
console.log('*'.repeat(40));
// setInterval(() => {
//     checkSys()
// }
// ,5000)
