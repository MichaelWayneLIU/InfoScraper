const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const ipcMain = require('electron').ipcMain;

const path = require('path')
const url = require('url')
const Menu = electron.Menu
const Tray = electron.Tray; //用于任务栏
var client = require('electron-connect').client;
const fs = require("fs")
const tldjs = require('tldjs');

const low = require('lowdb') //用于本地数据存储
const FileSync = require('lowdb/adapters/FileSync')
let dbpath = ""
electron_path = path.join(__dirname, 'node_modules\\electron\\dist\\electron.exe');
// var electron_path = path.join(__dirname, '..\\node_modules\\electron\\dist\\electron.exe');
var search_res = {}
var electronconnect = require('electron-connect').server.create();
let windowList = {
  search: null
};

//导航模板
let template = [{
    label: 'Account',
    click: function (item, focusedWindow) {
      if (!windowList['search']) { //如果页面已经打开，则提示不打开
        windowList.windowSearch = addWindow("search", 1000, 1000, true, true)
      } else {
        showTipBox(focusedWindow)
      }
    }
  },
  {
    label: '帮助',
    role: 'help',
    submenu: [{
      label: '博客地址',
      click: function () {
        electron.shell.openExternal('https://michaelwayneliu.github.io/')
      }
    }]
  },
  {
    label: 'Exit',
    click: function (item, focusedWindow) {
      app.quit()
    }
  }
  
]


//添加窗口
function addWindow(page, width, height, hidemenu, resizable) {
  let win = new BrowserWindow({
    width: width,
    height: height,
    autoHideMenuBar: hidemenu,
    resizable: resizable
  })
  const modalPath = path.join(__dirname, page + '.html')
  win.on('closed', function () {
    win = null;
  })
  win.loadURL(modalPath);
  // win.webContents.openDevTools();
  return win;
}

//窗口打开提示
function showTipBox(focusedWindow) {
  const options = {
    type: 'info',
    title: 'Tooltip',
    buttons: ['OK'],
    message: 'The window has been opened.'
  }
  electron.dialog.showMessageBox(focusedWindow, options, function () {})
}

//新建窗口
function createWindow() {
  windowList.windowSearch = addWindow("search", 1000, 1000, true, true)
  //设置菜单  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  //设置任务栏
  var appIcon = null;
  var iconPath = path.join(__dirname, 'assets/img/search.png');
  appIcon = new Tray(iconPath);
  var contextMenu = Menu.buildFromTemplate(template);
  appIcon.setToolTip('Info Scraper');
  appIcon.setContextMenu(contextMenu);
}

app.on('ready', createWindow);

dbpath = path.join(__dirname, 'webinfo\.json');
adapter = new FileSync(dbpath);
db = low(adapter);
db.defaults({
  sites: []
}).write();


//收到查询请求
ipcMain.on("do_search", function (event, arg) {
  var info = JSON.parse(arg);
  search_uri = info.user_search;
  select = info.select;
  //处理下输入
  search_uri = tldjs.parse(search_uri.trim()).hostname;
  if (/^\d+/.test(search_uri) || select == '2') {
    console.log('this is a ip address!');
    // 获取utils/ip目录下所有的文件名
    var readDir = fs.readdirSync("./utils/ip");
    for (let index = 0; index < readDir.length; index++) {
      console.log(path.join(__dirname, 'utils/ip/' + readDir[index]));
      let scan_task = require(path.join(__dirname, 'utils/ip/' + readDir[index]));
      scan_task.scan({
        uri: search_uri
      });
    }
  }else{
    console.log('this is a domain!');
    let scan_task = require(path.join(__dirname, 'utils/domain/' + 'cdn.js'));
    scan_task.scan({
      uri: search_uri,
      original_uri: info.user_search
    });
  }
})

//获取首页需要数据
ipcMain.on("getindexData-message", function (event, arg) {
  fs.readFile(path.join(__dirname, 'webinfo.json'), function (err, data) {
  // console.log(JSON.parse(data).sites)
    if (err) {
      console.log(err);
      event.sender.send('getindexData-reply', JSON.stringify({
        webinfo: []
      }));
    } else {
      event.sender.send('getindexData-reply', JSON.stringify({
        webinfo: JSON.parse(data).sites
      }));

    }
  })
})