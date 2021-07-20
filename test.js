const ora = require('ora');

let ms = 500
let throbber;

const startSpin = () => {
    throbber = ora({
        text: 'Loading Steps...',
        spinner: {
            frames: ['|', '/', '-', `\\`, '|'],
            interval: 100, // Optional
        },
    }).start();
}

const stopSpin = () => {
    throbber.stop()
}
const step1 = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            for (let i = 0; i <= 10_000_000_00; i++) {
                if (i == 10_000_000_00) {
                    resolve('step 1')
                }
            }
        }, ms)
    })

}
const step2 = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // for (let i = 0; i <= 10_000_000_00; i++) {
            //     if (i == 10_000_000_00) {
            resolve('step 2')
            //     }     
            // }
        }, ms)
    })
}

const step3 = () => {
    console.log('step 3')
}
const step4 = () => {
    for (let i = 0; i <= 10_000_000_00; i++) {
        if (i == 10_000_000_00) {

            console.log('step 4')

        }
    }
}

const runSteps = async () => {
    startSpin();
    let s1 = await step1();
    stopSpin();
    console.log(s1);
    startSpin();
    let s2 = await step2();
    stopSpin();
    console.log(s2);
    // step3();
    // step4();
};

runSteps();