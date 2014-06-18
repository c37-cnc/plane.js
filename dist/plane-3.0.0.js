/*!
 * C37 in 18-06-2014 at 13:10:30 
 *
 * plane version: 3.0.0
 * licensed by Creative Commons Attribution-ShareAlike 3.0
 *
 * Copyright - C37 http://c37.co - 2014
 */

(function(window) {
var define, require;

(function () {
    var registry = {},
        seen = {};

    define = function (name, deps, callback) {
        registry[name] = {
            deps: deps,
            callback: callback
        };
    };

    require = function (name) {
        if (seen[name]) {
            return seen[name];
        }
        seen[name] = {};

        var mod = registry[name];
        if (!mod) {
            throw new Error("Module '" + name + "' not found.");
        }

        var deps = mod.deps,
            callback = mod.callback,
            reified = [],
            exports;

        for (var i = 0, l = deps.length; i < l; i++) {
            if (deps[i] === 'exports') {
                reified.push(exports = {});
            } else {
                reified.push(require(deps[i]));
            }
        }

        var value = callback.apply(this, reified);
        return seen[name] = exports || value;
    };
})();
define("geometric/bézier", 
  [],
  function() {
    "use strict";

  });
define("geometric/intersection", 
  [],
  function() {
    "use strict";

  });
define("geometric/point", 
  [],
  function() {
    "use strict";

  });
define("geometric/polynomial", 
  [],
  function() {
    "use strict";

  });
define("plane", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var f001 = function () {
        alert('sasas');
    }

    var f002 = function () {
        return false;
    }

    var f003 = function(){
        return true;
    }

    __exports__.f001 = f001;
    __exports__.f002 = f002;
    __exports__.f003 = f003;
  });
define("shapes/arc", 
  [],
  function() {
    "use strict";

  });
define("shapes/base", 
  [],
  function() {
    "use strict";

  });
define("shapes/circle", 
  [],
  function() {
    "use strict";

  });
define("shapes/ellipse", 
  [],
  function() {
    "use strict";

  });
define("shapes/line", 
  [],
  function() {
    "use strict";

  });
define("shapes/polygon", 
  [],
  function() {
    "use strict";

  });
define("shapes/rectangle", 
  [],
  function() {
    "use strict";

  });
define("structure/layer", 
  [],
  function() {
    "use strict";

  });
define("structure/render", 
  [],
  function() {
    "use strict";

  });
define("structure/tools", 
  [],
  function() {
    "use strict";

  });
define("utility/export", 
  [],
  function() {
    "use strict";

  });
define("utility/graphic", 
  [],
  function() {
    "use strict";

  });
define("utility/import", 
  [],
  function() {
    "use strict";

  });
define("utility/math", 
  [],
  function() {
    "use strict";

  });
define("utility/polyfill", 
  [],
  function() {
    "use strict";

  });
define("utility/types", 
  [],
  function() {
    "use strict";

  });
window.Plane = require("plane");
})(window);