/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.Comment");
(function() {
    "use strict";

    jQuery.sap.require("sap.ui.commons.TextArea");

    /**
     * Visual representation of a comment
     * <ul>
     * <li>Properties
     * <ul>
     * <li>text: comment text</li>
     * <li>author: author of the comment</li>
     * <li>timestamp. point in time when comment has been made</li>
     * </ul>
     * </li>
     * </ul>
     */

    sap.ui.core.Control.extend("sap.ui.ino.controls.Comment", {
        metadata : {
            properties : {
                "commentId" : {
                    type : "int",
                    defaultValue : 0
                },
                "text" : "string",
                "author" : "string",
                "relativeCreationDate" : "string",
                "relativeChangeDate" : "string",
                "tooltipCreationDate" : "string",
                "tooltipChangeDate" : "string",
                "showDelete" : "boolean",
                "showUpdate" : "boolean",
                "editMaxLength" : {
                    type : "int",
                    defaultValue : 0
                },
                "editRequired" : "boolean",
                "editAriaDescribedBy" : "string",
                "confirmTooltipText" : "string",
                "deleteTooltipText" : "string",
                "editTooltipText" : "string",
            },
            aggregations : {
                "authorLink" : {
                    type : "sap.ui.commons.Link",
                    multiple : false
                },
                "_textView" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    visibility : "hidden"
                },
                "_textArea" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    visibility : "hidden"
                },
                "_confirmLink" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    visibility : "hidden"
                },
                "_cancelLink" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    visibility : "hidden"
                },
                "_deleteLink" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    visibility : "hidden"
                },
                "_updateLink" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    visibility : "hidden"
                }
            },
            events : {
                "deletePressed" : {},
                "updatePressed" : {},
                "confirmPressed" : {},
                "cancelPressed" : {}
            }
        },

        getTextArea : function() {
            var oTextArea = this.getAggregation("_textArea");
            if (!oTextArea) {
                oTextArea = new sap.ui.commons.TextArea({
                    rows : 4,
                    width : "100%",
                    ariaDescribedBy : this.getEditAriaDescribedBy()
                });
                this.setAggregation("_textArea", oTextArea, true);
            }
            return oTextArea;
        },

        getTextView : function() {
            var oTextView = this.getAggregation("_textView");
            if (!oTextView) {
                oTextView = new sap.ui.commons.TextView();
                this.setAggregation("_textView", oTextView, true);
            }
            return oTextView;
        },

        getConfirmLink : function() {
            var oConfirmLink = this.getAggregation("_confirmLink");
            if (!oConfirmLink) {
                var sConfirmTooltipText = !this.getConfirmTooltipText() ?  "{i18n>CTRL_COMMENT_EXP_CONFIRM}" : this.getConfirmTooltipText();
                oConfirmLink = new sap.ui.commons.Link({
                    text : "{i18n>CTRL_COMMENT_LNK_CONFIRM}",
                    tooltip : sConfirmTooltipText,
                    press : [function() {
                        this.getParent().oFocus = {
                            commentId : this.getCommentId(),
                            object : "edit"
                        };
                        this.fireConfirmPressed({
                            commentId : this.getCommentId(),
                            comment : this.getTextArea().getValue()
                        });
                    }, this]
                });
                this.setAggregation("_confirmLink", oConfirmLink, true);
            }
            return oConfirmLink;
        },

        getCancelLink : function() {
            var oCancelLink = this.getAggregation("_cancelLink");
            if (!oCancelLink) {
                oCancelLink = new sap.ui.commons.Link({
                    text : "{i18n>CTRL_COMMENT_LNK_CANCEL}",
                    tooltip : "{i18n>CTRL_COMMENT_EXP_CANCEL}",
                    press : [function() {
                        this._bEdit = false;
                        this.getParent().oFocus = {
                            commentId : this.getCommentId(),
                            object : "edit"
                        };
                        this.rerender();
                        this.fireCancelPressed({
                            commentId : this.getCommentId()
                        });
                    }, this]
                });
                this.setAggregation("_cancelLink", oCancelLink, true);
            }
            return oCancelLink;
        },

        getUpdateLink : function() {
            var oUpdateLink = this.getAggregation("_updateLink");
            if (!oUpdateLink) {
                var sEditTooltipText = !this.getEditTooltipText() ?  "{i18n>CTRL_COMMENT_EXP_UPDATE}" : this.getEditTooltipText();
                oUpdateLink = new sap.ui.commons.Link({
                    text : "{i18n>CTRL_COMMENT_LNK_UPDATE}",
                    tooltip : sEditTooltipText,
                    press : [function() {
                        this._bEdit = true;
                        this.getParent().oFocus = {
                            commentId : this.getCommentId(),
                            object : "field"
                        };
                        this.rerender();
                        this.fireUpdatePressed({
                            commentId : this.getCommentId()
                        });
                    }, this]
                });
                this.setAggregation("_updateLink", oUpdateLink, true);
            }
            return oUpdateLink;
        },

        getDateField : function() {
            var sCreationDate = this.getRelativeCreationDate();
            var sChangeDate = this.getRelativeChangeDate();
            var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
            var sChangedLabel = i18n.getText("CTRL_COMMENT_EXP_CHANGED_AT");
            var sText = "";
            var sTooltip = "";
            
            if (sCreationDate) {
                sText = sCreationDate;
                sTooltip = this.getTooltipCreationDate();
                if(sCreationDate != sChangeDate){
                    sText = sCreationDate + " (" + sChangedLabel + " " + sChangeDate + ")";
                    sTooltip = this.getTooltipCreationDate() + "/" + this.getTooltipChangeDate();
                }
            }
            
            var dateLabel = new sap.ui.commons.TextView({
                text : sText,
                tooltip : sTooltip
            }).addStyleClass("sapUiInoCommentTimestamp");
            return dateLabel;
        },

        getDeleteLink : function() {
            var oDeleteLink = this.getAggregation("_deleteLink");
            if (!oDeleteLink) {
                var sDeleteTooltipText = !this.getDeleteTooltipText() ?  "{i18n>CTRL_COMMENT_EXP_DELETE}" : this.getDeleteTooltipText();
                oDeleteLink = new sap.ui.commons.Link({
                    text : "{i18n>CTRL_COMMENT_LNK_DELETE}",
                    tooltip : sDeleteTooltipText,
                    press : [function() {
                        this.fireDeletePressed({
                            commentId : this.getCommentId()
                        });
                    }, this]
                });
                this.setAggregation("_deleteLink", oDeleteLink, true);
            }
            return oDeleteLink;
        },

        setText : function(sText) {
            this.getTextArea().setValue(sText);
            this.getTextView().setText(sText);
        },

        setEditMaxLength : function(iMaxLength) {
            this.getTextArea().setMaxLength(iMaxLength);
        },

        setEditRequired : function(bRequired) {
            this.getTextArea().setRequired(bRequired);
        },

        onAfterRendering : function() {
            var oControl = this;
            if (oControl.getParent() 
                    && oControl.getParent().oFocus
                    && oControl.getParent().oFocus.commentId == this.getCommentId()) {
                setTimeout(function() {
                    switch (oControl.getParent().oFocus.object) {
                        case "field" :
                            oControl.getTextArea().focus();
                            break;
                        case "edit" :
                            oControl.getUpdateLink().focus();
                            break;
                        default:
                            break;
                    }
                }, 200);
            }
        },

        renderer : function(oRm, oControl) {
            var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
            var sText = oControl.getAuthor() ? "CTRL_COMMENT_ARIA_LABEL" : "CTRL_COMMENT_ARIA_LABEL_NO_AUTHOR";
                
            oRm.write("<div role=\group\"");
            oRm.writeAttributeEscaped("aria-label", i18n.getText(sText, [oControl.getAuthor()]));
            oRm.writeControlData(oControl);
            oRm.addClass("sapUiInoComment");
            oRm.writeClasses();
            oRm.write(">");

            if (oControl.getAuthorLink()) {
                oRm.write("<span");
                oRm.addClass("sapUiInoCommentAuthor");
                oRm.writeClasses();
                oRm.write(">");
                oRm.renderControl(oControl.getAuthorLink());
                oRm.write("</span>");
            } else if (oControl.getAuthor()) {
                oRm.write("<span");
                oRm.addClass("sapUiInoCommentAuthor");
                oRm.writeClasses();
                oRm.write(">");
                oRm.writeEscaped(oControl.getAuthor());
                oRm.write("</span>"); // author
            }

            if (oControl.getRelativeCreationDate()) {
                oRm.renderControl(oControl.getDateField());
            }

            oRm.write("<div");
            oRm.addClass("sapUiInoCommentText");
            oRm.writeClasses();
            oRm.write(">");
            if (!oControl._bEdit) {
                oRm.renderControl(oControl.getTextView());
            }
            oRm.write("</div>");

            oRm.write("<div");
            oRm.addClass("sapUiInoCommentEdit");
            oRm.writeClasses();
            oRm.write(">");
            if (oControl._bEdit) {
                oRm.renderControl(oControl.getTextArea());
            }
            oRm.write("</div>");

            if (oControl._bEdit) {
                oRm.write("<div role=\"toolbar\"");
                oRm.addClass("sapUiInoCommentMaintain");
                oRm.writeClasses();
                oRm.write(">");

                oRm.write("<div");
                oRm.addClass("sapUiInoCommentConfirm");
                oRm.writeClasses();
                oRm.write(">");
                oRm.renderControl(oControl.getConfirmLink());
                oRm.write("</div>");

                oRm.write("<div");
                oRm.addClass("sapUiInoCommentCancel");
                oRm.writeClasses();
                oRm.write(">");
                oRm.renderControl(oControl.getCancelLink());
                oRm.write("</div>");
                oRm.write("</div>"); // maintain
            }

            if (!oControl._bEdit && (oControl.getShowDelete() || oControl.getShowUpdate())) {
                oRm.write("<div role=\"toolbar\"");
                oRm.addClass("sapUiInoCommentMaintain");
                oRm.writeClasses();
                oRm.write(">");

                if (oControl.getShowUpdate()) {
                    oRm.write("<div");
                    oRm.addClass("sapUiInoCommentUpdate");
                    oRm.writeClasses();
                    oRm.write(">");
                    oRm.renderControl(oControl.getUpdateLink());

                    oRm.write("</div>");
                }
                if (oControl.getShowDelete()) {
                    oRm.write("<div");
                    oRm.addClass("sapUiInoCommentDelete");
                    oRm.writeClasses();
                    oRm.write(">");
                    oRm.renderControl(oControl.getDeleteLink());
                    oRm.write("</div>");
                }
                oRm.write("</div>"); // maintain
            }
            oRm.write("</div>"); // comment
        }
    });
})();