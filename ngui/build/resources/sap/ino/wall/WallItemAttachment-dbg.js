/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.WallItemAttachment");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBase");
    jQuery.sap.require("sap.ino.wall.DropUpload");
    jQuery.sap.require("sap.ino.commons.models.object.Attachment");
    jQuery.sap.require("sap.ino.commons.application.Configuration");
    var Configuration = sap.ino.commons.application.Configuration;
    
    var AttachmentType = {
        DOCUMENT : "DOCUMENT",
        IMAGE : "IMAGE",
        VIDEO : "VIDEO",
        AUDIO : "AUDIO",
        TEXT : "TEXT",
        ERROR : "ERROR",
        DEFAULT : "DOCUMENT"
    };

    sap.ino.wall.WallItemBase.extend("sap.ino.wall.WallItemAttachment", {
        metadata : {
            properties : {
                "status" : {
                    type : "string",
                    group : "Appearance",
                    defaultValue : 'Normal'
                },
                "URL" : {
                    type : "sap.ui.core.URI",
                    group : "Data",
                    defaultValue : null
                },
                "type" : {
                    type : "string",
                    group : "Appearance",
                    defaultValue : null
                },
                "fileName" : {
                    type : "string",
                    group : "Data",
                    defaultValue : null
                },
                "assignmentId" : {
                    type : "int",
                    group : "Identification",
                    defaultValue : -1
                }
            },
            aggregations : {
                "_icon" : {
                    type : "sap.ui.core.Icon",
                    multiple : false,
                    visibility : "hidden"
                },
                "_busyIndicator" : {
                    type : "sap.m.BusyIndicator",
                    multiple : false,
                    visibility : "hidden"
                },
                "_dropUpload" : {
                    type : "sap.ino.wall.DropUpload",
                    multiple : false,
                    visibility : "hidden"
                }
            }
        }
    });

    sap.ino.wall.WallItemAttachment.AttachmentType = AttachmentType;
    
    /**
     * Initializes the control
     * 
     * @private
     */
    sap.ino.wall.WallItemAttachment.prototype.init = function() {
        sap.ino.wall.WallItemBase.prototype.init.call(this);

        this.setResizable(false);
    };

    /*******************************************************************************************************************
     * overloaded setters to supress rendering and update ui
     ******************************************************************************************************************/

    sap.ino.wall.WallItemAttachment.prototype.setURL = function(sURI) {
        
        this.setProperty("URL", sURI, true);
        this.updateIcon();

        // inform wall that this item has changed a persistence property
        if (this.getParent()) {
            this.getParent()._notifyItemChanged(this);
        }
        return this;
    };
    
    sap.ino.wall.WallItemAttachment.prototype.setAssignmentId = function(iID) {
        
        this.setProperty("assignmentId", iID, true);
        
        // inform wall that this item has changed a persistence property
        if (this.getParent()) {
            this.getParent()._notifyItemChanged(this);
        }
        return this;
    };

    sap.ino.wall.WallItemAttachment.prototype._uploadDoc = function(oEvent) {
        var that = this;
        var aFiles = oEvent.getParameter("files");
        var oFile, sFilename, oFormData, oReader, iStorageId;

        // display an error if user tries to drop a file with IE9
        if (sap.ui.Device.browser.name === "ie" && sap.ui.Device.browser.version < 10 && aFiles === undefined) {
            return;
        }

        // hide drag preview
        jQuery.sap.byId(this.getParent().getId() + "-drag").css("display", "none");

        // reset cursor to normal
        this.$().removeClass("dragCursor");

        if (aFiles.length !== 0) {
            oFile = aFiles[0];
            
            that.setStatus("Busy");
            that.setFlipped(false);
            sap.ino.commons.models.object.Attachment.uploadFile(oFile).done(function(oResponse) {
                var iStorageId = oResponse.attachmentId;
                var sFileName = oResponse.fileName;
                var sType = oResponse.mediaType;
                setTimeout(function() {
                    that.setURL(Configuration.getAttachmentDownloadURL(iStorageId));
                    that.setTitle(sFileName);
                    that.setType(sType);
                    that.setFileName(sFileName);
                    
                    that.updateIcon();
                    that.setStatus("Normal");
                    
                    that._iStorageId = iStorageId;
                }, 500);
            }).fail(function(oResponse) {
                var aMsg = oResponse.messages;
                
                that.setType(AttachmentType.ERROR);
                
                that.updateIcon();
                that.setStatus("Normal");   
                
                // TODO introduce common error handling
                if (aMsg && aMsg.length > 0) {
                    sap.m.MessageToast.show(that._oMB.getText(aMsg[0].MESSAGE, aMsg[0].PARAMETERS), { duration: 6000 });
                }
            });
        }
    };

    
    /*******************************************************************************************************************
     * overloaded setters to supress rendering and update ui
     ******************************************************************************************************************/
    
    sap.ino.wall.WallItemAttachment.prototype.setTitle = function(sTitle, bSuppressNotify) {
        sap.ino.wall.WallItemBase.prototype.setTitle.apply(this, [sTitle, bSuppressNotify]);
        
        if (sTitle !== this._oRB.getText("WALL_ITEMATTACHMENT_NEW_TEXT")) {
            this._getInputTitle().setValue(sTitle);
            this._getInputTitle().$().children("input").attr("value", sTitle);
        }
        return this;
    };
    
    sap.ino.wall.WallItemAttachment.prototype.setType = function(sType) {
        sType = sap.ino.wall.WallItemAttachment.mapType(sType);
        this.setProperty("type", sType, true);   
        
        if (this.getParent()) {
            this.getParent()._notifyItemChanged(this);
        }
        this.updateIcon();
        return this;
    };
    

    sap.ino.wall.WallItemAttachment.mapType = function(sType) {
        if (sType === AttachmentType.IMAGE || sType.indexOf("image/") === 0) {
            sType = AttachmentType.IMAGE;
        }
        else if (sType === AttachmentType.VIDEO || sType.indexOf("video/") === 0) {
            sType = AttachmentType.VIDEO;
        }
        else if (sType === AttachmentType.AUDIO || sType.indexOf("audio/") === 0) {
            sType = AttachmentType.AUDIO;
        }
        else if (sType === AttachmentType.TEXT || sType.indexOf("text/") === 0) {
            sType = AttachmentType.TEXT;
        }
        else if (sType === AttachmentType.ERROR) {
            sType = AttachmentType.ERROR;
        }
        else if (sType === AttachmentType.DOCUMENT) {
            sType = AttachmentType.DOCUMENT;
        }
        else {
            sType = AttachmentType.DEFAULT;
        }        
        return sType;
    }
    
    sap.ino.wall.WallItemAttachment.prototype.setFileName = function(sName) {
        
        this.setProperty("fileName", sName, true);   
        
        if (this.getParent()) {
            this.getParent()._notifyItemChanged(this);
        }   
        
        this.updateIcon();
        
        return this;
    };

    /**
     * Lazy initialization of control managed in an internal aggregation
     * 
     * @private
     * @returns {sap.m/BusyIndicator} the control
     */

    sap.ino.wall.WallItemAttachment.prototype._getBusyIndicator = function() {
        var oBusyIndicator = this.getAggregation("_busyIndicator");

        if (!oBusyIndicator) {
            // create control
            oBusyIndicator = new sap.m.BusyIndicator(this.getId() + "-busy").addStyleClass("sapInoWallIndicatorBusy");

            // set hidden aggregation without rerendering
            this.setAggregation("_busyIndicator", oBusyIndicator, true);
        }

        return oBusyIndicator;
    };

    /**
     * Lazy initialization of a control managed in an internal aggregation
     * 
     * @private
     * @returns {sap.ui.core/Control} the control
     */
    sap.ino.wall.WallItemAttachment.prototype._getDropUpload = function() {
        var oControl = this.getAggregation("_dropUpload");

        if (!oControl) {
            // create control
            oControl = new sap.ino.wall.DropUpload({
                size : "L",
                change : [this._uploadDoc, this],
                icon : "sap-icon://upload",
                accept : "*/*"
            });

            // set hidden aggregation without rerendering
            this.setAggregation("_dropUpload", oControl, true);
        }

        return oControl;
    };
    
    
    sap.ino.wall.WallItemAttachment.prototype._onIconPress = function() {
        if (!this._bMoving && this.getURL()) {
            var $Link = document.createElement("a");
            $Link.href = this.getURL();
            $Link.download = this.getFileName();

            document.body.appendChild($Link);
            $Link.click();
            document.body.removeChild($Link);
        }
    };
    
    
    sap.ino.wall.WallItemAttachment.prototype.updateIcon = function() {
        this._getIcon();
    };
    
    
    sap.ino.wall.WallItemAttachment.prototype._getIcon = function() {
        var oControl = this.getAggregation("_icon");
        var that = this;
        var iSize = 85;
        var sIcon;

        // update icon every access
        switch(this.getType()) {
            case AttachmentType.IMAGE:
                sIcon = "sap-icon://attachment-photo";
                break;
            case AttachmentType.VIDEO:
                sIcon = "sap-icon://attachment-video";
                break;
            case AttachmentType.AUDIO:
                sIcon = "sap-icon://attachment-audio";
                break;
            case AttachmentType.TEXT:
                sIcon = "sap-icon://attachment-text-file";
                break;
            case AttachmentType.ERROR:
                sIcon = "sap-icon://alert";
                break;
            case AttachmentType.DOCUMENT:
                /* fall through */
            default:
                sIcon = "sap-icon://document";            
        }
        
        if (!oControl) {
            // create control
            oControl = new sap.ui.core.Icon({
                src : sIcon,
                size : iSize + "px",
                width : iSize + "px",
                height : (iSize + 10) + "px",
                decorative : true
            });
            
            // prevent invalidation when setting the tooltip
            // only support text
            oControl.setTooltip = function(sText) {
                this.setAggregation("tooltip", sText, true);
                this.$().attr("title", sText);
            };

            // set hidden aggregation without rerendering
            this.setAggregation("_icon", oControl, true);            
        }
        
        oControl.detachPress(this._onIconPress, this);
        oControl.removeStyleClass("noflip");
        
        if (this.getType() !== AttachmentType.ERROR) {
            if (this.getURL() && this.getFileName()) {
                oControl.attachPress(this._onIconPress, this);
                oControl.addStyleClass("noflip");
                oControl.setTooltip(this._oRB.getText("WALL_ITEMATTACHMENT_STATUSMSG_DOWNLOAD"));
            }
            else {
                oControl.setTooltip(this._oRB.getText("WALL_ITEMATTACHMENT_STATUSMSG_EMPTY"));
            }
            oControl.removeStyleClass("sapInoWallWIAttError");
        }
        else {
            oControl.addStyleClass("sapInoWallWIAttError");
            oControl.setTooltip(this._oRB.getText("WALL_ITEMATTACHMENT_STATUSMSG_ERROR"));
            this.setTitle(this._oRB.getText("WALL_ITEMATTACHMENT_CAPTION_ERROR"));            
        }
                        
        oControl.setSrc(sIcon);
        return oControl;
    };
    
    /*
     * Shows/hides a busy indicator when uploading imaged without rerendering @override
     */
    sap.ino.wall.WallItemAttachment.prototype.setStatus = function(sStatus) {
        this.setProperty("status", sStatus, true);
        if (this._isRendered()) {
            var $Busy = sap.ui.getCore().byId(this.getId() + "-busy");
            var $Icon = jQuery("#" + this.getId() + "-iconWrapper>span");
            
            if (this.getStatus() === "Busy") {
                if ($Busy) { $Busy.removeStyleClass("sapInoWallInvisible"); }
                if ($Icon) { $Icon.addClass("sapInoWallInvisible"); }
            } else {
                if ($Busy) { $Busy.addStyleClass("sapInoWallInvisible"); }
                if ($Icon) { $Icon.removeClass("sapInoWallInvisible"); }
            }
        }
    };

    /**
     * creates a minimalic JSON representation of the item to be stored in the db
     * 
     * @param {string}
     *            sColor color identifier
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemAttachment.prototype.formatToJSON = function() {
        // call the base object's JSON method
        var oJSON = sap.ino.wall.WallItemBase.prototype.formatToJSON.call(this);
        // add properties of this control
        if (this.getURL()) {
            oJSON.content.URL = this.getURL();
            oJSON.content.assignmentId = this.getAssignmentId();
        }
        oJSON.content.type = this.getType() || AttachmentType.DEFAULT;
        oJSON.content.fileName = this.getFileName();
        // return the final object
        return oJSON;
    };

})();