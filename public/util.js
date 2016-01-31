var UniqueIdProvider = (function () {
    var id = 0;
    return {
        getId: function() {
            return id++;
        }
    }
})();