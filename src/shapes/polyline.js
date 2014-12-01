define("plane/shapes/polyline", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point'),
        object = require('plane/shapes/object');

    var types = require('plane/utility/types');


    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape
     * @class Shape
     * @constructor
     */
    var Polyline = types.object.inherits(function Polyline(attrs) {

        /**
         * A Universally unique identifier for
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = null;
        this.type = null;
        this.name = null;

        this.segments = [];
        this.status = null;
        this.style = null;

        this.points = null;

        this.initialize(attrs);

    }, object.Base);
    
    Polyline.prototype.calculeSegments = function(){
        
        this.segments = this.points;
        
        return true;
        
    }


    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Arc - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.points = attrs.points.map(function(item){
            return point.create(item);
        });

        // 4 - criando um novo shape do tipo arco
        return new Polyline(attrs);
    };

    exports.create = create;
});