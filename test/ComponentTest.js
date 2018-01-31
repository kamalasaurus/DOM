describe('Component', function() {

  describe('The Component class that', function() {
    it('exists', function() {
      expect(Component).toEqual(jasmine.any(Function));
    });

    describe('creates a new instance of component that', function() {
      var comp;
      beforeEach(function() {
        comp = new Component('div', {'style.width': '100px', 'style.height': '50px'});
      });
      it('has the attribute element', function() {
        expect(comp.element.constructor).toBe(window.HTMLDivElement);
      });

      it('has the attribute parent', function() {
        expect(comp.parent).toBe(undefined);
      });

      it('has the attribute children', function() {
        expect(comp.children.constructor).toBe(window.Array);
      });

      describe('has the method remove that', function() {
        it('exists', function() {
          expect(comp.remove).toEqual(jasmine.any(Function));
        });
        it('removes the Element from the DOM', function() {
          var parentComp = new Component('div', {'style.width': '200px', 'style.height': '100px'});
          parentComp.appendChild(comp);
          expect(comp.remove().parent).toBe(undefined);
        });
      });

      describe('has the method appendChild that', function() {
        it('exists', function() {
          expect(comp.appendChild).toEqual(jasmine.any(Function));
        });

        it('appends children to the comp', function() {
          var childComp = new Component('div', {'style.width': '20px', 'style.height': '10px'});
          comp.appendChild(childComp);
          expect(comp.children[0]).toBe(childComp);
        });
      });

      describe('has the method appendTo that', function() {
        it('exists', function() {
          expect(comp.appendTo).toEqual(jasmine.any(Function));
        });

        it('attaches the component to an Element or comp', function() {
          var div = document.createElement('div');
          comp.appendTo(div);
          expect(comp.parent).toBe(div);
        });
      });

      describe('has the method updateProps that', function() {
        it('exists', function() {
          expect(comp.updateProps).toEqual(jasmine.any(Function));
        });

        it('changes the attributes of a comp', function() {
          var comparison = new Component('div', {'style.width': '50px', 'style.height': '25px'});
          comp.updateProps({'style.width': '50px', 'style.height': '25px'});
          expect(comp.element.style.width).toBe(comparison.element.style.width);
        });
      });

      describe('has the method updateProp that', function() {
        it('exists', function() {
          expect(comp.updateProp).toEqual(jasmine.any(Function));
        });

        it('changes an attribute of a component', function() {
          comp.updateProp('style.backgroundColor', 'red');
          expect(comp.element.style.backgroundColor).toBe('red');
        });
      });

      describe('has the method getName that', function() {
        it('exists', function() {
          expect(comp.getName).toEqual(jasmine.any(Function));
        });

        it('gets the element name of a component', function() {
          expect(comp.getName()).toBe('div');
        });
      });

      describe('has the method attr that', function() {
        it('exists', function() {
          expect(comp.attr).toEqual(jasmine.any(Function));
        });

        it('gets an attribute of a component', function() {
          var a = new Component('a', {'href': 'http://hello.com'});
          expect(a.attr('href')).toBe('http://hello.com');
        });
      });

      describe('has the method is that', function() {
        it('exists', function() {
          expect(comp.is).toEqual(jasmine.any(Function));
        });

        it('checks the name of the component against a tag name', function() {
          expect(comp.is('div')).toBe(true);
        });
      });

      describe('has the method getWindow that', function() {
        it('exists', function() {
          expect(comp.getWindow).toEqual(jasmine.any(Function));
        });

        it('gets the window controlling a component', function() {
          expect(comp.getWindow()).toBe(window);
        });
      });

      describe('has the method getDocument that', function() {
        it('exists', function() {
          expect(comp.getDocument).toEqual(jasmine.any(Function));
        });

        it('gets the document controlling a component', function() {
          expect(comp.getDocument()).toBe(document);
        });
      });

      describe('has the method addEventListener that', function() {
        it('exists', function() {
          expect(comp.addEventListener).toEqual(jasmine.any(Function));
        });

        it('adds an event listener to the component', function() {
          var cb = jasmine.createSpy('cb');
          comp.addEventListener('somethinghappened', cb);
          comp.dispatchEvent(DOM.createEvent('somethinghappened'));
          expect(cb).toHaveBeenCalled();
        });
      });

      describe('has the method removeEventListener that', function() {
        it('exists', function() {
          expect(comp.removeEventListener).toEqual(jasmine.any(Function));
        });

        it('removes an event listener from the component', function() {
          var cb = jasmine.createSpy('cb');
          comp.addEventListener('somethinghappened', cb);
          comp.removeEventListener('somethinghappened', cb);
          comp.dispatchEvent(DOM.createEvent('somethinghappened'));
          expect(cb).not.toHaveBeenCalled();
        });
      });

      describe('has the method dispatchEvent that', function() {
        it('exists', function() {
          expect(comp.removeEventListener).toEqual(jasmine.any(Function));
        });

        it('dispatches an event from component', function() {
          var cb = jasmine.createSpy('cb');
          comp.addEventListener('somethinghappened', cb);
          comp.dispatchEvent(DOM.createEvent('somethinghappened'));
          expect(cb).toHaveBeenCalled();
        });
      });
    });
  });
});


