(function (Qunit, Draw) {
    "use strict";

    Qunit.module("Draw");
    Qunit.test('Initialize :-]', 2, function () {

        Qunit.ok(true, 'version: ' + Draw.version + ' - autor: ' + Draw.author);
        Qunit.equal(0, false, 'true');
        Qunit.equal(1, true, 'true');

    });

})(QUnit, Draw);
