(function (plane) {
    "use strict";
    
    function Store() {
        this._tree = plane.math.tree.create();
        this._dictionary = plane.math.dictionary.create();
    }

    Store.prototype = {
        // value = array
        add: function (key, value) {
            
            // add ao dictionary
            this._dictionary.add(key, value);
            // add a tree
            this._tree.add(value);

            return true;
        },
        // value = array
        get: function (key) {
            var rectangle = this._dictionary.get(key);
            return rectangle ? rectangle[4] : null;
        },
        search: function (rectangle) {
            return this._tree.search([rectangle.from.x, rectangle.from.y, rectangle.to.x, rectangle.to.y]);
        },
        remove: function (key) {
            
            // o item no dictionary
            var item = this._dictionary.get(key);
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