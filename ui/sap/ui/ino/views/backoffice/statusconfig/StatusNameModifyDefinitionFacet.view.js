/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.core.ListItem");
jQuery.sap.require("sap.ui.commons.DropdownBox");
jQuery.sap.require("sap.ui.commons.RowRepeater");
jQuery.sap.require("sap.ui.model.Filter");
jQuery.sap.require("sap.ui.model.FilterOperator");
jQuery.sap.require("sap.ui.ino.application.Configuration");

var StatusType = {
	InProcess: "IN_PROCESS",
	New: "NEW",
	Completed: "COMPLETED",
	Discontinued: "DISCONTINUED"
};

sap.ui.jsview("sap.ui.ino.views.backoffice.statusconfig.StatusNameModifyDefinitionFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.statusconfig.StatusNameModifyDefinitionFacet";
	},

	createFacetContent: function(oController) {
		var bEdit = oController.isInEditMode();

		var oGroupGeneral = this.createLayoutGeneral(bEdit);
		return [oGroupGeneral];
	},

	createLayoutGeneral: function(bEdit) {
		var that = this;
		var oStatusNameLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ['200px', '200px', '100px', '40%']
		});

		var oNameLabel = this.createControl({
			Type: "label",
			Text: "BO_STATUS_NAME_FLD_DEFAULT_TEXT",
			Tooltip: "BO_STATUS_NAME_FLD_DEFAULT_TEXT"
		});
		var oNameField = this.createControl({
			Type: "textfield",
			Text: "/DEFAULT_TEXT",
			Editable: bEdit,
			LabelControl: oNameLabel
		});

		var oDescriptionLabel = this.createControl({
			Type: "label",
			Text: "BO_STATUS_NAME_FLD_DEFAULT_LONG_TEXT",
			Tooltip: "BO_STATUS_NAME_FLD_DEFAULT_LONG_TEXT"
		});
		var oDescriptionField = this.createControl({
			Type: "textarea",
			Text: "/DEFAULT_LONG_TEXT",
			Editable: bEdit,
			LabelControl: oDescriptionLabel
		});
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oNameLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oNameField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oDescriptionLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Center,
				rowSpan: 2
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oDescriptionField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin,
				rowSpan: 2
			})]
		});
		oStatusNameLayout.addRow(oRow);

		var oCodeLabel = this.createControl({
			Type: "label",
			Text: "BO_STATUS_NAME_FLD_PLAIN_CODE",
			Tooltip: "BO_STATUS_NAME_FLD_PLAIN_CODE"
		});

		var oCodeField = this.createControl({
			Type: "textfield",
			Text: "/PLAIN_CODE",
			Editable: bEdit,
			LabelControl: oCodeLabel
		});
		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oCodeLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oCodeField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oStatusNameLayout.addRow(oRow);
		var oStatusType = new sap.ui.commons.DropdownBox({
			selectedKey: this.getBoundPath("STATUS_TYPE", true),
			editable: bEdit,
			width: "100%",
			change: function(oEvent) {
				var statustype = this.getSelectedKey();
				if (oEvent.getSource().getModel("oStatusAuthSettingCode").getProperty("/STATUSTYPECHECK")) {
					that._oAuth = that.createStatusAuthLayout(bEdit, statustype);
					FacetContent.removeRow(1);
					FacetContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
						cells: [new sap.ui.commons.layout.MatrixLayoutCell({
							content: that._oAuth
						})]
					}));
				}
				oEvent.getSource().getModel("applicationObject").setProperty("/STATUS_TYPE", statustype);
			}
		});
		oStatusType.addItem(new sap.ui.core.ListItem({
			key: StatusType.InProcess,
			text: "{i18n>BO_STATUS_NAME_TYPE_IN_PROCESS}"
		}));
		oStatusType.addItem(new sap.ui.core.ListItem({
			key: StatusType.New,
			text: "{i18n>BO_STATUS_NAME_TYPE_NEW}"
		}));
		oStatusType.addItem(new sap.ui.core.ListItem({
			key: StatusType.Completed,
			text: "{i18n>BO_STATUS_NAME_TYPE_COMPLETED}"
		}));
		oStatusType.addItem(new sap.ui.core.ListItem({
			key: StatusType.Discontinued,
			text: "{i18n>BO_STATUS_NAME_TYPE_DISCONTINUED}"
		}));

		var FacetContent = new sap.ui.commons.layout.MatrixLayout({
			columns: 1,
			width: '100%'
		});
		//FacetContent.setModel(sGetStatusAuthSettingModel);

		var oStatusCheck = new sap.ui.commons.CheckBox({
			checked: {
				path: "oStatusAuthSettingCode>/STATUSTYPECHECK",
				formatter: function(oCheck) {
					if (oCheck === 1) {
						return true;
					} else {
						return false;
					}
				}
			},
			text: this.getText("BO_STATUS_NAME_FLD_AUTHORIZATION_SETTING_LABEL"),
			editable: bEdit,
			change: function(oEvent) {
				oEvent.getSource().getModel("oStatusAuthSettingCode").setProperty("/STATUSTYPECHECK", Number(oEvent.getParameter("checked")));
				if (!that._oAuth) {
					that._oAuth = that.createStatusAuthLayout(bEdit, oStatusType.getSelectedKey());
					FacetContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
						cells: [new sap.ui.commons.layout.MatrixLayoutCell({
							content: that._oAuth
						})]
					}));
				}
				if (oEvent.getParameter("checked")) {
					that._oAuth = that.createStatusAuthLayout(bEdit, oStatusType.getSelectedKey());
					FacetContent.removeRow(1);
					FacetContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
						cells: [new sap.ui.commons.layout.MatrixLayoutCell({
							content: that._oAuth
						})]
					}));
				}
				that._oAuth.setProperty("visible", oEvent.getParameter("checked"));
				this.getModel("applicationObject").hasPendingChanges = function() {
					return true;
				};
			}

		});
		var oRowStatusType = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_STATUS_NAME_FLD_TYPE",
					LabelControl: oStatusType
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oStatusType,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		var oRowAuthorizationSetting = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oStatusCheck
			})]
		});

		FacetContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oStatusNameLayout
			})]
		}));
		
		var oDesignRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oDesignRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this.createDesignLayout(bEdit)],
			colSpan: 4
		}));
		
		this.oRowStatusType = oRowStatusType;
		this.oRowAuthorizationSetting = oRowAuthorizationSetting;
		this.oDesignRow = oDesignRow;
		this.statusTypeCodeTrans = oStatusType.getSelectedKey();

		this.getController().getModel().getDataInitializedPromise().done(function(oData) {
			if (oData.STATUS_TYPE) {
				var sGetStatusAuthSettingModel = that.setStatusAuthSettingModel(oData.STATUS_TYPE);
				sGetStatusAuthSettingModel = that.getThingInspectorController().setModelOfAuthorizationForStatus(sGetStatusAuthSettingModel);
				oStatusNameLayout.addRow(that.oRowStatusType);
				oStatusNameLayout.addRow(oDesignRow);
				oStatusNameLayout.addRow(that.oRowAuthorizationSetting);
				that.statusTypeCodeTrans = oData.STATUS_TYPE;
				if (sGetStatusAuthSettingModel.getModel("oStatusAuthSettingCode").getProperty("/STATUSTYPECHECK")) {
					that._oAuth = that.createStatusAuthLayout(bEdit, that.statusTypeCodeTrans);
					FacetContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
						cells: [new sap.ui.commons.layout.MatrixLayoutCell({
							content: that._oAuth
						})]
					}));
				}
			}else{
			oStatusNameLayout.addRow(oDesignRow);
			}
		});

		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_STATUS_NAME_GENERAL_INFO_TIT"),
			content: [FacetContent, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	},

	//crate the layout of status authorization
	createStatusAuthLayout: function(bEdit, statusType) {

		var Authcontent = this.createStatusTabStrip([{
			childPath: "BO_STATUS_NAME_FLD_AUTHORIZATION_VOTE_NOTE",
			identifier: "IDEA_VOTE",
			text: "BO_COMMOM_PEOPLE_PRIVILEGE_FOR_VOTE",
			settings: {
				edit: true
			}
                }, {
			childPath: "BO_STATUS_NAME_FLD_AUTHORIZATION_EDIT_NOTE",
			identifier: "IDEA_EDIT",
			text: "FO_COMMON_BUT_EDIT",
			settings: {
				edit: true
			}
                }, {
			childPath: "BO_STATUS_NAME_FLD_AUTHORIZATION_COMMENT_NOTE",
			identifier: "IDEA_COMMENT",
			text: "CTRL_EVALUATIONCRITERIA_FLD_COMMENT",
			settings: {
				edit: true
			}
                }, {
			childPath: "BO_STATUS_NAME_FLD_AUTHORIZATION_EVALUATION_NOTE",
			identifier: "IDEA_EVALUATION",
			text: "BO_STATUS_NAME_ROLE_EVALUATION",
			settings: {
				edit: true
			}
                }, {
			childPath: "BO_STATUS_NAME_FLD_AUTHORIZATION_DELETE_NOTE",
			identifier: "IDEA_DELETE",
			text: "FO_COMMON_BUT_DELETE",
			settings: {
				edit: true
			}
                }], statusType);

		return Authcontent;
	},

	//tabs in the status authorization
	createStatusTabStrip: function(aTabs, statusType) {

		var oController = this.getController();
		var bEdit = oController.isInEditMode();

		var oView = this;
		this.__oTabStrip = new sap.ui.commons.TabStrip({
			width: "100%"
		}).addStyleClass("sapUiInoPeopleTabStrip");

		jQuery.each(aTabs, function(iIndex, oTab) {
			oTab.settings = oTab.settings || {};
			oTab.settings.edit = bEdit && oTab.settings.edit;
			oView.__oTabStrip.createTab(oController.getTextModel().getText(oTab.text), oView.__createIdentityLayout(oTab.childPath, oTab.identifier,
				oTab.settings, statusType));
		});

		this.__oTabStrip.attachSelect(oController.__handleTabSelection, oController);

		if (this.getThingInspectorController().__iCurrentSelectedTab) {
			oController.__reSelectTab(this.getThingInspectorController().__iCurrentSelectedTab);
		} else {
			this.getThingInspectorController().__iCurrentSelectedTab = this.__oTabStrip.getSelectedIndex();
		}

		return this.__oTabStrip;
	},

	createDesignLayout: function(bEdit) {
		var oController = this.getController();

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ["185px", "5px", "60%"]
			// 15px due to the color picker
		});

		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			height: "20px"
		}));

		var oColorRow = new sap.ui.commons.layout.MatrixLayoutRow();

		var oColorLabel = new sap.ui.commons.Label({
			text: oController.getTextModel().getText("BO_STATUS_NAME_FLD_COLOR"),
			textAlign: sap.ui.core.TextAlign.Left,
			width: "100%"
		});

		var oColorLabelCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oColorLabel]
		});

		var oColorPickerCell = new sap.ui.commons.layout.MatrixLayoutCell();

		if (bEdit) {
			this.getThingInspectorController().getModel().getDataInitializedPromise().done(function() {
				var sColor = oController.getModel().oData["COLOR_CODE"];

				if (sColor) {
					sColor = "#" + sColor;
				} else {
					sColor = "#333333";
				}

				var oColor = new sap.ui.commons.ColorPicker({
					colorString: sColor
				});
				oColor.addStyleClass("sapUiInoStatusColorPicker");
				oColor.attachLiveChange(oController._handleColorPickerLiveChange, oController);

				oColorPickerCell.addContent(oColor);
				oColorLabel.setLabelFor(oColor);
			});
		} else {
			var oColor = new sap.ui.core.HTML({
				content: {
					path: this.getFormatterPath("COLOR_CODE", true),
					formatter: function(sColor) {
						if (!sColor) {
							sColor = "333333";
						}
						sColor = "#" + sColor;
						return "<div class='sapUiInoStatusColorSample' style='background-color: " + sColor + ";'>&nbsp;</div>";
					}
				},
				sanitizeContent: true
			});
			oColorPickerCell.addStyleClass("sapUiInoStatusColorSampleContainer");
			oColorPickerCell.addContent(oColor);
			oColorLabel.setLabelFor(oColor);
		}

		oColorRow.addCell(oColorLabelCell);
		oColorRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
		oColorRow.addCell(oColorPickerCell);
		oLayout.addRow(oColorRow);

		return oLayout;
	},

	setStatusActionRoleModel: function(checkSetting, statusType) {
		//ajax for status action role code
		var xsoData = "/sap/ino/xs/rest/backoffice/odata.xsodata";
		var statusRoleCode = {};
		var statusCheckCode;
		var that = this;
		var oObjectData = jQuery.ajax({
			url: sap.ui.ino.application.Configuration.getBackendRootURL() + xsoData + "/StatusActionRoleCode",
			type: "GET",
			dataType: "json",
			async: false

		});
		oObjectData.done(function(oResponse) {
			statusRoleCode = oResponse.d.results;
		});
		//ajax for check code
		var statusId = that.getThingInspectorController().getModel().getPropertyModel().key;
		if (typeof(statusId) === "number") {
			var oStatusCheckData = jQuery.ajax({
				url: sap.ui.ino.application.Configuration.getBackendRootURL() + xsoData + "/StatusAuthorization?$filter=ID_OF_STATUS_STAGE eq " +
					statusId,
				type: "GET",
				dataType: "json",
				async: false

			});
			oStatusCheckData.done(function(oResponse) {
				statusCheckCode = oResponse.d.results;

			});
		}

		for (var i = 0; i < statusRoleCode.length; i++) {
			statusRoleCode[i].CHECK = true;
			if (statusCheckCode && statusCheckCode.length > 0) {
				for (var j = 0; j < statusCheckCode.length; j++) {
					if (statusCheckCode[j].ACTION_CODE === statusRoleCode[i].ACTION_CODE && statusCheckCode[j].ROLE_CODE === statusRoleCode[i].ROLE_CODE &&
						statusCheckCode[j].CAN_DO_ACTION === 0 && statusRoleCode[i].STATUS_TYPE === statusType) {
						statusRoleCode[i].CHECK = false;
						break;
					}
					if ((statusType !== "COMPLETED" || checkSetting === 0) && statusRoleCode[i].STATUS_TYPE === "COMPLETED" && (statusRoleCode[i].ACTION_CODE ===
						"IDEA_VOTE" || statusRoleCode[i].ACTION_CODE === "IDEA_DELETE")) {
						statusRoleCode[i].CHECK = false;
					} else if (statusRoleCode[i].STATUS_TYPE === "DISCONTINUED" && statusRoleCode[i].ROLE_CODE === "IDEA_SUBMITTER" && statusRoleCode[i]
						.ACTION_CODE === "IDEA_EDIT") {
						statusRoleCode[i].CHECK = false;
					} else if (statusRoleCode[i].STATUS_TYPE === "COMPLETED" && statusRoleCode[i].ROLE_CODE === "IDEA_SUBMITTER" && statusRoleCode[i].ACTION_CODE ===
						"IDEA_EDIT") {
						statusRoleCode[i].CHECK = false;
					} else if (statusRoleCode[i].STATUS_TYPE === "COMPLETED" && statusRoleCode[i].ROLE_CODE === "IDEA_SUBMITTER" && statusRoleCode[i].ACTION_CODE ===
						"IDEA_DELETE") {
						statusRoleCode[i].CHECK = false;
					}
				}
			} else {
				if (statusRoleCode[i].STATUS_TYPE === "COMPLETED") {
					if (statusRoleCode[i].ACTION_CODE === "IDEA_VOTE" || statusRoleCode[i].ACTION_CODE === "IDEA_DELETE") {
						statusRoleCode[i].CHECK = false;
					} else if (statusRoleCode[i].ROLE_CODE === "IDEA_SUBMITTER" && statusRoleCode[i].ACTION_CODE === "IDEA_EDIT") {
						statusRoleCode[i].CHECK = false;
					}
				} else if (statusRoleCode[i].STATUS_TYPE === "DISCONTINUED" && statusRoleCode[i].ROLE_CODE === "IDEA_SUBMITTER" && statusRoleCode[i].ACTION_CODE ===
					"IDEA_EDIT") {
					statusRoleCode[i].CHECK = false;
				}
			}
		}
		//	var oStatusActionRoleCodeModel = new sap.ui.model.json.JSONModel(statusRoleCode);
		return statusRoleCode;
	},

	setStatusAuthSettingModel: function(statusType) {
		var xsoData = "/sap/ino/xs/rest/backoffice/odata.xsodata";
		var statusRoleCode = {};
		var statusId = this.getThingInspectorController().getModel().getPropertyModel().key;
		if (typeof(statusId) !== "number") {
			statusRoleCode.STATUSTYPECHECK = 0;
			statusRoleCode.ID = -1;
			statusRoleCode.ID_OF_STATUS_STAGE = -1;
			statusRoleCode.AuthorizationForStatus = [];
			statusRoleCode.AuthorizationForStatus = this.setStatusActionRoleModel(statusRoleCode.STATUSTYPECHECK, statusType);
			var oStatusAuthSettingModel = new sap.ui.model.json.JSONModel(statusRoleCode);
			return oStatusAuthSettingModel;
		}

		var oStatusTypeCheckBoxData = jQuery.ajax({
			url: sap.ui.ino.application.Configuration.getBackendRootURL() + xsoData + "/StatusAuthorizationStage(" + statusId + ")",
			type: "GET",
			dataType: "json",
			async: false

		});
		oStatusTypeCheckBoxData.done(function(oResponse) {
			if (oResponse) {
				statusRoleCode.STATUSTYPECHECK = oResponse.d.VALUE;
				statusRoleCode.ID = oResponse.d.ID;
				statusRoleCode.ID_OF_STATUS_STAGE = oResponse.d.ID_OF_STATUS_STAGE;
			}

		});
		oStatusTypeCheckBoxData.error(function(oResponse) {
			statusRoleCode.STATUSTYPECHECK = 0;
			statusRoleCode.ID = -1;
			statusRoleCode.ID_OF_STATUS_STAGE = statusId;
		});
		statusRoleCode.AuthorizationForStatus = [];
		statusRoleCode.AuthorizationForStatus = this.setStatusActionRoleModel(statusRoleCode.STATUSTYPECHECK, statusType);
		var oStatusAuthSettingModel = new sap.ui.model.json.JSONModel(statusRoleCode);
		return oStatusAuthSettingModel;
	},

	//temp in tabs; dropdownbox,add button,role temp... 
	__createIdentityLayout: function(sChildpath, sIdentifier, oSettings, statusType) {
		var Authcontent = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['30%', '20%']
		});
		var that = this;
		//Note Row
		var identityNoteText = new sap.ui.commons.Label({
			text: this.getText(sChildpath)
		});
		var identityNoteRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: identityNoteText
			})]
		});
		Authcontent.addRow(identityNoteRow);

		//Roles temp
		var rolesRepeater = new sap.ui.commons.RowRepeater({
			numberOfRows: 10
		});
		var oStatusRolesTemplate = new sap.ui.commons.layout.MatrixLayout({
			widths: ["30%", "20%"],
			columns: 2
		});
		var StatusLabel = new sap.ui.commons.Label({
			text: {
				parts: [{
						path: "oStatusAuthSettingCode>ACTION_CODE"
					},
					{
						path: "oStatusAuthSettingCode>ROLE_CODE"
					}],
				formatter: function(action, role) {
					if (action === sIdentifier) {
						var roleCode;
						switch (role) {
							case "IDEA_SUBMITTER":
								roleCode = that.getText("BO_STATUS_NAME_FLD_AUTHORIZATION_AUTHOR");
								break;
							case "CAMPAIGN_EXPERT":
								roleCode = that.getText("BO_STATUS_NAME_FLD_AUTHORIZATION_EXPERT");
								break;
							case "CAMPAIGN_MANAGER":
								roleCode = that.getText("BO_STATUS_NAME_FLD_AUTHORIZATION_MANAGER");
								break;
							case "CAMPAIGN_COACH":
								roleCode = that.getText("BO_STATUS_NAME_FLD_AUTHORIZATION_COACH");
								break;
							case "CAMPAIGN_USER":
								roleCode = that.getText("BO_STATUS_NAME_FLD_AUTHORIZATION_PARTICIPANT");
								break;
							default:
								roleCode = "";
						}
						return roleCode;
					}
				}
			},
			design: sap.ui.commons.LabelDesign.Bold
		});

		var oStatusCheckBox = new sap.ui.commons.CheckBox({
			checked: {
				path: "oStatusAuthSettingCode>CHECK"
			},
			editable: oSettings.edit,
			change: function() {
				this.getModel("applicationObject").hasPendingChanges = function() {
					return true;
				};
			}
		});
		var oStatusRoleTempRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: StatusLabel
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: oStatusCheckBox
				})
		        ]
		});
		oStatusRolesTemplate.addRow(oStatusRoleTempRow);
		rolesRepeater.bindRows({
			path: 'oStatusAuthSettingCode>/AuthorizationForStatus',
			template: oStatusRolesTemplate,
			sorter: new sap.ui.model.Sorter("ROLE_CODE", true),
			filters: new sap.ui.model.Filter({
				filters: [new sap.ui.model.Filter({
					path: "ACTION_CODE",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: sIdentifier
				}), new sap.ui.model.Filter({
					path: "STATUS_TYPE",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: statusType
				}), new sap.ui.model.Filter({
					filters: [new sap.ui.model.Filter({
						path: "ACTION_CODE",
						operator: sap.ui.model.FilterOperator.NE,
						value1: "IDEA_EDIT"
					}), new sap.ui.model.Filter({
						path: "ROLE_CODE",
						operator: sap.ui.model.FilterOperator.NE,
						value1: "IDEA_SUBMITTER"
					}), new sap.ui.model.Filter({
						path: "STATUS_TYPE",
						operator: sap.ui.model.FilterOperator.NE,
						value1: 'DISCONTINUED'
					})],
					and: false
				}), new sap.ui.model.Filter({
					filters: [new sap.ui.model.Filter({
						path: "ACTION_CODE",
						operator: sap.ui.model.FilterOperator.NE,
						value1: "IDEA_DELETE"
					}), new sap.ui.model.Filter({
						path: "ROLE_CODE",
						operator: sap.ui.model.FilterOperator.NE,
						value1: "IDEA_SUBMITTER"
					}), new sap.ui.model.Filter({
						path: "STATUS_TYPE",
						operator: sap.ui.model.FilterOperator.NE,
						value1: 'COMPLETED'
					})],
					and: false
				}), new sap.ui.model.Filter({
					filters: [new sap.ui.model.Filter({
						path: "ACTION_CODE",
						operator: sap.ui.model.FilterOperator.NE,
						value1: "IDEA_EDIT"
					}), new sap.ui.model.Filter({
						path: "ROLE_CODE",
						operator: sap.ui.model.FilterOperator.NE,
						value1: "IDEA_SUBMITTER"
					}), new sap.ui.model.Filter({
						path: "STATUS_TYPE",
						operator: sap.ui.model.FilterOperator.NE,
						value1: 'COMPLETED'
					})],
					and: false
				})],
				and: true
			})

		});

		var statusAuthTempRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: rolesRepeater
			})]
		});
		Authcontent.addRow(statusAuthTempRow);
		return Authcontent;
	}

}));