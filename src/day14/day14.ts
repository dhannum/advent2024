import * as fs from 'fs'

const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

interface Pair {
    x: number
    y: number
}

interface Robot {
    loc: Pair
    v: Pair
}

const robots = lines.map((line) => {
    const parsed = /p=([\d-]+),([\d-]+) v=([\d-]+),([\d-]+)/.exec(line)!
    return {
        loc: { x: parseInt(parsed[1]), y: parseInt(parsed[2]) },
        v: { x: parseInt(parsed[3]), y: parseInt(parsed[4]) },
    } as Robot
})

const xLimit = 101
const yLimit = 103
// const xLimit = 11
// const yLimit = 7

const moveRobot = (robot: Robot) => {
    return {
        loc: {
            x: (robot.loc.x + robot.v.x + xLimit) % xLimit,
            y: (robot.loc.y + robot.v.y + yLimit) % yLimit,
        },
        v: { x: robot.v.x, y: robot.v.y },
    } as Robot
}

let iterativeRobots = robots

const checkChristmasTree = (robots: Robot[]) => {
    for (const robot of robots) {
        if (
            robots.findIndex((r) => r.loc.x === robot.loc.x - 1 && r.loc.y === robot.loc.y + 1) !==
                -1 &&
            robots.findIndex((r) => r.loc.x === robot.loc.x && r.loc.y === robot.loc.y + 1) !==
                -1 &&
            robots.findIndex((r) => r.loc.x === robot.loc.x + 1 && r.loc.y === robot.loc.y + 1) !==
                -1 &&
            robots.findIndex((r) => r.loc.x === robot.loc.x - 2 && r.loc.y === robot.loc.y + 2) !==
                -1 &&
            robots.findIndex((r) => r.loc.x === robot.loc.x - 1 && r.loc.y === robot.loc.y + 2) !==
                -1 &&
            robots.findIndex((r) => r.loc.x === robot.loc.x && r.loc.y === robot.loc.y + 2) !==
                -1 &&
            robots.findIndex((r) => r.loc.x === robot.loc.x + 1 && r.loc.y === robot.loc.y + 2) !==
                -1 &&
            robots.findIndex((r) => r.loc.x === robot.loc.x + 2 && r.loc.y === robot.loc.y + 2) !==
                -1
        )
            return true
    }

    return false
}

const computeSafetyScore = (robotList: Array<Robot>) => {
    let topLeft = 0
    let topRight = 0
    let bottomLeft = 0
    let bottomRight = 0

    const middleX = Math.floor(xLimit / 2)
    const middleY = Math.floor(yLimit / 2)

    robotList.forEach((robot) => {
        if (robot.loc.x < middleX && robot.loc.y < middleY) topLeft++
        else if (robot.loc.x > middleX && robot.loc.y < middleY) topRight++
        else if (robot.loc.x < middleX && robot.loc.y > middleY) bottomLeft++
        else if (robot.loc.x > middleX && robot.loc.y > middleY) bottomRight++
    })

    return topLeft * bottomLeft * topRight * bottomRight
}

for (let x = 1; x <= 10000; x++) {
    iterativeRobots = iterativeRobots.map(moveRobot)
    if (x === 100) console.log(`Safety score is ${computeSafetyScore(iterativeRobots)}`)
    if (checkChristmasTree(iterativeRobots)) console.log(`Christmas tree found after ${x} seconds`)
}
