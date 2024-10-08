/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.extensions.jQuery.support"); 

(function() {
    "use strict";

    jQuery.support.placeholder = (function() {
        var oInput = document.createElement('input');
        return 'placeholder' in oInput;
    })();

    /**
     * enhances a SAPUI5 control with the placeholder capability in case it is not natively supported by the browser
     * 
     * @param oControl
     *            UI5 control to be enhanced
     * @param oInputDomRef
     *            jQuery dom reference to the input field
     */
    jQuery.support.enablePlaceholder = function(oControl, oInputDomRef) {

        // To avoid placeholders to be set as value property (and therefore to be co
        // considered as user input) we ignore any value which is set to the
        // placeholder text.
        // We have to consider both approaches to set the value: using the explicit setter method
        // and using the generic setProperty method

        var fnSetValue = oControl.constructor.prototype.setValue;
        oControl.setValue = function(sValue) {
            // values which equal the placeholder value are ignored
            // otherwise we set the placeholder values in the control
            if (this.getPlaceholder() && sValue === this.getPlaceholder()) {
                return;
            } else {
                fnSetValue.apply(this, arguments);
            }
        };

        var fnSetProperty = oControl.constructor.prototype.setProperty;
        oControl.setProperty = function(sPropertyName, sValue) {
            if (sPropertyName === "value" && this.getPlaceholder() && sValue === this.getPlaceholder()) {
                return;
            } else {
                fnSetProperty.apply(this, arguments);
            }
        };

        // set placeholder as title, to achieve that screen readers will read placeholder
        oInputDomRef.attr('title', oInputDomRef.attr('placeholder'));

        oInputDomRef.focus(function() {
            var input = jQuery(this);
            input.removeClass('placeholder');
            if (input.val() == input.attr('placeholder')) {
                input.val('');
            }
        }).blur(function() {
            var input = jQuery(this);
            if (input.val() == '' || input.val() == input.attr('placeholder')) {
                input.addClass('placeholder');
                input.val(input.attr('placeholder'));
            }
        }).blur();
    };

})();