/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.models.types.IntegerNullableType");
jQuery.sap.declare("sap.ui.ino.views.backoffice.gamification.DimensionActivityMixin");

(function() {
	sap.ui.ino.views.backoffice.gamification.DimensionActivityMixin = {
		_ACTIVITY_PAIR_CODE_ONE_: ["SUBMIT_IDEA", "VOTE_IDEA", "CREATE_IDEA_EVALUATION", "CREATE_IDEA_COMMENT", "REPLY_IDEA_COMMENT"],
		_ACTIVITY_PAIR_CODE_TWO_: ["DELETE_IDEA", "UNVOTE_IDEA", "DELETE_IDEA_EVALUATION", "DELETE_IDEA_COMMENT", "DELETE_IDEA_REPLED_COMMENT"],
		createActivitiesThingGroup: function(bEdit) {
			var oLayout = new sap.ui.commons.layout.MatrixLayout({
				visible: true
			});
			this.createActivitiesContent(oLayout, bEdit);
			return new sap.m.Panel({
				headerText: this.getController().getTextPath("BO_GAMIFICATION_DIMENSION_ACTIVITIES_TIT"),
				content: [oLayout]
			});
		},

		createActivitiesContent: function(oLayout, bEdit) {
			this._createActivityToolbar(oLayout, bEdit);
			this._createActivityTable(oLayout, bEdit);
			this._createActivityDetail(oLayout, bEdit);
		},

		_createActivityToolbar: function(oLayout, bEdit) {
			var oView = this;
			var oController = oView.getController();
			var oToolbar = new sap.ui.commons.Toolbar();
			var oNewButton;
			if (bEdit) {
				oNewButton = new sap.ui.commons.Button({
					text: oController.getTextPath("BO_GAMIFICATION_DIMENSION_ACTIVITY_BTN_CREATE"),
					press: function(oEvent) {
						oController.createActivity(oEvent);
					},
					enabled: true
				});
			} else {
				oNewButton = new sap.ui.commons.Button({
					text: oController.getTextPath("BO_GAMIFICATION_DIMENSION_ACTIVITY_BTN_CREATE"),
					enabled: false
				});
			}
			oToolbar.addItem(oNewButton);
			var oDelButton = new sap.ui.commons.Button({
				text: oController.getTextPath("BO_GAMIFICATION_DIMENSION_ACTIVITY_BTN_DELETE"),
				press: function(oEvent) {
					oController.delActivity(oEvent);
				},
				enabled: {
					parts: [{
						path: oController.getFormatterPath("SELECTED_ACTIVITY_INDEX", true)
                    }],
					formatter: function(nIndex) {
						return bEdit && nIndex >= 0;
					}
				}
			});
			oToolbar.addItem(oDelButton);
			oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					content: oToolbar
				})]
			}));
		},

		_createActivityTable: function(oLayout, bEdit) {
			var oView = this;
			var oController = oView.getController();
			var oListRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oTable = new sap.ui.table.Table({
				id: "ActivityTable",
				selectionMode: sap.ui.table.SelectionMode.Single,
				visibleRowCount: 5,
				rows: {
					path: oController.getFormatterPath("Activity", true)
				},
				columns: [new sap.ui.table.Column({
					label: oView.createControl({
						Type: "label",
						Text: "BO_GAMIFICATION_DIMENSION_ACTIVITY_CODE"
					}),
					template: new sap.ui.commons.TextView({
						text: {
							path: oController.getFormatterPath("CODE"),
							formatter: function(sCode) {
								if (!sCode) {
									return "";
								}
								return oController.getTextModel().getText("BO_GAMIFICATION_DIMENSION_ACTIVITY_" + sCode);
							}
						}
					})
				}), new sap.ui.table.Column({
					label: oView.createControl({
						Type: "label",
						Text: "BO_GAMIFICATION_DIMENSION_ACTIVITY_PHASE_CODE"
					}),
					template: new sap.ui.commons.TextView({
						text: {
							parts: [{
								path: oController.getFormatterPath("PHASE_CODE"),
								type: null
                            }, {
								path: oController.getFormatterPath("LoadPhase", true),
								type: null
                            }],
							formatter: function(sCode, bLoadPhase) {
								if (!sCode) {
									return "";
								}
								var oModel = oController.getView().getThingInspectorView().getInspector().getModel("AllPhases");
								if (!oModel) {
									return sCode;
								}
								var aPhase = oModel.getProperty("/");
								if (!aPhase || aPhase.length === 0) {
									return sCode;
								}
								var oPhase = aPhase.find(function(phase) {
									return phase.CODE === sCode;
								});
								if (!oPhase) {
									return sCode;
								}
								return oPhase.DEFAULT_TEXT;
							}
						}
					})
				}), new sap.ui.table.Column({
					label: oView.createControl({
						Type: "label",
						Text: "BO_GAMIFICATION_DIMENSION_ACTIVITY_TIME"
					}),
					template: new sap.ui.commons.TextView({
						text: {
							parts: [{
								path: oController.getFormatterPath("WITHIN_TIME")
						    }, {
								path: oController.getFormatterPath("TIME_UNIT")
							}],
							formatter: function(sTime, sUnit) {
								if (!sTime) {
									return "";
								}
								return (sTime || "") + " " + ((sUnit || "") === "H" ? oView.getText("BO_GAMIFICATION_DIMENSION_ACTIVITY_HOURS_ITEM") :
									oView.getText("BO_GAMIFICATION_DIMENSION_ACTIVITY_DAYS_ITEM"));
							}
						}
					})
				}), new sap.ui.table.Column({
					label: oView.createControl({
						Type: "label",
						Text: "BO_GAMIFICATION_DIMENSION_ACTIVITY_VALUE"
					}),
					template: oView.createControl({
						Type: "textview",
						Text: "VALUE",
						Editable: false
					})
				})],
				rowSelectionChange: function(oEvent) {
					var oCurrentModel = oView.getController().getModel();
					//For table index change then update the corresponding phase list change
					var oCurrentObject = oEvent.getParameter('rowContext').getObject();
	                oController.getView().filterPhaseForActivity(oCurrentObject.ID,oController,oCurrentObject.CODE,true);					
					oCurrentModel.setProperty("/SELECTED_ACTIVITY_INDEX", oEvent.getSource().getSelectedIndex());
	                
					var oDetail = sap.ui.getCore().byId("activityDetail");
					if (oDetail) {
						oDetail.setBindingContext(oEvent.getParameter('rowContext'), oView.getController().getModelName());
					}

				}
			});
			oListRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oTable]
			}));
			oLayout.addRow(oListRow);
		},

		_createActivityDetail: function(oLayout, bEdit) {
			var oController = this.getController();
			var oDetailLayout = new sap.ui.commons.layout.MatrixLayout({
				id: "activityDetail",
				columns: 4,
				widths: ['15%', '20%', '15%', '60%'],
				visible: {
					parts: [{
						path: oController.getFormatterPath("SELECTED_ACTIVITY_INDEX", true)
                    }],
					formatter: function(nIndex) {
						return nIndex >= 0;
					}
				}
			});
			this._createCodeRow(oDetailLayout, bEdit);
			this._createPhaseCodeRow(oDetailLayout, bEdit);
			this._createTimeRow(oDetailLayout, bEdit);
			this._createActivityValueRow(oDetailLayout, bEdit);
			var oListRow = new sap.ui.commons.layout.MatrixLayoutRow();
			oListRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oDetailLayout]
			}));
			oLayout.addRow(oListRow);
		},

		_createCodeRow: function(oDetailLayout, bEdit) {
			var oView = this;
			var oController = oView.getController();
			var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oCodeLabel = this.createControl({
				Type: "label",
				Text: "BO_GAMIFICATION_DIMENSION_ACTIVITY_CODE",
				Tooltip: "BO_GAMIFICATION_DIMENSION_ACTIVITY_CODE"
			});
			var oCodeField = new sap.ui.commons.DropdownBox({
				selectedKey: {
					path: oController.getFormatterPath("CODE")
				},
				editable: bEdit,
				width: "100%",
				required: true,
				change: function(oEvent) {
					// 	var sNew = oEvent.getSource().getSelectedKey();
					// 	if (!sNew) {
					// 		return;
					// 	}
					// 	var i = oView._ACTIVITY_PAIR_CODE_ONE_.findIndex(function(sItem) {
					// 		return sItem === sNew;
					// 	});
					// 	if (i >= 0) {
					// 		oController.getModel().newActivity(oView._ACTIVITY_PAIR_CODE_TWO_[i]);
					// 	}
					// 	i = oView._ACTIVITY_PAIR_CODE_TWO_.findIndex(function(sItem) {
					// 		return sItem === sNew;
					// 	});
					// 	if (i < 0) {
					// 		return;
					// 	}
					// 	oController.getModel().newActivity(oView._ACTIVITY_PAIR_CODE_ONE_[i]);
					var oSelectedActivityCode = oEvent.getSource().getSelectedKey();
					var oBinding = oEvent.getSource().getBinding("selectedKey");
					var oBindingContext;
					if (oBinding) {
						oBindingContext = oBinding.getContext();
					}
					var iBindingID = oBindingContext.getObject().ID;
					oController.getView().filterPhaseForActivity(iBindingID,oController,oSelectedActivityCode);
				}
			});
			oCodeLabel.setLabelFor(oCodeField);
			var oTargetItemTemp = new sap.ui.core.ListItem({
				key: {
					path: "AllActivities>CODE"
				},
				text: {
					path: "AllActivities>NAME"
				}
			});
			oCodeField.bindItems({
				path: "AllActivities>/",
				template: oTargetItemTemp
			});
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oCodeLabel],
				hAlign: sap.ui.commons.layout.HAlign.End
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oCodeField],
				colSpan: 2
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oDetailLayout.addRow(oRow);
		},

		_createPhaseCodeRow: function(oDetailLayout, bEdit) {
			var oController = this.getController();
			var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oPhaseLabel = this.createControl({
				Type: "label",
				Text: "BO_GAMIFICATION_DIMENSION_ACTIVITY_PHASE_CODE",
				Tooltip: "BO_GAMIFICATION_DIMENSION_ACTIVITY_PHASE_CODE",
				Visible: {
					parts: [{
						path: oController.getFormatterPath("CODE")
                    }],
					formatter: function(sCode) {
						if (!sCode) {
							return false;
						}
						var oModel = oController.getView().getThingInspectorView().getInspector().getModel("AllActivities");
						var aActivity = oModel.getProperty("/");
						if (!aActivity || aActivity.length === 0) {
							return false;
						}
						var oActivity = aActivity.find(function(activity) {
							return activity.CODE === sCode;
						});
						if (!oActivity) {
							return false;
						}
						return oActivity.PHASE_CONFIGURABLE;
					}
				}
			});
			var oPhase = new sap.ui.commons.DropdownBox({
				selectedKey: {
					path: oController.getFormatterPath("PHASE_CODE")
				},
				editable: bEdit,
				width: "100%",
				required: true,
				visible: {
					parts: [{
						path: oController.getFormatterPath("CODE")
                    }],
					formatter: function(sCode) {
						if (!sCode) {
							return false;
						}
						var oModel = oController.getView().getThingInspectorView().getInspector().getModel("AllActivities");
						var aActivity = oModel.getProperty("/");
						if (!aActivity || aActivity.length === 0) {
							return false;
						}
						var oActivity = aActivity.find(function(activity) {
							return activity.CODE === sCode;
						});
						if (!oActivity) {
							return false;
						}
						return oActivity.PHASE_CONFIGURABLE;
					}
				},
				change: function() {}
			});
			this._oPhase = oPhase;
			oPhaseLabel.setLabelFor(oPhase);
			var oTargetItemTemp = new sap.ui.core.ListItem({
				key: {
					path: "AllPhases>CODE"
				},
				text: {
					path: "AllPhases>DEFAULT_TEXT"
				},
				enabled:{	path: "AllPhases>DISPLAY"}
			});
			oPhase.bindItems({
				path: "AllPhases>/",
				template: oTargetItemTemp
			});

			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oPhaseLabel],
				hAlign: sap.ui.commons.layout.HAlign.End
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oPhase],
				colSpan: 2
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oDetailLayout.addRow(oRow);
		},

		_createTimeRow: function(oDetailLayout, bEdit) {
			var oController = this.getController();
			var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oTimeLabel = this.createControl({
				Type: "label",
				Text: "BO_GAMIFICATION_DIMENSION_ACTIVITY_TIME",
				Tooltip: "BO_GAMIFICATION_DIMENSION_ACTIVITY_TIME",
				Visible: {
					parts: [{
						path: oController.getFormatterPath("CODE")
                    }],
					formatter: function(sCode) {
						if (!sCode) {
							return false;
						}
						var oModel = oController.getView().getThingInspectorView().getInspector().getModel("AllActivities");
						var aActivity = oModel.getProperty("/");
						if (!aActivity || aActivity.length === 0) {
							return false;
						}
						var oActivity = aActivity.find(function(activity) {
							return activity.CODE === sCode;
						});
						if (!oActivity) {
							return false;
						}
						return oActivity.TIME_CONFIGURABLE;
					}
				}
			});
			var oTimeField = this.createControl({
				Type: "textfield",
				Text: {
					path: oController.getFormatterPath("WITHIN_TIME"),
					type: new sap.ui.ino.models.types.IntegerNullableType()
				},
				Editable: bEdit,
				LabelControl: oTimeLabel,
				Visible: {
					parts: [{
						path: oController.getFormatterPath("CODE")
                    }],
					formatter: function(sCode) {
						if (!sCode) {
							return false;
						}
						var oModel = oController.getView().getThingInspectorView().getInspector().getModel("AllActivities");
						var aActivity = oModel.getProperty("/");
						if (!aActivity || aActivity.length === 0) {
							return false;
						}
						var oActivity = aActivity.find(function(activity) {
							return activity.CODE === sCode;
						});
						if (!oActivity) {
							return false;
						}
						return oActivity.TIME_CONFIGURABLE;
					}
				}
			});
			var oTimeUnit = new sap.ui.commons.DropdownBox({
				selectedKey: {
					path: oController.getFormatterPath("TIME_UNIT")
				},
				editable: bEdit,
				required: true,
				width: "100%",
				visible: {
					parts: [{
						path: oController.getFormatterPath("CODE")
                    }],
					formatter: function(sCode) {
						if (!sCode) {
							return false;
						}
						var oModel = oController.getView().getThingInspectorView().getInspector().getModel("AllActivities");
						var aActivity = oModel.getProperty("/");
						if (!aActivity || aActivity.length === 0) {
							return false;
						}
						var oActivity = aActivity.find(function(activity) {
							return activity.CODE === sCode;
						});
						if (!oActivity) {
							return false;
						}
						return oActivity.TIME_CONFIGURABLE;
					}
				}
			});
			oTimeUnit.addItem(new sap.ui.core.ListItem({
				key: "H",
				text: "{i18n>BO_GAMIFICATION_DIMENSION_ACTIVITY_HOURS_ITEM}"
			}));
			oTimeUnit.addItem(new sap.ui.core.ListItem({
				key: "D",
				text: "{i18n>BO_GAMIFICATION_DIMENSION_ACTIVITY_DAYS_ITEM}"
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oTimeLabel],
				hAlign: sap.ui.commons.layout.HAlign.End
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oTimeField]
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oTimeUnit]
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oDetailLayout.addRow(oRow);
		},

		_createActivityValueRow: function(oDetailLayout, bEdit) {
			var oController = this.getController();
			var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			var oValueLabel = this.createControl({
				Type: "label",
				Text: "BO_GAMIFICATION_DIMENSION_ACTIVITY_VALUE",
				Tooltip: "BO_GAMIFICATION_DIMENSION_ACTIVITY_VALUE"
			});
			var oValueField = this.createControl({
				Type: "textfield",
				Text: "VALUE",
				Node: "Activity",
				Editable: bEdit,
				required: true,
				LabelControl: oValueLabel
			});
			oValueLabel.setLabelFor(oValueField);
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oValueLabel],
				hAlign: sap.ui.commons.layout.HAlign.End
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oValueField],
				colSpan: 2
			}));
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell());
			oDetailLayout.addRow(oRow);
		},
	     filterPhaseForActivity: function(iBindingID,oController,oSelectedActivityCode,bRowChange){
	               if(!oSelectedActivityCode){
	                   return;
	               }
					var aActivities = jQuery.extend(true,[],oController.getModel().getProperty("/Activity"));
					var oModel = oController.getView().getThingInspectorView().getInspector().getModel("AllActivities");
					var aAllActivities = oModel.getProperty("/");
					var oPhaseActivity = aAllActivities.find(function(oActivity) {
						return oActivity.CODE === oSelectedActivityCode && oActivity.PHASE_CONFIGURABLE;
					});
					var aPhases = [];
					if (oPhaseActivity) { //If the selected code need the phase configuration, then rebind the filter
						for (var i = 0; i < aActivities.length; i++) {
							if (aActivities[i].CODE === oSelectedActivityCode && iBindingID !== aActivities[i].ID) {
								aPhases.push(aActivities[i].PHASE_CODE);
							}
						}
					var oPhaseModel = oController.getView().getThingInspectorView().getInspector().getModel("AllPhases");
					var allPhases = oPhaseModel.oData;
						    jQuery.each(allPhases, function(index, oPhase){
						        oPhaseModel.setProperty("/" + index + "/DISPLAY", true); 
						       for(var j = 0; j < aPhases.length; j++){
						        if(oPhase.CODE  === aPhases[j]){
						           oPhaseModel.setProperty("/" + index + "/DISPLAY", false); 
						        }
						        }
						    });	
						    if(bRowChange){
						        oController.getModel().setProperty("/Activity",aActivities);
						    }
				// 		var aFinalFilters = [];
				// 		if(aFilters.length > 1){
				// 		   aFinalFilters.push(new sap.ui.model.Filter({filters:aFilters,and:true}));
				// 		} else {
				// 		    aFinalFilters = aFilters;
				// 		}
				// 		var oPhaseBinding = oController.getView()._oPhase.getBindingInfo("items");
				// // 		oPhaseBinding.filters = aFinalFilters;
				// 		oController.getView()._oPhase.bindItems(oPhaseBinding);
					}	      
	  }
		
		
		
	};
}());