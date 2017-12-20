const {app, dialog, BrowserWindow, ipcMain} = require('electron');
const util = require('./util');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const zipFolder = require('zip-folder');
const configuration = require('./configuration');

const currentFile = 'currentFile';
const dirtyWorkingDir = 'dirtyWorkingDir';

const acpFilter = [{name: 'Alphabet Chart', extensions: ['acp']}];

function saveFileConfigsAndUpdateTitle(window, dirty, filename) {
    if(dirty) {
        configuration.saveSetting(dirtyWorkingDir, true);
        filename = configuration.readSetting('currentFile');
    }
    else {
        configuration.saveSetting(dirtyWorkingDir, false);
        configuration.saveSetting(currentFile, filename);
    }
    updateTitle(window, dirty, filename);
}

function updateTitle(window, dirty, filename) {
    let title = (filename === undefined) ? 'Untitled Chart' : path.basename(filename);
    if(dirty){ title = '*' + title; }
    title += ' - AlphaChart Creator';
    window.webContents.send('update-title', title);
}

function setTitle(window) {
    const filename = configuration.readSetting(currentFile);
    const dirty = configuration.readSetting(dirtyWorkingDir);
    updateTitle(window, dirty, filename);
}

function workingAlphabet() {
    let workingJson = getWorkingJson();
    if (fs.existsSync(workingJson)){
        return JSON.parse(fs.readFileSync(workingJson, {encoding: 'utf8'}));
    }
    return null;
}

function saveWorking(window, alphabet) {
    saveFileConfigsAndUpdateTitle(window, true);
    let filename = getWorkingJson();
    fs.writeFile(filename, JSON.stringify(alphabet), (err) => {
        if(err) {
            dialog.showErrorBox('Error', err.message);
        }
    });
}

function removeFile(filename) {
    util.safeUnlink(filename);
}

function addImageFile(window, oldImage, callback) {
    const filepaths = dialog.showOpenDialog(window, {filters: [{name: 'Images', extensions: ['jpg', 'png', 'gif']}]});
    if (filepaths && filepaths[0]) {
        removeFile(oldImage);
        let dest = path.join(getWorkingDirectory(), path.basename(filepaths[0]));
        util.copyAndResizeImage(filepaths[0], dest, 150, 150, callback);
    }
}

function saveAudio(buffer, index, letter, oldAudioFile) {
    if(oldAudioFile){ util.safeUnlink(oldAudioFile); }

    if( index < 10 ){ index = '0' + index; }
    let basename = index + '-' + letter + '-' + Date.now() + '.wav';
    let filename = path.join(getWorkingDirectory(), basename);
    fs.writeFile(filename, buffer, ()=>{});
    return filename;
}

function warnAboutUnsavedChanges(window) {
    if (configuration.readSetting(dirtyWorkingDir) ){
        const buttons = ['Yes', 'No'];
        let response = dialog.showMessageBox(window, 
                                            {type: 'warning', 
                                             buttons: buttons, 
                                             title: 'Unsaved Changes',
                                             message: 'There are unsaved changes that will be lost. Do you want to continue?'});
        if (response == 1) { // No
            return true; // Cancel
        }
    }
    return false; // Continue
}

function newChart(window) {
    let cancel = warnAboutUnsavedChanges(window);
    if(cancel) { return false; }
    saveFileConfigsAndUpdateTitle(window, false, undefined);
    util.clearDir(getWorkingDirectory());
    return true;
}

function open(window) {
    let cancel = warnAboutUnsavedChanges(window);
    if(cancel) { return false; }
    const filepaths = dialog.showOpenDialog(window, {filters: acpFilter});
    if (filepaths && filepaths[0]) {
        util.clearDir(getWorkingDirectory());
        let zip = new AdmZip(filepaths[0]);
        zip.extractAllTo(getWorkingDirectory());
        saveFileConfigsAndUpdateTitle(window, false, filepaths[0]);
        return workingAlphabet();
    }
    return false;
}

function saveTo(window, filename) {
    zipFolder(getWorkingDirectory(), filename, (err) => {
        if(err){
            dialog.showErrorBox('Unable to save chart', 'Try saving it in a different folder.\n\n' + err.message);
        }
        else {
            saveFileConfigsAndUpdateTitle(window, false, filename);
        }
    });
}

function save(window, options={}) {
    const currentFileName = configuration.readSetting(currentFile);
    if( options.saveAs || !currentFileName) {
        dialog.showSaveDialog(window, {defaultPath: 'My Alphabet.acp', filters: acpFilter}, (filename) => {
            if (filename) {
                saveTo(window, filename);
            }
        });
    }
    else {
        saveTo(window, currentFileName);
    }
}

function getWorkingJson() {
    return path.join(getWorkingDirectory(), 'alphachart.json');
}

function getWorkingDirectory() {
    let workingPath = path.join(util.getAppDataDirectory(), 'working');
    if (!fs.existsSync(workingPath)) {
        fs.mkdirSync(workingPath);
    }
    return workingPath;
}

exports.setTitle = setTitle;
exports.workingAlphabet = workingAlphabet;
exports.saveWorking = saveWorking;
exports.removeFile = removeFile;
exports.addImageFile = addImageFile;
exports.saveAudio = saveAudio;
exports.newChart = newChart;
exports.open = open;
exports.save = save;
exports.getWorkingDirectory = getWorkingDirectory;
