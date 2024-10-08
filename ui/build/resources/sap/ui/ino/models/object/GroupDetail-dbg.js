/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.object.GroupDetail");
(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
    
    var sourceSetting = {
        excludeNodes: ['Members']
    };
    
    
    
    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.GroupDetail", {
        objectName : "sap.ino.xs.object.iam.Group",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("Identity", sourceSetting),
        invalidation : {
            entitySets : ["Identity", "SearchIdentity"]
        },
        determinations : {
            onCreate : function(oDefaultData, objectInstance) {
                if(oDefaultData.GroupAttribute.length === 0){
                    oDefaultData.GroupAttribute.push({"ID":-2,"GROUP_ID":oDefaultData.ID,"IS_PUBLIC":0});   
                }
                return {
                    "ID" : -1,
                    "NAME" : "",
                    "SOURCE_TYPE_CODE" : "USER"
                };
            }, 
            onRead : function(oDefaultData, objectInstance){
                if(oDefaultData.GroupAttribute.length === 0){
                    oDefaultData.GroupAttribute.push({"ID":-2,"GROUP_ID":oDefaultData.ID,"IS_PUBLIC":0});   
                }                
            }
        },
		setGroupImage: function(oData) {
			this._setImage(oData, "IDENTITY_IMAGE", "/IMAGE_ASSIGN_ID", "/IMAGE_ID");
		},
		_setImage: function(oData, sRoleTypeCode, sAssignmentIdPropertyName, sAttachmentIdPropertyName) {
			var sPropertyName = "/Attachments";
			oData.ROLE_TYPE_CODE = sRoleTypeCode;
			var aChildrenData = this.getProperty(sPropertyName);
			aChildrenData = aChildrenData ? aChildrenData : [];
			var iAssignmentId = 0;
			var iAttachmentId = 0;
			jQuery.each(aChildrenData, function(oKey, sChildData) {
				if (sChildData.ATTACHMENT_ID === oData.ATTACHMENT_ID) {
					iAssignmentId = sChildData.ID;
					jQuery.each(aChildrenData, function(oKey, sChildData) {
						if (sChildData.ROLE_TYPE_CODE === sRoleTypeCode) {
							sChildData.ROLE_TYPE_CODE = "ATTACHMENT";
							iAttachmentId = sChildData.ATTACHMENT_ID;
						}
					});
					sChildData.ROLE_TYPE_CODE = oData.ROLE_TYPE_CODE;
					return false;
				}
				return true;
			});

			if (iAssignmentId === 0) {
				iAssignmentId = this.getNextHandle();
				oData.ID = iAssignmentId;
				jQuery.each(aChildrenData, function(oKey, sChildData) {
					if (sChildData.ROLE_TYPE_CODE === sRoleTypeCode) {
						sChildData.ROLE_TYPE_CODE = "ATTACHMENT";
						iAttachmentId = sChildData.ATTACHMENT_ID;
					}
				});
				aChildrenData.push(oData);
			}
			if (iAttachmentId !== 0) {
				aChildrenData = jQuery.grep(aChildrenData, function(oChild, iIndex) {
					if (oChild.ATTACHMENT_ID !== iAttachmentId) {
						return true;
					}

					return false;
				});
			}
			this.setProperty(sAssignmentIdPropertyName, iAssignmentId);
			this.setProperty(sAttachmentIdPropertyName, oData.ATTACHMENT_ID);
			this.setProperty(sPropertyName, aChildrenData);
		},
		clearGroupImage: function(assignmentId) {
			this._clearImage(assignmentId, "/IMAGE_ASSIGN_ID", "/IMAGE_ID");
		},
		_clearImage: function(assignmentId, sAssignmentIdPropertyName, sAttachmentIdPropertyName) {
			this.setProperty(sAssignmentIdPropertyName, null);
			this.setProperty(sAttachmentIdPropertyName, null);
			var sPropertyName = "/Attachments";
			var aChildrenData = this.getProperty(sPropertyName);
			aChildrenData = jQuery.grep(aChildrenData, function(oChild, iIndex) {
				if (oChild.ID !== assignmentId) {
					return true;
				}
				return false;
			});
			this.setProperty(sPropertyName, aChildrenData);
		}		
    });
})();