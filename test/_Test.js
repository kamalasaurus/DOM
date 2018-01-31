describe('Test_', function() {

  describe('The _ class', function() {
    it('exists', function() {
      expect(_).toEqual(jasmine.any(Object));
    });

    it('has the method `noop`', function() {
      expect(_.noop).toEqual(jasmine.any(Function));
    });

    describe('has the method `fname` that', function() {
      it('exists', function() {
        expect(_.fname).toEqual(jasmine.any(Function));
      });
      it('returns name of a function declaration (function fn() {}) reliably for all browsers ', function() {
        expect(_.fname(function hello() {})).toBe('hello');
      });
    });

    describe('has the method `cname` that', function() {
      it('exists', function() {
        expect(_.cname).toEqual(jasmine.any(Function));
      });
      it('returns its constructor name for custom constructor given an instance', function() {
            function ClassConstructor() {}
            var oneInstance = new ClassConstructor();
        expect(_.cname(oneInstance)).toBe('ClassConstructor');

      });
      it('returns its DOM interface name given an HTML element', function() {
        var div = document.createElement('div');
        expect(_.cname(div)).toBe('HTMLDivElement');
      });
    });

    describe('has the method `isDOMElement` that', function() {
      it('exists', function() {
        expect(_.isDOMElement).toEqual(jasmine.any(Function));
      });
      it('returns true for DOM elements', function() {
        var div = document.createElement('div');
        expect(_.isDOMElement(div)).toBe(true);
      });
      it('returns false otherwise', function() {
        expect(_.isDOMElement({})).toBe(false);
      });

    });

    describe('has the method `isOfDOMType` that', function() {
      it('exists', function() {
        expect(_.isOfDOMType).toEqual(jasmine.any(Function));
      });
      it('returns true if given node is of the given type, insensitive to case', function() {
        var div = document.createElement('div');
        expect(_.isOfDOMType(div, 'dIV')).toBe(true);
      });
      it('returns false otherwise', function() {
        var div = document.createElement('div');
        expect(_.isOfDOMType(div, 'img')).toBe(false);
      });
    });

    describe('has the method `isType` that', function() {
      it('exists', function() {
        expect(_.isType).toEqual(jasmine.any(Function));
      });
      it('returns true if given object is of the given type', function() {
        expect(_.isType({}, 'Object')).toBe(true);
      });
      it('returns false if given object is NOT of the given type', function() {
        expect(_.isType(3, 'String')).toBe(false);
      });
    });

    describe('has the method `isString` that', function() {
      it('exists', function() {
        expect(_.isString).toEqual(jasmine.any(Function));
      });
      it('returns true if passed in a string', function() {
        expect(_.isString('')).toBe(true);
      });
      it('returns false otherwise', function() {
        expect(_.isString({})).toBe(false);
      });
    });

    describe('has the method `isFunction` that', function() {
      it('exists', function() {
        expect(_.isFunction).toEqual(jasmine.any(Function));
      });
      it('returns true if passed in a function', function() {
        expect(_.isFunction(function() {})).toBe(true);
      });
      it('returns false otherwise', function() {
        expect(_.isFunction({})).toBe(false);
      });
    });

    describe('has the method `isUndefined` that', function() {
      it('exists', function() {
        expect(_.isUndefined).toEqual(jasmine.any(Function));
      });
      it('returns true given `undefined` values', function() {
        expect(_.isUndefined(undefined)).toBe(true);
      });
      it('returns false otherwise', function() {
        expect(_.isUndefined(null)).toBe(false);
      });
    });

    describe('has the method `isNonNullObj` that', function() {
      it('exists', function() {
        expect(_.isNonNullObj).toEqual(jasmine.any(Function));
      });
      it('returns true when passed an object that is not `null`', function() {
        expect(_.isNonNullObj({})).toEqual(true);
      });
      it('returns false when passed `null`', function() {
        expect(_.isNonNullObj(null)).toEqual(false);
      });
      it('returns false when passed something not an object', function() {
        expect(_.isNonNullObj('string')).toEqual(false);
      });
    });

    describe('has the method `isDefined` that', function() {
      it('exists', function() {
        expect(_.isDefined).toEqual(jasmine.any(Function));
      });
      it('returns false given `undefined` values', function() {
        expect(_.isDefined(null)).toBe(true);
      });
      it('returns true otherwise', function() {
        expect(_.isDefined(undefined)).toBe(false);
      });
    });

    describe('has the method `toArray` that', function() {
      it('exists', function() {
        expect(_.toArray).toEqual(jasmine.any(Function));
      });
      it('converts array-like elements to arrays', function() {
        var args;
        (function (a, b, c) { args = arguments; })('hello', 'there', 'friend');
        expect(_.toArray(args)).toEqual(['hello', 'there', 'friend']);
      });
    });

    describe('has the method `mergeObjects` that', function() {
      it('exists', function() {
        expect(_.mergeObjects).toEqual(jasmine.any(Function));
      });
      it('combines multiple source objects to one object in order', function() {
        var a = {'hello': 'there', 'good': 'friar'};
        var b = {'cheesy': 'raclette', 'dry': 'wine'};
        var c = {'extra': 'ok'};
        expect(_.mergeObjects(a, b, c)).toEqual({
          hello: 'there',
          good: 'friar',
          cheesy: 'raclette',
          dry: 'wine',
          extra: 'ok'
        });
      });
      it('allows newer source objects override properties of the same name', function() {
        var a = {'hello': 'a', 'another': 'ok'};
        var b = {'hello': 'b'};
        expect(_.mergeObjects(a, b)).toEqual({
          hello: 'b',
          another: 'ok'
        });
      });
    });

    describe('has the method `clone` that', function() {
      it('exists', function() {
        expect(_.clone).toEqual(jasmine.any(Function));
      });
      it('clones an object whose values are numbers', function() {
        expect(_.clone({a: 123})).toEqual({a: 123});
      });
      it('clones an object whose values are strings', function() {
        expect(_.clone({a: 's'})).toEqual({a: 's'});
      });
      it('clones an object whose values are arrays', function() {
        expect(_.clone({a: [1, 2, [3]]})).toEqual({a: [1, 2, [3]]});
      });
      it('clones an object whose values are object literals', function() {
        expect(_.clone({a: {b: 1}})).toEqual({a: {b: 1}});
      });
      it('clones an object whose values are nested object literals', function() {
        expect(_.clone({a: {b: {c: 1}}})).toEqual({a: {b: {c: 1}}});
      });
    });

    describe('has the method `del` that', function() {
      it('exists', function() {
        expect(_.del).toEqual(jasmine.any(Function));
      });
      it('deletes a property on a given object', function() {
        var obj = {ac: 1, b: 2};
        obj = _.del(obj, 'ac');
        expect(obj).toEqual({b: 2});
      });
    });

    describe('has the method `throttle` that', function() {
      var time, timeElapses;
      beforeEach(function() {
        backupGlobalReference('Date');
        time = 1;
        window.Date = function() {
          return {
            getTime: function () { return time; }
          }
        };
        timeElapses = function(diff) {
          time += diff;
        };

      });
      afterEach(function() {
        restoreGlobalReference('Date');
      });
      it('exists', function() {
        expect(_.throttle).toEqual(jasmine.any(Function));
      });
      it('always trigger the first time when the function was being called', function() {
        var cb = jasmine.createSpy('cb');
        var throttledCb = _.throttle(cb, 100);
        throttledCb();
        throttledCb();
        throttledCb();
        expect(cb.callCount).toBe(1);
      });
      it('throttles passed function so it will be triggered at most once in the past time interval', function() {
        var cb = jasmine.createSpy('cb');
        var throttledCb = _.throttle(cb, 100);
        throttledCb();
        throttledCb();
        throttledCb();
        timeElapses(100);
        throttledCb();
        throttledCb();
        expect(cb.callCount).toBe(2);
      });
    });
  });
});


