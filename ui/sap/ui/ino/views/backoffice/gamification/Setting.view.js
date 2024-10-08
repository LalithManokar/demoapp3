/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MessageSupportView");

sap.ui.jsview("sap.ui.ino.views.backoffice.gamification.Setting", jQuery.extend({}, sap.ui.ino.views.common.MessageSupportView, {
	init: function() {
		this.initMessageSupportView();
		this.getController().initModel();
	},

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.gamification.Setting";
	},

	hasPendingChanges: function() {
		return this.getController().hasPendingChanges();
	},

	createContent: function() {
		var oController = this.getController();
		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 1,
			widths: ["100%"]
		});

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		this.oSaveButton = new sap.ui.commons.Button({
			id: this.createId("BUT_SAVE"),
			text: "{i18n>BO_LOCAL_GAMIFICATION_SETTING_BTN_SAVE}",
			press: [oController.onSavePressed, oController],
			lite: false,
			enabled: false
		});

		var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this.oSaveButton]
		});
		oRow.addCell(oCell);
		oLayout.addRow(oRow);

		oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oEnableGamificationLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["150px", "10px", "100%"]
		});

		this.createEnableGamificationLayout(oEnableGamificationLayout);
		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oEnableGamificationLayout]
		});
		oRow.addCell(oCell);
		oLayout.addRow(oRow);

		oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oContentLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			visible: {
				parts: [{
					path: 'game>/ENABLE_GAMIFICATION',
					type: null
				}],
				formatter: function(bEnable) {
					return bEnable;
				}
			},
			widths: ["150px", "10px", "100%"]
		});

		this.createContentLayout(oContentLayout);
		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oContentLayout]
		});
		oRow.addCell(oCell);
		oLayout.addRow(oRow);

		return oLayout;
	},
	
	createEnableGamificationLayout: function(oContentLayout) {
		var oControl = new sap.m.CheckBox({
			selected: "{game>/ENABLE_GAMIFICATION}"
		});
		var oLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_LOCAL_GAMIFICATION_SETTING_ENABLE_GAMIFICATION}",
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%",
			tooltip: "{i18n>BO_LOCAL_GAMIFICATION_SETTING_ENABLE_GAMIFICATION}"
		});
		oLabel.setLabelFor(oControl);
		oContentLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: [oLabel]
				})
			, new sap.ui.commons.layout.MatrixLayoutCell()
			, new sap.ui.commons.layout.MatrixLayoutCell({
					content: [oControl]
				})]
		}));
	},
	
	createContentLayout: function(oContentLayout) {
		var oView = this;
		var oRefControl;
		var oCmbControl = new sap.m.MultiComboBox({
			selectedKeys: "{game>/PUBLISH_BADGE}",
			width: "60%"
		});
		var oItemTemplate = new sap.ui.core.ListItem({
			text: '{game>NAME}',
			key: '{game>ID}',
			tooltip: '{game>NAME}'
		});
		oCmbControl.bindItems({
			path: 'game>/ALL_DIMENSION',
			template: oItemTemplate
		});
		oCmbControl.addStyleClass("sapInoPublishBadge");
		var oPublishLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_LOCAL_GAMIFICATION_SETTING_PUBLISH_BADGE}",
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%",
			tooltip: "{i18n>BO_LOCAL_GAMIFICATION_SETTING_PUBLISH_BADGE}"
		});
		oPublishLabel.setLabelFor(oCmbControl);
		oRefControl = new sap.m.Tokenizer();
		var oItemToken = new sap.m.Token({
			text: '{game>text}',
			key: '{game>key}',
			tooltip: '{game>text}'
		});
		oRefControl.bindAggregation("tokens", {
			path: 'game>/PUBLISH_BADGE_TOKEN',
			template: oItemToken
		});
		oCmbControl.attachSelectionChange(function(oEvent) {
			var oChangedItem = oEvent.getParameter("changedItem");
			var bSelected = oEvent.getParameter("selected");
			var aPublishBadgeToken = oView.getModel("game").getProperty("/PUBLISH_BADGE_TOKEN");
			if (bSelected) {
				aPublishBadgeToken.push({
					key: oChangedItem.getKey(),
					text: oChangedItem.getText()
				});
			} else {
				for (var i = aPublishBadgeToken.length - 1; i >= 0; i--) {
					if (Number(aPublishBadgeToken[i].key) === Number(oChangedItem.getKey())) {
						aPublishBadgeToken.splice(i, 1);
					}
				}
			}
		});
		oRefControl.attachTokenUpdate(function(oEvent) {
			var aRemovedTokens = oEvent.getParameter("removedTokens");
			if (aRemovedTokens.length > 0) {
				var aPublishBadge = oView.getModel("game").getProperty("/PUBLISH_BADGE");
				for (var j = aPublishBadge.length - 1; j >= 0; j--) {
					if (aPublishBadge[j] === aRemovedTokens[0].getKey()) {
						aPublishBadge.splice(j, 1);
					}
				}
				var aPublishBadgeToken = oView.getModel("game").getProperty("/PUBLISH_BADGE_TOKEN");
				for (var k = aPublishBadgeToken.length - 1; k >= 0; k--) {
					if (Number(aPublishBadgeToken[k].key) === Number(aRemovedTokens[0].getKey())) {
						aPublishBadgeToken.splice(k, 1);
					}
				}
				var aSelectedItems = oCmbControl.getSelectedItems().filter(function(oItem) {
					return oItem.getKey() !== aRemovedTokens[0].getKey();
				});
				oCmbControl.setSelectedItems(aSelectedItems);
				oCmbControl.fireSelectionFinish({
					selectedItems: aSelectedItems
				});
			}
		});
		oContentLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: [oPublishLabel]
				})
			, new sap.ui.commons.layout.MatrixLayoutCell()
			, new sap.ui.commons.layout.MatrixLayoutCell({
					content: [oCmbControl]
				})]
		}));
		oContentLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell()
			, new sap.ui.commons.layout.MatrixLayoutCell()
			, new sap.ui.commons.layout.MatrixLayoutCell({
					content: [oRefControl]
				})]
		}));

		var oLeadControl = new sap.m.CheckBox({
			selected: "{game>/ENABLE_LEADERBOARD}"
		});
		var oLeadLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_LOCAL_GAMIFICATION_SETTING_ENABLE_LEADERBOARD}",
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%",
			tooltip: "{i18n>BO_LOCAL_GAMIFICATION_SETTING_ENABLE_LEADERBOARD}"
		});
		oLeadLabel.setLabelFor(oLeadControl);
		oContentLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: [oLeadLabel]
				})
			, new sap.ui.commons.layout.MatrixLayoutCell()
			, new sap.ui.commons.layout.MatrixLayoutCell({
					content: [oLeadControl]
				})]
		}));
	},

	exit: function() {
		this.exitMessageSupportView();
		sap.ui.core.mvc.View.prototype.exit.apply(this, arguments);
	}
}));