import * as fs from 'fs'

const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n')

const realLines = lines.filter((line) => line.trim().length > 0)

interface Location {
    x: number
    y: number
}

const startLocation = realLines[0].indexOf('S')
const splitterLocations: Location[] = realLines.flatMap((line, y) => {
    const indices = new Array<number>()
    for (let x = 0; x < line.length; x++) {
        if (line[x] === '^') indices.push(x)
    }
    return indices.map((i) => ({ x: i, y }))
})

let totalSplits = 0
let beams = new Array<Location>({ x: startLocation, y: 0 })

for (let row = 0; row < splitterLocations.length; row++) {
    const splitterIndexesInThisRow = splitterLocations.filter((s) => s.y === row).map((s) => s.x)

    if (splitterIndexesInThisRow.length > 0) {
        const newBeamList = beams.flatMap((beam) => {
            if (beam.y === row && splitterIndexesInThisRow.includes(beam.x)) {
                // this beam is splitting. Create two more on this row. We will consolidate later
                totalSplits++
                return [
                    { x: beam.x - 1, y: beam.y },
                    { x: beam.x + 1, y: beam.y },
                ]
            } else {
                // this beam is not splitting. Keep it
                return [beam]
            }
        })

        // consolidate duplicate beams
        const uniqueBeams = new Array<Location>()
        for (const beam of newBeamList) {
            if (!uniqueBeams.some((b) => b.x === beam.x && b.y === beam.y)) {
                uniqueBeams.push(beam)
            }
        }

        beams = uniqueBeams
    }

    // move them all down one row
    beams = beams.map((beam) => {
        return { x: beam.x, y: beam.y + 1 }
    })
}

console.log(totalSplits)

const memoizedBeams = new Map<string, number>()
const lastRow = splitterLocations.sort((a, b) => (a.y <= b.y ? 1 : -1))[0].y

const stringifyLoc = (location: Location) => {
    return JSON.stringify(location)
}

const getAllPaths = (countSoFar: number, beamLocation: Location): number => {
    const splitterIndexesHit = splitterLocations
        .filter((s) => s.y === beamLocation.y && s.x === beamLocation.x)
        .map((s) => s.x)

    if (splitterIndexesHit.length > 0) {
        let left: number
        let right: number

        const cachedLeft = memoizedBeams.get(
            stringifyLoc({ x: beamLocation.x - 1, y: beamLocation.y }),
        )
        const cachedRight = memoizedBeams.get(
            stringifyLoc({ x: beamLocation.x + 1, y: beamLocation.y }),
        )

        if (cachedLeft) {
            left = cachedLeft
        } else {
            left = getAllPaths(countSoFar, { x: beamLocation.x - 1, y: beamLocation.y })
            memoizedBeams.set(stringifyLoc({ x: beamLocation.x - 1, y: beamLocation.y }), left)
        }

        if (cachedRight) {
            right = cachedRight
        } else {
            right = getAllPaths(countSoFar, { x: beamLocation.x + 1, y: beamLocation.y })
            memoizedBeams.set(stringifyLoc({ x: beamLocation.x + 1, y: beamLocation.y }), right)
        }

        return left + right
    } else {
        const nextSplitterRow = splitterLocations
            .filter((s) => s.x === beamLocation.x && s.y >= beamLocation.y)
            .map((s) => s.y)
            .sort((x, y) => (x < y ? -1 : 1))[0]

        if (beamLocation.y < lastRow && nextSplitterRow) {
            // skip until we find the next splitter down in the same column
            return getAllPaths(countSoFar, { x: beamLocation.x, y: nextSplitterRow })
        } else return countSoFar + 1
    }
}

const allPaths = getAllPaths(0, { x: startLocation, y: 0 })
console.log(allPaths)
