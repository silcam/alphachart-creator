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

function FileButtons(props) {
    return (
        <div>
            <SaveButton saveChart={props.saveChart} />
            <OpenButton openChart={props.openChart} />
        </div>
    )
}

export default FileButtons;