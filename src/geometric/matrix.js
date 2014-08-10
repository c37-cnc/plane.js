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

    function Matrix(a, b, c, d, tx, ty) {
        this.a = a || 1; // x scale
        this.c = c || 0; // x inclinação 

        this.b = b || 0; // y inclinação 
        this.d = d || 1; // y scale

        this.tx = tx || 0; // x translate
        this.ty = ty || 0; // y translate
    };


    // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L558
    // https://github.com/tart/Google-Closure-Library/blob/master/goog/graphics/affinetransform.js#L427
    function getDeterminant(transform) {
        return transform.a * transform.d - transform.b * transform.c;
    };

    function isIdentity() {};

    // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/util/misc.js#L93
    function toPoint(point, transform, offSet) {
        if (offSet) {
            return {
                x: (transform[0] * point.x) + (transform[1] * point.y),
                y: (transform[2] * point.x) + (transform[3] * point.y)
            }
        };
        return {
            x: (transform[0] * point.x) + (transform[1] * point.y) + transform[4],
            y: (transform[2] * point.x) + (transform[3] * point.y) + transform[5]
        };
    };

    // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/util/misc.js#L113
    function toInverse(transform) {


        return transform;
    }

    Matrix.prototype = {
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L256
        // https://github.com/tart/Google-Closure-Library/blob/master/goog/graphics/affinetransform.js#L560
        rotate: function (angle, x, y) {
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);
            return this.transform(cos, sin, -sin, cos, x - x * cos + y * sin, y - x * sin - y * cos);
        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L218
        scale: function (scale, center) {

            if (center)
                this.translate(center.x, center.y);

            this._a *= scale.x;
            this._c *= scale.x;
            this._b *= scale.y;
            this._d *= scale.y;

            if (center)
                this.translate(-center.x, -center.y);

            return this;
        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L189
        translate: function (x, y) {

            this.tx += x * this.a + y * this.b;
            this.ty += x * this.c + y * this.d;

            return this;

        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L150
        reset: function () {

            this.a = this.d = 1;
            this.c = this.b = this.tx = this.ty = 0;

            return this;
        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L117
        clone: function () {
            return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L352
        concate: function (matrix) {

            var a1 = this.a,
                b1 = this.b,
                c1 = this.c,
                d1 = this.d,
                a2 = matrix.a,
                b2 = matrix.b,
                c2 = matrix.c,
                d2 = matrix.d,
                tx2 = matrix.tx,
                ty2 = matrix.ty;

            this.a = a2 * a1 + c2 * b1;
            this.b = b2 * a1 + d2 * b1;
            this.c = a2 * c1 + c2 * d1;
            this.d = b2 * c1 + d2 * d1;
            this.tx += tx2 * a1 + ty2 * b1;
            this.ty += tx2 * c1 + ty2 * d1;

            return this;

        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L299
        shear: function (shear, center) {

            if (center)
                this.translate(center.x, center.y);

            var a = this.a,
                c = this.c;

            this.a += shear.y * this.b;
            this.c += shear.y * this.d;
            this.b += shear.x * a;
            this.d += shear.x * c;

            if (center)
                this.translate(-center.x, -center.y);

            return this;
        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L337
        skew: function (skew, center) {

            var toRadians = Math.PI / 180,
                shear = {
                    x: Math.tan(skew.x * toRadians),
                    y: Math.tan(skew.y * toRadians)
                };

            return this.shear(shear, center);

        },
        // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/util/misc.js#L113
        // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/shapes/group.class.js#L459

        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L565
        // https://github.com/tart/Google-Closure-Library/blob/master/goog/graphics/affinetransform.js#L451
        inverse: function () {

//            var r, t = this.toArray(),
//                a = 1 / (t[0] * t[3] - t[1] * t[2]);
//
//            r = [a * t[3], -a * t[1], -a * t[2], a * t[0], 0, 0];
//
//            var o = toPoint({
//                x: t[4],
//                y: t[5]
//            }, r);
//            r[4] = -o.x;
//            r[5] = -o.y;
//            return r;


                        var r = this.toArray(),
                            a = 1 / (this.a * this.d - this.b * this.c);
            
                        r = [a * this.d, -a * this.b, -a * this.c, a * this.a, 0, 0];
            
                        var o = toPoint({
                            x: this.tx,
                            y: this.ty
                        }, r);
            
                        r[4] = -o.x;
                        r[5] = -o.y;

            return r;

        },
        inversePoint: function (point) {
            var det = getDeterminant(this);

            var x = point.x - this.tx,
                y = point.y - this.ty;

            return {
                x: (x * this.d - y * this.b) / det,
                y: (y * this.a - x * this.c) / det
            };
        },
        transform: function (a, b, c, d, tx, ty) {

            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;

            return this;
        },
        toCenter: function (point) {},
        toArray: function () {
            return [this.a, this.b, this.c, this.d, this.tx, this.ty];
        },

    };

    function create() {
        return new Matrix();
    };

    exports.create = create;
    exports.toPoint = toPoint;
});