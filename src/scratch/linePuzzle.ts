/**
 * Represents a position in a 2D grid
 */
interface Position {
    row: number
    col: number
}

/**
 * Represents a line segment between two positions
 */
interface LineSegment {
    start: Position
    end: Position
}

/**
 * Represents a grid of numbers with adjacencies (lines between positions)
 */
export class NumberGrid {
    // The grid of numbers (null represents a blank)
    private grid: (number | null)[][] = []

    // Adjacencies represented as a map of position strings to maps of adjacent position strings with counts
    // The inner map's values represent the number of lines between the two positions
    private adjacencies: Map<string, Map<string, number>> = new Map()

    /**
     * Creates a new NumberGrid with the specified dimensions
     * @param rows Number of rows in the grid
     * @param cols Number of columns in the grid
     */
    constructor(rows: number, cols: number) {
        // Initialize the grid with nulls (blanks)
        this.grid = Array(rows)
            .fill(null)
            .map(() => Array(cols).fill(null))
    }

    /**
     * Converts a Position to a string key for the adjacencies map
     * @param pos The position to convert
     * @returns A string representation of the position
     */
    private posToKey(pos: Position): string {
        return `${pos.row},${pos.col}`
    }

    /**
     * Converts a string key back to a Position
     * @param key The string key to convert
     * @returns The corresponding Position
     */
    private keyToPos(key: string): Position {
        const [row, col] = key.split(',').map(Number)
        return { row, col }
    }

    /**
     * Sets a number at the specified position in the grid
     * @param pos The position where the number should be placed
     * @param value The number to place (or null for a blank)
     */
    setNumber(pos: Position, value: number | null): void {
        if (
            pos.row < 0 ||
            pos.row >= this.grid.length ||
            pos.col < 0 ||
            pos.col >= this.grid[0].length
        ) {
            throw new Error(`Position ${this.posToKey(pos)} is out of bounds`)
        }

        this.grid[pos.row][pos.col] = value
    }

    getNumber(pos: Position): number {
        if (
            pos.row < 0 ||
            pos.row >= this.grid.length ||
            pos.col < 0 ||
            pos.col >= this.grid[0].length
        ) {
            throw new Error(`Position ${this.posToKey(pos)} is out of bounds`)
        }

        return this.grid[pos.row][pos.col]!
    }

    /**
     * Adds an adjacency (line) between two positions
     * @param pos1 The first position
     * @param pos2 The second position
     * @param preventCrossing If true, the adjacency will not be added if it would cross an existing adjacency
     * @returns True if the adjacency was added, false if it was not added due to crossing or if the line would be diagonal
     */
    addAdjacency(pos1: Position, pos2: Position, preventCrossing = true): boolean {
        // Check if the line would be diagonal (not horizontal or vertical)
        if (pos1.row !== pos2.row && pos1.col !== pos2.col) {
            // Diagonal lines are not allowed
            return false
        }

        // Check if the new adjacency would cross any existing adjacencies
        if (preventCrossing && this.wouldCrossExistingAdjacency(pos1, pos2)) {
            return false
        }

        const key1 = this.posToKey(pos1)
        const key2 = this.posToKey(pos2)

        // Add pos2 to pos1's adjacencies
        if (!this.adjacencies.has(key1)) {
            this.adjacencies.set(key1, new Map())
        }
        // Get current count or default to 0, then increment
        const currentCount1 = this.adjacencies.get(key1)!.get(key2) || 0
        this.adjacencies.get(key1)!.set(key2, currentCount1 + 1)

        // Add pos1 to pos2's adjacencies (undirected graph)
        if (!this.adjacencies.has(key2)) {
            this.adjacencies.set(key2, new Map())
        }
        // Get current count or default to 0, then increment
        const currentCount2 = this.adjacencies.get(key2)!.get(key1) || 0
        this.adjacencies.get(key2)!.set(key1, currentCount2 + 1)

        return true
    }

    /**
     * Returns the dimensions of the grid
     * @returns An object with the number of rows and columns
     */
    getDimensions(): { rows: number; cols: number } {
        return {
            rows: this.grid.length,
            cols: this.grid[0].length,
        }
    }

    /**
     * Returns the number of links between two positions
     * @param pos1 The first position
     * @param pos2 The second position
     * @returns The number of links between the positions, or 0 if there are no direct links
     */
    countLinksBetween(pos1: Position, pos2: Position): number {
        const key1 = this.posToKey(pos1)
        const key2 = this.posToKey(pos2)

        // Check if pos1 has any adjacencies
        if (!this.adjacencies.has(key1)) {
            return 0
        }

        // Check if pos2 is directly connected to pos1
        const links = this.adjacencies.get(key1)!.get(key2)

        // Return the number of links, or 0 if there are no direct links
        return links || 0
    }

    // make a function to pretty print a line segment
    prettyPrintLineSegment(line: LineSegment): string {
        return `${line.start.row},${line.start.col} -> ${line.end.row},${line.end.col}`
    }

    /**
     * Converts an adjacency (pair of positions) to a line segment
     * @param pos1 The first position
     * @param pos2 The second position
     * @returns A LineSegment representing the adjacency
     */
    private adjacencyToLineSegment(pos1: Position, pos2: Position): LineSegment {
        return {
            start: pos1,
            end: pos2,
        }
    }

    /**
     * Checks if two-line segments intersect
     * Uses the algorithm described at https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
     * @param line1 The first line segment
     * @param line2 The second line segment
     * @returns True if the line segments intersect, false otherwise
     */
    private doLineSegmentsIntersect(line1: LineSegment, line2: LineSegment): boolean {
        // If both line are the same let it be
        if (
            line1.start.row === line2.start.row &&
            line1.start.col === line2.start.col &&
            line1.end.row === line2.end.row &&
            line1.end.col === line2.end.col
        ) {
            return false
        }

        // First, check if the endpoints overlap
        if (this.areEndpointsOverlapping(line1, line2)) {
            // Endpoints overlap, so we don't consider this an intersection
            return false
        }

        // Extract coordinates for easier reference
        const x1 = line1.start.col
        const y1 = line1.start.row
        const x2 = line1.end.col
        const y2 = line1.end.row
        const x3 = line2.start.col
        const y3 = line2.start.row
        const x4 = line2.end.col
        const y4 = line2.end.row

        // Calculate the denominator of the intersection formula
        const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)

        // If denominator is 0, lines are parallel or collinear
        if (denominator === 0) {
            return false
        }

        // Calculate the parameters for the intersection point
        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

        // Check if the intersection point is within both line segments
        return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1
    }

    /**
     * Checks if the endpoints of two line segments overlap
     * @param line1 The first line segment
     * @param line2 The second line segment
     * @returns True if any endpoint of line1 overlaps with any endpoint of line2
     */
    private areEndpointsOverlapping(line1: LineSegment, line2: LineSegment): boolean {
        // Check if any endpoint of line1 is the same as any endpoint of line2
        return (
            this.arePositionsEqual(line1.start, line2.start) ||
            this.arePositionsEqual(line1.start, line2.end) ||
            this.arePositionsEqual(line1.end, line2.start) ||
            this.arePositionsEqual(line1.end, line2.end)
        )
    }

    /**
     * Checks if two positions are equal
     * @param pos1 The first position
     * @param pos2 The second position
     * @returns True if the positions have the same row and column
     */
    private arePositionsEqual(pos1: Position, pos2: Position): boolean {
        return pos1.row === pos2.row && pos1.col === pos2.col
    }

    /**
     * Checks if a new adjacency would cross any existing adjacencies
     * @param pos1 The first position of the new adjacency
     * @param pos2 The second position of the new adjacency
     * @returns True if the new adjacency would cross any existing adjacency, false otherwise
     */
    wouldCrossExistingAdjacency(pos1: Position, pos2: Position): boolean {
        const newLine = this.adjacencyToLineSegment(pos1, pos2)

        // Get all existing adjacencies
        const existingAdjacencies: LineSegment[] = []
        for (const [start, adjacentMap] of this.adjacencies.entries()) {
            const startPos = this.keyToPos(start)

            for (const [end, count] of adjacentMap.entries()) {
                // Skip if count is 0 (no lines)
                if (count <= 0) continue

                const endPos = this.keyToPos(end)

                // Only process each adjacency once to avoid duplicates
                if (this.posToKey(startPos) < end) {
                    existingAdjacencies.push(this.adjacencyToLineSegment(startPos, endPos))
                }
            }
        }

        // Check if the new line crosses any existing adjacency
        return existingAdjacencies.some((existingLine) =>
            this.doLineSegmentsIntersect(newLine, existingLine),
        )
    }

    /**
     * Creates a visual representation of the grid with adjacencies
     * @returns A string representation of the grid with adjacencies
     */
    visualize(): string {
        const { rows, cols } = this.getDimensions()

        // Create a grid with spaces for adjacencies
        const visualGrid: string[][] = Array(rows * 2 - 1)
            .fill(null)
            .map(() => Array(cols * 2 - 1).fill(' '))

        // Fill in the numbers
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const value = this.grid[r][c]
                visualGrid[r * 2][c * 2] = value === null ? ' ' : value.toString()
            }
        }

        // Add the adjacencies
        for (const [start, adjacentMap] of this.adjacencies.entries()) {
            const startPos = this.keyToPos(start)

            for (const [end, linkCount] of adjacentMap.entries()) {
                const endPos = this.keyToPos(end)

                // Only process each adjacency once
                if (this.posToKey(startPos) < end) {
                    // Add horizontal or vertical line
                    if (startPos.row === endPos.row) {
                        // Horizontal line
                        for (
                            let c = Math.min(startPos.col, endPos.col) * 2 + 1;
                            c < Math.max(startPos.col, endPos.col) * 2;
                            c++
                        ) {
                            visualGrid[startPos.row * 2][c] = linkCount === 1 ? '-' : '='
                        }
                    } else if (startPos.col === endPos.col) {
                        // Vertical line
                        for (
                            let r = Math.min(startPos.row, endPos.row) * 2 + 1;
                            r < Math.max(startPos.row, endPos.row) * 2;
                            r++
                        ) {
                            visualGrid[r][startPos.col * 2] = linkCount === 1 ? '|' : '║'
                        }
                    }
                }
            }
        }

        return visualGrid.map((row) => row.join('')).join('\n')
    }

    countAdjacencies(pos: Position): number {
        const key = this.posToKey(pos)
        const adjs = this.adjacencies.get(key)

        let sum = 0
        adjs?.forEach((v) => {
            sum += v
        })

        return sum
    }

    connectsToA1(pos: Position) {
        const key = this.posToKey(pos)

        if (!this.adjacencies.has(key)) {
            return false
        }

        return Array.from(this.adjacencies.get(key)!.values()).filter((v) => v === 1).length > 0
    }

    /**
     * Finds the next non-null position in each of the four directions (up, down, left, right)
     * from the given position, respecting grid boundaries
     * @param pos The position to check from
     * @returns An array of positions representing the next non-null positions in each direction
     */
    findPossibleAdjacencies(pos: Position): Position[] {
        const { rows, cols } = this.getDimensions()
        const { row, col } = pos
        const result: Position[] = []

        // Check up direction
        for (let r = row - 1; r >= 0; r--) {
            if (this.grid[r][col] !== null) {
                result.push({ row: r, col })
                break
            }
        }

        // Check down direction
        for (let r = row + 1; r < rows; r++) {
            if (this.grid[r][col] !== null) {
                result.push({ row: r, col })
                break
            }
        }

        // Check left direction
        for (let c = col - 1; c >= 0; c--) {
            if (this.grid[row][c] !== null) {
                result.push({ row, col: c })
                break
            }
        }

        // Check right direction
        for (let c = col + 1; c < cols; c++) {
            if (this.grid[row][c] !== null) {
                result.push({ row, col: c })
                break
            }
        }

        return result
    }

    findImpliedAdjacencies(): LineSegment[] {
        const { rows, cols } = this.getDimensions()

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (this.grid[r][c] != null) {
                    const value = this.grid[r][c]!
                    const remainingSegments = value - this.countAdjacencies({ row: r, col: c })
                    if (remainingSegments == 0) {
                        // position is complete
                        continue
                    }

                    const destinations = this.findPossibleAdjacencies({ row: r, col: c })

                    const validDestinations = destinations.filter((pos) => {
                        // how many existing connections are to this spot
                        const existing =
                            this.adjacencies
                                .get(this.posToKey(pos))
                                ?.get(this.posToKey({ row: r, col: c })) ?? 0

                        if (this.countAdjacencies(pos) === this.getNumber(pos)) {
                            // if the destination is full up, stop
                            return false
                        } else if (existing >= 2) {
                            // two is all we can do
                            return false
                        } else if (existing === 1) {
                            // if there's already one and there's space then we know it's good
                            return true
                        } else {
                            // otherwise there's nothing there so we need to make sure it doesn't cross other lines
                            return !this.wouldCrossExistingAdjacency({ row: r, col: c }, pos)
                        }
                    })

                    // logic that we can infer
                    if (remainingSegments === 5 && validDestinations.length === 3) {
                        // a 5 with 3 destinations means each must be hit once
                        console.log('a 5 with 3 destinations means each must be hit once')
                        return validDestinations.map((pos) => {
                            return { start: { row: r, col: c }, end: pos }
                        })
                    } else if (remainingSegments === 4 && validDestinations.length === 2) {
                        // a 4 with 2 destinations means each must be hit twice
                        console.log('a 4 with 2 destinations means each must be hit twice')
                        return validDestinations.flatMap((pos) => {
                            return [
                                { start: { row: r, col: c }, end: pos },
                                { start: { row: r, col: c }, end: pos },
                            ]
                        })
                    } else if (remainingSegments === 3 && validDestinations.length === 2) {
                        // a 3 with 2 destinations means each must be hit once
                        console.log('a 3 with 2 destinations means each must be hit once')
                        return validDestinations.map((pos) => {
                            return { start: { row: r, col: c }, end: pos }
                        })
                    } else if (
                        remainingSegments === 2 &&
                        validDestinations.length === 2 &&
                        (this.getNumber(validDestinations[0]) -
                            this.countAdjacencies(validDestinations[0]) ===
                            1 ||
                            this.getNumber(validDestinations[1]) -
                                this.countAdjacencies(validDestinations[1]) ===
                                1)
                    ) {
                        // a 2 with 2 destinations but one has 1 connection already means the other must have one
                        console.log(
                            'a 2 with 2 destinations but one has 1 connection already means the other must have one',
                        )
                        if (
                            this.getNumber(validDestinations[0]) -
                                this.countAdjacencies(validDestinations[0]) ===
                                1 &&
                            this.getNumber(validDestinations[1]) -
                                this.countAdjacencies(validDestinations[1]) ===
                                1
                        ) {
                            return [
                                { start: { row: r, col: c }, end: validDestinations[0] },
                                { start: { row: r, col: c }, end: validDestinations[1] },
                            ]
                        } else if (
                            this.getNumber(validDestinations[0]) -
                                this.countAdjacencies(validDestinations[0]) ===
                            1
                        ) {
                            return [{ start: { row: r, col: c }, end: validDestinations[1] }]
                        } else {
                            return [{ start: { row: r, col: c }, end: validDestinations[0] }]
                        }
                    } else if (
                        value === 2 &&
                        validDestinations.length === 2 &&
                        ((this.getNumber(validDestinations[0]) === 2 &&
                            this.countLinksBetween(validDestinations[0], { row: r, col: c }) ===
                                1) ||
                            (this.getNumber(validDestinations[1]) === 2 &&
                                this.countLinksBetween(validDestinations[1], { row: r, col: c }) ===
                                    1))
                    ) {
                        // an actual 2 with 2 destinations but one is to a 2 that already has one connection means the other must be a link
                        console.log(
                            'an actual 2 with 2 destinations but one is to a 2 that already has one connection means the other must be a link',
                        )
                        if (
                            this.getNumber(validDestinations[0]) === 2 &&
                            this.countLinksBetween(validDestinations[0], { row: r, col: c }) === 1
                        ) {
                            return [{ start: { row: r, col: c }, end: validDestinations[1] }]
                        } else {
                            return [{ start: { row: r, col: c }, end: validDestinations[0] }]
                        }
                    } else if (remainingSegments === 2 && validDestinations.length === 1) {
                        // a 2 with 1 destination means two lines to that one
                        console.log('a 2 with 1 destination means two lines to that one')
                        return [
                            { start: { row: r, col: c }, end: validDestinations[0] },
                            { start: { row: r, col: c }, end: validDestinations[0] },
                        ]
                    } else if (remainingSegments === 1 && validDestinations.length === 1) {
                        // a 1 with 1 destination means just that one
                        console.log('a 1 with 1 destination means just that one')
                        return [{ start: { row: r, col: c }, end: validDestinations[0] }]
                    } else if (
                        value === 5 &&
                        validDestinations.length === 3 &&
                        // already has at least 1 connected
                        this.connectsToA1({ row: r, col: c })
                    ) {
                        // special case: an actual 5 (not just 5 left)
                        console.log(`special case: an actual 5 (not just 5 left) ${r} ${c}`)
                        // every adjacent spot that does NOT have a 1 already must get one
                        const newConnections = validDestinations
                            .filter((p) => {
                                return this.countLinksBetween({ row: r, col: c }, p) === 0
                            })
                            .map((pos) => {
                                return { start: { row: r, col: c }, end: pos }
                            })

                        if (newConnections.length > 0) return newConnections
                    }
                }
            }
        }

        return []
    }
}

// Example usage
const example = () => {
    const grid = new NumberGrid(11, 11)

    // Set some numbers
    grid.setNumber({ row: 0, col: 0 }, 3)
    grid.setNumber({ row: 0, col: 3 }, 2)
    grid.setNumber({ row: 0, col: 6 }, 4)
    grid.setNumber({ row: 0, col: 9 }, 3)
    grid.setNumber({ row: 1, col: 1 }, 2)
    grid.setNumber({ row: 1, col: 5 }, 2)
    grid.setNumber({ row: 1, col: 8 }, 1)
    grid.setNumber({ row: 1, col: 10 }, 2)
    grid.setNumber({ row: 2, col: 0 }, 3)
    grid.setNumber({ row: 3, col: 1 }, 3)
    grid.setNumber({ row: 3, col: 4 }, 1)
    grid.setNumber({ row: 3, col: 6 }, 3)
    grid.setNumber({ row: 3, col: 8 }, 2)
    grid.setNumber({ row: 3, col: 10 }, 3)
    grid.setNumber({ row: 4, col: 0 }, 3)
    grid.setNumber({ row: 4, col: 2 }, 1)
    grid.setNumber({ row: 4, col: 5 }, 2)
    grid.setNumber({ row: 5, col: 1 }, 4)
    grid.setNumber({ row: 5, col: 3 }, 5)
    grid.setNumber({ row: 5, col: 6 }, 4)
    grid.setNumber({ row: 5, col: 9 }, 4)
    grid.setNumber({ row: 6, col: 0 }, 3)
    grid.setNumber({ row: 6, col: 5 }, 1)
    grid.setNumber({ row: 7, col: 1 }, 3)
    grid.setNumber({ row: 7, col: 8 }, 1)
    grid.setNumber({ row: 8, col: 0 }, 2)
    grid.setNumber({ row: 8, col: 3 }, 4)
    grid.setNumber({ row: 8, col: 5 }, 3)
    grid.setNumber({ row: 8, col: 9 }, 2)
    grid.setNumber({ row: 9, col: 1 }, 4)
    grid.setNumber({ row: 9, col: 6 }, 5)
    grid.setNumber({ row: 9, col: 8 }, 5)
    grid.setNumber({ row: 9, col: 10 }, 3)
    grid.setNumber({ row: 10, col: 0 }, 2)
    grid.setNumber({ row: 10, col: 2 }, 2)
    grid.setNumber({ row: 10, col: 4 }, 3)
    grid.setNumber({ row: 10, col: 7 }, 3)
    grid.setNumber({ row: 10, col: 9 }, 1)

    // eslint-disable-next-line no-constant-condition
    while (true) {
        console.log('\nVisualized Grid:')
        console.log(grid.visualize())

        const nextMoves = grid.findImpliedAdjacencies()

        if (nextMoves.length === 0) break

        console.log('\nNext Moves:')
        nextMoves.forEach((m) => console.log(grid.prettyPrintLineSegment(m)))

        nextMoves.forEach((move) => {
            grid.addAdjacency(move.start, move.end)
        })
    }
}

example()
