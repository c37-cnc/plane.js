define("plane", ['require', 'exports'], function (require, exports) {

    var bézier = require('geometric/bézier');
    
    
    var f001 = function(){
        alert('f001 - 1');
        bézier.f001();
    }
    
    
    
    

    exports.f001 = f001;
});