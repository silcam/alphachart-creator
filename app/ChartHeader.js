import React from 'react';

function SaveButton(props) {
    return (
        <button onClick={props.saveChart}>
            Save
        </button>
    )
}

function OpenButton(props) {
    return (
        <button onClick={props.openChart}>
            Open
        </button>
    )
}

function ChartHeader(props) {
    if( process.platform.includes('win') ){
        return null;
    }
    return (
        <header className='toolbar toolbar-header'>
            <div className='toolbar-actions'>
                <div className='btn-group'>
                    <button className='btn btn-large btn-default'>
                        <span className='icon icon-folder'></span>
                    </button>
                    <button className='btn btn-large btn-default'>
                        <span className='icon icon-floppy'></span>
                    </button>
                </div>
                <div className='btn-group'>
                    {props.filename}
                </div>
            </div>
        </header>
    )
}

export default ChartHeader;