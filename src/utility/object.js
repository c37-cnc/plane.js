define("utility/object", ['require', 'exports'], function (require, exports) {

    /*
     * Copy the enumerable properties of p to o, and return o
     * If o and p have a property by the same name, o's property is overwritten
     * This function does not handle getters and setters or copy attributes
     */
    function Extend(o, p) {
        for (var prop in p) { // For all props in p.
            o[prop] = p[prop]; // Add the property to o.
        }
        return o;
    }

    /*
     * Copy the enumerable properties of p to o, and return o
     * If o and p have a property by the same name, o's property is left alone
     * This function does not handle getters and setters or copy attributes
     */
    function Merge(o, p) {
        for (var prop in p) { // For all props in p
            if (o.hasOwnProperty[prop]) continue; // Except those already in o
            o[prop] = p[prop]; // Add the property to o
        }
        return o;
    }

    /*
     * Remove properties from o if there is not a property with the same name in p
     * Return o
     */
    function Restrict(o, p) {
        for (var prop in o) { // For all props in o
            if (!(prop in p)) delete o[prop]; // Delete if not in p
        }
        return o;
    }

    /*
     * For each property of p, delete the property with the same name from o
     * Return o
     */
    function Subtract(o, p) {
        for (var prop in p) { // For all props in p
            delete o[prop]; // Delete from o (deleting a nonexistent prop is harmless)
        }
        return o;
    }

    /* 
     * Return a new object that holds the properties of both o and p.
     * If o and p have properties by the same name, the values from o are used
     */
    function Union(o, p) {
        return extend(extend({}, o), p);
    }

    /*
     * Return a new object that holds only the properties of o that also appear
     * in p. This is something like the intersection of o and p, but the values of
     * the properties in p are discarded
     */
    function Intersection(o, p) {
        return restrict(extend({}, o), p);
    }

    /*
     * Return an array that holds the names of the enumerable own properties of o
     */
    function Keys(o) {
        if (typeof o !== "object") throw TypeError(); // Object argument required
        var result = []; // The array we will return
        for (var prop in o) { // For all enumerable properties
            if (o.hasOwnProperty(prop)) // If it is an own property
                result.push(prop); // add it to the array.
        }
        return result; // Return the array.
    }



    function Event() {
        this.listeners = {};
    }

    Event.prototype.listen = function (event, handler) {
        if (this.listeners[event] === undefined) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(handler);
    };

    Event.prototype.notify = function (event, data) {
        if (this.listeners[event] !== undefined) {
            for (var callback in this.listeners[event]) {
                this.listeners[event][callback].call(this, data);
            }
        }
    };

    Event.prototype.unlisten = function (event, handler) {
        if (this.listeners[event] !== undefined) {
            var index = this.listeners[event].indexOf(handler);
            if (index !== -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    };


    exports.Extend = Extend;
    exports.Merge = Merge;
    exports.Restrict = Restrict;
    exports.Subtract = Subtract;
    exports.Union = Union;
    exports.Intersection = Intersection;
    exports.Keys = Keys;
    exports.Event = Event;
});