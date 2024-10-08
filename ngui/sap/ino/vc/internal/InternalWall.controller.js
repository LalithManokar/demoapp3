/*!
 * @copyright@
 */
sap.ui.getCore().loadLibrary("sap.ino.wall");

sap.ui.define([
    "sap/ino/vc/commons/BaseVariantListController",
    "sap/ui/Device",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/vc/wall/WallMixin",
    "sap/ino/vc/attachment/AttachmentMixin",
    "sap/ui/model/json/JSONModel", 
    "sap/ino/commons/models/object/Attachment",
    "sap/ino/commons/application/Configuration",
     "sap/m/MessageToast"
], function(BaseController,
    Device,
    ObjectListFormatter,
    WallMixin,
    AttachmentMixin,
    JSONModel,
    Attachment,
    Configuration,
    MessageToast) {
        "use strict";
        
        var mVariant = {
            MY: "my",
            SHARED: "shared"
        };

        var mFilter = {
            NONE: "myWalls",
            MY: "myWalls",
            SHARED: "sharedWalls"
        };
        
        var attachmentUploadUrl = Attachment.getEndpointURL();
        
        return BaseController.extend("sap.ino.vc.internal.InternalWall", jQuery.extend({}, WallMixin, {
             /* Controller reacts when these routes match */
            routes: [],
            list: {
                "Variants": {},
                "Picker": {
                    "Variants": {
                        "Values": [{
                            "TEXT": "WALL_LIST_MIT_MY",
                            "ACTION": mVariant.MY,
                            "FILTER": mFilter.MY
                        }, {
                            "TEXT": "WALL_LIST_MIT_SHARED",
                            "ACTION": mVariant.SHARED,
                            "FILTER": mFilter.SHARED
                        }]
                    }
                }
            },

            /* ViewModel storing the current configuration of the list */
            view: {
                "Picker": {
                    "VARIANT": undefined // mVariant.MY will be initialized in onWallAdd
                },
                "EDITABLE": undefined
            },

            formatter: ObjectListFormatter,
            
            objectListFormatter: ObjectListFormatter,

            onInit: function() {
                var that = this;
                this._wallMixinInit({
                    wallId: "interalwalllistinidea",
                    wallBindPath: "object>/InternalWalls",
                    wallAddAction: function (oObject, oWallData){
                        oObject.addInternalWall(oWallData);
                    },
                    wallRemoveAction:function(oObject, oWallControl){
                        oObject.removeInternalWall(oWallControl.getStorageId());
                        oObject.update();
                    },
                    wallData: function(oObject){
                        return oObject.getProperty("/InternalWalls");
                    }
                });
                this.getList().addStyleClass("sapInoWallListPreviewItems");

                BaseController.prototype.onInit.apply(this, arguments);
                
                if (!this.getModel("local")) {
                this.setModel(new JSONModel({
                        ATTACHMENT_UPLOAD_URL : attachmentUploadUrl
                    }), "local");
                }
            },

            onBeforeRendering: function() {
                this.view.EDITABLE = true;
                var oViewModel = this.getModel("view");
                oViewModel.setData(this.view, true);
                this._bindList();
                var oBinding = this.getList().getBinding("items");
                if (oBinding) {
                    this._updateWallPreviewControls();
                }
            },
            
            
            onAfterRendering : function() {
            this._attachmentMixinInit({
                    attachmentId: "InternalAttachments",
                    updateObject: function(oObject){
                        oObject.update();
                    },
                    uploadSuccess: function(oObject, oResponse){
                        oObject.addInternalAttachment({
                            "CREATED_BY_NAME" : Configuration.getCurrentUser().NAME,
                            "ATTACHMENT_ID" : oResponse.attachmentId,
                            "FILE_NAME" : oResponse.fileName,
                            "MEDIA_TYPE" : oResponse.mediaType,
                            "CREATED_AT" : new Date()
                        });
                        oObject.update().fail(function(){
                            oObject.getMessageParser().parse(oResponse);
                            MessageToast.show(this.getText("OBJECT_MSG_ATTACHMENT_FAILED"));
                            return true;
                        });
                    }
                });
                
            },
            
            
            
            
            
            
            
            
            getVariantsPopover : function() {
                if (!this._getWallPickerDialog().isActive()) {
                    return BaseController.prototype.getVariantsPopover.apply(this, arguments);
                } else {
                    if (!this._oPickerVariantPopover) {
                        this._oPickerVariantPopover = sap.ui.xmlfragment("sap.ino.vc.wall.fragments.PickerListVariants", this);
                        // if (Device.system.phone) {
                        //     this._oPickerVariantPopover = sap.ui.xmlfragment("sap.ino.vc.wall.fragments.PickerListVariantsDialog", this);
                        // } else {
                        //     this._oPickerVariantPopover = sap.ui.xmlfragment("sap.ino.vc.wall.fragments.PickerListVariants", this);
                        // }
                        this.getView().addDependent(this._oPickerVariantPopover);
                    }
                    return this._oPickerVariantPopover;
                }
            },

            getVariant : function(sAction) {
                if (!this._getWallPickerDialog().isActive()) {
                   return BaseController.prototype.getVariant.apply(this, arguments);
                } else {
                   return this._getListDefinitionEntry(sAction, "ACTION", "/Picker/Variants/Values");
                }
            },
            
            onVariantPress: function(sVariantAction, oEvent) {
                this.setViewProperty("/Picker/VARIANT", sVariantAction);
                var oWallPickerView = this._getWallPickerView();
                if (oWallPickerView) {
                    oWallPickerView.getController().setViewProperty("/List/VARIANT", sVariantAction);
                    oWallPickerView.invalidate();
                }
            },
            
            _onVariantPress : function(oEvent) {
                var oItem = oEvent.getSource();
        	    var oContext = oItem.getBindingContext("list");
        	    var sAction;
        	    var oObject;
        	    
        	    if (oContext) {
        	        oObject = oContext.getObject();    
        	        sAction = oObject ? oObject.ACTION : undefined;
        	    }
        	    
        	    this.onVariantPress(sAction, oEvent);
        	    
        	    var oPopover = this.getVariantsPopover();
        	    if (typeof oPopover.close === "function") {
                    oPopover.close();
                }
            },
            
            onWallPicked : function(oWallData) {
                this._bindList();
                var oBinding = this.getList().getBinding("items");
                var oIdea = this.getModel("object");
                if (oBinding) {
                    var that = this;
                    oIdea.update().done(
                        function(){
                            that._updateWallPreviewControls();
                        });
                }
            }        
            
        }));
});