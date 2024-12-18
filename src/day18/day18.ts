import * as fs from 'fs'

const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

interface Pair {
    x: number
    y: number
}

const bytes = lines.map((line) => {
    const parsed = /(\d+),(\d+)/.exec(line)!
    return { x: parseInt(parsed[1]), y: parseInt(parsed[2]) } as Pair
})

const gridSize = 71

// true means wall, false means open
let grid: Array<Array<boolean>> = []
for (let i = 0; i < gridSize; i++) {
    grid.push(new Array<boolean>(gridSize).fill(false))
}

// part 1

for (let i = 0; i < 1024; i++) {
    const pair = bytes[i]
    grid[pair.y][pair.x] = true
}

const heuristic = (a: Pair, b: Pair) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)

const neighbors = (node: Pair, grid: Array<Array<boolean>>) => {
    const ret: Array<Pair> = []

    if (node.x - 1 >= 0 && !grid[node.y][node.x - 1]) {
        ret.push({ x: node.x - 1, y: node.y })
    }
    if (node.x + 1 < gridSize && !grid[node.y][node.x + 1]) {
        ret.push({ x: node.x + 1, y: node.y })
    }
    if (node.y - 1 >= 0 && !grid[node.y - 1][node.x]) {
        ret.push({ x: node.x, y: node.y - 1 })
    }
    if (node.y + 1 < gridSize && !grid[node.y + 1][node.x]) {
        ret.push({ x: node.x, y: node.y + 1 })
    }
    return ret
}

const astar = (start: Pair, end: Pair, grid: Array<Array<boolean>>) => {
    const openList: Array<Pair> = []
    const closedList: Array<Pair> = []
    const bestCostsSoFar: Map<string, number> = new Map()
    const guessedCosts: Map<string, number> = new Map()
    const parents: Map<string, Pair> = new Map()

    // initial state
    openList.push(start)
    bestCostsSoFar.set(JSON.stringify(start), 0)

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
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

    // No result was found -- empty array signifies failure to find path
    return []
}

console.log(astar({ x: 0, y: 0 }, { x: 70, y: 70 }, grid).length)

// part 2

// // make a new clean grid
grid = []
for (let i = 0; i < gridSize; i++) {
    grid.push(new Array<boolean>(gridSize).fill(false))
}

// put the first 1024 walls in
for (let i = 0; i < 1024; i++) {
    const pair = bytes[i]
    grid[pair.y][pair.x] = true
}

let shortestPath = astar({ x: 0, y: 0 }, { x: 70, y: 70 }, grid)

for (let i = 1024; i < bytes.length; i++) {
    grid[bytes[i].y][bytes[i].x] = true

    // find new path only if the block cuts our existing one
    if (shortestPath.findIndex((p) => p.x === bytes[i].x && p.y === bytes[i].y) !== -1) {
        shortestPath = astar({ x: 0, y: 0 }, { x: 70, y: 70 }, grid)
    }

    if (shortestPath.length > 0) {
        console.log(`after ${i} -- ${bytes[i].x}, ${bytes[i].y}: ${shortestPath.length}`)
    } else {
        console.log(`after ${i} -- ${bytes[i].x}, ${bytes[i].y}: no path`)
        break
    }
}
