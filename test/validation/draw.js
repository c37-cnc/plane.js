(function (QUnit, Draw) {
    "use strict";

    QUnit.module("Draw - Sync");
    QUnit.test('Initialize :-]', function () {

        QUnit.ok(true, 'version: ' + Draw.version + ' - autor: ' + Draw.author);
        QUnit.ok(Draw.initialize(), 'Initialize Ok')

    });

})(QUnit, Draw);