# react-test-tree [![Build Status](https://travis-ci.org/QubitProducts/react-test-tree.svg)](https://travis-ci.org/QubitProducts/react-test-tree)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/oliverwoodings.svg)](https://saucelabs.com/u/oliverwoodings)

`react-test-tree` is a simple, scalable and concise way of testing React components. It is an evolution of the [react-page-objects](https://github.com/QubitProducts/react-page-objects) library.

A test tree is dev-friendly representation of your entire React component tree, built by recursing through the refs of your elements.

React gives us some great utilities for testing React components, however they lead to overly-verbose boilerplate that clutters your tests. `react-test-tree` tidies this clutter away, allowing you to manipulate your components with short, concise statements:

```jsx
var BozComponent = React.createClass({
  render: function () {
    return (
      <div>
        <button ref="biz">Biz</button>
      </div>
    );
  }
});

var FooComponent = React.createClass({
  render: function () {
    return (
      <div>
        <button ref="bar">Bar</button>
        <select refCollection="baz">
          <option>blue</option>
          <option>gold</option>
        </select>
        <BozComponent ref="boz" />
      </div>
    );
  }
});

var fooTree = testTree(<FooComponent />);
fooTree.bar.click();
fooTree.boz.biz.click();
fooTree.baz.length === 2;
```

In the above example, `react-test-tree` has recursively built a tree with all refs and refCollections represented as nodes of the tree.


## refs and refCollections

You should be familiar with the `ref` prop in React. They are used when you need to reference an element in your render function. Unfortunately react does not give us an easy way to reference a collection of `ref`s as a whole. `react-test-tree` makes this possible by use of the `refCollection` prop. Declaring `refCollection` on a component will make all it's direct children available on the corresonding tree node as an array:

```jsx
var BarComponent = React.createClass({
  render: function () {
    return (
      <select ref="foo" refCollection="bar">
        <option value="blue">Blue</option>
        <option value="gold">Gold</option>
      </select>;
    );
  }
});

var barTree = testTree(<BarComponent />);
barTree.bar.length === 2;
barTree.bar[0].getAttribute("value") === "blue";
```

__Notes__:
* You can still apply a `ref` as well as a `refCollection` if you want to be able to manipulate the parent element too.
* Your `ref`s and `refCollection`s must not have the same name as any of the public properties of a test node, otherwise they will overwrite them. An error will be thrown if you attempt to do this.


## API

### `testTree(<Component />)`
Creates the tree and returns the root node, with all `ref` and `refCollection` nodes made available as properties.

### `node.state`
Returns the state of your component.

### `node.value`
Getter/setter for the element value. Should only be used if the component is a valid HTML element that accepts the value attribute.

### `node.simulate`
Instance of `React.addons.TestUtils.Simulate`, bound to the node.

### `node.click()`
Shorthand method for simulating a click on the node's element.

### `node.getAttribute(attributeName)`
Returns the specified attribute from the node's element.

### `node.getClassName()`
Shorthand method for getting the class attribute of the node's element.

### `node.getProp()`
Returns the specified prop from the node's element.

### `node.isMounted()`
Returns true if the component/element is mounted, false if not.

### `node.dispose()`
Safely unmount the tree. Will only unmount if component is already mounted. Can only be called on the root node of the tree.

### `node.getDOMNode()`
Returns the DOM node for the node.

### `node.element`
Reference to the original React element for the node.


## Contributing

* `make bootstrap` - install dependencies
* `make test` - run unit tests
* `make build` - build into `dist` folder
* `make lint` - lint the project
* `make test-watch` - run karma with the watch option
* `make release` - increment and publish to npm


## Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally
* Consider starting the commit message with an applicable emoji:
    * :lipstick: `:lipstick:` when improving the format/structure of the code
    * :racehorse: `:racehorse:` when improving performance
    * :non-potable_water: `:non-potable_water:` when plugging memory leaks
    * :memo: `:memo:` when writing docs
    * :penguin: `:penguin:` when fixing something on Linux
    * :apple: `:apple:` when fixing something on Mac OS
    * :checkered_flag: `:checkered_flag:` when fixing something on Windows
    * :bug: `:bug:` when fixing a bug
    * :fire: `:fire:` when removing code or files
    * :green_heart: `:green_heart:` when fixing the CI build
    * :white_check_mark: `:white_check_mark:` when adding tests
    * :lock: `:lock:` when dealing with security
    * :arrow_up: `:arrow_up:` when upgrading dependencies
    * :arrow_down: `:arrow_down:` when downgrading dependencies

(From [atom](https://atom.io/docs/latest/contributing#git-commit-messages))