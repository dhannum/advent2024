import * as fs from 'fs'
const rawFile = fs.readFileSync('input.txt','utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

// setup

const buildDisk = (line: string) =>
    line.split('').reduce((acc, v, index) => {
        if (index % 2 == 0) {
            return acc.concat(Array(parseInt(v)).fill(index / 2))
        } else
            return acc.concat(Array(parseInt(v)).fill(undefined))
    }, Array<number>())

// part 1

let disk = buildDisk(lines[0])

const compact = (disk: Array<number>) => {
    let firstBlank = 0
    while((firstBlank = disk.findIndex((v) => v === undefined)) != -1) {
        let last: number
        while ((last = disk.pop()!) === undefined) {}
        disk[firstBlank] = last
    }
}

compact(disk)

const checksum = (disk: Array<number>) =>
  disk.reduce((acc, v, index) => v === undefined ? acc : acc + v * index, 0)

console.log(checksum(disk))

// part 2

// rebuild original disk
disk = buildDisk(lines[0])

const compactBetter = (disk: Array<number>) => {
    for (let i = disk.length - 1; i > 0; i--) {
        const thisIndexStartsNewFile = disk[i] !== undefined && disk[i - 1] !== disk[i]

        if (!thisIndexStartsNewFile) continue

        const nextDifferentIndex = disk.findIndex((v, idx) => idx > i && disk[idx] !== disk[i])
        const fileSize = (nextDifferentIndex === -1 ? disk.length : nextDifferentIndex) - i

        // now we have a file starting at i of length fileSize and we have to find where to put it

        // find first block of undefineds of length at least fileSize
        for (let j = 0; j < i; j++) {
            if (disk[j] === undefined) {
                if (disk.every((v, idx) => {
                    if (idx > j && idx <= j + fileSize - 1)
                        return v === undefined
                    else
                        return true
                })) {
                    // move the file back into the block starting at j
                    for (let k = 0; k < fileSize; k++) {
                        disk[j + k] = disk[i + k]
                        disk[i + k] = undefined as unknown as number
                    }

                    break
                }
            }
        }
    }
}

compactBetter(disk)

console.log(checksum(disk))