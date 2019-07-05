const fs = require('fs');
const path = require('path');
const cheerio = require("cheerio")
// let electron_path = path.join(__dirname, '..\\..\\node_modules\\electron\\dist\\electron.exe');
const superagent = require("superagent")

const scan = function (options) {
    const Nightmare = require('nightmare')
    let result = {
        sources: '',
        name: '敏感信息',
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

    if (!(options.uri.substr(0, 4) == "http")) {
        options.uri = "http://" + options.uri
    }

    nightmare
        .goto(options.uri)
        .wait(6000)
        .evaluate(() => {
            let res = ''
            res = document.documentElement.innerHTML
            return res
        })
        .end()
        .then(html => {
            // Array Remove - By John Resig (MIT Licensed)
            Array.prototype.remove = function (from, to) {
                var rest = this.slice((to || from) + 1 || this.length);
                this.length = from < 0 ? this.length + from : from;
                return this.push.apply(this, rest);
            };

            function getJs(scripts) {
                var res = [];
                scripts.each(function (i, script) {
                    var src = script.attribs.src;
                    if (!src)
                        return;
                    var index = src.indexOf('http');
                    if (index != 0) {
                        src = options.uri + src
                    }
                    res.push(src);
                });
                return Array.from(new Set(res));
            }

            function getCss(stylesheets) {
                var res = [];
                stylesheets.each(function (i, style) {
                    var src = style.attribs.href;
                    if (!src)
                        return;
                    var index = src.indexOf('http');
                    if (index != 0) {
                        src = options.uri + src
                    }
                    res.push(src);
                });
                return Array.from(new Set(res));
            }

            function get_resource(resource) {
                superagent
                    .get(resource)
                    .end(function (req, res) {
                        // if (res.ok) {
                        // console.log(res.text)
                        return res.text
                        // }
                    })
            }

            function findMatch(reg, raw) {
                var data = {}
                var arr = []
                while (true) {
                    data = reg.exec(raw);
                    if (data != null) {
                        arr.push(data[1]);
                    } else {
                        break;
                    }
                }
                return arr;
            }

            var $ = cheerio.load(html);
            var js, css, all_links = [];
            var linkReg = /(?:"|')((\w+@\w+(\.\w+)+)|(\d{18}|\d{15})|((\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14})|((?:[a-zA-Z]{1,10}:\/\/|\/\/)*[-*a-zA-Z0-9]{1,}\.[a-zA-Z0-9]{2,}[^"']{0,})|((?:\/|\.\.\/|\.\/)[^"'><,;| *()(%%$^\/\\\[\]][^"'><,;|()]{1,})|([a-zA-Z0-9_\-\/]{1,}\/[a-zA-Z0-9_\-\/]{1,}\.(?:[a-zA-Z]{1,4}|action)(?:[\?|\/][^"|']{0,}|))|([a-zA-Z0-9_\-]{1,}\.(?:php|asp|aspx|jsp|json|action|html|js|txt|xml)(?:\?[^"|']{0,}|)))(?:"|')/g
            //获取js列表
            var scripts = $("script");
            js = getJs(scripts);
            //获取css和部分js、html等
            var stylesheets = $("link");
            css = getCss(stylesheets);
            //合并所有链接
            var static_resource = js.concat(css)
            for (var index = 0; index < static_resource.length; index++) {
                var resource = get_resource(static_resource[index]);
                if (resource != '') {
                    links = findMatch(linkReg, resource);
                    // links = remove_pictures(links)
                    links = Array.from(new Set(links))
                    all_links = all_links.concat(links)
                    // console.log(all_links)
                    key = `${static_resource[index]}`;
                    result.json[key] = links;
                } else {
                    console.log("crawl static resource failed.............")
                }
            }
            //从动态加载后的结果（html）中提取
            links = findMatch(linkReg, html);
            links = Array.from(new Set(links))
            all_links = all_links.concat(links)
            all_links = Array.from(new Set(all_links))
            // console.log(all_links.length)
            var all_links_without_pics = []

            function remove_pictures(all_links) {
                for (var index = 0; index < all_links.length; index++) {
                    if (/\.(png|jpg|gif)$/g.test(all_links[index]) || /\.(png|jpg|gif)\?.*/g.test(all_links[index])) {
                        all_links.remove(index)
                        // all_links.splice(index, 1);
                        console.log(all_links[index]);
                    } else {
                        all_links_without_pics.push(all_links[index])
                    }
                }
                return all_links_without_pics
            }
            all_links = remove_pictures(all_links)
            all_links = Array.from(new Set(all_links))
            // console.log(all_links.length);
            // console.log(all_links);
            // console.log(all_links_without_pics.length);
            // console.log(all_links_without_pics);
            key = `${options.uri}`
            result.json[key] = links;
            result.json.links = all_links;

            // var meta = $("meta");
            // console.log(meta.html());
            db.get('sites')
                .push(result)
                .write()
        })
        .catch((error) => {
            console.error('sensitive info Search failed:', error);
        });
};
// scan({
//     uri: 'map.qq.com/'
// })

module.exports.scan = scan;