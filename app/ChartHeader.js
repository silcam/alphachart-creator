import React from 'react';
import {ipcRenderer} from 'electron';

class ChartHeader extends React.Component {
    constructor(props) {
        super(props);
        this.saveChart = this.saveChart.bind(this);
        this.openChart = this.openChart.bind(this);
    }

    saveChart() {
        ipcRenderer.send('save-to-file');
    }

    openChart() {
        ipcRenderer.send('open-from-file');
    }

    render() {
        if( process.platform.includes('win') ){
            return null;
        }
        return (
            <header className='toolbar toolbar-header'>
                <div className='toolbar-actions'>
                    <div className='btn-group'>
                        <button className='btn btn-large btn-default' 
                                onClick={this.openChart}>
                            <span className='icon icon-folder'></span>
                        </button>
                        <button className='btn btn-large btn-default'
                                onClick={this.saveChart}>
                            <span className='icon icon-floppy'></span>
                        </button>
                    </div>
                </div>
            </header>
        );
    }
}

export default ChartHeader;