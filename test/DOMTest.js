describe('DOMTest', function() {

  describe('The DOM module', function() {
    var fakeDoc;

     beforeEach(function() {
      backupGlobalReferenceAndInjectMock('oNative');

      fakeDoc = {
          querySelectorAll: jasmine.createSpy('querySelectorAll').andReturn([]),
          createEvent: jasmine.createSpy('createEvent').andCallFake(function() {
            return {
              initEvent: function(type) {
                this.type = type;

              }
            }
          })
      };

      var fakeFrame = {
        nodeName: 'iframe',
        style: {},
        contentWindow: {
          document: {
            body: {
              style: {}
            }
          }
        }
      };

      createSpyAt('addEventListener', fakeFrame).andCallFake(function(event, callback) {
        callback();
      });
      createSpyAt('appendChild', fakeFrame.contentWindow.document.body).andCallFake(function(child) {
        fakeFrameProps.contentWindow.document.body[child.nodeName] = child;
      });

      fakeEl = document.createElement('div');
      fakeEl.style.height = '100px';
      fakeEl.style.width = '100px';

      Component = function Component() {
        this.element = fakeEl;
        this.parent = undefined;
        this.children = [];
        return this;
      };

      createSpyAt('appendChild', fakeEl).andCallFake(function(child) {
        fakeEl[child.nodeName] = child;
      });

      createSpyAt('createElement', fakeDoc).andCallFake(function(tag) {
        if (tag === 'iframe') {
          return fakeFrame;
        } else if ('appendTest') {
          return fakeEl;
        } else {
          return { nodeName: tag, style: {} };
        }
      });
      createSpyAt('createElementNS', fakeDoc).andCallFake(function(namespace, tag) {
        if (namespace === 'http://www.w3.org/2000/svg') {
          return { nodeName: tag, style: {} };
        }
      });
      isIframe = jasmine.createSpy('isIframe').andCallFake(function(node) {
        return /iframe/i.test(node.nodeName);
      });

      prepareIframe = jasmine.createSpy('prepareIframe').andCallFake(function(node, props) {
        Object.keys(props).forEach(function(prop) {
          node[prop] = props[prop];
        });
        return node;
      });

      getNode = jasmine.createSpy('getNode').andCallFake(function(node) {
        return node;
      });

      createSpyAt('oNative.getDoc').andReturn(fakeDoc);
    });

    afterEach(function() {
      restoreGlobalReference('oNative');
    });

    it('exists', function() {
      expect(DOM).toEqual(jasmine.any(Object));
    });

    describe('has the method `get` that', function() {
      it('exists', function() {
        expect(DOM.get).toEqual(jasmine.any(Function));
      });
      describe('when passed a root node', function() {
        it('returns a list of node matching passed selector in that root node', function() {
          var rootDoc = fakeEl;
          rootDoc.querySelectorAll = jasmine.createSpy('rootDocQuerySelectorAll').andReturn([]);
          DOM.get('div', rootDoc);
          expect(rootDoc.querySelectorAll).toHaveBeenCalledWith('div');
        });
      });
      describe('when NOT passed a root node', function() {
        it('returns a list of node matching passed selector in default root node', function() {
          DOM.get('div');
          expect(fakeDoc.querySelectorAll).toHaveBeenCalledWith('div');
        });
      });
    });

    describe('has the method `getOne` that', function() {
      it('exists', function() {
        expect(DOM.getOne).toEqual(jasmine.any(Function));
      });
      it('returns a single element of a selector from a document', function() {
        var temp = document.createElement('div');
        temp.classList.add('hello');
        document.body.appendChild(temp);
        expect(DOM.getOne('.hello', document)).toBe(temp);
      });
    });

    it('has a function create', function() {
      expect(DOM.create).toEqual(jasmine.any(Function));
    });

    it('that creates an HTML Element', function() {
      expect(DOM.create('div')).toEqual(oNative.getDoc().createElement('div'));
    });

    it('or an SVG Element', function() {
      expect(DOM.create('svg')).toEqual(oNative.getDoc().createElementNS('http://www.w3.org/2000/svg', 'svg'));
    });

    it('or especially an iframe with properties', function() {
      var props = { 'style.width': '100px' };
      var createdFrame = DOM.create('iframe', props);
      expect(createdFrame.contentWindow.document.body.style.width).toBe('100px');
    });

    it('has a function setProperties', function() {
      expect(DOM.setProperties).toEqual(jasmine.any(Function));
    });

    it('that can set properties on a node', function() {
      var fakeNode = { style: {} };
      var props = {
        'style.height': '100px',
        'border': '15px'
      };
      var expected = {
        style: {
          height: '100px'
        },
        border: '15px'
      };
      DOM.setProperties(fakeNode, props);
      expect(fakeNode).toEqual(expected);
    });

    it('has a function setProperty', function() {
      expect(DOM.setProperty).toEqual(jasmine.any(Function));
    });

    it('that will change a single property on a node', function() {
      var fakeNode = { color: 'red', backgroundColor: 'black' };
      var expected = { color: 'blue', backgroundColor: 'black' };
      DOM.setProperty(fakeNode, 'color', 'blue');
      expect(fakeNode).toEqual(expected);
    });

    it('has a function appendChild', function() {
      expect(DOM.appendChild).toEqual(jasmine.any(Function));
    });

    it('that will attach a child node to the appropriate parent', function() {
      var parent = document.createElement('div');
      var child = document.createElement('div');
      DOM.appendChild(parent, child);
      expect(parent.children[0]).toEqual(child);
    });

    it('has a function remove', function() {
      expect(DOM.remove).toEqual(jasmine.any(Function));
    });

    it('that will remove a node from the DOM', function() {
      var p = document.createElement('div');
      var c = document.createElement('div');
      p.appendChild(c);
      DOM.remove(c);
      expect(p.children.length).toBe(0);
    })

    it('has a function getNodeAndDo', function() {
      expect(DOM.getNodeAndDo).toEqual(jasmine.any(Function));
    });

    it('that will perform a callback operation on a node', function() {
      var checkNode = fakeEl;
      DOM.getNodeAndDo(checkNode, function(node) {
        expect(node).toBe(checkNode);
      });
    });

    it('has a function toPx', function() {
      expect(DOM.toPx).toEqual(jasmine.any(Function));
    });

    it('that will convert a number to a string suffixed with "px"', function() {
      expect(DOM.toPx(100)).toBe('100px');
    });

    it('has a function getWidth', function() {
      expect(DOM.getWidth).toEqual(jasmine.any(Function));
    });

    it('that will retrieve the width attribute of a node', function() {
      var checkNode = fakeEl;
      expect(DOM.getWidth(checkNode)).toEqual(100);
    });

    it('has a function getHeight', function() {
      expect(DOM.getHeight).toEqual(jasmine.any(Function));
    });

    it('that will retrieve the height attribute of a node', function() {
      var checkNode = fakeEl;
      expect(DOM.getHeight(checkNode)).toEqual(100);
    });

    it('has a function getParent', function() {
      expect(DOM.getParent).toEqual(jasmine.any(Function));
    });

    it('that will retrieve the parent of a node', function() {
      var child = document.createElement('div');
      var parent = document.createElement('div');
      parent.appendChild(child);
      expect(DOM.getParent(child)).toBe(parent);
    });

    it('has a function getParentUntil', function() {
      expect(DOM.getParentUntil).toEqual(jasmine.any(Function));
    });

    it('that will recursively retrieve the parent of a node until it is a certain type', function() {
      var grandchild = document.createElement('span');
      var child = document.createElement('span');
      var parent = document.createElement('div');
      parent.appendChild((child.appendChild(grandchild), child));
      expect(DOM.getParentUntil(grandchild, 'div')).toBe(parent);
    });

    it('has a function getText', function() {
      expect(DOM.getText).toEqual(jasmine.any(Function));
    });

    it('that will retrieve the text content of all child nodes', function() {
      var textNode = document.createElement('span');
      textNode.textContent = 'hello';
      expect(DOM.getText(textNode)).toEqual('hello');
    });

    it('has a function getCdata', function() {
      expect(DOM.getCdata).toEqual(jasmine.any(Function));
    });

    it('that will retrieve the CDATA of a node', function() {
      var doc = document.implementation.createDocument('', '', null);
      var cdata = doc.createCDATASection('hello');
      var node = document.createElement('div');
      node.appendChild(cdata);
      expect(DOM.getCdata(node)).toEqual('hello');
    });

    it('has a function getName', function() {
      expect(DOM.getName).toEqual(jasmine.any(Function));
    });

    it('that will retrieve the tagName of a node', function() {
      var node = document.createElement('div');
      expect(DOM.getName(node)).toEqual('div');
    });

    it('has a function getAttribute', function() {
      expect(DOM.getAttribute).toEqual(jasmine.any(Function));
    });

    it('that will retrieve an attribute of a node', function() {
      var a = document.createElement('a');
      a.setAttribute('href', 'http://hello.com');
      expect(DOM.getAttribute(a, 'href')).toEqual('http://hello.com');
    });

    it('has a function getAttributes', function() {
      expect(DOM.getAttributes).toEqual(jasmine.any(Function));
    });

    it('that will retrieve all the attributes of a node', function() {
      var s = document.createElement('script');
      s.src = 'hello.com';
      s.type = 'text/javascript';
      expect(DOM.getAttributes(s)).toEqual({
        src: 'hello.com',
        type: 'text/javascript'
      });
    });

    describe('has the method `serializeXMLNode` that', function() {
      var serializeToStringSpy;
      beforeEach(function() {
        backupGlobalReference('XMLSerializer');
        serializeToStringSpy = jasmine.createSpy('serializeToString');
        window.XMLSerializer = jasmine.createSpy('XMLSerializer').andReturn({
          serializeToString: serializeToStringSpy
        });
      });
      afterEach(function() {
        restoreGlobalReference('XMLSerializer');
      });
      it('exists', function() {
        expect(DOM.serializeXMLNode).toEqual(jasmine.any(Function));
      });
      it('returns XML-serialized string of given node', function() {
        DOM.serializeXMLNode({});
        expect(serializeToStringSpy).toHaveBeenCalledWith({});
      });
    });

    describe('has the method `createEvent` that', function() {
      it('exists', function() {
        expect(DOM.createEvent).toEqual(jasmine.any(Function));
      });
      it('returns a custom event instance of the passed type', function() {
        expect(DOM.createEvent('hey').type).toBe('hey');
      });
    });

    describe('has the method `getData` that', function() {
      it('exists', function() {
        expect(DOM.getData).toEqual(jasmine.any(Function));
      });
      it('returns cdata if present', function() {
        var doc = document.implementation.createDocument('', '', null);
        var cdata = doc.createCDATASection('hello');
        var node = document.createElement('div');
        node.appendChild(cdata);
        expect(DOM.getData(node)).toEqual('hello');
      });
      it('returns text if present', function() {
        var node = document.createElement('div');
        node.textContent = 'hello';
        expect(DOM.getData(node)).toEqual('hello');
      });
    });

  });
});


