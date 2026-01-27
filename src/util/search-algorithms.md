# Search Algorithms: DFS vs A*

## Depth-First Search (DFS)

**What it does:**
- Explores as deep as possible along each branch before backtracking
- Uses a stack (LIFO - Last In, First Out)
- No consideration of path cost or distance to goal

**Characteristics:**
- ✅ Simple to implement
- ✅ Memory efficient (O(depth) space)
- ✅ Good for tree traversal, backtracking problems
- ✅ Can find solutions quickly if they're deep in the tree
- ❌ Not guaranteed to find optimal solutions
- ❌ Can get stuck in deep branches
- ❌ Doesn't use heuristics to guide search

**Best for:**
- Finding **any** solution (not necessarily optimal)
- Exhaustive search problems
- Backtracking (N-queens, sudoku, etc.)
- Tree/graph traversal
- Problems where you need to explore the entire space

**Example use cases:**
- Finding a path in a maze (any path, not shortest)
- Solving puzzles where you need to try all possibilities
- Tree traversal (pre-order, in-order, post-order)
- Cycle detection in graphs

---

## A* (A-Star)

**What it does:**
- Best-first search that uses both:
  1. **g(n)**: Actual cost from start to node n
  2. **h(n)**: Heuristic estimate of cost from n to goal
- Chooses the node with lowest **f(n) = g(n) + h(n)** to explore next
- Uses a priority queue (min-heap)

**Characteristics:**
- ✅ Guaranteed to find optimal solution (if heuristic is admissible)
- ✅ Much faster than Dijkstra for pathfinding
- ✅ Uses heuristics to guide search intelligently
- ✅ Explores most promising paths first
- ❌ Requires a good heuristic function
- ❌ More memory intensive (O(nodes) space)
- ❌ More complex to implement

**Best for:**
- Finding **optimal** paths (shortest, cheapest, etc.)
- Pathfinding in games/maps
- Any problem where you have a good heuristic
- Problems where optimality matters

**Example use cases:**
- Finding shortest path on a map
- Pathfinding in games (NPCs moving to target)
- Puzzle solving where you need the minimum moves
- Any optimization problem with a good distance/cost estimate

---

## Key Differences

| Feature | DFS | A* |
|---------|-----|-----|
| **Optimality** | ❌ Not guaranteed | ✅ Guaranteed (with admissible heuristic) |
| **Data Structure** | Stack (LIFO) | Priority Queue (min-heap) |
| **Guided Search** | ❌ No | ✅ Yes (uses heuristics) |
| **Memory** | O(depth) | O(nodes) |
| **Speed** | Fast for deep solutions | Fast for optimal solutions |
| **Use Case** | Any solution | Optimal solution |

---

## When to Use Which?

### Use **DFS** when:
- You need **any** solution, not necessarily the best
- You're doing backtracking (trying all possibilities)
- Memory is limited
- The problem space is a tree (no cycles) or cycles don't matter
- You're doing exhaustive search

### Use **A*** when:
- You need the **optimal** solution
- You have a good heuristic function
- You're doing pathfinding
- The problem has a clear "distance to goal" concept
- Optimality is more important than memory

---

## Your Use Case

You mentioned: *"recursively search a possibility space, computing best possible solutions and then pruning paths that are suboptimal"*

This sounds like you might want:
1. **DFS with pruning** (backtracking) - if you want to find the best solution by exploring all possibilities and pruning bad paths
2. **A*** - if you have a heuristic and want guaranteed optimal solutions faster

**DFS with pruning** is good when:
- You can determine if a path is suboptimal early
- You want to explore the entire space but skip bad branches
- You don't have a good heuristic

**A*** is better when:
- You have a heuristic (e.g., Manhattan distance, Euclidean distance)
- You want optimal solutions without exploring the entire space
- The problem is pathfinding or similar

---

## Example: Finding Shortest Path

**DFS approach:**
- Explore all paths
- Keep track of best path found so far
- Prune paths that are already longer than best
- Eventually finds optimal, but explores many unnecessary paths

**A* approach:**
- Use heuristic (e.g., straight-line distance to goal)
- Always explore most promising path first
- Finds optimal solution while exploring fewer nodes
- Much faster for pathfinding problems
