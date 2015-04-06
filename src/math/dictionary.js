(function (plane) {

    "use strict";

    function Dictionary() {
        this.store = [];
    }

    Dictionary.prototype = {
        add: function (key, value) {
            return this.store[key] = value;
        },
        update: function (key, value) {
            return this.store[key] = value;
        },
        find: function (key) {
            if (typeof key === 'string') {
                return this.store[key];
            } else if ((typeof key !== 'string') && key.length > 0) { // array
                var self = this,
                    keys = key;
                return Object.keys(this.store).filter(function (key) {
                    if (keys.indexOf(key) !== -1)
                        return self.store[key];
                }).map(function (key) {
                    return self.store[key];
                });
            }
        },
        remove: function (key) {
            delete this.store[key];
        },
        count: function () {
            return Object.keys(this.store).length;
        },
        clear: function () {
            return this.store = new Array();
        },
        list: function () {
            var self = this;
            return Object.keys(this.store).map(function (key) {
                return self.store[key];
            });
        }
    };


    plane.math.dictionary = {
        create: function () {
            return new Dictionary();
        }
    };

})(plane);