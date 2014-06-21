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