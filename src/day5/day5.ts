import * as fs from 'fs'
const rawFile = fs.readFileSync('input.txt','utf8')

const lines = rawFile.split('\n').filter((line) => line.length > 0)

interface Rule {
    first: number
    second: number
}

// Read input

const rules: Array<Rule> = lines.filter((line) => line.includes('|')).map((line) => {
    const pair = line.split('|').map((num) => parseInt(num))
    return { first: pair[0], second: pair[1] }
})

const updates = lines.filter((line) => !line.includes('|')).map((line) => line.split(',').map((num) => parseInt(num)))

// check validity

const isUpdateValid = (update: Array<number>, rules: Array<Rule>) => {
    return rules.every((rule) => {
        if (update.indexOf(rule.first) === -1 || update.indexOf(rule.second) === -1) {
            return true
        } else {
            return update.indexOf(rule.first) < update.indexOf(rule.second)
        }
    })
}

const validUpdates = updates.filter((update) => isUpdateValid(update, rules))

// compute middle

const middle = (values: Array<number>) => {
    const half = Math.floor(values.length / 2)

    return values.length % 2
            ? values[half]
            : (values[half - 1] + values[half]) / 2
}

const summedMiddleValues = validUpdates.map((update) => middle(update)).reduce((acc, val) => acc + val, 0)

console.log(summedMiddleValues)

// part 2

// fix function that just swaps any that are wrong. Sometimes, multiple iterations are necessary
// I lack the algorithm skills to determine how many so we are brute forcing it
const fixUpdate = (update: Array<number>, rules: Array<Rule>) => {
    const TRIES = 5

    for (let i = 0; i < TRIES; i++) {
        rules.map((rule) => {
            if (update.indexOf(rule.first) !== -1 && update.indexOf(rule.second) !== -1 && update.indexOf(rule.first) > update.indexOf(rule.second)) {
                const first = update.indexOf(rule.first)
                const second = update.indexOf(rule.second)

                const temp = update[first]
                update[first] = update[second]
                update[second] = temp
            }
        })

        if (isUpdateValid(update, rules)) return
    }

    throw `${update} is still invalid after ${TRIES} fix iterations`
}

let invalidUpdates = updates.filter((update) => !isUpdateValid(update, rules))

// fix them in place
invalidUpdates.map((update) => fixUpdate(update, rules))

const summedMiddleValuesAfterFix = invalidUpdates.map((update) => middle(update)).reduce((acc, val) => acc + val, 0)

console.log(summedMiddleValuesAfterFix)