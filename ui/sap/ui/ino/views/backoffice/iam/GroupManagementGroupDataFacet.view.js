/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.views.common.ObjectInstanceSelection");
jQuery.sap.require("sap.ui.ino.controls.AutoComplete");
jQuery.sap.require("sap.ui.ino.application.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.object.Group");
jQuery.sap.require("sap.ui.ino.models.object.User");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.controls.FileUploader");
jQuery.sap.require("sap.ui.ino.controls.FileUploaderStyle");
jQuery.sap.require("sap.ui.ino.controls.AttachmentControl");
jQuery.sap.require("sap.ui.ino.controls.Attachment");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");

var Configuration = sap.ui.ino.application.Configuration;

var oSourceTypeCode = {
	User: "USER",
	Upload: "UPLOAD",
	IdentityProvider: "IDP",
	Automatic: "AUTOMATIC"
};

sap.ui.jsview("sap.ui.ino.views.backoffice.iam.GroupManagementGroupDataFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.iam.GroupManagementGroupDataFacet";
	},

	onShow: function() {
		var oController = this.getController();
		oController.initMemberBinding();
	},

	createFacetContent: function() {
		var oThingGroupDetails = this.createThingGroupDetails(this.getController().isInEditMode());
		var oThingGroupMembers = this.createThingGroupMembers(this.getController().isInEditMode());

		return [oThingGroupDetails, oThingGroupMembers];
	},

	createThingGroupDetails: function(bEdit) {
		var oController = this.getController();
		var oContent = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['50%', '50%']
		});
		var that = this;
		// 		this.oGroupNameText = this.createControl({
		// 			Type: bEdit ? "textfield" : "textview",
		// 			Text: "/NAME"
		// 		});
		if (bEdit) {
			this.oGroupNameText = new sap.ui.commons.TextField({
				value: this.getBoundPath("NAME", true),
				editable: {
					path: this.getFormatterPath("/SOURCE_TYPE_CODE"),
					type: null,
					formatter: function(oType) {
						var bTypeEdit = true;
						if (oType === oSourceTypeCode.IdentityProvider || oType === oSourceTypeCode.Automatic) {
							bTypeEdit = false;
						}
						return bTypeEdit && bEdit;
					}
				}
			});
		} else {
			this.oGroupNameText = new sap.ui.commons.TextView({
				text: this.getBoundPath("NAME", true)
			});
		}
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_GROUPMGMT_FLD_NAME",
					LabelControl: this.oGroupNameText
				})
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oGroupNameText
			})]
		});
		oContent.addRow(oRow);

		this.oGroupMailText = this.createControl({
			Type: bEdit ? "textfield" : "textview",
			Text: "/EMAIL"
		});

		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_GROUPMGMT_FLD_EMAIL",
					LabelControl: this.oGroupMailText
				})
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oGroupMailText
			})]
		});
		oContent.addRow(oRow);

		this.oDescriptionText = this.createControl({
			Type: bEdit ? "textarea" : "textview",
			Text: "/DESCRIPTION"
		});

		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_GROUPMGMT_FLD_DESCRIPTION",
					LabelControl: this.oDescriptionText
				})
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oDescriptionText
			})]
		});
		oContent.addRow(oRow);

		this.isPublicGroup = new sap.ui.commons.CheckBox({
			editable: {
				path: this.getFormatterPath("/SOURCE_TYPE_CODE"),
				type: null,
				formatter: function(oType) {
					var bTypeEdit = true;
					if (oType === oSourceTypeCode.IdentityProvider || oType === oSourceTypeCode.Automatic) {
						bTypeEdit = false;
					}
					return bTypeEdit && bEdit;
				}
			},
			checked: {
				path: this.getFormatterPath("/GroupAttribute/0/IS_PUBLIC"),
				type: new sap.ui.ino.models.types.IntBooleanType()
			}
		});

		if (sap.ui.ino.application.Configuration.getSystemSetting('sap.ino.config.OPEN_GROUP_FOR_COMMUNITY_USER') * 1) {
			oContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_GROUPMGMT_GRP_DETAIL_PUBLIC",
						LabelControl: this.isPublicGroup
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.isPublicGroup
				})]
			}));
		}

		this.isMgrPublicGroup = new sap.ui.commons.CheckBox({
			editable: !bEdit ? false : {
				parts: [{
					path: this.getFormatterPath("/CREATED_BY_ID"),
					type: null
				}, {
					path: this.getFormatterPath("/ID"),
					type: null
				}],
				formatter: function(cId, id) {
					return oController.formatterPublic(cId, id);
				}
			},
			checked: {
				path: this.getFormatterPath("/GroupAttribute/0/IS_MANAGER_PUBLIC"),
				type: new sap.ui.ino.models.types.IntBooleanType()
			}
		});

		oContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_GROUPMGMT_GROUP_ROW_IS_MANAGER_PUBLIC",
					LabelControl: this.isMgrPublicGroup
				})
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.isMgrPublicGroup
			})]
		}));
		///For Group Picture
		if (bEdit) {
			var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
			this.groupImageFileUploader = new sap.ui.ino.controls.FileUploader({
				uploadTooltip: "{i18n>BO_GROUPMGMT_GROUP_DETAIL_GROUP_IMAGE_TOOLTIP}",
				style: sap.ui.ino.controls.FileUploaderStyle.ImageWithDefaultValue,
				attachmentId: this.getBoundPath("IMAGE_ID", true),
				assignmentId: this.getBoundPath("IMAGE_ASSIGN_ID", true),
				accept: "image/*",
				uploadSuccessful: function(evt) {
					oController.setGroupImage(evt.getParameters().attachmentId, evt.getParameters().fileName, evt.getParameters().mediaType);
					oApp.removeNotificationMessages("groupimage");
				},
				uploadFailed: function(evt) {
					oApp.removeNotificationMessages("backgroundimage");
					for (var i = 0; i < evt.getParameters().messages.length; i++) {
						var msg_raw = evt.getParameters().messages[i];
						var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "groupimage");
						oApp.addNotificationMessage(msg);
					}
				},
				clearSuccessful: function(evt) {
					oApp.removeNotificationMessages("groupimage");
					oController.clearGroupImage(evt.getParameters().assignmentId);
				},
				clearFailed: function(evt) {
					oApp.removeNotificationMessages("groupimage");
					for (var i = 0; i < evt.getParameters().messages.length; i++) {
						var msg_raw = evt.getParameters().messages[i];
						var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "groupimage");
						oApp.addNotificationMessage(msg);
					}
				}
			});
			this.oAttachmentControl = new sap.ui.ino.controls.AttachmentControl({
				titleImageFileUploader: this.groupImageFileUploader
			});
			oContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.createControl({
						Type: "label",
						Text: "BO_GROUPMGMT_GROUP_ROW_GROUP_IMAGE",
						LabelControl: this.oAttachmentControl
					})
				}), new sap.ui.commons.layout.MatrixLayoutCell({
					content: this.oAttachmentControl
				})]
			}));
		} else {
			var that = this;
			oController.getModel().getDataInitializedPromise().done(function(oGroup) {

				if (oGroup.Attachments.length > 0) {
					that.oAttachmentControl = new sap.ui.ino.controls.AttachmentControl();

					var oAttachmentTemplate = new sap.ui.ino.controls.Attachment({
						assignmentId: that.getBoundPath("ID"),
						attachmentId: that.getBoundPath("ATTACHMENT_ID"),
						roleFilter: that.getBoundPath("ROLE_TYPE_CODE"),
						mediaType: that.getBoundPath("MEDIA_TYPE"),
						fileName: that.getBoundPath("FILE_NAME"),
						url: {
							path: that.getFormatterPath("ATTACHMENT_ID", false),
							formatter: function(attachmentId) {
								return Configuration.getAttachmentDownloadURL(attachmentId);

							}
						},
						editable: false
					});

					that.oAttachmentControl.bindAttachments({
						path: that.getFormatterPath("Attachments", true),
						template: oAttachmentTemplate
					});
				} else {

					that.oAttachmentControl = that.createControl({
						Type: "label",
						Text: "BO_GROUPMGMT_GROUP_ROW_NO_GROUP_IMAGE"
					});
				}
				oContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
					cells: [new sap.ui.commons.layout.MatrixLayoutCell({
						content: that.createControl({
							Type: "label",
							Text: "BO_GROUPMGMT_GROUP_ROW_GROUP_IMAGE",
							LabelControl: that.oAttachmentControl
						})
					}), new sap.ui.commons.layout.MatrixLayoutCell({
						content: that.oAttachmentControl
					})]
				}));
				oContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
					cells: new sap.ui.commons.layout.MatrixLayoutCell({
						content: [new sap.ui.core.HTML({
							content: "<br/>",
							sanitizeContent: true
						})],
						colSpan: 2
					})
				}));
			});

		}

		return new sap.ui.ux3.ThingGroup({
			title: "{i18n>BO_GROUPMGMT_GRP_DETAILS}",
			content: oContent
		});
	},

	_createMenuBar: function(bEdit) {
		var oController = this.getController();

		var oMenuBar = new sap.ui.commons.Toolbar({
			width: '100%',
			design: sap.ui.commons.ToolbarDesign.Transparent
		});

		if (bEdit) {

			var oAddIdentityTextField = new sap.ui.ino.controls.AutoComplete({
				placeholder: "{i18n>BO_GROUPMGMT_FLD_ADD_MEMBER_PLACEHOLDER}",
				maxPopupItems: 10,
				displaySecondaryValues: true,
				width: "200px",
				visible: {
					path: this.getFormatterPath("/SOURCE_TYPE_CODE"),
					type: null,
					formatter: function(oType) {
						if (oType === oSourceTypeCode.IdentityProvider || oType === oSourceTypeCode.Automatic) {
							return false;
						}

					}
				},
				suggest: function(oEvent) {
					var sValue = oEvent.getParameter("suggestValue");
					var oListTemplate = new sap.ui.core.ListItem({
						text: "{NAME}",
						additionalText: "{USER_NAME}",
						key: "{ID}"
					});
					oEvent.getSource().bindAggregation("items", {
						path: sap.ui.ino.views.common.ObjectInstanceSelection["sap.ino.xs.object.iam.Identity"].createSearchPath(sValue),
						template: oListTemplate,
						parameters: {
							select: "searchToken,ID,NAME,USER_NAME,TYPE_CODE,DESCRIPTION"
						}
					});
				},
				confirm: function() {
					oController.addIdentity(this);
				}
			});

			oAddIdentityTextField.setFilterFunction(function(sValue, oItem) {
				var bEquals = (oItem.getText().toLowerCase().indexOf(sValue.toLowerCase()) !== -1) || (oItem.getAdditionalText().toLowerCase().indexOf(
					sValue.toLowerCase()) !== -1);
				var oModel = oController.getModel();
				var aIdentities = oModel.getProperty("/MemberShip");
				var sSelf = oModel.getProperty("/NAME");
				var bSelf = (oItem.getText().toLowerCase().indexOf(sSelf.toLowerCase()) === 0) && oItem.getText().length === sSelf.length;

				var fnFindIdentity = function(array, id) {
					return jQuery.grep(array, function(object, idx) {
						return object.MEMBER_ID == id;
					});
				};

				return bEquals && (fnFindIdentity(aIdentities, oItem.getKey()).length === 0) && !bSelf;
			});
			oMenuBar.addItem(oAddIdentityTextField);

			var oAddIdentityButton = new sap.ui.commons.Button({
				layoutData: new sap.ui.commons.form.GridElementData({
					hCells: "1"
				}),
				text: "{i18n>BO_GROUPMGMT_BUT_ADD_MEMBER}",
				visible: {
					path: this.getFormatterPath("/SOURCE_TYPE_CODE"),
					type: null,
					formatter: function(oType) {
						if (oType === oSourceTypeCode.IdentityProvider || oType === oSourceTypeCode.Automatic) {
							return false;
						}

					}
				},
				press: function() {
					oController.addIdentity(oAddIdentityTextField);
				}
				// enabled: {
				// 	path: this.getFormatterPath("/ID"),
				// 	type: null,
				// 	formatter: function(id) {
				// 		return id > 0;
				// 	}
				// }
			});
			oMenuBar.addItem(oAddIdentityButton);

			var oAddIdentityFromClipboardButton = new sap.ui.commons.Button({
				layoutData: new sap.ui.commons.form.GridElementData({
					hCells: "1"
				}),
				text: "{i18n>BO_COMMON_BUT_ADD_FROM_CLIPBOARD}",
				press: function() {
					oController.addIdentityFromClipboard();
				},
				visible: {
					path: this.getFormatterPath("/SOURCE_TYPE_CODE"),
					type: null,
					formatter: function(oType) {
						if (oType === oSourceTypeCode.IdentityProvider || oType === oSourceTypeCode.Automatic) {
							return false;
						}

					}
				},
				enabled: {
					parts: [{
						path: this.getFormatterPath("/ID"),
						type: null
					}, {
						path: "clipboard>/changed"
					}],
					// bIsEmpty is never read, but used to get notified upon model updates
					formatter: function(id, bIsEmpty) {
						// if(id <= 0){
						//     return false;
						// }
						var bEmpty = sap.ui.ino.models.core.ClipboardModel.sharedInstance().isClipboardEmpty(sap.ui.ino.models.object.User) && sap.ui.ino
							.models.core.ClipboardModel.sharedInstance().isClipboardEmpty(sap.ui.ino.models.object.Group);
						return !bEmpty;
					}
				}
			});
			oMenuBar.addItem(oAddIdentityFromClipboardButton);

			this._oRemoveIdentityButton = new sap.ui.commons.Button({
				layoutData: new sap.ui.commons.form.GridElementData({
					hCells: "1"
				}),
				text: "{i18n>BO_GROUPMGMT_BUT_REMOVE_MEMBER}",
				press: function(oEvent) {
					oController.removeIdentity(oEvent);
				},
				visible: {
					path: this.getFormatterPath("/SOURCE_TYPE_CODE"),
					type: null,
					formatter: function(oType) {
						if (oType === oSourceTypeCode.IdentityProvider || oType === oSourceTypeCode.Automatic) {
							return false;
						}

					}
				},
				enabled: false
			});
			oMenuBar.addItem(this._oRemoveIdentityButton);
		}

		var oContactButton = new sap.ui.commons.Button({
			text: "{i18n>BO_GROUPMGMT_BUT_CONTACT_MEMBERS}",
			press: function(oEvent) {
				var oMailObject = sap.ui.ino.application.ControlFactory.createMailObject();
				oMailObject.executeMailTo(jQuery.map(this.getCustomData(), function(oCustData) {
					return oCustData.getValue();
				}), "");
			},
			customData: {
				path: this.getFormatterPath("/MemberShip"),
				template: new sap.ui.core.CustomData({
					key: "EMAIL",
					value: this.getBoundPath("EMAIL")
				})
			},
			enabled: {
				path: this.getFormatterPath("/MEMBERS"),
				type: null,
				formatter: function(nMemberCount) {
					return nMemberCount > 0;
				}
			}
		});

		oMenuBar.addRightItem(oContactButton);

		return oMenuBar;
	},

	createAndAddColumns: function(bEdit) {
		var oController = this.getController();
		var sModelName = "";
		if (bEdit) {
			sModelName = oController.getModelName();
		}
		this._oTableMembers.addColumn(sap.ui.ino.application.backoffice.ControlFactory.createClipboardColumnForIdentity(undefined, "MEMBER_ID",
			sModelName));

		this._oTableMembers.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_GROUPMGMT_ROW_MEMBER_NAME}"
			}),
			template: new sap.ui.commons.Link({
				text: this.getBoundPath("MEMBER_NAME"),
				press: function(oControlEvent) {
					var oRowBindingContext = oControlEvent.getSource().getBindingContext(oController.getModelName());
					var oIdentity = oRowBindingContext.getObject();
					var iId = oIdentity.MEMBER_ID;
					var sTypeCodeTmp = oIdentity.TYPE_CODE;
					if (sTypeCodeTmp === 'GROUP') {
						sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow('group', {
							id: iId,
							edit: false
						});
					} else {
						sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow('user', {
							id: iId,
							edit: false
						});
					}
				}
			}),
			sortProperty: "MEMBER_NAME",
			filterProperty: "MEMBER_NAME"
		}));
		var sTypeCode = this.getModelPrefix() + "TYPE_CODE",
			sUserName = this.getModelPrefix() + "USER_NAME",
			sDesc = this.getModelPrefix() + "DESCRIPTION";
		this._oTableMembers.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_GROUPMGMT_ROW_TYPE_CODE}"
			}),
			template: new sap.ui.commons.TextView({
				text: {
					path: sTypeCode,
					formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.iam.TypeCode.Root")
				}
			}),
			sortProperty: "TYPE_CODE",
			filterProperty: "TYPE_CODE"
		}));

		this._oTableMembers.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_GROUPMGMT_ROW_DETAILS}"
			}),
			template: new sap.ui.commons.TextView({
				text: {
					parts: [{
						path: sTypeCode
                    }, {
						path: sUserName
                    }, {
						path: sDesc
                    }],
					formatter: function(sType, sUser, sDescription) {
						if (sType === "USER") {
							return sUser;
						} else {
							return sDescription;
						}
					}
				}
			})
		}));
	},

	createMemberTable: function(bEdit) {
		var oController = this.getController();

		var oMenuBar = this._createMenuBar(bEdit);

		this._oTableMembers = new sap.ui.table.Table({
			selectionMode: sap.ui.table.SelectionMode.Single,
			toolbar: oMenuBar,
			visibleRowCount: 10,
			rowSelectionChange: function(oEvent) {
				oController.onSelectionChanged(oEvent.getParameter("rowContext"), oEvent.getSource().getSelectedIndex(), oEvent.getSource(), bEdit);
			}
		});

		this.createAndAddColumns(bEdit);
	},

	createThingGroupMembers: function(bEdit) {
		this.createMemberTable(bEdit);

		this._oMembersThingGroup = new sap.ui.ux3.ThingGroup({
			title: "{i18n>BO_GROUPMGMT_GRP_DETAIL_MEMBERS}",
			content: this._oTableMembers,
			colspan: true
		});
		return this._oMembersThingGroup;
	}
}));