import React from "react";

interface ElementDefinition {
  elem: string;
  props?: { [name: string]: any };
  children?: ChildDefinition;
}

export type ChildDefinition = Array<string | ElementDefinition>;

type ReactChildren = React.ReactNode | React.ReactNodeArray;

export function mergeChildren(children: ChildDefinition, reactChildren: ReactChildren): React.ReactNodeArray {
  const keyedChildren = getKeyedChildren(reactChildren);

  return children.map(child => {
    if (typeof child === "string") {
      return child;
    }
    const reactChild = keyedChildren.get(child.elem);
    return mergeElement(child, reactChild);
  });
}

function mergeElement(def: ElementDefinition, elem?: React.ReactElement<any>): React.ReactNode {
  if (!elem) {
    return React.createElement(def.elem, def.props, ...(def.children ? mergeChildren(def.children, undefined) : []));
  }
  let { children } = elem.props;
  if (def.children && children) {
    children = mergeChildren(def.children, children);
  }
  return React.cloneElement(elem, { ...def.props, children });
}

type KeyMap = Map<string, React.ReactElement<any>>;

function getKeyedChildren(children?: ReactChildren) {
  const map: KeyMap = new Map();

  if (!children) {
    return map;
  }
  React.Children.forEach(children, (child: React.ReactNode) => {
    if (isReactElement(child) && child.key) {
      map.set(String(child.key), child);
    }
  });

  return map;
}

function isReactElement(elem: React.ReactNode): elem is React.ReactElement<any> {
  return typeof elem === "object" && elem !== null && "type" in elem && "props" in elem;
}
