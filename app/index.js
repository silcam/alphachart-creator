import React from 'react';
import ReactDOM from 'react-dom';

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
                <img src={image} style={{maxWidth: '200px', maxHeight: '200px'}} /><br />
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

function defaultAlphabet() {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').map(
        (letter, index) => ({index: index, letter: letter})
    );
}

function updateAlphabet(prevAlphabet, index, update) {
    let alphabet = prevAlphabet.slice();
    Object.assign(alphabet[index], update);
    return alphabet;
}

class AlphaChart extends React.Component {
    constructor(props) {
        super(props);
        this.updateRows = this.updateRows.bind(this);
        this.updateColumns = this.updateColumns.bind(this);
        this.updateLetter = this.updateLetter.bind(this);
        this.changeImage = this.changeImage.bind(this);
        this.removeImage = this.removeImage.bind(this);
        this.saveChart = this.saveChart.bind(this);

        this.state = {rows: 7, columns: 4, alphabet: defaultAlphabet()};
    }

    updateRows(event) {
        this.setState({rows: event.target.value})
    }

    updateColumns(event) {
        this.setState({columns: event.target.value});
    }

    updateLetter(index, newLetter) {
        this.setState(
            (prevState, props) => ({ alphabet: updateAlphabet(prevState.alphabet, index, {letter: newLetter})})
        )
    }

    changeImage(index) {
        dialog.showOpenDialog({filters: [{name: 'Images', extensions: ['jpg', 'png', 'gif']}]}, (filepaths) => {
            if (filepaths && filepaths[0]) {
                this.setState(
                    (prevState, props) => ({alphabet: updateAlphabet(prevState.alphabet, index, {image: filepaths[0]})})
                );
            }
        });
    }

    removeImage(index) {
        this.setState(
            (prevState, props) => ({alphabet: updateAlphabet(prevState.alphabet, index, {image: null})})
        );
    }

    saveChart() {
        dialog.showSaveDialog({defaultPath: 'My Alphabet.apc'}, (filename) => {
            if (filename) {
                let fs = require('fs');
                fs.writeFile(filename, JSON.stringify(this.state.alphabet), (err) => {
                    if(err) {
                        dialog.showErrorBox('Error', err.message)
                    }
                });
            }
        });
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
                    alphabet={this.state.alphabet}
                    updateLetter={this.updateLetter}
                    changeImage={this.changeImage}
                    removeImage={this.removeImage} />
                <SaveButton 
                    saveChart={this.saveChart} />
            </div>
        );
    }
}

function RootElement(props) {
    return (
        <div>
            <h1>Howdy</h1>
            <AlphaChart />
        </div>
    )
}

ReactDOM.render(
    <RootElement />,
    document.getElementById('root')
);