/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.model.json.JSONModel");

sap.ui.controller("sap.ui.ino.views.backoffice.config.VoteTypeModifyDefinitionFacet", jQuery.extend({},
	sap.ui.ino.views.common.FacetAOController, {
		onTypeCodeChange: function(oEvent) {
			var oContent = this.getView().oDetail;
			var oRowMaxStar = this.getView().oRowMaxStar;
			var oRowVotedByGroup = this.getView().oRowVotedByGroup;
			if (oEvent.mParameters && oEvent.mParameters.selectedItem &&
				oEvent.mParameters.selectedItem.getProperty("key") === "STAR") {
				oContent.insertRow(oRowMaxStar, 1);
			} else {
				oContent.removeRow(oRowMaxStar);
				this.getModel().setProperty("/MAX_STAR_NO", 0);
			}

			if (oEvent.mParameters && oEvent.mParameters.selectedItem &&
				oEvent.mParameters.selectedItem.getProperty("key") === "LIKE") {
				var sCommentType = this.getModel().getProperty("/VOTE_COMMENT_TYPE");
				var iIdenx = 4;
				if (sCommentType === "LIST") {
					iIdenx = 5;
				}
				oContent.insertRow(oRowVotedByGroup, iIdenx);
			} else {
				oContent.removeRow(oRowVotedByGroup);
				this.getModel().setProperty("/VOTED_BY_GROUP", "");

			}
		},

		onCommentTypeChange: function(oEvent) {
			var oContent = this.getView().oDetail;
			var sVoteType = this.getModel().getProperty("/TYPE_CODE");
			var oRowReasonCode = this.getView().oRowReasonCode;
			var iIndex = 4;
			if (sVoteType === "STAR") {
				iIndex = 5;
			}
			if (oEvent.mParameters && oEvent.mParameters.selectedItem &&
				oEvent.mParameters.selectedItem.getProperty("key") === "LIST") {
				oContent.insertRow(oRowReasonCode, iIndex);
			} else {
				oContent.removeRow(oRowReasonCode);
				this.getModel().setProperty("/VOTE_REASON_CODE", "");
			}
		}
	}));