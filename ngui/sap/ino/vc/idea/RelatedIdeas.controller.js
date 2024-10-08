sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ino/vc/commons/BaseListController",
    "sap/ino/commons/application/Configuration",
    "sap/ui/Device",
    "sap/ino/vc/idea/mixins/DuplicateActionMixin",
    "sap/m/GroupHeaderListItem",
    "sap/ino/commons/models/object/Idea",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ui/model/Sorter",
    "sap/m/Button",
    "sap/ino/vc/idea/mixins/VoteMixin",
    "sap/ino/vc/commons/mixins/FollowMixin",
    "sap/ino/vc/idea/mixins/VolunteerMixin",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(BaseController,
	BaseListController,
	Configuration,
	Device,
	DuplicateActionMixin,
	GroupHeaderListItem,
	Idea,
	JSONModel,
	ObjectListFormatter,
	Sorter,
	Button,
	VoteMixin,
	FollowMixin,
	VolunteerMixin,
	Filter,
	FilterOperator) {
	"use strict";

	return BaseController.extend("sap.ino.vc.idea.RelatedIdeas", jQuery.extend({}, DuplicateActionMixin, VoteMixin, FollowMixin,
		VolunteerMixin, {

			formatter: ObjectListFormatter,

			onInit: function() {
				BaseController.prototype.onInit.apply(this, arguments);
				this._sResizeSimList = this.attachListControlResized(this.byId("idealist-similar"));
				this._sResizeRelList = this.attachListControlResized(this.byId("idealist-related"));
				this._sResizeRMerList = this.attachListControlResized(this.byId("idealist-merge"));
			},

			onExit: function() {
				BaseController.prototype.onExit.apply(this, arguments);
				this.detachListControlResized(this._sResizeSimList);
				this.detachListControlResized(this._sResizeRelList);
				this.detachListControlResized(this._sResizeRMerList);
			},

			/*getTopLevelController: function() {
		    if(!this.oTopLevelController) {
		        var oView  = this.getView();
    		    var oParentView = oView.getParent && oView.getParent();
    		    while(oParentView && !oView.getController().attachObjectModelDataReceivedListener) {
    		        oView = oParentView;
    		        oParentView = oView.getParent && oView.getParent();
    		    }
    		    if (oView.getController().attachObjectModelDataReceivedListener) {
    		        this.oTopLevelController = oView.getController();
    		    }
		    }
		    
		    return this.oTopLevelController;
		},*/

			onBeforeRendering: function(oEvent) {
				var that = this;
				//var oObjectController = this.getTopLevelController();
				//oObjectController.attachObjectModelDataReceivedListener(this.myCallback);
                var oOtherPanel = this.byId("otherCampaignPanel");
                if(oOtherPanel && oOtherPanel.getExpanded())
                {
                    oOtherPanel.setExpanded(false);
                }
                var oCurrentPanel = this.byId("currentCampaignPanel");
                if(oCurrentPanel && !oCurrentPanel.getExpanded())
                {
                    oCurrentPanel.setExpanded(true);
                }
				var iIdeaId = this.getObjectModel().getKey();
			    var iCampaignId = this.getObjectModel().getProperty("/CAMPAIGN_ID");
				if (iIdeaId !== null) {
					var oSimilarModel = new JSONModel(Configuration.getRelatedIdeasURL(iIdeaId));
					var oSimilarList = this.byId("idealist-similar");
					that.bindSimilarIdeaList(oSimilarList, oSimilarModel, FilterOperator.EQ,iCampaignId);

					var oRelatedIdeaList = this.byId('idealist-related');
					var oMergeIdeaList = this.byId('idealist-merge');
					//var oRelatedIdeaOtherList = this.byId('idealist-relatedOther');
					that.bindRelatedCampaignIdeaList(oRelatedIdeaList, FilterOperator.EQ,iCampaignId);
					that.bindMergeIdeaList(oMergeIdeaList, FilterOperator.EQ,iCampaignId);
				}
			},

			/*myCallback: function(){
            console.log();
        },*/

			onAfterRendering: function() {
				//var oObjectController = this.getTopLevelController();
				//oObjectController.detachObjectModelDataReceivedListener(this.myCallback);
			},

			getRelatedIdeaItemTemplate: function() {
				// prepare FlatListItem template by adding checkbox
				if (!this._oIdeaDupListItemTemplate) {
					this._oIdeaDupListItemTemplate = this.getFragment("sap.ino.vc.idea.fragments.FlatListItem");
					// as this is a template, we need to get the idea via Fragment's byId
					var oActionBox = sap.ui.core.Fragment.byId(this.getView().getId(), "flatListIdeaActions");
					var oButton = new Button({
						type: "Transparent",
						visible: this.getObjectModel().getProperty("/property/actions/update/enabled") &&
							!this.getModel("device").getProperty("/system/phone"),
						icon: "sap-icon://duplicate",
						tooltip: this.getModel("i18n").getProperty("IDEA_OBJECT_TIT_DUPLCATE_GENERAL"),
						press: this.onDuplicate.bind(this)
					});
					oActionBox.addItem(oButton);
				}
				return this._oIdeaDupListItemTemplate;
			},

			onItemPress: function(oEvent) {
				var oSource = oEvent.getSource();
				var iItemId = oSource.getBindingContext("data").getProperty("ID");
				if (iItemId) {
					this.navigateTo("idea-display", {
						id: iItemId
					});
				}
			},
			onExpandOther: function(oEvent) {
				var that = this;
				var iIdeaId = this.getObjectModel().getKey();
				var iCampaignId = this.getObjectModel().getProperty("/CAMPAIGN_ID");
				var oSourceCtrl = oEvent.getSource();
				var oChangeEvent = oSourceCtrl.getBindingContext("data");
				if (iIdeaId !== null && oEvent.getParameter("expand") && oChangeEvent) {
					var oSimilarModel = new JSONModel(Configuration.getRelatedIdeasURL(iIdeaId));
					var oSimilarOtherList = this.byId("idealist-similarOther");
					that.bindSimilarIdeaList(oSimilarOtherList, oSimilarModel, FilterOperator.NE,iCampaignId);
					var oRelatedIdeaOtherList = this.byId('idealist-relatedOther');
					that.bindRelatedOtherCampaignIdeaList(oRelatedIdeaOtherList, FilterOperator.NE,iCampaignId);

				}
			},
			bindMergeIdeaList: function(oList, oFilterOperater) {
			    var that = this;
				if (!oList) {
					jQuery.sap.log.warning("List not ready", "", "sap.ino.vc.idea.RelatedIdeasController.js");
				} else {
					oList.bindItems({
						path: "data>RelatedIdeas",
						template: this.getRelatedIdeaItemTemplate(),
						filters: [new Filter({
						    path: "SEMANTIC",
							operator: oFilterOperater,
							value1: "sap.ino.config.MERGED"
						})],
						sorter: [new Sorter("SEMANTIC_SOURCE", false, true)],
						groupHeaderFactory: function(oGroup) {
							return new GroupHeaderListItem({
								title: that.getText("IDEA_RELATED_" + oGroup.key),
								upperCase: false
							}).addStyleClass("sapInoIdeasRelatedHeader");
						}
					});
				}
			},
			bindRelatedCampaignIdeaList: function(oList, oFilterOperater,iCampaignid) {
				var that = this;
				if (!oList) {
					jQuery.sap.log.warning("List not ready", "", "sap.ino.vc.idea.RelatedIdeasController.js");
				} else {
					oList.bindItems({
						path: "data>RelatedIdeas",
						template: this.getRelatedIdeaItemTemplate(),
						filters: [new Filter({
							path: "CAMPAIGN_ID",
							operator: oFilterOperater,
							value1: iCampaignid
						}),new Filter({
						    path: "SEMANTIC",
							operator: oFilterOperater,
							value1: "sap.ino.config.DUPLICATE" || "sap.ino.config.COPIED"
						})],
						sorter: [new Sorter("SEMANTIC_SOURCE", false, true)],
						groupHeaderFactory: function(oGroup) {
							return new GroupHeaderListItem({
								title: that.getText("IDEA_RELATED_" + oGroup.key),
								upperCase: false
							}).addStyleClass("sapInoIdeasRelatedHeader");
						}
					});
				}
			},
			bindRelatedOtherCampaignIdeaList: function(oList, oFilterOperater,iCampaignid) {
				var that = this;
				if (!oList) {
					jQuery.sap.log.warning("List not ready", "", "sap.ino.vc.idea.RelatedIdeasController.js");
				} else {
					oList.bindItems({
						path: "data>RelatedIdeas",
						template: this.getRelatedIdeaItemTemplate(),
						filters: [new Filter({
							path: "CAMPAIGN_ID",
							operator: oFilterOperater,
							value1: iCampaignid
						}),new Filter({
						    path: "SEMANTIC",
							operator: oFilterOperater,
							value1: "sap.ino.config.MERGED"
						})],
						sorter: [new Sorter("SEMANTIC_SOURCE", false, true)],
						groupHeaderFactory: function(oGroup) {
							return new GroupHeaderListItem({
								title: that.getText("IDEA_RELATED_" + oGroup.key),
								upperCase: false
							}).addStyleClass("sapInoIdeasRelatedHeader");
						}
					});
				}
			},
			bindSimilarIdeaList: function(oList, oModel, oFilterOperater,iCampaignid) {
				var that = this;
				if (!oList) {
					jQuery.sap.log.warning("List not ready", "", "sap.ino.vc.idea.RelatedIdeasController.js");
				} else {
					oList.setModel(oModel, "data");
					//oSimilarList.bindItems({path: "data>/", template: this.getRelatedIdeaItemTemplate()});
					oList.bindItems({
						path: "data>/",
						filters: new Filter({
							path: "CAMPAIGN_ID",
							operator: oFilterOperater,
							value1: iCampaignid
						}),
						template: this.getRelatedIdeaItemTemplate(),
						sorter: [new Sorter("SEMANTIC", false, true)],
						groupHeaderFactory: function(oGroup) {
							return new GroupHeaderListItem({
								title: that.getText("IDEA_RELATED_TITLE_SIMILAR_IDEAS"),
								upperCase: false
							}).addStyleClass("sapInoIdeasRelatedHeader");
						}
					});
				}
			}
		}));
});