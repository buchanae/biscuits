(function outer (modules, cache, entries) {
    // Save the require from previous bundle to this closure if any
    var previousRequire = typeof require == "function" && require;
    // TODO pass this in like cache?
    var mocks = {};

    function newRequire(name, jumped){
        if(!mocks[name]) {
            if(!cache[name]) {
                if(!modules[name]) {
                    // if we cannot find the the module within our internal map or
                    // cache jump to the current global require ie. the last bundle
                    // that was added to the page.
                    var currentRequire = typeof require == "function" && require;
                    if (!jumped && currentRequire) return currentRequire(name, true);

                    // If there are other bundles on this page the require from the
                    // previous one is saved to 'previousRequire'. Repeat this as
                    // many times as there are bundles until the module is found or
                    // we exhaust the require chain.
                    if (previousRequire) return previousRequire(name, true);
                    throw new Error('Cannot find module \'' + name + '\'');
                }
                var m = cache[name] = {exports: {}};

                function moduleRequire(x, mock) {
                    var id = modules[name][1][x];
                    if (mock) {
                        // TODO allow mock to be a string which points to a mock module
                        mocks[id] = mock;
                        // TODO return what?
                        //      if the mock is given as a string, it'd be useful
                        //      to return the mock object.
                        return mock;
                    }
                    return newRequire(id ? id : x);
                };

                modules[name][0].call(m.exports, moduleRequire, m,
                                      m.exports, outer, modules, cache, entries);
            }
            // TODO no need to cache entry points in tests
            return cache[name].exports;
        }
        return mocks[name].exports;
    }

    var saveCache;

    function makeSuite(entry) {
      setup(function() {
        saveCache = {};
        Object.keys(cache).forEach(function(key) {
          saveCache[key] = cache[key];
        });
        cache = {};
        mocks = {};
      });

      teardown(function() {
        cache = saveCache;
      });

      // TODO
      suite('', function() {
        newRequire(entry);
      });
    }

    for (var i = 0; i < entries.length; i++) {
      makeSuite(entries[i]);
    }
    
    // Override the current require with this new one
    return newRequire;
})
