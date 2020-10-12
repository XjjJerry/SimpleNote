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
    width: 900,
    height: 500,
    webPreferences: {
      nodeIntegration: true
    },
    resizable: false,
    transparent: true,
    frame: false,
    minimizable: false,
    maximizable: false
  })

  // 并且为你的应用加载index.html
  win.loadFile('./app/index.html');

  let winSize = screen.getPrimaryDisplay().workAreaSize

  win.setPosition(winSize.width - 895, 10);

  ipcMain.on("closeWindow", e => win.close());

  return win;
}



app.whenReady().then(() => {
  const win = createWindow();
  ipcMain.on("getNotes", async (e, args) => {
    // console.log(args);
    let readData = await m_data.getNodes(args.date);
    win.webContents.send('returnNotes', readData);
  });

  ipcMain.on("saveNotes", async (e, args) => {
    // console.log(args);
    let readData = await m_data.saveNodes(args.date, args.list);
  });
});