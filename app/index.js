import React from 'react';
import ReactDOM from 'react-dom';
import AlphabetChart from './AlphabetChart';
import ChartHeader from './ChartHeader';

const {ipcRenderer} = require('electron');

const {dialog} = require('electron').remote
console.log(dialog)

let Alphabet = require('./Alphabet');


class  RootElement extends React.Component {
    constructor(props) {
        super(props);
        
        this.addLetter = this.addLetter.bind(this);
        this.removeLetter = this.removeLetter.bind(this);
        this.changeImage = this.changeImage.bind(this);
        this.removeImage = this.removeImage.bind(this);
        this.updateAlphabet = this.updateAlphabet.bind(this);
        this.saveChart = this.saveChart.bind(this);
        this.openChart = this.openChart.bind(this);
        this.setImage = this.setImage.bind(this);
        this.setAlphabet = this.setAlphabet.bind(this);

        ipcRenderer.on('set-image', this.setImage);
        ipcRenderer.on('set-alphabet', this.setAlphabet);

        let alphabet = [];
        this.state = {alphabet: alphabet};
        ipcRenderer.send('get-alphabet');
    }

    addLetter() {
        this.setState(
            (prevState, props) => {
                let newLetter = {index: prevState.alphabet.length+1, letter: ''};
                let alphabet = prevState.alphabet.slice();
                alphabet.push(newLetter);
                ipcRenderer.send('save-to-working', alphabet);
                return {alphabet: alphabet};
            }
        );
    }

    removeLetter(index) {
        this.setState(
            (prevState) => {
                let alphabet = prevState.alphabet.slice();
                alphabet.splice(index, 1);
                console.log(JSON.stringify(alphabet));
                ipcRenderer.send('save-to-working', alphabet);
                return {alphabet: alphabet};
            }
        )
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

    setAlphabet(event, alphabet) {
        if (alphabet) {
            this.setState({alphabet: alphabet});
        }
        else {
            this.setState({alphabet: Alphabet.defaultAlphabet()});
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

    openChart() {
        ipcRenderer.send('open-from-file');
    }

    render () {
        return (
            <div>
                <ChartHeader filename='My Chart.apc' />
                <div className=''>
                    <div className=''>
                    <div className=''>
                        <h1>Howdy</h1>
                        <p>Node version: {process.versions.node}</p>
                        <AlphabetChart
                            alphabet={this.state.alphabet}
                            addLetter={this.addLetter}
                            removeLetter={this.removeLetter}
                            changeImage={this.changeImage}
                            removeImage={this.removeImage}
                            updateAlphabet={this.updateAlphabet}
                            saveChart={this.saveChart} />
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <RootElement />,
    document.getElementById('root')
);