/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/ino/commons/models/object/WallItem", 
    "sap/ino/commons/formatters/BaseFormatter",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/m/MessageToast",
    "sap/ino/vc/wall/util/Helper",
    "sap/ino/commons/models/object/Attachment",
    "sap/ino/commons/models/aof/PropertyModel"
], function(BaseController, WallItem, BaseFormatter, TopLevelPageFacet, MessageToast, Helper, Attachment, PropertyModel) {
    
    var oFormatter = jQuery.extend({}, BaseFormatter);
    oFormatter.mapText = function(sType){
        if(sType){
            return this.getText("WALL_REMOTE_LIST_MIT_" + sType.split(".")[3]);    
        }
    };
    oFormatter.wallUpdateEnabledFormatter = function() {
        return PropertyModel.getActionEnabledStaticFormatter("sap.ino.xs.object.wall.Wall", "update").apply(this, arguments);
    };

    return BaseController.extend("sap.ino.vc.wall.remote.WallRemoteItem", jQuery.extend({}, TopLevelPageFacet, {
        formatter: oFormatter,
        
        onInit: function() {
            BaseController.prototype.onInit.apply(this, arguments);
            Helper.initHelper(this.getOwnerComponent());
        },
        
        onRouteMatched: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var iWallItemId = parseInt(oArgs.id, 10);
            this.iWallId = oArgs.wallid;
            
            var oSettings = {
                continuousUse : false
            };

            if(!this.getObjectModel() || this.getObjectModel().getId() !== iWallItemId) {
                 var oWallItem;
                if(Helper.isOffline()) {
                    var oWallItemData = Helper.getCurrentItemData(iWallItemId);
                    if(oWallItemData) {
                        oWallItem =  new WallItem(oWallItemData, oSettings);
                        //Set ID again, because the object is cloned in the aof with a new ID. We do not want this here
                        oWallItem.setProperty("/ID", oWallItemData.ID);
                    }
                } else {
                    oWallItem = new WallItem(iWallItemId, oSettings);    
                }
                
                this.setObjectModel(oWallItem);
                
                this.bindDefaultODataModel(iWallItemId);
                var that = this;
                var oPromise = oWallItem.getDataInitializedPromise();
                oPromise.done(function () {
                    //that.save();
                    that.setDefaultTextValue(true);
                    that.onDataInitialized();
                });
                
                return oPromise;
            }
        },
        
        //Implemented by some subclasses
        onDataInitialized : function() {
            this.setDefaultTextValue(false);
        },
        
        getPropertyString : function(oContent) {
            var sPropertyString = "";
            if (oContent.CAPTION) {
                sPropertyString = "/CONTENT/CAPTION";
            } else if(oContent.TEXT) {
                sPropertyString = "/CONTENT/TEXT";
            } else if (oContent.NAME) {
           	   sPropertyString = "/CONTENT/NAME";
            } else {
                sPropertyString = "";
            }
            return sPropertyString;
        },
        
        setDefaultTextValue : function (bSetValue) {
            var oItem = this.getObjectModel();
            var oContent = oItem.getData().CONTENT;
            var sItemType = oItem.getData().WALL_ITEM_TYPE_CODE;
            var sPropertyString = this.getPropertyString(oContent);
            var oWallDefaultData = Helper.getWallItemTemplates();
            var sTextKey = oWallDefaultData[sItemType].defaultTextKey;
            if(bSetValue) {
                if(oItem.getProperty(sPropertyString) === "") {
                    oItem.setProperty(sPropertyString, this.getText(sTextKey));
                }
            } else {
                if(oItem.getProperty(sPropertyString) === this.getText(sTextKey)) {
                    oItem.setProperty(sPropertyString, "");
                }  
            }

        },
        
        hasPendingChanges : function() {
            return false;
        },
        
        onChange : function() {
            this.save();
        },
        
        onDelete : function() {
            if(Helper.isOffline()) {
                var oObject = this.getObjectModel();
                var bSucces = Helper.delete(oObject.getData().ID, oObject.getData().WALL_ID);
                if(bSucces) {
                    MessageToast.show(this.getText("WALL_REMOTE_DISCARD_SUCCESSFUL"));
                    this.onNavBack();
                } else {
                    MessageToast.show(this.getText("WALL_REMOTE_ITEM_DELETE_SUCCESSFUL"));
                }
            } else {
                var that = this;
                var oDeleteRequest = this.getObjectModel().del();
                oDeleteRequest.done(function() {
                    MessageToast.show(that.getText("WALL_REMOTE_ITEM_DELETE_SUCCESSFUL"));
                    that.onNavBack();
                });
                oDeleteRequest.fail(function() {
                     MessageToast.show(that.getText("WALL_REMOTE_ITEM_DELETE_FAIL"));
                });    
            }
            
        },
        
		setObjectProperty : function(sProperty, iValue, bSupressSave) {
		    this.getObjectModel().setProperty(sProperty, iValue);
		    if (!bSupressSave) {
		        this.save();
		    }
		},
		
		save : function(){
		    if(Helper.isOffline()) {
		        var iItemId = this.getObjectModel().getProperty("/ID");
	            this.getObjectModel().setProperty("/changed", true);
	            
	            var oWallItemOfflineData = Helper.getCurrentItemData(iItemId);
	            var oWallItemData = this.getObjectModel().getData();
	            //Combine the two objects. The objectModel which comes from the AOF with the Data from the wall item creation
	            jQuery.extend(oWallItemOfflineData, oWallItemData);
		        Helper.store(this.iWallId);
		        Helper.setOfflineChanges();

		    } else {
                var oPromise = this.getObjectModel().modify();
                var that = this;
                oPromise.done(function() {
                    //MessageToast.show(that.getText("WALL_REMOTE_ITEM_SAVE_SUCCESSFUL"));
                });
                oPromise.fail(function() {
                     MessageToast.show(that.getText("WALL_REMOTE_ITEM_SAVE_FAIL"));
                });
                
                return oPromise;
		    }
        },
		
		getObjectProperty : function(sProperty) {
            return this.getObjectModel().getProperty(sProperty);
        },
        
        //IMAGE ATTACHMENT PERSON
        onFileUploaderChange : function(oEvent) {
            var oFileUploader = oEvent.getSource();
            var aFile = oEvent.getParameter("files");
            oFileUploader.setBusy(true);
            Attachment.prepareFileUploader(oFileUploader, aFile);
        },
        
        //IMAGE PERSON
        setImage : function (iImageId) {
            if (!iImageId) {
                this.clearImage();
                return;
            }
            var oImagePreview = this.byId("imagePreview");
            oImagePreview.setSrc("/sap/ino/xs/rest/common/attachment_download.xsjs/" + iImageId);
            oImagePreview.setVisible(true);
            return oImagePreview.getSrc();
        },
        
        clearImage : function() {
            var oImagePreview = this.byId("imagePreview");
            oImagePreview.setSrc("#");
            oImagePreview.setVisible(false);
            return oImagePreview.getSrc();
        },
        
        //Image Person
        onImageUploaderComplete : function(oEvent) {
            var oResponse = Attachment.parseUploadResponse(oEvent.getParameter("responseRaw"));
            var oFileUploader = oEvent.getSource();
            var that = this;
            if (oResponse) {
                var oObject = this.getObjectModel();
                oObject.getMessageParser().parse(oResponse);
                if (oResponse.success) {
                    var iImageId = oResponse.attachmentId;
                    var oImg = new Image();
                    oImg.src = this.setImage(iImageId);
                    oImg.onload = function() {
                        var fRatio = (oImg.naturalHeight || oImg.height) / (oImg.naturalWidth || oImg.width);
                        that.setObjectProperty("/WIDTH", 200, true);
                        that.setObjectProperty("/HEIGHT", 200 * fRatio, true);
                        oObject.setProperty("/Image", [{
                            ID: oObject.getProperty("/Image/0/ID") || undefined,
                            ATTACHMENT_ID : iImageId
                        }]);
                        that.save();
                    };
                } else {
                    MessageToast.show(this.getText("WALL_REMOTE_IMAGE_UPLOAD_FAILED"));
                }
            } else {
                MessageToast.show(this.getText("WALL_REMOTE_IMAGE_UPLOAD_ERROR"));
            }
            oFileUploader.setBusy(false);
            oFileUploader.clear();
        },
        
        //Image Person
        initImage : function () {
            var iImageId = this.getObjectProperty("/Image/0/ATTACHMENT_ID");
            this.setImage(iImageId);
        },
        
        //Arrow Line
        onTogglePressed : function(oEvent) {
            var oSource = oEvent.getSource();
            var sKey = oSource.getCustomData()[0].getKey();
            var sValue = oSource.getCustomData()[0].getValue();
            if(sKey === "THICKNESS") {
                sValue = parseInt(sValue, 10);
            }
            var sPath = "/CONTENT/" + sKey;
            this.setObjectProperty(sPath, sValue);
            this.setLines(sValue.toString(), oSource);
        },
        
        //Arrow Line
        setLines : function(sValue, oButton) {
            oButton.getParent().getItems().forEach(function (oControl) {
                if (oControl instanceof sap.m.ToggleButton) {
                    oControl.setPressed(oControl.getCustomData()[0].getValue() === sValue);
                }
            });
        },
        
        //Arrow Line
        setInitLines : function (aProperties) {
            this.byId("wallRemoteItemForm").getContent().forEach(function (oControl) {
               if (oControl instanceof sap.m.HBox) {
                   oControl.getItems().forEach(function(oButton) {
                        if (oButton instanceof sap.m.ToggleButton) {
                            oButton.setPressed(aProperties.indexOf(oButton.getCustomData()[0].getValue()) > -1);
                        }
                   });
               }
            });
        } 
    }));
});