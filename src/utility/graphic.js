define("utility/graphic", ['require', 'exports'], function (require, exports) {

    function MousePosition(element, position) {
        var bb = element.getBoundingClientRect();

        var x = (position.x - bb.left) * (element.clientWidth / bb.width);
        var y = (position.y - bb.top) * (element.clientHeight / bb.height);

        // tradução para o sistema de coordenadas cartesiano
        y = (y - element.clientHeight) * -1;

        return {
            x: x,
            y: y
        };
    }

    exports.MousePosition = MousePosition;

});