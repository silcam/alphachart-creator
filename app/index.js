import React from 'react';
import ReactDOM from 'react-dom';
import AlphabetChart from './AlphabetChart';
import FileButtons from './FileButtons';

const {ipcRenderer} = require('electron');

const {dialog} = require('electron').remote
console.log(dialog)

let Alphabet = require('./Alphabet');


class  RootElement extends React.Component {
    constructor(props) {
        super(props);
        
        this.changeImage = this.changeImage.bind(this);
        this.removeImage = this.removeImage.bind(this);
        this.updateAlphabet = this.updateAlphabet.bind(this);
        this.saveChart = this.saveChart.bind(this);
        this.openChart = this.openChart.bind(this);
        this.setImage = this.setImage.bind(this);

        ipcRenderer.on('set-image', this.setImage)

        let alphabet = ipcRenderer.sendSync('get-alphabet-from-working') ||  Alphabet.defaultAlphabet();
        this.state = {alphabet: alphabet};
    }
    
    changeImage(index) {
        ipcRenderer.send('change-image', index, this.state.alphabet[index].image);
    }

    removeImage(index) {
        const oldImage = this.state.alphabet[index].image;
        this.updateAlphabet(index, {image: null});
        ipcRenderer.send('remove-image', oldImage);
    }

    setImage(event, filename, index) {
        this.updateAlphabet(index, {image: filename});
    }

    updateAlphabet(index, update) {
        this.setState(
            (prevState, props) => {
                const alphabet = Alphabet.updateAlphabet(prevState.alphabet, index, update);
                ipcRenderer.send('save-to-working', alphabet);
                return {alphabet: alphabet};
            }
        );
    }

    saveChart() {
        ipcRenderer.send('save-to-file', this.state.alphabet);
    }

    openChart() {
        this.setState( {alphabet: ipcRenderer.sendSync('open-from-file')} );
    }

    render () {
        return (
            <div>
                <h1>Howdy</h1>
                <p>Node version: {process.versions.node}</p>
                <AlphabetChart
                    alphabet={this.state.alphabet}
                    changeImage={this.changeImage}
                    removeImage={this.removeImage}
                    updateAlphabet={this.updateAlphabet}
                    saveChart={this.saveChart} />
                <FileButtons
                    saveChart={this.saveChart}
                    openChart={this.openChart} />
            </div>
        );
    }
}

ReactDOM.render(
    <RootElement />,
    document.getElementById('root')
);