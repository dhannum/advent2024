import * as fs from 'fs'

const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

interface Pair {
    x: number
    y: number
}

let start: Pair = { x: 0, y: 0 }
let end: Pair = { x: 0, y: 0 }

const maze: Array<Array<boolean>> = []

lines.forEach((line, y) => {
    const row: Array<boolean> = []
    line.split('').forEach((char, x) => {
        switch (char) {
            case '.':
                row.push(false)
                break
            case '#':
                row.push(true)
                break
            case 'S':
                row.push(false)
                start = { x, y }
                break
            case 'E':
                row.push(false)
                end = { x, y }
                break
        }
    })
    maze.push(row)
})

const heuristic = (a: Pair, b: Pair) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)

const neighbors = (node: Pair, grid: Array<Array<boolean>>) => {
    const ret: Array<Pair> = []

    if (node.x - 1 >= 0 && !grid[node.y][node.x - 1]) {
        ret.push({ x: node.x - 1, y: node.y })
    }
    if (node.x + 1 < grid[0].length && !grid[node.y][node.x + 1]) {
        ret.push({ x: node.x + 1, y: node.y })
    }
    if (node.y - 1 >= 0 && !grid[node.y - 1][node.x]) {
        ret.push({ x: node.x, y: node.y - 1 })
    }
    if (node.y + 1 < grid.length && !grid[node.y + 1][node.x]) {
        ret.push({ x: node.x, y: node.y + 1 })
    }
    return ret
}

const astar = (start: Pair, end: Pair, grid: Array<Array<boolean>>) => {
    const openList: Array<Pair> = []
    const closedList: Array<Pair> = []
    const bestCostsSoFar: Map<string, number> = new Map()
    const parents: Map<string, Pair> = new Map()

    // initial state
    openList.push(start)
    bestCostsSoFar.set(JSON.stringify(start), 0)

    // loop through all spaces that have yet to be visited
    while (openList.length > 0) {
        // Grab the lowest f(x) to process next
        const costs = openList.map((p) => {
            const key = JSON.stringify(p)
            return heuristic(p, end) + bestCostsSoFar.get(key)!
        })
        const currentNode = openList[costs.indexOf(Math.min(...costs))]

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

const solution = astar(start, end, maze)

// we need the start point on the path and our algorithm doesn't include it
solution.unshift(start)

console.log(solution.length)

// deltas for all possible cheats relative to a point in the path
const cheatDeltas: Array<Pair> = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
]

const generateCheatMaps = (maze: Array<Array<boolean>>, step: Pair) => {
    const ret: Array<Array<Array<boolean>>> = []

    cheatDeltas.forEach((delta) => {
        // check that this cheat delta is a wall and is within the bounds of the maze
        if (step.y + delta.y < 1 || step.y + delta.y >= maze.length - 1) {
            return
        }
        if (step.x + delta.x < 1 || step.x + delta.x >= maze[0].length - 1) {
            return
        }
        if (!maze[step.y + delta.y][step.x + delta.x]) {
            return
        }

        // if we get here, then we can cheat so make a new maze with the wall blasted out
        const newMaze = maze.map((row) => row.map((space) => space))
        newMaze[step.y + delta.y][step.x + delta.x] = false

        ret.push(newMaze)
    })

    return ret
}

const shortcuts: Map<number, number> = new Map()

solution.forEach((step, i) => {
    console.log(`step ${i}`)

    // the cost from here if we don't cheat
    const notCheatingCost = solution.length - i - 1

    const newMazes = generateCheatMaps(maze, step)

    newMazes.forEach((newMaze) => {
        // compute a new route from here to the finish, with the new cheat maze and see how much faster it is
        const cheatSolution = astar(step, end, newMaze)
        if (cheatSolution.length < notCheatingCost) {
            const key = notCheatingCost - cheatSolution.length
            const oldVal = shortcuts.get(key)
            if (oldVal === undefined) {
                shortcuts.set(key, 1)
            } else {
                shortcuts.set(key, oldVal + 1)
            }
        }
    })
})

console.log(shortcuts)

const over100 = Array.from(shortcuts.entries())
    .filter(([k, v]) => k >= 100)
    .map(([k, v]) => v)
    .reduce((a, b) => a + b, 0)

console.log(over100)