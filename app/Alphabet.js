
function defaultAlphabet() {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').map(
        (letter, index) => ({index: index, letter: letter})
    );
}

function updateAlphabet(prevAlphabet, index, update) {
    let alphabet = prevAlphabet.slice();
    Object.assign(alphabet[index], update);
    return alphabet;
}

exports.defaultAlphabet = defaultAlphabet;
exports.updateAlphabet = updateAlphabet;