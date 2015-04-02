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
            return this.store[key];
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
    }


    plane.math.dictionary = {
        create: function () {
            return new Dictionary();
        }
    };

})(plane);