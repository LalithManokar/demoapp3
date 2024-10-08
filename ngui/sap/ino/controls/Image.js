/*!
 * @copyright@
 */
sap.ui.define([
	"sap/ino/controls/util/ColorSupport",
	"sap/m/Image",
	"sap/m/ImageRenderer"
], function (ColorSupport, Image, ImageRenderer) {
	"use strict";
	
	/**
     * 
     * An Image control that shows an image or writes the object title in a boxed area.
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>foregroundColor: foreground color used for rendering the text if no src property is provided</li>
     * <li>objectId: id of the object</li>
     * <li>objectName: The object name.
     * This text is written in the box if no src properti is specified.</li>
     * <li>src: The URL of the object image</li>
     * </ul>
     * </li>
     * </ul>
     */
	var InoImage =  Image.extend("sap.ino.controls.Image", {
	    metadata: {
            properties : {
                "foregroundColor" : {
                    type : "sap.ui.core.CSSColor"
                },
                "objectId" : {
                    type : "int"
                },
                "objectName" : {
                    type : "string"
                },
                "imageAlt": {
                    type : "string"
                },
                "disableImage": {
				    type: 'boolean'
				}
            },
            aggregations: {
                "followButton": {
                    type: "sap.ui.core.Control",
                    multiple: false
                }
            },
            events : {
                press : {
                    parameters : {
                        objectId : {type: "int"}
                    }
                }
            }
        },
        
        init : function () {
            this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
		},

        renderDisableImage: function(oRM, oControl){
            oRM.write("<div");
            oRM.writeControlData(oControl);
            oRM.addClass("sapInoImage sapInoImageTextContainer");
            if (oControl.hasListeners("press")) {
                oRM.addClass("sapInoImageTextContainerNav");
            }
            
            var sSizeAttrs = "";
            if (oControl.getProperty("width")) {
                sSizeAttrs = "width:" + oControl.getProperty("width") + ";";
            }
            if (oControl.getProperty("height")) {
                sSizeAttrs = sSizeAttrs + "height:" + oControl.getProperty("height") + ";";
            }
            if (sSizeAttrs) {
                oRM.writeAttributeEscaped("style", sSizeAttrs);
            }

            oRM.writeClasses();
            oRM.write(">");

            oRM.write("<div");
            oRM.addClass("sapInoImageDescription");
            var sForegroundColor = oControl.getProperty("foregroundColor");

            if (sForegroundColor && sForegroundColor.length === 7) {
                oRM.writeAttributeEscaped("style", "color: " + 
                                            ColorSupport.calculateMediaTextColor(
                                                sForegroundColor.substr(1, 2), 
                                                sForegroundColor.substr(3, 2), 
                                                sForegroundColor.substr(5, 2)
                                            ) + "; background-color: " + sForegroundColor
                );
            }
            oRM.writeClasses();
            if (oControl.hasListeners("press")) {
                if (oControl.getTooltip_Text()) {
                    oRM.writeAttributeEscaped("title",  oControl.getTooltip_Text());
                }
            }
            oRM.write(">");

            var imageAlt = oControl.getProperty("imageAlt");
            if(imageAlt && imageAlt.length > 100){
                imageAlt = imageAlt.slice(0, 99) + '...';
            }
            
            if (imageAlt) {
                oRM.writeEscaped(imageAlt);
            }

            oRM.write("</div>");
            
            oControl._renderFollowButton(oRM, oControl);
            
            oRM.write("</div>");
        },

        renderImage: function(oRM, oControl){
            oRM.write("<div>");
	        oControl._renderFollowButton(oRM, oControl);
            ImageRenderer.render.apply(this, arguments);
            oRM.write("</div>");
        },

        renderDefault: function(oRM, oControl){
            oRM.write("<div");
            oRM.writeControlData(oControl);
            oRM.addClass("sapInoImage sapInoImageTextContainer");
            if (oControl.hasListeners("press")) {
                oRM.addClass("sapInoImageTextContainerNav");
            }
            
            var sSizeAttrs = "";
            if (oControl.getProperty("width")) {
                sSizeAttrs = "width:" + oControl.getProperty("width") + ";";
            }
            if (oControl.getProperty("height")) {
                sSizeAttrs = sSizeAttrs + "height:" + oControl.getProperty("height") + ";";
            }
            if (sSizeAttrs) {
                oRM.writeAttributeEscaped("style", sSizeAttrs);
            }

            oRM.writeClasses();
            oRM.write(">");

            oRM.write("<div");
            oRM.addClass("sapInoImageDefaultText");
            var sForegroundColor = oControl.getProperty("foregroundColor");

            if (sForegroundColor && sForegroundColor.length === 7) {
                oRM.writeAttributeEscaped("style", "opacity: 0.4; color: " + 
                                            ColorSupport.calculateMediaTextColor(
                                                sForegroundColor.substr(1, 2), 
                                                sForegroundColor.substr(3, 2), 
                                                sForegroundColor.substr(5, 2)
                                            ) + "; background-color: " + sForegroundColor
                );
            }
            oRM.writeClasses();
            if (oControl.hasListeners("press")) {
                if (oControl.getTooltip_Text()) {
                    oRM.writeAttributeEscaped("title",  oControl.getTooltip_Text());
                }
            }
            oRM.write(">");

            var sObjectName = oControl.getProperty("objectName");
            if (sObjectName) {
                oRM.writeEscaped(sObjectName);
            }

            oRM.write("</div>");
            
            oControl._renderFollowButton(oRM, oControl);
            
            oRM.write("</div>");
        },

		renderer : function(oRM, oControl) {
		    var disableImage = oControl.getProperty('disableImage');
            var imageSrc = oControl.getProperty("src");
            if (disableImage){
                return oControl.renderDisableImage(oRM, oControl);
            }

		    if (!imageSrc) {
		        return oControl.renderDefault(oRM, oControl);    
            } 
            
            return oControl.renderImage(oRM, oControl);
		},
		
		_renderFollowButton: function(oRM, oControl){
    
            var oFollowButton = oControl.getAggregation("followButton");
            
            oRM.renderControl(oFollowButton);
            
        },
		
		onAfterRendering : function() {
		    var $this = jQuery(this.getDomRef());
		    $this.addClass("sapInoImage");
		    if ($this.is("img")) {
		        $this.addClass("sapInoImageMargins");
		        $this.attr("tabindex", "-1");
		    } else if (this.getWidth()) {
		        var parts = this.getWidth().match(/^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/);
		        if (parts && parts[1]) {
		            var iPrecision = (parts[2] === "px") ? 0 : 2;
		            var sFS = "" + (parts[1] * 0.37).toFixed(iPrecision) + parts[2];
    		        $this.children(".sapInoImageText").css("font-size", sFS);
		        }
		    }
        }
		
	});
	
	InoImage.prototype.setSrc = function (oValue) {
        this.setProperty("src", oValue);
        //this._getLabel().setText(oValue);
    };
	
	return InoImage;
});