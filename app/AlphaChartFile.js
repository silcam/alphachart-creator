const {app, dialog} = require('electron');
const util = require('./util');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const configuration = require('./configuration');

const currentFile = 'currentFile';
const dirtyWorkingDir = 'dirtyWorkingDir';

function saveFileConfigs(filename) {
    configuration.saveSetting(dirtyWorkingDir, false);
    configuration.saveSetting(currentFile, filename);
}

function workingAlphabet() {
    let workingJson = getWorkingJson();
    if (fs.existsSync(workingJson)){
        return JSON.parse(fs.readFileSync(workingJson, {encoding: 'utf8'}));
    }
    return null;
}

function saveWorking(alphabet) {
    configuration.saveSetting(dirtyWorkingDir, true);
    let filename = getWorkingJson();
    fs.writeFile(filename, JSON.stringify(alphabet), (err) => {
        if(err) {
            dialog.showErrorBox('Error', err.message);
        }
    });
}

function removeImageFile(imageFile) {
    util.safeUnlink(imageFile);
}

function addImageFile(window, oldImage, callback) {
    const filepaths = dialog.showOpenDialog(window, {filters: [{name: 'Images', extensions: ['jpg', 'png', 'gif']}]});
    if (filepaths && filepaths[0]) {
        removeImageFile(oldImage);
        let dest = path.join(getWorkingDirectory(), path.basename(filepaths[0]));
        util.copyAndResizeImage(filepaths[0], dest, 150, 150, callback);
    }
}

function newChart() {
    configuration.saveSetting(currentFile, undefined);
    configuration.saveSetting(dirtyWorkingDir, false);
    util.clearDir(getWorkingDirectory());
}

function open(window) {
    const filepaths = dialog.showOpenDialog(window, {filters: [{name: 'Alphabet Chart', extensions: ['apc']}]});
    if (filepaths && filepaths[0]) {
        util.clearDir(getWorkingDirectory());
        let zip = new AdmZip(filepaths[0]);
        zip.extractAllTo(getWorkingDirectory());
        saveFileConfigs(filepaths[0]);
        return workingAlphabet();
    }
    return null;
}

function saveTo(filename) {
    let zip = new AdmZip();
    zip.addLocalFolder(getWorkingDirectory());
    try{
        zip.writeZip(filename);
        saveFileConfigs(filename);
    }
    catch(err) {
        dialog.showErrorBox('Unable to save chart', 'Try saving it in a different folder.\n\n' + err.message);
    }
}

function save(window, options={}) {
    const currentFileName = configuration.readSetting(currentFile);
    if( options.saveAs || !currentFileName) {
        dialog.showSaveDialog(window, {defaultPath: 'My Alphabet.apc'}, (filename) => {
            if (filename) {
                saveTo(filename);
            }
        });
    }
    else {
        saveTo(currentFileName);
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

exports.workingAlphabet = workingAlphabet;
exports.saveWorking = saveWorking;
exports.removeImageFile = removeImageFile;
exports.addImageFile = addImageFile;
exports.newChart = newChart;
exports.open = open;
exports.save = save;
