import * as fs from 'fs'
const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

const charGrid = lines.map((line) => line.split(''))

interface Point {
    x: number
    y: number
}

// part 1

const validCoords = (point: Point) => {
    return point.x >= 0 && point.x < charGrid[0].length && point.y >= 0 && point.y < charGrid.length
}

const findAntinodes = (p1: Point, p2: Point) => {
    const diffX = p1.x - p2.x
    const diffY = p1.y - p2.y

    const a1 = { x: p1.x + diffX, y: p1.y + diffY }
    const a2 = { x: p2.x - diffX, y: p2.y - diffY }

    return [a1, a2]
}

// can't use set here because we're comparing objects
const antinodes: Array<Point> = []

for (let x = 0; x < charGrid[0].length; x++) {
    for (let y = 0; y < charGrid.length; y++) {
        if (charGrid[y][x] !== '.') {
            for (let x2 = 0; x2 < charGrid[0].length; x2++) {
                for (let y2 = 0; y2 < charGrid.length; y2++) {
                    if (x !== x2 && y !== y2 && charGrid[y][x] === charGrid[y2][x2]) {
                        findAntinodes({ x, y }, { x: x2, y: y2 }).forEach((p) => antinodes.push(p))
                    }
                }
            }
        }
    }
}

const dedupedAntinodes = antinodes.filter(
    (p1, i) => antinodes.findIndex((p2) => p1.x === p2.x && p1.y === p2.y) === i,
)
const validAntinodes = [...dedupedAntinodes].filter((p) => validCoords(p))

console.log(validAntinodes.length)

// part 2
const findAntinodesWithResonance = (p1: Point, p2: Point) => {
    const diffX = p1.x - p2.x
    const diffY = p1.y - p2.y

    const antinodes: Array<Point> = []

    // eslint-disable-next-line no-constant-condition
    for (let multiplier = 0; true; multiplier++) {
        const x = p1.x + multiplier * diffX
        const y = p1.y + multiplier * diffY

        if (validCoords({ x, y })) antinodes.push({ x, y })
        else break
    }

    // eslint-disable-next-line no-constant-condition
    for (let multiplier = 0; true; multiplier++) {
        const x = p2.x - multiplier * diffX
        const y = p2.y - multiplier * diffY

        if (validCoords({ x, y })) antinodes.push({ x, y })
        else break
    }

    return antinodes
}

// can't use set here because we're comparing objects
const antinodesWithResonance: Array<Point> = []

for (let x = 0; x < charGrid[0].length; x++) {
    for (let y = 0; y < charGrid.length; y++) {
        if (charGrid[y][x] !== '.') {
            for (let x2 = 0; x2 < charGrid[0].length; x2++) {
                for (let y2 = 0; y2 < charGrid.length; y2++) {
                    if (x !== x2 && y !== y2 && charGrid[y][x] === charGrid[y2][x2]) {
                        findAntinodesWithResonance({ x, y }, { x: x2, y: y2 }).forEach((p) =>
                            antinodesWithResonance.push(p),
                        )
                    }
                }
            }
        }
    }
}

const dedupedAntinodesWithResonance = antinodesWithResonance.filter(
    (p1, i) => antinodesWithResonance.findIndex((p2) => p1.x === p2.x && p1.y === p2.y) === i,
)

console.log(dedupedAntinodesWithResonance.length)
