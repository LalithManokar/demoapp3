/*!
 * @copyright@
 */
var oCommentType = {
	LIST: "BO_VOTE_TYPE_COMMENT_LIST",
	TEXT: "BO_VOTE_TYPE_COMMENT_TEXT"
};

sap.ui.controller("sap.ui.ino.views.backoffice.config.VoteTypeListDetails", {
	formatVoteCommentType: function(sCommentType) {
		if (sCommentType) {
			return sap.ui.getCore().getModel("i18n").getResourceBundle().getText(oCommentType[sCommentType]);
		}
	}
});