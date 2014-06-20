/*!
 * C37 in 20-06-2014 at 16:26:45 
 *
 * plane version: 3.0.0
 * licensed by Creative Commons Attribution-ShareAlike 3.0
 *
 * Copyright - C37 http://c37.co - 2014
 */

(function(window) {
var define, require;

//http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition
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
            if (deps[i] === 'require') {
                reified.push(require);
            } else if (deps[i] === 'exports') {
                reified.push(exports = {});
            } else {
                reified.push(require(deps[i]));
            }
        }

        var value = callback.apply(this, reified);
        return seen[name] = exports || value;
    };
})();
define("geometric/bézier", ['require', 'exports'], function (require, exports) {

    var f001 = function () {
        alert('f001 - b');
    }



    exports.f001 = f001;
});



define("plane", ['require', 'exports'], function (require, exports) {

    var bézier = require('geometric/bézier');
    
    
    var f001 = function(){
        alert('f001 - 1');
        bézier.f001();
    }
    
    
    
    

    exports.f001 = f001;
});













define("utility/math", ['require', 'exports'], function (require, exports) {

    function uuid(length, radix) {
        // http://www.ietf.org/rfc/rfc4122.txt
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
            uuid = [],
            i;
        radix = radix || chars.length;

        if (length) {
            for (i = 0; i < length; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            var r;

            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('').toLowerCase();
    }

    exports.uuid = uuid;
});


window.Plane = require("plane");
})(window);