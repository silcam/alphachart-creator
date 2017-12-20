import React from 'react';
import path from 'path';

function ImageSection(props) {
    const image = props.letterObject.image;
    const index = props.index;
    if (image) {
        return (
            <div className='image-wrapper'>
                <img src={'acp://' + path.join(props.workingDir, image)} style={{maxWidth: '150px', maxHeight: '150px'}} />
            </div>
        );
    }
    else {
        return (
            <div className='image-placeholder' onClick={()=>props.changeImage(props.index)}>
            </div>

        );
    }
}

function CellButtons(props) {
    return (
        <React.Fragment>
            <div className='btn-group'>
                <button className='btn btn-default'
                        title='Add Letter'
                        onClick={()=>props.addLetter(props.index)}>
                    <span className='icon icon-plus'></span>
                </button>
                <button className='btn btn-default'
                        title='Change Picture'
                        onClick={()=>props.changeImage(props.index)}>
                    <span className='icon icon-picture'></span>
                </button>
                <button className='btn btn-default'
                        title='Record Sound'
                        onClick={()=>props.openRecordingWindow(props.index)}>
                    <span className='icon icon-mic'></span>
                </button>
                {props.letterObject.audio && 
                    <button className='btn btn-default'
                            title='Play Sound'
                            onClick={()=>{
                                document.getElementById('audio' + props.index).play();
                            }}>
                        <span className='icon icon-play'></span>
                        <audio id={'audio' + props.index} src={'acp://' + path.join(props.workingDir, props.letterObject.audio)}></audio>
                    </button>
                }
                <button className='btn btn-default'
                        title='Remove Letter'
                        onClick={()=>props.removeLetter(props.index)} >
                    <span className='icon icon-cancel'></span>
                </button>
            </div>
            <div style={{clear: 'both'}}></div>
        </React.Fragment>
    );
}

function ChartInput(props) {
    return (
        <input type='text'
                value={props.letter} 
                size='1' 
                maxLength='1' 
                onChange={(e) => props.updateLetter(props.index, e.target.value)} />
    )
}

function ChartCell(props) {
    const upperCase = props.letterObject.upperCase;
    const lowerCase = props.letterObject.lowerCase;
    if(props.letterObject.upperCase !== undefined){
        return (
            <div className='chart-cell'>
                <CellButtons {...props} />
                <ImageSection {...props} />
                <ChartInput index={props.index} 
                            letter={upperCase}
                            updateLetter={props.updateUpperCase} />
                <ChartInput index={props.index}
                            letter={lowerCase}
                            updateLetter={props.updateLowerCase} />
            </div>
        );
    }
    else {
        return (
            <div className='chart-cell add-new-cell'>
                <button className='btn btn-default btn-x-large add-new-cell'
                        title='Add Letter'
                        onClick={()=>props.addLetter()}>
                    <span className='icon icon-large icon-plus'></span>        
                </button>
            </div>
        )
    }
}

function ChartRow(props) {
    const cells = props.row.map( 
        (letterObject, index) => <ChartCell 
                                    key={index}
                                    index={props.startIndex + index}
                                    letterObject={letterObject}
                                    workingDir={props.workingDir} 
                                    addLetter={props.addLetter}
                                    removeLetter={props.removeLetter}
                                    updateUpperCase={props.updateUpperCase}
                                    updateLowerCase={props.updateLowerCase}
                                    changeImage={props.changeImage}
                                    openRecordingWindow={props.openRecordingWindow} />
    );
    return (
        <div className="chart-row">
            {cells}
        </div>
    )
}

function chartArray(alphabet) {
    const cols = 4;
    let chart = []
    let i=0;
    let rows = Math.ceil((alphabet.length + 1) / cols);
    for(let r=0; r<rows; ++r){
        chart.push([]);
        for(let c=0; c<cols; ++c){
            let letterObject = alphabet[i] || {}
            chart[r].push(letterObject);
            ++i;
            if(i > alphabet.length){
                return chart;
            }
        }
    }
    return chart;
}

class AlphabetChart extends React.Component {
    constructor(props) {
        super(props);
        this.updateUpperCase = this.updateUpperCase.bind(this);
        this.updateLowerCase = this.updateLowerCase.bind(this);
    }

    updateUpperCase(index, newLetter) {
        this.props.updateAlphabet(index, {upperCase: newLetter});
    }

    updateLowerCase(index, newLetter) {
        this.props.updateAlphabet(index, {lowerCase: newLetter});
    }

    render() {
        const chart = chartArray(this.props.alphabet);
        const rows = chart.map(
            (row, index) => <ChartRow 
                                row={row} 
                                key={index}
                                startIndex={index * 4} // TODO Extract constant
                                workingDir={this.props.workingDir}
                                updateUpperCase={this.updateUpperCase}
                                updateLowerCase={this.updateLowerCase}
                                changeImage={this.props.changeImage}
                                addLetter={this.props.addLetter}
                                removeLetter={this.props.removeLetter}
                                openRecordingWindow={this.props.openRecordingWindow} />
        );
        return (
            <div id='alphabet-chart'>
                <div>
                    {rows}
                </div>
            </div>
        );
    }
}

export default AlphabetChart;