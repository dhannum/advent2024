import * as fs from 'fs'
import * as sea from "node:sea";

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

const getPenalty = (current: Direction, future: Direction) => {
    return current === Direction.Up
        ? future === Direction.Down
            ? 2000
            : future === Direction.Up
              ? 0
              : 1000
        : current === Direction.Down
          ? future === Direction.Up
              ? 2000
              : future === Direction.Down
                ? 0
                : 1000
          : current === Direction.Left
            ? future === Direction.Right
                ? 2000
                : future === Direction.Left
                  ? 0
                  : 1000
            : current === Direction.Right
              ? future === Direction.Left
                  ? 2000
                  : future === Direction.Right
                    ? 0
                    : 1000
              : Infinity
}

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

const printPath = (path: Array<PathStep>, grid: Array<Array<Space>>) => {
    grid.forEach((row, y) => {
        let rowStr = ''

        row.forEach((space, x) => {
            let char = ''
            switch (space) {
                case Space.Path:
                    char = '.'
                    break
                case Space.Wall:
                    char = '#'
                    break
                case Space.Start:
                    char = 'S'
                    break
                case Space.End:
                    char = 'E'
                    break
            }
            if (path.findIndex((step) => step.x === x && step.y === y) !== -1) {
                char = 'O'
            }
            rowStr += char
        })

        console.log(rowStr)
    })
}

const toKey = (pathStep: PathStep): string => {
    return pathStep === undefined
        ? 'undefined'
        : JSON.stringify({ x: pathStep.x, y: pathStep.y, dir: pathStep.dir })
}

type Solution = { paths: Array<Array<PathStep>>; cost: number }

const astar = (start: PathStep, end: Pair, grid: Array<Array<Space>>): Solution => {
    const openList: Array<PathStep> = []
    const bestCostsSoFar: Map<string, number> = new Map()
    const bestPathsSoFar: Map<string, Array<Array<PathStep>>> = new Map()

    // initial state
    openList.push(start)
    bestCostsSoFar.set(toKey(start), 0)
    bestPathsSoFar.set(toKey(start), [[start]])

    // return value
    const allBestPaths: Array<Array<PathStep>> = []
    let bestCostOverall = Infinity

    // loop through all spaces that have yet to be visited
    while (openList.length > 0) {
        // Grab the lowest f(x) to process next
        const costs = openList.map(
            (p) =>
                heuristic({ x: p.x, y: p.y }, { x: end.x, y: end.y }) +
                bestCostsSoFar.get(toKey(p))!,
        )
        const currentNode = openList[costs.indexOf(Math.min(...costs))]
        const currentPath = bestPathsSoFar.get(toKey(currentNode))![0]

        // remove from open list
        openList.splice(
            openList.findIndex((p) => equal(p, currentNode)),
            1,
        )

        // got to the end?
        if (currentNode.x == end.x && currentNode.y == end.y) {
            const solutionCost = bestCostsSoFar.get(toKey(currentNode))!
            if (solutionCost < bestCostOverall) {
                // this solution is better than any seen so far
                allBestPaths.length = 0
                allBestPaths.push(currentPath)
                bestCostOverall = solutionCost
            } else if (solutionCost === bestCostOverall) {
                // another optimal solution
                allBestPaths.push(currentPath)
            }
            continue
        }

        // check all neighbors
        const adjacentList = neighbors(currentNode, grid)

        adjacentList.forEach((neighbor) => {

            const neighborKey = toKey(neighbor)
            const penalty = getPenalty(currentNode.dir, neighbor.dir)

            // if this node is in the shortest path already, or if this is backtracking, skip
            if (currentPath.findIndex((p) => equal(p, neighbor)) != -1 || penalty === 2000) {
                // not a valid node to process, skip to next neighbor
                return
            }

            // compute score to this node
            const gScore = bestCostsSoFar.get(toKey(currentNode))! + 1 + penalty

            if (gScore > bestCostOverall) return

            if (!bestPathsSoFar.has(neighborKey)) {
                // we've never seen this node before
                bestPathsSoFar.set(neighborKey, [[...currentPath, neighbor]])
                bestCostsSoFar.set(neighborKey, gScore)
                openList.push(neighbor)
            } else if (gScore < bestCostsSoFar.get(neighborKey)!) {
                // This is a better path, clear previous paths and store the new best path
                bestPathsSoFar.set(neighborKey, [[...currentPath, neighbor]])
                bestCostsSoFar.set(neighborKey, gScore)
                openList.push(neighbor)
            } else if (gScore === bestCostsSoFar.get(neighborKey)!) {
                // This path has the same cost, add it as an alternative best path
                bestPathsSoFar.get(neighborKey)!.push([...currentPath, neighbor])
                openList.push(neighbor)
            }
        })
    }

    return { paths: allBestPaths, cost: bestCostOverall }
}

const startY = maze.findIndex((row) => row.includes(Space.Start))
const startX = maze[startY].findIndex((space) => space === Space.Start)

const endY = maze.findIndex((row) => row.includes(Space.End))
const endX = maze[endY].findIndex((space) => space === Space.End)
console.log(startX, startY)
console.log(endX, endY)

const solution = astar({ x: startX, y: startY, dir: Direction.Right }, { x: endX, y: endY }, maze)

console.log(solution.cost)

const seatSet = new Set(solution.paths.flatMap((path) => path.map((step) => ({ x: step.x, y: step.y }))))

console.log(seatSet.size)
