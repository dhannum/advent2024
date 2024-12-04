import * as fs from 'fs'
import {square, transpose} from "../util/util";
const rawFile = fs.readFileSync('input.txt','utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

const grid = lines.map((line) => line.split(''))

const countXmasInRow = (row: string[]) => {
    const xmas = /XMAS|SAMX/g
    let matches = [], found

    while (found = xmas.exec(row.join(''))) {
        matches.push(found[0])
        xmas.lastIndex = found.index + 1
    }

    return matches.length
}

const horizontalCounts = grid.map(countXmasInRow)
const verticalCounts = transpose(grid).map(countXmasInRow)

const lpad = (line: string, count: number) => new Array(count + 1).join(' ') + line
const rpad = (line: string, count: number) => line + new Array(count + 1).join(' ')

const gridShuntedOneWay = square(grid.map((row, i) => rpad(lpad(row.join(''), i), row.join('').length - 1 - i).split('')))
const shuntedCounts = transpose(gridShuntedOneWay).map(countXmasInRow)

const gridShuntedOtherWay = square(grid.map((row, i) => rpad(lpad(row.join(''), (row.join('').length - 1 - i)), i).split('')))
const otherWayShuntedCounts = transpose(gridShuntedOtherWay).map(countXmasInRow)

const total = horizontalCounts.reduce((acc, val) => acc + val, 0) +
    verticalCounts.reduce((acc, val) => acc + val, 0) +
    shuntedCounts.reduce((acc, val) => acc + val, 0) +
    otherWayShuntedCounts.reduce((acc, val) => acc + val, 0)

console.log(total)

// part 2

let count = 0
for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] === 'A') {
            if (r - 1 < 0 || r + 1 >= grid.length || c - 1 < 0 || c + 1 >= grid[r].length)
                continue
            else
                if (((grid[r-1][c-1] === 'M' && grid[r+1][c+1] === 'S') ||
                    (grid[r-1][c-1] === 'S' && grid[r+1][c+1] === 'M')) &&
                    ((grid[r-1][c+1] === 'M' && grid[r+1][c-1] === 'S') ||
                    (grid[r-1][c+1] === 'S' && grid[r+1][c-1] === 'M'))
                )
                    count++
        }
    }
}

console.log(count)

