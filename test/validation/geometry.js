(function (Qunit, Draw) {
    "use strict";

    Qunit.module("Geometry - Sync");
    Qunit.test('Group', function () {

        Qunit.ok(true, 'Object Group - Initialize');

    });
    Qunit.test('Point', function () {

        Qunit.ok(true, 'Object Point - Initialize');

    });
    Qunit.test('Shape', function () {

        var shape = new Draw.Geometry.Shape();

        Qunit.ok(shape, 'Object Shape - Initialize');

    });

})(QUnit, Draw);
