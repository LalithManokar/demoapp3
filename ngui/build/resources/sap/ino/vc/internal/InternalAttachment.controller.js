sap.ui.define(["sap/ino/vc/commons/BaseBlockController","sap/ino/vc/attachment/AttachmentMixin","sap/ui/model/json/JSONModel","sap/ino/commons/models/object/Attachment","sap/ino/commons/application/Configuration","sap/m/MessageToast"],function(B,A,J,a,C,M){"use strict";var b=a.getEndpointURL();return B.extend("sap.ino.vc.internal.InternalAttachment",jQuery.extend({},A,{onInit:function(){B.prototype.onInit.apply(this,arguments);if(!this.getModel("local")){this.setModel(new J({ATTACHMENT_UPLOAD_URL:b}),"local");}},onAfterRendering:function(){this._attachmentMixinInit({attachmentId:"InternalAttachments",updateObject:function(o){o.update();},uploadSuccess:function(o,r){o.addInternalAttachment({"CREATED_BY_NAME":C.getCurrentUser().NAME,"ATTACHMENT_ID":r.attachmentId,"FILE_NAME":r.fileName,"MEDIA_TYPE":r.mediaType,"CREATED_AT":new Date()});o.update().fail(function(){o.getMessageParser().parse(r);M.show(this.getText("OBJECT_MSG_ATTACHMENT_FAILED"));return true;});}});}}));});
