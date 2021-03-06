var _ = require("lodash");
var React = require("react/addons");
var utils = React.addons.TestUtils;

function TestNode(element) {

  this.element = element;

  this.ref = this.element._reactInternalInstance._currentElement.ref;

  this._previousRefNodes = [];
  this._previousRefCollectionKeys = [];

  this.simulate = _.mapValues(utils.Simulate, function (fn) {
    return _.bind(function (eventData) {
      fn(this.getDOMNode(), eventData);
    }, this);
  }, this);

  Object.defineProperty(this, "state", {
    get: function () {
      return this.element.state;
    }
  });

  Object.defineProperty(this, "value", {
    get: function () {
      return this.getDOMNode().value;
    },
    set: function (value) {
      this.getDOMNode().value = value;
      this.simulate.change({
        target: {
          value: value
        }
      });
    }
  });

  var protectedProperties = _.keys(this);

  updateRefs(this);
  updateRefCollections(this);

  wrapComponentDidUpdate(this);

  function wrapComponentDidUpdate(node) {
    var oldComponentDidUpdate = node.element.componentDidUpdate;

    node.element.componentDidUpdate = function () {
      updateRefs(node);
      updateRefCollections(node);
      if (oldComponentDidUpdate) {
        oldComponentDidUpdate.apply(this, arguments);
      }
    };
  }

  function updateRefs(node) {
    var nextRefs = node.element.refs;

    var nextRefNodes = _.map(nextRefs, function (nextRef, refKey) {
      var nextRefNode = node[refKey] || new TestNode(nextRef);
      ensureSafeRefName(refKey);
      node[refKey] = nextRefNode;
      return nextRefNode;
    });

    _(node._previousRefNodes)
      .difference(nextRefNodes)
      .each(function (deadRefNode) {
        delete node[deadRefNode.ref];
      })
      .value();

    node._previousRefNodes = nextRefNodes;
  }

  function updateRefCollections(node) {
    var nextRefCollections = utils.findAllInRenderedTree(node.element, function (child) {
      var ownerInstance = child._reactInternalInstance._currentElement._owner;
      var childInstance = node.element._reactInternalInstance;
      var isOwned = ownerInstance && childInstance._rootNodeID === ownerInstance._rootNodeID;
      return isOwned && _.has(child.props, "refCollection");
    });

    var nextRefCollectionKeys = _.map(nextRefCollections, function (nextRefCollection) {
      var refKey = nextRefCollection.props.refCollection;
      ensureSafeRefName(refKey);

      node[refKey] = node[refKey] || [];

      var children = getDirectChildren(nextRefCollection);
      node[refKey] = _.map(children, function (child) {
        var previousNode = _.find(node[refKey], function (previousNode) {
          return previousNode.element === child;
        });
        return previousNode || new TestNode(child);
      });

      return refKey;
    });

    _(node._previousRefCollectionKeys)
      .difference(nextRefCollectionKeys)
      .each(function (deadRefCollectionKey) {
        delete node[deadRefCollectionKey];
      })
      .value();

    node._previousRefCollectionKeys = nextRefCollectionKeys;
  }

  function ensureSafeRefName(refName) {
    if (_.contains(protectedProperties, refName)) {
      throw new Error("Attempted to overwrite protected TestNode method with ref: " + refName);
    }
  }

}

TestNode.prototype = {

  getDOMNode: function () {
    // support react-bootstrap elements
    if (this.element.getInputDOMNode) {
      return this.element.getInputDOMNode();
    }
    return this.element.getDOMNode();
  },

  click: function () {
    return this.simulate.click();
  },

  getAttribute: function (attributeName) {
    return this.getDOMNode().getAttribute(attributeName);
  },

  getClassName: function () {
    return this.getAttribute("class");
  },

  getProp: function (propName) {
    return this.element.props[propName];
  },

  isMounted: function () {
    return !!this.element.isMounted();
  }

};

function getDirectChildren(element) {
  var children = element
    ._reactInternalInstance
    ._renderedComponent
    ._renderedChildren;

  return _.map(children, function (child) {
    return child._instance;
  });
}

module.exports = TestNode;