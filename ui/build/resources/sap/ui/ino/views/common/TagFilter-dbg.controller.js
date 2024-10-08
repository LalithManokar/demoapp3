/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.models.object.Tag");

sap.ui.controller("sap.ui.ino.views.common.TagFilter", {
    sSelectedTagsModel : "selectedTags",

    onInit : function() {
        var oController = this;
        var fnRemoveTag = function(oEvent) {
            oController.removeTag(oEvent);
        };
        var oTagTemplate = sap.ui.ino.application.backoffice.ControlFactory.createTagTemplate(
                this.sSelectedTagsModel,
                "ID",
                "NAME",
                true,
                fnRemoveTag
        );

        var selectedTagsModel = new sap.ui.model.json.JSONModel([]);
        this.getView().setModel(selectedTagsModel, this.sSelectedTagsModel);
        var oRepeater = sap.ui.getCore().byId(this.getView().createId("tagrepeater"));
        oRepeater.bindRows(this.sSelectedTagsModel + ">/", oTagTemplate);
        
        var oClipboard = sap.ui.ino.models.core.ClipboardModel.sharedInstance();
        
        var fnClipboardTagsChanged = function() {
            oController.onClipboardTagsChanged.apply(oController, arguments);
        };
        oClipboard.attachEvent("objectAdded", fnClipboardTagsChanged);
        oClipboard.attachEvent("objectRemoved", fnClipboardTagsChanged);
    },
    
    addTag : function(bValidTag, iTagId, sTagText) {
        if(!bValidTag) {
       	    this.setMessage(sap.ui.core.MessageType.Error, "MSG_TAGFILTER_FLD_REQUIRED_OR_INVALID");
            return;
        }

        this.removeMessages();
        //do not store a duplicate
        var aSelectedTags = this.getSelectedTags();
        var result = jQuery.grep(aSelectedTags, function(e) { return e.ID === iTagId; });
        if(result.length === 0) {
            aSelectedTags.push({
            	ID: iTagId,
            	NAME: sTagText
            });
            this.getView().getModel(this.sSelectedTagsModel).setData(aSelectedTags);
            this.checkAdditionalClipboardTags();
            this.getView().fireEvent("change");
        }
    },

    addTagFromClipboard : function() {
        sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("expertfinder");

        var aAdditionalTags = this.getAdditionalClipboardTags();
        if(aAdditionalTags.length > 0) {
            var aSelectedTags = this.getSelectedTags();
            aSelectedTags = aSelectedTags.concat(aAdditionalTags);
            this.getView().getModel(this.sSelectedTagsModel).setData(aSelectedTags);
            this.getView().fireEvent("change");
        }

        var oAddClipboardTagsButton = sap.ui.getCore().byId(this.getView().createId("clipboardtagsbutton"));
        oAddClipboardTagsButton.setEnabled(false);
    },
    
    onClipboardTagsChanged : function(oClipboardEvent) {
        if(oClipboardEvent.getParameter("objectName") !== "sap.ui.ino.models.object.Tag") {
            return;
        }
        
        var oAddClipboardTagsButton = sap.ui.getCore().byId(this.getView().createId("clipboardtagsbutton"));
        if(oClipboardEvent.getId() === "objectRemoved" && oAddClipboardTagsButton && !oAddClipboardTagsButton.getEnabled()) {
            return;
        }
        this.checkAdditionalClipboardTags();
    },
    
    checkAdditionalClipboardTags : function() {
        var oAddClipboardTagsButton = sap.ui.getCore().byId(this.getView().createId("clipboardtagsbutton"));
        if(!oAddClipboardTagsButton) {
            return;
        }
        if(this.getAdditionalClipboardTags().length > 0) {
            oAddClipboardTagsButton.setEnabled(true);
        } else {
            oAddClipboardTagsButton.setEnabled(false);
        }
    },
    
    getAdditionalClipboardTags : function() {
        var aAdditionalTags = [];
        
        var that = this;
        var oClipboard = sap.ui.ino.models.core.ClipboardModel.sharedInstance();
        var aTagKeys = oClipboard.getObjectKeys(sap.ui.ino.models.object.Tag);

        var aSelectedTags = this.getSelectedTags();
        jQuery.each(aTagKeys, function(iTagKeyIndex, oTagKey){
            var oReadRequest = oClipboard.getObjectForKey(sap.ui.ino.models.object.Tag, oTagKey);
            oReadRequest.done(function(oTag) {
                if(oTag.USAGE_COUNT > 0){
                    var result = jQuery.grep(aSelectedTags, function(e) { return e.ID === oTag.ID; });
                    if(result.length === 0) {
                        aAdditionalTags.push({ID: oTag.ID, NAME: oTag.NAME});
                    }
                }else{
                    that.addMessage(sap.ui.core.MessageType.Info, "MSG_TAGFILTER_FLD_INVALID", oTag.NAME);
                }
            });
            oReadRequest.fail(function(oTag) {
                that.addMessage(sap.ui.core.MessageType.Error, "MSG_TAGFILTER_FLD_TAG_LOAD_FAILED", oTag.NAME);
            });
        });

        return aAdditionalTags;
    },

    removeTag : function(oEvent) {
        var oTag = oEvent.getSource().getBindingContext(this.sSelectedTagsModel).getObject();
        var aSelectedTags = this.getSelectedTags();                     
        aSelectedTags = jQuery.grep(aSelectedTags, function(e) {
            return e.ID !== oTag.ID;
        });
        this.getView().getModel(this.sSelectedTagsModel).setData(aSelectedTags);

        var oAddTagTextField = sap.ui.getCore().byId(this.getView().createId("tagtextfield"));

        jQuery(oAddTagTextField.getFocusDomRef()).blur();
        jQuery(oAddTagTextField.getFocusDomRef()).focus();
        jQuery(oAddTagTextField.getDomRef()).addClass("sapUiTfFoc");
        document.activeElement = oAddTagTextField.getFocusDomRef();

        this.checkAdditionalClipboardTags();
        this.getView().fireEvent("change");
    },

    getSelectedTagsFilter : function(){
        var aFilter = [];
        var aSelectedTags = this.getSelectedTags();
        jQuery.each(aSelectedTags, function(iIndex, oTag) {
            aFilter.push(new sap.ui.model.Filter("ID", "NE", oTag.ID));
        });
        if (aFilter.length > 0) {
            return new sap.ui.model.Filter(aFilter, true);
        }
        return undefined;
    },

    getSelectedTagIds : function(){
        var aTags = [];
        var aSelectedTags = this.getSelectedTags();
        jQuery.each(aSelectedTags, function(iIndex, oTag) {
            aTags.push(oTag.ID);
        });
        if (aTags.length > 0) {
            return aTags.join();
        }
        return "";
    },

    getSelectedTags : function() {
        return this.getView().getModel(this.sSelectedTagsModel).getData();
    },

    removeMessages : function() {
        sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("expertfinder");

        var oTextField = sap.ui.getCore().byId(this.getView().createId("tagtextfield"));
        if (oTextField) {
            oTextField.setValueState(sap.ui.core.ValueState.None);
        }
    },

    setMessage : function(oLevel, sMsgCode, aParameters) {
        sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("expertfinder");
        this.addMessage(oLevel, sMsgCode, aParameters);
    },

    addMessage : function(oLevel, sMsgCode, aParameters) {
        var oTextField = sap.ui.getCore().byId(this.getView().createId("tagtextfield"));
        var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
        var oMessageParameters = {
            key : sMsgCode,
            level : oLevel,
            parameters : aParameters ? aParameters : [],
            group : "expertfinder",
            text : oMsg.getResourceBundle().getText(sMsgCode, aParameters),
            referenceControl : oTextField
        };
        var oMessage = new sap.ui.ino.application.Message(oMessageParameters);

        sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(oMessage);
        oMessage.showValueState();
    }
});