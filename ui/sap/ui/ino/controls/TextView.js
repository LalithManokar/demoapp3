/*!
 * @copyright@
 */ 
jQuery.sap.declare("sap.ui.ino.controls.TextView");
(function() {
  "use strict";
  jQuery.sap.require("sap.ui.commons.TextViewRenderer");
  
  /**
   * Works similar to sap.ui.commons.TextView.
   * However the tooltip will be supressed.
   * @see sap.ui.commons.TextView
   */

  sap.ui.commons.TextView.extend("sap.ui.ino.controls.TextView", {
    metadata : {
      properties : {}
    },

    // Ensure that title will be "filled" early enough.
    // This in turn ensures that a title will be explicitly
    // created (such that it can be overwriten later on).
    getTooltip_AsString : function () { return "."; },

    onAfterRendering : function() {
        if (sap.ui.commons.TextView.prototype.onAfterRendering) {
          sap.ui.commons.TextView.prototype.onAfterRendering.apply(this, arguments);
        }
        if (this.$() && this.$().length > 0) {
            this.$()[0].removeAttribute('title');
        }
      },

      renderer : "sap.ui.commons.TextViewRenderer"

  });

})();