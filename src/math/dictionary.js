(function (plane) {

    "use strict";

    function Dictionary() {
        this._store = [];
    }

    Dictionary.prototype = {
        add: function (key, value) {
            return this._store[key] = value;
        },
        update: function (key, value) {
            return this._store[key] = value;
        },
        find: function (key) {
            if ((typeof key === 'string') || (typeof key === 'number')) {
                return this._store[key];
            } else if ((typeof key !== 'string') && key.length > 0) { // array
                // TODO: polir/melhorar aqui - uma forma mais rápida?
                var self = this,
                    keys = key;
                return Object.keys(this._store).filter(function (key) {
                    if (keys.indexOf(key) !== -1)
                        return self._store[key];
                }).map(function (key) {
                    return self._store[key];
                });
            }
        },
        remove: function (key) {
            delete this._store[key];
        },
        count: function () {
            return Object.keys(this._store).length;
        },
        clear: function () {
            return this._store = new Array();
        },
        list: function () {
            var self = this;
            return Object.keys(this._store).map(function (key) {
                return self._store[key];
            });
        }
    };


    plane.math.dictionary = {
        create: function () {
            return new Dictionary();
        }
    };

})(plane);