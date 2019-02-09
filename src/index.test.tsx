import React from "react";
import { mergeChildren, ChildDefinition } from "./";
import { renderToStaticMarkup } from "react-dom/server";

function apply(definition: ChildDefinition, children: React.ReactNode | React.ReactNodeArray) {
  return renderToStaticMarkup(<>{mergeChildren(definition, children)}</>);
}

describe("rendez", () => {
  it("should create new text nodes", () => {
    const out = apply(["some text"], []);
    expect(out).toMatchInlineSnapshot(`"some text"`);
  });

  it("should reorder react elements based on key", () => {
    const out = apply(
      ["some text ", { elem: "elem2" }, " other text ", { elem: "elem1" }, " and final text"],
      [<em key="elem1">with children</em>, <input key="elem2" placeholder="foo" />],
    );
    expect(out).toMatchInlineSnapshot(
      `"some text <input placeholder=\\"foo\\"/> other text <em>with children</em> and final text"`,
    );
  });

  it("should pass additional props to react elements", () => {
    const out = apply([{ elem: "input", props: { placeholder: "foo" } }], [<input key="input" />]);
    expect(out).toMatchInlineSnapshot(`"<input placeholder=\\"foo\\"/>"`);
  });

  it("should create new elements if they can’t be found", () => {
    const out = apply(["with an ", { elem: "em", children: ["emphasis"] }], []);
    expect(out).toMatchInlineSnapshot(`"with an <em>emphasis</em>"`);
  });

  it.skip("should flatten fragments", () => {
    const out = apply(
      [{ elem: "1" }, { elem: "0" }],
      <>
        <>
          remove me <li key={0}>but not me</li>
        </>
        <>
          <li key={1}>or me</li> and me too
        </>
      </>,
    );
    expect(out).toMatchInlineSnapshot();
  });
});
