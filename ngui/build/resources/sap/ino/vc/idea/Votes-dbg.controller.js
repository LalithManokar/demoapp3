sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/object/User"
    ], function(BaseController, JSONModel, IFrame, CustomData, User) {

	"use strict";

	var oFormatter = {
		voteComment: function(sVoteReason, sVoteComment) {
			if (sVoteReason) {
				return BaseController.prototype.formatter.valueOption(sVoteReason);
			} else {
				return sVoteComment;
			}
		},

		voterName: function(sPublicVote, sName, sAnonymity) {
			if (sPublicVote) {
				return sName;
			} else {
				return sAnonymity;
			}
		},
		
		groupVoteTitle: function(sVotedGroup, sGroupVoteTitle) {
		    var sVotedGroupName;
		    switch(sVotedGroup) {
		        case "ORG":
		            sVotedGroupName = "Organization";
		            break;
		        case "COM":
		            sVotedGroupName = "Company";
		            break;
		        case "COST":
		            sVotedGroupName = "Cost Center";
		            break;
	            case "OFF":
	                sVotedGroupName = "Office";
	                break;
                default:
                    sVotedGroupName = "";
		    }
		    return sGroupVoteTitle.replace(/{\d+}/g, sVotedGroupName);
		}

	};

	jQuery.extend(oFormatter, BaseController.prototype.formatter);

	return BaseController.extend("sap.ino.vc.idea.Votes", {
		formatter: oFormatter,
		onAfterRendering: function() {
			var self = this;
			var groupList = self.byId('groupVoteList');
			if (groupList) {
				var groupItems = groupList.getItems();
				if (groupItems.length > 0) {
					for (var i = 0; i < groupItems.length; i++) {
						var oContent = groupItems[i].getContent()[0];
						if (oContent.getExpanded()) {
						  oContent.setExpanded(false);
						}
					}

				}
			}
		},
		OnUserPressed: function(oEvent) {
			var oSource = oEvent.getSource();
			var oContext = oSource.getBindingContext("data");
			var iIdentityId = oContext.getProperty("USER_ID");
        if (oSource && iIdentityId) {
            if (!this._oIdentityCardView || !this._oIdentityCardView.getController()) {
                this._oIdentityCardView = sap.ui.xmlview({
                    viewName: "sap.ino.vc.iam.IdentityCard"
                });
                oSource.addDependent(this._oIdentityCardView);
            }
            this._oIdentityCardView.getController().open(oSource, iIdentityId);
        }			

		},
		
		onExpand: function(oEvent) {
		    var oSourceCtrl = oEvent.getSource();
			var oChangeEvent = oSourceCtrl.getBindingContext("data");
			var oCtrl;
			if (oEvent.getParameter("expand") && oChangeEvent) {
			    // set class
				oSourceCtrl.toggleStyleClass("sapInoActivityExpanded");
				var oData = oChangeEvent.getObject();
			    oCtrl = this.getFragment("sap.ino.vc.idea.fragments.VoteGeneralList").clone();
		    	oCtrl.addStyleClass("sapMListBGSolid");
		    	oCtrl.bindItems({
					path: "data>/IdeaFull("+ oData.IDEA_ID +")/Votes",
					template: this.getFragment("sap.ino.vc.idea.fragments.VoteGeneralListItem"),
					filters: new sap.ui.model.Filter("GROUP_VOTE_NAME", sap.ui.model.FilterOperator.EQ, oData.GROUP_VOTE_NAME)
				});
			} else {
				oSourceCtrl.toggleStyleClass("sapInoActivityExpanded");
				// destroy all components on close
				oSourceCtrl.removeAllContent();
			}
			oSourceCtrl.addContent(oCtrl);
		}
	});
});