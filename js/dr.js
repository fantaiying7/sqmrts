import './lib/util.js';
import './lib/dayjs.min.js'
import './lib/uri.min.js';
import './lib/crypto-js.js'
import _ from './lib/underscore-esm-min.js';
import cheerio from './lib/cheerio.min.js';
import { muban } from './dr/模板.js';

__RULE__

const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 11; M2007J3SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045714 Mobile Safari/537.36';
const PC_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36';
const UA = 'Mozilla/5.0';
const UC_UA = 'Mozilla/5.0 (Linux; U; Android 9; zh-CN; MI 9 Build/PKQ1.181121.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.5.5.1035 Mobile Safari/537.36';
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';
const RULE_CK = 'cookie_' + rule.title; // 源cookie
const CATE_EXCLUDE = '首页|留言|APP|下载|资讯|新闻|动态';
const TAB_EXCLUDE = '猜你|喜欢|APP|下载|剧情';

const SELECT_REGEX = /:eq|:lt|:gt|#/g;
const SELECT_REGEX_A = /:eq|:lt|:gt/g;

const $ = cheerio.load('');

function init(ext) {
    // check default val
    if (!rule.title)
        rule.title = '';
    if (!rule.id)
        rule.id = rule.title;
    if (!rule.host)
        rule.host = '';
    rule.host = rule.host.rstrip('/');
    if (!rule.timeout)
        rule.timeout = 5000;
    if (!rule.url)
        rule.url = '';
    if (!rule.homeUrl)
        rule.homeUrl = '/';
    if (!rule.detailUrl)
        rule.detailUrl = '';
    if (!rule.searchUrl)
        rule.searchUrl = '';
    if (!rule.headers)
        rule.headers = {};
    // check replace UA
    let hasUA = false
    for (const k in rule.headers) {
        if (k.toLowerCase() == 'user-agent') {
            let v = rule.headers[k];
            if (v == 'MOBILE_UA')
                rule.headers[k] = MOBILE_UA;
            else if (v == 'PC_UA')
                rule.headers[k] = PC_UA;
            else if (v == 'UC_UA')
                rule.headers[k] = UC_UA;
            else if (v == 'IOS_UA')
                rule.headers[k] = IOS_UA;
            hasUA = true
        }
    }
    if (!hasUA) {
        rule.headers['User-Agent'] = UA;
    }
    rule.cate_exclude = (rule.cate_exclude || '') + CATE_EXCLUDE;
    rule.tab_exclude = (rule.tab_exclude || '') + TAB_EXCLUDE;
    rule.homeUrl = rule.host.isNotEmpty() && rule.homeUrl.isNotEmpty() ? urljoin(rule.host, rule.homeUrl) : (rule.homeUrl.isNotEmpty() ? rule.homeUrl : rule.host)
    if (rule.url.indexOf('[') > -1 && rule.url.indexOf(']') > -1) {
        u1 = rule.url.split('[')[0]
        u2 = rule.url.split('[')[1].split(']')[0]
        rule.url = rule.host.isNotEmpty() && rule.url.isNotEmpty() ? (urljoin(rule.host, u1) + '[' + urljoin(rule.host, u2) + ']') : rule.url
    } else {
        rule.url = rule.host.isNotEmpty() && rule.url.isNotEmpty() ? urljoin(rule.host, rule.url) : rule.url
    }
    rule.detailUrl = rule.host.isNotEmpty() && rule.detailUrl.isNotEmpty() ? urljoin(rule.host, rule.detailUrl) : (rule.detailUrl.isNotEmpty() ? rule.detailUrl : rule.host)
    rule.searchUrl = rule.host.isNotEmpty() && rule.searchUrl.isNotEmpty() ? urljoin(rule.host, rule.searchUrl) : (rule.searchUrl.isNotEmpty() ? rule.searchUrl : rule.host)
    if (!rule.class_name)
        rule.class_name = '';
    if (!rule.class_url)
        rule.class_url = '';
    if (!rule.class_parse)
        rule.class_parse = '';
    if (!rule.filter_name)
        rule.filter_name = '';
    if (!rule.filter_url)
        rule.filter_url = '';
    if (!rule.filter_parse)
        rule.filter_parse = '';
    if (!rule.double)
        rule.double = false;
    if (!rule.一级)
        rule.一级 = '';
    if (!rule.二级)
        rule.二级 = '';
    if (!rule.搜索)
        rule.搜索 = '';
    if (!rule.推荐)
        rule.推荐 = '';
    if (!rule.编码)
        rule.编码 = 'utf-8';
    if (!rule.limit)
        rule.limit = 6;
    if (!rule.filter)
        rule.filter = [];
}

function request(url, headers, timeout) {
    let res = req(url, {
        headers: headers,
        timeout: timeout
    });
    return res;
}

function pjfh(html, parse, add_url, base_url) {
    if (!parse || parse.trim().isEmpty())
        return '';
    if (typeof (html) === 'string')
        html = JSON.parse(html)
    parse = parse.trim()
    if (!parse.startsWith('$.'))
        parse = '$.' + parse;
    parse = parse.split('||')
    for (let ps of parse) {
        let ret = $.jp(ps, html);
        if (Array.isArray(ret))
            ret = ret[0] || ''
        else
            ret = ret || ''
        if (ret && typeof (ret) !== 'string')
            ret = ret.toString();
        if (add_url && ret && ret.isNotEmpty())
            ret = urljoin(base_url, ret);
        console.log(ret)
        if (ret && ret.isNotEmpty())
            return ret;
    }
    return '';
}

function pjfa(html, parse) {
    if (!parse || parse.trim().isEmpty())
        return '';
    if (typeof (html) === 'string')
        html = JSON.parse(html)
    parse = parse.trim()
    if (!parse.startsWith('$.'))
        parse = '$.' + parse
    let ret = $.jp(parse, html)
    if (Array.isArray(ret) && Array.isArray(ret[0]) && ret.length === 1)
        return ret[0] || []
    return ret || []
}

const DOM_CHECK_ATTR = ['url', 'src', 'href', 'data-original', 'data-src'];

function pdfh(html, parse, add_url, base_url) {
    if (!parse || parse.isEmpty())
        return ''
    let option = undefined;
    if (parse.indexOf('&&') > -1) {
        let sp = parse.split('&&');
        option = sp[sp.length - 1];
        sp.splice(sp.length - 1);
        if (sp.length > 1) {
            for (const i in sp) {
                if (!SELECT_REGEX.test(sp[i])) {
                    sp[i] = sp[i] + ':eq(0)';
                }
            }
        } else {
            if (!SELECT_REGEX.test(sp[0])) {
                sp[0] = sp[0] + ':eq(0)';
            }
        }
        parse = sp.join(' ');
    }
    let result = '';
    let ret = $(parse, html);
    if (option) {
        if (option === 'Text')
            result = $(ret).text();
        else if (option === 'Html')
            result = $(ret).html();
        else
            result = $(ret).attr(option);
        if (result && add_url && DOM_CHECK_ATTR.indexOf(option) > -1) {
            let idx = result.indexOf('http');
            if (idx > -1) {
                result = result.substring(idx)
            } else {
                result = urljoin(base_url, result);
            }
        }
    } else {
        result = $(ret).toString();
    }
    return result;
}

function pdfa(html, parse) {
    if (!parse || parse.isEmpty())
        return []
    if (parse.indexOf('&&') > -1) {
        let sp = parse.split('&&');
        for (const i in sp) {
            if (!SELECT_REGEX_A.test(sp[i]) && i < sp.length - 1) {
                sp[i] = sp[i] + ':eq(0)';
            }
        }
        parse = sp.join(' ');
    }
    let ret = $(parse, html);
    return ret;
}

function dealJson(html) {
    try {
        return html.match(/[\w|\W|\s|\S]*?(\{[\w|\W|\s|\S]*\})/).group[1]
    } catch (error) {
    }
    return html;
}

function home(filter) {
    let classes = [];
    let videos = [];
    if (rule.class_url.isNotEmpty() && rule.class_name.isNotEmpty()) {
        let class_names = rule.class_name.split('&');
        let class_urls = rule.class_url.split('&');
        let cnt = Math.min(class_names.length, class_names.length);
        for (let i = 0; i < cnt; i++) {
            classes.push({
                'type_name': class_names[i],
                'type_id': class_urls[i],
            });
        }
    }
    if (rule.homeUrl.isNotEmpty() && rule.homeUrl.startsWith('http')) {
        let res = request(rule.homeUrl, rule.headers, rule.timeout);
        if (res.content.isNotEmpty() && rule.class_parse.isNotEmpty()) {
            classes = []
            let p = rule.class_parse.split(';');
            let html = res.content;
            let items = pdfa(html, p[0]);
            for (const item of items) {
                let title = pdfh(item, p[1], false, '')
                if (rule.cate_exclude.indexOf(title) > -1)
                    continue;
                let url = pdfh(item, p[2], true, rule.url);
                let tag = url;
                if (p.length > 3 && p[3].trim().isNotEmpty()) {
                    let regex = new RegExp(String.raw`${p[3]}`);
                    let match = url.match(regex);
                    if (!match)
                        continue;
                    tag = match[1];
                }
                classes.push({
                    'type_name': title,
                    'type_id': tag,
                });
            }
        }
        if (res.content.isNotEmpty()) {
            videos = getHomeVod(res.content);
        }
    }
    console.log(classes);
    return JSON.stringify({
        'class': classes,
        'list': videos,
    });
}

function getHomeVod(html) {
    let p = rule.推荐.trim();
    if (p.isEmpty())
        return [];
    let videos = [];
    let is_js = p.startsWith('js:');
    if (is_js) {

    } else {
        p = p.split(';');
        if (!rule.double && p.length < 5) {
            return [];
        }
        if (rule.double && p.length < 6) {
            return [];
        }
        let is_json = p[0].startsWith('json:');
        let _ph = pdfh;
        let _pa = pdfa;
        if (is_json) {
            html = dealJson(html);
            _ph = pjfh;
            _pa = pjfa;
        }
        if (rule.double) {
            let items = _pa(html, is_json ? p[0].substring(5) : p[0]);
            for (const item of items) {
                let items2 = _pa(item, p[1]);
                for (const item2 of items2) {
                    let title = _ph(item2, p[2], false, '');
                    let img = '';
                    try {
                        img = _ph(item2, p[3], true, rule.homeUrl);
                    } catch (error) {

                    }
                    let desc = _ph(item2, p[4], false, '');
                    let links = [];
                    for (const p5 of p[5].split('+')) {
                        links.push(rule.detailUrl.isEmpty() ? _ph(item2, p5, true, rule.homeUrl) : _ph(item2, p5, false, ''))
                    }
                    let link = links.join('$');
                    videos.push({
                        "vod_id": link,
                        "vod_name": title,
                        "vod_pic": img,
                        "vod_remarks": desc
                    })
                }
            }
        } else {
            let items = _pa(html, is_json ? p[0].substring(5) : p[0]);
            for (const item of items) {
                let title = _ph(item, p[1], false, '');
                let img = '';
                try {
                    img = _ph(item, p[2], true, rule.homeUrl);
                } catch (error) {

                }
                let desc = _ph(item, p[3], false, '');
                let links = [];
                for (const p4 of p[4].split('+')) {
                    links.push(rule.detailUrl.isEmpty() ? _ph(item, p4, true, rule.homeUrl) : _ph(item, p4, false, ''))
                }
                let link = links.join('$');
                videos.push({
                    "vod_id": link,
                    "vod_name": title,
                    "vod_pic": img,
                    "vod_remarks": desc
                })
            }
        }
    }
    return videos;
}

function homeVod() {
    return '';
}

function category(tid, pg, filter, extend) {
}

function detail(id) {
}

function play(flag, id, flags) {
}

function search(wd, quick) {
}

__JS_SPIDER__ = {
    init: init,
    home: home,
    homeVod: homeVod,
    category: category,
    detail: detail,
    play: play,
    search: search
}