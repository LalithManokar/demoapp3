/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.views.common.ObjectInstanceSelection");
jQuery.sap.require("sap.ui.ino.controls.AutoComplete");
jQuery.sap.require("sap.ui.ino.models.object.Tag");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");

sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagGroupManagementGroupDataFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {
	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.tag.TagGroupManagementGroupDataFacet";
	},

	onShow: function() {
		var oController = this.getController();
		oController.initTagBinding();
	},

	createFacetContent: function() {
		var oThingGroupDetails = this._createThingGroupDetails(this.getController().isInEditMode());
		//var oThingGroupTags = this._createThingGroupTags(this.getController().isInEditMode());
		var oGroupCriterions = this.createLayoutGroupTree(this.getController().isInEditMode());
		return [oThingGroupDetails, oGroupCriterions];
	},

	_createThingGroupDetails: function(bEdit) {
		var oController = this.getController();
		var oContent = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['175px', 'auto']
		});

		var oGroupNameText = this.createControl({
			Type: bEdit ? "textfield" : "textview",
			Text: "/NAME"
		});

		var oGroupNameRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_TAG_GROUP_FLD_NAME",
					LabelControl: oGroupNameText,
					Tooltip: oController.getTextModel().getText("BO_TAG_GROUP_FLD_GROUP_NAME_TIP")
				})
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oGroupNameText
			})]
		});
		oContent.addRow(oGroupNameRow);

// 		var oLimitNumberText = this.createControl({
// 			Type: bEdit ? "textfield" : "textview",
// 			Text: "/TOP_NUMBER"
// 		});

// 		var oLimitNumberRow = new sap.ui.commons.layout.MatrixLayoutRow({
// 			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
// 				content: this.createControl({
// 					Type: "label",
// 					Text: "BO_TAG_GROUP_NUMBER_FLD_MAXIMUM_NUMBER",
// 					LabelControl: oLimitNumberText,
// 					Tooltip: oController.getTextModel().getText("BO_TAG_GROUP_NUMBER_FLD_MAXIMUM_NUMBER_TIP")
// 				})
// 			}), new sap.ui.commons.layout.MatrixLayoutCell({
// 				content: oLimitNumberText
// 			})]
// 		});
// 		oContent.addRow(oLimitNumberRow);

		var oDescriptionText = this.createControl({
			Type: bEdit ? "textarea" : "textview",
			Text: "/DESCRIPTION"
		});

		var oDescriptionRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_TAG_GROUP_FLD_DESCRIPTION",
					LabelControl: oDescriptionText
				})
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oDescriptionText
			})]
		});
		oContent.addRow(oDescriptionRow);

		oContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: new sap.ui.commons.layout.MatrixLayoutCell({
				content: [new sap.ui.core.HTML({
					content: "<br/>",
					sanitizeContent: true
				})],
				colSpan: 2
			})
		}));

		return new sap.ui.ux3.ThingGroup({
			title: "{i18n>BO_TAG_GROUP_GRP_DETAILS}",
			content: oContent
		});
	},

	_createThingGroupTags: function(bEdit) {
		this._createTagTable(bEdit);

		this._oTagsThingGroup = new sap.ui.ux3.ThingGroup({
			title: "{i18n>BO_TAG_GROUP_GRP_DETAIL_TAGS}",
			content: this._oTableTags,
			colspan: true
		});
		return this._oTagsThingGroup;
	},

	_createTagTable: function(bEdit) {
		var oController = this.getController();
		var oMenuBar = this._createMenuBar(bEdit);
		this._oTableTags = new sap.ui.table.Table({
			selectionMode: sap.ui.table.SelectionMode.Single,
			toolbar: oMenuBar,
			visibleRowCount: 10,
			rowSelectionChange: function(oEvent) {
				oController.onSelectionChanged(oEvent.getParameter("rowContext"), oEvent.getSource().getSelectedIndex(), oEvent.getSource(), bEdit);
			}
		});
		this._createAndAddColumns(bEdit);
	},

	_createMenuBar: function(bEdit) {
		var oController = this.getController();
		var oMenuBar = new sap.ui.commons.Toolbar({
			width: '100%',
			design: sap.ui.commons.ToolbarDesign.Transparent
		});
		var oAddIdentityTextField = new sap.ui.ino.controls.AutoComplete({
			placeholder: "{i18n>BO_TAG_GROUP_FLD_ADD_TAG_PLACEHOLDER}",
			maxPopupItems: 10,
			displaySecondaryValues: true,
			searchThreshold: 500,
			width: "200px",
			suggest: function(oEvent) {
				var sValue = oEvent.getParameter("suggestValue");
				var oListTemplate = new sap.ui.core.ListItem({
					text: "{NAME}",
					key: "{ID}"
				});
				var instanceSelection = sap.ui.ino.views.common.ObjectInstanceSelection["sap.ino.xs.object.tag.Tag"];
				oEvent.getSource().bindAggregation("items", {
					path: instanceSelection.createSearchPath(sValue),
					template: oListTemplate,
					length: 30,
					parameters: {
						select: "searchToken,ID,NAME,USAGE_COUNT,CREATED_AT,CREATED_BY,CHANGED_AT,CHANGED_BY"
					}
				});
			},
			confirm: function() {
				oController.addIdentity(this);
			},
			enabled: bEdit
		});
		oAddIdentityTextField.setFilterFunction(function(sValue, oItem) {
			var bEquals = (oItem.getText().toLowerCase().indexOf(sValue.toLowerCase()) !== -1) || (oItem.getAdditionalText().toLowerCase().indexOf(
				sValue.toLowerCase()) !== -1);
			var oModel = oController.getModel();
			var aIdentities = oModel.getProperty("/AssignmentTags");
			var fnFindIdentity = function(array, id) {
				var arr = array || [];
				return jQuery.grep(arr, function(object) {
					return object.TAG_ID === id;
				});
			};
			return bEquals && (fnFindIdentity(aIdentities, oItem.getKey()).length === 0);
		});
		oMenuBar.addItem(oAddIdentityTextField);
		var oAddIdentityButton = new sap.ui.commons.Button({
			layoutData: new sap.ui.commons.form.GridElementData({
				hCells: "1"
			}),
			text: "{i18n>BO_TAG_GROUP_BUT_ADD_TAG}",
			press: function() {
				oController.addIdentity(oAddIdentityTextField);
			},
			enabled: bEdit
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
			enabled: {
				path: "clipboard>/changed",
				formatter: function() {
					return bEdit && !sap.ui.ino.models.core.ClipboardModel.sharedInstance().isClipboardEmpty(sap.ui.ino.models.object.Tag);
				}
			}
		});
		oMenuBar.addItem(oAddIdentityFromClipboardButton);
		this._oRemoveIdentityButton = new sap.ui.commons.Button({
			layoutData: new sap.ui.commons.form.GridElementData({
				hCells: "1"
			}),
			text: "{i18n>BO_TAG_GROUP_BUT_REMOVE_TAG}",
			press: function(oEvent) {
				oController.removeIdentity(oEvent);
			},
			enabled: false
		});
		oMenuBar.addItem(this._oRemoveIdentityButton);
		return oMenuBar;
	},

	_createAndAddColumns: function(bEdit) {
		var oController = this.getController();
		var sModelName = "";
		if (bEdit) {
			sModelName = oController.getModelName();
		}
		this._oTableTags.addColumn(sap.ui.ino.application.backoffice.ControlFactory.createClipboardColumn(undefined, sap.ui.ino.models.object.Tag,
			"TAG_ID", sModelName));

		this._oTableTags.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_TAG_GROUP_ROW_TAG_NAME}"
			}),
			template: new sap.ui.commons.Link({
				text: this.getBoundPath("NAME"),
				press: function(oControlEvent) {
					var sCurrentModelName = '';
					if (oController.isInEditMode()) {
						sCurrentModelName = oController.getModelName();
					}
					var oRowBindingContext = oControlEvent.getSource().getBindingContext(sCurrentModelName);
					var oIdentity = oRowBindingContext.getObject();
					var iId = oIdentity.TAG_ID;
					sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow('tag', {
						id: iId,
						edit: false
					});
				}
			}),
			sortProperty: "NAME",
			filterProperty: "NAME"
		}));

		this._oTableTags.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_TAG_GROUP_ROW_COUNT_TEXT}"
			}),
			template: new sap.ui.commons.TextView({
				text: this.getBoundPath("USAGE_COUNT"),
				datatype: new sap.ui.model.type.Float()
			}),
			sortProperty: "USAGE_COUNT",
			filterProperty: "USAGE_COUNT",
			filterType: new sap.ui.model.type.Float()
		}));

		this._oTableTags.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_TAG_GROUP_ROW_CREATED_AT}"
			}),
			template: new sap.ui.commons.TextView({
				text: this.getBoundPath("CREATED_AT"),
				datatype: new sap.ui.model.type.Date()
			}),
			sortProperty: "CREATED_AT"
		}));

		this._oTableTags.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_TAG_GROUP_ROW_CREATED_BY}"
			}),
			template: new sap.ui.commons.Link({
				text: this.getBoundPath("CREATED_BY"),
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
			}),
			sortProperty: "CREATED_BY",
			filterProperty: "CREATED_BY"
		}));

		this._oTableTags.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_TAG_GROUP_ROW_CHANGED_AT}"
			}),
			template: new sap.ui.commons.TextView({
				text: this.getBoundPath("CHANGED_AT") ,
				datatype: new sap.ui.model.type.Date()
			}),
			sortProperty: "CHANGED_AT"
		}));

		this._oTableTags.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_TAG_GROUP_ROW_CHANGED_BY}"
			}),
			template: new sap.ui.commons.Link({
				text: this.getBoundPath("CHANGED_BY"),
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
			}),
			sortProperty: "CHANGED_BY",
			filterProperty: "CHANGED_BY"
		}));

	},
	createLayoutGroupTree: function() {
		this.oGroupTreeDetailView = sap.ui.view({
			viewName: "sap.ui.ino.views.backoffice.tag.TagGroupTreeCriteria",
			type: sap.ui.core.mvc.ViewType.JS,
			viewData: {
				parentView: this,
				includeToolbar: true
			}
		});
		this.oGroupTreeDetailView.facetView = this;		
		var oBinding = {
			path: this.getFormatterPath("AssignmentTags", true),
			parameters: {
				arrayNames: ["children"]
			}
			//sorter: [new sap.ui.model.Sorter("SEQUENCE_NO")]
		};	
		this.oGroupTreeDetailView.setTreeValueBinding(oBinding);		
		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_TAG_GROUP_GRP_DETAIL_TAGS"),
			content: [this.oGroupTreeDetailView, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});		
		
	},
	revalidateMessages: function() {
		this.oGroupTreeDetailView.revalidateMessages();
		// super call
		sap.ui.ino.views.common.FacetAOView.revalidateMessages.apply(this, arguments);
	}	
}));