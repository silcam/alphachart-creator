import React from 'react';
const {dialog} = require('electron').remote
console.log(dialog)

function ImageSection(props) {
    const image = props.letterObject.image;
    const index = props.index;
    if (image) {
        return (
            <div>
                <img src={image} style={{maxWidth: '150px', maxHeight: '150px'}} /><br />
                <button onClick={ () => props.changeImage(index) }>
                    Change Image
                </button>
                <button onClick={ () => props.removeImage(index) }>
                    Remove Image
                </button>
            </div>
        );
    }
    else {
        return (
            <div>
                <button onClick={ () => props.changeImage(index) }>
                    Add Image
                </button>
            </div>

        );
    }
}

function ChartCell(props) {
    const letter = props.letterObject.letter;
    const index = props.index;
    if(props.letterObject.letter !== undefined){
        return (
            <td>
                <ImageSection {...props} />
                <input type='text' value={letter} size='1' maxLength='1' onChange={(e) => props.updateLetter(index, e.target.value)} />
                <button onClick={() => props.removeLetter(index)}>Remove Letter</button>
            </td>
        );
    }
    else {
        return (
            <td>
                <button onClick={props.addLetter}>Add Letter</button>
            </td>
        )
    }
}

function ChartRow(props) {
    const cells = props.row.map( 
        (letterObject, index) => <ChartCell 
                                    key={index}
                                    index={props.startIndex + index}
                                    letterObject={letterObject} 
                                    addLetter={props.addLetter}
                                    removeLetter={props.removeLetter}
                                    updateLetter={props.updateLetter}
                                    changeImage={props.changeImage}
                                    removeImage={props.removeImage} />
    );
    return (
        <tr>
            {cells}
        </tr>
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
        this.updateLetter = this.updateLetter.bind(this);
    }

    updateLetter(index, newLetter) {
        this.props.updateAlphabet(index, {letter: newLetter});
    }

    render() {
        const chart = chartArray(this.props.alphabet);
        const rows = chart.map(
            (row, index) => <ChartRow 
                                row={row} 
                                key={index}
                                startIndex={index * 4} // TODO Extract constant
                                updateLetter={this.updateLetter}
                                changeImage={this.props.changeImage}
                                removeImage={this.props.removeImage}
                                addLetter={this.props.addLetter}
                                removeLetter={this.props.removeLetter} />
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