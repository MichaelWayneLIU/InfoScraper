const fs = require('fs');
const path = require('path');

const scan = function (options) {
    const Nightmare = require('nightmare')
    let result = {
        sources: '',
        name: 'WHOIS信息',
        site: options.uri,
        html: '',
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
        .goto('https://whois.aliyun.com/')
        .insert('[class="whois-search-input"]', options.uri)
        .click('[class="whois-search-btn"]')
        .wait('#info_whois_title')
        .wait(3000)
        .evaluate(() => {
            let res = ''
            res = document.querySelector('[class="whois-data"]').innerHTML
            return res
        })
        .then(html => {
            result.sources = result.sources + 'whois.aliyun.com' + ','
            result.html = result.html + html + '<br>'
            nightmare
                .goto('http://whois.chinaz.com/' + options.uri)
                .wait('#sh_info')
                .wait(3000)
                .evaluate(() => {
                    let res = ''
                    res = document.querySelector('#sh_info').outerHTML
                    return res
                })
                .end()
                .then(html => {
                    result.sources = result.sources + 'whois.chinaz.com' + ','
                    result.html = result.html + html + '<br>'
                    db.get('sites')
                        .push(result)
                        .write()
                })
                .catch((error) => {
                    console.error('WHOIS Search failed:', error);
                });
        })
        .catch((error) => {
            console.error('WHOIS Search failed:', error);
        });
}


module.exports.scan = scan;