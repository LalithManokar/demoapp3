/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.AttachmentControl");
(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.controls.Attachment");
    jQuery.sap.require("sap.ui.ino.controls.FileUploader");
    jQuery.sap.require("sap.ui.ino.controls.AriaLivePriority");

    /**
     * 
     * An Attachment Control is a list of Attachment controls displayed under a title. In edit mode a File Uploader
     * control with style 'Attachment' functioning as "Add" is put in front of the list. The control can also be used as
     * display only version, when having the editable property set to false.
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>title: Title below the attachments are displayed</li>
     * <li>filters: Filter type code, for filtering attachments</li>
     * <li>roleFilters: Filter role type code, for filtering attachments</li>
     * <li>useFilter: Flag if filter mechanism is used</li>
     * <li>useRoleFilter: Flag if role filter mechanism is used</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * <li>titleImageFileUploader: A File Uploader control for uploading an image as title image</li>
     * <li>backgroundImageFileUploader: A File Uploader control for uploading an image as background image</li>
     * <li>backgroundMobileSmallImageFileUploader: A File Uploader control for uploading an image as a campaign small size background image for mobile application</li>
     * <li>titleVideoFileUploader: A File Uploader control for uploading a video as title image</li>
     * <li>attachmentFileUploader: A File Uploader control for uploading new files as attachments</li>
     * <li>attachments: Attachments to be shown in the control</li>
     * <li>footer: Control rendered as footer after attachment</li>
     * </ul>
     * </li>
     * </ul>
     */
    sap.ui.core.Control.extend("sap.ui.ino.controls.AttachmentControl", {
        metadata : {
            properties : {
                "title" : "string",
                "filters" : {
                    type : "string[]",
                    defaultValue : new Array()
                },
                "roleFilters" : {
                    type : "string[]",
                    defaultValue : new Array()
                },
                "useFilter" : "boolean",
                "useRoleFilter" : "boolean",
                ariaLivePriority : {
                    type : "sap.ui.ino.controls.AriaLivePriority",
                    defaultValue : sap.ui.ino.controls.AriaLivePriority.none
                },
                "noItemsText" : "string"
            },
            aggregations : {
                "titleImageFileUploader" : {
                    type : "sap.ui.ino.controls.FileUploader",
                    multiple : false,
                    bindable : "bindable"
                },
                "backgroundImageFileUploader" : {
                    type : "sap.ui.ino.controls.FileUploader",
                    multiple : false,
                    bindable : "bindable"
                },
                "backgroundMobileSmallImageFileUploader" : {
                    type : "sap.ui.ino.controls.FileUploader",
                    multiple : false,
                    bindable : "bindable"
                },
                "titleVideoFileUploader" : {
                    type : "sap.ui.ino.controls.FileUploader",
                    multiple : false,
                    bindable : "bindable"
                },
                "attachmentFileUploader" : {
                    type : "sap.ui.ino.controls.FileUploader",
                    multiple : false,
                    bindable : "bindable"
                },
                "attachments" : {
                    type : "sap.ui.ino.controls.Attachment",
                    multiple : true,
                    singularName : "attachment",
                    bindable : "bindable"
                },
                "header" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    bindable : "bindable"
                },
                "footer" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    bindable : "bindable"
                }
            }
        },

        constructor : function(sId, mSettings) {
            sap.ui.core.Control.apply(this, arguments);
        },

        init : function() {
            this._reset();
        },

        exit : function() {
            this._reset();
        },

        _reset : function() {
        },

        renderer : function(oRm, oControl) {
            oRm.write("<div");
            oRm.writeControlData(oControl);

            if (oControl.getAriaLivePriority()) {
                oRm.writeAttribute("aria-live", oControl.getAriaLivePriority());
            }

            oRm.write(">");

            var bVisibleAttachment = false;
            var aAttachments = oControl.getAttachments();
            for (var i = 0; i < aAttachments.length; i++) {
                var bFilterVisible = false;
                if (!oControl.getUseFilter()) {
                    bFilterVisible = true;
                } else if (oControl.getFilters()) {
                    var aFilter = oControl.getFilters();
                    for (var f = 0; f < aFilter.length; f++) {
                        var sFilter = aFilter[f];
                        if (!aAttachments[i].getFilter() || aAttachments[i].getFilter() == sFilter) {
                            bFilterVisible = true;
                            break;
                        }
                    }
                }
                
                var bRoleFilterVisible = false;
                if (!oControl.getUseRoleFilter()) {
                    bRoleFilterVisible = true;
                } else if (oControl.getRoleFilters()) {
                    var aRoleFilter = oControl.getRoleFilters();
                    for (var ff = 0; ff < aRoleFilter.length; ff++) {
                        var sRoleFilter = aRoleFilter[ff];
                        if (!aAttachments[i].getRoleFilter() || aAttachments[i].getRoleFilter() == sRoleFilter) {
                            bRoleFilterVisible = true;
                            break;
                        }
                    }
                }
                
                if (bFilterVisible && bRoleFilterVisible) {
                    bVisibleAttachment = true;
                    break;
                }
            }

            if (bVisibleAttachment || oControl.getTitleImageFileUploader() || oControl.getBackgroundImageFileUploader() || oControl.getBackgroundMobileSmallImageFileUploader() || oControl.getTitleVideoFileUploader() || oControl.getAttachmentFileUploader()) {

                if (oControl.getTitle()) {
                    oRm.write("<div");
                    oRm.addClass("sapUiInoAttachmentControlTitle");
                    oRm.writeClasses();
                    oRm.write(">");
                    oRm.writeEscaped(oControl.getTitle());
                    oRm.write("</div>");
                }
                
                if (oControl.getHeader()) {
                    oRm.renderControl(oControl.getHeader());
                }

                if (oControl.getTitleImageFileUploader()) {
                    oRm.write("<div");
                    oRm.addClass("sapUiInoAttachmentControlFileUploader");
                    oRm.writeClasses();
                    oRm.write(">");
                    oRm.renderControl(oControl.getTitleImageFileUploader());
                    oRm.write("</div>");
                }

                if (oControl.getBackgroundImageFileUploader()) {
                    oRm.write("<div");
                    oRm.addClass("sapUiInoAttachmentControlFileUploader");
                    oRm.writeClasses();
                    oRm.write(">");
                    oRm.renderControl(oControl.getBackgroundImageFileUploader());
                    oRm.write("</div>");
                }
                
                if (oControl.getBackgroundMobileSmallImageFileUploader()) {
                    oRm.write("<div");
                    oRm.addClass("sapUiInoAttachmentControlFileUploader");
                    oRm.writeClasses();
                    oRm.write(">");
                    oRm.renderControl(oControl.getBackgroundMobileSmallImageFileUploader());
                    oRm.write("</div>");
                }
                
                if (oControl.getTitleVideoFileUploader()) {
                    oRm.write("<div");
                    oRm.addClass("sapUiInoAttachmentControlFileUploader");
                    oRm.writeClasses();
                    oRm.write(">");
                    oRm.renderControl(oControl.getTitleVideoFileUploader());
                    oRm.write("</div>");
                }

                if (oControl.getAttachmentFileUploader()) {
                    oRm.write("<div");
                    oRm.addClass("sapUiInoAttachmentControlFileUploader");
                    oRm.writeClasses();
                    oRm.write(">");
                    oRm.renderControl(oControl.getAttachmentFileUploader());
                    oRm.write("</div>");
                }

                for (var i = 0; i < aAttachments.length; i++) {
                    var bFilterVisible = false;
                    if (!oControl.getUseFilter()) {
                        bFilterVisible = true;
                    } else if (oControl.getFilters()) {
                        var aFilter = oControl.getFilters();
                        for (var f = 0; f < aFilter.length; f++) {
                            var sFilter = aFilter[f];
                            if (!aAttachments[i].getFilter() || aAttachments[i].getFilter() == sFilter) {
                                bFilterVisible = true;
                                break;
                            }
                        }
                    }
                    
                    var bRoleFilterVisible = false;
                    if (!oControl.getUseRoleFilter()) {
                        bRoleFilterVisible = true;
                    } else if (oControl.getRoleFilters()) {
                        var aRoleFilter = oControl.getRoleFilters();
                        for (var f = 0; f < aRoleFilter.length; f++) {
                            var sRoleFilter = aRoleFilter[f];
                            if (!aAttachments[i].getRoleFilter() || aAttachments[i].getRoleFilter() == sRoleFilter) {
                                bRoleFilterVisible = true;
                                break;
                            }
                        }
                    }
                    
                    if (bFilterVisible && bRoleFilterVisible) {
                        oRm.renderControl(aAttachments[i]);
                    }
                }

                if (oControl.getFooter()) {
                    oRm.renderControl(oControl.getFooter());
                }
            }
            
            if(oControl.getNoItemsText() && aAttachments.length < 1) {
                oRm.write("<div");
                oRm.write(">");
                oRm.writeEscaped(oControl.getNoItemsText());
                oRm.write("</div>");
            }

            oRm.write("</div>");
        },

        focusAttachmentAfterRendering : function(iNum) {
            this._iFocus = iNum;
        },

        onAfterRendering : function() {
            var that = this;

            if (this._iFocus !== undefined) {
                var iFocus = this._iFocus;
                this._iFocus = undefined;

                var aAttachments = this.getAttachments();
                if (iFocus >= aAttachments.length) {
                    iFocus = aAttachments.length - 1;
                }

                if (iFocus > -1) {
                    jQuery.sap.byId(aAttachments[iFocus].getId(), that.getDomRef()).find("a").focus();
                } else {
                    var $FileUploader = jQuery(this.getDomRef()).find(".sapUiInoAttachmentControlFileUploader");
                    if ($FileUploader && $FileUploader.length > 0) {
                        var oFileUploader = $FileUploader[$FileUploader.length - 1];
                        var aTabs = jQuery(oFileUploader).find("[tabindex='0']");
                        if (aTabs && aTabs.length > 0) {
                            var oTab = aTabs[aTabs.length - 1];
                            jQuery(oTab).focus();
                        }
                    }
                }
            }
        }
    });
})();