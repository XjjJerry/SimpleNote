const m_fs = require("fs");
const m_util = require('util');
const m_http = require("http");

let file = {};

file.readDir = m_util.promisify(m_fs.readdir);
file.readFile = m_util.promisify(m_fs.readFile);
file.writeFile = m_util.promisify(m_fs.writeFile);
file.rename = m_util.promisify(m_fs.rename);
file.stat = m_util.promisify(m_fs.stat);
file.exists = m_util.promisify(m_fs.exists);
file.deleteFile = m_util.promisify(m_fs.unlink);
file.createDir = m_util.promisify(m_fs.mkdir);

file.httpReadFile = (url) => {
    return new Promise((resolve, reject) => {
        m_http.get(url, (res) => {
            let chunks = [];
            let size = 0;
            res.on('data', function (chunk) {
                chunks.push(chunk);
                size += chunk.length; //累加缓冲数据的长度
            });
            res.on('end', function (err) {
                if (err) {
                    reject(err);
                } else {
                    let data = Buffer.concat(chunks, size);
                    resolve(data);
                }
            });
        });
    });

};

module.exports = file;