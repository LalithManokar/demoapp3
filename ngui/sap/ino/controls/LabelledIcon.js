/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/Icon",
    "sap/m/Text",
    "sap/m/HBox"
], function (Control,
             Icon,
             Text,
             HBox) {
    "use strict";

    /**
     *
     * The LabelledIcon is a composition of an icon with a label, where the icon apepars on the left and
     * the labelling text on the right hand side.
     *
     * <ul>
     * <li>Properties
     * <ul>
     * <li>iconUrl: URL of the icon</li>
     * <li>label: text of the label</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * <li> _box: the horizontal box that holds the icon and label</li>
     * </ul>
     * </li>
     * </ul>
     */
    var LabelledIcon = Control.extend("sap.ino.controls.LabelledIcon", {
        metadata: {
            properties: {
                "iconUrl": {
                    type: "string"
                },
                "label": {
                    type: "string"
                },
                "exportLabel": {
                    type: "string"
                }
            },
            
            aggregations: {
                "_box": {
                    type: "sap.m.HBox",
                    multiple: false,
                    visibility: "hidden"
                },
                "_exportText": {
                    type: "sap.m.Text",
                    multiple: false,
                    visibility: "hidden"
                }
			}
        },
        
        init: function () {
            this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
        },
        
        _getIcon: function() {
            return this._getBox().getItems()[0];
		},
		
		_getLabel: function() {
            return this._getBox().getItems()[1];
		},
		
		_getExportLabel: function() {
		    var oExportText = this.getAggregation("_exportText");
		    if (!oExportText) {
		        oExportText = new Text({
		            text: this.getExportLabel(),
                    wrapping: false
		        });
		        this.setAggregation("_exportText", oExportText);
		    }
		    return oExportText;
        },
		
		_getBox: function() {
            var oBox = this.getAggregation("_box");
            if (!oBox) {
                var oIcon = new Icon({
                    src: this.getIconUrl(),
                    useIconTooltip: false
                }).addStyleClass("sapInoLabelledIconIcon");
                var oText = new Text({
                    text: this.getLabel(),
                    wrapping: false,
                }).addStyleClass("sapInoLabelledIconLabel");
                oBox = new HBox({
                    items: [oIcon, oText],
                    displayInline: true
                });                
                this.setAggregation("_box", oBox, true);
            }
            return oBox;
		},
                
        renderer: function (oRM, oControl) {
            oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("sapInoLabelledIcon");
			oRM.writeClasses();
			if (oControl.getTooltip_Text()) {
			    oRM.writeAttributeEscaped("title", oControl.getTooltip_Text());
			}
			oRM.write(">");
			
            oRM.renderControl(oControl._getBox());
            
            oRM.write("</div>");
        }
    });
    
    LabelledIcon.prototype.onAfterRendering = function() {
        this._getLabel().data(this.data());
        this._getExportLabel().data(this.data());
    };
    
    LabelledIcon.prototype.bindProperty = function (sKey, oBinding) {
        Control.prototype.bindProperty.apply(this, arguments);
        switch (sKey) {
            case "label":
                this._getLabel().bindProperty("text", oBinding);
                break;
            case "exportLabel":
                this._getExportLabel().bindProperty("text", oBinding);
                break;
            default:
                break;
        }
    };
    
    LabelledIcon.prototype.setIconUrl = function (oValue) {
        this.setProperty("iconUrl", oValue);
        this._getIcon().setSrc(oValue);
    };
    
    LabelledIcon.prototype.setLabel = function (oValue) {
        this.setProperty("label", oValue);
        this._getLabel().setText(oValue);
    };
    
    LabelledIcon.prototype.setExportLabel = function (oValue) {
        this.setProperty("exportLabel", oValue);

    };
    
    return LabelledIcon;
});