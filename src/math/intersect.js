(function (plane) {
    "use strict";

    function sideSegments(a1, a2, segments) {
        var length = segments.length;

        for (var i = 0; i < length; i++) {

            var b1 = segments[i],
                b2 = segments[((i + 1) === length) ? (i - 1) : (i + 1)];

            if (lineInSegments(a1, a2, b1, b2)) {
                return true;
            }
        }
        return false;
    }

    // https://github.com/lilo003/algorithm-002/blob/master/src/intersection/Intersection.js#L1384
    function lineInSegments(a1, a2, b1, b2) {

        var result,
            uaT = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
            ubT = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
            uB = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
        if (uB !== 0) {
            var ua = uaT / uB,
                ub = ubT / uB;
            if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
                result = [];
                result.push(plane.point.create(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
            } else {
                result = false;
            }
        } else {
            if (uaT === 0 || ubT === 0) {
                result = false;
            } else {
                result = false;
            }
        }
        return result;

    }

    // http://stackoverflow.com/questions/11716268/point-in-polygon-algorithm
    function pointInSegments(point, segments) {

        var i, j, nvert = segments.length;
        var c = false;

        for (i = 0, j = nvert - 1; i < nvert; j = i++) {

            if (((segments[i].y >= point.y) !== (segments[j].y >= point.y)) && (point.x <= (segments[j].x - segments[i].x) * (point.y - segments[i].y) / (segments[j].y - segments[i].y) + segments[i].x)) {
                c = !c;
            }

        }

        return c;

    }


    function segmentsOpen(segments, rectangle) {

        var tl = plane.point.create(rectangle.from.x, rectangle.to.y), // top left
            tr = plane.point.create(rectangle.to.x, rectangle.to.y), // top right
            bl = plane.point.create(rectangle.from.x, rectangle.from.y), // bottom left
            br = plane.point.create(rectangle.to.x, rectangle.from.y); // bottom right

        // estou em cima dos dos segmentos?
        // top left + top right
        if (sideSegments(tl, tr, segments)) {
            return true;
        }
        // top right + bottom right
        if (sideSegments(tr, br, segments)) {
            return true;
        }
        // bottom right + bottom left
        if (sideSegments(br, bl, segments)) {
            return true;
        }
        // bottom left + top left
        if (sideSegments(bl, tl, segments)) {
            return true;
        }
        // estou em cima dos dos segmentos?

        return false;
    }

    function segmentsClose(segments, rectangle) {

        var tl = plane.point.create(rectangle.from.x, rectangle.to.y), // top left
            tr = plane.point.create(rectangle.to.x, rectangle.to.y), // top right
            bl = plane.point.create(rectangle.from.x, rectangle.from.y), // bottom left
            br = plane.point.create(rectangle.to.x, rectangle.from.y); // bottom right


        // estou dentro dos segmentos?
        if (pointInSegments(rectangle.from, segments)) {
            return true;
        }
        if (pointInSegments(rectangle.to, segments)) {
            return true;
        }
        // estou dentro dos segmentos?

        // estou em cima dos dos segmentos?
        // top left + top right
        if (sideSegments(tl, tr, segments)) {
            return true;
        }
        // top right + bottom right
        if (sideSegments(tr, br, segments)) {
            return true;
        }
        // bottom right + bottom left
        if (sideSegments(br, bl, segments)) {
            return true;
        }
        // bottom left + top left
        if (sideSegments(bl, tl, segments)) {
            return true;
        }
        // estou em cima dos dos segmentos?

        return false;
    }


    plane.math.intersect = function (segments, rectangle, type) {

        if (type === 'open') {
            return segmentsOpen(segments, rectangle);
        }

        if (type === 'close') {
            return segmentsClose(segments, rectangle);
        }

    };

})(c37.library.plane);