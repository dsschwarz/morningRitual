/**
 * Created by dan-s on 30/01/2016.
 */
var UniqueIdProvider = (function () {
    var id = 0;
    return {
        getId: function() {
            return id++;
        }
    }
})();

module.exports = {
    getId: UniqueIdProvider.getId
};