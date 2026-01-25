import * as fs from 'fs'

const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

enum Space {
    Empty,
    Wall,
    Box,
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

const robotStart: Pair = { x: 0, y: 0 }
let robotLoc = robotStart
const warehouse: Array<Array<Space>> = []
const moves: Array<Direction> = []

for (let y = 0; y < lines.length; y++) {
    const line = lines[y]

    if (line.includes('#')) {
        const row: Array<Space> = []
        line.split('').forEach((c, x) => {
            row.push(c === '#' ? Space.Wall : c === 'O' ? Space.Box : Space.Empty)
            if (c === '@') robotLoc = { x, y }
        })
        warehouse.push(row)
    } else {
        line.split('').forEach((c) =>
            moves.push(
                c === '^'
                    ? Direction.Up
                    : c === 'v'
                      ? Direction.Down
                      : c === '<'
                        ? Direction.Left
                        : Direction.Right,
            ),
        )
    }
}

// part 1

const tryMoveBox = (delta: Pair, boxLoc: Pair, warehouse: Array<Array<Space>>): boolean => {
    if (warehouse[boxLoc.y + delta.y][boxLoc.x + delta.x] === Space.Empty) {
        warehouse[boxLoc.y + delta.y][boxLoc.x + delta.x] = Space.Box
        warehouse[boxLoc.y][boxLoc.x] = Space.Empty
        return true
    } else if (warehouse[boxLoc.y + delta.y][boxLoc.x + delta.x] === Space.Box) {
        const didItMove = tryMoveBox(
            delta,
            { x: boxLoc.x + delta.x, y: boxLoc.y + delta.y },
            warehouse,
        )
        if (didItMove) {
            warehouse[boxLoc.y + delta.y][boxLoc.x + delta.x] = Space.Box
            warehouse[boxLoc.y][boxLoc.x] = Space.Empty
        }
        return didItMove
    } else {
        return false
    }
}

const moveOneSpot = (delta: Pair, robot: Pair, warehouse: Array<Array<Space>>) => {
    if (warehouse[robot.y + delta.y][robot.x + delta.x] === Space.Empty) {
        robot.x = robot.x + delta.x
        robot.y = robot.y + delta.y
    } else if (warehouse[robot.y + delta.y][robot.x + delta.x] === Space.Box) {
        const didItMove = tryMoveBox(
            delta,
            { x: robot.x + delta.x, y: robot.y + delta.y },
            warehouse,
        )
        if (didItMove) {
            robot.x = robot.x + delta.x
            robot.y = robot.y + delta.y
        }
    }
}

moves.forEach((move) => {
    if (move === Direction.Up) {
        moveOneSpot({ x: 0, y: -1 }, robotLoc, warehouse)
    } else if (move === Direction.Down) {
        moveOneSpot({ x: 0, y: 1 }, robotLoc, warehouse)
    } else if (move === Direction.Left) {
        moveOneSpot({ x: -1, y: 0 }, robotLoc, warehouse)
    } else if (move === Direction.Right) {
        moveOneSpot({ x: 1, y: 0 }, robotLoc, warehouse)
    }
})

const coords = warehouse.map((row, y) =>
    row.map((space, x) => (space === Space.Box ? 100 * y + x : 0)),
)

const total = coords.reduce((acc, row) => acc + row.reduce((acc2, space) => acc2 + space, 0), 0)

console.log(total)

// part 2

enum Space2 {
    Empty,
    Wall,
    BoxLeft,
    BoxRight,
}

// rebuild new wider warehouse
const wideWarehouse: Array<Array<Space2>> = []
for (let y = 0; y < lines.length; y++) {
    const line = lines[y]

    if (line.includes('v')) break

    const row: Array<Space2> = []
    line.split('').forEach((c) => {
        row.push(
            ...(c === '.' || c === '@'
                ? [Space2.Empty, Space2.Empty]
                : c === '#'
                  ? [Space2.Wall, Space2.Wall]
                  : [Space2.BoxLeft, Space2.BoxRight]),
        )
    })
    wideWarehouse.push(row)

    if (line.includes('@')) {
        robotLoc = { x: line.split('').indexOf('@') * 2, y }
    }
}

const printWarehouse = (warehouse: Array<Array<Space2>>, robotLoc: Pair) => {
    warehouse.forEach((row, y) => {
        console.log(
            row
                .map((s, x) =>
                    x === robotLoc.x && y === robotLoc.y
                        ? '@'
                        : s === Space2.Empty
                          ? '.'
                          : s === Space2.Wall
                            ? '#'
                            : s === Space2.BoxLeft
                              ? '['
                              : ']',
                )
                .join(''),
        )
    })
}

// boxLoc is always the left part of the box
const tryMoveBoxWide = (delta: Pair, boxLoc: Pair, warehouse: Array<Array<Space2>>): boolean => {
    // up or down
    if (delta.x === 0) {
        if (
            warehouse[boxLoc.y + delta.y][boxLoc.x] === Space2.Wall ||
            warehouse[boxLoc.y + delta.y][boxLoc.x + 1] === Space2.Wall
        ) {
            // either one in our way is a wall. Stop
            return false
        } else if (
            warehouse[boxLoc.y + delta.y][boxLoc.x] === Space2.Empty &&
            warehouse[boxLoc.y + delta.y][boxLoc.x + 1] === Space2.Empty
        ) {
            // two empty spaces in our way, so move the whole box up/down
            warehouse[boxLoc.y + delta.y][boxLoc.x] = Space2.BoxLeft
            warehouse[boxLoc.y + delta.y][boxLoc.x + 1] = Space2.BoxRight
            warehouse[boxLoc.y][boxLoc.x] = Space2.Empty
            warehouse[boxLoc.y][boxLoc.x + 1] = Space2.Empty
            return true
        } else if (
            warehouse[boxLoc.y + delta.y][boxLoc.x] === Space2.BoxLeft &&
            warehouse[boxLoc.y + delta.y][boxLoc.x + 1] === Space2.BoxRight
        ) {
            // another box directly up/down from us, aligned, try to move the single box
            // []
            // [] <-- us
            const didItMove = tryMoveBoxWide(
                delta,
                { x: boxLoc.x + delta.x, y: boxLoc.y + delta.y },
                warehouse,
            )
            if (didItMove) {
                warehouse[boxLoc.y + delta.y][boxLoc.x] = Space2.BoxLeft
                warehouse[boxLoc.y + delta.y][boxLoc.x + 1] = Space2.BoxRight
                warehouse[boxLoc.y][boxLoc.x] = Space2.Empty
                warehouse[boxLoc.y][boxLoc.x + 1] = Space2.Empty
            }
            return didItMove
        } else if (
            warehouse[boxLoc.y + delta.y][boxLoc.x] === Space2.BoxRight &&
            warehouse[boxLoc.y + delta.y][boxLoc.x + 1] === Space2.Empty
        ) {
            // A box above/below us but skewed one to the left
            // [].
            // .[] <-- us
            const didItMove = tryMoveBoxWide(
                delta,
                { x: boxLoc.x + delta.x - 1, y: boxLoc.y + delta.y },
                warehouse,
            )
            if (didItMove) {
                warehouse[boxLoc.y + delta.y][boxLoc.x] = Space2.BoxLeft
                warehouse[boxLoc.y + delta.y][boxLoc.x + 1] = Space2.BoxRight
                warehouse[boxLoc.y][boxLoc.x] = Space2.Empty
                warehouse[boxLoc.y][boxLoc.x + 1] = Space2.Empty
            }
            return didItMove
        } else if (
            warehouse[boxLoc.y + delta.y][boxLoc.x] === Space2.Empty &&
            warehouse[boxLoc.y + delta.y][boxLoc.x + 1] === Space2.BoxLeft
        ) {
            // A box above/below us but skewed one to the right
            // .[]
            // []. <-- us
            const didItMove = tryMoveBoxWide(
                delta,
                { x: boxLoc.x + delta.x + 1, y: boxLoc.y + delta.y },
                warehouse,
            )
            if (didItMove) {
                warehouse[boxLoc.y + delta.y][boxLoc.x] = Space2.BoxLeft
                warehouse[boxLoc.y + delta.y][boxLoc.x + 1] = Space2.BoxRight
                warehouse[boxLoc.y][boxLoc.x] = Space2.Empty
                warehouse[boxLoc.y][boxLoc.x + 1] = Space2.Empty
            }
            return didItMove
        } else if (
            warehouse[boxLoc.y + delta.y][boxLoc.x] === Space2.BoxRight &&
            warehouse[boxLoc.y + delta.y][boxLoc.x + 1] === Space2.BoxLeft
        ) {
            // Two boxes above us, have to be able to move both
            // [][]
            // .[]. <-- us
            const didItMove1 = tryMoveBoxWide(
                delta,
                { x: boxLoc.x + delta.x - 1, y: boxLoc.y + delta.y },
                warehouse,
            )
            const didItMove2 = tryMoveBoxWide(
                delta,
                { x: boxLoc.x + delta.x + 1, y: boxLoc.y + delta.y },
                warehouse,
            )
            if (didItMove1 && didItMove2) {
                warehouse[boxLoc.y + delta.y][boxLoc.x] = Space2.BoxLeft
                warehouse[boxLoc.y + delta.y][boxLoc.x + 1] = Space2.BoxRight
                warehouse[boxLoc.y][boxLoc.x] = Space2.Empty
                warehouse[boxLoc.y][boxLoc.x + 1] = Space2.Empty
            }
            return didItMove1 && didItMove2
        } else {
            throw new Error()
        }
    } else if (delta.x == 1) {
        // right
        if (warehouse[boxLoc.y][boxLoc.x + delta.x + 1] === Space2.Wall) {
            // Wall. Stop
            return false
        } else if (warehouse[boxLoc.y][boxLoc.x + delta.x + 1] === Space2.Empty) {
            // empty space
            warehouse[boxLoc.y][boxLoc.x + 2] = Space2.BoxLeft
            warehouse[boxLoc.y][boxLoc.x + 3] = Space2.BoxRight
            warehouse[boxLoc.y][boxLoc.x + 1] = Space2.Empty
            warehouse[boxLoc.y][boxLoc.x] = Space2.Empty
            return true
        } else if (warehouse[boxLoc.y][boxLoc.x + delta.x + 1] === Space2.BoxLeft) {
            // we are moving right and there's a box in the way
            const didItMove = tryMoveBoxWide(
                delta,
                { x: boxLoc.x + delta.x + 1, y: boxLoc.y + delta.y },
                warehouse,
            )
            if (didItMove) {
                warehouse[boxLoc.y][boxLoc.x + 2] = Space2.BoxLeft
                warehouse[boxLoc.y][boxLoc.x + 3] = Space2.BoxRight
                warehouse[boxLoc.y][boxLoc.x + 1] = Space2.Empty
                warehouse[boxLoc.y][boxLoc.x] = Space2.Empty
            }
            return didItMove
        } else {
            throw new Error()
        }
    } else if (delta.x == -1) {
        // left
        if (warehouse[boxLoc.y][boxLoc.x + delta.x] === Space2.Wall) {
            // Wall. Stop
            return false
        } else if (warehouse[boxLoc.y][boxLoc.x + delta.x] === Space2.Empty) {
            // empty space
            warehouse[boxLoc.y][boxLoc.x - 2] = Space2.BoxLeft
            warehouse[boxLoc.y][boxLoc.x - 1] = Space2.BoxRight
            warehouse[boxLoc.y][boxLoc.x] = Space2.Empty
            warehouse[boxLoc.y][boxLoc.x + 1] = Space2.Empty
            return true
        } else if (warehouse[boxLoc.y][boxLoc.x + delta.x] === Space2.BoxRight) {
            // we are moving left and there's a box in the way
            const didItMove = tryMoveBoxWide(
                delta,
                { x: boxLoc.x + delta.x - 1, y: boxLoc.y + delta.y },
                warehouse,
            )
            if (didItMove) {
                warehouse[boxLoc.y][boxLoc.x - 2] = Space2.BoxLeft
                warehouse[boxLoc.y][boxLoc.x - 1] = Space2.BoxRight
                warehouse[boxLoc.y][boxLoc.x] = Space2.Empty
                warehouse[boxLoc.y][boxLoc.x + 1] = Space2.Empty
            }
            return didItMove
        } else {
            throw new Error()
        }
    } else {
        throw new Error()
    }
}

const moveOneSpotWide = (delta: Pair, robot: Pair, warehouse: Array<Array<Space2>>) => {
    // up or down
    if (delta.x === 0) {
        if (warehouse[robot.y + delta.y][robot.x] === Space2.Empty) {
            robot.x = robot.x + delta.x
            robot.y = robot.y + delta.y
        } else if (warehouse[robot.y + delta.y][robot.x] === Space2.BoxLeft) {
            const didItMove = tryMoveBoxWide(
                delta,
                { x: robot.x + delta.x, y: robot.y + delta.y },
                warehouse,
            )
            if (didItMove) {
                robot.x = robot.x + delta.x
                robot.y = robot.y + delta.y
            }
        } else if (warehouse[robot.y + delta.y][robot.x] === Space2.BoxRight) {
            const didItMove = tryMoveBoxWide(
                delta,
                { x: robot.x + delta.x - 1, y: robot.y + delta.y },
                warehouse,
            )
            if (didItMove) {
                robot.x = robot.x + delta.x
                robot.y = robot.y + delta.y
            }
        }
    } else {
        // left or right
        if (warehouse[robot.y][robot.x + delta.x] === Space2.Empty &&
            warehouse[robot.y][robot.x + delta.x * 2] === Space2.Empty) {
            robot.x = robot.x + delta.x * 2
            robot.y = robot.y + delta.y
        } else if (warehouse[robot.y][robot.x + delta.x] === Space2.BoxLeft) {
            const didItMove = tryMoveBoxWide(
                delta,
                { x: robot.x + delta.x, y: robot.y + delta.y },
                warehouse,
            )
            if (didItMove) {
                robot.x = robot.x + delta.x * 2
                robot.y = robot.y + delta.y
            }
        } else if (warehouse[robot.y][robot.x + delta.x] === Space2.BoxRight) {
            const didItMove = tryMoveBoxWide(
                delta,
                { x: robot.x + delta.x - 1, y: robot.y + delta.y },
                warehouse,
            )
            if (didItMove) {
                robot.x = robot.x + delta.x * 2
                robot.y = robot.y + delta.y
            }
        }
    }
}

console.log(`Start. Robot at ${robotLoc.x}, ${robotLoc.y}`)
printWarehouse(wideWarehouse, robotLoc)

moves.forEach((move, i) => {
    if (move === Direction.Up) {
        moveOneSpotWide({ x: 0, y: -1 }, robotLoc, wideWarehouse)
    } else if (move === Direction.Down) {
        moveOneSpotWide({ x: 0, y: 1 }, robotLoc, wideWarehouse)
    } else if (move === Direction.Left) {
        moveOneSpotWide({ x: -1, y: 0 }, robotLoc, wideWarehouse)
    } else if (move === Direction.Right) {
        moveOneSpotWide({ x: 1, y: 0 }, robotLoc, wideWarehouse)
    }
    // if (i >= 8)
    //     console.log(`check`)
    // console.log(
    //     `After move ${move === Direction.Up ? '^' : move === Direction.Down ? 'v' : move === Direction.Left ? '<' : '>'} with robot at ${robotLoc.x}, ${robotLoc.y}`,
    // )
    // printWarehouse(wideWarehouse, robotLoc)
})

printWarehouse(wideWarehouse, robotLoc)
const coordsWide = wideWarehouse.map((row, y) =>
    row.map((space, x) => (space === Space2.BoxLeft ? 100 * y + x : 0)),
)

const totalWide = coordsWide.reduce(
    (acc, row) => acc + row.reduce((acc2, space) => acc2 + space, 0),
    0,
)

console.log(totalWide)
