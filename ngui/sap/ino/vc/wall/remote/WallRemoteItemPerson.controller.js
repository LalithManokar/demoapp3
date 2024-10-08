/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/vc/wall/remote/WallRemoteItemController",
    "sap/ino/commons/models/object/WallItem", 
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/commons/models/object/Attachment"
], function(WallRemoteItemController, WallItem, TopLevelPageFacet, Attachment) {
    
    return WallRemoteItemController.extend("sap.ino.vc.wall.remote.WallRemoteItemPerson", jQuery.extend({}, TopLevelPageFacet, {
        routes: ["wallremoteitem-person"],
        onInit: function() {
            WallRemoteItemController.prototype.onInit.apply(this, arguments);
            this.setViewProperty("/ATTACHMENT_UPLOAD_URL", Attachment.getEndpointURL());
        },
        onDataInitialized : function() {
            WallRemoteItemController.prototype.onDataInitialized.apply(this, arguments);
            this.initImage();
            this.iOriginId = this.getObjectModel().getData().CONTENT.ORIGIN_ID;
        },
        
        onSuggest: function (oEvent) {
            var sValue = oEvent.getParameter("suggestValue");
            // Encoding needed for IE!
            var oListItemTemplate = new sap.ui.core.ListItem({
                text : "{data>NAME}",
                additionalText : "{data>USER_NAME}",
                key : "{data>ID}"
            });
            oEvent.getSource().bindAggregation("suggestionItems", {
                path : "data>/SearchIdentity(searchToken='" + jQuery.sap.encodeURL(sValue) + "')/Results",
                template : oListItemTemplate,
                parameters : {
                    select : "searchToken,ID,NAME,USER_NAME,EMAIL,IMAGE_ID,PHONE,MOBILE"
                }
            });
        },
        
        onSuggestionItemSelected : function(oEvent) {
            var oDataObject = oEvent.getParameter("selectedItem").getBindingContext("data").getObject();

            if(oDataObject.ID && this.iOriginId !== oDataObject.ID) {
           	    var sPhone = oDataObject.PHONE ? oDataObject.PHONE : oDataObject.MOBILE;
            	this.byId("email").setValue(oDataObject.EMAIL);
            	this.byId("phone").setValue(sPhone);
            	var iImage = oDataObject.IMAGE_ID;
            	var oImage = this.getObjectModel().getData().Image;
            	if(!oImage && iImage) {
            	    this.setImage(iImage);    
                	var oObject = this.getObjectModel();
                	oObject.setProperty("/Image", [{
                        ID: oObject.getProperty("/Image/0/ID") || undefined,
                        ATTACHMENT_ID : iImage
                    }]);
            	}
            }
        },
        
        onClear : function() {
            this.byId("imagePreview").setSrc("#");
            var oObject = this.getObjectModel();
            oObject.setProperty("/Image", []);
            this.save();
        }
    }));
});