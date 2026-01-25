import * as fs from 'fs'

const rawFile = fs.readFileSync('small.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

const codes = lines

// part 1

const numberGrid = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['', '0', 'A'],
]

const arrowGrid = [
    ['', '^', 'A'],
    ['<', 'v', '>'],
]

const pathLeftOrRight = (colDiff: number) => {
    return colDiff > 0
        ? '>'.repeat(Math.abs(colDiff))
        : colDiff < 0
          ? '<'.repeat(Math.abs(colDiff))
          : ''
}

const pathUpOrDown = (rowDiff: number) => {
    return rowDiff > 0
        ? 'v'.repeat(Math.abs(rowDiff))
        : rowDiff < 0
          ? '^'.repeat(Math.abs(rowDiff))
          : ''
}

const shortestRoute = (
    code: string,
    curRow: number,
    curColumn: number,
    prefix: string,
    whichGrid: Array<Array<string>>,
) => {
    if (code.length === 0) {
        return prefix
    }

    const badRow = whichGrid.findIndex((row) => row.includes(''))
    const badColumn = whichGrid.filter((row) => row.includes(''))[0].indexOf('')

    const target = code[0]

    const targetColumn = whichGrid.filter((row) => row.includes(target))[0].indexOf(target)
    const targetRow = whichGrid.findIndex((row) => row.includes(target))

    // this will be positive if we have to go right
    const colDiff = targetColumn - curColumn
    // this will be positive if we have to go down
    const rowDiff = targetRow - curRow

    const pathUD = pathUpOrDown(rowDiff)
    const pathLR = pathLeftOrRight(colDiff)

    if (colDiff === 0 && rowDiff !== 0) {
        // go up or down and recurse
        return shortestRoute(
            code.slice(1),
            targetRow,
            targetColumn,
            prefix + pathUD + 'A',
            whichGrid,
        )
    } else if (colDiff !== 0 && rowDiff === 0) {
        // go left or right and recurse
        return shortestRoute(
            code.slice(1),
            targetRow,
            targetColumn,
            prefix + pathLR + 'A',
            whichGrid,
        )
    } else if (colDiff === 0 && rowDiff === 0) {
        // we're on top of the target, just push
        return shortestRoute(code.slice(1), targetRow, targetColumn, prefix + 'A', whichGrid)
    } else if (targetRow === badRow) {
        // we have to go both directions the bad space in the in the same row as the target. go LR first then UD
        return shortestRoute(
            code.slice(1),
            targetRow,
            targetColumn,
            prefix + pathLR + pathUD + 'A',
            whichGrid,
        )
    } else if (targetColumn === badColumn) {
        // we have to go both directions the bad space in the in the same column as the target. go UD first then LR
        return shortestRoute(
            code.slice(1),
            targetRow,
            targetColumn,
            prefix + pathUD + pathLR + 'A',
            whichGrid,
        )
    } else {
        // we have to go both directions and the bad space is not in the way. Just decide which way is better
        const pathLR = pathLeftOrRight(colDiff)
        const pathUD = pathUpOrDown(rowDiff)

        // we need to check the last move that we made and keep going in the same direction if possible
        const lastMove = prefix.lastIndexOf('A') - 1

        if (lastMove < 0 || prefix[lastMove] === '<' || prefix[lastMove] === '>') {
            // we went left or right last time, try to continue in that direction
            return shortestRoute(
                code.slice(1),
                targetRow,
                targetColumn,
                prefix + pathLR + pathUD + 'A',
                whichGrid,
            )
        } else {
            // up or down last time
            return shortestRoute(
                code.slice(1),
                targetRow,
                targetColumn,
                prefix + pathUD + pathLR + 'A',
                whichGrid,
            )
        }
    }
}

const totalScore = codes.reduce((acc, code) => {
    const numberGridSequence = shortestRoute(codes[0], 3, 2, '', numberGrid)
    const arrowGridSequence1 = shortestRoute(numberGridSequence, 0, 2, '', arrowGrid)
    const arrowGridSequence2 = shortestRoute(arrowGridSequence1, 0, 2, '', arrowGrid)

    console.log(numberGridSequence)
    console.log(arrowGridSequence1)
    console.log(arrowGridSequence2)
    console.log(`${arrowGridSequence2.length} * ${parseInt(code)}`)

    const score = arrowGridSequence2.length * parseInt(code)
    console.log(score)

    return acc + score
}, 0)

console.log(totalScore)

// part 2

// 029A
// A -> 0 -> 2 -> 9 -> A

