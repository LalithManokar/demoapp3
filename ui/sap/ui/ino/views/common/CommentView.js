/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.views.common.CommentView");

jQuery.sap.require("sap.ui.ino.controls.Comment");
jQuery.sap.require("sap.ui.ino.models.types.RelativeDateTimeType");
jQuery.sap.require("sap.ui.ino.models.types.TooltipDateType");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");

(function() {
    // "use strict";

    sap.ui.ino.views.common.CommentView = {

        setHistoryState : function() {
            this.refreshComments();
        },

        createViewContent : function(oController) {
            if (!oController) {
                var oController = this.getController();
            }

            var oLayout = new sap.ui.commons.layout.MatrixLayout({
                columns : 2,
                width : "710px",
                widths : ["90%", "10%"],
            });

            oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
                height : "15px"
            }));

            var oPostTextRow = new sap.ui.commons.layout.MatrixLayoutRow();
            var oPostTextCell = new sap.ui.commons.layout.MatrixLayoutCell({
                colSpan : 2
            });
            
            var sPlaceholder;
            if(this.getPlaceholderText) {
                sPlaceholder = this.getPlaceholderText();
            }
            else {
                sPlaceholder = "{i18n>BO_IDEA_COMMENTS_FLD_ENTER_COMMENT}";
            }

            this.oPostTextView = new sap.ui.commons.TextArea({
                rows : 4,
                required : true,
                width : "100%",
                value : "{comment>/COMMENT}",
                maxLength : "{comment>/meta/nodes/Root/attributes/COMMENT/maxLength}",
                required : "{comment>/meta/nodes/Root/attributes/COMMENT/required}",
                placeholder : sPlaceholder
            });
            oPostTextCell.addContent(this.oPostTextView);
            oPostTextRow.addCell(oPostTextCell);

            oLayout.addRow(oPostTextRow);

            var oPostButtonRow = new sap.ui.commons.layout.MatrixLayoutRow();
            oPostButtonRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());

            var oPostButtonCell = new sap.ui.commons.layout.MatrixLayoutCell();

            var oPostButton = new sap.ui.commons.Button({
                text : "{i18n>BO_IDEA_COMMENTS_BUT_POST_COMMENT}",
                press : [oController.submitComment, oController],
                width : "100%",
            });

            oPostButtonCell.addContent(oPostButton);
            oPostButtonRow.addCell(oPostButtonCell);
            oLayout.addRow(oPostButtonRow);

            // Adding some spacing
            oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
                height : "25px",
            }));

            // Comment list
            var sNoDataText;
            if(this.getNoDataText) {
                sNoDataText = this.getNoDataText();
            }
            else {
                sNoDataText = "{i18n>BO_IDEA_COMMENTS_MSG_NO_COMMENTS}";
            }
            
            this.oCommentsRepeater = new sap.ui.commons.RowRepeater().addStyleClass("sapUiInoBackofficeItemStyle");
            this.oCommentsRepeater.setNoData(new sap.ui.commons.TextView({
                text : sNoDataText
            }));
            this.oCommentsRepeater.setDesign("Transparent");
            this.oCommentsRepeater.setNumberOfRows(5);
            this.oCommentsRepeater.setCurrentPage(1);
            
            var sConfirmTooltipText = this.getConfirmTooltipText ? this.getConfirmTooltipText(): undefined;
            var sDeleteTooltipText = this.getDeleteTooltipText ? this.getDeleteTooltipText(): undefined;
            var sEditTooltipText = this.getEditTooltipText ? this.getEditTooltipText(): undefined;
            var oCommentTemplate = this.oCommentTemplate = new sap.ui.ino.controls.Comment({
                commentId : "{ID}",
                text : "{COMMENT}",
                editAriaDescribedBy : this.createId("comment_label"),
                confirmTooltipText : sConfirmTooltipText,
                deleteTooltipText : sDeleteTooltipText,
                editTooltipText : sEditTooltipText,
                relativeCreationDate : { 
                    path : "CREATED_AT",
                    type : new sap.ui.ino.models.types.RelativeDateTimeType()
                },
                tooltipCreationDate : {
                    path : "CREATED_AT",
                    type : new sap.ui.ino.models.types.TooltipDateType()
                },
                relativeChangeDate : {
                    path : "CHANGED_AT",
                    type : new sap.ui.ino.models.types.RelativeDateTimeType()
                },
                tooltipChangeDate : {
                    path : "CHANGED_AT",
                    type : new sap.ui.ino.models.types.TooltipDateType()
                },
                author : "{CHANGED_BY_NAME}",
                showUpdate : {
                    path : "CAN_UPDATE",
                    type : new sap.ui.ino.models.types.IntBooleanType()
                },
                showDelete : {
                    path : "CAN_DELETE",
                    type : new sap.ui.ino.models.types.IntBooleanType()
                },
                editMaxLength : "{comment>/meta/nodes/Root/attributes/COMMENT/maxLength}",
                editRequired : "{comment>/meta/nodes/Root/attributes/COMMENT/required}"
            });

            oCommentTemplate.attachConfirmPressed(oController.updateComment, oController);
            oCommentTemplate.attachDeletePressed(oController.deleteComment, oController);

            var oCommentsRow = new sap.ui.commons.layout.MatrixLayoutRow();
            var oCommentsCell = new sap.ui.commons.layout.MatrixLayoutCell({
                colSpan : 2
            });
            oCommentsCell.addContent(this.oCommentsRepeater);
            oCommentsRow.addCell(oCommentsCell);
            oLayout.addRow(oCommentsRow);
            return oLayout;

        },

        refreshComments : function() {
            this.oCommentsRepeater.bindRows(this.getController().getCommentsBindingPath(), this.oCommentTemplate, new sap.ui.model.Sorter("CREATED_AT", true));
        }

    }
})();