const buttons = [
    { text: 7, id: 'seven', cName: 'btn' },
    { text: 8, id: 'eight', cName: 'btn' },
    { text: 9, id: 'nine', cName: 'btn' },
    { text: 'DEL', id: 'delete', cName: 'btn ctrl' },
    { text: 'AC', id: 'clear', cName: 'btn ctrl' },
    { text: 4, id: 'four', cName: 'btn' },
    { text: 5, id: 'five', cName: 'btn' },
    { text: 6, id: 'six', cName: 'btn' },
    { text: 'x', id: 'multiply', cName: 'btn ctrl' },
    { text: '/', id: 'divide', cName: 'btn ctrl' },
    { text: 1, id: 'one', cName: 'btn' },
    { text: 2, id: 'two', cName: 'btn' },
    { text: 3, id: 'three', cName: 'btn' },
    { text: '+', id: 'add', cName: 'btn ctrl' },
    { text: '-', id: 'subtract', cName: 'btn ctrl' },
    { text: 0, id: 'zero', cName: 'btn' },
    { text: '.', id: 'decimal', cName: 'btn' },
    { text: 'ANS', id: 'ans', cName: 'btn ctrl' },
    { text: '=', id: 'equals', cName: 'btn ctrl' },
]

const Btn = ({ cName, text, id, handleEval, handleInput }) => (
    <button
        className={cName}
        onClick={id == 'equals' ? handleEval : handleInput}
        id={id}
    >
        {text}
    </button>
)

const Controls = ({ handleInput, handleEval }) => {
    return (
        <div className="buttons">
            {buttons.map(({ text, id, cName }) => {
                return (
                    <Btn
                        handleInput={handleInput}
                        handleEval={handleEval}
                        cName={cName}
                        text={text}
                        id={id}
                    />
                )
            })}
        </div>
    )
}

const Display = ({ answer, input }) => (
    <div id="output">
        <div id="answer">{answer}</div>
        <div id="display">{input}</div>
    </div>
)

class Calculator extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            answer: '',
            input: '0',
            lastAnswer: '',
            isDone: false,
        }

        this.handleInput = this.handleInput.bind(this)
        this.handleEval = this.handleEval.bind(this)
    }

    handleInput({ target }) {
        const opReg = /[\+\-\/x]/
        const currOpReg = /[\+\/x]/
        const prevOpReg = /(S|\d)[\+\-\/x]{1}$/
        const negativeReg = /(S|\d)[\+\/x]{1}\-{1}$/
        const numberReg = /\d/g
        const del = /DEL$/
        const clear = /AC$/
        const answerReg = /ANS$/
        const zeroReg = /^0+$/
        const decimalReg = /\.(?!.*[\+\-\/x])/

        let currInput = target.textContent

        this.setState(({ input, answer, isDone }) => {
            if (isDone && opReg.test(currInput)) {
                return {
                    input: `${answer}${currInput}`,
                    answer: '',
                    isDone: false,
                }
            }

            // clear
            if (clear.test(currInput))
                return { input: '0', lastAnswer: '', answer: '', isDone: false }

            // delete
            if (del.test(currInput)) {
                if (input[input.length - 1] === 'S') {
                    return {
                        input: input.slice(0, input.length - 3),
                        answer: '',
                        isDone: false,
                    }
                }

                if (input.length > 1)
                    return {
                        input: input.slice(0, input.length - 1),
                        answer: '',
                        isDone: false,
                    }

                return {
                    input: '0',
                    isDone: false,
                }
            }

            // number
            if (numberReg.test(currInput)) {
                if (input === '0') return { input: currInput, isDone: false }

                if (isDone) return { input: currInput, answer: '' }
            }

            // ANS
            if (answerReg.test(currInput)) {
                if (input === '0') return { input: currInput, isDone: false }
            }

            // multiple zero input
            if (currInput === '0') {
                if (zeroReg.test(input)) return { input: '0', isDone: false }
            }

            // decimal
            if (currInput === '.') {
                if (decimalReg.test(input)) return { input, isDone: false }
            }

            // multiple operator input
            if (currOpReg.test(currInput)) {
                if (prevOpReg.test(input))
                    return {
                        input: input.slice(0, input.length - 1) + currInput,
                        idDone: false,
                    }

                if (negativeReg.test(input))
                    return {
                        input: input.slice(0, input.length - 2) + currInput,
                        isDone: false,
                    }

                return { input: input + currInput, isDone: false }
            }

            if (currInput === '-') {
                if (negativeReg.test(input))
                    return {
                        input: input.slice(0, input.length - 2) + currInput,
                        isDone: false,
                    }
            }

            // default clause
            return { input: input + currInput, isDone: false }
        })
    }

    handleEval() {
        this.setState(({ input, answer, lastAnswer }) => {
            const evaluate = str => {
                str = str.replaceAll('x', '*')
                str = str.replaceAll(/(\dANS)(ANS\d)/g, (m, $1, $2) => {
                    if ($1) return `${$1[0]}*${$1.slice(1)}`

                    return `${$2[$2.length - 1]}*${$2.slice(0, $2.length - 1)}`
                })
                str = str.replaceAll('ANS', answer || 0)

                return Math.round(1000000 * eval(str)) / 1000000
            }

            return {
                answer: evaluate(input),
                input: evaluate(input),
                isDone: true,
            }
        })
    }

    render() {
        return (
            <div>
                <Display answer={this.state.answer} input={this.state.input} />
                <Controls
                    handleEval={this.handleEval}
                    handleInput={this.handleInput}
                />
            </div>
        )
    }
}

// render
ReactDOM.render(<Calculator />, document.querySelector('#app'))
