const path = require('path');
const url = require('url');
const fs = require('fs');

const {app, BrowserWindow, dialog, ipcMain, Menu} = require('electron');
const AdmZip = require('adm-zip');

const util = require('./build/util');
const AlphaChartFile = require('./build/AlphaChartFile');
// const configuration = require('./build/configuration');


let win;
let recordingWin;
const isDev = require('electron-is-dev');

function createWindow () {
    Menu.setApplicationMenu(buildAppMenu());

    let iconPath = path.join(__dirname, 'alphachart.png');
    win = new BrowserWindow({width: 800, height: 860, icon: iconPath});
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

    // Events
    win.on('closed', () => {
        win = null;
        if (process.platform !== 'darwin') {
            app.quit()
        }
    });
}

app.on('ready', createWindow);

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

ipcMain.on('open-recording-window', (event, index, letterObject) => {
    if( !recordingWin ) {
        recordingWin = new BrowserWindow({width: 550, height: 230, parent: win, modal: true, autoHideMenuBar: true});
        recordingWin.oldAudioFile = letterObject.audio;
        let queryString = '?index=' + index + '&letter=' + letterObject.upperCase;
        let myurl = url.format({
            pathname: path.join(__dirname, 'build', 'record.html'),
            protocol: 'file:',
            slashes: true
        });
        myurl += queryString;
        recordingWin.loadURL(myurl);

        recordingWin.on('closed', () => {
            recordingWin = null;
        })
    }
});

ipcMain.on('save-audio', (event, buffer, index, letter) => {
    let filename = AlphaChartFile.saveAudio(buffer, index, letter, recordingWin.oldAudioFile);
    recordingWin.close();
    win.webContents.send('set-audio', filename, index);
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