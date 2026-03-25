/**
 * Generic Hierarchy Helper - Works with any data structure that has parent-child relationships
 * Provides utilities for tree operations, drag and drop support, and hierarchy management
 */

export interface TreeNode<T = any> {
  id: string | number;
  parent_id?: string | number | null;
  index: number;
  level?: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  childrenCount?: number;
  path?: (string | number)[];
  data: T;
}

export interface HierarchyConfig<T> {
  /** Get item ID */
  getId: (item: T) => string | number;
  /** Get parent ID from item */
  getParentId: (item: T) => string | number | null;
  /** Get item index/order */
  getIndex: (item: T) => number;
  /** Set parent ID */
  setParentId: (item: T, parentId: string | number | null) => T;
  /** Set index */
  setIndex: (item: T, index: number) => T;
  /** Build tree-specific data (optional - for tree display) */
  buildTreeData?: (item: T, level: number, hasChildren: boolean, childrenCount: number, path: (string | number)[]) => T;
}

export class HierarchyHelper<T> {
  private config: HierarchyConfig<T>;

  constructor(config: HierarchyConfig<T>) {
    this.config = config;
  }

  /**
   * Validate if a parent-child relationship is valid (prevents circular references)
   */
  validateParentChild(items: T[], childId: string | number, newParentId: string | number | null): boolean {
    if (newParentId === null) return true; // Root level is always valid
    if (childId === newParentId) return false; // Can't be parent of itself

    // Check if newParentId is a descendant of childId (would create circular reference)
    const descendants = this.getDescendants(items, childId);
    return !descendants.some(desc => this.config.getId(desc) === newParentId);
  }

  /**
   * Get all children of a parent (direct children only)
   */
  getChildren(items: T[], parentId: string | number | null): T[] {
    return items.filter(item => {
      const itemParentId = this.config.getParentId(item);
      return (itemParentId === null && parentId === null) || 
             (itemParentId !== null && itemParentId === parentId);
    });
  }

  /**
   * Get all descendants of an item (children, grandchildren, etc.)
   */
  getDescendants(items: T[], parentId: string | number): T[] {
    const descendants: T[] = [];
    const children = this.getChildren(items, parentId);
    
    for (const child of children) {
      descendants.push(child);
      descendants.push(...this.getDescendants(items, this.config.getId(child)));
    }
    
    return descendants;
  }

  /**
   * Get all ancestors of an item (parent, grandparent, etc.)
   */
  getAncestors(items: T[], itemId: string | number): T[] {
    const ancestors: T[] = [];
    let currentItem = items.find(item => this.config.getId(item) === itemId);
    
    while (currentItem) {
      const parentId = this.config.getParentId(currentItem);
      if (parentId === null) break;
      
      const parent = items.find(item => this.config.getId(item) === parentId);
      if (!parent) break;
      
      ancestors.unshift(parent);
      currentItem = parent;
    }
    
    return ancestors;
  }

  /**
   * Build tree structure from flat array
   */
  buildTree(items: T[], expandedNodes: Set<string | number> = new Set()): TreeNode<T>[] {
    const itemMap = new Map<string | number, T & { children: T[] }>();
    const roots: (T & { children: T[] })[] = [];

    // Create map with children arrays
    items.forEach(item => {
      const id = this.config.getId(item);
      itemMap.set(id, { ...item, children: [] });
    });

    // Build parent-child relationships
    items.forEach(item => {
      const id = this.config.getId(item);
      const parentId = this.config.getParentId(item);
      const itemWithChildren = itemMap.get(id)!;
      
      if (parentId && itemMap.has(parentId)) {
        const parent = itemMap.get(parentId)!;
        parent.children.push(itemWithChildren);
      } else {
        roots.push(itemWithChildren);
      }
    });

    // Sort children by index
    itemMap.forEach(item => {
      item.children.sort((a, b) => this.config.getIndex(a) - this.config.getIndex(b));
    });

    // Sort roots by index
    roots.sort((a, b) => this.config.getIndex(a) - this.config.getIndex(b));

    return this.flattenTree(roots, 0, [], expandedNodes);
  }

  /**
   * Flatten tree structure for display (with expansion state)
   */
  private flattenTree(
    nodes: (T & { children: T[] })[],
    level: number = 0,
    path: (string | number)[] = [],
    expandedNodes: Set<string | number> = new Set()
  ): TreeNode<T>[] {
    const result: TreeNode<T>[] = [];

    nodes.forEach((node, index) => {
      const id = this.config.getId(node);
      const currentPath = [...path, index];
      const isExpanded = expandedNodes.has(id);
      const hasChildren = node.children.length > 0;

      // Build tree data if custom builder provided
      const treeData = this.config.buildTreeData 
        ? this.config.buildTreeData(node, level, hasChildren, node.children.length, currentPath)
        : node;

      const treeNode: TreeNode<T> = {
        id,
        parent_id: this.config.getParentId(node),
        index: this.config.getIndex(node),
        level,
        hasChildren,
        isExpanded,
        childrenCount: node.children.length,
        path: currentPath,
        data: treeData
      };

      result.push(treeNode);

      // Add children if expanded
      if (isExpanded && hasChildren) {
        const childrenFlattened = this.flattenTree(
          node.children as (T & { children: T[] })[],
          level + 1,
          currentPath,
          expandedNodes
        );
        result.push(...childrenFlattened);
      }
    });

    return result;
  }

  /**
   * Move an item to a different parent and reorder siblings
   */
  moveToParent(
    items: T[],
    itemId: string | number,
    newParentId: string | number | null,
    targetIndex: number
  ): T[] {
    if (!this.validateParentChild(items, itemId, newParentId)) {
      throw new Error('Invalid parent-child relationship would create circular reference');
    }

    const updatedItems = [...items];
    
    // Find the item being moved
    const itemIndex = updatedItems.findIndex(item => this.config.getId(item) === itemId);
    if (itemIndex === -1) throw new Error('Item not found');
    
    const item = updatedItems[itemIndex];
    const oldParentId = this.config.getParentId(item);

    // Update the item's parent
    updatedItems[itemIndex] = this.config.setParentId(item, newParentId);

    // Reorder siblings in the OLD parent
    if (oldParentId !== null || (oldParentId === null && newParentId !== null)) {
      const oldSiblings = updatedItems.filter(it => 
        this.config.getId(it) !== itemId && 
        ((this.config.getParentId(it) === null && oldParentId === null) ||
         (this.config.getParentId(it) === oldParentId))
      );
      oldSiblings.sort((a, b) => this.config.getIndex(a) - this.config.getIndex(b));
      
      oldSiblings.forEach((sibling, index) => {
        const siblingIndex = updatedItems.findIndex(it => this.config.getId(it) === this.config.getId(sibling));
        updatedItems[siblingIndex] = this.config.setIndex(updatedItems[siblingIndex], index + 1);
      });
    }

    // Insert and reorder in the NEW parent
    const newSiblings = updatedItems.filter(it => 
      ((this.config.getParentId(it) === null && newParentId === null) ||
       (this.config.getParentId(it) === newParentId))
    );
    
    newSiblings.sort((a, b) => this.config.getIndex(a) - this.config.getIndex(b));
    
    // Remove moved item from siblings if it's there
    const movedItemInSiblings = newSiblings.findIndex(sib => this.config.getId(sib) === itemId);
    if (movedItemInSiblings !== -1) {
      newSiblings.splice(movedItemInSiblings, 1);
    }
    
    // Insert at target position
    const insertIndex = Math.min(Math.max(0, targetIndex - 1), newSiblings.length);
    newSiblings.splice(insertIndex, 0, updatedItems[itemIndex]);
    
    // Reassign indices
    newSiblings.forEach((sibling, index) => {
      const siblingIndex = updatedItems.findIndex(it => this.config.getId(it) === this.config.getId(sibling));
      updatedItems[siblingIndex] = this.config.setIndex(updatedItems[siblingIndex], index + 1);
    });

    return updatedItems;
  }

  /**
   * Reorder items within the same parent level
   */
  reorderSiblings(
    items: T[],
    sourceIndex: number,
    targetIndex: number,
    parentId: string | number | null = null
  ): T[] {
    const siblings = this.getChildren(items, parentId);
    siblings.sort((a, b) => this.config.getIndex(a) - this.config.getIndex(b));

    if (sourceIndex < 0 || sourceIndex >= siblings.length || 
        targetIndex < 0 || targetIndex >= siblings.length) {
      throw new Error('Invalid source or target index');
    }

    // Reorder siblings array
    const [movedItem] = siblings.splice(sourceIndex, 1);
    siblings.splice(targetIndex, 0, movedItem);

    // Update the original items array
    const updatedItems = [...items];
    siblings.forEach((sibling, index) => {
      const itemIndex = updatedItems.findIndex(item => 
        this.config.getId(item) === this.config.getId(sibling)
      );
      if (itemIndex !== -1) {
        updatedItems[itemIndex] = this.config.setIndex(updatedItems[itemIndex], index + 1);
      }
    });

    return updatedItems;
  }

  /**
   * Get tree indentation style for visual display
   */
  getIndentationStyle(level: number, indentSize: number = 24): React.CSSProperties {
    return {
      paddingLeft: `${level * indentSize}px`,
      position: 'relative' as const
    };
  }

  /**
   * Toggle node expansion state
   */
  toggleExpansion(
    nodeId: string | number,
    expandedNodes: Set<string | number>
  ): Set<string | number> {
    const newExpandedNodes = new Set(expandedNodes);
    
    if (newExpandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId);
    } else {
      newExpandedNodes.add(nodeId);
    }

    return newExpandedNodes;
  }
}
