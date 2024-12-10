import * as fs from 'fs'
import { isEqual, toWindows } from '../util/util'
const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n')

const reports = lines
    .filter((line) => !!line)
    .map((line) => line.split(' ').map((v) => parseInt(v)))

const isSafe = (report: number[]) => {
    const sortedUp = report.toSorted((a, b) => a - b)
    const sortedDown = report.toSorted((a, b) => b - a)

    if (!isEqual(sortedUp, report) && !isEqual(sortedDown, report)) {
        return false
    }

    const windows = toWindows(report, 2)

    const goodWindows = windows.filter((window) => {
        const diff = Math.abs(window[0] - window[1])
        return diff >= 1 && diff <= 3
    })

    return goodWindows.length == windows.length
}

const safeReports = reports.filter(isSafe)

console.log(safeReports.length)

const isSafeWithDampener = (report: number[]) => {
    if (isSafe(report)) return true

    for (let i = 0; i < report.length; i++) {
        const spliced = report.toSpliced(i, 1)
        if (isSafe(spliced)) return true
    }

    return false
}

const safeReportsWithDampener = reports.filter(isSafeWithDampener)

console.log(safeReportsWithDampener.length)
