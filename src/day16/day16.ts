import * as fs from 'fs'

const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

enum Space {
    Start,
    Wall,
    Path,
    End,
}

enum Direction {
    Up,
    Down,
    Left,
    Right,
}

const maze: Array<Array<Space>> = []

lines.forEach((line) => {
    const row: Array<Space> = []
    for (const char of line) {
        switch (char) {
            case '.':
                row.push(Space.Path)
                break
            case '#':
                row.push(Space.Wall)
                break
            case 'S':
                row.push(Space.Start)
                break
            case 'E':
                row.push(Space.End)
                break
        }
    }
    maze.push(row)
})

// part 1

type Key = { x: number; y: number; dir: Direction }
const memoize: Map<string, number> = new Map()

// returns the cheapest cost of a path from x,y to the end
const cheapestRoute = (
    x: number,
    y: number,
    dir: Direction,
    maze: Array<Array<Space>>,
    seen: Array<Key>,
): number => {
    if (x === 135 && y === 6)
        console.log(`hit the spot from direction ${dir}`)

    const key: string = JSON.stringify({ x, y, dir })
    const cached = memoize.get(key)
    if (cached !== undefined) {
        return cached
    }

    if (maze[y][x] === Space.Wall) {
        throw new Error("shouldn't be called on a wall")
    }
    if (maze[y][x] === Space.End) {
        memoize.set(key, 0)
        return 0
    }

    let u = Infinity
    let d = Infinity
    let l = Infinity
    let r = Infinity

    // compute costs in all directions if they are not walls and we haven't seen them before
    if (maze[y - 1][x] !== Space.Wall && seen.find((key) => key.x === x && key.y === y - 1 && key.dir === Direction.Up) === undefined && seen.find((key) => key.x === x && key.y === y - 1 && key.dir === Direction.Down) === undefined) {
        u = cheapestRoute(x, y - 1, Direction.Up, maze, seen.concat({ x, y: y - 1, dir: Direction.Up }))
        if (seen.length === 2) console.log(`top u: ${u}`)
        if (x === 136 || y === 7) console.log(`u: ${u}`)
    }
    if (maze[y + 1][x] !== Space.Wall && seen.find((key) => key.x === x && key.y === y + 1 && key.dir === Direction.Down) === undefined && seen.find((key) => key.x === x && key.y === y + 1 && key.dir === Direction.Up) === undefined) {
        d = cheapestRoute(x, y + 1, Direction.Down, maze, seen.concat({ x, y: y + 1, dir: Direction.Down }))
        if (seen.length === 2) console.log(`top d: ${d}`)
        if (x === 136 || y === 7) console.log(`u: ${u}`)
    }
    if (maze[y][x - 1] !== Space.Wall && seen.find((key) => key.x === x - 1 && key.y === y && key.dir === Direction.Left) === undefined && seen.find((key) => key.x === x - 1 && key.y === y && key.dir === Direction.Right) === undefined) {
        l = cheapestRoute(x - 1, y, Direction.Left, maze, seen.concat({ x: x - 1, y, dir: Direction.Left }))
        if (seen.length === 2) console.log(`top l: ${l}`)
        if (x === 136 || y === 7) console.log(`u: ${u}`)
    }
    if (maze[y][x + 1] !== Space.Wall && seen.find((key) => key.x === x + 1 && key.y === y && key.dir === Direction.Right) === undefined && seen.find((key) => key.x === x + 1 && key.y === y && key.dir === Direction.Left) === undefined) {
        r = cheapestRoute(x + 1, y, Direction.Right, maze, seen.concat({ x: x + 1, y, dir: Direction.Right }))
        if (seen.length === 2) console.log(`top r: ${r}`)
        if (x === 136 || y === 7) console.log(`u: ${u}`)
    }

    // add turn penalties
    if (dir === Direction.Up) {
        d += 2000
        r += 1000
        l += 1000
    } else if (dir === Direction.Down) {
        u += 2000
        r += 1000
        l += 1000
    } else if (dir === Direction.Left) {
        r += 2000
        u += 1000
        d += 1000
    } else if (dir === Direction.Right) {
        l += 2000
        u += 1000
        d += 1000
    } else {
        throw new Error()
    }
    const cheapest = 1 + Math.min(u, d, l, r)

    if ((x >= 132) && y <= 10) {
        console.log(key, cheapest)
    }
    memoize.set(key, cheapest)

    return cheapest
}

const startY = maze.findIndex((row) => row.includes(Space.Start))
const startX = maze[startY].findIndex((space) => space === Space.Start)
console.log(startX, startY)
console.log(maze[0].length, maze.length)

const cheapest = cheapestRoute(startX, startY, Direction.Right, maze, [{ x: startX, y: startY, dir: Direction.Right }, { x: startX, y: startY, dir: Direction.Up }])

console.log(cheapest)

// 153556 too high

// 105496 is probably the right answer