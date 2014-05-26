/**
 * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
 * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
 * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
 * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
 *
 * @class Shape
 * @static
 */
Plane.Shape = (function (Plane, Math) {
    "use strict";

    var shapes = {};

    function Shape(attrs) {
        for (var name in attrs) {
            if (name in this) {
                this[name] = attrs[name];
            }
        }
    }

    Shape.prototype = {

        get uuid() {
            return this._uuid;
        },
        set uuid(value) {
            this._uuid = value;
        },

        get name() {
            return this._name;
        },
        set name(value) {
            this._name = value;
        },

        get type() {
            return this._type;
        },
        set type(value) {
            this._type = value;
        },

        get locked() {
            return this._locked;
        },
        set locked(value) {
            this._locked = value;
        },

        get visible() {
            return this._visible;
        },
        set visible(value) {
            this._visible = value;
        },

        get x() {
            return this._x;
        },
        set x(value) {
            this._x = value;
        },

        get y() {
            return this._y;
        },
        set y(value) {
            this._y = value;
        },

        get angle() {
            return this._angle;
        },
        set angle(value) {
            this._angle = value;
        },

        get scaleX() {
            return this._scaleX;
        },
        set scaleX(value) {
            this._scaleX = value;
        },

        get scaleY() {
            return this._scaleY;
        },
        set scaleY(value) {
            this._scaleY = value;
        },

        get selectable() {
            return this._selectable;
        },
        set selectable(value) {
            this._selectable = value;
        },

        get style() {
            return this._style;
        },
        set style(value) {
            this._style = value;
        },

        get radius() {
            return this._radius;
        },
        set radius(value) {
            if ((this.type != 'polygon') && (this.type != 'arc') && (this.type != 'circle')) {
                throw new Error('Shape - Create - Radius not correct for the ' + this.type + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            this._radius = value;
        },

        get sides() {
            return this._sides;
        },
        set sides(value) {
            if ((this.type != 'polygon') && (this.type != 'arc')) {
                throw new Error('Shape - Create - Sides not correct for the ' + this.type + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            if (value < 3) {
                throw new Error('Shape - Create - Incorrect number of sides \nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            this._sides = value;
        },

        get height() {
            return this._height;
        },
        set height(value) {
            if ((this.type != 'rectangle') && (this.type != 'ellipse')) {
                throw new Error('Shape - Create - Height not correct for the ' + this.type + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            this._height = value;
        },

        get width() {
            return this._width;
        },
        set width(value) {
            if ((this.type != 'rectangle') && (this.type != 'ellipse')) {
                throw new Error('Shape - Create - Width not correct for the ' + this.type + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            this._width = value;
        },

        get startAngle() {
            return this._startAngle;
        },
        set startAngle(value) {
            if (this.type != 'arc') {
                throw new Error('Shape - Create - Start Angle not correct for the ' + this.type + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            this._startAngle = value;
        },

        get endAngle() {
            return this._endAngle;
        },
        set endAngle(value) {
            if (this.type != 'arc') {
                throw new Error('Shape - Create - End Angle not correct for the ' + this.type + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            this._endAngle = value;
        },

        get clockWise() {
            return this._clockWise;
        },
        set clockWise(value) {
            if (this.type != 'arc') {
                throw new Error('Shape - Create - Clockwise not correct for the ' + this.type + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            this._clockWise = value;
        },

        toJson: function () {
            return JSON.stringify(this).replace(/_/g, '');
        }
    }

    return {
        Initialize: function (config) {
            if ((typeof config == "function") || (config == null)) {
                throw new Error('Shape - Initialize - Config is not valid' + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }

            var layerUuid = config.uuid;
            shapes[layerUuid] = new Plane.Utility.Dictionary();

            return true;
        },
        Create: function (attrs) {
            if ((typeof attrs == "function") || (attrs == null)) {
                throw new Error('Shape - Create - Attrs is not valid' + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            if (['polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse'].indexOf(attrs.type.toLowerCase()) == -1) {
                throw new Error('Shape - Create - Type is not valid' + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            if ((attrs.x == undefined) || (attrs.y == undefined)) {
                throw new Error('Shape - Create - X and Y is not valid' + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }


            var shape = null,
                uuid = Plane.Utility.Uuid(9, 16);

            attrs = Plane.Utility.Object.merge({
                uuid: uuid,
                name: 'Shape ' + uuid,
                type: attrs.type.toLowerCase(),
                selectable: true,
                locked: false,
                visible: true,
                angle: 0,
                scaleX: 0,
                scaleY: 0
            }, attrs);

            shape = new Shape(attrs);

            var layerUuid = Plane.Layers.Active.uuid;
            shapes[layerUuid].add(shape.uuid, shape);

            return this;
        },

        Search: function (selector) {

            if (selector == undefined){
                return [];
            }
            if ((Plane.Layers.Active.system) && !selector.contains('layer') && !selector.contains('uuid')){
                return [];
            }

            var layerUuid = Plane.Layers.Active.uuid;

            if (!selector) {
                return shapes[layerUuid].list();
            }

            if (selector.contains('shape') && selector.contains('uuid')) {
                return shapes[layerUuid].find(selector.substring(selector.length - 9, selector.length));
            }

            if (selector.contains('layer') && selector.contains('uuid')) {
                return shapes[selector.substring(selector.length - 9, selector.length)].list();
            }
        },

        Remove: function (shape) {

            return this;
        }
    };

})(Plane, Math);