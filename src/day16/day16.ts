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

interface Pair {
    x: number
    y: number
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

// type Key = { x: number; y: number; dir: Direction }
// const memoize: Map<string, number> = new Map()
//
// returns the cheapest cost of a path from x,y to the end
// const cheapestRoute = (
//     x: number,
//     y: number,
//     dir: Direction,
//     maze: Array<Array<Space>>,
//     seen: Array<Key>,
// ): number => {
//     if (x === 135 && y === 6)
//         console.log(`hit the spot from direction ${dir}`)
//
//     const key: string = JSON.stringify({ x, y, dir })
//     const cached = memoize.get(key)
//     if (cached !== undefined) {
//         return cached
//     }
//
//     if (maze[y][x] === Space.Wall) {
//         throw new Error("shouldn't be called on a wall")
//     }
//     if (maze[y][x] === Space.End) {
//         memoize.set(key, 0)
//         return 0
//     }
//
//     let u = Infinity
//     let d = Infinity
//     let l = Infinity
//     let r = Infinity
//
//     // compute costs in all directions if they are not walls and we haven't seen them before
//     if (maze[y - 1][x] !== Space.Wall && seen.find((key) => key.x === x && key.y === y - 1 && key.dir === Direction.Up) === undefined && seen.find((key) => key.x === x && key.y === y - 1 && key.dir === Direction.Down) === undefined) {
//         u = cheapestRoute(x, y - 1, Direction.Up, maze, seen.concat({ x, y: y - 1, dir: Direction.Up }))
//         if (seen.length === 2) console.log(`top u: ${u}`)
//         if (x === 136 || y === 7) console.log(`u: ${u}`)
//     }
//     if (maze[y + 1][x] !== Space.Wall && seen.find((key) => key.x === x && key.y === y + 1 && key.dir === Direction.Down) === undefined && seen.find((key) => key.x === x && key.y === y + 1 && key.dir === Direction.Up) === undefined) {
//         d = cheapestRoute(x, y + 1, Direction.Down, maze, seen.concat({ x, y: y + 1, dir: Direction.Down }))
//         if (seen.length === 2) console.log(`top d: ${d}`)
//         if (x === 136 || y === 7) console.log(`u: ${u}`)
//     }
//     if (maze[y][x - 1] !== Space.Wall && seen.find((key) => key.x === x - 1 && key.y === y && key.dir === Direction.Left) === undefined && seen.find((key) => key.x === x - 1 && key.y === y && key.dir === Direction.Right) === undefined) {
//         l = cheapestRoute(x - 1, y, Direction.Left, maze, seen.concat({ x: x - 1, y, dir: Direction.Left }))
//         if (seen.length === 2) console.log(`top l: ${l}`)
//         if (x === 136 || y === 7) console.log(`u: ${u}`)
//     }
//     if (maze[y][x + 1] !== Space.Wall && seen.find((key) => key.x === x + 1 && key.y === y && key.dir === Direction.Right) === undefined && seen.find((key) => key.x === x + 1 && key.y === y && key.dir === Direction.Left) === undefined) {
//         r = cheapestRoute(x + 1, y, Direction.Right, maze, seen.concat({ x: x + 1, y, dir: Direction.Right }))
//         if (seen.length === 2) console.log(`top r: ${r}`)
//         if (x === 136 || y === 7) console.log(`u: ${u}`)
//     }
//
//     // add turn penalties
//     if (dir === Direction.Up) {
//         d += 2000
//         r += 1000
//         l += 1000
//     } else if (dir === Direction.Down) {
//         u += 2000
//         r += 1000
//         l += 1000
//     } else if (dir === Direction.Left) {
//         r += 2000
//         u += 1000
//         d += 1000
//     } else if (dir === Direction.Right) {
//         l += 2000
//         u += 1000
//         d += 1000
//     } else {
//         throw new Error()
//     }
//     const cheapest = 1 + Math.min(u, d, l, r)
//
//     if ((x >= 132) && y <= 10) {
//         console.log(key, cheapest)
//     }
//     memoize.set(key, cheapest)
//
//     return cheapest
// }

const heuristic = (a: Pair, b: Pair) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)

const neighbors = (node: Pair, grid: Array<Array<Space>>) => {
    const ret: Array<Pair> = []

    if (node.x - 1 >= 0 && grid[node.y][node.x - 1] != Space.Wall) {
        ret.push({ x: node.x - 1, y: node.y })
    }
    if (node.x + 1 < grid[0].length && grid[node.y][node.x + 1] != Space.Wall) {
        ret.push({ x: node.x + 1, y: node.y })
    }
    if (node.y - 1 >= 0 && grid[node.y - 1][node.x] != Space.Wall) {
        ret.push({ x: node.x, y: node.y - 1 })
    }
    if (node.y + 1 < grid.length && grid[node.y + 1][node.x] != Space.Wall) {
        ret.push({ x: node.x, y: node.y + 1 })
    }
    return ret
}

const astar = (start: Pair, end: Pair, grid: Array<Array<Space>>) => {
    const openList: Array<Pair> = []
    const closedList: Array<Pair> = []
    const bestCostsSoFar: Map<string, number> = new Map()
    const guessedCosts: Map<string, number> = new Map()
    const parents: Map<string, Pair> = new Map()

    // initial state
    openList.push(start)
    bestCostsSoFar.set(JSON.stringify(start), 0)

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            const key = JSON.stringify({ x, y })
            guessedCosts.set(key, heuristic({ x, y }, end))
        }
    }

    // loop through all spaces that have yet to be visited
    while (openList.length > 0) {
        // Grab the lowest f(x) to process next
        const costs = openList.map((p) => {
            const key = JSON.stringify(p)
            return guessedCosts.get(key)! + bestCostsSoFar.get(key)!
        })
        const currentNode = openList[costs.indexOf(Math.min(...costs))]

        if (currentNode.x === 139 && currentNode.y === 3) {
            console.log('here')
        }

        // got to the end
        if (currentNode.x == end.x && currentNode.y == end.y) {
            let curr = currentNode
            const ret: Array<Pair> = []
            while (parents.get(JSON.stringify(curr))) {
                ret.push(curr)
                curr = parents.get(JSON.stringify(curr))!
            }
            return ret.reverse()
        }

        // check all neighbors
        const indexOfCurrent = openList.findIndex(
            (p) => p.x === currentNode.x && p.y === currentNode.y,
        )
        openList.splice(indexOfCurrent, 1)
        closedList.push(currentNode)
        const adjacentList = neighbors(currentNode, grid)

        adjacentList.forEach((neighbor) => {
            const neighborKey = JSON.stringify(neighbor)

            if (closedList.findIndex((p) => p.x === neighbor.x && p.y === neighbor.y) != -1) {
                // not a valid node to process, skip to next neighbor
                return
            }

            // compute score to this node
            const gScore = bestCostsSoFar.get(JSON.stringify(currentNode))! + 1
            let gScoreBest = false

            if (openList.findIndex((p) => p.x === neighbor.x && p.y === neighbor.y) === -1) {
                // haven't been to this node, put it in the open list
                gScoreBest = true
                openList.push(neighbor)
            } else if (gScore < bestCostsSoFar.get(neighborKey)!) {
                // We've been to this node before, but this path is better
                gScoreBest = true
            }

            if (gScoreBest) {
                // optimal path so far
                parents.set(neighborKey, currentNode)
                bestCostsSoFar.set(neighborKey, gScore)
            }
        })
    }

    // no path
    return []
}

const startY = maze.findIndex((row) => row.includes(Space.Start))
const startX = maze[startY].findIndex((space) => space === Space.Start)

const endY = maze.findIndex((row) => row.includes(Space.End))
const endX = maze[endY].findIndex((space) => space === Space.End)
console.log(startX, startY)
console.log(maze[0].length, maze.length)

const cheapest = astar({ x: startX, y: startY }, { x: endX, y: endY }, maze)

console.log(cheapest)

// 153556 too high

// 105496 is probably the right answer
