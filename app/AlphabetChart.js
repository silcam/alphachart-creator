import React from 'react';
const {dialog} = require('electron').remote
console.log(dialog)

function HeaderInput(props) {
    return (
        <input type='text' value={props.value} onChange={props.updateValue} />
    )
}

function ChartHeader(props) {
    return (
        <p>
            <label>Chart:</label>
            <label>Rows: <HeaderInput value={props.rows} updateValue={props.updateRows} /></label>
            <label>Columns: <HeaderInput value={props.columns} updateValue={props.updateColumns} /></label>
        </p>
    )
}

function ImageSection(props) {
    const image = props.letterObject.image;
    const index = props.letterObject.index;
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
    const index = props.letterObject.index;
    return (
        <td>
            <ImageSection {...props} />
            <input type='text' value={letter} size='1' maxLength='1' onChange={(e) => props.updateLetter(index, e.target.value)} />
        </td>
    )
}

function ChartRow(props) {
    const cells = props.row.map( 
        (letterObject) => <ChartCell 
                                key={letterObject.index} 
                                letterObject={letterObject} 
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

function chartArray(rows, columns, alphabet) {
    let chart = []
    let i=0;
    for(let r=0; r<rows; ++r){
        chart.push([]);
        for(let c=0; c<columns; ++c){
            let letterObject = alphabet[i] || {index: i}
            chart[r].push(letterObject);
            ++i;
        }
    }
    return chart;
}

class Chart extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const chart = chartArray(this.props.rows, this.props.columns, this.props.alphabet);
        const rows = chart.map(
            (row, index) => <ChartRow 
                                row={row} 
                                key={index} 
                                updateLetter={this.props.updateLetter}
                                changeImage={this.props.changeImage}
                                removeImage={this.props.removeImage} />
        );
        return (
            <table>
                <tbody>
                    {rows}
                </tbody>
            </table>
        );
    }
}
function SaveButton(props) {
    return (
        <button onClick={props.saveChart}>
            Save
        </button>
    )
}


class AlphabetChart extends React.Component {
    constructor(props) {
        super(props);
        this.updateRows = this.updateRows.bind(this);
        this.updateColumns = this.updateColumns.bind(this);
        this.updateLetter = this.updateLetter.bind(this);
        this.removeImage = this.removeImage.bind(this);

        this.state = {rows: 7, columns: 4};
    }

    updateRows(event) {
        this.setState({rows: event.target.value})
    }

    updateColumns(event) {
        this.setState({columns: event.target.value});
    }

    updateLetter(index, newLetter) {
        this.props.updateAlphabet(index, {letter: newLetter});
    }

    removeImage(index) {
        this.props.updateAlphabet(index, {image: null});
    }

    render() {
        return (
            <div>
                <ChartHeader 
                    rows={this.state.rows} 
                    columns={this.state.columns}
                    updateRows={this.updateRows}
                    updateColumns={this.updateColumns} />
                <Chart
                    rows={this.state.rows}
                    columns={this.state.columns}
                    alphabet={this.props.alphabet}
                    updateLetter={this.updateLetter}
                    changeImage={this.props.changeImage}
                    removeImage={this.removeImage} />
                <SaveButton 
                    saveChart={this.props.saveChart} />
            </div>
        );
    }
}

export default AlphabetChart;