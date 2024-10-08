/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.formatter.RoundedDecimalFormatter");

(function() {

    sap.ui.ino.models.formatter.RoundedDecimalFormatter = {
        getFormatter : function(iPlaces) {
            return function(dValue) {
                var iRoundingFactor = Math.pow(10, iPlaces);
                return Math.round(dValue * iRoundingFactor) / iRoundingFactor;
            };
        }
    };

})();