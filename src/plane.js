window.plane = (function (window) {

    // private property
    var version = ':-]';


    // private method
    function m001() {
        console.log('m001');
    }

    /* 
        In software engineering, a mediator is a behavioral design pattern that allows us to
        expose a unified interface through which the different parts of a system may communicate.
    */
    var mediator = (function () {
        // Storage for our topics/events
        var channels = {};
        // Subscribe to an event, supply a callback to be executed
        // when that event is broadcast
        var subscribe = function (channel, fn) {
            if (!channels[channel]) channels[channel] = [];
            channels[channel].push({
                context: this,
                callback: fn
            });
            return this;

        };
        // Publish/broadcast an event to the rest of the application
        var publish = function (channel) {
            if (!channels[channel]) return false;
            var args = Array.prototype.slice.call(arguments, 1);
            for (var i = 0, l = channels[channel].length; i < l; i++) {
                var subscription = channels[channel][i];
                subscription.callback.apply(subscription.context, args);
            }
            return this;
        };
        return {
            publish: publish,
            subscribe: subscribe,
            installTo: function (obj) {
                obj.subscribe = subscribe;
                obj.publish = publish;
            }
        };
    })();


    // public method
    return {
        initialize: function (config) {

            console.log('initialize - plane');
            console.log(plane.utility.math.uuid(9, 16));

            plane.layer.initialize();
            plane.shape.initialize();

            return true;
        },
        mediator: mediator,
        object: {}
    }

})(window);

plane.utility = (function (plane) {


    var math = {
        uuid: function (length, radix) {
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
        },
        parseFloat: function (float, decimal) {
            return Number(parseFloat(float).toFixed(decimal));
        },
        // Converts from degrees to radians.
        radians: function (degrees) {
            return degrees * (Math.PI / 180);
        },
        // Converts from radians to degrees.
        degrees: function (radians) {
            return radians * (180 / Math.PI);
        }
    }

    var object = {
        inherits: function (f, p) {
            f.prototype = new p();
            f.constructor = f;
            return f;
        },
        /*
         * Copy the enumerable properties of p to o, and return o
         * If o and p have a property by the same name, o's property is overwritten
         * This function does not handle getters and setters or copy attributes
         */
        extend: function (o, p) {
            for (var prop in p) { // For all props in p.
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor
                // 2014.08.08 11:00 - lilo - alteração para funcionar com propriedas e função "not own (prototype chain)" do objeto
                var desc = Object.getOwnPropertyDescriptor(p, prop);
                if (desc) {
                    Object.defineProperty(o, prop, desc); // add the property to o.
                } else {
                    o[prop] = p[prop];
                }
            }
            return this;
            // 2014.11.27 2047 - lilo - method chaining
            // return o;
        }

    }



    return {
        math: math,
        object: object
    };


})(plane);

plane.layer = (function (plane) {

    var children = new Map();




    plane.mediator.subscribe('layer|children|store', function (shape) {
        children.set(plane.utility.math.uuid(9, 16), shape);
    });


    return {
        initialize: function (config) {
            console.log('initialize - layer');
            return true;
        },
        list: function () {

            children.forEach(function (value, key, map) {
                console.log(value);
                console.log(key);
                console.log(map);
            });

            return children.values();
        }
    };

})(plane);

plane.shape = (function (plane) {



    return {
        initialize: function (config) {
            console.log('initialize - shape');
            return true;
        },
        create: function (attrs) {

            var shape = attrs;

            plane.mediator.publish('layer|children|store', shape);
        }
    };

})(plane);

plane.object.shape = (function (plane) {


    function Shape() {};



    return Shape;

})(plane);


plane.object.arc = (function (plane) {


    function Arc() {};

    return {};

})(plane);