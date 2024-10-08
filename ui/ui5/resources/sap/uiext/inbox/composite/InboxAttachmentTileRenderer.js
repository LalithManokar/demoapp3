/*!
 * SAPUI5

(c) Copyright 2009-2019 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.uiext.inbox.composite.InboxAttachmentTileRenderer");sap.uiext.inbox.composite.InboxAttachmentTileRenderer={};
sap.uiext.inbox.composite.InboxAttachmentTileRenderer.render=function(r,c){r.write("<span");r.writeControlData(c);r.addClass("sapUiExtInboxAttachmentTileLayout");r.writeClasses();r.write(">");r.write("<span>");var C=[];var a={};a["id"]=c.getId()+"-fileTypeIcon";C.push("sapUiExtInboxAttachmentIcon");r.writeIcon(c.getFileTypeIcon(),C,a);r.write("</span>");r.write("<span");r.addClass("sapUiExtInboxAttachmentDetails");r.writeClasses();r.write(">");r.write("<div");r.addClass("sapUiExtInboxInlineFlexRow");r.writeClasses();r.write(">");r.write("<span");r.addClass("sapUiExtInboxAttachmentTitle");r.writeClasses();r.write(">");r.write("<span");r.addClass("sapUiExtInboxAttachmentInline");r.writeClasses();r.write(">");r.write('<a');r.addClass("sapUiExtInboxAttachmentFileLink");r.writeClasses();r.writeAttribute('id',c.getId()+"_downloadLink");r.writeAttributeEscaped('title',c._oBundle.getText("INBOX_ATTACHMENT_DOWNLOAD_TOOLTIP",[c.getFileName()]));r.writeAttributeEscaped('href',c.getDownloadUrl());r.writeAttribute('rel','noopener noreferrer');r.write('>');r.writeEscaped(c.getFileName());r.write('</a> ');r.write("</span>");r.write("<span");r.addClass("sapUiExtInboxAttachmentFileSize");r.writeClasses();r.writeAttributeEscaped('title',c.getFileSize());r.write(">");r.writeEscaped(c.getFileSize());r.write("</span>");r.write("</div>");r.write("<div");r.addClass("sapUiExtInboxInlineFlexRow");r.writeClasses();r.write(">");r.write("<span");r.addClass("sapUiExtInboxAttachmentCreatedBy");r.writeClasses();r.writeAttributeEscaped('title',c._oBundle.getText("INBOX_ATTACHMENT_CREATED_BY_TOOLTIP",[c.getCreatedBy()]));r.write(">");r.writeEscaped(c.getCreatedBy());r.write("</span>");r.write("<span");r.addClass("sapUiExtInboxAttachmentDate");r.writeClasses();r.writeAttributeEscaped('title',c._oBundle.getText("INBOX_ATTACHMENT_CREATION_DATE_TOOLTIP",[c.getCreationDate()]));r.write(">");r.writeEscaped(c.getCreationDate());r.write("</span>");if(c.getShowDeleteButton())this.renderDeleteButton(r,c);r.write("</div>");r.write("</span>");r.write("</span>");};
sap.uiext.inbox.composite.InboxAttachmentTileRenderer.renderDeleteButton=function(r,c){r.write("<span");r.addClass("sapUiExtInboxAttachmentDeleteBtn");r.writeClasses();r.write(">");var d=new sap.ui.commons.Button({tooltip:c._oBundle.getText("INBOX_ATTACHMENT_DELETE_TOOLTIP"),icon:sap.ui.core.IconPool.getIconURI("delete"),lite:true}).attachPress(function(e){c.fireDeleteAttachment();});r.renderControl(d);r.write("</span>");};
