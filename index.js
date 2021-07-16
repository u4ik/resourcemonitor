const child = require('child_process');
let color = require('./terminalcolors');
let diskspace = require('diskspace');
const fs = require('fs');
let os = require('os-utils');
let _os = require('os');

let { FgRed: red, FgGreen: green } = color;

let cacheArr = [];

const readCacheConfig =  () => {
    try {
        let parsed = JSON.parse(fs.readFileSync('./cache.json'));
        let { cache } = parsed;
        cacheArr = cache;
        return cacheArr
    } catch (error) {
        fs.writeFile("./cache.json", JSON.stringify({ cache: cacheArr }), function (err) {
            if (err) {
                return console.log(err);
            }
            return [];
        });
    }
};

readCacheConfig();

const checkCPUFree = async () => {
    getCPUUsage(i => {
        let formatted = Math.floor(i * 100)
        console.log('CPU Free: ' + `${formatted < 30 ? red : green}%s\x1b[0m`, formatted, '%');
    }, true)
};

const checkFreeMem = async () => {
    let formatted = Math.floor(os.freememPercentage() * 100)
    console.log('Mem Free: ' + `${formatted < 30 ? red : green}%s\x1b[0m`, formatted, '%');
};

const checkSys = async (flag) => {
    let res = await checkCPUFree()
    if (!res) {
        checkFreeMem()
        getAllDriveSpaces();
    }
};

function getFreeSpace(path) {
    diskspace.check(path, function (err, result) {
            let percent = Math.floor(result.used / result.total * 100)
            let totalByteReducer = Math.floor(result.total / 1000000000)
            let tbr = totalByteReducer.toString()
            if (tbr[0] == 1 && tbr[1] == 0 && tbr.toString().length === 4) {
                totalByteReducer = tbr[0] + 'TB'
            } else if (tbr[0] == 2 && tbr[1] == 5) {
                totalByteReducer = '256' + 'GB'
            }
            else {
                totalByteReducer = tbr + 'GB'
            }
            if (percent) {
                console.log(path + `\\ ` + totalByteReducer + ' ' + `${percent > 60 ? red : green}%s\x1b[0m`, percent, '%');
            }
    });
};

function getAllDriveSpaces() {
    child.exec('wmic logicaldisk get name', (error, stdout) => {
  
        if (cacheArr.length == 0 ) {
            let captureDrives = stdout.split('\r\r\n').filter(value => /[A-Za-z]:/.test(value)).map(value => value.trim())
            fs.writeFile("./cache.json", JSON.stringify({ cache: captureDrives }), function (err) {
                if (err) {
                    return console.log(err);
                }
            });
            captureDrives.forEach(path => getFreeSpace(path))
        } else {
            cacheArr.forEach(path => getFreeSpace(path))
        }
    })
};
function getCPUInfo(callback) {
    let cpus = _os.cpus();
    let user = 0;
    let nice = 0;
    let sys = 0;
    let idle = 0;
    let irq = 0;
    let total = 0;
    for (let cpu in cpus) {
        user += cpus[cpu].times.user;
        nice += cpus[cpu].times.nice;
        sys += cpus[cpu].times.sys;
        irq += cpus[cpu].times.irq;
        idle += cpus[cpu].times.idle;
    }
    total = user + nice + sys + idle + irq;
    return {
        'idle': idle,
        'total': total
    };
}

function getCPUUsage(callback, free) {
    let stats1 = getCPUInfo();
    let startIdle = stats1.idle;
    let startTotal = stats1.total;

    setTimeout(function () {
        let stats2 = getCPUInfo();
        let endIdle = stats2.idle;
        let endTotal = stats2.total;

        let idle = endIdle - startIdle;
        let total = endTotal - startTotal;
        let perc = idle / total;

        if (free === true)
            callback(perc);
        else
            callback((1 - perc));

    }, 100);
}

// console.time('Check');
checkSys()
console.log('*'.repeat(40));
// console.timeEnd('Check');
