import React from 'react';
import ReactDOM from 'react-dom';
import AlphabetChart from './AlphabetChart';

const {dialog} = require('electron').remote
console.log(dialog)

let Alphabet = require('./Alphabet');

let alphabet = Alphabet.defaultAlphabet;

class  RootElement extends React.Component {
    constructor(props) {
        super(props);
        
        this.updateAlphabet = this.updateAlphabet.bind(this);
        this.saveChart = this.saveChart.bind(this);

        let alphabet = Alphabet.defaultAlphabet();
        this.state = {alphabet: alphabet};
    }

    updateAlphabet(index, update) {
        this.setState(
            (prevState, props) => ({
                alphabet: Alphabet.updateAlphabet(prevState.alphabet, index, update)
            })
        );
    }

    saveChart() {
        saveAlphaChart(this.state.alphabet);
    }

    render () {
        return (
            <div>
                <h1>Howdy</h1>
                <AlphabetChart
                    alphabet={this.state.alphabet}
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

// Functions


function saveAlphaChart(alphabet) {
    dialog.showSaveDialog({defaultPath: 'My Alphabet.apc'}, (filename) => {
        if (filename) {
            let fs = require('fs');
            fs.writeFile(filename, JSON.stringify(alphabet), (err) => {
                if(err) {
                    dialog.showErrorBox('Error', err.message)
                }
            });
        }
    });
}