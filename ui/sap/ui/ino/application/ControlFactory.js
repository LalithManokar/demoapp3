/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.application.ControlFactory");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

jQuery.sap.require("sap.ui.ino.models.core.CodeModel");

jQuery.sap.require("sap.ui.ino.controls.IdeaCard");
jQuery.sap.require("sap.ui.ino.controls.IdentityCard");

jQuery.sap.require("sap.ui.ino.models.types.FalsyBlankType");
jQuery.sap.require("sap.ui.ino.models.types.NonEmptyFalsyBlankType");
jQuery.sap.require("sap.ui.ino.controls.BusyIndicator");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.Message");

(function() {
	"use strict";

	jQuery.sap.require("sap.ui.ino.application.Configuration");
	var Configuration = sap.ui.ino.application.Configuration;

	function _getApplication() {
		return sap.ui.ino.application.ApplicationBase.getApplication();
	}

	function _getResourceBundle() {
		return sap.ui.getCore().getModel("i18n").getResourceBundle();
	}

	sap.ui.ino.application.ControlFactory = {

		createIdeaCard: function(oSettings) {

			var oDefaultSettings = {
				sModelPrefix: "",
				bJSONModel: false,
				bIconMode: false,
				bNavigationMode: true,
				bCommentNavigationMode: false,
				sNavigationTargetComponent: undefined,
				sCampaignTarget: "",
				bMobileMode: false
			};

			oSettings = jQuery.extend(oDefaultSettings, oSettings);
			var oDateType = new sap.ui.model.type.Date();

			// JSON Models do not create Date objects automatically so we
			// have to parse the ISO date string
			if (oSettings.bJSONModel) {
				oDateType = new sap.ui.model.type.Date({
					source: {
						pattern: "yyyy-MM-ddTHH:mm:ss.SSSz"
					}
				});
			}

			function getNavigationLink(sPath, oNavigationData) {
				return _getApplication().getExternalNavigationLink("sap.ino.config.URL_PATH_UI_FRONTOFFICE", sPath, oNavigationData);
			}

			var oDetailsURL = {
				path: oSettings.sModelPrefix + "ID",
				formatter: function(iIdeaId) {
					return getNavigationLink("idea", iIdeaId);
				}
			};

			var oCampaignURL = {
				path: oSettings.sModelPrefix + "CAMPAIGN_ID",
				formatter: function(iCampaignId) {
					return getNavigationLink("campaign", iCampaignId);
				}
			};

			var oIdeaCard = new sap.ui.ino.controls.IdeaCard({
				ideaId: "{" + oSettings.sModelPrefix + "ID}",
				title: "{" + oSettings.sModelPrefix + "NAME}",
				campaignId: "{" + oSettings.sModelPrefix + "CAMPAIGN_ID}",
				campaignTitle: "{" + oSettings.sModelPrefix + "CAMPAIGN_SHORT_NAME}",
				campaignColor: "{" + oSettings.sModelPrefix + "CAMPAIGN_COLOR}",
				detailsURL: oDetailsURL,
				campaignURL: oCampaignURL,
				campaignTarget: "_blank",
				imageSrc: {
					parts: [{
						path: oSettings.sModelPrefix + "TITLE_IMAGE_ID"
                    }, {
						path: oSettings.sModelPrefix + "TITLE_IMAGE_MEDIA_TYPE"
                    }],
					formatter: function(iTitleImageId, sMediaType) {
						if (sMediaType && sMediaType.indexOf("image/") === 0) {
							if (oSettings.bIconMode) {
								return Configuration.getAttachmentDownloadURL(iTitleImageId);
							} else {
								return Configuration.getAttachmentTitleImageDownloadURL(iTitleImageId);
							}
						}
						return null;
					}
				},
				videoSrc: {
					parts: [{
						path: oSettings.sModelPrefix + "TITLE_IMAGE_ID"
                    }, {
						path: oSettings.sModelPrefix + "TITLE_IMAGE_MEDIA_TYPE"
                    }],
					formatter: function(iTitleImageId, sMediaType) {
						if (sMediaType && sMediaType.indexOf("video/") === 0) {
							if (oSettings.bIconMode) {
								return Configuration.getAttachmentDownloadURL(iTitleImageId);
							} else {
								return Configuration.getAttachmentTitleImageDownloadURL(iTitleImageId);
							}
						}
						return null;
					}
				},
				mediaType: {
					path: oSettings.sModelPrefix + "TITLE_IMAGE_MEDIA_TYPE"
				},
				preDescriptionLine: new sap.ui.commons.Label({
					text: {
						parts: [oSettings.sModelPrefix + "SUBMITTER_NAME", {
							path: oSettings.sModelPrefix + "CREATED_AT",
							type: oDateType
                        }, {
							path: oSettings.sModelPrefix + "SUBMITTED_AT",
							type: oDateType
                        }],
						formatter: function(sSubmitter, sCreatedAt, sSubmittedAt) {
							var sDate = sSubmittedAt || sCreatedAt;
							return _getResourceBundle().getText("FACTORY_COMMON_TIT_AUTHOR_DATE", [sSubmitter, sDate]);
						}
					},
					tooltip: this.createIdentityCallout("{" + oSettings.sModelPrefix + "SUBMITTER_ID}")
				}),
				commentCount: {
					path: oSettings.sModelPrefix + "COMMENT_COUNT",
					formatter: function(count) {
						var commentCount = parseInt(count, 10);
						if (isNaN(commentCount)) {
							commentCount = 0;
						}
						return commentCount;
					}
				},
				commentText: {
					path: oSettings.sModelPrefix + "COMMENT_COUNT",
					formatter: function(count) {
						var commentCount = parseInt(count, 10);
						if (isNaN(commentCount)) {
							commentCount = 0;
						}

						var sText;
						if (commentCount === 0) {
							sText = "CTRL_IDEACARD_FLD_COMMENT_TEXT_0";
						} else if (commentCount === 1) {
							sText = "CTRL_IDEACARD_FLD_COMMENT_TEXT_1";
						} else {
							sText = "CTRL_IDEACARD_FLD_COMMENT_TEXT_MULTIPLE";
						}

						sText += ((oSettings.bNavigationMode || oSettings.bCommentNavigationMode) && !oSettings.bIconMode ? "" : "_NO_NAV");

						return _getResourceBundle().getText(sText, [commentCount]);
					}
				},
				voteId: "{" + oSettings.sModelPrefix + "VOTE_ID}",
				voteType: "{" + oSettings.sModelPrefix + "VOTE_TYPE_TYPE_CODE}",
				voteCount: "{" + oSettings.sModelPrefix + "VOTE_COUNT}",
				isVoteActive: false,
				ideaScore: "{" + oSettings.sModelPrefix + "SCORE}",
				ideaScoreLike: {
					path: oSettings.sModelPrefix + "POS_VOTES",
					formatter: function(posVotes) {
						var posVotesNum = parseInt(posVotes, 10);
						if (isNaN(posVotesNum)) {
							posVotesNum = 0;
						}
						return posVotesNum;
					}
				},
				ideaScoreDislike: {
					path: oSettings.sModelPrefix + "NEG_VOTES",
					formatter: function(negVotes) {
						var negVotesNum = parseInt(negVotes, 10);
						if (isNaN(negVotesNum)) {
							negVotesNum = 0;
						}
						return negVotesNum;
					}
				},
				maxStarNo: "{" + oSettings.sModelPrefix + "MAX_STAR_NO}",
				campaignOpenForVote: 1,
				userScore: "{" + oSettings.sModelPrefix + "USER_SCORE}",
				text: {
					path: oSettings.sModelPrefix + "SHORT_DESCRIPTION",
					formatter: function(sVal) {
						return sVal;
					}
				},
				processSteps: "{" + oSettings.sModelPrefix + "STEPS}",
				currentStep: "{" + oSettings.sModelPrefix + "STEP}",
				processRunning: {
					path: oSettings.sModelPrefix + "STATUS",
					formatter: function(sVal) {
						return (sVal !== "sap.ino.config.DISCONTINUED" && sVal !== "sap.ino.config.MERGED");
					}
				},
				style: "bubbles",
				phaseText: {
					path: oSettings.sModelPrefix + "PHASE",
					formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.campaign.Phase.Root")
				},
				statusText: {
					path: oSettings.sModelPrefix + "STATUS",
					formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.status.Status.Root")
				},
				isDraft: {
					path: oSettings.sModelPrefix + "STATUS",
					formatter: function(sStatus) {
						return sStatus === "sap.ino.config.DRAFT";
					}
				},
				editMode: false,
				iconMode: oSettings.bIconMode,
				navigationMode: oSettings.bNavigationMode,
				commentNavigationMode: oSettings.bCommentNavigationMode,
				moreButtonText: _getResourceBundle().getText("FACTORY_COMMON_XLNK_MORE"),
				flipButtonTooltip: "{i18n>CTRL_IDEACARD_TIT_FLIP}",
				mobileMode: oSettings.bMobileMode,
				onCommentClicked: function(oEvent) {
					_getApplication().navigateToByURLInNewWindow(getNavigationLink("idea", oEvent.getSource().getIdeaId()) +
						"/?section=sectionComments");
				}
			});
			return oIdeaCard;
		},

		getNotificationTargetURL: function() {
			return {
				parts: [{
					path: "OBJECT_TYPE_CODE"
                }, {
					path: "OBJECT_ID"
                }, {
					path: "NOTIFICATION_CODE"
                }],
				formatter: function(sType, sId, sCode) {
					if (sCode === "IDEA_DELETED") {
						return null;
					}
					var oData = sId;
					switch (sType) {
						case "IDEA":
							sType = "idea";
							/*
							 * if (sCode == "EXPERT_ASSIGNED") { oData = { id : sId, view : "myevaluations" }; }
							 */
							break;
						case "CAMPAIGN":
							sType = "campaign";
							break;
					}
					return _getApplication().getNavigationLink(sType, oData);
				}

			};
		},

		createMailObject: function() {
			var oMailObject = {
				getMailAddresses: function(aBindingContext, oModel) {
					var aResult = [],
						oMap = {},
						sValue;
					jQuery.each(aBindingContext, function(i, oContext) {
						sValue = oModel.getProperty("EMAIL", oContext);
						if (!oMap[sValue]) {
							oMap[sValue] = true;
							aResult.push(sValue);
						}
					});
					return aResult;
				},

				executeMailTo: function(aRecipients, sBody, sSubject) {
					var sMailAddresses = this.removeDuplicates(aRecipients).join(";");
					sSubject = sSubject || _getResourceBundle().getText("GENERAL_MSG_MAIL_SUBJECT");
					window.location = "mailto:" + sMailAddresses + "?subject=" + sSubject + "&body=" + sBody;
				},

				removeDuplicates: function(aRecipients) {
					var aRecipientsUnique = [];
					jQuery.each(aRecipients, function(i, sRecipient) {
						var sRecipientFormatted = sRecipient.trim();
						if (jQuery.inArray(sRecipientFormatted, aRecipientsUnique) === -1) {
							aRecipientsUnique.push(sRecipientFormatted);
						}
					});
					return aRecipientsUnique;
				}
			};

			return oMailObject;
		},

		createRichTextEditor: function(sId, sValueBindingPath, sHeight, bAdvancedMode, bValidateBlank, bSanitizeValue, sFileLabel, bHideImg,
			bHideEmoticons) {
			return this.createRichTextEditorWithSetting({
				"sId": sId,
				"sValueBindingPath": sValueBindingPath,
				"sHeight": sHeight,
				"bAdvancedMode": bAdvancedMode,
				"bValidateBlank": bValidateBlank,
				"bSanitizeValue": bSanitizeValue,
				"sFileLabel": sFileLabel,
				"bHideImg": bHideImg,
				"bHideEmoticons": bHideEmoticons,
				"fnUpload": function(oConfiguration, oAttachment, oFileBlob, oFile, sLabel, fnSuccess, fnFailure) {
					oAttachment.uploadFile(oFileBlob, oFile.filename(), undefined, undefined, undefined, sLabel)
						.done(function(oResponse) {
							fnSuccess(oConfiguration.getAttachmentDownloadURL(oResponse.GENERATED_IDS[-1]));
						}).fail(function() {
							fnFailure();
						});
				}
			});
		},

		createRichTextEditorWithSetting: function(oSetting) {
			jQuery.sap.require("sap.ui.ino.controls.RichTextEditor"); // #ANALYZE_UI: Conditional require
			jQuery.sap.require("sap.ui.ino.models.object.Attachment");

			var Attachment = sap.ui.ino.models.object.Attachment;
			var oValueType = new sap.ui.ino.models.types.FalsyBlankType();
			if (oSetting.bValidateBlank) {
				oValueType = new sap.ui.ino.models.types.NonEmptyFalsyBlankType();
			}
			var bSanitizeValue = oSetting.bSanitizeValue === undefined ? true : oSetting.bSanitizeValue;
			var bHideImg = oSetting.bHideImg,
				bHideEmoticons = oSetting.bHideEmoticons,
				bAdvancedMode = oSetting.bAdvancedMode,
				sFileLabel = oSetting.sFileLabel,
				fnUploadImg = oSetting.fnUpload,
				bDisablePowerpaste = oSetting.bDisablePowerpaste;
			var oRichTextEditor = new sap.ui.ino.controls.RichTextEditor({
				id: oSetting.sId,
				editorType: sap.ui.richtexteditor.RichTextEditor.EDITORTYPE_TINYMCE4,
				value: {
					path: oSetting.sValueBindingPath,
					type: oValueType
				},
				useLegacyTheme: false,
				sanitizeValue: bSanitizeValue,
				width: "100%",
				height: oSetting.sHeight,
				showGroupFont: true,
				showGroupInsert: true,
				showGroupLink: true,
				beforeEditorInit: function(c) {
					if (bHideImg) {
						c.mParameters.configuration.plugins = c.mParameters.configuration.plugins.replace("image,", "");
					}
					if (bHideEmoticons) {
						c.mParameters.configuration.plugins = c.mParameters.configuration.plugins.replaceAll("emoticons,", "");
					}
					c.mParameters.configuration.link_context_toolbar = true;
					if(bDisablePowerpaste){
					    c.mParameters.configuration.plugins = c.mParameters.configuration.plugins.replace("powerpaste", "")
					}
					if (!bHideImg) {
						c.mParameters.configuration.paste_data_images = true;
						c.mParameters.configuration.automatic_uploads = true;
					}
					if(bDisablePowerpaste){
					    c.mParameters.configuration.paste_data_images = false;
					}
					c.mParameters.configuration.powerpaste_word_import = "clean";
					c.mParameters.configuration.powerpaste_html_import = "clean";
					c.mParameters.configuration.default_link_target = "none";
					if (!bHideImg) {
						c.mParameters.configuration.images_upload_handler = function(oFile, success, failure) {
							var oFileToUpload = oFile.blob();
							if (oFileToUpload) {
								fnUploadImg(Configuration, Attachment,  oFileToUpload, oFile, sFileLabel, success, failure);
							}
						};
					}
					c.mParameters.configuration.fontsize_formats =
						"8pt 8.5pt 9.5pt 10pt 10.5pt 11pt 11.5pt 12pt 12.5pt 14pt 14.5pt 18pt 18.5pt 24pt 24.5pt 36pt";
					if(!bDisablePowerpaste){
    					c.mParameters.configuration.paste_postprocess = function(editor, fragment) {
    						window.tinymce.activeEditor.uploadImages();
    					};
					}
				}
			});
			if (bAdvancedMode) {
				oRichTextEditor.addButtonGroup({
					name: "media",
					priority: 10,
					row: 0,
					visible: true,
					buttons: ["media", "code", "preview"]
				});
			}
			oRichTextEditor.addButtonGroup({
				name: "format",
				priority: 10,
				row: 1,
				visible: true,
				buttons: ["hr", "removeformat", "formatselect", "sub", "sup", "charmap", "table", "code"]
			});

			return oRichTextEditor;
		},

		// TODO use binding w/ separate model (as we do it in the backoffice) for the frontoffice too
		createRichTextEditorNoBinding: function(sId, sHeight, bAdvancedMode, bValidateBlank) {
			jQuery.sap.require("sap.ui.ino.controls.RichTextEditor"); //conditional require

			var oValueType = new sap.ui.ino.models.types.FalsyBlankType();
			if (bValidateBlank) {
				oValueType = new sap.ui.ino.models.types.NonEmptyFalsyBlankType();
			}

			var oRichTextEditor = new sap.ui.ino.controls.RichTextEditor({
				id: sId,
				editorType: sap.ui.richtexteditor.RichTextEditor.EDITORTYPE_TINYMCE4,
				/*
				 * value : { path : sValueBindingPath, type : oValueType },
				 */
				required: false,
				useLegacyTheme: false,
				sanitizeValue: true,
				width: "100%",
				height: sHeight,
				showGroupFontStyle: true,
				showGroupTextAlign: true,
				showGroupStructure: true,
				showGroupFont: true,
				showGroupClipboard: false,
				showGroupInsert: true,
				showGroupLink: true,
				showGroupUndo: true,
				plugins: [{
					name: "media"
                }, {
					name: "image"
                }, {
					name: "preview"
                }, {
					name: "link"
                }, {
					name: "textcolor"
                }, {
					name: "colorpicker"
                }, {
					name: "textpattern"
                }, {
					name: "code"
                }]
			});
			if (bAdvancedMode) {
				oRichTextEditor.addButtonGroup({
					name: "media",
					priority: 10,
					row: 0,
					visible: true,
					buttons: ["media", "code", "preview"]
				});
			}
			oRichTextEditor.addButtonGroup({
				name: "format",
				priority: 10,
				row: 1,
				visible: true,
				buttons: ["hr", "removeformat", "formatselect", "sub", "sup", "charmap"]
			});

			// as "value" is not bound it never validates itself
			var fnUpdate = oRichTextEditor.updateModelProperty;
			oRichTextEditor.updateModelProperty = function(sProperty, sNew, sOld) {
				if (sProperty === "value") {
					try {
						oValueType.validateValue(sNew);
					} catch (oException) {
						// TODO create correct validation message to be used for notifications
						oException.element = oRichTextEditor;
						oRichTextEditor.fireValidationError(oException);
					}
				} else {
					fnUpdate.apply(oRichTextEditor, [sProperty, sNew, sOld]);
				}
			};
			return oRichTextEditor;
		},

		createIdentityCallout: function(iIdentityId) {
			var oCallout = new sap.ui.commons.Callout({
				customData: [new sap.ui.core.CustomData({
					key: "identity",
					value: iIdentityId
				})],
				open: function() {
					var sIdentity = "/Identity(" + this.data().identity + ")";
					if (this.getContent().length === 0) {
						var oIdentityCard = new sap.ui.ino.controls.IdentityCard({
							name: "{NAME}",
							phone: "{PHONE}",
							mobile: "{MOBILE}",
							email: "{EMAIL}",
							office: "{OFFICE}",
							costCenter: "{COST_CENTER}",
							organization: "{ORGANIZATION}",
							imageId: "{IDENTITY_IMAGE_ID}"
						});
						this.addContent(oIdentityCard);
						oIdentityCard.setModel(sap.ui.getCore().getModel());
					}
					this.getContent()[0].bindElement(sIdentity);
				}
			}).addStyleClass("sapUiInoNoShadow");
			return oCallout;
		},

		onTermConditionSelected: function(oEvent) {
			var bSelected = oEvent.getParameter("checked");

			Configuration.getUserModel().setProperty("/data/USER_ACCEPTED", bSelected ? true : false);

		},
		onTermsConditionsClose: function() {
			var oTermData = {
				"TERM_CODE": this.getModel('module').getProperty("sap.ino.config.TERM_CODE"),
				"TERM_CHANGED_AT": this.getModel('module').getProperty('sap.ino.config.TERM_CHANGED_AT')
			};

			var oDialog = sap.ui.getCore().byId("termsAndConditions");
			var fnTermAcceptCallBack = Configuration.getUserModel().getProperty("/data/TERMACCEPTCALLBACK");

			var fnAcceptTermConditionSucess = function() {

				Configuration.getUserModel().setProperty("/data/TERM_ACCEPTED", 1);

				sap.ui.ino.controls.BusyIndicator.hide();

				oDialog.close();

				if (fnTermAcceptCallBack) {
					fnTermAcceptCallBack();
				}
			};

			var fnAcceptTermConditionFailed = function() {

				var oMessages = new sap.ui.ino.application.Message({
					text: sap.ui.getCore().getModel("i18n").getResourceBundle().getText("USER_TERM_AND_CONDITIONS_FAILD"),
					level: sap.ui.core.MessageType.Information
				});
				sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessages([oMessages]);
			};
			//"1" Active Term & Condtion,  "0" , Deactive Term & Conditioan
			var sTermConditionActive = Configuration.getSystemSetting("sap.ino.config.TERMS_AND_CONDITIONS_ACTIVE");
			var sTermCode = Configuration.getSystemSetting("sap.ino.config.TERMS_AND_CONDITIONS_TEXT");

			if (sTermConditionActive === '1' && sTermCode) {
				var sTermServiceURI = "/" + Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_TERM_ACCEPT");

				jQuery.ajax({
					url: Configuration.getBackendRootURL() + sTermServiceURI,
					headers: {
						"X-CSRF-Token": Configuration.getXSRFToken()
					},
					method: "POST",
					cache: false,
					data: JSON.stringify(oTermData),
					success: fnAcceptTermConditionSucess,
					error: fnAcceptTermConditionFailed
				});
			} else {

				oDialog.close();
				if (fnTermAcceptCallBack) {
					fnTermAcceptCallBack();
				}
			}
		},

		createTermsAndConditionsDialog: function() {

			var oDialog = sap.ui.getCore().byId("termsAndConditions");
			if (oDialog !== undefined && oDialog !== null) {
				return oDialog;
			}

			var oTermContent = new sap.ui.core.HTML({
				content: {
					path: "systemSettings>/sap.ino.config.TERMS_AND_CONDITIONS_TEXT",
					formatter: function(sCode) {
						if (sCode === null || sCode === undefined) {
							return undefined;
						}

						//reset content 
						this.setContent("");

						var oModel = sap.ui.getCore().getModel("module");
						return oModel.getProperty(sCode);
					}
				},
				sanitizeContent: true
			});

			var oTermAndConditionContentLayout = new sap.ui.layout.HorizontalLayout({
				allowWrapping: true,
				content: oTermContent
			}).addStyleClass("sapInoTermConditionText");

			var oCheckBox = new sap.ui.commons.CheckBox({
				text: "{i18n>FO_USER_TERM_AND_CONDITIONS}",
				selected: "{user>/data/TERM_ACCEPTED}",
				change: this.onTermConditionSelected,
				visible: "{user>/data/TERMACTION}"

			});

			var oCheckBoxLayout = new sap.ui.layout.HorizontalLayout({
				allowWrapping: true,
				content: oCheckBox
			}).addStyleClass("sapInoTermConditionBottom");

			var oTermAndConditionLayout = new sap.ui.layout.VerticalLayout({
				content: [oTermAndConditionContentLayout, oCheckBoxLayout]
			});

			var oCloseButton = new sap.ui.commons.Button({
				text: "{i18n>TERMS_CONDITIONS_BTN_OK}",
				press: this.onTermsConditionsClose,
				enabled: "{user>/data/USER_ACCEPTED}"

			});

			oDialog = new sap.ui.commons.Dialog({
				title: "{i18n>FO_APPLICATION_MIT_TERM_CONDITIONS}",
				id: "termsAndConditions",
				width: "100%",
				height: "100%",
				maxWidth: "1190px",
				maxHeight: "80%",
				showCloseButton: false,
				content: oTermAndConditionLayout,
				buttons: [oCloseButton]
			});

			oDialog.setModel(Configuration.getUserModel(), "user");

			return oDialog;
		}
	};
})();