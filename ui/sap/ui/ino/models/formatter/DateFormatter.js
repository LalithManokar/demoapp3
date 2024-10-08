/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.formatter.DateFormatter");
jQuery.sap.require("sap.ui.ino.models.types.NonLocalizedDateType");

(function() {

    sap.ui.ino.models.formatter.DateFormatter = {};
    
    var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
        style : "medium"
    });
    
    // we allow one day infinity tolerance to be on the safe side with timezone conversions
    var dInfinity = new Date("9999-12-30T00:00:00.000Z");

    sap.ui.ino.models.formatter.DateFormatter.formatInfinity = function(dDate) {
        if (!dDate) {
            return "";
        }
        var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
        if (dDate >= dInfinity) {
            return oBundle.getText("CTRL_FORMATTER_DATE_INFINITE");
        } else {
            return oDateFormat.format(dDate);
        }
    };
    
    sap.ui.ino.models.formatter.DateFormatter.formatInfinityWithTime = function(dDate) {
        if (!dDate) {
            return "";
        } else if (typeof (dDate) === "number") {
        	dDate = new Date(dDate);
        }
        var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
        if (dDate >= dInfinity) {
            return oBundle.getText("CTRL_FORMATTER_DATE_INFINITE");
        } else {
            return sap.ui.core.format.DateFormat.getDateTimeInstance().format(dDate, false);
        }
    };
    
    sap.ui.ino.models.formatter.DateFormatter.formatInfinityWithTimeFormat = function(dDate) {
        if (!dDate) {
            return "";
        } else if (typeof (dDate) === "number") {
        	dDate = new Date(dDate);
        }
        var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
        if (dDate >= dInfinity) {
            return oBundle.getText("CTRL_FORMATTER_DATE_INFINITE");
        } else {
            return sap.ui.core.format.DateFormat.getDateTimeInstance({"pattern":"yyyy-MM-dd HH:mm:ss UTC"}).format(dDate, false);
        }
    };

    sap.ui.ino.models.formatter.DateFormatter.formatDateIsDue = function(dDate) {
        this.removeStyleClass("markError");
        var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
        if (dDate) {
            var now = new Date();
            var iNowSeconds = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
            if (dDate.getTime() <= iNowSeconds) {
                this.addStyleClass("markError");
                return oBundle.getText("CTRL_COMMON_FLD_YES");
            }
        }
        return oBundle.getText("CTRL_COMMON_FLD_NO");
    };

    sap.ui.ino.models.formatter.DateFormatter.formatDueDate = function(dDate) {
        this.removeStyleClass("markError");
        if (!dDate) {
            return "";
        }
        var now = new Date();
        var iNowSeconds = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
        if (dDate.getTime() <= iNowSeconds) {
            this.addStyleClass("markError");
        }      
        return sap.ui.ino.models.types.NonLocalizedDateType.convertToNonLocalizedFormattedDateString(dDate);
    };
})();