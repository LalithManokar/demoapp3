/*!
 * @copyright@
 */
sap.ui.controller("sap.ui.ino.views.backoffice.statusconfig.StatusModelListDetails", jQuery.extend({}, {
    getTextModel : function() {
            if (this.i18n === null) {
                this.i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
            }
            return this.i18n;
    },
    
    isInEditMode: function() {
        return false;
    }
}));