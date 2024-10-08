/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.Attachment");

(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.models.object.Attachment");
    jQuery.sap.require("sap.ui.ino.controls.LightBox");

    /**
     * 
     * An Attachment is a visual representation of uploaded data to an entity. Different media types are distinguished
     * (image, video, audio, document). If the attachment data is an image a preview is rendered inline in the visual
     * representation otherwise a placeholder icon is shown. Attachments can be editable, and a cross indicates the
     * remove action.
     * 
     * The Attachment uses the Attachment application object to communicate with the backend. There the URL download
     * endpoint is for retrieving the preview image.
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>assignmentId: Unique id, representing the attachment assignment in the backend</li>
     * <li>attachmentId: Unique id, representing the attachment in the backend</li>
     * <li>filter: Filter type code of the attachment</li> 
     * <li>mediaType: MIME type of an attachment used to render a preview or placeholder icon</li>
     * <li>fileName: File name of the attachment displayed on the bottom</li>
     * <li>url: Full url download path of the attachment</li>
     * <li>removeTooltip: Tooltip for the remove button if attachment is editable</li>
     * <li>editable: Indicates if the attachment is editable and can be removed</li>
     * <li>backendRemove: Indicates if the attachment is removed in backend</li>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * <li>removeSuccessful: Triggered when the attachment was successfully removed in the backend. Returns the
     * assignment id as parameter </li>
     * <li>removeFailed: Triggered when removal of the attachment in the backend failed. Returns the assignment id
     * (assignmentId) as parameter </li>
     * </ul>
     * </li>
     * </ul>
     */
    sap.ui.core.Control.extend("sap.ui.ino.controls.Attachment", {
        metadata : {
            properties : {
                "assignmentId" : "int",
                "attachmentId" : "int",
                "filter" : "string",
                "roleFilter" : "string",
                "mediaType" : "string",
                "fileName" : "string",
                "url" : "string",
                "removeTooltip" : "string",
                "editable" : {
                    type : "boolean",
                    defaultValue : true
                },
                "backendRemove" : {
                    type : "boolean",
                    defaultValue : true
                },
                "handleRemoveInternal" : {
                    type : "boolean",
                    defaultValue : true
                }
            },
            aggregations : {
                "_removeButton" : {
                    type : "sap.ui.commons.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_lightBox" : {
                    type : "sap.ui.ino.controls.LightBox",
                    multiple : false,
                    visibility : "hidden"
                }
            },
            events : {
                "removeSuccessful" : {},
                "removeFailed" : {},
                "remove" : {}
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

        _getLightBox : function() {
            var oControl = this.getAggregation("_lightBox");
            if (!oControl) {
                oControl = new sap.ui.ino.controls.LightBox({
                    image : this.getUrl(),
                    title : this.getFileName()
                });
                this.setAggregation("_lightBox", oControl, true);
            }
            return oControl;
        },

        _removeAttachment : function() {
            if (this.getBackendRemove()) {
                var that = this;
                var oDeleteRequest = sap.ui.ino.models.object.Attachment.del(this.getAttachmentId());
                oDeleteRequest.done(function(oResponse) {
                    that.fireRemoveSuccessful({
                        assignmentId : that.getAssignmentId()
                    });
                });
                oDeleteRequest.fail(function(oResponse) {
                    that.fireRemoveFailed({
                        assignmentId : that.getAssignmentId()
                    });
                });
            } else {
                this.fireRemoveSuccessful({
                    assignmentId : this.getAssignmentId()
                });
            }
        },

        onBeforeRendering : function() {
            var that = this;
            var oRemoveButton = this.getAggregation("_removeButton");
            if (!oRemoveButton) {
                oRemoveButton = new sap.ui.commons.Button({
                    lite : true,
                    tooltip : this.getRemoveTooltip() || "",
                    press : function(oEvent) {
                        that._sFocus = that.sId;
                        oEvent.cancelBubble();
                        oEvent.preventDefault();
                        if(that.getHandleRemoveInternal()) {
                            that._removeAttachment();
                        } else {
                            that.fireRemove({
                                assignmentId : that.getAssignmentId(),
                                attachmentId : that.getAttachmentId(),
                                filename : that.getFileName(),
                                mediaType : that.getMediaType()
                            });
                        }
                    }
                });
                oRemoveButton.addStyleClass("sapUiInoAttachmentRemove").addStyleClass("spriteAttachment").addStyleClass("sapUiInoAttachment_remove");
                this.setAggregation("_removeButton", oRemoveButton);
            }
        },

        onAfterRendering : function() {
            var oRemoveButton = this.getAggregation("_removeButton");
            if (this.getMediaType().toLowerCase().indexOf("image/") === 0) {
                var that = this;
                this.$().find("a").focus();
                this.$().click(function(oEvent) {
                	if(oRemoveButton.getId() !== oEvent.originalEvent.target.id && !oEvent.originalEvent.target.classList.contains("sapUiInoAttachmentFileNameDiv")){
                		that._getLightBox().open();	
                	}
                })
            }
            oRemoveButton.$().attr("aria-label", this.getFileName());
        },

        renderer : function(oRm, oControl) {
            var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("sapUiInoAttachment");
            oRm.writeClasses();

            oRm.write(">");

            if (oControl.getUrl() && oControl.getMediaType().toLowerCase().indexOf("image/") != 0) {
                oRm.write("<a target=\"_blank\" tabindex=\"-1\"");
                oRm.writeAttribute("href", oControl.getUrl());
                oRm.writeAttributeEscaped("download", oControl.getFileName());
                oRm.write(">");
            }

            oRm.write("<div");
            oRm.addClass("sapUiInoAttachmentPreview");

            if (oControl.getMediaType()) {
                var sMimeType = oControl.getMediaType().toLowerCase();
                if (sMimeType.indexOf("image/") === 0) {
                    // DO NOTHING
                } else if (sMimeType.indexOf("video/") === 0) {
                    oRm.addClass("sapUiInoAttachmentVideo");
                    oRm.addClass("spriteAttachment");
                    oRm.addClass("sapUiInoAttachment_attachment_video");
                } else if (sMimeType.indexOf("audio/") === 0) {
                    oRm.addClass("sapUiInoAttachmentAudio");
                    oRm.addClass("spriteAttachment");
                    oRm.addClass("sapUiInoAttachment_attachment_audio");
                } else {
                    oRm.addClass("sapUiInoAttachmentDocument");
                    oRm.addClass("spriteAttachment");
                    oRm.addClass("sapUiInoAttachment_attachment_doc");
                }
            } else {
                oRm.addClass("sapUiInoAttachmentDocument");
            }

            oRm.writeClasses();

            if (oControl.getFileName()) {
                oRm.writeAttributeEscaped("title", oControl.getFileName());
            }

            oRm.write(">");

            if (oControl.getMediaType()) {
                if (oControl.getMediaType().toLowerCase().indexOf("image/") === 0) {
                    oRm.write("<img");
                    oRm.writeAttributeEscaped("draggable", "true");
                    oRm.writeAttributeEscaped("src", oControl.getUrl());
                    oRm.write("/>");
                } else if (oControl.getMediaType().toLowerCase().indexOf("video/") === 0) {
                    oRm.write("<div style='width:100%; height:100%' ondragstart=\"event.dataTransfer.setData('text/uri-list', '" + oControl.getUrl() + "');\"");
                    oRm.addClass("spriteAttachment sapUiInoAttachment_attachment_video");
                    oRm.writeClasses();
                    oRm.writeAttributeEscaped("draggable", "true");
                    oRm.write("/>");
                }
            }

            oRm.write("</div>");

            if (oControl.getFileName()) {
                if (oControl.getUrl()) {
                    oRm.write("<a target=\"_blank\" tabindex=\"0\"");
                    oRm.writeAttribute("href", oControl.getUrl());
                    oRm.writeAttributeEscaped("download", oControl.getFileName());
                } else {
                    oRm.write("<div");
                }
                oRm.addClass("sapUiInoAttachmentFileName");
                oRm.writeClasses();
                oRm.writeAttributeEscaped("title", oControl.getFileName());
                oRm.write(">");
                oRm.write("<div");
                oRm.addClass("sapUiInoAttachmentFileNameDiv");
                oRm.writeClasses();
                oRm.write(">");
                if(oControl.getProperty("roleFilter") === "BACKGROUND_IMG") {
                    oRm.writeEscaped(i18n.getText("CTRL_ATTACHMENT_CONTROL_BACKGROUND_IMAGE_CAMPAIGN"));
                } else if (oControl.getProperty("roleFilter") === "SMALL_BACKGROUND_IMG") {
                    oRm.writeEscaped(i18n.getText("CTRL_ATTACHMENT_CONTROL_SMALL_BACKGROUND_IMAGE_CAMPAIGN"));
                } else if (oControl.getProperty("roleFilter") === "CAMPAIGN_DETAIL_IMG") {
                    oRm.writeEscaped(i18n.getText("CTRL_ATTACHMENT_CONTROL_TITLE_IMAGE_CAMPAIGN"));
                }else if (oControl.getProperty("roleFilter") === "CAMPAIGN_LIST_IMG") {
                    oRm.writeEscaped(i18n.getText("CTRL_ATTACHMENT_CONTROL_LIST_IMAGE_CAMPAIGN")); 
                }else {
                    oRm.writeEscaped(oControl.getFileName());    
                }
                oRm.write("</div>");
                if (oControl.getUrl()) {
                    oRm.write("</a>");
                } else {
                    oRm.write("</div>");
                }
            }

            if (oControl.getEditable()) {
                oRm.renderControl(oControl.getAggregation("_removeButton"));
            }

            if (oControl.getUrl() && oControl.getMediaType().toLowerCase().indexOf("image/") != 0) {
                oRm.write("</a>");
            }

            oRm.write("</div>");
        }
    });
})();