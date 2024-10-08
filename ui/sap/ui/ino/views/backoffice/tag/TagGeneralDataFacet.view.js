/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.views.common.ObjectInstanceSelection");
jQuery.sap.require("sap.ui.ino.controls.AutoComplete");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOView");

sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagGeneralDataFacet", jQuery.extend({},
	sap.ui.ino.views.common.FacetAOView, {

		getControllerName: function() {
			return "sap.ui.ino.views.backoffice.tag.TagGeneralDataFacet";
		},

		createFacetContent: function() {

			var oController = this.getController();
			var bEdit = oController.isInEditMode();

			var oLayout = new sap.ui.commons.layout.MatrixLayout();

			var oNameRow = new sap.ui.commons.layout.MatrixLayoutRow();
			oNameRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [this._createNameLayout(bEdit)]
			}));
			oLayout.addRow(oNameRow);
			var oVanityCodeRow = new sap.ui.commons.layout.MatrixLayoutRow();
			oVanityCodeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [this._createVanityCodeLayout(bEdit)]
			}));
			oLayout.addRow(oVanityCodeRow);

			var content = new sap.ui.ux3.ThingGroup({
				content: oLayout,
				colspan: true
			});
			var oThingGroupGroup = this.createGroupsThingGroup(bEdit);

			return [content,oThingGroupGroup];
		},

		_createNameLayout: function(bEdit) {

			var oController = this.getController();

			var oLayout = new sap.ui.commons.layout.MatrixLayout({
				columns: 2,
				widths: ["10%", "80%"]
			});
			oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
				height: "20px"
			}));

			/*
			 * Name
			 */
			var oNameTextView = new sap.ui.commons.Label({
				text: oController.getTextModel().getText("BO_TAG_FACET_GENERAL_FLD_NAME"),
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Left,
				width: "100%"
			});
			var oNameRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oNameLabel = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oNameTextView]
			});

			var oNameField;

			if (bEdit) {
				oNameField = new sap.ui.commons.TextField({
					value: this.getBoundPath("NAME", true),
					width: '75%',
					maxLength: this.getBoundPath("/meta/nodes/Root/attributes/NAME/maxLength"),
					liveChange: [this.getController().onLiveNameChange, this.getController()],
					ariaLabelledBy: oNameTextView
				});
			} else {
				oNameField = new sap.ui.commons.TextView({
					text: this.getBoundPath("NAME", true),
					ariaLabelledBy: oNameTextView
				});
			}
			oNameRow.addCell(oNameLabel);
			//oNameRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oNameRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oNameField]
			}));
			oLayout.addRow(oNameRow);

			return oLayout;
		},

		_createVanityCodeLayout: function(bEdit) {
			var oController = this.getController();
			var oLayout = new sap.ui.commons.layout.MatrixLayout({
				columns: 2,
				widths: ["10%", "80%"]
			});
			oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
				height: "20px"
			}));
			/*
			 * Vanity Code
			 */
			var oVanityCodeTextView = new sap.ui.commons.Label({
				text: oController.getTextModel().getText("BO_TAG_FACET_GENERAL_FLD_VANITY_CODE"),
				design: sap.ui.commons.LabelDesign.Bold,
				textAlign: sap.ui.core.TextAlign.Left,
				width: "100%"
			});
			var oVanityCodeRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oVanityCodeLabel = new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oVanityCodeTextView]
			});
			var oVanityCodeField;
			if (bEdit) {
				oVanityCodeField = new sap.ui.commons.TextField({
					value: this.getBoundPath("VANITY_CODE", true),
					width: '75%',
					maxLength: this.getBoundPath("/meta/nodes/Root/attributes/VANITY_CODE/maxLength"),
					liveChange: [this.getController().onLiveNameChange, this.getController()],
					ariaLabelledBy: oVanityCodeTextView
				});
			} else {
				oVanityCodeField = new sap.ui.commons.TextView({
					text: this.getBoundPath("VANITY_CODE", true),
					ariaLabelledBy: oVanityCodeTextView
				});
			}
			oVanityCodeRow.addCell(oVanityCodeLabel);
			//oNameRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oVanityCodeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oVanityCodeField]
			}));
			oLayout.addRow(oVanityCodeRow);
			return oLayout;
		},

		revalidateMessages: function() {
			var oThingInspectorView = this.getController().getThingInspectorController().getView();
			oThingInspectorView.revalidateMessages();
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
				var oAddGroupTextField = new sap.ui.ino.controls.AutoComplete({
					placeholder: "{i18n>BO_TAG_GROUP_FLD_ADD_TAG_GROUP_PLACEHOLDER}",
					maxPopupItems: 10,
					displaySecondaryValues: true,
					searchThreshold: 500,
					suggest: function(oEvent) {
						var sValue = oEvent.getParameter("suggestValue");
						var oListTemplate = new sap.ui.core.ListItem({
							text: "{NAME}",
							additionalText: "{DESCRIPTION}",
							key: "{ID}"
						});
						oEvent.getSource().bindAggregation("items", {
							path: sap.ui.ino.views.common.ObjectInstanceSelection["sap.ino.xs.object.tag.TagGroup"].createSearchPath(sValue),
							template: oListTemplate,
							length: 30,
							parameters: sap.ui.ino.views.common.ObjectInstanceSelection["sap.ino.xs.object.tag.TagGroup"].parameters
						});
					},
					confirm: function() {
						oController.addGroup(this);
					}
				});

				oAddGroupTextField.setFilterFunction(function(sValue, oItem) {
					var bEquals = (oItem.getText().toLowerCase().indexOf(sValue.toLowerCase()) !== -1) || (oItem.getAdditionalText().toLowerCase().indexOf(
						sValue.toLowerCase()) !== -1);
					var oModel = oController.getModel();
					var aGroups = oModel.getProperty("/MemberOf");

					var fnFindGroup = function(array, id) {
						return jQuery.grep(array, function(object, idx) {
							return object.TAG_GROUP_ID == id;
						});
					};

					return bEquals && (fnFindGroup(aGroups, oItem.getKey()).length === 0);
				});

				this.oAddGroupButton = new sap.ui.commons.Button({
					layoutData: new sap.ui.commons.form.GridElementData({
						hCells: "1"
					}),
					text: "{i18n>BO_TAG_GROUP_BUT_GROUP_ADD}",
					press: function() {
					    oController.addGroup(oAddGroupTextField);
					}
				});

				this.oRemoveGroupButton = new sap.ui.commons.Button({
					press: [oController.removeGroup, oController],
					text: "{i18n>BO_TAG_GROUP_BUT_GROUP_REMOVE}",
					tooltip: "{i18n>BO_TAG_GROUP_EXP_GROUP_REMOVE}",
					lite: false,
					enabled: false
				});

				this.oTableGroups.setToolbar(new sap.ui.commons.Toolbar({
					items: [oAddGroupTextField, this.oAddGroupButton, this.oRemoveGroupButton]
				}));
			}
			this.oTableGroups.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_TAG_GROUP_ROW_GROUP_NAME}"
				}),
				template: new sap.ui.commons.Link({
					text: oController.getBoundPath("NAME"),
					press: function(oControlEvent) {
						var iId = oControlEvent.getSource().getBindingInfo("text").binding.getContext().getProperty("TAG_GROUP_ID");
						sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow("taggroup", {
							id: iId,
							mode: sap.ui.ino.views.common.ThingInspectorAOView.Mode.Display
						});
					}
				}),
				width: "35%",
				sortProperty: "NAME",
				filterProperty: "NAME"
			}));
			this.oTableGroups.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_TAG_GROUP_ROW_DESCRIPTION}"
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
				title: "{i18n>BO_TAG_GROUP_GRP_DETAIL_GROUPS}",
				content: oLayout,
				colspan: true
			});
		}
	}));