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

function ChartCell(props) {
    const letter = props.letterObject.letter;
    const index = props.letterObject.index;
    return (
        <td>
            <input type='text' value={letter} size='1' maxLength='1' onChange={(e) => props.updateLetter(index, e.target.value)} />
        </td>
    )
}

function ChartRow(props) {
    const cells = props.row.map( 
        (letterObject) => <ChartCell key={letterObject.index} letterObject={letterObject} updateLetter={props.updateLetter} />
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
            let letter = alphabet[i] || ''
            chart[r].push({letter: letter, index: i});
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
            (row, index) => <ChartRow row={row} key={index} updateLetter={this.props.updateLetter} />
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
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
}

function updateArray(array, index, newVal) {
    let a = array.slice(0);
    a[index] = newVal;
    return a;
}

class AlphaChart extends React.Component {
    constructor(props) {
        super(props);
        this.updateRows = this.updateRows.bind(this);
        this.updateColumns = this.updateColumns.bind(this);
        this.updateLetter = this.updateLetter.bind(this);
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
            (prevState, props) => ({ alphabet: updateArray(prevState.alphabet, index, newLetter)})
        )
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
                    updateLetter={this.updateLetter} />
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