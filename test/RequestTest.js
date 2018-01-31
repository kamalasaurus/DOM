describe('TestRequest', function() {

  describe('The Request class', function() {

    beforeEach(function() {
      _ = {};
      _.isTruthy = function(arg) {
        return Boolean(arg);
      };
      _.noop = function() {};
    });

    it('exists', function() {
      expect(Request).toEqual(jasmine.any(Object));
    });

    describe('has the method `get` that', function() {
      var onReadyStateChange, onError, promise;
      beforeEach(function() {
        backupGlobalReference('XMLHttpRequest');
        spyOn(XMLHttpRequest.prototype, 'open').andCallThrough();
        promise = Request.get('someurl');
      });
      afterEach(function() {
        restoreGlobalReference('XMLHttpRequest');
      });
      it('exists', function() {
        expect(Request.get).toEqual(jasmine.any(Function));
      });
      it('sends GET request to the passed url', function() {
        expect(XMLHttpRequest.prototype.open).toHaveBeenCalledWith('GET', 'someurl');
      });
      describe('returns an object that', function() {
        it('has the method `then`', function() {
          expect(promise.then).toEqual(jasmine.any(Function));
        });
      });
    });

    describe('has the method `getImg`', function() {
      beforeEach(function () {
        var tempImage = Image;
        spyOn(window, 'Image').andCallFake(function() {
          return new tempImage();
        });
        success = jasmine.createSpy();
        failure = jasmine.createSpy();
        urlMock = 'http://www.faketracker.com/1x1.gif?query=param';
        result = Request.getImg(urlMock).then(success, failure);
      });
      it('that exists and is a function', function() {
        expect(Request.getImg).toEqual(jasmine.any(Function));
      });

      describe('that when executed,', function(){
        it('creates an `Image`', function(){
          expect(window.Image).toHaveBeenCalled();
        });
        describe('returns an object with a function `then`,', function(){
          it('that exists', function(){
              expect(result.then).toEqual(jasmine.any(Function));
          });
          describe('that when immediately invoked method,', function(){
            it('expects `success` callback to be called', function(){
              result.then(function() {
                expect(success).toHaveBeenCalled();
              }, function(){})
            });
          });
        });
      });
    });

    it('which gets a containing document', function() {
      expect(Request.get('localhost')).toEqual(jasmine.any(Object));
    });

  });
});

