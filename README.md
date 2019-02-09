# rendez

[![Build Status](https://img.shields.io/travis/Swatinem/rendez.svg)](https://travis-ci.org/Swatinem/rendez)
[![Coverage Status](https://img.shields.io/codecov/c/github/Swatinem/rendez.svg)](https://codecov.io/gh/Swatinem/rendez)

Rendez means
[to order / to arrange](https://en.bab.la/dictionary/hungarian-english/rendez)
in hungarian, and brings order to your react subtrees.

It will merge two react subtrees, `A` and `B`, while arranging the elements from
subtree `B` into the order given by subtree `A`, based on their `key`, and
merging their props.

This was created as a way to make `React Overlays` possible in
[intl-codegen](https://github.com/eversport/intl-codegen/issues/15)

## Example

### A

```tsx
<>
  <em key="a" className="a-has-precedence">
    A
  </em>{" "}
  will provide the surrounding non-element nodes, as well as the <em key="order" /> in which to arrange the elements,
  and <em>B</em> will provide: <div key="provide" />
</>
```

### B

```tsx
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
</>
```

### Result

```html
<em class="a-has-precedence">A</em> will provide the surrounding non-element nodes, as well as the <em>*order*</em> in
which to arrange the elements, and <em>B</em> will provide:
<ul>
  <li>the element type</li>
  <li>some props, unless overridden by A</li>
  <li>and some children, unless overridden by A</li>
</ul>
```
