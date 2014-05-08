function drawGrid(width, height) {

    plane.layers.create();

    for (xActual = 0; xActual < width; xActual += 50) {
        plane.shape.create({
            type: 'line',
            x: [xActual, 0],
            y: [xActual, height],
            strokeColor: 'rgb(218, 222, 215)',
            strokeWidth: .6
        });

        for (xInternalSub = 1; xInternalSub <= 4; xInternalSub++) {
            // small part = 50/5 = 10px espaço entre as linhas
            var xActualSub = Math.round(xActual + 10 * xInternalSub);

            // como é somado + 10 (afrente) para fazer as sub-linhas
            // verifico se não ultrapassou o width
            if (xActualSub > width) {
                break;
            }

            plane.shape.create({
                type: 'line',
                x: [xActualSub, 0],
                y: [xActualSub, height],
                strokeColor: 'rgb(218, 222, 215)',
                strokeWidth: .3
            });
        }
    }

    for (yActual = 0; yActual < height; yActual += 50) {
        plane.shape.create({
            type: 'line',
            x: [0, yActual],
            y: [width, yActual],
            strokeColor: 'rgb(218, 222, 215)',
            strokeWidth: .6
        });


        // 10/20/30/40 = 4 linhas internas
        for (yInternalSub = 1; yInternalSub <= 4; yInternalSub++) {
            // small part = 50/5 = 10px espaço entre as linhas
            var yActualSub = Math.round(yActual - 10 * yInternalSub);

            // como é subtraido - 10 (atrás/acima) para fazer as sub-linhas
            // verifico se não ultrapassou o height
            if (yActualSub < 0) {
                break;
            }

            plane.shape.create({
                type: 'line',
                x: [0, yActualSub],
                y: [width, yActualSub],
                strokeColor: 'rgb(218, 222, 215)',
                strokeWidth: .3
            });

        }
    }

    plane.render.update();

};