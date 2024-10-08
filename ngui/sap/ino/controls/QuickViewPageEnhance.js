/*!
 * @copyright@
 */
sap.ui.define([
    "sap/m/QuickViewPage",
    "sap/m/Toolbar",
    "sap/m/OverflowToolbar",
    "sap/m/ToolbarSpacer",
    "sap/ui/core/Icon",
    "sap/m/Title",
    "sap/m/Button",
    "sap/m/Image",
	 'sap/ui/layout/VerticalLayout',
	'sap/ui/layout/HorizontalLayout',
	'sap/m/HBox',
	'sap/m/VBox',
	'sap/ui/layout/form/SimpleForm',
	'sap/ui/layout/library',
	'sap/ui/layout/form/ResponsiveGridLayout',
     'sap/ui/core/Title',
     'sap/m/Label',
     'sap/m/Text',
     "sap/m/ProgressIndicator",
     "sap/ui/layout/GridData",
     "sap/ui/layout/Grid",
     "sap/ui/core/LayoutData"
], function(QuickViewPage, Toolbar, OverflowToolbar, ToolbarSpacer, Icon, Title, Button, Image, VerticalLayout, HorizontalLayout, HBox,
	VBox, SimpleForm, layoutLibrary, ResponsiveGridLayout, CoreTitle, Label, Text, ProgressIndicator, GridData, Grid, LayoutData) {
	"use strict";

	// shortcut for sap.ui.layout.form.SimpleFormLayout
	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;
	return QuickViewPage.extend("sap.ino.controls.QuickViewPageEnhance", {
		metadata: {
			properties: {
				headerToolBarIcon: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},
				headerToolBarText: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},
				visibleLeaderBoard: {
					type: "boolean",
					defaultValue: false
				},
				visibleDimension: {
					type: "boolean",
					defaultValue: false
				}
			},
			aggregations: {
				horizontalBox: {
					type: "sap.m.HBox"
				},
				dimensionGroups: {
					type: "sap.ino.controls.QuickViewGroupDimension",
					multiple: true
				}
			},
			events: {
				navigate: {}
			}
		},
		init: function() {
			QuickViewPage.prototype.init.apply(this, arguments);
			this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
		},
		_createPage: function() {
			var that = this;

			var oPage = QuickViewPage.prototype._createPage.apply(this, arguments);
			if (!this.getVisibleLeaderBoard()) {
				return oPage;
			}
			var oImage = new Image({
				src: this.getHeaderToolBarIcon()
			});
			var oTitle = new Title({
				text: this.getHeaderToolBarText()
			});
			var oButton = new Button({
				icon: "sap-icon://navigation-right-arrow",
				tooltip: this._oRB.getText("CTRL_GAMIFICATION_NAVIGATION_TO_LEADER_BOARD"),
				press: function() {
					that._onNavigateTo();
				}
			});
			oImage.addStyleClass("sapInoQuickViewPageHeaderImage");
			oTitle.addStyleClass("sapInoQuickViewPageHeaderText");
			oButton.addStyleClass("sapInoQuickViewPageHeaderButton");
			var oToolBar = new Toolbar();
			oToolBar.addContent(oImage);
			oToolBar.addContent(oTitle);
			oToolBar.addContent(new ToolbarSpacer());
			oToolBar.addContent(oButton);
			oToolBar.addStyleClass("sapInoQuickViewPageHeaderToolBar");
			oPage.setSubHeader(oToolBar);
			oPage.addStyleClass("sapInoQuickViewPageEnhanceHeader");
			if (this._mPageContent.header) {
				oPage.insertContent(this._mPageContent.dimensionForm, 1);
			} else {
				oPage.insertContent(this._mPageContent.dimensionForm, 0);
			}

			return oPage;
		},
		_onNavigateTo: function() {
			this.fireNavigate();
		},
		_createPageContent: function() {
			var mPageContent = QuickViewPage.prototype._createPageContent.apply(this, arguments);
			if (!this.getVisibleDimension()) {
				return this._mPageContent;
			}
			var oDimensionForm = this._createDimensionForm();

			this._mPageContent.dimensionForm = oDimensionForm;
			this._mPageContent = mPageContent;
			return this._mPageContent;
		},
		_createDimensionForm: function() {
			var aDimensionGroups = this.getAggregation("dimensionGroups");
			// 			var oForm = new SimpleForm({
			// 				editable: false,
			// 				layout: SimpleFormLayout.ResponsiveGridLayout,
			// 				labelSpanL:4,
			// 				labelSpanM:4,
			// 				labelSpanS:4,
			// 				labelSpanXL:-1
			// 			});
			//var oHBox = new HBox({ width:"100%"});
			var oGrid = new Grid({
				width: "100%",
				defaultSpan: "XL12 L12 M12 S12"
			});
			if (aDimensionGroups) {
				for (var j = 0; j < aDimensionGroups.length; j++) {
					if (aDimensionGroups[j].getVisible()) {
						this._renderDimensionGroup(aDimensionGroups[j], oGrid);
					}
				}

			}

			oGrid.addStyleClass("sapInoDimensionGrid");
			return oGrid;
		},
		_renderDimensionGroup: function(oGroup, oGrid) {
			var oVBox = new VBox({
				width: "100%",
				layoutData: new GridData({
					span: "XL12 L12 M12 S12"
				})
			});
			oVBox.addStyleClass("sapInoDimensionVBox");
			var bRedeemEnabled = oGroup.getRedeemEnabled();
			if (oGroup.getHeading()) {
				var oTitle = new Label({
					text: oGroup.getHeading(),
					tooltip: oGroup.getHeading()
				});
				oTitle.addStyleClass("sapInoDimensionTitle");
				var oImage = new Image({
					src: oGroup.getHeadingIcon()
				});
				if (oGroup.getHeadingIcon()) {
					oImage.addStyleClass("sapInoDimensionImage");
				}
				var oHBoxTitle = new HBox({
					items: [oImage, oTitle]
				});
				oHBoxTitle.addStyleClass("sapInoDimensionHBoxLine sapInoDimensionHBoxHeader");
				oVBox.addItem(oHBoxTitle);
			}
			if (!oGroup.getShowOnlyDimension()) {
				var sTextTotalPoints = this._oRB.getText('CTRL_GAMIFICATION_DIMENSION_TOTAL_POINTS', [oGroup.getDimensionUnit()]);
				var oLabelPoints = new Label({
					text: sTextTotalPoints,
					tooltip: sTextTotalPoints
				});
				var oLblTotalPoint = new Label({
					text: oGroup.getTotalPoints()
				});
				var oLblCommon = new Label({
					text: ":"
				});
				var oHBoxPoints = new HBox({
					items: [oLabelPoints, oLblCommon, oLblTotalPoint]
				});
				oLabelPoints.addStyleClass("sapInoDimensionLblDesc");
				oLblTotalPoint.addStyleClass("sapInoDimensionSmallMarginleft sapInoDimensionNumberText");
				if (bRedeemEnabled) {
					var sTextRedeemPoints = this._oRB.getText('CTRL_GAMIFICATION_DIMENSION_TOTAL_REDEEM_POINTS', [oGroup.getDimensionUnit()]);
					var sLableRedeemPoints = new Label({
						text: sTextRedeemPoints,
						tooltip: sTextRedeemPoints
					});
					var oLblTotalRedeemPoints = new Label({
						text: oGroup.getRedeemPoints()
					});
					var oLblCommon1 = new Label({
						text: ":"
					});
					sLableRedeemPoints.addStyleClass("sapInoDimensionSmallMarginleft sapInoDimensionLblReedemDesc");
					oLblTotalRedeemPoints.addStyleClass("sapInoDimensionSmallMarginleft sapInoDimensionNumberText");
					oHBoxPoints.addItem(sLableRedeemPoints);
					oHBoxPoints.addItem(oLblCommon1);
					oHBoxPoints.addItem(oLblTotalRedeemPoints);
				}
				oHBoxPoints.addStyleClass("sapInoDimensionHBoxLine sapInoDimensionHBoxTotalPoints");
				oVBox.addItem(oHBoxPoints);
				if (!bRedeemEnabled) {
					if (oGroup.getNextLevel()) {
						//If the next Level has values then add the item
						var sTextFirst = this._oRB.getText('CTRL_GAMIFICATION_DIMENSION_NEED');
						var sTextLast = this._oRB.getText('CTRL_GAMIFICATION_DIMENSION_TO_NEXT_LEVEL', [oGroup.getDimensionUnit()]);
						var oLableNeedPointsFirst = new Label({
							text: sTextFirst,
							tooltip: sTextFirst + oGroup.getPointsToNextLevel() + " " + sTextLast
						});
						var oLableNeddPonints = new Label({
							text: oGroup.getPointsToNextLevel(),
							tooltip: sTextFirst + oGroup.getPointsToNextLevel() + " " + sTextLast
						});
						var oLableNeedPointsLast = new Label({
							text: sTextLast,
							tooltip: sTextFirst + oGroup.getPointsToNextLevel() + " " + sTextLast
						});
						oLableNeddPonints.addStyleClass("sapInoDimensionSmallMarginleft sapInoDimensionNeedPointsText");
						oLableNeedPointsLast.addStyleClass("sapInoDimensionSmallMarginleft sapInoDimensionLblLevelDesc");
						var oHBoxNeedPoints = new HBox({
							items: [oLableNeedPointsFirst, oLableNeddPonints, oLableNeedPointsLast]
						});
						oHBoxNeedPoints.addStyleClass("sapInoDimensionHBoxLine");
						oVBox.addItem(oHBoxNeedPoints);
					}

					var iPercentage;
					var iDiffPoints = oGroup.getDiffPointsToNextLevel();
					var iToNextPoints = oGroup.getCurrentPointsBWBadge();
					if (iDiffPoints > 0 && iDiffPoints > iToNextPoints) {
						iPercentage = parseInt((iToNextPoints / iDiffPoints * 100).toFixed(), 10);
					} else {
						iPercentage = 0;
					}
					//No End Level so keep 100 percent
					if (!oGroup.getNextLevel()) {
						iPercentage = 100;
					}
					if (oGroup.getStartLevel() || oGroup.getNextLevel()) {
						var oProgressIndicator = new ProgressIndicator({
							percentValue: iPercentage,
							state: "Warning"
						});
						oProgressIndicator.addStyleClass("sapInoDimensionProgressIndicator");
						oVBox.addItem(oProgressIndicator);

						var oStartLevel = new Label({
							text: oGroup.getStartLevel()
						});
						var oNextLevel = new Label({
							text: oGroup.getNextLevel()
						});
						var oHBoxLevel = new HBox({
							items: [oStartLevel, oNextLevel]
						});
						oHBoxLevel.addStyleClass("sapInoDimensionHBoxLine sapInoDimensionHBoxLevel");
						oVBox.addItem(oHBoxLevel);
					}
				}
			}
			oGrid.addContent(oVBox);
		}

	});
});