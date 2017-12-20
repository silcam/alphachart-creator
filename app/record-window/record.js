import React from 'react';
import ReactDOM from 'react-dom';
import {ipcRenderer} from 'electron';

const params = (new URL(location)).searchParams;
document.title = "Record: " + params.get('letter');

function Player(props) {
    if( props.src ){
        return (
            <audio src={props.src} controls></audio>
        );
    }
    return null;
}

class RecordButton extends React.Component {
    constructor(props) {
        super(props);
        this.record = this.record.bind(this);
        this.stop = this.stop.bind(this);
        this.recordData = this.recordData.bind(this);
        this.recordingStopped = this.recordingStopped.bind(this);

        let mediaRecorder = new MediaRecorder(props.stream);
        mediaRecorder.ondataavailable = this.recordData;
        mediaRecorder.onstop = this.recordingStopped;
        this.state = {mediaRecorder: mediaRecorder, chunks: []}
    }

    record() {
        this.state.mediaRecorder.start();
        this.forceUpdate();
    }

    stop() {
        this.state.mediaRecorder.stop();
        this.forceUpdate();
    }

    recordData(e) {
        this.setState(
            (prevState, props) => {
                return {chunks: prevState.chunks.concat([e.data])};
            }
        )
    }

    recordingStopped() {
        let blob = new Blob(this.state.chunks, {type: 'audio/ogg; codecs=opus'});
        this.props.updateAudio(blob);
        this.setState( {chunks: []} );
    }

    render() {
        let iconClass = (this.state.mediaRecorder.state == 'recording') ? 'icon-stop' : 'icon-record';
        let onClick = (this.state.mediaRecorder.state == 'recording') ? this.stop : this.record;
        iconClass = 'icon icon-large ' + iconClass;
        return (
            <button className='btn btn-default btn-x-large' onClick={onClick}>
                <span className={iconClass}></span>
            </button>
        );
    }
}

function DoneButton(props) {
    return (
        <button className='btn btn-default btn-large done-button' onClick={props.saveAndQuit}>
            Done
        </button>
    );
}

class RootElement extends React.Component {
    constructor(props) {
        super(props);
        this.updateAudio = this.updateAudio.bind(this);
        this.saveAndQuit = this.saveAndQuit.bind(this);

        this.state = {audio: undefined}
    }

    updateAudio(audioBlob) {
        this.setState( {audio: audioBlob} );
    }

    saveAndQuit() {
        let reader = new FileReader();
        reader.onload = () => {
            if( reader.readyState == 2 ){
                let buffer = new Buffer(reader.result);
                ipcRenderer.send('save-audio', 
                                    buffer, 
                                    params.get('index'), 
                                    params.get('letter'));
            }
        }
        reader.readAsArrayBuffer(this.state.audio);
        // window.close();
    }

    render() {
        let audioURL = (this.state.audio === undefined) ? undefined : window.URL.createObjectURL(this.state.audio);
        return (
            <React.Fragment>
                <div id='recording-section'>
                    <div>
                        <h1 id='recording-letter'>{params.get('letter')}</h1>
                    </div>
                    <div>
                        <RecordButton updateAudio={this.updateAudio} stream={this.props.stream} />
                    </div>
                    <div>
                        <Player src={audioURL} />
                    </div>
                </div>
                { this.state.audio && 
                    <DoneButton saveAndQuit={this.saveAndQuit} />
                }
            </React.Fragment>
        );
    }
}

navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then((stream) => {
        ReactDOM.render(
            <RootElement stream={stream} />,
            document.getElementById('root')
        );
    });