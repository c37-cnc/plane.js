define("geometric/intersection", ['require', 'exports'], function (require, exports) {

    var polynomial = require('geometric/polynomial'),
        point = require('geometric/point'),
        vector = require('geometric/vector');


    function Bezout(e1, e2) {
        var AB = e1[0] * e2[1] - e2[0] * e1[1];
        var AC = e1[0] * e2[2] - e2[0] * e1[2];
        var AD = e1[0] * e2[3] - e2[0] * e1[3];
        var AE = e1[0] * e2[4] - e2[0] * e1[4];
        var AF = e1[0] * e2[5] - e2[0] * e1[5];
        var BC = e1[1] * e2[2] - e2[1] * e1[2];
        var BE = e1[1] * e2[4] - e2[1] * e1[4];
        var BF = e1[1] * e2[5] - e2[1] * e1[5];
        var CD = e1[2] * e2[3] - e2[2] * e1[3];
        var DE = e1[3] * e2[4] - e2[3] * e1[4];
        var DF = e1[3] * e2[5] - e2[3] * e1[5];
        var BFpDE = BF + DE;
        var BEmCD = BE - CD;

        return polynomial.create(
            AB * BC - AC * AC,
            AB * BEmCD + AD * BC - 2 * AC * AE,
            AB * BFpDE + AD * BEmCD - AE * AE - 2 * AC * AF,
            AB * DF + AD * BFpDE - 2 * AE * AF,
            AD * DF - AF * AF
        );
    };


    function circleLine(c, r, a1, a2) {
        var result,
            a = (a2.x - a1.x) * (a2.x - a1.x) + (a2.y - a1.y) * (a2.y - a1.y),
            b = 2 * ((a2.x - a1.x) * (a1.x - c.x) + (a2.y - a1.y) * (a1.y - c.y)),
            cc = c.x * c.x + c.y * c.y + a1.x * a1.x + a1.y * a1.y - 2 * (c.x * a1.x + c.y * a1.y) - r * r,
            deter = b * b - 4 * a * cc;

        if (deter < 0) {
            result = false;
        } else if (deter == 0) {
            result = false;
        } else {
            var e = Math.sqrt(deter),
                u1 = (-b + e) / (2 * a),
                u2 = (-b - e) / (2 * a);

            if ((u1 < 0 || u1 > 1) && (u2 < 0 || u2 > 1)) {
                if ((u1 < 0 && u2 < 0) || (u1 > 1 && u2 > 1)) {
                    result = false;
                } else {
                    result = false;
                }
            } else {
                result = true;
            }
        }
        return result;
    };

    function circleRectangle(c, r, p, h, w) {

        var rightBottom = point.create(p.x + w, p.y),
            rightTop = point.create(p.x + w, p.y + h),
            leftTop = point.create(p.x, p.y + h),
            leftBottom = point.create(p.x, p.y);

        var inter1 = circleLine(c, r, rightBottom, rightTop);
        var inter2 = circleLine(c, r, rightTop, leftTop);
        var inter3 = circleLine(c, r, leftTop, leftBottom);
        var inter4 = circleLine(c, r, leftBottom, rightBottom);

        return inter1 || inter2 || inter3 || inter4;
    };

    function circleCircle(c1, r1, c2, r2) {
        var result;

        // Determine minimum and maximum radii where circles can intersect
        var r_max = r1 + r2;
        var r_min = Math.abs(r1 - r2);

        // Determine actual distance between circle circles
        var c_dist = c1.distanceTo(c2);

        if (c_dist > r_max) {
            result = false;
        } else if (c_dist < r_min) {
            result = false;
        } else {
            result = {
                points: []
            };

            var a = (r1 * r1 - r2 * r2 + c_dist * c_dist) / (2 * c_dist);
            var h = Math.sqrt(r1 * r1 - a * a);
            var p = c1.interpolationLinear(c2, a / c_dist);
            var b = h / c_dist;

            result.points.push(point.create(p.x - b * (c2.y - c1.y), p.y + b * (c2.x - c1.x)));
            result.points.push(point.create(p.x + b * (c2.y - c1.y), p.y - b * (c2.x - c1.x)));

        }

        return result;
    };

    function circleArc(c, r1, ca, r2, as, ae, ck) {

        var intersection = circleCircle(c, r1, ca, r2);

        if (intersection.points) {

            var radianStart = as / 360 * 2 * Math.PI,
                radianEnd = ae / 360 * 2 * Math.PI,
                radianMid = radianStart > radianEnd ? (radianStart - radianEnd) / 2 : (radianEnd - radianStart) / 2;

            var pointStart = point.create(ca.x + Math.cos(radianStart) * r2, ca.y + Math.sin(radianStart) * r2),
                pointEnd = point.create(ca.x + Math.cos(radianEnd) * r2, ca.y + Math.sin(radianEnd) * r2),
                pointMid = point.create(ca.x + Math.cos(radianMid) * r2, ck ? ca.y - Math.sin(radianMid) * r2 : ca.y + Math.sin(radianMid) * r2);

            var twoPi = (Math.PI + Math.PI);

            for (var i = 0; i <= intersection.points.length - 1; i++) {

                var pointDistance = intersection.points[i].distanceTo(ca),
                    radius = r2;

                if (radius - 4 <= pointDistance && pointDistance <= radius + 4) {

                    var pointstartAngle = ca.angleTo(pointStart),
                        pointMidAngle = ca.angleTo(pointMid),
                        pointendAngle = ca.angleTo(pointEnd),
                        pointMouseAngle = ca.angleTo(intersection.points[i]);

                    if (pointstartAngle <= pointMidAngle && pointMidAngle <= pointendAngle) {
                        // 2014.06.24 - 14:33 - lilo - em observação
                        //                        if (ck) {
                        //                            return (pointstartAngle <= pointMouseAngle && pointMouseAngle <= pointendAngle) ? true : false;
                        //                        } else {
                        //                            return (pointstartAngle <= pointMouseAngle && pointMouseAngle <= pointendAngle) ? false : true;
                        //                        }
                        return (pointstartAngle <= pointMouseAngle && pointMouseAngle <= pointendAngle) ? true : false;

                    } else if (pointendAngle <= pointMidAngle && pointMidAngle <= pointstartAngle) {
                        if (ck) {
                            return (pointendAngle <= pointMouseAngle && pointMouseAngle <= pointstartAngle) ? true : false;
                        } else {
                            return (pointendAngle <= pointMouseAngle && pointMouseAngle <= pointstartAngle) ? false : true;
                        }
                    } else if (pointstartAngle <= pointMidAngle && pointendAngle <= pointMidAngle) {
                        if (pointstartAngle < pointendAngle) {
                            if (ck) {
                                return (pointstartAngle < pointMouseAngle && pointMouseAngle < pointendAngle) ? false : true;
                            } else {
                                return (pointstartAngle < pointMouseAngle && pointMouseAngle < pointendAngle) ? true : false;
                            }
                        } else if (pointendAngle < pointstartAngle) {
                            return (pointendAngle < pointMouseAngle && pointMouseAngle < pointstartAngle) ? false : true;
                        }
                    } else if (pointMidAngle <= pointstartAngle && pointMidAngle <= pointendAngle) {
                        if (pointstartAngle < pointendAngle) {
                            if (ck) {
                                return (pointstartAngle < pointMouseAngle && pointMouseAngle < pointendAngle) ? false : true;
                            } else {
                                return (pointstartAngle < pointMouseAngle && pointMouseAngle < pointendAngle) ? true : false;
                            }
                        } else if (pointendAngle < pointstartAngle) {
                            return (pointendAngle < pointMouseAngle && pointMouseAngle < pointstartAngle) ? false : true;
                        }
                    }

                }
                return false;
            };
        }
        return false;
    };


    function circleEllipse(c1, ry1, rx1, c2, ry2, rx2) {

        var a = [ry1 * ry1, 0, rx1 * rx1, -2 * ry1 * ry1 * c1.x, -2 * rx1 * rx1 * c1.y, ry1 * ry1 * c1.x * c1.x + rx1 * rx1 * c1.y * c1.y - rx1 * rx1 * ry1 * ry1];
        var b = [ry2 * ry2, 0, rx2 * rx2, -2 * ry2 * ry2 * c2.x, -2 * rx2 * rx2 * c2.y, ry2 * ry2 * c2.x * c2.x + rx2 * rx2 * c2.y * c2.y - rx2 * rx2 * ry2 * ry2];

        var yPoly = Bezout(a, b);
        var yRoots = yPoly.getRoots();
        var epsilon = 1e-3;
        var norm0 = (a[0] * a[0] + 2 * a[1] * a[1] + a[2] * a[2]) * epsilon;
        var norm1 = (b[0] * b[0] + 2 * b[1] * b[1] + b[2] * b[2]) * epsilon;

        for (var y = 0; y < yRoots.length; y++) {
            var xPoly = polynomial.create(
                a[0],
                a[3] + yRoots[y] * a[1],
                a[5] + yRoots[y] * (a[4] + yRoots[y] * a[2])
            );
            var xRoots = xPoly.getRoots();

            for (var x = 0; x < xRoots.length; x++) {
                var test =
                    (a[0] * xRoots[x] + a[1] * yRoots[y] + a[3]) * xRoots[x] +
                    (a[2] * yRoots[y] + a[4]) * yRoots[y] + a[5];
                if (Math.abs(test) < norm0) {
                    test =
                        (b[0] * xRoots[x] + b[1] * yRoots[y] + b[3]) * xRoots[x] +
                        (b[2] * yRoots[y] + b[4]) * yRoots[y] + b[5];
                    if (Math.abs(test) < norm1) {
                        return true;
                    }
                }
            }
        }
        return false;
    };


    function circleBezier(p1, p2, p3, p4, ec, rx, ry) {

        debugger;

        var a, b, c, d; // temporary variables
        var c3, c2, c1, c0; // coefficients of cubic
        //        var result = new Intersection("No Intersection");

        // Calculate the coefficients of cubic polynomial
        a = p1.multiply(-1);
        b = p2.multiply(3);
        c = p3.multiply(-3);
        d = a.sum(b.sum(c.sum(p4)));
        c3 = vector.create(d.x, d.y);

        a = p1.multiply(3);
        b = p2.multiply(-6);
        c = p3.multiply(3);
        d = a.sum(b.sum(c));
        c2 = vector.create(d.x, d.y);

        a = p1.multiply(-3);
        b = p2.multiply(3);
        c = a.sum(b);
        c1 = vector.create(c.x, c.y);

        c0 = vector.create(p1.x, p1.y);

        var rxrx = rx * rx;
        var ryry = ry * ry;
        var poly = polynomial.create(
            c3.x * c3.x * ryry + c3.y * c3.y * rxrx,
            2 * (c3.x * c2.x * ryry + c3.y * c2.y * rxrx),
            2 * (c3.x * c1.x * ryry + c3.y * c1.y * rxrx) + c2.x * c2.x * ryry + c2.y * c2.y * rxrx,
            2 * c3.x * ryry * (c0.x - ec.x) + 2 * c3.y * rxrx * (c0.y - ec.y) +
            2 * (c2.x * c1.x * ryry + c2.y * c1.y * rxrx),
            2 * c2.x * ryry * (c0.x - ec.x) + 2 * c2.y * rxrx * (c0.y - ec.y) +
            c1.x * c1.x * ryry + c1.y * c1.y * rxrx,
            2 * c1.x * ryry * (c0.x - ec.x) + 2 * c1.y * rxrx * (c0.y - ec.y),
            c0.x * c0.x * ryry - 2 * c0.y * ec.y * rxrx - 2 * c0.x * ec.x * ryry +
            c0.y * c0.y * rxrx + ec.x * ec.x * ryry + ec.y * ec.y * rxrx - rxrx * ryry
        );
        var roots = poly.getRootsInInterval(0, 1);

        return roots.length > 1;


        //        for (var i = 0; i < roots.length; i++) {
        //            var t = roots[i];
        //
        //            result.points.push(
        //                c3.multiply(t * t * t).sum(c2.multiply(t * t).add(c1.multiply(t).add(c0)))
        //            );
        //        }
        //
        //        if (result.points.length > 0) result.status = "Intersection";
        //
        //        return result;
    };



    //    function circleQuadratic(p1, p2, p3, c, r) {
    function circleQuadratic(p1, p2, p3, ec, rx, ry) {

        var a, b; // temporary variables
        var c2, c1, c0; // coefficients of quadratic
        //        var result = new Intersection("No Intersection");
        var result = {};

        a = p2.multiply(-2);
        c2 = p1.sum(a.sum(p3));

        a = p1.multiply(-2);
        b = p2.multiply(2);
        c1 = a.sum(b);

        c0 = point.create(p1.x, p1.y);

        // new 
        //        c1 = point.create(p2.x, p2.y);
        //        c2 = point.create(p3.x, p3.y);

        var rxrx = rx * rx;
        var ryry = ry * ry;

        //        var rxrx = rx * rx;
        //        var ryry = ry * ry;

        //        var roots = polynomial.create(
        //            ryry * c2.x * c2.x + rxrx * c2.y * c2.y,
        //            2 * (ryry * c2.x * c1.x + rxrx * c2.y * c1.y),
        //            ryry * (2 * c2.x * c0.x + c1.x * c1.x) + rxrx * (2 * c2.y * c0.y + c1.y * c1.y) - 2 * (ryry * ec.x * c2.x + rxrx * ec.y * c2.y),
        //            2 * (ryry * c1.x * (c0.x - ec.x) + rxrx * c1.y * (c0.y - ec.y)),
        //            ryry * (c0.x * c0.x + ec.x * ec.x) + rxrx * (c0.y * c0.y + ec.y * ec.y) - 2 * (ryry * ec.x * c0.x + rxrx * ec.y * c0.y) - rxrx * ryry
        //        ).getRoots();

        var roots = polynomial.create(
            ryry * c2.x * c2.x + rxrx * c2.y * c2.y,
            2 * (ryry * c2.x * c1.x + rxrx * c2.y * c1.y),
            ryry * (2 * c2.x * c0.x + c1.x * c1.x) + rxrx * (2 * c2.y * c0.y + c1.y * c1.y) - 2 * (ryry * ec.x * c2.x + rxrx * ec.y * c2.y),
            2 * (ryry * c1.x * (c0.x - ec.x) + rxrx * c1.y * (c0.y - ec.y)),
            ryry * (c0.x * c0.x + ec.x * ec.x) + rxrx * (c0.y * c0.y + ec.y * ec.y) - 2 * (ryry * ec.x * c0.x + rxrx * ec.y * c0.y) - rxrx * ryry
        ).getRoots();

        //        for (var i = 0; i < roots.length; i++) {
        //            var t = roots[i];
        //
        //            if (0 <= t && t <= 1)
        //                result.points.push(c2.multiply(t * t).add(c1.multiply(t).add(c0)));
        //        }
        //
        //        if (result.points.length > 0) result.status = "Intersection";
        //
        //        return result;


        if (roots.length > 1) {
            
//            debugger;
            
            result.points = [];

            for (var i = 0; i < roots.length; i++) {
                var t = roots[i];

                if (0 <= t && t <= 1)
                    result.points.push(c2.multiply(t * t).sum(c1.multiply(t).sum(c0)));
            }

//            if (result.points.length > 0) result.status = "Intersection";

            return (result.points.length > 0);


        }

        return false;
    };


    exports.circleLine = circleLine;
    exports.circleRectangle = circleRectangle;
    exports.circleCircle = circleCircle;
    exports.circleArc = circleArc;
    exports.circleEllipse = circleEllipse;
    exports.circleBezier = circleBezier;
    exports.circleQuadratic = circleQuadratic;
});