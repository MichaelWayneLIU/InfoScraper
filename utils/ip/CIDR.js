const fs = require('fs');
const path = require('path');

const scan = function (options) {
    const Nightmare = require('nightmare')
    let result = {
        sources: '',
        name: '扫描IP段',
        site: options.uri,
        html: '',
        json: {},
    }
    const nightmare = Nightmare({
        electronPath: electron_path,
        show: true,
        switches: {
            'ignore-certificate-errors': true
        }
        // openDevTools: {
        //   mode: 'detach'
        // },
    })

    nightmare
        .goto('https://phpinfo.me/bing.php')
        .insert('#domain', options.uri)
        .click('#getip')
        .wait(() =>{
            return document.getElementById('ip').innerText != ''
        })
        .click('#query')
        .catch((error) => {
            console.error('CIDR Search failed:', error);
        });
    
    const nightmare_1 = Nightmare({
        electronPath: electron_path,
        show: true,
        // openDevTools: {
        //   mode: 'detach'
        // },
    })
    nightmare_1
        .goto('https://www.chinabaiker.com/cduan.php')
        .insert('#domain', options.uri)
        .click('#getip')
        .wait(() => {
            return document.getElementById('ip').innerText != ''
        })
        .click('#query')
        .catch((error) => {
            console.error('CIDR Search failed:', error);
        });
}


module.exports.scan = scan;