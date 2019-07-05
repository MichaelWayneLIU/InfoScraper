const fs = require('fs');
const path = require('path');

const scan = function (options) {
    const Nightmare = require('nightmare')
    let result = {
        sources: '',
        name: 'DNS解析记录',
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
        .goto('https://viewdns.info/iphistory/?domain=' + options.uri)
        .wait('[border="1"]')
        .wait(2000)
        .evaluate(() => {
            let res = ''
            res = document.querySelector('[border="1"]').outerHTML
            return res
        })
        .then(html => {
            result.sources = result.sources + 'viewdns.info' + ','
            result.html = result.html + html + '<br>'
            nightmare
                .goto('http://site.ip138.com/' + options.uri)
                .wait('[class="panel"]')
                .wait(2000)
                .evaluate(() => {
                    let res = ''
                    res = document.querySelector('[class="panel"]').outerHTML
                    return res
                })
                // .end()
                .then(html => {
                    result.sources = result.sources + 'site.ip138.com' + ','
                    result.html = result.html + html + '<br>'                    
                    nightmare
                        .goto('https://securitytrails.com/domain/' + options.uri + '/history/a')
                        .wait('[class="table table-hover"]')
                            .wait(2000)
                            .evaluate(() => {
                                let res = ''
                                res = document.querySelector('[class="table table-hover"]').outerHTML
                                return res
                            })
                            .then(html => {
                                result.sources = result.sources + 'securitytrails.com' + ','
                                result.html = result.html + html + '<br>'
                                db.get('sites')
                                    .push(result)
                                    .write()
                            })
                })
                .catch((error) => {
                    console.error('DNS history Search failed:', error);
                });
        })
        .catch((error) => {
            console.error('DNS history Search failed:', error);
        });
}


module.exports.scan = scan;