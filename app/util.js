const fs = require('fs');

function copyFileSync(src, dest) {
    fs.writeFileSync(dest, fs.readFileSync(src));
}

function safeCopyFileSync(src, dest) {
    let safeDest = dest;
    while(fs.existsSync(safeDest)) {
        var i = i || 1;
        ++i;
        var index = dest.lastIndexOf('.');
        if (index == -1) {
            safeDest = dest + i;
        }
        else {
            safeDest = dest.slice(0, index) + i + dest.slice(index);
        }
    }
    copyFileSync(src, safeDest);
    return safeDest;
}

exports.safeCopyFileSync = safeCopyFileSync;