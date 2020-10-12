const m_file = require("./file");
const m_config = require("./config");
const m_path = require("path");

var getDate = function () {
    var now = new Date();
    var tmp = {
        year: now.getFullYear(),
        mon: now.getMonth() + 1,
        day: now.getDate(),
    };
    for (let key in tmp) {
        if (tmp[key] < 10) {
            tmp[key] = "0" + tmp[key];
        }
    }
    return tmp.year + "-" + tmp.mon + "-" + tmp.day;
};

let instance = {};

instance.getNodes = async (datetime) => {
    try {
        if (datetime == null || datetime == "") {
            datetime = getDate();
        }
        let folderPath = m_path.join(".", m_config["save_path"]);
        let folderExist = await m_file.exists(folderPath);
        // console.log(folderPath);
        if (!folderExist) {
            await m_file.createDir(folderPath);
        }
        let filePath = m_path.join(".", m_config["save_path"], datetime + ".json");
        let fileExist = await m_file.exists(filePath);
        if (!fileExist) {
            return {
                date: datetime,
                list: []
            };
        }
        let fileContent = await m_file.readFile(filePath, "utf-8");
        // console.log(fileContent);
        return JSON.parse(fileContent);
    } catch (ex) {
        console.error(ex);
    }
};

instance.saveNodes = async (datetime, list) => {
    // console.log(datetime);
    try {
        let folderPath = m_path.join(".", m_config["save_path"]);
        let folderExist = await m_file.exists(folderPath);
        if (!folderExist) {
            await m_file.createDir(folderExist);
        }
        let filePath = m_path.join(".", m_config["save_path"], datetime + ".json");
        await m_file.writeFile(filePath, JSON.stringify({
            date: datetime,
            list: list
        }), "utf-8");
    } catch (ex) {
        console.error(ex);
    }
};

module.exports = instance;