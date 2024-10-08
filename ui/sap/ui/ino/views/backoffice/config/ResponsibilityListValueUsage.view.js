/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.ResponsibilityListValueUsage", {
	oUsageTableControl: null,

	oUsageTexts: {
		sHeaderLabel: "BO_COMMON_USAGE_EXP_HEADER",
		sNoteLabel: "BO_COMMON_USAGE_EXP_NOTE"
	},

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.ResponsibilityListValueUsage";
	},

	createContent: function() {
		var aColumns = this.createColumns();
		var oUsageTable = new sap.ui.table.AnalyticalTable({
			sumOnTop: true,
			columns: aColumns,
			//navigationMode: sap.ui.table.NavigationMode.Scrollbar,
			selectionMode: sap.ui.table.SelectionMode.Single,
			selectionBehavior: sap.ui.table.SelectionBehavior.RowSelector,
			allowColumnReordering: true,
			showColumnVisibilityMenu: true,
			enableColumnFreeze: true,
			enableCellFilter: true,
			width: "100%",
			visibleRowCount: 15,
			visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Interactive,
			numberOfExpandedLevels: 0,
			columnVisibilityMenuSorter: function(a, b) {
				var fnGetColumnName = function(oColumn) {
					return oColumn.getName() || (oColumn.getLabel() && oColumn.getLabel().getText ? oColumn.getLabel().getText() : "");
				};
				return fnGetColumnName(a).localeCompare(fnGetColumnName(b));
			}
		});

		var oHeaderLabel = this.createControl({
			Type: "label",
			Text: this.oUsageTexts.sHeaderLabel,
			Tooltip: this.oUsageTexts.sHeaderLabel
		});
		var oNoteLabel = this.createControl({
			Type: "label",
			Text: this.oUsageTexts.sNoteLabel,
			Tooltip: this.oUsageTexts.sNoteLabel
		});
		var oSpacer1 = new sap.ui.core.HTML({
			content: "<br/>",
			sanitizeContent: true
		});
		var oSpacer2 = new sap.ui.core.HTML({
			content: "<br/>",
			sanitizeContent: true
		});
		this.oUsageTableControl = oUsageTable;
		return new sap.ui.layout.VerticalLayout({
			content: [oHeaderLabel, oSpacer1, oUsageTable, oSpacer2, oNoteLabel]
		});
	},

	createColumns: function() {
		var aColumns = [];
		var oCampaignIDColumn = new sap.ui.table.AnalyticalColumn({
			label: new sap.ui.commons.Label({
				text: "{/#ResponsibilityValueUsageType/CAMPAIGN_ID/@sap:label}"
			}),
			template: new sap.ui.commons.Link({
				text: {
					path: "CAMPAIGN_ID",
					type: new sap.ui.model.type.String()
				},
				press: function(oControlEvent) {
					var oRowBindingContext = oControlEvent.getSource().getBindingContext();
					var iObjectID = oRowBindingContext.getProperty("CAMPAIGN_ID");
					if (!iObjectID) {
						return;
					}
					sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(
						"campaign", {
							id: iObjectID,
							edit: false
						});
				}

			}),
			leadingProperty: "CAMPAIGN_ID",
			grouped: true,
			summed: false,
			inResult: true,
			visible: false,
			sortProperty: "CAMPAIGN_ID",
			showIfGrouped: true,
			modelgroupHeaderFormatter: this.groupHeaderKeyFormatter
		});
		aColumns.push(oCampaignIDColumn);

		var oCampaignColumn = new sap.ui.table.AnalyticalColumn({
			label: new sap.ui.commons.Label({
				text: "{/#ResponsibilityValueUsageType/CAMPAIGN_NAME/@sap:label}"
			}),
			template: new sap.ui.commons.Link({
				text: {
					path: "CAMPAIGN_NAME",
					type: new sap.ui.model.type.String()
				},
				press: function(oControlEvent) {
					var oRowBindingContext = oControlEvent.getSource().getBindingContext();
					var iObjectID = oRowBindingContext.getProperty("CAMPAIGN_ID");
					if (!iObjectID) {
						return;
					}
					sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(
						"campaign", {
							id: iObjectID,
							edit: false
						});
				}
			}),
			leadingProperty: "CAMPAIGN_NAME",
			grouped: true,
			summed: false,
			sortProperty: "CAMPAIGN_NAME",
			showIfGrouped: true,
			groupHeaderFormatter: this.groupHeaderTextFormatter
		});
		aColumns.push(oCampaignColumn);

		//IDEA_NAME
		var oIdeaColumn = new sap.ui.table.AnalyticalColumn({
			label: new sap.ui.commons.Label({
				text: "{/#ResponsibilityValueUsageType/IDEA_NAME/@sap:label}"
			}),
			template: new sap.ui.commons.Link({
				text: {
					path: "IDEA_NAME",
					type: new sap.ui.model.type.String()
				},
				press: function(oControlEvent) {
					var oRowBindingContext = oControlEvent.getSource().getBindingContext();
					var iObjectID = oRowBindingContext.getProperty("IDEA_ID");
					if (!iObjectID) {
						return;
					}
					sap.ui.ino.application.ApplicationBase.getApplication().
					navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', 'idea', iObjectID);
				}
			}),
			leadingProperty: "IDEA_NAME",
			grouped: false,
			summed: false,
			sortProperty: "IDEA_NAME",
			showIfGrouped: true,
			groupHeaderFormatter: this.groupHeaderTextFormatter
		});
		aColumns.push(oIdeaColumn);
        
        //IDEA_AUTHOR_NAME
		var oIdeaAuthorColumn = new sap.ui.table.AnalyticalColumn({
			label: new sap.ui.commons.Label({
				text: "{/#ResponsibilityValueUsageType/IDEA_AUTHOR_NAME/@sap:label}"
			}),
			template: new sap.ui.commons.Link({
				text: {
					path: "IDEA_AUTHOR_NAME",
					type: new sap.ui.model.type.String()
				},
				press: function(oControlEvent) {
					var oRowBindingContext = oControlEvent.getSource().getBindingContext();
					var iObjectID = oRowBindingContext.getProperty("IDEA_AUTHOR_ID");
					if (!iObjectID) {
						return;
					}
					sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("IDEA_AUTHOR_ID", "user").apply(this,arguments);
				}
			}),
			leadingProperty: "IDEA_AUTHOR_NAME",
			grouped: false,
			summed: false,
			sortProperty: "IDEA_AUTHOR_NAME",
			showIfGrouped: true,
			groupHeaderFormatter: this.groupHeaderTextFormatter
		});
		aColumns.push(oIdeaAuthorColumn);
		
			//IDEA_AUTHOR_ID
		var oIdeaAuthorIDColumn = new sap.ui.table.AnalyticalColumn({
			label: new sap.ui.commons.Label({
				text: "{/#ResponsibilityValueUsageType/IDEA_AUTHOR_ID/@sap:label}"
			}),
			template: new sap.ui.commons.Link({
				text: {
					path: "IDEA_AUTHOR_ID",
					type: new sap.ui.model.type.String()
				},
				press: function(oControlEvent) {
					var oRowBindingContext = oControlEvent.getSource().getBindingContext();
					var iObjectID = oRowBindingContext.getProperty("IDEA_AUTHOR_ID");
					if (!iObjectID) {
						return;
					}
					sap.ui.ino.application.ApplicationBase.getApplication().
					navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', 'user', iObjectID);
				}
			}),
			leadingProperty: "IDEA_AUTHOR_ID",
			grouped: false,
			summed: false,
			inResult: true,
			visible: false,
			sortProperty: "IDEA_AUTHOR_ID",
			showIfGrouped: true,
			groupHeaderFormatter: this.groupHeaderKeyFormatter
		});
		aColumns.push(oIdeaAuthorIDColumn);
        
		//IDEA_ID
		var oIdeaIDColumn = new sap.ui.table.AnalyticalColumn({
			label: new sap.ui.commons.Label({
				text: "{/#ResponsibilityValueUsageType/IDEA_ID/@sap:label}"
			}),
			template: new sap.ui.commons.Link({
				text: {
					path: "IDEA_ID",
					type: new sap.ui.model.type.String()
				},
				press: function(oControlEvent) {
					var oRowBindingContext = oControlEvent.getSource().getBindingContext();
					var iObjectID = oRowBindingContext.getProperty("IDEA_ID");
					if (!iObjectID) {
						return;
					}
					sap.ui.ino.application.ApplicationBase.getApplication().
					navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', 'idea', iObjectID);
				}
			}),
			leadingProperty: "IDEA_ID",
			grouped: false,
			summed: false,
			inResult: true,
			visible: false,
			sortProperty: "IDEA_ID",
			showIfGrouped: true,
			groupHeaderFormatter: this.groupHeaderKeyFormatter
		});
		aColumns.push(oIdeaIDColumn);
		//Form_COUNT
		var oCountColumn = new sap.ui.table.AnalyticalColumn({
			label: new sap.ui.commons.Label({
				text: "{/#ResponsibilityValueUsageType/RESP_VALUE_COUNT/@sap:label}"
			}),
			template: new sap.ui.commons.TextView({
				text: {
					path: "RESP_VALUE_COUNT",
					type: new sap.ui.model.type.Integer()
				}
			}),
			leadingProperty: "RESP_VALUE_COUNT",
			grouped: false,
			summed: true,
			showIfGrouped: true,
			sortProperty: "RESP_VALUE_COUNT"
		});
		aColumns.push(oCountColumn);
		return aColumns;
	},

	createControl: function(oSettings) {
		if (!oSettings.View) {
			oSettings.View = this;
		}
		return sap.ui.ino.views.common.GenericControl.create(oSettings);
	},

	groupHeaderTextFormatter: function(sTextValue) {
		return sTextValue;
	}
});