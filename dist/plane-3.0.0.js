/*!
 * C37 in 20-06-2014 at 23:41:26 
 *
 * plane version: 3.0.0
 * licensed by Creative Commons Attribution-ShareAlike 3.0
 *
 * Copyright - C37 http://c37.co - 2014
 */

(function (window) {
"use strict";
var define, require;

(function () { //http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition
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



define("geometric/shape", ['require', 'exports'], function (require, exports) {

    function Shape(uuid, name, locked, visible, selected) {

        this.uuid = uuid;
        this.name = name;
        this.locked = locked;
        this.visible = visible;
        this.selected = selected;

    };
    Shape.prototype = {
        rotate: function (value) {
            return true;
        },
        scale: function (value) {
            return this;
        },
        move: function (point) {
            return true;
        },
        contains: function (point) {
            return false;
        },
        toJson: function () {
            return JSON.stringify(this);
        }
    };

    exports.Shape = Shape;
});
define("plane", ['require', 'exports'], function (require, exports) {

    var Arc = require('shapes/arc').Arc;
    
    
    
    
    
    

    exports.Arc = Arc;
});
define("shapes/arc", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Arc = (function (base) {

        function Arc(attrs) {

            this.type = 'arc';
            this.point = attrs.point;
            this.radius = attrs.radius;
            this.startAngle = attrs.startAngle;
            this.endAngle = attrs.endAngle;
            this.clockWise = attrs.clockWise;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);

        };
        Arc.prototype = Shape.prototype;

        return Arc;
        
    })(Shape);

    exports.Arc = Arc;
});
define("geometric/bézier", ['require', 'exports'], function (require, exports) {

    var f001 = function () {
        alert('f001 - b');
    }



    exports.f001 = f001;
});
define("shapes/circle", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Circle = (function (base) {

        function Circle(attrs) {

            this.type = 'circle';
            this.point = attrs.point;
            this.radius = attrs.radius;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);

        }
        Circle.prototype = Shape.prototype;

        return Circle;

    })(Shape);

    exports.Circle = Circle;
});
define("shapes/ellipse", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Ellipse = (function (base) {

        function Ellipse(attrs) {

            this.type = 'ellipse';
            this.point = attrs.point;
            this.radiusY = attrs.radiusY;
            this.radiusX = attrs.radiusX;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);

        }
        Ellipse.prototype = Shape.prototype;

        return Ellipse;
        
    })(Shape);

    exports.Ellipse = Ellipse;
});
define("shapes/line", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Line = (function (base) {

        function Line(attrs) {

            this.type = 'line';
            this.points = attrs.points;
            this.style = attrs.style;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        }
        Line.prototype = Shape.prototype;

        return Line;
        
    })(Shape);

    exports.Line = Line;
});
define("shapes/polygon", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Polygon = (function (base) {

        function Polygon(attrs) {

            this.type = 'polygon';
            this.points = attrs.points;
            this.sides = attrs.sides;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        }
        Polygon.prototype = Shape.prototype;

        return Polygon;
        
    })(Shape);

    exports.Polygon = Polygon;
});
define("shapes/rectangle", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Rectangle = (function (base) {

        function Rectangle(attrs) {

            this.type = 'rectangle';
            this.point = attrs.point;
            this.height = attrs.height;
            this.width = attrs.width;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        }
        Rectangle.prototype = Shape.prototype;

        return Rectangle;
        
    })(Shape);

    exports.Rectangle = Rectangle;
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
define("utility/object", ['require', 'exports'], function (require, exports) {

    /*
     * Copy the enumerable properties of p to o, and return o
     * If o and p have a property by the same name, o's property is overwritten
     * This function does not handle getters and setters or copy attributes
     */
    function extend(o, p) {
        for (prop in p) { // For all props in p.
            o[prop] = p[prop]; // Add the property to o.
        }
        return o;
    }

    /*
     * Copy the enumerable properties of p to o, and return o
     * If o and p have a property by the same name, o's property is left alone
     * This function does not handle getters and setters or copy attributes
     */
    function merge(o, p) {
        for (prop in p) { // For all props in p
            if (o.hasOwnProperty[prop]) continue; // Except those already in o
            o[prop] = p[prop]; // Add the property to o
        }
        return o;
    }

    /*
     * Remove properties from o if there is not a property with the same name in p
     * Return o
     */
    function restrict(o, p) {
        for (prop in o) { // For all props in o
            if (!(prop in p)) delete o[prop]; // Delete if not in p
        }
        return o;
    }

    /*
     * For each property of p, delete the property with the same name from o
     * Return o
     */
    function subtract(o, p) {
        for (prop in p) { // For all props in p
            delete o[prop]; // Delete from o (deleting a nonexistent prop is harmless)
        }
        return o;
    }

    /* 
     * Return a new object that holds the properties of both o and p.
     * If o and p have properties by the same name, the values from o are used
     */
    function union(o, p) {
        return extend(extend({}, o), p);
    }

    /*
     * Return a new object that holds only the properties of o that also appear
     * in p. This is something like the intersection of o and p, but the values of
     * the properties in p are discarded
     */
    function intersection(o, p) {
        return restrict(extend({}, o), p);
    }

    /*
     * Return an array that holds the names of the enumerable own properties of o
     */
    function keys(o) {
        if (typeof o !== "object") throw TypeError(); // Object argument required
        var result = []; // The array we will return
        for (var prop in o) { // For all enumerable properties
            if (o.hasOwnProperty(prop)) // If it is an own property
                result.push(prop); // add it to the array.
        }
        return result; // Return the array.
    }


    exports.extend = extend;
    exports.merge = merge;
    exports.restrict = restrict;
    exports.subtract = subtract;
    exports.union = union;
    exports.intersection = intersection;
    exports.keys = keys;
});

window.Plane = require("plane");
})(window);