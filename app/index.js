import React from 'react';
import ReactDOM from 'react-dom';
import AlphabetChart from './AlphabetChart';

const {ipcRenderer} = require('electron');

const {dialog} = require('electron').remote
console.log(dialog)

let Alphabet = require('./Alphabet');


class  RootElement extends React.Component {
    constructor(props) {
        super(props);
        
        this.changeImage = this.changeImage.bind(this);
        this.updateAlphabet = this.updateAlphabet.bind(this);
        this.saveChart = this.saveChart.bind(this);

        let alphabet = ipcRenderer.sendSync('get-alphabet-from-working') ||  Alphabet.defaultAlphabet();
        this.state = {alphabet: alphabet};
    }
    
    changeImage(index) {
        let filename = ipcRenderer.sendSync('get-image');
        if (filename) {
            this.updateAlphabet(index, {image: filename});
        }
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

    render () {
        return (
            <div>
                <h1>Howdy</h1>
                <p>Node version: {process.versions.node}</p>
                <AlphabetChart
                    alphabet={this.state.alphabet}
                    changeImage={this.changeImage}
                    updateAlphabet={this.updateAlphabet}
                    saveChart={this.saveChart} />
            </div>
        );
    }
}

ReactDOM.render(
    <RootElement />,
    document.getElementById('root')
);