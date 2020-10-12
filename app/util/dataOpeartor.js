const m_file = require("./file");
const m_config = require("./config");
const m_path = require("path");
const m_uuid = require("node-uuid");

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

var getTime = function () {
    var now = new Date();
    var tmp = {
        mon: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        min: now.getMinutes(),
        sec: now.getSeconds(),
    };
    var year = now.getFullYear();
    for (let key in tmp) {
        if (tmp[key] < 10) {
            tmp[key] = "0" + tmp[key];
        }
    }
    return year + "-" + tmp.mon + "-" + tmp.day + " " + tmp.hour + ":" + tmp.min + ":" + tmp.sec;
};

let getAllNotes = async () => {
    let folderPath = m_path.join(".", m_config["save_path"]);
    let folderExist = await m_file.exists(folderPath);
    if (!folderExist) {
        await m_file.createDir(folderPath);
    }
    let filePath = m_path.join(".", m_config["save_path"], "data.json");
    let fileExist = await m_file.exists(filePath);
    if (!fileExist) {
        return [];
    }
    let fileContent = await m_file.readFile(filePath, "utf-8");
    let noteList = JSON.parse(fileContent).list;
    return noteList;
};

let saveAllNotes = async (allList) => {
    let folderPath = m_path.join(".", m_config["save_path"]);
    let folderExist = await m_file.exists(folderPath);
    if (!folderExist) {
        await m_file.createDir(folderPath);
    }
    let filePath = m_path.join(".", m_config["save_path"], "data.json");
    await m_file.writeFile(filePath, JSON.stringify({
        editTime: getTime(),
        list: allList
    }), "utf-8");
    return;
};

let instance = {};

instance.getNodes = async (selectedDate) => {
    try {
        let res = [];
        let allList = await getAllNotes();
        if (selectedDate == null || selectedDate == "") {
            return allList;
        }

        for (let item of allList) {
            let dateArr = item.enableRange.split(" ~ ");
            if (dateArr.length != 2) {
                throw "日期格式错误，id：" + item.id + ",值：" + item.enableRange;
            }
            let beginDate = dateArr[0];
            let endDate = dateArr[1];
            if (beginDate <= selectedDate && endDate >= selectedDate) {
                res.push(item);
            }
        }
        return res;
    } catch (ex) {
        console.error(ex);
    }
};

// instance.saveNodes = async (datetime, list) => {
//     // console.log(datetime);
//     try {
//         let folderPath = m_path.join(".", m_config["save_path"]);
//         let folderExist = await m_file.exists(folderPath);
//         if (!folderExist) {
//             await m_file.createDir(folderExist);
//         }
//         let filePath = m_path.join(".", m_config["save_path"], datetime + ".json");
//         await m_file.writeFile(filePath, JSON.stringify({
//             date: datetime,
//             list: list
//         }), "utf-8");
//     } catch (ex) {
//         console.error(ex);
//     }
// };

instance.addNote = async (note) => {
    try {
        note.id = m_uuid.v4();
        let allList = await getAllNotes();
        allList.push(note);
        await saveAllNotes(allList);
        return note;
    } catch (ex) {
        console.error(ex);
    }
};

instance.updateNote = async (note) => {
    try {
        let allList = await getAllNotes();
        let findIndex = -1;
        for (let i = 0; i < allList.length; i++) {
            if (allList[i].id == note.id) {
                findIndex = i;
                break;
            }
        }
        if (findIndex == -1) {
            throw "找不到指定的笔记，id：" + note.id;
        }
        allList[findIndex] = note;
        await saveAllNotes(allList);
        return note;
    } catch (ex) {
        console.error(ex);
    }
};

instance.deleteNote = async (id) => {
    try {
        let allList = await getAllNotes();
        let findIndex = -1;
        for (let i = 0; i < allList.length; i++) {
            if (allList[i].id == note.id) {
                findIndex = i;
                break;
            }
        }
        if (findIndex == -1) {
            throw "找不到指定的笔记，id：" + note.id;
        }
        allList.splice(findIndex, 1);
        await saveAllNotes(allList);
        return;
    } catch (ex) {
        console.error(ex);
    }
};

module.exports = instance;