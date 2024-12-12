import * as fs from 'fs'
const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)
const board = lines.map((line) => line.split(''))

// part 1

const COUNT_IN_PROGRESS = '?'
const ALREADY_COUNTED = '.'

interface Measurements {
    area: number
    perimeter: number
}

interface Plot {
    x: number
    y: number
}

// recursively measure a region starting at x, y of value v. Accumulates a list of visited plots
const measureRegion = (
    x: number,
    y: number,
    v: string,
    visited: Array<Plot>,
    board: Array<Array<string>>,
): Measurements => {
    let accA = 1
    let accP = 0

    board[y][x] = COUNT_IN_PROGRESS
    visited.push({ x, y })

    if (x - 1 < 0) accP++
    else if (board[y][x - 1] === COUNT_IN_PROGRESS) {
        /* empty */
    } else if (board[y][x - 1] !== v) accP++
    else {
        const r = measureRegion(x - 1, y, v, visited, board)
        accA += r.area
        accP += r.perimeter
    }

    if (x + 1 === board[0].length) accP++
    else if (board[y][x + 1] === COUNT_IN_PROGRESS) {
        /* empty */
    } else if (board[y][x + 1] !== v) accP++
    else {
        const r = measureRegion(x + 1, y, v, visited, board)
        accA += r.area
        accP += r.perimeter
    }

    if (y - 1 < 0) accP++
    else if (board[y - 1][x] === COUNT_IN_PROGRESS) {
        /* empty */
    } else if (board[y - 1][x] !== v) accP++
    else {
        const r = measureRegion(x, y - 1, v, visited, board)
        accA += r.area
        accP += r.perimeter
    }

    if (y + 1 === board.length) accP++
    else if (board[y + 1][x] === COUNT_IN_PROGRESS) {
        /* empty */
    } else if (board[y + 1][x] !== v) accP++
    else {
        const r = measureRegion(x, y + 1, v, visited, board)
        accA += r.area
        accP += r.perimeter
    }

    return {
        area: accA,
        perimeter: accP,
    }
}

const totals: Array<Measurements> = []
for (let x = 0; x < board[0].length; x++) {
    for (let y = 0; y < board.length; y++) {
        if (board[y][x] != ALREADY_COUNTED) {
            const visited: Array<Plot> = []
            const r = measureRegion(x, y, board[y][x], visited, board)
            visited.forEach(({ x, y }) => (board[y][x] = ALREADY_COUNTED))
            totals.push(r)
        }
    }
}

const totalPrice = totals.reduce((acc, { area, perimeter }) => acc + area * perimeter, 0)

console.log(totalPrice)
