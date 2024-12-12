import * as fs from 'fs'
const rawFile = fs.readFileSync('small.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)
let board = lines.map((line) => line.split(''))

// part 1 1451030

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

interface FenceLeg {
    plot: Plot
    direction: 'none' | 'up' | 'down' | 'left' | 'right'
}

const fenceRegion = (
    x: number,
    y: number,
    v: string,
    board: Array<Array<string>>,
): Array<FenceLeg> => {
    const legs: Array<FenceLeg> = []

    board[y][x] = COUNT_IN_PROGRESS

    if (x - 1 < 0) legs.push({ plot: { x: x, y }, direction: 'left' })
    else if (board[y][x - 1] === COUNT_IN_PROGRESS) {
        /* empty */
    } else if (board[y][x - 1] !== v) legs.push({ plot: { x: x, y }, direction: 'left' })
    else {
        const r = fenceRegion(x - 1, y, v, board)
        legs.push(...r)
    }

    if (x + 1 === board[0].length) legs.push({ plot: { x: x, y }, direction: 'right' })
    else if (board[y][x + 1] === COUNT_IN_PROGRESS) {
        /* empty */
    } else if (board[y][x + 1] !== v) legs.push({ plot: { x: x, y }, direction: 'right' })
    else {
        const r = fenceRegion(x + 1, y, v, board)
        legs.push(...r)
    }

    if (y - 1 < 0) legs.push({ plot: { x, y: y }, direction: 'up' })
    else if (board[y - 1][x] === COUNT_IN_PROGRESS) {
        /* empty */
    } else if (board[y - 1][x] !== v) legs.push({ plot: { x, y: y }, direction: 'up' })
    else {
        const r = fenceRegion(x, y - 1, v, board)
        legs.push(...r)
    }

    if (y + 1 === board.length) legs.push({ plot: { x, y: y }, direction: 'down' })
    else if (board[y + 1][x] === COUNT_IN_PROGRESS) {
        /* empty */
    } else if (board[y + 1][x] !== v) legs.push({ plot: { x, y: y }, direction: 'down' })
    else {
        const r = fenceRegion(x, y + 1, v, board)
        legs.push(...r)
    }

    legs.push({ plot: { x, y }, direction: 'none' })
    return legs
}

const totals: Array<Measurements> = []
for (let x = 0; x < board[0].length; x++) {
    for (let y = 0; y < board.length; y++) {
        if (board[y][x] != ALREADY_COUNTED) {
            const r = fenceRegion(x, y, board[y][x], board)
            r.forEach(({ plot: { x, y } }) => (board[y][x] = ALREADY_COUNTED))

            const area = new Set(r.map(({ plot }) => `${plot.x},${plot.y}`)).size
            const perimeter = r.filter(({ direction }) => direction !== 'none').length
            totals.push({ area, perimeter })
        }
    }
}

const totalPrice = totals.reduce((acc, { area, perimeter }) => acc + area * perimeter, 0)

console.log(totalPrice)

// part 2

board = lines.map((line) => line.split(''))
const bulkTotals: Array<Measurements> = []

// find adjacent fence pieces and remove them
const makeFenceBulk = (r: Array<FenceLeg>) => {
    for (let i = 0; i < r.length; i++) {
        let indexOfAdjacent = -1

        if (
            ((r[i].direction === 'up' || r[i].direction === 'down') &&
                (indexOfAdjacent = r.findIndex(
                    (leg, j) =>
                        i != j &&
                        leg.direction === r[i].direction &&
                        leg.plot.y === r[i].plot.y &&
                        Math.abs(r[i].plot.x - leg.plot.x) === 1,
                )) !== -1) ||
            ((r[i].direction === 'left' || r[i].direction === 'right') &&
                (indexOfAdjacent = r.findIndex(
                    (leg, j) =>
                        i != j &&
                        leg.direction === r[i].direction &&
                        leg.plot.x === r[i].plot.x &&
                        Math.abs(r[i].plot.y - leg.plot.y) === 1,
                )) !== -1)
        ) {
            return makeFenceBulk(r.slice(0, indexOfAdjacent).concat(r.slice(indexOfAdjacent + 1)))
        }
    }

    return r
}

for (let x = 0; x < board[0].length; x++) {
    for (let y = 0; y < board.length; y++) {
        if (board[y][x] != ALREADY_COUNTED) {
            const v = board[y][x]

            const r = fenceRegion(x, y, board[y][x], board)
            r.forEach(({ plot: { x, y } }) => (board[y][x] = ALREADY_COUNTED))

            const area = new Set(r.map(({ plot }) => `${plot.x},${plot.y}`)).size
            const bulkFence = makeFenceBulk(r)
            const perimeter = bulkFence.filter(({ direction }) => direction !== 'none').length
            console.log(`Area ${x}, ${y} of letter ${v} with area: ${area}, perimeter: ${perimeter}`)
            bulkTotals.push({ area, perimeter })
        }
    }
}

const bulkPrice = bulkTotals.reduce((acc, { area, perimeter }) => acc + area * perimeter, 0)

console.log(bulkPrice)
