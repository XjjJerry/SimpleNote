const {
  app,
  BrowserWindow,
  ipcMain,
  screen
} = require('electron');

const m_data = require("./app/util/dataOpeartor");

function createWindow() {
  // 创建浏览器窗口
  const win = new BrowserWindow({
    width: 940,
    // height: 620,
    height: 750,
    webPreferences: {
      nodeIntegration: true
    },
    resizable: false,
    // clickThrough: 'pointer-events',
    transparent: true,
    frame: false,
    minimizable: false,
    maximizable: false
  })

  // 并且为你的应用加载index.html
  win.loadFile('./app/index.html');

  let winSize = screen.getPrimaryDisplay().workAreaSize

  win.setPosition(winSize.width - 930, 10);

  ipcMain.on("closeWindow", e => app.quit());

  return win;
}



app.whenReady().then(() => {
  const win = createWindow();

  // 获取笔记
  ipcMain.on("getNotes", async (e, args) => {
    try {
      let nodeList = await m_data.getNodes(args.date);
      e.sender.send('getNotes_res', { list: nodeList, status: 1 });
    } catch (ex) {
      console.error(ex);
      e.sender.send('getNotes_res', { msg: ex, status: -1 });
    }

  });

  // 新增
  ipcMain.on("addNote", async (e, args) => {
    try {
      let item = await m_data.addNote(args.note);
      e.sender.send('addNote_res', { id: item.id, status: 1 });
    } catch (ex) {
      console.error(ex);
      e.sender.send('addNote_res', { msg: ex, status: -1 });
    }
  });

  // 更新
  ipcMain.on("updateNote", async (e, args) => {
    try {
      let item = await m_data.updateNote(args.note);
      e.sender.send('updateNote_res', { id: item.id, status: 1 });
    } catch (ex) {
      console.error(ex);
      e.sender.send('updateNote_res', { msg: ex, status: -1 });
    }
  });

  // 删除
  ipcMain.on("deleteNote", async (e, args) => {
    try {
      await m_data.deleteNote(args.id);
      e.sender.send('deleteNote_res', { status: 1 });
    } catch (ex) {
      console.error(ex);
      e.sender.send('deleteNote_res', { msg: ex, status: -1 });
    }
  });

});