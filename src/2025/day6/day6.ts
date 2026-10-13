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
}

console.log(overallTotal)
