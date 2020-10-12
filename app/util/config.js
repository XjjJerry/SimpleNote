const m_path = require("path");
const m_fs = require("fs");

const config = JSON.parse(m_fs.readFileSync(m_path.join(".", "config.json")));
module.exports = config;