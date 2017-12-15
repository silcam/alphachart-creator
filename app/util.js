const fs = require('fs');
const Jimp = require('jimp');

function copyFileSync(src, dest) {
    fs.writeFileSync(dest, fs.readFileSync(src));
}

function safeCopyDest(dest) {
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
    return safeDest;
}

function safeCopyFileSync(src, dest) {
    const safeDest = safeCopyDest(dest);
    copyFileSync(src, safeDest);
    return safeDest;
}

function copyAndResizeImage(src, dest, maxWidth, maxHeight, callback) {
    const safeDest = safeCopyDest(dest);
    //sharp(src).resize(maxWidth, maxHeight).max().toFile(safeDest);
    Jimp.read(src, (err, lenna) => {
        lenna.scaleToFit(maxWidth, maxHeight).write(safeDest);
        callback(safeDest);
    });
}

function safeUnlink(file) {
    if(file) {
        fs.unlink(file, ()=>{});
    }
}

exports.safeCopyFileSync = safeCopyFileSync;
exports.copyAndResizeImage = copyAndResizeImage;
exports.safeUnlink = safeUnlink;