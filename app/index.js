import React from 'react';
import ReactDOM from 'react-dom';

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
        <td key={index}>
            <input type='text' value={letter} size='1' onChange={(e) => props.updateLetter(index, e.target.value)} />
        </td>
    )
}

function ChartRow(props) {
    const cells = props.row.map( 
        (letter, index) => <ChartCell letterObject={letter} index={props.startIndex + index} updateLetter={props.updateLetter} />
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
            chart[r].push({letter: alphabet[i], index: i});
            ++i;
        }
    }
    return chart;
}

class Chart extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const chart = chartArray(this.props.rows, this.props.columns, this.props.alphabet);
        const rows = chart.map(
            (row, index) => <ChartRow row={row} startIndex={index * this.props.columns} updateLetter={this.props.updateLetter} />
        );
        return (
            <table>
                {rows}
            </table>
        );
    }
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