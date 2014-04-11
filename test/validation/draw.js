(function (Qunit, Draw) {
    "use strict";

    Qunit.module("Draw");
    Qunit.test('Initialize :-]', function () {

        Qunit.ok(true, 'version: ' + Draw.version + ' - autor: ' + Draw.author);
        Qunit.equal(0, false, 'true');
        Qunit.equal(1, false, 'true');

    });

})(window.QUnit, window.Draw);