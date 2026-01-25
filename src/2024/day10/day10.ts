import * as fs from 'fs'
const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

// setup

const grid = lines.map((line) => line.split('').map((char) => parseInt(char)))

// part 1

// returns a list of all the 9's reachable from the given x, y
const trailheadPeaks = (x: number, y: number, grid: Array<Array<number>>) => {
    if (grid[y][x] === 9) return new Set([`${x}${y}`])

    const children: Set<string> = new Set()

    if (y - 1 >= 0 && grid[y - 1][x] - grid[y][x] === 1)
        trailheadPeaks(x, y - 1, grid).forEach((child: string) => children.add(child))
    if (y + 1 < grid.length && grid[y + 1][x] - grid[y][x] === 1)
        trailheadPeaks(x, y + 1, grid).forEach((child) => children.add(child))
    if (x - 1 >= 0 && grid[y][x - 1] - grid[y][x] === 1)
        trailheadPeaks(x - 1, y, grid).forEach((child) => children.add(child))
    if (x + 1 < grid[0].length && grid[y][x + 1] - grid[y][x] === 1)
        trailheadPeaks(x + 1, y, grid).forEach((child) => children.add(child))

    return children
}

let totalScore = 0

for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
        if (grid[y][x] === 0) {
            totalScore += trailheadPeaks(x, y, grid).size
        }
    }
}

console.log(totalScore)

// part 2

// returns a list of all the distinct paths to 9's reachable from the given x, y
const trailheadPaths = (x: number, y: number, grid: Array<Array<number>>, history: string) => {
    if (grid[y][x] === 9) return new Set([`${history},${x}${y}`])

    const children: Set<string> = new Set()

    if (y - 1 >= 0 && grid[y - 1][x] - grid[y][x] === 1)
        trailheadPaths(x, y - 1, grid, `${history},${x}${y - 1}`).forEach((child: string) =>
            children.add(child),
        )
    if (y + 1 < grid.length && grid[y + 1][x] - grid[y][x] === 1)
        trailheadPaths(x, y + 1, grid, `${history},${x}${y + 1}`).forEach((child) =>
            children.add(child),
        )
    if (x - 1 >= 0 && grid[y][x - 1] - grid[y][x] === 1)
        trailheadPaths(x - 1, y, grid, `${history},${x - 1}${y}`).forEach((child) =>
            children.add(child),
        )
    if (x + 1 < grid[0].length && grid[y][x + 1] - grid[y][x] === 1)
        trailheadPaths(x + 1, y, grid, `${history},${x + 1}${y}`).forEach((child) =>
            children.add(child),
        )

    return children
}

let totalRating = 0

for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
        if (grid[y][x] === 0) {
            totalRating += trailheadPaths(x, y, grid, `${x}${y}`).size
        }
    }
}

console.log(totalRating)
