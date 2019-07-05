const fs = require('fs');
const path = require('path');

const scan = function (options) {
    const Nightmare = require('nightmare')
    let result = {
        sources: '',
        name: 'Web指纹',
        site: options.uri,
        html: '<base href="https://www.wappalyzer.com/"></base>',
        json: {},
    }
    const nightmare = Nightmare({
        electronPath: electron_path,
        show: true,
        // openDevTools: {
        //   mode: 'detach'
        // },
    })

    nightmare
        .goto('https://www.wappalyzer.com/')
        .insert('[class="input is-medium"]', options.uri)
        .click('[class="button is-primary is-medium"]')
        .wait(7000)
        .evaluate(() => {
            let res = ''
            let finger = ''
            res = document.getElementsByClassName('lookup-results')[0].innerHTML
            finger = document.getElementsByClassName('lookup-results')[0].firstElementChild.innerText
            return [res, finger]
        })
        .then(res => {
            html = res[0]
            finger = res[1]
            result.sources = result.sources + 'www.wappalyzer.com' + ','
            result.html = result.html + html + '<br>'
            result.json.finger = finger
            db.get('sites')
                .push(result)
                .write()
            nightmare
                .goto('http://www.yunsee.cn/finger.html')
                .insert('#input1', options.uri)
                .click('#chaxun-btn')
                .catch((error) => {
                    console.error('Search failed:', error);
                });
        })
        .catch((error) => {
            console.error('Search failed:', error);
        });
}


module.exports.scan = scan;