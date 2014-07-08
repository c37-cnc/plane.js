define("geometric/vector", ['require', 'exports'], function (require, exports) {

    
    // https://github.com/lilo003/algorithm-003/blob/master/src/vector2d/Vector2D.js
    
    function Vector(x, y) {
        if (arguments.length > 0) {
            this.x = x;
            this.y = y;
        }
    }


    /*****
     *
     *   length
     *
     *****/
    Vector.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };


    /*****
     *
     *   dot
     *
     *****/
    Vector.prototype.dot = function (that) {
        return this.x * that.x + this.y * that.y;
    };


    /*****
     *
     *   cross
     *
     *****/
    Vector.prototype.cross = function (that) {
        return this.x * that.y - this.y * that.x;
    }


    /*****
     *
     *   unit
     *
     *****/
    Vector.prototype.unit = function () {
        return this.divide(this.length());
    };


    /*****
     *
     *   unitEquals
     *
     *****/
    Vector.prototype.unitEquals = function () {
        this.divideEquals(this.length());

        return this;
    };


    /*****
     *
     *   add
     *
     *****/
    Vector.prototype.add = function (that) {
        return new Vector(this.x + that.x, this.y + that.y);
    };


    /*****
     *
     *   addEquals
     *
     *****/
    Vector.prototype.addEquals = function (that) {
        this.x += that.x;
        this.y += that.y;

        return this;
    };


    /*****
     *
     *   subtract
     *
     *****/
    Vector.prototype.subtract = function (that) {
        return new Vector(this.x - that.x, this.y - that.y);
    };


    /*****
     *
     *   subtractEquals
     *
     *****/
    Vector.prototype.subtractEquals = function (that) {
        this.x -= that.x;
        this.y -= that.y;

        return this;
    };


    /*****
     *
     *   multiply
     *
     *****/
    Vector.prototype.multiply = function (scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    };


    /*****
     *
     *   multiplyEquals
     *
     *****/
    Vector.prototype.multiplyEquals = function (scalar) {
        this.x *= scalar;
        this.y *= scalar;

        return this;
    };


    /*****
     *
     *   divide
     *
     *****/
    Vector.prototype.divide = function (scalar) {
        return new Vector(this.x / scalar, this.y / scalar);
    };


    /*****
     *
     *   divideEquals
     *
     *****/
    Vector.prototype.divideEquals = function (scalar) {
        this.x /= scalar;
        this.y /= scalar;

        return this;
    };


    /*****
     *
     *   perp
     *
     *****/
    Vector.prototype.perp = function () {
        return new Vector(-this.y, this.x);
    };


    /*****
     *
     *   perpendicular
     *
     *****/
    Vector.prototype.perpendicular = function (that) {
        return this.subtract(this.project(that));
    };


    /*****
     *
     *   project
     *
     *****/
    Vector.prototype.project = function (that) {
        var percent = this.dot(that) / that.dot(that);

        return that.multiply(percent);
    };


    /*****
     *
     *   toString
     *
     *****/
    Vector.prototype.toString = function () {
        return this.x + "," + this.y;
    };


    /*****
     *
     *   fromPoints
     *
     *****/
    Vector.fromPoints = function (p1, p2) {
        return new Vector(
            p2.x - p1.x,
            p2.y - p1.y
        );
    };


    function create(x, y) {
        return new Vector(x, y);
    };
    

    exports.create = create;
});