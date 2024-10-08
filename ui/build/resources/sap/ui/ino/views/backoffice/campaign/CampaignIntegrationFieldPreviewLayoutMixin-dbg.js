/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */

(function() {
	sap.ui.ino.views.backoffice.campaign.CampaignIntegrationFieldPreviewLayoutMixin = {
		_createCampaignFieldPreviewPanel: function(oLayout, bEdit) {
			var oView = this;
			var oPreivewBtn = new sap.ui.commons.Button({
				text: "{i18n>BO_CAMPAIGN_INTEGRATION_BTN_PREVIEW}",
				press: function(oEvent) {
					oView.getController().onPreview(oEvent);
				},
				visible: {
					parts:[{path: "viewCampIntegration>/CampaignMappingSelectedIndex"},{path: "viewCampIntegration>/SegmentBtnSelectedIndex"}],
					formatter: function(nDestIndex, nSelIndex){
					    return nDestIndex > -1 && oView.getController().formatterPreviewContent(nSelIndex);
					}
				},
				enabled: {
					path: "viewCampIntegration>/CampaignMappingSelectedIndex",
					formatter: function(nSelIndex) {
						return oView.getController().formatterPreviewButton(nSelIndex);
					}
				}
			});
			var oPreviewRow = new sap.ui.commons.layout.MatrixLayoutRow();
			oPreviewRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oPreivewBtn]
			}));

			oLayout.addRow(oPreviewRow);
			var oText = new sap.ui.commons.TextView({
				text: "{i18n>BO_CAMPAIGN_INTEGRATION_MSG_PREVIEW}"
			});
			this._previewPanel = new sap.m.Panel({
				content: [oText],
				visible: {
					parts:[{path: "viewCampIntegration>/CampaignMappingSelectedIndex"},{path: "viewCampIntegration>/SegmentBtnSelectedIndex"}],
					formatter: function(nDestIndex, nSelIndex){
					    return nDestIndex > -1 && oView.getController().formatterPreviewContent(nSelIndex);
					}
				}
			});
			var oPreviewRowAttributes = new sap.ui.commons.layout.MatrixLayoutRow();
			oPreviewRowAttributes.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [this._previewPanel]
			}));
			oLayout.addRow(oPreviewRowAttributes);

		},
		_createHeaderLayout: function(oView) {
			var oDisplayHeaderLayout = new sap.ui.commons.layout.MatrixLayout({
				columns: 4,
				widths: ['25%', '25%', '32%', '150px']
			});
			var oPanelHeaderRow = new sap.ui.commons.layout.MatrixLayoutRow();

			var oNumberLbl1 = new sap.ui.commons.Label({
				text: "1"
			});
			var oHeaderLbl = new sap.ui.commons.Label({
				text: "{i18n>BO_CAMPAIGN_INTEGRATION_FLD_ATTRIBUTE1}"
			});
			oHeaderLbl.addStyleClass("sapInoCampIntegrationHeaderLbl");
			oNumberLbl1.addStyleClass("sapUiSmallMarginBegin");
			oNumberLbl1.addStyleClass("sapInoCampIntegrationFieldSeq");
			oPanelHeaderRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oHeaderLbl,
				oNumberLbl1]
			}));
			var oNumberLbl2 = new sap.ui.commons.Label({
				text: "2"
			});
			oNumberLbl2.addStyleClass("sapUiSmallMarginBegin");
			oNumberLbl2.addStyleClass("sapInoCampIntegrationFieldSeq");
			oPanelHeaderRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [new sap.ui.commons.Label({
						text: "{i18n>BO_CAMPAIGN_INTEGRATION_FLD_ATTRIBUTE2}"
					}),
				oNumberLbl2]
			}));
			oPanelHeaderRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: []
			}));
			var oRemoveBtn = new sap.ui.commons.Button({
				text: "{i18n>BO_CAMPAIGN_INTEGRATION_BTN_REMOVE}"
			});
			oRemoveBtn.addStyleClass("sapUiSmallMarginBegin");
			oPanelHeaderRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [new sap.ui.commons.Button({
						text: "{i18n>BO_CAMPAIGN_INTEGRATION_BTN_REFRESH}",
						style: sap.ui.commons.ButtonStyle.Emph
					}),
            oRemoveBtn]
			}));

			oDisplayHeaderLayout.addRow(oPanelHeaderRow);
			return oDisplayHeaderLayout;
		},
		_createOtherAttributesLayout: function(oView) {
			var oDisplayOtherAttributesLayout = new sap.ui.commons.layout.MatrixLayout({
				columns: 3,
				widths: ['30%', '30%', '30%']
			});
			var iIndex = 2;
			for (var i = 0; i < 2; i++) {
				var oPanelRow = new sap.ui.commons.layout.MatrixLayoutRow();
				for (var j = 0; j < 3; j++) {
					iIndex = iIndex + 1;
					var oNumberLbl = new sap.ui.commons.Label({
						text: iIndex
					});
					oNumberLbl.addStyleClass("sapUiSmallMarginBegin");
					oNumberLbl.addStyleClass("sapInoCampIntegrationFieldSeq");
					var sText = "{i18n>BO_CAMPAIGN_INTEGRATION_FLD_ATTRIBUTE" + iIndex + "}";
					oPanelRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
						content: [new sap.ui.commons.Label({
								text: sText
							}),
				    oNumberLbl]
					}));
				}
				oDisplayOtherAttributesLayout.addRow(oPanelRow);
			}
			return oDisplayOtherAttributesLayout;
		},
		_displayPreviewLayout: function(oEvent, attributes) {
			var oDisplayPreviewHeaderLayout = this._createPreviewHeaderLayout(attributes);

			var oDisplayPreviewOtherAttributesLayout = this._createPreviewOtherAttributesLayout(attributes);

			this._previewPanel.removeAllContent();
			this._previewPanel.addContent(oDisplayPreviewHeaderLayout);
			this._previewPanel.addContent(oDisplayPreviewOtherAttributesLayout);

		},
		_openExampleDialog: function(oEvent) {
			var that = this;
			var oDialogCloseBtn = new sap.ui.commons.Button({
				text: this.getText("BO_COMMON_BUT_CLOSE"),
				press: function() {
					that._oDialog.close();
					that._oDialog.destroy();
				}
			});
			var oDisplayExampleHeaderLayout = this._createExampleHeaderLayout();
			var oDisplayExampleOtherAttributes = this._createExampleOtherAttributes();

			this._oDialog = new sap.ui.commons.Dialog({
				modal: true,
				content: [oDisplayExampleHeaderLayout,oDisplayExampleOtherAttributes],
				buttons: [oDialogCloseBtn],
				width: "60%"
			});
			this._oDialog.open();

		},
		_createExampleHeaderLayout: function() {
			var oDisplayHeaderLayout = new sap.ui.commons.layout.MatrixLayout({
				columns: 2,
				widths: ['80%', '20%']
			});
			var oPanelHeaderRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oHeaderLbl = new sap.ui.commons.Label({
				text: "{i18n>BO_CAMPAIGN_INTEGRATION_LBL_EXAMPLE_ATTRIBUTE1}"
			});
			var oNumberLbl1 = new sap.ui.commons.Label({
				text: "1"
			});
			oHeaderLbl.addStyleClass("sapInoCampIntegrationExampleHeaderLbl");
			oNumberLbl1.addStyleClass("sapUiSmallMarginBegin");
			oNumberLbl1.addStyleClass("sapInoCampIntegrationFieldSeq");
			oPanelHeaderRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oHeaderLbl, oNumberLbl1]
			}));
			var oRemoveBtn = new sap.ui.commons.Button({
				text: "{i18n>BO_CAMPAIGN_INTEGRATION_BTN_REMOVE}",
				enabled: false
			});
			oRemoveBtn.addStyleClass("sapUiSmallMarginBegin");
			var oBtnCell = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [new sap.ui.commons.Button({
						text: "{i18n>BO_CAMPAIGN_INTEGRATION_BTN_REFRESH}",
						style: sap.ui.commons.ButtonStyle.Emph,
						enabled: false
					}),
            oRemoveBtn]
			});
			oBtnCell.addStyleClass("sapInoCampIntegrationBtn");
			oPanelHeaderRow.addCell(oBtnCell);
            oPanelHeaderRow.addStyleClass("sapInoCampaignExampleApiLayout");
			oDisplayHeaderLayout.addRow(oPanelHeaderRow);
			return oDisplayHeaderLayout;
		},
		_createExampleOtherAttributes: function() {
			var oDisplayOtherAttributesLayout = new sap.ui.commons.layout.MatrixLayout({
				columns: 3,
				widths: ['33%', '33%', '33%']
			});
// 			var oPanelHeaderRow = new sap.ui.commons.layout.MatrixLayoutRow();
// 			var oHeaderLbl = new sap.ui.commons.Label({
// 				text: "{i18n>BO_CAMPAIGN_INTEGRATION_LBL_EXAMPLE_ATTRIBUTE1}"
// 			});
// 			var oNumberLbl1 = new sap.ui.commons.Label({
// 				text: "1"
// 			});
// 			oHeaderLbl.addStyleClass("sapInoCampIntegrationExampleHeaderLbl");
// 			oNumberLbl1.addStyleClass("sapUiSmallMarginBegin");
// 			oNumberLbl1.addStyleClass("sapInoCampIntegrationFieldSeq");
// 			oPanelHeaderRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
// 				content: [oHeaderLbl, oNumberLbl1]
// 			}));
// 			var oNumberLbl2 = new sap.ui.commons.Label({
// 				text: "2"
// 			});
// 			oNumberLbl2.addStyleClass("sapUiSmallMarginBegin");
// 			oNumberLbl2.addStyleClass("sapInoCampIntegrationFieldSeq");
// 			oPanelHeaderRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
// 				content: [new sap.ui.commons.Label({
// 						text: "{i18n>BO_CAMPAIGN_INTEGRATION_LBL_EXAMPLE_ATTRIBUTE2}"
// 					}),
// 	                 new sap.ui.commons.TextView({
// 						text: "{i18n>BO_CAMPAIGN_INTEGRATION_VALUE_EXAMPLE_ATTRIBUTE2}"
// 					}),
// 					oNumberLbl2]
// 			}));
// 			var oRemoveBtn = new sap.ui.commons.Button({
// 				text: "{i18n>BO_CAMPAIGN_INTEGRATION_BTN_REMOVE}",
// 				enabled: false
// 			});
// 			oRemoveBtn.addStyleClass("sapUiSmallMarginBegin");
// 			oPanelHeaderRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
// 				content: [new sap.ui.commons.Button({
// 						text: "{i18n>BO_CAMPAIGN_INTEGRATION_BTN_REFRESH}",
// 						style: sap.ui.commons.ButtonStyle.Emph,
// 						enabled: false
// 					}),
//             oRemoveBtn]
// 			}));
			//oDisplayOtherAttributesLayout.addRow(oPanelHeaderRow);
			var oDate = new Date();
			var iIndex = 2;
			for (var i = 0; i < 2; i++) {
				var oPanelRow = new sap.ui.commons.layout.MatrixLayoutRow();
				for (var j = 0; j < 3; j++) {
					iIndex = iIndex + 1;
					var oNumberLbl = new sap.ui.commons.Label({
						text: iIndex - 1
					});
					oNumberLbl.addStyleClass("sapUiSmallMarginBegin");
					oNumberLbl.addStyleClass("sapInoCampIntegrationFieldSeq");
					var slblText = "{i18n>BO_CAMPAIGN_INTEGRATION_LBL_EXAMPLE_ATTRIBUTE" + iIndex + "}";
					var sValueText = "{i18n>BO_CAMPAIGN_INTEGRATION_VALUE_EXAMPLE_ATTRIBUTE" + iIndex + "}";
					var oControl = new sap.ui.commons.TextView({
						text: sValueText
					});
					if (iIndex === 4) {
						oControl = new sap.ui.commons.Link({
							text: sValueText,
							target: "_blank",
							href: "http://www.sap.com"
						});
					} else if (iIndex === 5 || iIndex === 8) {
						oControl = new sap.ui.commons.TextView({
							text: oDate.toString().substr(4, 20)
						});
					}
					oPanelRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
						content: [new sap.ui.commons.Label({
							text: slblText
						}), oControl, oNumberLbl]
					}));
				}
				oDisplayOtherAttributesLayout.addRow(oPanelRow);
			}
			return oDisplayOtherAttributesLayout;
		},
		_createPreviewHeaderLayout: function(attributes) {
			var oDisplayHeaderLayout = new sap.ui.commons.layout.MatrixLayout({
				columns: 3,
				widths: ['40%', '45%', '15%']
			});
			//var oTextModel = this.getTextModel();
			var oPanelHeaderRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var aHeaderAttributes = attributes.filter(function(oAttribute) {
				return oAttribute.DISPLAY_SEQUENCE === 1;
			});
			for (var i = 0; i < aHeaderAttributes.length; i++) {
				var oHeaderLbl = new sap.ui.commons.Label({
					//Attribute 1 Value 1
					text: aHeaderAttributes[i].DISPLAY_NAME + ":",
					wrapping: true
				});
				var oText = new sap.ui.commons.TextView({
					//Attribute 1 Value 1
					text:  this.getText("BO_CAMPAIGN_INTEGRATION_FLD_EXAMPLE_VALUE")
				});
				oText.addStyleClass("sapInoCampIntegrationHeaderValue");
				if (aHeaderAttributes[i].DISPLAY_SEQUENCE === 1) {
					if (aHeaderAttributes[i].MAPPING_FIELD_CODE.indexOf("URL") > -1) {
						var oHeaderlink = new sap.ui.commons.Link({
							text: this.getText("BO_CAMPAIGN_INTEGRATION_FLD_EXAMPLE_VALUE"),
							target: "_blank",
							href: "http://www.sap.com"
						});
						var oLblLink = new sap.ui.commons.Label({
							text: aHeaderAttributes[i].DISPLAY_NAME + ":"
						});
						var oHboxLink = new sap.m.HBox({items:[oLblLink,oHeaderlink]});
						oLblLink.addStyleClass("sapInoCampIntegrationHeaderLbl");
						oHeaderlink.addStyleClass("sapInoCampIntegrationHeaderValue");
						oPanelHeaderRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
							content: [oHboxLink]
						}));
					} else {
					    var oHboxText = new sap.m.HBox({items:[oHeaderLbl,oText]});
						oHeaderLbl.addStyleClass("sapInoCampIntegrationHeaderLbl");
						oPanelHeaderRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
							content: [oHboxText]
						}));
					}
				}
				// if (aHeaderAttributes[i].DISPLAY_SEQUENCE === 2) {
				// 	var oHeaderLbl = new sap.ui.commons.Label({
				// 		//Attribute 1 Value 1
				// 		text: aHeaderAttributes[i].DISPLAY_NAME + ":"
				// 	});
				// 	oHeaderLbl.addStyleClass("sapInoCampIntegrationPrvOtherLbl");
				// 	if (aHeaderAttributes[i].MAPPING_FIELD_CODE.indexOf("URL") > -1) {
				// 		var oHeaderlink = new sap.ui.commons.Link({
				// 			text:  this.getText("BO_CAMPAIGN_INTEGRATION_FLD_EXAMPLE_VALUE"),
				// 			target: "_blank",
				// 			href: "http://www.sap.com"
				// 		});
				// 	    oHeaderlink.addStyleClass("sapInoCampIntegrationPrvOtherValue");
				// 		oPanelHeaderRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				// 			content: [oHeaderLbl, oHeaderlink]
				// 		}));
				// 	} else {
				// 		var oText = new sap.ui.commons.TextView({
				// 			//Attribute 1 Value 1
				// 			text: this.getText("BO_CAMPAIGN_INTEGRATION_FLD_EXAMPLE_VALUE")
				// 		});
				// 		 oText.addStyleClass("sapInoCampIntegrationPrvOtherValue");
				// 		oPanelHeaderRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				// 			content: [oHeaderLbl, oText]
				// 		}));
				// 	}
				// }
			}
				oPanelHeaderRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: []
				}));

			var oRemoveBtn = new sap.ui.commons.Button({
				text: "{i18n>BO_CAMPAIGN_INTEGRATION_BTN_REMOVE}",
				enabled: false
			});
			oRemoveBtn.addStyleClass("sapUiSmallMarginBegin");
			var oBtnCell = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [new sap.ui.commons.Button({
						text: "{i18n>BO_CAMPAIGN_INTEGRATION_BTN_REFRESH}",
						style: sap.ui.commons.ButtonStyle.Emph,
						enabled: false
					}),
            oRemoveBtn]
			});
			oBtnCell.addStyleClass("sapInoCampIntegrationBtn");
			oPanelHeaderRow.addCell(oBtnCell);

			oDisplayHeaderLayout.addRow(oPanelHeaderRow);
			return oDisplayHeaderLayout;
		},
		_createPreviewOtherAttributesLayout: function(attributes) {
			var oDisplayOtherAttributesLayout = new sap.ui.commons.layout.MatrixLayout({
				columns: 3,
				widths: ['30%', '30%', '30%']
			});
			var aOtherAttributes = attributes.filter(function(oAttribute) {
				return oAttribute.DISPLAY_SEQUENCE !== 1;
			});

			// 			var iIndex = 2;
			// 			var iMode = parseInt( aOtherAttributes.length / 3, 10) + 1;
			//var oTextModel = this.getTextModel();
			for (var i = 1; i <= aOtherAttributes.length; i++) {
				if (i % 3 === 1) {
					var oPanelRow = new sap.ui.commons.layout.MatrixLayoutRow();
				}
				var oText = new sap.ui.commons.TextView({
					text: this.getText("BO_CAMPAIGN_INTEGRATION_FLD_EXAMPLE_VALUE")
				});
                var oOtherLbl = new sap.ui.commons.Label({
								text: aOtherAttributes[i - 1].DISPLAY_NAME + ":",
								wrapping: true
							});	

				if (aOtherAttributes[i - 1].MAPPING_FIELD_CODE.indexOf("URL") > -1) {
					var oLink = new sap.ui.commons.Link({
						text: this.getText("BO_CAMPAIGN_INTEGRATION_FLD_EXAMPLE_VALUE"),
						target: "_blank",
						href: "http://www.sap.com"
					});
			       var oHboxLink = new sap.m.HBox({items:[oOtherLbl,oLink]});					
					oPanelRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
						content: [oHboxLink]
					}));
				} else {
				     var oHboxText = new sap.m.HBox({items:[oOtherLbl,oText]});	
					oPanelRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
						content: [oHboxText]
					}));
				}
				if (i % 3 === 0 || i === aOtherAttributes.length) {
					oDisplayOtherAttributesLayout.addRow(oPanelRow);
				}
			}

			// 			for (var i = 0; i < iMode; i++) {
			// 				var oPanelRow = new sap.ui.commons.layout.MatrixLayoutRow();
			// 				for (var j = 0; j < 3; j++) {
			// 					iIndex = iIndex + 1;
			// 					var oText = new sap.ui.commons.TextView({
			// 						text: "Value" + "iIndex"
			// 					});
			// 					var sText = "Attributes" + iIndex;
			// 					oPanelRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			// 						content: [new sap.ui.commons.Label({
			// 								text: sText
			// 							}),
			// 				    oText]
			// 					}));
			// 				}
			// 				oDisplayOtherAttributesLayout.addRow(oPanelRow);
			// 			}
			return oDisplayOtherAttributesLayout;
		}
	};
}());