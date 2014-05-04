(function (plane) {
    "use strict";

    /**
     * Descrição para Utility.Math no arquivo math.js
     *
     * @namespace Utility
     * @class Math
     * @static
     */
    plane.utility.math = {

        /*
         * Generate a random uuid.
         *
         * USAGE: Math.uuid(length, radix)
         *   length - the desired number of characters
         *   radix  - the number of allowable values for each character.
         *
         * EXAMPLES:
         *   // No arguments  - returns RFC4122, version 4 ID
         *   >>> Math.uuid()
         *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
         *
         *   // One argument - returns ID of the specified length
         *   >>> Math.uuid(15)     // 15 character ID (default base=62)
         *   "VcydxgltxrVZSTV"
         *
         *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
         *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
         *   "01001010"
         *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
         *   "47473046"
         *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
         *   "098F4D35"
         */
        uuid: function (length, radix) {
            
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
                uuid = [],
                i;
            radix = radix || chars.length;

            if (length) {
                // Compact form
                for (i = 0; i < length; i++) uuid[i] = chars[0 | Math.random() * radix];
            } else {
                // rfc4122, version 4 form
                var r;

                // rfc4122 requires these characters
                uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                uuid[14] = '4';

                // Fill in random data.  At i==19 set the high bits of clock sequence as
                // per rfc4122, sec. 4.1.5
                for (i = 0; i < 36; i++) {
                    if (!uuid[i]) {
                        r = 0 | Math.random() * 16;
                        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                    }
                }
            }

            return uuid.join('').toLowerCase();
        },

        /**
         * Descrição para o metodo calculeX
         *
         * @method calculeX
         * @return {Number} Copy of ...
         */
        calculeX: function (a, b) {
            return a + b;
        }


    }

}(plane));