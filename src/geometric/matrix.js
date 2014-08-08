define("geometric/matrix", ['require', 'exports'], function (require, exports) {
    
    // http://www.senocular.com/flash/tutorials/transformmatrix/
    // https://github.com/heygrady/transform/wiki/Calculating-2d-Matrices

    // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js
    // https://github.com/tart/Google-Closure-Library/blob/master/goog/graphics/affinetransform.js
    // https://github.com/CreateJS/EaselJS/blob/master/src/easeljs/geom/Matrix2D.js
    // http://eip.epitech.eu/2014/tumbleweed/api/classes/Math.Matrix2D.html
    // https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat2.js

    // https://github.com/kangax/fabric.js/blob/818ab118b30a9205a0e57620452b08bb8f5f18cc/src/static_canvas.class.js#L611
    // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/util/misc.js

    function Matrix(a, b, c, d, e, f) {
        this.a = a; // X_scale
        this.b = b; // X_skew
        this.c = c; // Y_skew
        this.d = d; // Y_scale
        this.e = e; // X_translate
        this.f = f; // Y_translate
    };


    function getDeterminant() {};

    function isIdentity() {};

    Matrix.prototype = {
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L256
        rotate: function () {},
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L218
        scale: function () {}, // COM CENTER //
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L189
        translate: function () {},
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L150
        reset: function () {},
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L117
        clone: function () {},
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L352
        concate: function () {},
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L337
        skew: function () {},
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L299
        shear: function () {},
        // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/util/misc.js#L113
        // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/shapes/group.class.js#L459
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L565
        inverse: function () {

        },
        // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/util/misc.js#L93
        toPoint: function (point) {},
        toCenter: function (point) {},



    };

    function create(x, y) {
        return new Matrix(x, y);
    };

    exports.create = create;

});