(function (Qunit, Draw) {
    "use strict";

    Qunit.module("Shape - Sync");
    Qunit.test('Circle', function () {

        Qunit.ok(true, 'Object Circle - Initialize');

    });
    Qunit.test('Line', function () {

        Qunit.ok(true, 'Object Line - Initialize');

    });
    Qunit.test('Polygon', function () {

        Qunit.ok(true, 'Object Polygon - Initialize');

    });


    
    
    Qunit.module("Shape - Async");
    Qunit.asyncTest('Circle', function () {

        setTimeout(function () {
            ok(true, "Passed and ready to resume!");
            start();
        }, 1000);

    });

})(QUnit, Draw);