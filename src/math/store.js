(function (plane) {
    "use strict";
    
    function Store() {
        this._tree = plane.math.tree.create();
        this._dictionary = plane.math.dictionary.create();
    }

    Store.prototype = {
        // value = array
        add: function (value) {
            var key = plane.utility.string.hashCode(value.toString());
            // add ao dictionary
            this._dictionary.add(key, value);
            // add a tree
            this._tree.add(value);

            return true;
        },
        // value = array
        get: function (value) {
            var key = plane.utility.string.hashCode(value.toString());
            return this._dictionary.get(key);
        },
        search: function (rectangle) {

            return this._tree.search([rectangle.from.x, rectangle.from.y, rectangle.to.x, rectangle.to.y]);

        },
        remove: function (value) {
            var key = plane.utility.string.hashCode(value.toString()),
                item = this._dictionary.get(key);

            // remove de dictionary
            this._dictionary.remove(key);
            // remove de tree
            this._tree.remove(item);

            return true;
        },
        clear: function () {
            // limpo o dictionary
            this._dictionary.clear();
            // limpo a tree
            this._tree.clear();

            return true;
        }
    };
    
    plane.math.store = {
        create: function () {
            return new Store();
        }
    };
    
})(plane);