import * as fs from 'fs'
import * as Process from "node:process";
const rawFile = fs.readFileSync('input.txt','utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

// setup

const charGrid = lines.map((line) => line.split(''))

enum Direction { NORTH, EAST, SOUTH, WEST }

interface Guard {
    x: number
    y: number
    direction: Direction
}

enum Space { EMPTY, WALL, ALREADY_BEEN}

enum MoveOutcome { WALL, OUTSIDE, NO_OBSTACLE }

class Room {
    grid: Array<Array<Space>>
    guard: Guard
    guardOut = false

    constructor(charGrid: Array<Array<string>>) {
        this.grid = charGrid.map((line) => line.map((char) => char === '#' ? Space.WALL : Space.EMPTY)),
        this.guard = {
            x: charGrid[charGrid.findIndex((line) => line.includes('^'))].findIndex((char) => char === '^'),
            y: charGrid.findIndex((line) => line.includes('^')),
            direction: Direction.NORTH
        }
    }

    // moves a guard a single space and returns the outcome
    moveGuardOneSpace() {
        switch (this.guard.direction) {
            case Direction.NORTH:
                if (!this.validCoords(this.guard.x, this.guard.y - 1))
                    return MoveOutcome.OUTSIDE
                else if (this.grid[this.guard.y - 1][this.guard.x] !== Space.WALL) {
                    this.guard.y--
                    this.grid[this.guard.y][this.guard.x] = Space.ALREADY_BEEN
                    return MoveOutcome.NO_OBSTACLE
                } else {
                    return MoveOutcome.WALL
                }
            case Direction.EAST:
                if (!this.validCoords(this.guard.x + 1, this.guard.y))
                    return MoveOutcome.OUTSIDE
                else if (this.grid[this.guard.y][this.guard.x + 1] !== Space.WALL) {
                    this.guard.x++
                    this.grid[this.guard.y][this.guard.x] = Space.ALREADY_BEEN
                    return MoveOutcome.NO_OBSTACLE
                } else {
                    return MoveOutcome.WALL
                }
            case Direction.SOUTH:
                if (!this.validCoords(this.guard.x, this.guard.y + 1))
                    return MoveOutcome.OUTSIDE
                else if (this.grid[this.guard.y + 1][this.guard.x] !== Space.WALL) {
                    this.guard.y++
                    this.grid[this.guard.y][this.guard.x] = Space.ALREADY_BEEN
                    return MoveOutcome.NO_OBSTACLE
                } else {
                    return MoveOutcome.WALL
                }
            case Direction.WEST:
                if (!this.validCoords(this.guard.x - 1, this.guard.y))
                    return MoveOutcome.OUTSIDE
                else if (this.grid[this.guard.y][this.guard.x - 1] !== Space.WALL) {
                    this.guard.x--
                    this.grid[this.guard.y][this.guard.x] = Space.ALREADY_BEEN
                    return MoveOutcome.NO_OBSTACLE
                } else {
                    return MoveOutcome.WALL
                }
        }
    }

    moveGuardUntilObstacle() {
        let lastResult: MoveOutcome
        while ((lastResult = this.moveGuardOneSpace()) === MoveOutcome.NO_OBSTACLE) {}

        if (lastResult === MoveOutcome.OUTSIDE) {
            this.guardOut = true
            return MoveOutcome.OUTSIDE
        } else {
            this.turnGuardRight()
            return MoveOutcome.WALL
        }
    }

    turnGuardRight() {
        this.guard.direction = (this.guard.direction + 1) % 4
    }

    countVisited() {
        return this.grid.reduce((acc, row) => acc + row.filter((space) => space === Space.ALREADY_BEEN).length, 0)
    }

    validCoords(x: number, y: number) {
        return x >= 0 && x < this.grid[0].length && y >= 0 && y < this.grid.length
    }
}

// part 1 4903

const room = new Room(charGrid)

while (!room.guardOut) {
    room.moveGuardUntilObstacle()
}

console.log(room.countVisited())

// part 2 - 1911

// if the last element in the list appears anywhere earlier, we have a cycle
const isCyclical = (guardHistory: Array<Guard>) => {
    return guardHistory.filter(guard =>
    {
        const last = guardHistory[guardHistory.length - 1]
        return guard.x === last.x && guard.y === last.y && guard.direction === last.direction
    }).length > 1
}

const isStuckInLoop = (room: Room) => {
    const guardHistory: Array<Guard> = []

    while (!room.guardOut && !isCyclical(guardHistory)) {
        room.moveGuardUntilObstacle()
        guardHistory.push({...room.guard})
    }

    return !room.guardOut
}

const roomList: Array<Room> = []

// generate the universe of possible modified rooms
for (let x = 0; x < charGrid[0].length; x++) {
    for (let y = 0; y < charGrid.length; y++) {
        const newCharGrid = structuredClone(charGrid)
        if (newCharGrid[y][x] === '.') {
            newCharGrid[y][x] = '#'
            roomList.push(new Room(newCharGrid))
        }
    }
}

let c = 0
const stuckRooms = roomList.filter(isStuckInLoop)

console.log(stuckRooms.length)