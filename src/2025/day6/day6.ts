import * as fs from 'fs'

const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n')

const realLines = lines.filter((line) => line.trim().length > 0)

const operationLine = realLines
    .filter((line) => line.indexOf('+') !== -1 || line.indexOf('*') !== -1)[0]
    .trim()

const numberLines = realLines
    .filter((line) => line.trim() !== operationLine)
    .map((line) => line.trim())

const columnLengths = new Array<number>()

let overallTotal = 0
for (let i = 0; i < numberLines[0].split(/ +/).length; i++) {
    const operation = operationLine.split(/ +/)[i]

    if (operation === '+') {
        const addend = numberLines.reduce(
            (acc, line) => acc + Number.parseInt(line.split(/ +/)[i]),
            0,
        )
        overallTotal += addend
    } else if (operation === '*') {
        const addend = numberLines.reduce((acc, line) => {
            const parsedNumber = Number.parseInt(line.split(/ +/)[i])
            return acc * parsedNumber
        }, 1)
        overallTotal += addend
    } else {
        console.log('ERROR', operation)
    }

    columnLengths.push(
        numberLines
            .map((line) => line.split(/ +/)[i].length)
            .sort()
            .reverse()[0],
    )
}

console.log(overallTotal)

interface OperationInput {
    numbers: number[]
    operation: '*' | '+'
}

const inputs: OperationInput[] = new Array<OperationInput>()

function transform(paddedNumbersAsStrings: string[]): number[] {
    const transformedNumbers = new Array<number>()
    for (let i = paddedNumbersAsStrings[0].length - 1; i >= 0; i--) {
        let constructedString = ''

        paddedNumbersAsStrings.forEach((n) => {
            if (n.toString().length > i && n.toString()[i] !== '') {
                constructedString += n.toString()[i]
            }
        })

        const constructedNumber = Number.parseInt(constructedString)
        transformedNumbers.push(constructedNumber)
    }

    return transformedNumbers
}

let currentColumn = 0
for (let i = 0; i < realLines[0].length; ) {
    const textNumbers = realLines.map((line) => line.slice(i, i + columnLengths[currentColumn]))

    inputs.push({
        numbers: transform(textNumbers.slice(0, textNumbers.length - 1)),
        operation: textNumbers
            .slice(textNumbers.length - 1)[0]
            .split(/ +/)[0] as OperationInput['operation'],
    })

    i += columnLengths[currentColumn] + 1
    currentColumn++
}

let overallTotal2 = 0
inputs.forEach((input) => {
    if (input.operation === '+') {
        const addend = input.numbers.reduce((acc, n) => acc + n, 0)
        overallTotal2 += addend
    } else if (input.operation === '*') {
        const addend = input.numbers.reduce((acc, n) => acc * n, 1)
        overallTotal2 += addend
    } else {
        console.log('ERROR', input.operation)
    }
})

console.log(overallTotal2)
