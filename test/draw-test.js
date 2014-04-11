(function (Qunit, Draw) {
    "use strict";

    Qunit.test('Draw Initialize :-]', function () {

        Qunit.ok(true, 'version: ' + Draw.version + ' - autor: ' + Draw.author);
        Qunit.equal(0, false, 'true');
        Qunit.equal(1, false, 'true');

    });


    Qunit.module("Geometry");
    Qunit.test('Shape', function () {

        var shape = new Draw.Geometry.Shape();

        Qunit.ok(shape, 'Object Shape - Initialize');

    });





    //    Qunit.module( "Math" );
    //    Qunit.module( "Shape" );
    //    Qunit.module( "Utility" );

})(window.QUnit, window.Draw);