/*!
 * @copyright@
 */
sap.ui.define([], function () {
    "use strict";
    
    var oChangeStatusActionFormatter = function() {};
    
    oChangeStatusActionFormatter.reponseTextMinLength = function(sTextModuleCode) {
        return sTextModuleCode ? 0 : 1;
    };
    
    return oChangeStatusActionFormatter;
});