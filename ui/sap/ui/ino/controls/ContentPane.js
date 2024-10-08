/*!
 * @copyright@
 */ 
jQuery.sap.declare("sap.ui.ino.controls.ContentPane");
(function() {
  "use strict";
  
  /**
   * 
   * Pane rendering one control.
   * <ul>
   * <li>Properties
   * <ul>
   * <li>fullsize: Pane takes up full size</li>
   * </ul>
   * </li>
   * </ul>
   * <ul>
   * <li>Aggregations
   * <ul>
   * <li>content: Single control to get rendered</li>
   * </ul>
   * </li>
   * </ul>
   */
  sap.ui.core.Control.extend("sap.ui.ino.controls.ContentPane", {
    metadata : {
      properties : {
        "fullsize" : "boolean"  
      },
      aggregations : {
        "content" : {
          type : "sap.ui.core.Control",
          multiple : false
        }
      }
    },
    
    renderer : function(oRm, oControl) {
      oRm.write("<div");
      oRm.writeControlData(oControl);
      oRm.writeClasses();
      if (oControl.getFullsize()) {
          oRm.addStyle("width", "100%");  
          oRm.addStyle("height", "100%");
          oRm.writeStyles();
      }
      oRm.write(">");
      if (oControl.getContent()) {
        oRm.renderControl(oControl.getContent());
      }
      oRm.write("</div>");
    }
  });
})();