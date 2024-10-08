/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/commons/formatters/ObjectFormatter"
], function (ObjectFormatter) {
    "use strict";

    var oFollowUpFormatter = function() {};
    
    /**
     * Formats the textual representation of relative date
     * in the combo box with the follow up
     */
    oFollowUpFormatter.followUpRelativeDateText = function(sKey) {
        if (sKey) {
            return ObjectFormatter.text.apply(this, ["IDEA_OBJECT_FLD_FOLLOW_UP_ROW_" + sKey]);
        }
    };
    
    /**
     * Returns the today's date formatted for minDate of DatePicker
     */
    oFollowUpFormatter.minDate = function() {
        var oCurrentDate = new Date();
        return new Date(oCurrentDate.getFullYear(), oCurrentDate.getMonth(), oCurrentDate.getDate());
    };
    
    oFollowUpFormatter.followUpDateHeader = function(oDate) {
        if (oDate) {
            return ObjectFormatter.toDate(oDate);
        }
        return ObjectFormatter.text.apply(this, ["IDEA_OBJECT_TIT_NO_FOLLOW_UP_DATE"]);
    };
    
    oFollowUpFormatter.followUpDateHeaderColor = function(oDate) {
        if (!oDate) {
            return "false";
        }
        var oCurrentDate = new Date();
        var oNow = new Date(oCurrentDate.getFullYear(), oCurrentDate.getMonth(), oCurrentDate.getDate());
        if (oNow > oDate) {
            return "true";
        }
        return "false";
    };
    
    oFollowUpFormatter.followUpOkButtonEnabled = function() {
        var oFollowUpDialog = this.getView() && this.getView()._oFollowUpDialog || this._oFollowUpMixinFollowUpDialog;
        if (oFollowUpDialog && this.hasMessages) {
            return !this.hasMessages(oFollowUpDialog);
        }
        
        return true;
    };

    return oFollowUpFormatter;
});