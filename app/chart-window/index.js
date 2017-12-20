import React from 'react';
import ReactDOM from 'react-dom';
import {ipcRenderer} from 'electron';

import Alphabet from '../js/Alphabet';
import AlphabetChart from './AlphabetChart';
import ChartHeader from './ChartHeader';

ipcRenderer.send('get-title');

ipcRenderer.on('update-title', (event, newTitle) => {
    window.document.title = newTitle;
});


class  RootElement extends React.Component {
    constructor(props) {
        super(props);
        
        this.addLetter = this.addLetter.bind(this);
        this.removeLetter = this.removeLetter.bind(this);
        this.changeImage = this.changeImage.bind(this);
        this.updateAlphabet = this.updateAlphabet.bind(this);
        this.setImage = this.setImage.bind(this);
        this.setAudio = this.setAudio.bind(this);
        this.setAlphabet = this.setAlphabet.bind(this);
        this.openRecordingWindow = this.openRecordingWindow.bind(this);

        ipcRenderer.on('set-image', this.setImage);
        ipcRenderer.on('set-audio', this.setAudio);
        ipcRenderer.on('set-alphabet', this.setAlphabet);

        let workingDir = ipcRenderer.sendSync('get-working-dir');
        let alphabet = [];
        this.state = {alphabet: alphabet, workingDir: workingDir};
        ipcRenderer.send('get-alphabet');
    }

    addLetter(index) {
        console.log("Index: " + index);
        this.setState(
            (prevState, props) => {
                let newLetter = {upperCase: 'A', lowerCase: 'a'};
                let alphabet = prevState.alphabet.slice();
                if(index !== undefined){
                    alphabet.splice(index, 0, newLetter);
                }
                else {
                    alphabet.push(newLetter);
                }
                ipcRenderer.send('save-to-working', alphabet);
                return {alphabet: alphabet};
            }
        );
    }

    removeLetter(index) {
        this.setState(
            (prevState) => {
                this.removeWorkingFiles(prevState.alphabet[index]);
                let alphabet = prevState.alphabet.slice();
                alphabet.splice(index, 1);
                ipcRenderer.send('save-to-working', alphabet);
                return {alphabet: alphabet};
            }
        )
    }
    
    changeImage(index) {
        ipcRenderer.send('change-image', index, this.state.alphabet[index].image);
    }

    removeWorkingFiles(letterObject) {
        ipcRenderer.send('remove-files', letterObject.image, letterObject.audio);
    }

    setImage(event, filename, index) {
        this.updateAlphabet(index, {image: filename});
    }

    setAudio(event, filename, index) {
        this.updateAlphabet(index, {audio: filename});
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

    openRecordingWindow(index) {
        ipcRenderer.send('open-recording-window', 
                            index, 
                            this.state.alphabet[index]);
    }

    render () {
        return (
            <React.Fragment>
                <ChartHeader />
                <AlphabetChart
                    alphabet={this.state.alphabet}
                    workingDir={this.state.workingDir}
                    addLetter={this.addLetter}
                    removeLetter={this.removeLetter}
                    changeImage={this.changeImage}
                    updateAlphabet={this.updateAlphabet}
                    openRecordingWindow={this.openRecordingWindow} />
            </React.Fragment>
        );
    }
}

ReactDOM.render(
    <RootElement />,
    document.getElementById('root')
);