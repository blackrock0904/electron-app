const {
  app,
  BrowserWindow,
  ipcMain,
  Menu
} = require('electron')

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

function getLinksFromFile(filePath) {
  let data = fs.readFileSync(filePath, 'utf-8');
  return data.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|gif|png)/gim);
}

function saveImages(url, dest) {
  return new Promise((resolve, reject) => {
    let request = http;
    if (url.substr(0, 5) === 'https') request = https;

    request.get(url, (data) => {
      data.pipe(fs.createWriteStream(dest))
      resolve()
    });
  });
}

function createWindow() {

  const win = new BrowserWindow({
    width: 485,
    height: 600,
    icon: __dirname + "/img/icon.png",
    autoHideMenuBar: true,
    title: 'Loader photos v1.0.0',
    backgroundColor: '#23313c',
    webPreferences: {
      nodeIntegration: true,
      textAreasAreResizable: false,
      allowRunningInsecureContent: true,
      webgl: false,
    }
  })

  // Убираем меню вверху в windows и linux
  win.setMenu(null)
  win.setMenuBarVisibility(false)
  win.loadFile('index.html')
  // win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on('set-folders', async (event, arg) => {
  let files = fs.readdirSync(arg.from, 'utf-8');
  files = files.filter(file => file.substr(-4, 4) === '.csv');
  const links = files.map(filename => {
    return getLinksFromFile(path.join(arg.from, filename))
      .map(link => {
        return {
          url: link,
          dir: path.join(arg.to, filename.replace('.', '-'))
        }
      })
  }).flat();

  let prevDir
  for (let i = 0; i < links.length; i++) {
    if (prevDir != links[i].dir && !fs.existsSync(links[i].dir)) {
      fs.mkdirSync(links[i].dir);
    }
    prevDir = links[i].dir

    const dest = path.join(links[i].dir, `${i + 1}.jpg`);
    await saveImages(links[i].url, dest);
    event.reply('progress', {
      total: links.length,
      fact: i
    });
  }
})

// set menu
Menu.setApplicationMenu(Menu.buildFromTemplate([{
    label: 'File',
    submenu: [{
      role: 'quit'
    }]
  },
  {
    label: 'View',
    submenu: [{
        role: 'togglefullscreen'
      },
      {
        type: 'separator'
      },
      {
        role: 'forcereload'
      },
      {
        role: 'toggledevtools'
      }
    ]
  }
]))
