(function (plane) {
    "use strict";




    function isInside(x, y, z1, z2, z3, z4) {
        var x1 = z1.minimum(z3);
        var x2 = z1.maximum(z3);
        var y1 = z2.minimum(z4);
        var y2 = z2.maximum(z4);

        return ((x1.x <= x) && (x <= x2.x) && (y1.y <= y) && (y <= y2.y));
    }

    function segmentsRectangle(segments, rectangle) {

        var tl = plane.point.create(rectangle.from.x, rectangle.to.y), // top left
            tr = plane.point.create(rectangle.to.x, rectangle.to.y), // top right
            bl = plane.point.create(rectangle.from.x, rectangle.from.y), // bottom left
            br = plane.point.create(rectangle.to.x, rectangle.from.y), // bottom right
            result = false;


        var inter1 = intersectSegmentsLine(tl, tr, segments),
            inter2 = intersectSegmentsLine(tr, br, segments),
            inter3 = intersectSegmentsLine(br, bl, segments),
            inter4 = intersectSegmentsLine(bl, tl, segments);

        if (inter1 || inter2 || inter3 || inter4) {
            return true;
        }

        for (var i = 0; i < segments.length; i++) {
            if (isInside(segments[i].x, segments[i].y, bl, tl, tr, br)) {
                return true;
            }
        }

        return false;
    }

    function intersectSegmentsLine(a1, a2, points) {
        var length = points.length;

        for (var i = 0; i < length; i++) {
            
            var b1 = points[i],
                b2 = points[((i + 1) === length) ? (i - 1) : (i + 1)];

            if (lineLine(a1, a2, b1, b2)) {
                return true;
            }
        }
        return false;
    }
    ;






    function lineLine(a1, a2, b1, b2) {

//        debugger;

        var result,
            uaT = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
            ubT = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
            uB = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
        if (uB !== 0) {
            var ua = uaT / uB,
                ub = ubT / uB;
            if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
//                result = new Intersection('Intersection');
                result = [];
                result.push(plane.point.create(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
            } else {
                result = false;
//                result = new Intersection();
            }
        } else {
            if (uaT === 0 || ubT === 0) {
                result = false;
//                result = new Intersection('Coincident');
            } else {
                result = false;
//                result = new Intersection('Parallel');
            }
        }
        return result;
    }





    //plane.math.intersect = validate;
    plane.math.intersect = segmentsRectangle;

})(plane);