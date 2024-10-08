/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.WidgetBannerData");
(function() {
    "use strict";

    /**
     * 
     * Widget Banner Data is an element representing data of a widget banner, thus there is no visual representation.
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>title: The titel that is shown</li>
     * <li>tooltip : The Tooltip Text shown for the Image. Default : title</li>
     * <li>colorCode: Background Color Code of the Banner</li>
     * <li>detailsURL: The URL (absolute or relative) pointing to the details screen</li>
     * <li>imageId: Technical integer id of the Attachment</li>
     * <li>imageStyle: Way the image is placed in the banner box. (cover/contain)</li>
     * </ul>
     * </li>
     * </ul>
     */
    sap.ui.core.Element.extend("sap.ui.ino.controls.WidgetBannerData", {
        metadata : {
            properties : {
                title : {
                    type : "string"
                },
                tooltip : {
                    type : "string"
                },
                colorCode : {
                    type : "string"
                },
                detailsURL : {
                    type : "string"
                },
                imageId : {
                    type : "int",
                    defaultValue : 0
                },
                imageStyle : {
                    type : "string",
                    defaultValue : "cover"
                }
            }
        }
    });
})();