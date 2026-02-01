import * as fs from 'fs'
import { printGrid } from '../../util/util'

const rawFile = fs.readFileSync('input.txt', 'utf8')

const lines = rawFile.split('\n').filter((line) => line.trim().length > 0)

type Square = '.' | '@'

type Board = Square[][]

type Location = { x: number; y: number }

const startingBoard: Board = lines.map((line) => line.split('').map((square) => square as Square))

const countPaperAround = (board: Board, x: number, y: number): number => {
    return (
        (y > 0 && x > 0 && board[y - 1][x - 1] === '@' ? 1 : 0) +
        (y > 0 && board[y - 1][x] === '@' ? 1 : 0) +
        (y > 0 && x < board[y - 1].length - 1 && board[y - 1][x + 1] === '@' ? 1 : 0) +
        (x > 0 && board[y][x - 1] === '@' ? 1 : 0) +
        (x < board[y].length - 1 && board[y][x + 1] === '@' ? 1 : 0) +
        (y < board.length - 1 && x > 0 && board[y + 1][x - 1] === '@' ? 1 : 0) +
        (y < board.length - 1 && board[y + 1][x] === '@' ? 1 : 0) +
        (y < board.length - 1 && x < board[y + 1].length - 1 && board[y + 1][x + 1] === '@' ? 1 : 0)
    )
}

const computeReachabilityAndRemove = (board: Board): [Board, number] => {
    const reachable = board.map((row, y) =>
        row.map((square: Square, x) => square == '@' && countPaperAround(board, x, y) < 4),
    )

    const totalReachable = reachable.reduce(
        (acc, row) => acc + row.reduce((acc, cell: boolean) => acc + (cell ? 1 : 0), 0),
        0,
    )

    const reachableLocations: Array<Location> = reachable.flatMap((row, y) =>
        row.flatMap((reachable, x): Array<Location> => (reachable ? [{ x, y }] : [])),
    )

    const newBoard: Board = board.map((row, y) =>
        row.map(
            (square, x): Square =>
                square == '.'
                    ? '.'
                    : square == '@' &&
                        reachableLocations.findIndex((loc) => loc.x === x && loc.y === y) != -1
                      ? '.'
                      : '@',
        ),
    )

    return [newBoard, totalReachable]
}

let currentBoard = startingBoard
let totalReachable = 0

console.log('starting board:')
printGrid(currentBoard)

for (let i = 0; i < 10000; i++) {
    const [newBoard, reachable] = computeReachabilityAndRemove(currentBoard)

    totalReachable += reachable
    currentBoard = newBoard

    console.log(`After ${i} steps: ${reachable} this round: ${totalReachable} reachable in all`)
    // console.log('new board:')
    // printGrid(currentBoard)

    if (reachable == 0) break
}

console.log(totalReachable)
