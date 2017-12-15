const {app, BrowserWindow, dialog, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const util = require('./build/util');


let win 

function createWindow () {
    win = new BrowserWindow({width: 720, height: 1280})

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'build', 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Dev Tools
    const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
    installExtension(REACT_DEVELOPER_TOOLS).then((name) => {
        console.log(`Added Extension:  ${name}`);
    })
    .catch((err) => {
        console.log('An error occurred: ', err);
    });
    //win.webContents.openDevTools();

    // Events
    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', ()=>{
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})

ipcMain.on('get-alphabet-from-working', (event) => {
    let workingJson = getWorkingJson();
    if (fs.existsSync(workingJson)){
        event.returnValue = JSON.parse(fs.readFileSync(workingJson, {encoding: 'utf8'}));
    }
    else {
        event.returnValue = null;
    }
})

ipcMain.on('get-image', (event) => {
    const filepaths = dialog.showOpenDialog(win, {filters: [{name: 'Images', extensions: ['jpg', 'png', 'gif']}]});
    if (filepaths && filepaths[0]) {
        let dest = path.join(getWorkingDirectory(), path.basename(filepaths[0]));
        event.returnValue = util.safeCopyFileSync(filepaths[0], dest);
    }
    else {
        event.returnValue = null;
    }
})

ipcMain.on('save-to-working', (event, alphabet) => {
    let filename = getWorkingJson();
    fs.writeFile(filename, JSON.stringify(alphabet), (err) => {
        if(err) {
            dialog.showErrorBox('Error', err.message);
        }
    });
});

ipcMain.on('save-to-file', (event, alphabet) => {
    dialog.showSaveDialog(win, {defaultPath: 'My Alphabet.apc'}, (filename) => {
        if (filename) {
            let fs = require('fs');
            fs.writeFile(filename, JSON.stringify(alphabet), (err) => {
                if(err) {
                    dialog.showErrorBox('Error', err.message);
                }
            });
        }
    });
});

function getWorkingJson() {
    return path.join(getWorkingDirectory(), 'alphachart.json');
}

function getWorkingDirectory() {
    let workingPath = path.join(getAppDataDirectory(), 'working');
    if (!fs.existsSync(workingPath)) {
        fs.mkdirSync(workingPath);
    }
    return workingPath;
}

function getAppDataDirectory() {
    let dataPath = app.getPath('userData');
    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath);
    }
    return dataPath;
}