const fs = require('fs');
const path = require('path');

const scan = function (options) {
    const Nightmare = require('nightmare')
    let result = {
        sources: '',
        name: '子域信息',
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
        .goto('http://site.ip138.com/' + options.uri + '/domain.htm')
        .wait('[class="panel"]')
        .wait(2000)
        .evaluate(() => {
            let res = ''
            res = document.querySelector('[class="panel"]').innerHTML
            return res
        })
        .then(html => {
            result.sources = result.sources + 'site.ip138.com' + ','
            result.html = result.html + html + '<br>'
            nightmare
                .goto('https://securitytrails.com/list/apex_domain/' + options.uri)
                .catch((error) => {
                    console.error('subdomain Search failed:', error);
                });
        })
        .catch((error) => {
            console.error('subdomain Search failed:', error);
        });
}


module.exports.scan = scan;