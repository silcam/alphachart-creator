const path = require('path');
const util = require('./util');

var nconf = require('nconf').file({file: getConfigFile()});

function getConfigFile() {
    // console.log(JSON.stringify(util));
    return path.join(util.getAppDataDirectory(), 'config.json');
}

function saveSetting(settingKey, settingValue) {
    nconf.set(settingKey, settingValue);
    nconf.save();
}

function readSetting(settingKey) {
    nconf.load();
    return nconf.get(settingKey);
}

module.exports = {
    saveSetting: saveSetting,
    readSetting: readSetting
};