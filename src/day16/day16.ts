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

interface PathStep {
    x: number
    y: number
    dir: Direction
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

const equal = (a: PathStep, b: PathStep) => a.x === b.x && a.y === b.y && a.dir === b.dir

const heuristic = (a: Pair, b: Pair) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)

const neighbors = (node: Pair, grid: Array<Array<Space>>) => {
    const ret: Array<PathStep> = []

    if (node.x - 1 >= 0 && grid[node.y][node.x - 1] != Space.Wall) {
        ret.push({ x: node.x - 1, y: node.y, dir: Direction.Left })
    }
    if (node.x + 1 < grid[0].length && grid[node.y][node.x + 1] != Space.Wall) {
        ret.push({ x: node.x + 1, y: node.y, dir: Direction.Right })
    }
    if (node.y - 1 >= 0 && grid[node.y - 1][node.x] != Space.Wall) {
        ret.push({ x: node.x, y: node.y - 1, dir: Direction.Up })
    }
    if (node.y + 1 < grid.length && grid[node.y + 1][node.x] != Space.Wall) {
        ret.push({ x: node.x, y: node.y + 1, dir: Direction.Down })
    }
    return ret
}

type Solution = { path: Array<PathStep>; cost: number }

const astar = (start: PathStep, end: Pair, grid: Array<Array<Space>>): Solution => {
    const openList: Array<PathStep> = []
    const closedList: Array<PathStep> = []
    const bestCostsSoFar: Map<string, number> = new Map()
    const guessedCosts: Map<string, number> = new Map()
    const parents: Map<string, PathStep> = new Map()

    // initial state
    openList.push(start)
    bestCostsSoFar.set(JSON.stringify(start), 0)

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            for (const dir of [Direction.Up, Direction.Down, Direction.Left, Direction.Right]) {
                const key = JSON.stringify({ x, y, dir })
                guessedCosts.set(key, heuristic({ x, y }, end))
            }
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

        // got to the end
        if (currentNode.x == end.x && currentNode.y == end.y) {
            let curr = currentNode
            const ret: Array<PathStep> = []
            while (parents.get(JSON.stringify(curr))) {
                ret.push(curr)
                curr = parents.get(JSON.stringify(curr))!
            }
            return { path: ret.reverse(), cost: bestCostsSoFar.get(JSON.stringify(currentNode))! }
        }

        // check all neighbors
        const indexOfCurrent = openList.findIndex((p) => equal(p, currentNode))
        openList.splice(indexOfCurrent, 1)
        closedList.push(currentNode)
        const adjacentList = neighbors(currentNode, grid)

        adjacentList.forEach((neighbor) => {
            const neighborKey = JSON.stringify(neighbor)

            if (closedList.findIndex((p) => equal(p, neighbor)) != -1) {
                // not a valid node to process, skip to next neighbor
                return
            }

            // compute score to this node
            const penalty =
                currentNode.dir === Direction.Up
                    ? neighbor.dir === Direction.Down
                        ? 2000
                        : neighbor.dir === Direction.Up
                          ? 0
                          : 1000
                    : currentNode.dir === Direction.Down
                      ? neighbor.dir === Direction.Up
                          ? 2000
                          : neighbor.dir === Direction.Down
                            ? 0
                            : 1000
                      : currentNode.dir === Direction.Left
                        ? neighbor.dir === Direction.Right
                            ? 2000
                            : neighbor.dir === Direction.Left
                              ? 0
                              : 1000
                        : currentNode.dir === Direction.Right
                          ? neighbor.dir === Direction.Left
                              ? 2000
                              : neighbor.dir === Direction.Right
                                ? 0
                                : 1000
                          : Infinity
            const gScore = bestCostsSoFar.get(JSON.stringify(currentNode))! + 1 + penalty
            let gScoreBest = false

            if (openList.findIndex((p) => equal(p, neighbor)) === -1) {
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
    return { path: [], cost: Infinity }
}

const startY = maze.findIndex((row) => row.includes(Space.Start))
const startX = maze[startY].findIndex((space) => space === Space.Start)

const endY = maze.findIndex((row) => row.includes(Space.End))
const endX = maze[endY].findIndex((space) => space === Space.End)
console.log(startX, startY)
console.log(maze[0].length, maze.length)

const cheapest = astar({ x: startX, y: startY, dir: Direction.Right }, { x: endX, y: endY }, maze)

console.log(cheapest)

// part 2
