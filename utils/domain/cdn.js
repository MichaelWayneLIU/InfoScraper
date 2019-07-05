const fs = require('fs');
const path = require('path');

const scan = function (options) {
    //Web指纹探测
    let scan_task_finger = require(path.join(__dirname, 'finger.js'));
    scan_task_finger.scan({
        uri: search_uri
    });
    //WHOIS查询
    let scan_task_whois = require(path.join(__dirname, 'whois.js'));
    scan_task_whois.scan({
        uri: search_uri
    });
    //子域名段查询
    let scan_task_subdomain = require(path.join(__dirname, 'subdomain.js'));
    scan_task_subdomain.scan({
        uri: search_uri
    });
    //敏感信息爬取
    let scan_task_sensitive = require(path.join(__dirname, 'static_resouce.js'));
    scan_task_sensitive.scan({
        uri: options.original_uri
    });

    // let electron_path = path.join(__dirname, '..\\node_modules\\electron\\dist\\electron.exe');
    const Nightmare = require('nightmare')
    let result = {
        sources: '',
        name: 'CDN判断',
        site: options.uri,
        html: '',
        json: {},
    }
    const nightmare = Nightmare({
        electronPath: electron_path,
        // show: true,
        // openDevTools: {
        //   mode: 'detach'
        // },
    })

    nightmare
        .goto('https://ping.aizhan.com/')
        .insert('#domain', options.uri)
        .click('.search-button')
        .wait('#ping_container')
        .wait(7000)
        .evaluate(() => {
            let res = ''
            ips = []
            res = document.getElementById('main_container').innerHTML
            var tableId = document.getElementById("table");
            for (var i = 1; i < tableId.rows.length; i++) {
                ips.push(tableId.rows[i].cells[1].innerText);
            }
            return [res, ips]
        })
        .then(res => {
            html = res[0]
            ips = res[1]
            result.sources = result.sources + 'ping.aizhan.com' + ','
            result.html = result.html + html + '<br>'
            nightmare
                .goto('http://tool.chinaz.com/speedtest/' + options.uri)
                .wait('.svggroup')
                .wait(20000)
                .evaluate(() => {
                    let html = ''
                    html = document.getElementById('speedlist').innerHTML
                    ips = [];
                    for (var i = 2; i < document.getElementsByClassName('col-3').length; i = i + 2) {
                        if (/^\d+/.test(document.getElementsByClassName('col-3')[i].lastElementChild.innerText)) {
                            ips.push(document.getElementsByClassName('col-3')[i].lastElementChild.innerText)
                        }
                    }
                    return [html,ips]
                })
                // 最后一次查询再end
                .end()
                .then(res => {
                    html = res[0]
                    ips_second = res[1]
                    console.log(ips)
                    result.sources = result.sources + 'tool.chinaz.com' + ','
                    result.html = result.html + html + '<br>'
                    ips = ips.concat(ips_second)
                    console.log(ips)
                    ips = Array.from(new Set(ips))
                    console.log(ips)
                    if(ips.length == 1){
                        result.json.potential_cdn = 0
                        result.json.ip = ips[0]
                    }else{
                        result.json.potential_cdn = 1
                    }
                    db.get('sites')
                        .push(result)
                        .write()
                    
                    if (result.json.potential_cdn == 1) {
                        //查一下DNS 历史，可能发现真实IP
                        let scan_task_dns = require(path.join(__dirname, 'dns_history.js'));
                        scan_task_dns.scan({
                            uri: search_uri
                        });
                    }else{
                        var readDir = fs.readdirSync("./utils/ip");
                        for (let index = 0; index < readDir.length; index++) {
                            console.log(path.join(__dirname, '../ip/' + readDir[index]))
                            let scan_task = require(path.join(__dirname, '../ip/' + readDir[index]));
                            scan_task.scan({
                                uri: result.json.ip
                            });
                        }
                    }
                })
                .catch((error) => {
                    console.error('CDN Search failed:', error);
                });
        })
        .catch((error) => {
            console.error('CDN Search failed:', error);
        });
}


module.exports.scan = scan;