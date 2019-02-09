import React from "react";
import { mergeNode, mergeKeyedNodes } from "./";
import { renderToStaticMarkup } from "react-dom/server";

function node(template: React.ReactElement<any>, nodes: React.ReactElement<any>) {
  return renderToStaticMarkup(mergeNode(template, nodes));
}

function nodes(template: React.ReactNodeArray, nodes: React.ReactNodeArray) {
  return renderToStaticMarkup(React.createElement(React.Fragment, undefined, ...mergeKeyedNodes(template, nodes)));
}

describe("mergeNode", () => {
  it('should use the "type" of `node`', () => {
    expect(node(<span>foo</span>, <em>foo</em>)).toMatchInlineSnapshot(`"<em>foo</em>"`);
  });

  it('should merge "props"', () => {
    expect(node(<input placeholder="some placeholder text" />, <input className="foo" />)).toMatchInlineSnapshot(
      `"<input class=\\"foo\\" placeholder=\\"some placeholder text\\"/>"`,
    );
  });

  it('should prefer "props" of `template`', () => {
    expect(
      node(<input placeholder="some placeholder text" />, <input placeholder="will be overridden…" />),
    ).toMatchInlineSnapshot(`"<input placeholder=\\"some placeholder text\\"/>"`);
  });

  it("should leave children of `node` alone if `template` does not have any", () => {
    expect(node(<em />, <em>some children</em>)).toMatchInlineSnapshot(`"<em>some children</em>"`);
  });

  it("should remove children of `node` when `template` has its own children", () => {
    expect(node(<em children={[]} />, <em>will be removed</em>)).toMatchInlineSnapshot(`"<em></em>"`);
  });

  it("should recurse to children", () => {
    expect(
      node(
        <div>
          <ul key="ul">
            <li key={0} />
            <li key={1} />
          </ul>
        </div>,
        <div>
          <ul key="ul" className="list">
            <li key={1}>the one</li>
            <li key={0}>the zero</li>
          </ul>
        </div>,
      ),
    ).toMatchInlineSnapshot(`"<div><ul class=\\"list\\"><li>the zero</li><li>the one</li></ul></div>"`);
  });

  it("should render the README example :-)", () => {
    expect(
      node(
        <>
          <em key="a" className="a-has-precedence">
            A
          </em>{" "}
          will provide the surrounding non-element nodes, as well as the <em key="order" /> in which to arrange the
          elements, and <em>B</em> will provide: <div key="provide" />
        </>,
        <>
          <em key="order">*order*</em>
          <ul key="provide">
            <li>the element type</li>
            <li>some props, unless overridden by A</li>
            <li>and some children, unless overridden by A</li>
          </ul>
          <em key="a" className="sad-b">
            has both its className and children overridden :-(
          </em>
        </>,
      ),
    ).toMatchInlineSnapshot(
      `"<em class=\\"a-has-precedence\\">A</em> will provide the surrounding non-element nodes, as well as the <em>*order*</em> in which to arrange the elements, and <em>B</em> will provide: <ul><li>the element type</li><li>some props, unless overridden by A</li><li>and some children, unless overridden by A</li></ul>"`,
    );
  });
});

describe("mergeKeyedNodes", () => {
  it("should ignore all non-element `nodes`", () => {
    expect(nodes([], ["text", true, false, null, undefined, () => {}])).toMatchInlineSnapshot(`""`);
  });

  it("should ignore element `nodes` without a corresponding `key`", () => {
    expect(
      nodes(
        [<input key="input" />],
        [<em>no key</em>, <input key="not-referenced" />, <input key="input" placeholder="will be used" />],
      ),
    ).toMatchInlineSnapshot(`"<input placeholder=\\"will be used\\"/>"`);
  });

  it("should keep all elements in `template`", () => {
    expect(nodes([<em>elem</em>, "text", <a key="link" title="some title" />], [])).toMatchInlineSnapshot(
      `"<em>elem</em>text<a title=\\"some title\\"></a>"`,
    );
  });

  it("should re-order `nodes` based on the order of `template`", () => {
    expect(
      nodes([<em key="b" />, <em key="a" />], [<em key="a" className="a" />, <em key="b" className="b" />]),
    ).toMatchInlineSnapshot(`"<em class=\\"b\\"></em><em class=\\"a\\"></em>"`);
  });

  it("should see through `Fragment`s by default", () => {
    expect(
      nodes(
        [<em key="b" />, <em key="a" />],
        [
          <>
            <>
              <React.Fragment>
                <em key="a">a</em>
              </React.Fragment>
            </>
            <React.Fragment>
              <>
                <em key="b">b</em>
              </>
            </React.Fragment>
          </>,
        ],
      ),
    ).toMatchInlineSnapshot(`"<em>b</em><em>a</em>"`);
  });

  it("should treat `Fragment`s like `Element`s when asked to", () => {
    const out = renderToStaticMarkup(
      mergeNode(
        <>
          <a key="a" />, but this will be empty: <a key="b" />
        </>,
        <>
          <React.Fragment key="a">
            keyed fragment <em>will</em> include all children
          </React.Fragment>
          <>
            <strong key="b">unkeyed fragment loses all its children</strong>
          </>
        </>,
        { opaqueFragments: true },
      ),
    );
    expect(out).toMatchInlineSnapshot(
      `"keyed fragment <em>will</em> include all children, but this will be empty: <a></a>"`,
    );
  });
});
