const fs = require('fs');
const path = require('path');

const scan = function (options) {
    // console.log(options)
    // let electron_path = path.join(__dirname, '..\\node_modules\\electron\\dist\\electron.exe');
    const Nightmare = require('nightmare')
    let result = {
        sources: '',
        name: 'IP反查',
        site: options.uri,
        html: '',
        json: {},
    }
    const nightmare = Nightmare({
        electronPath: electron_path,
        show: true,
        openDevTools: {
          mode: 'detach'
        },
    })

    nightmare
        .goto('https://tools.ipip.net/ipdomain.php')
        .insert('#ip', options.uri)
        .click('#btn')
        .wait('.col-sm-10')
        .evaluate(() => {
            let res = ''
            res = document.getElementsByClassName('col-sm-10 col-sm-offset-1')[0].innerHTML
            return res
        })
        // .end()
        .then(html => {
            result.sources = result.sources + 'tools.ipip.net' + ','
            result.html = result.html + html + '<br>'
            nightmare
                .goto('https://dns.aizhan.com')
                .insert('#domain')
                .insert('#domain', options.uri)
                .click('.search-button')
                // .wait(() => {
                //     return document.documentElement.innerHTML.indexOf('暂无域名解析到该IP') < 0
                // })
                .wait(3000)
                .evaluate(() => {
                    let res = ''
                    res = document.getElementsByClassName('dns-content')[0].innerHTML
                    return res
                })
                // 最后一次查询再end
                .end()
                .then(html => {
                    console.log(html)
                    result.sources = result.sources + 'dns.aizhan.com' + ','
                    result.html = result.html + html + '<br>'
                    db.get('sites')
                        .push(result)
                        .write()
                })
                .catch((error) => {
                    console.error('Search failed:', error);
                });
        })
        .catch((error) => {
            console.error('Search failed:', error);
        });
}


module.exports.scan = scan;