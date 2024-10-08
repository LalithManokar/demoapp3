/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.views.common.PeopleFacetView");

jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.views.common.ObjectInstanceSelection");
jQuery.sap.require("sap.ui.ino.models.object.Group");
jQuery.sap.require("sap.ui.ino.models.object.User");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.controls.AutoComplete");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");

(function() {
	sap.ui.ino.views.common.PeopleFacetView = jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {
		__oRowRepeaterByIdentifier: {},

		onHide: function() {
			var oController = this.getController();
			if (this.__oTabStrip) {
				this.__oTabStrip.detachSelect(oController.__handleTabSelection, oController);
			}
		},

		/**
		 * sTextPrefix: Prefix for UI texts and messages aTabs: Array of Objects with structure: { - childPath: Model
		 * child binding path - identifier: Used to build text keys and messages - text: Tab title text key - settings : { -
		 * readModel: Use central oData read model (true) or use application object (false) - edit: Editing allowed if
		 * in edit mode and read model not used - hideOnEdit: Hide Tab on edit mode - selfDeletion (true) } }
		 */
		createPeopleTabStrip: function(sTextPrefix, oGlobalSettings, aTabs) {
			this.__sTextPrefix = sTextPrefix;
			this.__oGlobalSettings = oGlobalSettings;

			var oController = this.getController();
			var bEdit = oController.isInEditMode();

			var oView = this;

			this.__oTabStrip = new sap.ui.commons.TabStrip({
				width: "100%"
			}).addStyleClass("sapUiInoPeopleTabStrip");

			jQuery.each(aTabs, function(iIndex, oTab) {
				oTab.settings = oTab.settings || {};
				oTab.settings.edit = bEdit && oTab.settings.edit;
				if (oTab.settings.readModel) {
					oTab.settings.edit = false;
				}
				if (oTab.settings.enableContact !== false) {
					oTab.settings.enableContact = true;
				}
				if (!(bEdit && oTab.settings.hideOnEdit)) {
					oView.__oTabStrip.createTab(oController.getTextModel().getText(oTab.text), oView.__createIdentityLayout(oTab.childPath, oTab.identifier,
						oTab.settings));
				}
			});

			this.__oTabStrip.attachSelect(oController.__handleTabSelection, oController);

			if (this.getThingInspectorController().__iCurrentSelectedTab) {
				oController.__reSelectTab(this.getThingInspectorController().__iCurrentSelectedTab);
			} else {
				this.getThingInspectorController().__iCurrentSelectedTab = this.__oTabStrip.getSelectedIndex();
			}

			var content = [new sap.ui.ux3.ThingGroup({
				content: this.__oTabStrip,
				colspan: true
			})];

			return content;
		},

		__createIdentityLayout: function(sChildPath, sIdentifier, oSettings) {
			var oView = this;
			var oController = this.getController();

			var oLayout = new sap.ui.commons.layout.MatrixLayout({
				width: "100%",
				columns: 1
			});
			var oMenuAndReRow = new sap.ui.commons.layout.MatrixLayoutRow();

			var oLayoutMenuAndReLayout = new sap.ui.commons.layout.MatrixLayout({
				width: "100%",
				columns: 1
			});

			//regist checkbox

			if (sIdentifier === "REGISTRATION") {
				var oRegistCheckbox;
				var oNoteText;
				oLayoutMenuAndReLayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%",
					columns: 1,
					visible: {
						path: this.getFormatterPath("IS_OPEN_REGISTER_SETTING", true),
						type: new sap.ui.ino.models.types.IntBooleanType()
					}
				});
				oRegistCheckbox = new sap.ui.commons.CheckBox({
					checked: {
						path: this.getFormatterPath("IS_OPEN_REGISTER_SETTING", true),
						type: new sap.ui.ino.models.types.IntBooleanType()
					},
					editable: oSettings.edit,
					text: "{i18n>BO_PEOPLE_FACET_REGISTRATION_CHECKBOX_NOTE}",
					change: function() {
						oLayoutMenuAndReLayout.setProperty("visible", oRegistCheckbox.getProperty("checked"));
						oNoteText.setProperty("visible", oRegistCheckbox.getProperty("checked"));
					}
				});
				oNoteText = new sap.ui.commons.TextView({
					text: "{i18n>BO_PEOPLE_FACET_REGISTRATION_ADD_NOTE}",
					visible: {
						path: this.getFormatterPath("IS_OPEN_REGISTER_SETTING", true),
						type: new sap.ui.ino.models.types.IntBooleanType()
					}
				});
				//oLayoutMenuAndReLayout.setProperty("visible",oRegistCheckbox.getProperty("checked"));
				//var registerCheckValue = oRegistCheckbox.getChecked();
				var oRowCheck = new sap.ui.commons.layout.MatrixLayoutRow();
				oRowCheck.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: oRegistCheckbox
				}));
				oLayout.addRow(oRowCheck);

				if (oSettings.edit) {
					var oRowNoteText = new sap.ui.commons.layout.MatrixLayoutRow();
					oRowNoteText.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
						content: oNoteText
					}));
					oLayout.addRow(oRowNoteText);
				}
			}

			if (!!sChildPath && (sChildPath.indexOf("Coaches") > -1 || sChildPath.indexOf("Experts") > -1)) {
				var oModel = oController.getModel();
				var oData = oModel.oData;
				var bEditable = false;
				/*if (!oModel.getProperty("/RESP_CODE") || (oModel.getProperty("/Experts") && oModel.getProperty("/Experts").length) || (oModel.getProperty(
					"/Coaches") && oModel.getProperty("/Coaches").length)) {
					bEditable = true;
				} else {
					bEditable = false;
				}
				if (!bEditable) {*/
				var oLinkRow = new sap.ui.commons.layout.MatrixLayoutRow();
				var oLinkBar = new sap.ui.commons.Toolbar({
					width: '100%'
				});
				//if (oSettings.edit) {
				if (oSettings.edit && ((!oModel.getBeforeData() && oModel.getProperty("/RESP_CODE")) || (oModel.getBeforeData() && oModel.getBeforeData()
					.RESP_CODE !== oModel.getProperty("/RESP_CODE")))) {
					oLinkBar.addItem(new sap.ui.commons.TextView({
						text: "{i18n>BO_CAMPAIGN_FACET_ROLES_XINS_SAVE_OR_PUBLISH}"
					}));
					oLinkRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
						content: oLinkBar,
						width: '100%',
						hAlign: sap.ui.commons.layout.HAlign.Left
					}));
					//oLayout.addRow(oLinkRow);
					//return oLayout;
				} else {
					var oRListLink;
					oRListLink = new sap.ui.commons.Link({
						text: oData.RESP_NAME,
						press: function() {
							oController.__updateResp(oData.RESP_ID, oSettings.enableEditResp);
						},
						enabled: true
					});
					oLinkBar.addItem(oRListLink);
					oLinkRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
						content: oLinkBar,
						width: '100%',
						hAlign: sap.ui.commons.layout.HAlign.Left
					}));

				}
				if (oModel.getProperty("/RESP_CODE")) {
					oLayout.addRow(oLinkRow);
				}
				//}
				//return oLayout;
				//}
			}

			if (oSettings.edit || oSettings.enableContact) {
				var oMenuRow = new sap.ui.commons.layout.MatrixLayoutRow();
				var oMenuBar = new sap.ui.commons.Toolbar({
					width: '100%'
				});

				if (oSettings.edit) {

					var oAddIdentityTextField = new sap.ui.ino.controls.AutoComplete({
						placeholder: "{i18n>" + this.__sTextPrefix + "_FLD_ADD_" + sIdentifier + "_PLACEHOLDER}",
						maxPopupItems: 10,
						displaySecondaryValues: true,
						width: "200px",
						searchThreshold: 500,
						suggest: function(oEvent) {
							var sValue = oEvent.getParameter("suggestValue");
							var sSearchPath;
							var oParameters = undefined;
							if (oSettings.searchPath) {
								sSearchPath = sap.ui.ino.views.common.ObjectInstanceSelection.createSearchPath(oSettings.searchPath, sValue);
							} else {
								sSearchPath = sap.ui.ino.views.common.ObjectInstanceSelection["sap.ino.xs.object.iam.Identity"].createSearchPath(sValue);
								//oParameters = sap.ui.ino.views.common.ObjectInstanceSelection["sap.ino.xs.object.iam.Identity"].parameters;
								oParameters = {
							          select: "searchToken,ID,NAME,USER_NAME,TYPE_CODE,IMAGE_ID"
						           };
						
							}
							var oListTemplate = new sap.ui.core.ListItem({
								text: "{NAME}",
								additionalText: "{USER_NAME}",
								key: "{ID}"
							});
							oEvent.getSource().bindAggregation("items", {
								path: sSearchPath,
								template: oListTemplate,
								sorter: oSettings.sorter,
								filters: oSettings.filter ? oSettings.filter(oController.getModel().getData()) : undefined,
								parameters: oParameters,
								length:30
							});
						},
						confirm: function(oEvent) {
							var oSource = oEvent.getSource();
							oController.__addIdentity(oSource, oRowRepeater, sChildPath, sIdentifier, oSettings);
							setTimeout(function() {
								oAddIdentityButton.focus();
								jQuery(oSource).addClass("sapUiTfFoc");
								oSource.focus();
							}, 200);
						}
					});

					oAddIdentityTextField.setFilterFunction(function(sValue, oItem) {
						var bEquals = (oItem.getText().toLowerCase().indexOf(sValue.toLowerCase()) !== -1) || (oItem.getAdditionalText().toLowerCase().indexOf(
							sValue.toLowerCase()) !== -1);
						var model = oController.getModel();
						var aIdentities = model.getProperty("/" + sChildPath);

						var fnFindIdentity = function(array, id) {
							var arr = array || [];
							return jQuery.grep(arr, function(object, idx) {
								return object.IDENTITY_ID == id;
							});
						};

						return bEquals && (fnFindIdentity(aIdentities, oItem.getKey()).length == 0);
					});

					oController.__oIdentityFields[sIdentifier] = oAddIdentityTextField;
					oMenuBar.addItem(oAddIdentityTextField);

					var oAddIdentityButton = new sap.ui.commons.Button({
						layoutData: new sap.ui.commons.form.GridElementData({
							hCells: "1"
						}),
						text: "{i18n>BO_COMMON_BUT_ADD}",
						press: function() {
							oController.__addIdentity(oAddIdentityTextField, oRowRepeater, sChildPath, sIdentifier, oSettings);
						}
					});
					oMenuBar.addItem(oAddIdentityButton);

					var oAddIdentityFromClipboardButton = new sap.ui.commons.Button({
						layoutData: new sap.ui.commons.form.GridElementData({
							hCells: "1"
						}),
						text: "{i18n>BO_COMMON_BUT_ADD_FROM_CLIPBOARD}",
						press: function() {
							oController.__addIdentityFromClipboard(oRowRepeater, sChildPath, sIdentifier, oSettings);
						},
						enabled: {
							path: "clipboard>/changed",
							// bIsEmpty is never read, but used to get notified upon model updates
							formatter: function(bIsEmpty) {
								var bEmpty = sap.ui.ino.models.core.ClipboardModel.sharedInstance().isClipboardEmpty(sap.ui.ino.models.object.User) && sap.ui.ino
									.models.core.ClipboardModel.sharedInstance().isClipboardEmpty(sap.ui.ino.models.object.Group);
								return !bEmpty;
							}
						}
					});
					oMenuBar.addItem(oAddIdentityFromClipboardButton);

					// 	if (oSettings.enableAddResp) {
					// 		var oBtnAddResponsiblity = new sap.ui.commons.Button({
					// 			layoutData: new sap.ui.commons.form.GridElementData({
					// 				hCells: "1"
					// 			}),
					// 			text: "{i18n>BO_CAMPAIGN_FACET_ROLES_FLD_CREATE_RESPONSIBILITY}",
					// 			press: function() {
					// 				oController.__updateResp(-1, oSettings.enableAddResp);
					// 			}
					// 		});
					// 		oMenuBar.addItem(oBtnAddResponsiblity);
					// 	}

					if (oSettings.enableAddUserGroup) {
						var oBtnAddUserGroup = new sap.ui.commons.Button({
							layoutData: new sap.ui.commons.form.GridElementData({
								hCells: "1"
							}),
							text: "{i18n>BO_CAMPAIGN_FACET_ROLES_FLD_CREATE_USER_GROUP}",
							press: function() {
								oController.__updateUserGroup(-1, oSettings.enableAddUserGroup);
							}
						});
						oMenuBar.addItem(oBtnAddUserGroup);
					}
				}

				if (oSettings.enableContact) {
					var sCustomDataBindingPath = sChildPath;
					var sCustomDataTemplateBindingPath = "EMAIL";
					if (!oSettings.readModel) {
						sCustomDataBindingPath = this.getFormatterPath(sCustomDataBindingPath, true);
						sCustomDataTemplateBindingPath = this.getFormatterPath(sCustomDataTemplateBindingPath, false);
					}
					var oContactButton;
					oContactButton = new sap.ui.commons.Button({
						text: "{i18n>" + this.__sTextPrefix + "_BUT_CONTACT_" + sIdentifier + "}",
						press: function() {
							var aRecipients = jQuery.map(this.getCustomData(), function(oCustData) {
								return oCustData.getValue();
							});

							var sSubject = "";
							var oBindingContext = this.getBindingContext();
							if (oView.__oGlobalSettings.mailSettings.type === "campaign") {
								sSubject = oBindingContext.getProperty("NAME");
							} else {
								var sIdeaName = oBindingContext.getProperty("NAME");
								var sCampaignName = oBindingContext.getProperty("CAMPAIGN_SHORT_NAME");

								var oResourceBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
								sSubject = oResourceBundle.getText("GENERAL_MSG_MAIL_SUBJECT_TEMPLATE", [sCampaignName, sIdeaName]);
							}

							oController.__sendMail(aRecipients, sSubject);
						},
						enabled: false,
						customData: {
							path: sCustomDataBindingPath,
							template: new sap.ui.core.CustomData({
								key: "EMAIL",
								value: {
									path: sCustomDataTemplateBindingPath,
									formatter: function(sEmail) {
										if (sEmail) {
											oContactButton.setEnabled(true);
										}
										return sEmail;
									}
								}
							})
						}
					});

					oMenuBar.addRightItem(oContactButton);
				}

				oMenuRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: oMenuBar,
					width: '100%',
					hAlign: sap.ui.commons.layout.HAlign.Left
				}));
				oLayoutMenuAndReLayout.addRow(oMenuRow);

			}

			//add tap change
			var oRowRepeater = new sap.ui.commons.RowRepeater().addStyleClass("sapUiInoBackofficePlainBg");
			if (sIdentifier === "PARTICIPATE") {

				//add Row Title
				var oRowTitle = new sap.ui.commons.layout.MatrixLayout({
					widths: ["34%", "17%", "17%", "17%", "15%"],
					columns: 5,
					height: "40px"
				});
				var oTitleRow = new sap.ui.commons.layout.MatrixLayoutRow();
				oTitleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: new sap.ui.commons.TextView({
						text: "   "
					})
				}));

				oTitleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: new sap.ui.commons.TextView({
						text: "{i18n>BO_COMMON_BUT_SUBMIT_EVAL}"
					})
				}));
				oTitleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: new sap.ui.commons.TextView({
						text: "{i18n>CTRL_EVALUATIONCRITERIA_FLD_COMMENT}"
					})
				}));
				oTitleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: new sap.ui.commons.TextView({
						text: "{i18n>BO_COMMOM_PEOPLE_PRIVILEGE_FOR_VOTE}"
					})
				}));
				oTitleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: new sap.ui.commons.TextView({
						text: "{i18n>BO_COMMOM_PEOPLE_PRIVILEGE_FOR_VIEWONLY}"
					})
				}));
				oRowTitle.addRow(oTitleRow);

				var oTitle = new sap.ui.commons.layout.MatrixLayoutRow();
				oTitle.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: oRowTitle
				}));
				oLayoutMenuAndReLayout.addRow(oTitle);
			}else if(sIdentifier === "REGISTRATION" ){
			    //add Row Title
				var oRestrictRowTitle = new sap.ui.commons.layout.MatrixLayout({
					widths: ["40%", "22%", "22%", "16%"],
					columns: 4
				});
				var oRestrictTitleRow = new sap.ui.commons.layout.MatrixLayoutRow();
				oRestrictTitleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: new sap.ui.commons.TextView({
						text: "   "
					})
				}));

				oRestrictTitleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: new sap.ui.commons.TextView({
						text: "{i18n>BO_COMMOM_PEOPLE_PRIVILEGE_FOR_REGISTER}"
					})
				}));
				oRestrictTitleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: new sap.ui.commons.TextView({
						text: "{i18n>BO_COMMOM_PEOPLE_PRIVILEGE_FOR_VIEWONLY}"
					})
				}));
				oRestrictRowTitle.addRow(oRestrictTitleRow);

				var oRestrictTitle = new sap.ui.commons.layout.MatrixLayoutRow();
				oRestrictTitle.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: oRestrictRowTitle
				}));
				oLayoutMenuAndReLayout.addRow(oRestrictTitle);
			} else if(sIdentifier === "CAMP_MANAGER"){
				var oCampMgrRowTitle = new sap.ui.commons.layout.MatrixLayout({
					widths: ["40%", "22%", "22%", "16%"],
					columns: 4
				});
				var oCampMgrTitleRow = new sap.ui.commons.layout.MatrixLayoutRow();
				oCampMgrTitleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: new sap.ui.commons.TextView({
						text: "   "
					})
				}));

				oCampMgrTitleRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: new sap.ui.commons.TextView({
						text: "{i18n>BO_COMMOM_PEOPLE_MGR_DISPLAY_CAMP_HOMEPAGE}"
					})
				}));
				oCampMgrRowTitle.addRow(oCampMgrTitleRow);

				var oCampMgrTitle = new sap.ui.commons.layout.MatrixLayoutRow();
				oCampMgrTitle.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: oCampMgrRowTitle
				}));
				oLayoutMenuAndReLayout.addRow(oCampMgrTitle);			    
			}
			
			
			this.__bindRepeater(oRowRepeater, sChildPath, sIdentifier, oSettings);
			this.__oRowRepeaterByIdentifier[sIdentifier] = oRowRepeater;

			var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
			oRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: oRowRepeater
			}));
			oLayoutMenuAndReLayout.addRow(oRow);
			oMenuAndReRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
				content: oLayoutMenuAndReLayout
			}));
			oLayout.addRow(oMenuAndReRow);
			return oLayout;

		},

		__bindRepeater: function(oRowRepeater, sChildPath, sIdentifier, oSettings) {
			var oController = this.getController();

			var sModelName = null;
			if (!oSettings.readModel) {
				sModelName = this.getThingInspectorController().getModelName();
			}

			function removeIdentity(oEvent) {
				oController.__removeIdentity(oEvent, oRowRepeater, sChildPath, sIdentifier, oSettings);
			}

			function sendMail(aRecipients) {
				oController.__sendMail(aRecipients);
			}
			// sModelName, sIdProperty, bFilled, bNewTargetWindow
			// bEdit, fnRemove, fnSendMail, sNameProperty, bSelfDeletion
			var oIdentityTemplate;
			if (sIdentifier === "PARTICIPATE") {
			    oIdentityTemplate = sap.ui.ino.application.backoffice.ControlFactory.createParticipantTemplate(sModelName, "IDENTITY_ID", true, true,
					oSettings.edit, removeIdentity, sendMail, undefined, oSettings.selfDeletion);
			} else if(sIdentifier === "REGISTRATION"){
			    oIdentityTemplate = sap.ui.ino.application.backoffice.ControlFactory.createRegistrationTemplate(sModelName, "IDENTITY_ID", true, true,
					oSettings.edit, removeIdentity, sendMail, undefined, oSettings.selfDeletion);
			}else if(sIdentifier === "CAMP_MANAGER"){
			    oIdentityTemplate = sap.ui.ino.application.backoffice.ControlFactory.createCampMgrTemplate(sModelName, "IDENTITY_ID", true, true,
					oSettings.edit, removeIdentity, sendMail, undefined, oSettings.selfDeletion);			    
			}
			else {
				oIdentityTemplate = sap.ui.ino.application.backoffice.ControlFactory.createIdentityTemplate(sModelName, "IDENTITY_ID", true, true,
					oSettings.edit, removeIdentity, sendMail, undefined, oSettings.selfDeletion);
			}
			oRowRepeater.setNoData(new sap.ui.commons.TextView({
				text: "{i18n>" + this.__sTextPrefix + "_MSG_NO_" + sIdentifier + "_ASSIGNED}"
			}));
			var sBindingPath = sChildPath;
			if (!oSettings.readModel) {
				sBindingPath = this.getFormatterPath(sBindingPath, true);
			}
			oRowRepeater.bindRows({
				path: sBindingPath,
				template: oIdentityTemplate
			});
		}
	});

})();