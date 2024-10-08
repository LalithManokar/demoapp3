/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.ino.controls.IFrame");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");

jQuery.sap.require("sap.ui.ino.models.object.Campaign");

sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignMailNotificationFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.campaign.CampaignMailNotificationFacet";
	},

	onHide: function() {
		var oController = this.getController();
		if (this.getThingInspectorController().getModel()) {
			this.getThingInspectorController().getModel().detachRequestCompleted(oController._initialLanguageBinding, oController);
		}
		var oEvtBus = sap.ui.getCore().getEventBus();
		oEvtBus.unsubscribe("sap.ui.ino.models.object.Campaign", "language_update", oController._initialLanguageBinding, oController);
	},

	onShow: function() {
		var that = this;
		var oController = this.getController();
		oController._initialTemplateBinding();
		oController._initialLanguageBinding();
		this.revalidateMessages();
		var oEvtBus = sap.ui.getCore().getEventBus();
		oEvtBus.unsubscribe("sap.ui.ino.models.object.Campaign", "language_update", oController._initialLanguageBinding, oController);
		oEvtBus.subscribe("sap.ui.ino.models.object.Campaign", "language_update", oController._initialLanguageBinding, oController);
		// Init additional model and view
		oController.getModel().getDataInitializedPromise().done(function() {
			oController._initViewModel();
			oController._initStatusModel();
		});
		if (oController._getViewModel() && oController._getViewModel().getProperty('/ActionSelectedIndex') > -1) {
			that._updateReceiverListComboBox();
			that._updateReceiverTokenizer(oController.isInEditMode());
		}
	},

	createFacetContent: function() {
		var oController = this.getController();
		var bEdit = oController.isInEditMode();

		// Template Layout
		var oTemplateLayout = new sap.ui.commons.layout.MatrixLayout();
		var oTemplateRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oTemplateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this.createTemplateLayout(bEdit, "notification.MailTemplate", "MAIL_TEMPLATE", oController.onTemplateChange)]
		}));
		oTemplateLayout.addRow(oTemplateRow);

		// Action Layout
		var oActionLayout = new sap.ui.commons.layout.MatrixLayout();
		this.createActionLayout(oActionLayout, bEdit);

		//Preview Layout
		var oPreviewLayout = new sap.ui.commons.layout.MatrixLayout({
			visible: {
				path: 'viewCampNotification>/ActionSelectedIndex',
				formatter: function(iIndex) {
					return iIndex > -1;
				}
			}
		});
		this.createPreviewLayout(oPreviewLayout, bEdit);

		var content = [new sap.ui.ux3.ThingGroup({
			title: "{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_TEMPLATE}",
			content: oTemplateLayout,
			colspan: true
		}), new sap.ui.ux3.ThingGroup({
			title: "{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_ACTIONS}",
			content: oActionLayout,
			colspan: true
		}), new sap.ui.ux3.ThingGroup({
			title: "{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_PREVIEW}",
			content: oPreviewLayout,
			colspan: true
		})];

		return content;
	},

	createTemplateLayout: function(bEdit, sTemplateType, sTemplateTypeCode, fnChange) {
		var oController = this.getController();

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["20%", "20px", "80%"]
		});
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			height: "20px"
		}));

		var oTemplateTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_" + sTemplateTypeCode),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oTemplateRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oTemplateLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oTemplateTextView],
			vAlign: sap.ui.commons.layout.VAlign.Top
		});

		this._oTemplateDropdown = this.createDropDownBoxForCode({
			Path: this.getFormatterPath(sTemplateTypeCode + "_CODE", true),
			CodeTable: "sap.ino.xs.object." + sTemplateType + ".Root",
			Editable: bEdit,
			Visible: true,
			onChange: function(oEvent) {
				if (fnChange !== undefined) {
					fnChange.call(oController, oEvent);
				}
			},
			/*
            onLiveChange : function(oEvent) {
                fnChange.apply(oController, [oEvent]);
            },*/
			WithEmpty: true,
			LabelControl: oTemplateTextView,
			Width: "75%"
		});

		var oTemplate = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._oTemplateDropdown, new sap.ui.commons.Label({
				text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_TXT_TEMPLATE"),
				width: "100%",
				visible: {
					path: '',
					formatter: function() {
						return oController.isInEditMode();
					}
				}
			})],
			vAlign: sap.ui.commons.layout.VAlign.Top
		});

		oTemplateRow.addCell(oTemplateLabel);
		oTemplateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oTemplateRow.addCell(oTemplate);
		oLayout.addRow(oTemplateRow);

		return oLayout;
	},

	createDropDownBoxForCode: function(oSettings) {
		if (!oSettings.View) {
			oSettings.View = this;
		}
		return sap.ui.ino.views.common.GenericControl.createDropDownBoxForCode(oSettings);
	},

	createActionLayout: function(oLayout, bEdit) {
		this._createActionTableLayout(oLayout, bEdit);
		this._createActionSettingLayout(oLayout, bEdit);
		return oLayout;
	},

	createPreviewLayout: function(oLayout, bEdit) {
		this._createPreviewSettingLayout(oLayout, bEdit);
		return oLayout;
	},

	_createActionTableLayout: function(oLayout) {
		var i18n = sap.ui.getCore().getModel('i18n').getResourceBundle();
		var oView = this;
		var oController = oView.getController();
		this._oActionTable = new sap.ui.table.Table({
			rows: {
				path: this.getFormatterPath("CampaignNotification", true),
				sorter: new sap.ui.model.Sorter("ACTION_CODE", false)
			},
			selectionMode: sap.ui.table.SelectionMode.Single,
			visibleRowCount: 5,
			rowSelectionChange: function(oEvent) {
				oController.onActionTableRowSelectionChange(oEvent);
			},
			selectedIndex: {
				path: "viewCampNotification>/ActionSelectedIndex"
			},
			columns: [new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_ACTION}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: this.getFormatterPath("ACTION_CODE"),
						formatter: function(sCode) {
							return i18n.getText(sCode + '_TEXT');
						}
					}
				})
			}), new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_TEXT_MODULE_FOR_MAIL}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						parts: [this.getFormatterPath("ACTION_CODE"), this.getFormatterPath("TEXT_MODULE_CODE")],
						formatter: function(sActionCode, sTextModuleCode) {
							if (sActionCode === 'CHANGE_STATUS') {
								return '';
							} else {
								return sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.basis.TextModule.Root")(sTextModuleCode);
							}
						}
					}
				})
			})]
		});

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._oActionTable]
		}));
		oLayout.addRow(oRow);
		return oLayout;
	},

	_createActionSettingLayout: function(oLayout, bEdit) {
		var oRowLayout = new sap.ui.commons.layout.MatrixLayout({
			visible: {
				path: 'viewCampNotification>/ActionSelectedIndex',
				formatter: function(iIndex) {
					return iIndex > -1;
				}
			}
		});
		this._createGeneralSettingLayout(oRowLayout, bEdit);
		this._createStatusModelLayout(oRowLayout, bEdit);
		this._createStatusTransitionLayout(oRowLayout, bEdit);

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oRowLayout]
		}));
		oLayout.addRow(oRow);

		return oLayout;
	},

	_createPreviewSettingLayout: function(oLayout, bEdit) {
		var oRowLayout = new sap.ui.commons.layout.MatrixLayout({
			visible: {
				path: 'viewCampNotification>/ActionSelectedIndex',
				formatter: function(iIndex) {
					return iIndex > -1;
				}
			}
		});
		this._createPreviewLanguageLayout(oRowLayout, bEdit);

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oRowLayout]
		}));
		oLayout.addRow(oRow);

		return oLayout;
	},

	_createGeneralSettingLayout: function(oLayout, bEdit) {
		var oController = this.getController();
		var oRowLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["20%", "20px", "80%"],
			visible: {
				path: 'viewCampNotification>/ActionSelectedIndex',
				formatter: function(iIndex) {
					return iIndex > -1;
				}
			}
		});
		oRowLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			height: "20px"
		}));

		// Action
		var oActionRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oActionLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [new sap.ui.commons.Label({
				text: '{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_ACTION}',
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Right,
				width: "100%"
			})]
		});
		var oActionText = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [new sap.ui.commons.TextView({
				text: '{viewCampNotification>/ActionSelectedName}',
				width: "100%"
			})]
		});
		oActionRow.addCell(oActionLabel);
		oActionRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oActionRow.addCell(oActionText);

		// Message for Text Module for E-mail
		var oMsgLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['20px', '100%'],
			visible: {
				parts: ['viewCampNotification>/ActionSelectedCode', 'viewCampNotification>/TextModuleCode', 'viewCampNotification>/EditMode'],
				formatter: function(sActionCode, sTextModuleCode, bEditMode) {
					return sActionCode !== 'CHANGE_STATUS' && !sTextModuleCode && !bEditMode;
				}
			}
		});
		var oMsgIcon = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [new sap.ui.core.Icon({
				src: 'sap-icon://message-error'
			})]
		});
		oMsgIcon.addStyleClass('sapUiTinyMarginEnd');
		var oMsgText = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [new sap.ui.commons.TextView({
				text: '{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_TXT_MAIL_NO_TEXT_MODULE_CONFIGURED}',
				width: "100%"
			})]
		});
		var oMsgRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oMsgRow.addCell(oMsgIcon);
		oMsgRow.addCell(oMsgText);
		oMsgLayout.addRow(oMsgRow);

		// Text Module for E-mail
		var oTextModuleRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var _oTextModuelLabel = new sap.ui.commons.Label({
			text: '{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_TEXT_MODULE_FOR_MAIL}',
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%",
			visible: {
				parts: ['viewCampNotification>/ActionSelectedCode'],
				formatter: function(sCode) {
					return sCode !== 'CHANGE_STATUS';
				}
			},
			vAlign: sap.ui.commons.layout.VAlign.Top
		});
		var oTextModuleLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [_oTextModuelLabel],
			vAlign: sap.ui.commons.layout.VAlign.Top
		});
		var oTextModuleDropDown = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [
			    oMsgLayout,
			    this.createDropDownBoxForCode({
					Path: this.getFormatterPath('TEXT_MODULE_CODE'),
					CodeTable: "sap.ino.xs.object.basis.TextModule.Root",
					Editable: bEdit,
					Visible: {
						parts: ['viewCampNotification>/ActionSelectedCode'],
						formatter: function(sCode) {
							return sCode !== 'CHANGE_STATUS';
						}
					},
					onChange: function(oEvent) {
						oController.onTextChange(oEvent);
					},
					WithEmpty: true,
					LabelControl: _oTextModuelLabel,
					Width: "75%"
				}), new sap.ui.commons.TextView({
					text: '{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_TXT_TEXT_MODULE_FOR_MAIL}',
					width: "100%",
					visible: {
						parts: ['viewCampNotification>/ActionSelectedCode'],
						formatter: function(sCode) {
							return sCode !== 'CHANGE_STATUS' && oController.isInEditMode();
						}
					}
				})
			],
			vAlign: sap.ui.commons.layout.VAlign.Top
		});
		oTextModuleRow.addCell(oTextModuleLabel);
		oTextModuleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oTextModuleRow.addCell(oTextModuleDropDown);

		// E-mail Receiver
		var oMailReceiverRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var _oMailReceiverLabel = new sap.ui.commons.Label({
			text: '{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_MAIL_RECEIVER}',
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oMailReceiverLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [_oMailReceiverLabel],
			vAlign: sap.ui.commons.layout.VAlign.Top
		});
		var oMailReceiverComboBox = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createMailReceiver(_oMailReceiverLabel, bEdit)],
			vAlign: sap.ui.commons.layout.VAlign.Top
		});
		oMailReceiverRow.addCell(oMailReceiverLabel);
		oMailReceiverRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oMailReceiverRow.addCell(oMailReceiverComboBox);

		oRowLayout.addRow(oActionRow);
		oRowLayout.addRow(oTextModuleRow);
		oRowLayout.addRow(oMailReceiverRow);

		this._oActionSettingLayout = oRowLayout;

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oRowLayout]
		}));
		oLayout.addRow(oRow);

		return oLayout;
	},

	_createMailReceiver: function(oReceiverLabel, bEdit) {
		this._oTemplateReceiverLayout = new sap.ui.commons.layout.MatrixLayout();
        var that = this;
		var oController = this.getController();
		var oReceiverList = new sap.m.MultiComboBox({
			visible: bEdit,
			selectionChange: function(oEvent) {
				var oChangedItem = oEvent.getParameter("changedItem");
				var bSelected = oEvent.getParameter("selected");
				var oTokenizer = oEvent.getSource().data("relControl");
				var aReceivers = oChangedItem.getParent().getBinding('items').getContext().getProperty('CampaignNotificationReceiver');
				if (bSelected) {
				    if( oChangedItem.getKey() === "PARTICIPANT" ){
						that._particpantWarningDialog().open();
					}
					oTokenizer.addToken(new sap.m.Token({
						key: oChangedItem.getKey(),
						text: oChangedItem.getText()
					}));
					oController._updateReceiverData(aReceivers, oChangedItem.getKey(), 1);
				} else {
					var oDelToken = oTokenizer.getTokens().filter(function(oToken) {
						return oToken.getKey() === oChangedItem.getKey();
					})[0];
					oTokenizer.removeToken(oDelToken);
					oController._updateReceiverData(aReceivers, oChangedItem.getKey(), 0);
				}
			},
			ariaLabelledBy: oReceiverLabel,
			width: '75%',
			required: true
		});
		oReceiverList.addStyleClass('sapInoCampReceiver');

		var i18n = sap.ui.getCore().getModel('i18n').getResourceBundle();
		oReceiverList.bindItems({
			path: this.getFormatterPath("CampaignNotificationReceiver"),
			template: new sap.ui.core.ListItem({
				text: {
					path: this.getFormatterPath("ROLE_CODE"),
					formatter: function(sCode) {
						return sCode ? i18n.getText('BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_ROLE_' + sCode) : '';
					}
				},
				key: oController.getBoundPath("ROLE_CODE")
			})
		});
		oReceiverList.addStyleClass("sapUiInoSettingsMultiComboBox");
		oReceiverLabel.setLabelFor(oReceiverList);

		var oReceiverTokenizer = new sap.m.Tokenizer();
		oReceiverTokenizer.addStyleClass("sapUiInoCampaignTokenizerWrap");
		oReceiverTokenizer.attachTokenUpdate(function(oEvent) {
			var aRemovedTokens = oEvent.getParameter("removedTokens");
			if (aRemovedTokens.length > 0) {
				var aSelectedItems = oReceiverList.getSelectedItems().filter(function(oItem) {
					return oItem.getKey() !== aRemovedTokens[0].getKey();
				});
				oReceiverList.setSelectedItems(aSelectedItems);
				oReceiverList.fireSelectionFinish({
					selectedItems: aSelectedItems
				});
				var aReceivers = oReceiverList.getBinding('items').getContext().getProperty('CampaignNotificationReceiver');
				oController._updateReceiverData(aReceivers, aRemovedTokens[0].getKey(), 0);
			}
		});
		this._oReceiverTokenizer = oReceiverTokenizer;
		oReceiverList.data("relControl", oReceiverTokenizer);

		this._oReceiverList = oReceiverList;
		setTimeout(this._receiverBindingChange.bind(this), 0, bEdit);

		var oReceiverListRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [
    			new sap.ui.commons.layout.MatrixLayoutCell({
					content: [oReceiverList],
					vAlign: sap.ui.commons.layout.VAlign.Top
				})
            ]
		});

		var oReceiverTokenizerRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [
    			new sap.ui.commons.layout.MatrixLayoutCell({
					content: [oReceiverTokenizer],
					vAlign: sap.ui.commons.layout.VAlign.Top
				})
            ]
		});
		this._oReceiverTokenizerRow = oReceiverTokenizerRow;

		this._oTemplateReceiverLayout.addRow(oReceiverListRow);
		this._oTemplateReceiverLayout.addRow(oReceiverTokenizerRow);

		return this._oTemplateReceiverLayout;
	},

	_updateReceiverListComboBox: function() {
		var oReceiverList = this._oReceiverList;
		if (oReceiverList && oReceiverList.getBinding('items') && oReceiverList.getBinding('items').getContext()) {
			var aReceivers = oReceiverList.getBinding('items').getContext().getProperty('CampaignNotificationReceiver') || [];
			var aSelectedKeys = [];
			for (var i = 0; i < aReceivers.length; i++) {
				if (aReceivers[i].IS_RECEIVE_EMAIL) {
					aSelectedKeys.push(aReceivers[i].ROLE_CODE);
				}
			}
			oReceiverList.setSelectedKeys(aSelectedKeys);
		}
	},

	_receiverBindingChange: function(isEdit) {
		this._oReceiverList.getBinding("items").attachChange(function() {
			this._updateReceiverTokenizer(isEdit);
		}, this);
	},

	_updateReceiverTokenizer: function(isEdit) {
		var oReceiverList = this._oReceiverList;
		var oReceiverTokenizer = this._oReceiverTokenizer;
		if (oReceiverTokenizer && oReceiverList.getBinding('items') && oReceiverList.getBinding('items').getContext()) {
			var i18n = sap.ui.getCore().getModel('i18n').getResourceBundle();
			var aReceivers = oReceiverList.getBinding('items').getContext().getProperty(
				'CampaignNotificationReceiver') || [];
			var aSelectedReceivers = aReceivers.filter(function(oItem) {
				return oItem.IS_RECEIVE_EMAIL === 1;
			});
			aSelectedReceivers.sort(function(a, b){
				if(a.ROLE_CODE < b.ROLE_CODE){
					return -1;
				}
				if(a.ROLE_CODE > b.ROLE_CODE){
					return 1;
				}
				return 0;
			});
			oReceiverTokenizer.destroyTokens();
			oReceiverTokenizer.setTokens(aSelectedReceivers.map(function(oItem) {
				return new sap.m.Token({
					key: oItem.ROLE_CODE,
					text: oItem.ROLE_CODE ? i18n.getText('BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_ROLE_' + oItem.ROLE_CODE) : '',
					editable: isEdit
				});
			}));
		}
	},

	_createStatusModelLayout: function(oLayout) {
		var oView = this;
		var oController = oView.getController();
		this._oStatusModelTable = new sap.ui.table.Table({
			rows: "viewCampNotification>/StatusModel",
			selectionMode: sap.ui.table.SelectionMode.Single,
			visibleRowCount: 5,
			rowSelectionChange: function(oEvent) {
				oController.onStatusModelTableRowSelectionChange(oEvent);
			},
			selectedIndex: {
				path: "viewCampNotification>/StatusModelSelectedIndex"
			},
			columns: [new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_TECHNICAL_NAME}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: "viewCampNotification>CODE",
						formatter: sap.ui.ino.views.backoffice.config.Util.formatPlainCode
					}
				})
			}), new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_PACKAGE}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: "viewCampNotification>PACKAGE_ID",
						formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.campaign.Phase.Root")
					}
				})
			}), new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_NAME}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: "viewCampNotification>DEFAULT_TEXT",
						formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.campaign.Phase.Root")
					}
				})
			})]
		});
		var oPanel = new sap.m.Panel({
			headerText: '{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_USED_STATUS_MODELS}',
			content: [this._oStatusModelTable],
			visible: {
				parts: ['viewCampNotification>/ActionSelectedCode'],
				formatter: function(sCode) {
					return sCode === 'CHANGE_STATUS';
				}
			}
		});
		oPanel.addStyleClass("sapInoCampIntegrationPanel");

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oPanel]
		}));
		oLayout.addRow(oRow);
		return oLayout;
	},

	_createStatusTransitionLayout: function(oLayout, bEdit) {
		this._oStatusTransitionRowLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ["50%", "50%"],
			visible: {
				parts: ['viewCampNotification>/StatusModelSelectedIndex'],
				formatter: function(iIndex) {
					return iIndex > -1;
				}
			}
		});

		var oStatusTransitionRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oStatusTransitionRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createStatusTransitionTable(bEdit)]
		}));
		oStatusTransitionRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createStatusTransitionSetting(bEdit)],
			vAlign: sap.ui.commons.layout.VAlign.Top
		}));
		this._oStatusTransitionRowLayout.addRow(oStatusTransitionRow);

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._oStatusTransitionRowLayout]
		}));
		oLayout.addRow(oRow);
		return oLayout;
	},

	_createStatusTransitionTable: function() {
		var oView = this;
		var oController = oView.getController();
		this._oTransitionTable = new sap.ui.table.Table({
			selectionMode: sap.ui.table.SelectionMode.Single,
			visibleRowCount: 5,
			rowSelectionChange: function(oEvent) {
				oController.onStatusTransitionTableRowSelectionChange(oEvent);
			},
			selectedIndex: {
				path: "viewCampNotification>/TransitionSelectedIndex"
			},
			columns: [new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_CURRENT_STATUS}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: "CURRENT_STATUS_CODE",
						formatter: function(sStatus) {
							return sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.status.Status.Root", sStatus);
						}
					}
				})
			}), new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_STATUS_ACTION}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: "STATUS_ACTION_CODE",
						formatter: function(sAction) {
							return sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.status.Action.Root", sAction);
						}
					}
				})
			}), new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_NEW_STATUS}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: "NEXT_STATUS_CODE",
						formatter: function(sStatus) {
							return sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.status.Status.Root", sStatus);
						}
					}
				})
			})]
		});

		return this._oTransitionTable;
	},

	_createStatusTransitionSetting: function(bEdit) {
		var oController = this.getController();
		var i18n = sap.ui.getCore().getModel('i18n').getResourceBundle();

		// Setting Layout
		var oSettingLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["50%", "20px", "50%"],
			visible: {
				parts: ['viewCampNotification>/AllowMailNotification', this.getFormatterPath('TEXT_MODULE_CODE')],
				formatter: function(bAllowed, sTextModuleCode) {
					return (!!bAllowed && !oController.isInEditMode() && !!sTextModuleCode) || (!!bAllowed && oController.isInEditMode());
				}
			}
		});

		// Setting Layout: Text Module For Mail
		var oTextModuleRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var _oTextModuelLabel = new sap.ui.commons.Label({
			text: '{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_TEXT_MODULE_FOR_MAIL}',
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oTextModuleLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [_oTextModuelLabel],
			vAlign: sap.ui.commons.layout.VAlign.Top
		});
		var oTextModuleDropDown = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this.createDropDownBoxForCode({
				Path: this.getFormatterPath('TEXT_MODULE_CODE'),
				CodeTable: "sap.ino.xs.object.basis.TextModule.Root",
				Editable: bEdit,
				Visible: true,
				WithEmpty: true,
				LabelControl: _oTextModuelLabel,
				Width: "75%",
				onChange: function(oEvent) {
					oController.onStatusTextChange(oEvent);
				}
			}), new sap.ui.commons.TextView({
				text: '{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_TXT_TEXT_MODULE_FOR_MAIL}',
				width: "100%",
				visible: {
					path: '',
					formatter: function() {
						return oController.isInEditMode();
					}
				}
			})],
			vAlign: sap.ui.commons.layout.VAlign.Top
		});
		oTextModuleRow.addCell(oTextModuleLabel);
		oTextModuleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oTextModuleRow.addCell(oTextModuleDropDown);
		oSettingLayout.addRow(oTextModuleRow);

		// Help Text Layout
		var oHelpTextLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ["20px", "100%"],
			visible: {
				parts: ['viewCampNotification>/AllowMailNotification', this.getFormatterPath('TEXT_MODULE_CODE')],
				formatter: function(bAllowed, sTextModuleCode) {
					return !bAllowed || (!!bAllowed && !oController.isInEditMode() && !sTextModuleCode);
				}
			}
		});
		var oHelpTextRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oHelpTextRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [new sap.ui.core.Icon({
				src: 'sap-icon://message-error'
			})],
			vAlign: sap.ui.commons.layout.VAlign.Top
		}));
		oHelpTextRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [new sap.ui.commons.TextView({
				text: {
					parts: ['viewCampNotification>/AllowMailNotification'],
					formatter: function(bAllowed) {
						if (!bAllowed) {
							return i18n.getText('BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_TXT_MAIL_NOT_ALLOWED');
						} else {
							return i18n.getText('BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_TXT_MAIL_NO_TEXT_MODULE_CONFIGURED');
						}
					}
				},
				width: "100%"
			})],
			vAlign: sap.ui.commons.layout.VAlign.Top
		}));
		oHelpTextLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			height: '20px'
		}));
		oHelpTextLayout.addRow(oHelpTextRow);

		// Status Transition Setting Layout
		this._oTransitionSettingLayout = new sap.ui.commons.layout.MatrixLayout({
			visible: {
				parts: ['viewCampNotification>/TransitionSelectedIndex'],
				formatter: function(iIndex) {
					return iIndex > -1;
				}
			}
		});
		var oTransitionSettingHelpTextRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oTransitionSettingHelpTextRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oHelpTextLayout]
		}));
		var oTransitionSettingRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oTransitionSettingRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oSettingLayout]
		}));
		this._oTransitionSettingLayout.addRow(oTransitionSettingHelpTextRow);
		this._oTransitionSettingLayout.addRow(oTransitionSettingRow);
		return this._oTransitionSettingLayout;
	},

	_createPreviewLanguageLayout: function(oLayout, bEdit) {
		var oPreviewLanguageLayout = new sap.ui.commons.layout.MatrixLayout({
			visible: {
				parts: ['viewCampNotification>/ActionSelectedCode', 'viewCampNotification>/TransitionSelectedIndex',
					'viewCampNotification>/AllowMailNotification'],
				formatter: function(sActionCode, iStatusTransitionIndex, bAllowed) {
					return (sActionCode === 'CHANGE_STATUS' && iStatusTransitionIndex > -1 && !!bAllowed) ||
						(sActionCode !== 'CHANGE_STATUS');
				}
			}
		});

		// Language
		var oLanguageRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oLanguageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createLanguageLayout(bEdit)]
		}));
		oPreviewLanguageLayout.addRow(oLanguageRow);

		// Role
		var oRoleRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oRoleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createRoleLayout(bEdit)]
		}));
		oPreviewLanguageLayout.addRow(oRoleRow);

		// Preview
		var oPreviewRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oPreviewRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._createPreviewLayout(bEdit)]
		}));
		oPreviewLanguageLayout.addRow(oPreviewRow);

		this._oPreviewLanguageLayout = oPreviewLanguageLayout;

		var oPreviewLanguageLayoutRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oPreviewLanguageLayoutRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oPreviewLanguageLayout]
		}));
		oLayout.addRow(oPreviewLanguageLayoutRow);
		return oLayout;
	},

	_createLanguageLayout: function() {
		var oController = this.getController();
		var oView = this;
		var oModel = oController.getModel();

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["20%", "20px", "80%"]
		});

		/*
		 * Language
		 */
		var oLanguageTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_LANGUAGE"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oLanguageRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oLanguageLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oLanguageTextView]
		});

		this._oLanguageDropdown = this.createDropDownBoxForCode({
		    Path: 'viewCampNotification>/Language',
			CodeTable: "sap.ino.xs.object.basis.Language.Root",
			Editable: true,
			Visible: true,
			onChange: function(oEvent) {
				oController.onLanguageChange(oEvent);
			},
			onLiveChange: function(oEvent) {
				oController.onLanguageChange(oEvent);
			},
			WithEmpty: false,
			LabelControl: oLanguageTextView,
			Width: "75%"
		});

		oModel.getDataInitializedPromise().done(function() {
			oView._oLanguageDropdown.fireChange({
				newValue: oView._oLanguageDropdown.getSelectedKey()
			});
		});

		var oLanguage = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._oLanguageDropdown]
		});

		oLanguageRow.addCell(oLanguageLabel);
		oLanguageRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oLanguageRow.addCell(oLanguage);
		oLayout.addRow(oLanguageRow);

		this._oLanguageTemplate = oLayout;

		return oLayout;
	},

	getLanguageDropdown: function() {
		return this._oLanguageDropdown;
	},

	_createRoleLayout: function() {
		var oController = this.getController();
		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["20%", "20px", "80%"]
		});

		/*
		 * Role
		 */
		var oRoleTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_GENERAL_FLD_ROLE"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oRoleRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oRoleLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oRoleTextView]
		});

		this._oRoleDropdown = new sap.ui.commons.DropdownBox({
			change: function(oEvent) {
				oController.onRoleChange(oEvent);
			},
			ariaLabelledBy: oRoleTextView
		});

		var i18n = sap.ui.getCore().getModel('i18n').getResourceBundle();
		this._oRoleDropdown.bindItems({
			path: 'viewCampNotification>/Role',
			template: new sap.ui.core.ListItem({
				text: {
					path: "viewCampNotification>ROLE_CODE",
					formatter: function(sCode) {
						return sCode ? i18n.getText('BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_ROLE_' + sCode) : '';
					}
				},
				key: {
					path: "viewCampNotification>ROLE_CODE"
				}
			}),
			parameters: {
				includeEmptyCode: true
			}
		});

		var oRole = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this._oRoleDropdown]
		});

		oRoleRow.addCell(oRoleLabel);
		oRoleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oRoleRow.addCell(oRole);
		oLayout.addRow(oRoleRow);

		this._oRoleTemplate = oLayout;

		return oLayout;
	},

	_createPreviewLayout: function() {
		var oController = this.getController();

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ["20%", "20px", "60%", "20%"]
		});

		// Help Text Row
		var oTemplateHelpTextRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oTemplateHelpTextView = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_CAMPAIGN_FACET_MAIL_TEMPLATE_FLD_TEMPLATE"),
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Right,
			width: "100%"
		});
		var oTemplateHelpTextLabel = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oTemplateHelpTextView],
			vAlign: sap.ui.commons.layout.VAlign.Top
		});
		oTemplateHelpTextRow.addCell(oTemplateHelpTextLabel);
		oTemplateHelpTextRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oTemplateHelpTextRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [new sap.ui.commons.TextView({
				text: '{i18n>BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_TXT_PREVIEW}',
				width: "100%"
			})]
		}));

		// Template Row
		var oTemplateRow = new sap.ui.commons.layout.MatrixLayoutRow();
		this._oTemplateField = new sap.ui.ino.controls.IFrame({
			height: "450px"
		});
		oTemplateHelpTextView.setLabelFor(this._oTemplateField);

		var oTemplate = new sap.ui.commons.layout.MatrixLayoutCell({
			height: "450px",
			content: [this._oTemplateField]
		});

		oTemplateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oTemplateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oTemplateRow.addCell(oTemplate);
		oTemplateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());

		oLayout.addRow(oTemplateHelpTextRow);
		oLayout.addRow(oTemplateRow);

		return oLayout;
	},

	initSupportView: function() {
		var oController = this.getController();
		// 	oController._initialLanguageBinding();
		if (oController._getViewModel().getProperty('/ActionSelectedIndex') > -1) {
			this._updateReceiverListComboBox();
			this._updateReceiverTokenizer(oController.isInEditMode());
		}
	},
	
	_particpantWarningDialog: function() {
		var _oParticpantWarningDialog = new sap.m.Dialog({
			showHeader: true,
			type:'Message',
			state:'Warning',
			content : [new sap.ui.layout.VerticalLayout({
                content : [new sap.ui.commons.TextView({
                    text : '{i18n>BO_CAMPAIGN_NOTIFICATION_SELECT_WARNING}'
                })]
            })],
			buttons: [
				new sap.m.Button({
					text: '{i18n>BO_CAMPAIGN_NOTIFICATION_SELECT_WARNING_OK}',
					press: function() {
						_oParticpantWarningDialog.close();
					}
				})
			]
		});
		return _oParticpantWarningDialog;
	}

}));