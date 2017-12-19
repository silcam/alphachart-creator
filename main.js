const path = require('path');
const url = require('url');
const fs = require('fs');

const {app, BrowserWindow, dialog, ipcMain, Menu} = require('electron');
const AdmZip = require('adm-zip');

const util = require('./build/util');
const AlphaChartFile = require('./build/AlphaChartFile');
// const configuration = require('./build/configuration');


let win;
const isDev = require('electron-is-dev');

function createWindow () {
    Menu.setApplicationMenu(buildAppMenu());

    win = new BrowserWindow({width: 800, height: 860});
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'build', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

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
});

ipcMain.on('get-title', () => {
    AlphaChartFile.setTitle(win);
});

ipcMain.on('get-alphabet', (event) => {
    event.sender.send('set-alphabet', AlphaChartFile.workingAlphabet());
});

ipcMain.on('open-from-file', (event) => {
    fileOpen();
})

ipcMain.on('change-image', (event, index, oldImage) => {
    AlphaChartFile.addImageFile(win, oldImage, (imageFile) => {
        event.sender.send('set-image', imageFile, index);
    })
});

ipcMain.on('remove-files', (event, ...files) => {
    for( filename of files ){
        if( filename ){
            AlphaChartFile.removeFile(filename);
        }
    }
});

ipcMain.on('save-to-working', (event, alphabet) => {
    AlphaChartFile.saveWorking(win, alphabet);
});

ipcMain.on('save-to-file', () => {
    fileSave();
});

function buildAppMenu() {
    let template = [
        {
            label: 'File',
            submenu: [
                {label: 'New', accelerator: 'CmdOrCtrl+N', click: fileNew},
                {label: 'Open', accelerator: 'CmdOrCtrl+O', click: fileOpen},
                {label: 'Save', accelerator: 'CmdOrCtrl+S', click: fileSave},
                {label: 'Save As...', accelerator: 'Shift+CmdOrCtrl+S', click: fileSaveAs},
                {role: 'quit'}
            ]
        }
    ];

    if( isDev ){
        template.push(
            {
                label: 'Dev',
                submenu: [
                    {role: 'reload'},
                    {role: 'forcereload'},
                    {role: 'toggledevtools'}
                ]
            }
        );
    }

    return Menu.buildFromTemplate(template);
}

function fileNew(menuItem, window, event) {
    if( AlphaChartFile.newChart(win) ){
        win.webContents.send('set-alphabet', null);
    }
}

function fileOpen() {
    const alphabet = AlphaChartFile.open(win);
    if( alphabet ) {
        win.webContents.send('set-alphabet', alphabet);
    }
}

function fileSave() {
    AlphaChartFile.save(win);
}

function fileSaveAs() {
    AlphaChartFile.save(win, {saveAs: true});
}