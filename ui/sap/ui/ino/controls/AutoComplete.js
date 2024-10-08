/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.controls.AutoComplete");

(function() {
    "use strict";
    
    jQuery.sap.require("sap.ui.ino.extensions.jQuery.support");

    /**
     * Works like sap.ui.commons.AutoComplete. An additional search threshold determines the delay in ms before the search is executed.
     * 
     * <ul>
     * <li>Properties>
     * <ul>
     * searchThreshold: threshold property
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * confirm: user has hit the enter button to confirm his choice
     * </ul>
     * </li>
     * </ul>
     * 
     * @see sap.ui.commons.AutoComplete
     */

    sap.ui.commons.AutoComplete.extend("sap.ui.ino.controls.AutoComplete", {
        metadata : {
            properties : {
                "searchThreshold" : {
                    type : "int",
                    defaultValue : 250
                }
            },
            events : {
                "confirm" : {}
            }
        },

        onAfterRendering : function() {
            var oControl = this;

            this.onsapenter = function() {
                sap.ui.commons.AutoComplete.prototype.onsapenter.apply(oControl, arguments);
                // event must not be fired before LiveChange event
                setTimeout(function() {
                    oControl.fireConfirm({
                        confirmValue : oControl.getValue()
                    });  
                }, oControl.getSearchThreshold());
            };
        },

        _fireLiveChange : function() {
            var that = this;
    
            if (arguments[0].type === "sapup" ||
                arguments[0].type === "sapdown" ||
                that.getValue() === that.getLiveValue()) {
                return;
            }

            var aArguments = arguments;
            clearTimeout(that._oCurrentLiveChangeTimeout);
            that._oCurrentLiveChangeTimeout = setTimeout(function() {
                sap.ui.commons.AutoComplete.prototype._fireLiveChange.apply(that, aArguments);
            }, that.getSearchThreshold());
        },
        
        renderer : "sap.ui.commons.AutoCompleteRenderer"

    });

})();