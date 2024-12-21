const fs = require('fs')

const rawFile = fs.readFileSync('input.txt', 'utf8')

const map = rawFile.trim().split('\n').map(row => row.split(''))


const directions = { 'v': [1, 0], '^': [-1, 0], '>': [0, 1], '<': [0, -1] }

function findOnMap(map, needle) {
    let x, y
    for (let i = 0; i < map.length; i++) {
        y = map[i].indexOf(needle)
        if (y > -1) {
            x = i
            break
        }
    }
    return [x, y]
}

function foundPath() {
    const visited = {}
    let paths = []
    const start = findOnMap(map, 'S')
    const end = findOnMap(map, 'E')
    let minCost = Infinity

    const chekPoints = []
    const first = {
        x: start[0],
        y: start[1],
        cost: 0,
        path: [],
        direction: '>',
    }
    chekPoints.push(first)
    let i = 1
    while (chekPoints.length) {

        const current = chekPoints.shift()
        const { x, y, direction } = current
        const key = `${x},${y},${direction}`
        current.path.push(key)

        if (current.x === end[0] && current.y === end[1]) {
            if (current.cost < minCost) {
                paths = [current.path]
                minCost = current.cost
            }
            if (current.cost === minCost) paths.push(current.path)
            continue
        }

        if (!(key in visited)) visited[key] = Infinity
        if (visited[key] < current.cost) continue
        visited[key] = current.cost
        if (current.cost > minCost) continue

        Object.entries(directions).forEach(([dname, [dx, dy]]) => {
            if (dname === '^' && direction === 'v') return
            if (dname === 'v' && direction === '^') return
            if (dname === '<' && direction === '>') return
            if (dname === '>' && direction === '<') return

            const nx = x + dx
            const ny = y + dy
            if (map[nx][ny] === '#') return
            const isTurn = dname !== direction
            chekPoints.push({
                x: nx,
                y: ny,
                cost: isTurn ? current.cost + 1001 : current.cost + 1,
                direction: dname,
                path: [...current.path],
            })

        })
    }
    return { paths, minCost }
}

const { minCost, paths } = foundPath()
console.log('part1 = ', minCost)

paths.forEach(path => {
    for (let i = path.length - 1; i >= 0; i--) {
        if (path[i] !== paths[0][i]) {
            console.log(`first failure at ${i}, ${path[i]}`)
            break
        }
    }
})

const temp = {}
paths.forEach(path => path.forEach((p) => {
    const parts = p.split(',')
    const newKey = parts.slice(0, 2).join(',')
    return temp [newKey] = 1
}))

console.log('part2 =', Object.keys(temp).length)


