/**
 * Generic A* (A-Star) Search Implementation
 * 
 * A* is a best-first search algorithm that finds optimal paths by using:
 * - g(n): actual cost from start to node n
 * - h(n): heuristic estimate of cost from n to goal
 * - f(n) = g(n) + h(n): total estimated cost
 * 
 * The algorithm explores nodes with the lowest f(n) first, guaranteeing
 * optimal solutions when the heuristic is admissible (never overestimates).
 * 
 * Best for:
 * - Finding optimal paths (shortest, cheapest, etc.)
 * - Pathfinding problems
 * - Any optimization problem with a good heuristic
 */

export interface AStarNode<T> {
    state: T;
    g: number; // Actual cost from start to this node
    h: number; // Heuristic estimate from this node to goal
    f: number; // Total: g + h
    parent: AStarNode<T> | null;
    path?: T[]; // Optional: cached path to this node
}

export interface AStarOptions<T> {
    /**
     * Get neighbors of a node
     */
    getNeighbors: (node: T) => T[] | Promise<T[]>;
    
    /**
     * Check if a node is a goal/target state
     */
    isGoal: (node: T) => boolean;
    
    /**
     * Heuristic function: estimate cost from node to goal
     * Must be admissible (never overestimate) for optimality guarantee
     * For pathfinding: often Manhattan or Euclidean distance
     */
    heuristic: (node: T) => number;
    
    /**
     * Calculate the actual cost to move from 'from' to 'to'
     * Default: returns 1 for all moves
     */
    getCost?: (from: T, to: T) => number;
    
    /**
     * Custom key function for node comparison (default: JSON.stringify)
     * Used to track visited nodes and compare states
     */
    getKey?: (node: T) => string;
    
    /**
     * Maximum cost to consider (optional early termination)
     * Stop searching if we exceed this cost
     */
    maxCost?: number;
    
    /**
     * Visit callback - called when a node is explored
     * Return false to stop searching
     */
    onVisit?: (node: T, g: number, h: number, f: number) => boolean | void;
    
    /**
     * Allow revisiting nodes if we find a better path to them
     * Default: true (A* typically allows this for optimality)
     */
    allowRevisit?: boolean;
}

/**
 * Priority queue implementation for A*
 * Uses a binary min-heap
 */
class PriorityQueue<T> {
    private heap: T[] = [];
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }

    push(item: T): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): T | undefined {
        if (this.heap.length === 0) return undefined;
        if (this.heap.length === 1) return this.heap.pop();

        const top = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.bubbleDown(0);
        return top;
    }

    peek(): T | undefined {
        return this.heap[0];
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    size(): number {
        return this.heap.length;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parent]) >= 0) break;
            [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
            index = parent;
        }
    }

    private bubbleDown(index: number): void {
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;

            if (left < this.heap.length && 
                this.compare(this.heap[left], this.heap[smallest]) < 0) {
                smallest = left;
            }

            if (right < this.heap.length && 
                this.compare(this.heap[right], this.heap[smallest]) < 0) {
                smallest = right;
            }

            if (smallest === index) break;

            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }
}

/**
 * Reconstruct path from goal node back to start
 */
function reconstructPath<T>(goalNode: AStarNode<T>, getKey: (node: T) => string): T[] {
    const path: T[] = [];
    let current: AStarNode<T> | null = goalNode;
    
    while (current !== null) {
        path.unshift(current.state);
        current = current.parent;
    }
    
    return path;
}

/**
 * A* search - finds optimal path from start to goal
 * 
 * Returns the path and total cost, or null if no path exists
 */
export async function astar<T>(
    start: T,
    options: AStarOptions<T>
): Promise<{ path: T[]; cost: number } | null> {
    const getKey = options.getKey || ((node: T) => JSON.stringify(node));
    const getCost = options.getCost || (() => 1);
    
    // Priority queue: nodes with lower f(n) have higher priority
    const openSet = new PriorityQueue<AStarNode<T>>((a, b) => {
        // Primary: compare by f(n)
        if (a.f !== b.f) return a.f - b.f;
        // Secondary: if f is equal, prefer higher g (closer to goal)
        return b.g - a.g;
    });
    
    // Track best known g(n) for each node
    const gScore = new Map<string, number>();
    // Track nodes we've explored
    const closedSet = new Set<string>();
    // Track nodes in open set by key for quick lookup
    const openSetMap = new Map<string, AStarNode<T>>();
    
    // Initialize start node
    const startH = options.heuristic(start);
    const startNode: AStarNode<T> = {
        state: start,
        g: 0,
        h: startH,
        f: startH,
        parent: null
    };
    
    gScore.set(getKey(start), 0);
    openSet.push(startNode);
    openSetMap.set(getKey(start), startNode);
    
    while (!openSet.isEmpty()) {
        const current = openSet.pop()!;
        const currentKey = getKey(current.state);
        
        // Remove from open set map
        openSetMap.delete(currentKey);
        
        // Check if we've already explored this node with a better path
        if (closedSet.has(currentKey)) {
            continue;
        }
        
        // Mark as explored
        closedSet.add(currentKey);
        
        // Check if this is the goal
        if (options.isGoal(current.state)) {
            const path = reconstructPath(current, getKey);
            return { path, cost: current.g };
        }
        
        // Callback
        if (options.onVisit) {
            const shouldContinue = options.onVisit(current.state, current.g, current.h, current.f);
            if (shouldContinue === false) {
                break;
            }
        }
        
        // Check max cost limit
        if (options.maxCost !== undefined && current.g > options.maxCost) {
            continue;
        }
        
        // Explore neighbors
        const neighbors = await options.getNeighbors(current.state);
        
        for (const neighbor of neighbors) {
            const neighborKey = getKey(neighbor);
            
            // Skip if already explored (unless revisiting is allowed)
            if (!options.allowRevisit && closedSet.has(neighborKey)) {
                continue;
            }
            
            // Calculate tentative g score
            const moveCost = getCost(current.state, neighbor);
            const tentativeG = current.g + moveCost;
            
            // Check if we've seen this node before
            const existingG = gScore.get(neighborKey);
            
            // If we've found a better path to this neighbor, or haven't seen it
            if (existingG === undefined || tentativeG < existingG) {
                // Update g score
                gScore.set(neighborKey, tentativeG);
                
                // Calculate heuristic
                const h = options.heuristic(neighbor);
                const f = tentativeG + h;
                
                // Create neighbor node
                const neighborNode: AStarNode<T> = {
                    state: neighbor,
                    g: tentativeG,
                    h: h,
                    f: f,
                    parent: current
                };
                
                // Add to open set if not already there, or update if we have a better path
                const existingInOpen = openSetMap.get(neighborKey);
                if (!existingInOpen || tentativeG < existingInOpen.g) {
                    openSet.push(neighborNode);
                    openSetMap.set(neighborKey, neighborNode);
                }
            }
        }
    }
    
    // No path found
    return null;
}

/**
 * A* with multiple goals - finds optimal path to any goal
 */
export async function astarMultiGoal<T>(
    start: T,
    options: AStarOptions<T> & {
        /**
         * Check if node is any of the possible goals
         */
        isGoal: (node: T) => boolean;
    }
): Promise<{ path: T[]; cost: number; goal: T } | null> {
    // Same implementation, just returns the goal as well
    const result = await astar(start, options);
    if (!result) return null;
    
    const goal = result.path[result.path.length - 1];
    return { ...result, goal };
}

/**
 * A* with path reconstruction optimization
 * Caches paths in nodes to avoid repeated reconstruction
 */
export async function astarOptimized<T>(
    start: T,
    options: AStarOptions<T>
): Promise<{ path: T[]; cost: number } | null> {
    const getKey = options.getKey || ((node: T) => JSON.stringify(node));
    const getCost = options.getCost || (() => 1);
    
    const openSet = new PriorityQueue<AStarNode<T>>((a, b) => {
        if (a.f !== b.f) return a.f - b.f;
        return b.g - a.g;
    });
    
    const gScore = new Map<string, number>();
    const closedSet = new Set<string>();
    const openSetMap = new Map<string, AStarNode<T>>();
    
    const startH = options.heuristic(start);
    const startNode: AStarNode<T> = {
        state: start,
        g: 0,
        h: startH,
        f: startH,
        parent: null,
        path: [start] // Cache path
    };
    
    gScore.set(getKey(start), 0);
    openSet.push(startNode);
    openSetMap.set(getKey(start), startNode);
    
    while (!openSet.isEmpty()) {
        const current = openSet.pop()!;
        const currentKey = getKey(current.state);
        
        openSetMap.delete(currentKey);
        
        if (closedSet.has(currentKey)) {
            continue;
        }
        
        closedSet.add(currentKey);
        
        if (options.isGoal(current.state)) {
            return { 
                path: current.path || reconstructPath(current, getKey), 
                cost: current.g 
            };
        }
        
        if (options.onVisit) {
            const shouldContinue = options.onVisit(current.state, current.g, current.h, current.f);
            if (shouldContinue === false) {
                break;
            }
        }
        
        if (options.maxCost !== undefined && current.g > options.maxCost) {
            continue;
        }
        
        const neighbors = await options.getNeighbors(current.state);
        const currentPath = current.path || reconstructPath(current, getKey);
        
        for (const neighbor of neighbors) {
            const neighborKey = getKey(neighbor);
            
            if (!options.allowRevisit && closedSet.has(neighborKey)) {
                continue;
            }
            
            const moveCost = getCost(current.state, neighbor);
            const tentativeG = current.g + moveCost;
            
            const existingG = gScore.get(neighborKey);
            
            if (existingG === undefined || tentativeG < existingG) {
                gScore.set(neighborKey, tentativeG);
                
                const h = options.heuristic(neighbor);
                const f = tentativeG + h;
                
                const neighborNode: AStarNode<T> = {
                    state: neighbor,
                    g: tentativeG,
                    h: h,
                    f: f,
                    parent: current,
                    path: [...currentPath, neighbor] // Cache path
                };
                
                const existingInOpen = openSetMap.get(neighborKey);
                if (!existingInOpen || tentativeG < existingInOpen.g) {
                    openSet.push(neighborNode);
                    openSetMap.set(neighborKey, neighborNode);
                }
            }
        }
    }
    
    return null;
}

/**
 * Weighted A* - allows tuning the heuristic influence
 * f(n) = g(n) + w * h(n) where w is the weight
 * 
 * w = 1: standard A* (optimal)
 * w > 1: greedy (faster, may not be optimal)
 * w < 1: more conservative (slower, still optimal if w * h is admissible)
 */
export async function weightedAstar<T>(
    start: T,
    options: AStarOptions<T> & {
        /**
         * Weight for heuristic (default: 1.0 for standard A*)
         * Higher values make it more greedy (faster but less optimal)
         */
        weight?: number;
    }
): Promise<{ path: T[]; cost: number } | null> {
    const weight = options.weight ?? 1.0;
    const getKey = options.getKey || ((node: T) => JSON.stringify(node));
    const getCost = options.getCost || (() => 1);
    
    const openSet = new PriorityQueue<AStarNode<T>>((a, b) => {
        // Use weighted f: g + weight * h
        const fA = a.g + weight * a.h;
        const fB = b.g + weight * b.h;
        if (fA !== fB) return fA - fB;
        return b.g - a.g;
    });
    
    const gScore = new Map<string, number>();
    const closedSet = new Set<string>();
    const openSetMap = new Map<string, AStarNode<T>>();
    
    const startH = options.heuristic(start);
    const startNode: AStarNode<T> = {
        state: start,
        g: 0,
        h: startH,
        f: 0 + weight * startH, // Weighted f
        parent: null
    };
    
    gScore.set(getKey(start), 0);
    openSet.push(startNode);
    openSetMap.set(getKey(start), startNode);
    
    while (!openSet.isEmpty()) {
        const current = openSet.pop()!;
        const currentKey = getKey(current.state);
        
        openSetMap.delete(currentKey);
        
        if (closedSet.has(currentKey)) {
            continue;
        }
        
        closedSet.add(currentKey);
        
        if (options.isGoal(current.state)) {
            const path = reconstructPath(current, getKey);
            return { path, cost: current.g };
        }
        
        if (options.onVisit) {
            const shouldContinue = options.onVisit(current.state, current.g, current.h, current.f);
            if (shouldContinue === false) {
                break;
            }
        }
        
        if (options.maxCost !== undefined && current.g > options.maxCost) {
            continue;
        }
        
        const neighbors = await options.getNeighbors(current.state);
        
        for (const neighbor of neighbors) {
            const neighborKey = getKey(neighbor);
            
            if (!options.allowRevisit && closedSet.has(neighborKey)) {
                continue;
            }
            
            const moveCost = getCost(current.state, neighbor);
            const tentativeG = current.g + moveCost;
            
            const existingG = gScore.get(neighborKey);
            
            if (existingG === undefined || tentativeG < existingG) {
                gScore.set(neighborKey, tentativeG);
                
                const h = options.heuristic(neighbor);
                const f = tentativeG + weight * h; // Weighted f
                
                const neighborNode: AStarNode<T> = {
                    state: neighbor,
                    g: tentativeG,
                    h: h,
                    f: f,
                    parent: current
                };
                
                const existingInOpen = openSetMap.get(neighborKey);
                if (!existingInOpen || tentativeG < existingInOpen.g) {
                    openSet.push(neighborNode);
                    openSetMap.set(neighborKey, neighborNode);
                }
            }
        }
    }
    
    return null;
}
