/*!
 * @copyright@
 */ 
jQuery.sap.declare("sap.ui.ino.controls.Tag");
(function() {
    "use strict";

    /**
     * 
     * Control representing a Tag e.g. in a Tag Cloud. 
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>text: The text of the tag that is displayed.</li>
     * <li>rank: Identifies the importance of this tag within a list of tags.</li>
     * <li>tagId: The id of the tag.</li>
     * <li>action: The action that should be executed when clicking on the tag. The id is passed as parameter to the action.</li>
     * <li>readonly: If true the tag cannot be clicked but is text only.</li>
     * <li>describedBy : Id of a describing DOM element</li>
     * </ul>
     * </li>
     * </ul>
     */
    sap.ui.core.Control.extend("sap.ui.ino.controls.Tag", { 
        metadata : {
            properties : {
                "text"     : "string",
                "rank"     : "int",
                "tagId"    : "int",
                "action"   : "object",
                "readonly" : "boolean",
                "tooltip"  : "string",
                "describedBy" : "string"
            }
        },
    
        renderer : function(oRm, oControl) {
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("sapUiInoTag");
            oRm.writeAttribute("data-sap-ui-ino-controls-tag-rank", oControl.getRank());
            if (oControl.getReadonly()) {
                oRm.addClass("sapUiInoTagReadOnly");
            }
            oRm.writeClasses();
            oRm.write(">");
            
            if (oControl.getReadonly()) {
                var oText = new sap.ui.commons.TextView({
                    text:  oControl.getText(),
                    ariaDescribedBy : oControl.getDescribedBy() ? oControl.getDescribedBy() : undefined
                });
                
                oRm.renderControl(oText);
            }
            else {
                var oLink = new sap.ui.commons.Link({
        			text:  oControl.getText(),
        			press: function() {
        				oControl.getAction().apply( this, [ oControl.getTagId() ] );
        			},
        			tooltip : oControl.getTooltip() ? oControl.getTooltip() : undefined,
        			ariaDescribedBy : oControl.getDescribedBy() ? oControl.getDescribedBy() : undefined
        		});
                
                oRm.renderControl(oLink);
            }
            oRm.write("</div>");
        }
    });

})();