(function (Qunit, Draw) {
    "use strict";

    Qunit.module("Draw - Sync");
    Qunit.test('Initialize :-]', 3, function () {

        Qunit.ok(true, 'version: ' + Draw.version + ' - autor: ' + Draw.author);
        Qunit.equal(0, false, 'true');
        Qunit.equal(1, true, 'true');

    });

})(QUnit, Draw);