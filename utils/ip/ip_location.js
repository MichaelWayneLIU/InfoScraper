const fs = require('fs');
const path = require('path');

const scan = function (options) {
    const Nightmare = require('nightmare');
    const superagent = require('superagent');
    let result = {
        sources: '',
        name: 'IP地理位置',
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

    superagent
        .get('http://api.db-ip.com/v2/free/' + options.uri)
        .end(function (req, res) {
            console.log(res.body)
            result.json = res.body
            result.sources = result.sources + 'db-ip.com' + ','
            db.get('sites')
                .push(result)
                .write()
        })

    nightmare
        .goto('https://www.ipplus360.com/search/ip/?ip=' + options.uri)
        .catch((error) => {
            console.error('IP location Search failed:', error);
        });
}


module.exports.scan = scan;