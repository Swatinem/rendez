import React, { ReactNodeArray, ReactNode, ReactElement } from "react";

interface Options {
  /**
   * By default, `React.Fragment`s will be flattened and not considered by the
   * `key` matching.
   * If you would like to treat `Fragment`s like other keyed react elements,
   * set this option to `true`.
   */
  opaqueFragments?: boolean;
}

interface WithChildren {
  children?: ReactNode | ReactNodeArray;
}

/**
 * This merges the `props` and `children` of `template` into the given `node`.
 * See `mergeKeyedNodes` for how the children will be treated.
 */
export function mergeNode(
  template: ReactElement<WithChildren>,
  node: ReactElement<WithChildren>,
  options: Options = {},
): ReactElement<any> {
  let { children } = node.props;
  if (template.props.children && children) {
    children = mergeKeyedNodes(toArray(template.props.children), toArray(children), options);
  }
  return React.cloneElement(node, { ...template.props, children });
}

function toArray(nodes: ReactNode | ReactNodeArray) {
  return Array.isArray(nodes) ? nodes : [nodes];
}
/**
 * Given two `ReactNodeArray`s, this will map over all the nodes in `template`,
 * and look for each `ReactElement` will look up a corresponding node in `nodes`
 * based on `key` and then use `mergeNode` on those.
 * This will ignore all non-`ReactElement` `nodes` as well as those without
 * a corresponding element based on `key`.
 */
export function mergeKeyedNodes(
  template: ReactNodeArray,
  nodes: ReactNodeArray,
  options: Options = {},
): ReactNodeArray {
  const keyedNodes = getKeyedNodes(nodes, options);

  return template.map(template => {
    if (!React.isValidElement(template) || template.key === null) {
      return template;
    }
    const node = keyedNodes.get(template.key);
    if (!node) {
      return template;
    }

    return mergeNode(template, node);
  });
}

type KeyMap = Map<string | number, React.ReactElement<any>>;

function getKeyedNodes(children: ReactNodeArray, options: Options) {
  const map: KeyMap = new Map();

  React.Children.forEach(children, collectChildren);

  return map;

  function collectChildren(node: ReactNode) {
    if (!React.isValidElement(node)) {
      return;
    }
    if (node.key !== null) {
      map.set(node.key, node);
    } else if (node.type === React.Fragment && !options.opaqueFragments) {
      React.Children.forEach((node.props as any).children, collectChildren);
    }
  }
}
