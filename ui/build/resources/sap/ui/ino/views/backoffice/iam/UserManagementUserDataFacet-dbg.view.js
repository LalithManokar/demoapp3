/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.views.common.ObjectInstanceSelection");
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOView");
jQuery.sap.require("sap.ui.ino.controls.AutoComplete");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.object.Group");
jQuery.sap.require("sap.ui.ino.models.object.User");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.application.Configuration");
var Configuration = sap.ui.ino.application.Configuration;

sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserManagementUserDataFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.iam.UserManagementUserDataFacet";
	},

	exit: function() {
		sap.ui.getCore().getModel().detachRequestCompleted(this._updateRoleButtons, this);
	},

	init: function() {
		sap.ui.getCore().getModel().attachRequestCompleted(this._updateRoleButtons, this);
	},

	createFacetContent: function() {
		var bEdit = this.getController().isInEditMode();

		return [this.createBasicDataThingGroup(bEdit),
		this.createContactThingGroup(bEdit),
		this.createDepartmentThingGroup(bEdit),
		this.createRolesThingGroup(bEdit && this._hasAdminPrivilege()),
		this.createGroupsThingGroup(bEdit && this._hasAdminPrivilege())];
	},

	createBasicDataThingGroup: function(bEdit) {
		var oContent = new sap.ui.commons.layout.MatrixLayout({
			width: "100%",
			columns: 5,
			widths: ['100px', '50%', '50px', '100px', '50%']
		});
		var oController = this.getController();

		this.oUserNameText = bEdit && this.getController().getModel().isNew() ? this.createControl({
			Type: "textfield",
			Text: "/USER_NAME"
		}) : this.createControl({
			Type: "textview",
			Text: "/USER_NAME"
		});
		this.oFirstNameText = bEdit ? this.createControl({
			Type: "textfield",
			Text: "/FIRST_NAME",
			onChange: oController.handleFullNameChange
		}) : this.createControl({
			Type: "textview",
			Text: "/FIRST_NAME"
		});
		this.oLastNameText = bEdit ? this.createControl({
			Type: "textfield",
			Text: "/LAST_NAME",
			onChange: oController.handleFullNameChange
		}) : this.createControl({
			Type: "textview",
			Text: "/LAST_NAME"
		});
		this.oFullNameText = bEdit ? this.createControl({
			Type: "textfield",
			Text: "/NAME"
		})  : this.createControl({
			Type: "textview",
			Text: "/NAME"
		});
		this.oCountryText = bEdit ? this.createControl({
			Type: "textfield",
			Text: "/COUNTRY"
		}) : this.createControl({
			Type: "textview",
			Text: "/COUNTRY"
		});
		this.oStreetText = bEdit ? this.createControl({
			Type: "textfield",
			Text: "/STREET"
		}) : this.createControl({
			Type: "textview",
			Text: "/STREET"
		});
		this.oCityText = bEdit ? this.createControl({
			Type: "textfield",
			Text: "/CITY"
		}) : this.createControl({
			Type: "textview",
			Text: "/CITY"
		});		this.oExternalCheckBox = this.createControl({
			Type: "checkbox",
			Text: "/IS_EXTERNAL",
			Tooltip: "BO_IDENT_EXP_EXTERNAL",
			Editable: (bEdit === false || !this._hasAdminPrivilege()) ? false : {
				Property: "changeable"
			}
		});
		this.oPostalCodeText = bEdit ? this.createControl({
			Type: "textfield",
			Text: "/ZIP_CODE"
		}) : this.createControl({
			Type: "textview",
			Text: "/ZIP_CODE"
		});
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_IDENT_FLD_USER_NAME",
						LabelControl: this.oUserNameText
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oUserNameText
				}), new sap.ui.commons.layout.MatrixLayoutCell(),
				new sap.ui.commons.layout.MatrixLayoutCell(), 
				new sap.ui.commons.layout.MatrixLayoutCell()]
		});
		oContent.addRow(oRow);
		
		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_IDENT_FLD_FIRST_NAME",
						LabelControl: this.oFirstNameText
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oFirstNameText
				}), new sap.ui.commons.layout.MatrixLayoutCell(),
				new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_IDENT_FLD_LAST_NAME",
						LabelControl: this.oLastNameText
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oLastNameText
				})]
		});
		oContent.addRow(oRow);
		
		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_IDENT_FLD_FULL_NAME",
						LabelControl: this.oFullNameText
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oFullNameText
				}), new sap.ui.commons.layout.MatrixLayoutCell(),
				new sap.ui.commons.layout.MatrixLayoutCell(), 
				new sap.ui.commons.layout.MatrixLayoutCell()]
		});
		oContent.addRow(oRow);

		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_IDENT_FLD_COUNTRY",
						LabelControl: this.oCountryText
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oCountryText
				}), new sap.ui.commons.layout.MatrixLayoutCell(),
			 new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_IDENT_FLD_CITY",
						LabelControl: this.oCityTextText
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oCityText
				})]
		});
		oContent.addRow(oRow);

		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_IDENT_FLD_STREET",
						LabelControl: this.oStreetText
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oStreetText
				}), new sap.ui.commons.layout.MatrixLayoutCell(),
			    new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_IDENT_FLD_POSTAL_CODE",
						LabelControl: this.oPostalCodeText
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oPostalCodeText
				})]
		});
		oContent.addRow(oRow);
		var oStartDateField = null;

		if (bEdit) {
			oStartDateField = new sap.ui.commons.DatePicker({
				value: {
					path: this.getFormatterPath("VALIDATION_TO", true),
					type: new sap.ui.model.type.Date({
						style: "medium"
					})
				},
				width: '100%'
			});

			oStartDateField.attachChange(function(oEvent) {
				if (oEvent.getParameter("invalidValue")) {
					oEvent.oSource.setValueState(sap.ui.core.ValueState.Error);
				}
			});
		} else {
			oStartDateField = new sap.ui.commons.TextView({
				text: {
					path: this.getFormatterPath("VALIDATION_TO", true),
					type: new sap.ui.model.type.Date({
						style: "medium"
					})
				}
			});
		}
		this.oValidationTo = oStartDateField;

		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_IDENT_FLD_VALIDATIONTO",
					LabelControl: this.oValidationTo
				})
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oValidationTo
			}),new sap.ui.commons.layout.MatrixLayoutCell(),
			new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_IDENT_FLD_EXTERNAL",
						LabelControl: this.oExternalCheckBox
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oExternalCheckBox
				})]
		});
		oContent.addRow(oRow);

		oContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: new sap.ui.commons.layout.MatrixLayoutCell({
				content: [new sap.ui.core.HTML({
					content: "<br/>",
					sanitizeContent: true
				})],
				colSpan: 5
			})
		}));

		return new sap.ui.ux3.ThingGroup({
			title: "{i18n>BO_IDENT_GRP_DETAIL_PERSON}",
			content: oContent,
			colspan: true
		});
	},

	createContactThingGroup: function(bEdit) {
		var oContent = new sap.ui.commons.layout.MatrixLayout({
			width: "100%",
			columns: 5,
			widths: ['100px', '50%', '50px', '100px', '50%']
		});
		var oController = this.getController();

		var oMailLink = bEdit ? this.createControl({
			Type: "textfield",
			Text: "/EMAIL"
		}) : new sap.ui.commons.Link({
			text: oController.getBoundPath("EMAIL", true),
			href: {
				path: oController.getFormatterPath("EMAIL", true),
				formatter: function(sVal) {
					return "mailto:" + sVal;
				},
				type: null
			},
			wrapping: false,
			width: "160px"
		});

		var oPhoneLink = bEdit ? this.createControl({
			Type: "textfield",
			Text: "/PHONE"
		}) : new sap.ui.commons.Link({
			text: oController.getBoundPath("PHONE", true),
			href: {
				path: oController.getFormatterPath("PHONE", true),
				formatter: function(sVal) {
					return "tel:" + sVal;
				},
				type: null
			},
			target: "_blank",
			wrapping: false,
			width: "160px"
		});

		var oMobileLink = bEdit ? this.createControl({
			Type: "textfield",
			Text: "/MOBILE"
		}) : new sap.ui.commons.Link({
			text: oController.getBoundPath("MOBILE", true),
			href: {
				path: oController.getFormatterPath("MOBILE", true),
				formatter: function(sVal) {
					return "tel:" + sVal;
				},
				type: null
			},
			target: "_blank",
			wrapping: false,
			width: "160px"
		});

		oContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_IDENT_FLD_PHONE",
						LabelControl: oPhoneLink
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: oPhoneLink
				}), new sap.ui.commons.layout.MatrixLayoutCell()
			, new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_IDENT_FLD_MOBILE",
						LabelControl: oMobileLink
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: oMobileLink
				})]
		}));
		oContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_IDENT_FLD_EMAIL",
					LabelControl: oMailLink
				})
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oMailLink
			})]
		}));
		oContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: new sap.ui.commons.layout.MatrixLayoutCell({
				content: [new sap.ui.core.HTML({
					content: "<br/>",
					sanitizeContent: true
				})],
				colSpan: 5
			})
		}));

		return new sap.ui.ux3.ThingGroup({
			title: "{i18n>BO_IDENT_GRP_HEADER_CONTACT}",
			content: oContent,
			colspan: true
		});
	},

	createDepartmentThingGroup: function(bEdit) {
		var oContent = new sap.ui.commons.layout.MatrixLayout({
			width: "100%",
			columns: 5,
			widths: ['100px', '50%', '50px', '100px', '50%']
		});
		var oController = this.getController();

		var oCostCenter = bEdit ? this.createControl({
			Type: "textfield",
			Text: "/COST_CENTER"
		}) : new sap.ui.commons.TextView({
			text: oController.getBoundPath("COST_CENTER", true),
			wrapping: false,
			width: "160px"
		});

		var oOrganization = bEdit ? this.createControl({
			Type: "textfield",
			Text: "/ORGANIZATION"
		}) : new sap.ui.commons.TextView({
			text: oController.getBoundPath("ORGANIZATION", true),
			wrapping: false,
			width: "160px"
		});

		var oCompany = bEdit ? this.createControl({
			Type: "textfield",
			Text: "/COMPANY"
		}) : new sap.ui.commons.TextView({
			text: oController.getBoundPath("COMPANY", true),
			wrapping: false,
			width: "160px"
		});

		var oOffice = bEdit ? this.createControl({
			Type: "textfield",
			Text: "/OFFICE"
		}) : new sap.ui.commons.TextView({
			text: oController.getBoundPath("OFFICE", true),
			wrapping: false,
			width: "160px"
		});

		oContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_IDENT_FLD_COSTCENTER",
						LabelControl: oCostCenter
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: oCostCenter
				}), new sap.ui.commons.layout.MatrixLayoutCell(),
			 new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_IDENT_FLD_ORGANIZATION",
						LabelControl: oOrganization
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: oOrganization
				})]
		}));
		oContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_IDENT_FLD_COMPANY",
						LabelControl: oCompany
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: oCompany
				}), new sap.ui.commons.layout.MatrixLayoutCell(),
			 new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_IDENT_FLD_OFFICE",
						LabelControl: oOffice
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: oOffice
				})]
		}));
		oContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: new sap.ui.commons.layout.MatrixLayoutCell({
				content: [new sap.ui.core.HTML({
					content: "<br/>",
					sanitizeContent: true
				})],
				colSpan: 5
			})
		}));

		return new sap.ui.ux3.ThingGroup({
			title: "{i18n>BO_IDENT_GRP_HEADER_DEPARTMENT}",
			content: oContent,
			colspan: true
		});
	},

	createRolesThingGroup: function(bEdit) {
		var oController = this.getController();
		var that = this;

		this.oTableRoles = new sap.ui.table.Table({
			visibleRowCount: 5,
			selectionMode: sap.ui.table.SelectionMode.Single,
			rowSelectionChange: [oController.onRolesTableSelectionChange, oController]
		});

		if (bEdit) {
			var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();

			this.oAddRoleButton = new sap.ui.commons.MenuButton({
				itemSelected: [oController.addRole, oController],
				lite: false,
				text: "{i18n>BO_IDENT_BUT_ROLE_ADD}",
				tooltip: "{i18n>BO_IDENT_EXP_ROLE_ADD}",
				enabled: false
			});

			var fnRoleAfterRendering = this.oAddRoleButton.onAfterRendering;
			this.oAddRoleButton.onAfterRendering = function() {
				if (fnRoleAfterRendering) {
					fnRoleAfterRendering.apply(that.oAddRoleButton, arguments);
				}
				that.oAddRoleButton.$().attr("aria-label", i18n.getText("BO_IDENT_BUT_ROLE_ADD"));
			};

			var oRolesMenu = new sap.ui.commons.Menu({
				items: {
					path: "/StaticRoles",
					template: new sap.ui.commons.MenuItem({
						customData: [new sap.ui.core.CustomData({
							key: "ROLE_CODE",
							value: "{ROLE_CODE}"
						})],
						text: {
							path: "ROLE_CODE",
							formatter: function(sRoleCode) {
								return oController.getTextModel().getText("BO_IDENT_MIT_ROLE_" + sRoleCode);
							}
						}
					}),
					filters: [new sap.ui.model.Filter("ROLE_CODE", "EQ", sap.ui.ino.models.object.User.StaticRoles.InnovationManager)]
				}
			});

			this.oAddRoleButton.setMenu(oRolesMenu);

			this.oRemoveRoleButton = new sap.ui.commons.Button({
				press: [oController.removeRole, oController],
				text: "{i18n>BO_IDENT_BUT_ROLE_REMOVE}",
				tooltip: "{i18n>BO_IDENT_EXP_ROLE_REMOVE}",
				lite: false,
				enabled: false
			});

			this.oTableRoles.setToolbar(new sap.ui.commons.Toolbar({
				items: [this.oAddRoleButton, this.oRemoveRoleButton]
			}));
		}

		this.oTableRoles.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_IDENT_ROW_ROLE_NAME}"
			}),
			template: new sap.ui.commons.TextView({
				text: {
					path: oController.getFormatterPath("ROLE_CODE"),
					type: new sap.ui.model.type.String(),
					formatter: function(sRoleCode) {
						if (sRoleCode) {
							return oController.getTextModel().getText("BO_IDENT_MIT_ROLE_" + sRoleCode);
						} else {
							return "";
						}
					}
				}
			}),
			width: "25%"
		}));
		this.oTableRoles.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_IDENT_ROW_DESCRIPTION}"
			}),
			template: new sap.ui.commons.TextView({
				text: {
					path: oController.getFormatterPath("ROLE_CODE"),
					type: new sap.ui.model.type.String(),
					formatter: function(sRoleCode) {
						if (sRoleCode) {
							return oController.getTextModel().getText("BO_IDENT_MIT_DESCRIPTION_ROLE_" + sRoleCode);
						} else {
							return "";
						}
					}
				}
			}),
			width: "50%",
		}));

		this.oTableRoles.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_IDENT_ROW_ROLE_NAME_TECH}"
			}),
			template: new sap.ui.commons.TextView({
				text: {
					path: oController.getFormatterPath("TECHNICAL_ROLE_CODE"),
					type: new sap.ui.model.type.String()
				}
			}),
			width: "25%",
			sortProperty: "TECHNICAL_ROLE_CODE",
			filterProperty: "TECHNICAL_ROLE_CODE"
		}));

		this.oTableRoles.bindRows({
			path: this.getFormatterPath("/Roles")
		});

		return new sap.ui.ux3.ThingGroup({
			title: "{i18n>BO_IDENT_GRP_DETAIL_ROLES}",
			content: [this.oTableRoles, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	},

	createGroupsThingGroup: function(bEdit) {
		var oController = this.getController();

		this.oTableGroups = new sap.ui.table.Table({
			selectionMode: sap.ui.table.SelectionMode.Single,
			visibleRowCount: 5,
			rowSelectionChange: function(oEvent) {
				oController.setGroupsButtonState(oEvent.getSource().getSelectedIndex() > -1);
			}
		});

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			width: "100%",
			columns: 2
		});

		if (bEdit) {
			var oAddIdentityTextField = new sap.ui.ino.controls.AutoComplete({
				placeholder: "{i18n>BO_IDENT_FLD_ADD_MEMBER_PLACEHOLDER}",
				maxPopupItems: 10,
				displaySecondaryValues: true,
				suggest: function(oEvent) {
					var sValue = oEvent.getParameter("suggestValue");
					var oListTemplate = new sap.ui.core.ListItem({
						text: "{NAME}",
						additionalText: "{DESCRIPTION}",
						key: "{ID}"
					});
					oEvent.getSource().bindAggregation("items", {
						path: sap.ui.ino.views.common.ObjectInstanceSelection["sap.ino.xs.object.iam.Identity"].createSearchPath(sValue),
						// TODO:: GROUP is escaped as temporary workaround for missing type in metadata for TYPE_CODE
						filters: [new sap.ui.model.Filter("TYPE_CODE", "EQ", "GROUP")],
						template: oListTemplate,
						parameters: sap.ui.ino.views.common.ObjectInstanceSelection["sap.ino.xs.object.iam.Identity"].parameters
					});
				},
				confirm: function() {
					oController.addGroup(this);
				}
			});

			oAddIdentityTextField.setFilterFunction(function(sValue, oItem) {
				var bEquals = (oItem.getText().toLowerCase().indexOf(sValue.toLowerCase()) !== -1) || (oItem.getAdditionalText().toLowerCase().indexOf(
					sValue.toLowerCase()) !== -1);
				var oModel = oController.getModel();
				var aIdentities = oModel.getProperty("/MemberOf");
				var sSelf = oModel.getProperty("/NAME");
				var bSelf = (oItem.getText().toLowerCase().indexOf(sSelf.toLowerCase()) === 0) && oItem.getText().length == sSelf.length;

				var fnFindIdentity = function(array, id) {
					return jQuery.grep(array, function(object, idx) {
						return object.GROUP_ID == id;
					});
				};

				return bEquals && (fnFindIdentity(aIdentities, oItem.getKey()).length == 0) && !bSelf;
			});

			this.oAddGroupButton = new sap.ui.commons.Button({
				layoutData: new sap.ui.commons.form.GridElementData({
					hCells: "1"
				}),
				text: "{i18n>BO_IDENT_BUT_GROUP_ADD}",
				press: function() {
					oController.addGroup(oAddIdentityTextField);
				}
			});

			this.oAddGroupFromClipboardButton = new sap.ui.commons.Button({
				layoutData: new sap.ui.commons.form.GridElementData({
					hCells: "1"
				}),
				text: "{i18n>BO_COMMON_BUT_ADD_FROM_CLIPBOARD}",
				press: function() {
					oController.addGroupFromClipboard();
				},
				enabled: {
					path: "clipboard>/changed",
					// bIsEmpty is never read, but used to get notified upon model updates
					formatter: function(bIsEmpty) {
						var bEmpty = sap.ui.ino.models.core.ClipboardModel.sharedInstance().isClipboardEmpty(sap.ui.ino.models.object.Group);
						return !bEmpty;
					}
				},
			});

			this.oRemoveGroupButton = new sap.ui.commons.Button({
				press: [oController.removeGroup, oController],
				text: "{i18n>BO_IDENT_BUT_GROUP_REMOVE}",
				tooltip: "{i18n>BO_IDENT_EXP_GROUP_REMOVE}",
				lite: false,
				enabled: false
			});

			this.oTableGroups.setToolbar(new sap.ui.commons.Toolbar({
				items: [oAddIdentityTextField, this.oAddGroupButton, this.oAddGroupFromClipboardButton, this.oRemoveGroupButton]
			}));
		}

		var oClipboardColumn = sap.ui.ino.application.backoffice.ControlFactory.createClipboardColumn(undefined, sap.ui.ino.models.object.Group,
			"GROUP_ID", oController.getModelName());
		oClipboardColumn.setWidth("36px");
		oClipboardColumn.getLabel().addStyleClass("sapUiInoClipboardColumn");
		this.oTableGroups.addColumn(oClipboardColumn);

		this.oTableGroups.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_IDENT_ROW_GROUP_NAME}"
			}),
			template: new sap.ui.commons.Link({
				text: oController.getBoundPath("GROUP_NAME"),
				press: function(oControlEvent) {
					var iId = oControlEvent.getSource().getBindingInfo("text").binding.getContext().getProperty("GROUP_ID");
					sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow("group", {
						id: iId,
						mode: sap.ui.ino.views.common.ThingInspectorAOView.Mode.Display,
					});
				}
			}),
			width: "35%",
			sortProperty: "GROUP_NAME",
			filterProperty: "GROUP_NAME"
		}));
		this.oTableGroups.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_IDENT_ROW_DESCRIPTION}"
			}),
			template: new sap.ui.commons.TextView({
				text: oController.getBoundPath("DESCRIPTION")
			}),
			width: "65%"
		}));

		this.oTableGroups.bindRows({
			path: this.getFormatterPath("/MemberOf")
		});

		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: new sap.ui.commons.layout.MatrixLayoutCell({
				content: [this.oTableGroups],
				colSpan: 2
			})
		}));

		return new sap.ui.ux3.ThingGroup({
			title: "{i18n>BO_IDENT_GRP_DETAIL_GROUPS}",
			content: oLayout,
			colspan: true
		});
	},

	_itemsUpdate: function(sPath, sProperty, aItems) {

		var oModel = this.getController().getModel();
		var aValues = oModel.getProperty(sPath);

		jQuery.each(aItems, function(iItemIndex, oItem) {
			oItem.setVisible(true);
		});
		jQuery.each(aItems, function(iItemIndex, oItem) {
			jQuery.each(aValues || [], function(iRoleIndex, oValue) {
				if (oItem.getCustomData()[0].mProperties.value == oValue[sProperty]) {
					oItem.setVisible(false);
				}
			});
		});

		var iVisible = 0;
		var iHidden = 0;
		for (var ii = 0; ii < aItems.length; ii++) {
			if (aItems[ii].getVisible()) {
				iVisible++;
			} else {
				iHidden++;
			}
		}
		return {
			visible: iVisible,
			hidden: iHidden
		};
	},

	_roleItemsUpdate: function() {
		var aItems = [];
		if (this.oAddRoleButton && this.oAddRoleButton.getMenu()) {
			aItems = this.oAddRoleButton.getMenu().getItems();
		}
		return this._itemsUpdate("/Roles", "ROLE_CODE", aItems);
	},

	_updateRoleButtons: function() {
		var oInfo = this._roleItemsUpdate();
		var iIndex = this.oTableRoles.getSelectedIndex();

		if (this.oAddRoleButton) {
			if (oInfo.visible > 0) {
				this.oAddRoleButton.setEnabled(true);
			} else {
				this.oAddRoleButton.setEnabled(false);
			}
		}

		if (this.oRemoveRoleButton) {
			if (oInfo.hidden > 0 && iIndex > -1) {
				this.oRemoveRoleButton.setEnabled(true);
			} else {
				this.oRemoveRoleButton.setEnabled(false);
			}
		}
	},

	_hasAdminPrivilege: function() {
		return Configuration.hasCurrentUserPrivilege("sap.ino.xs.rest.admin.application::execute");
	}
}));