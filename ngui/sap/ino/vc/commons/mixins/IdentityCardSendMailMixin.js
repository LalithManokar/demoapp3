sap.ui.define([
    "sap/ino/vc/commons/mixins/MailMixin",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
    ],
	function(MailMixin, Configuration, JSONModel, MessageToast, MessageBox) {
		"use strict";

		/**
		 * @class
		 * Mixin that provides common functionality for Identity Card Mail Action handling
		 */
		var IdentityCardSendMailMixin = function() {
			throw "Mixin may not be instantiated directly";
		};

		var _oUserModel = new JSONModel();
		var _oMailModel = new JSONModel();

		IdentityCardSendMailMixin.getEmailDialog = function() {
			if (!this._oEmailDialog) {
				this._oEmailDialog = this.createFragment("sap.ino.vc.iam.fragments.SendEmail", this.getView().createId());
				this.getView().addDependent(this._oEmailDialog);
				this._oEmailDialog.setModel(_oMailModel, "mail");
			}

			return this._oEmailDialog;
		};

		IdentityCardSendMailMixin.getMailSignatureBody = function(sBody, bWithEmailAddr) {
			var sAppTitle = Configuration.getSystemSetting('sap.ino.config.APPLICATION_TITLE');
			if (!sAppTitle || sAppTitle === "") {
				sAppTitle = "SAP Innovation Management";
			}
			var sUsername = this.getModel('user').getProperty("/data/NAME");
			var sSignature = this.getText("MAIL_SIGNATURE_TEMPLATE", [sAppTitle, sUsername]);
			sBody = sBody + "\n\n\n\n\n\n\n\n\n\n\n" + sSignature;

			if (bWithEmailAddr) {
				sBody = sBody + '\n' + this.getModel('user').getProperty("/data/EMAIL");
			}

			return sBody;
		};

		IdentityCardSendMailMixin.onMailPressed = function(oEvent) {
			var iIdentityId = oEvent.getParameter("identityId");
			var sUserName = oEvent.getParameter("userName");
			var oContent = MailMixin.createMailContent.apply(this);
			var that = this;

			_oUserModel.loadData(Configuration.getUserProfileByTextURL(iIdentityId), {
				"USER_ID": iIdentityId
			}, false, "GET");

			if (_oUserModel.getProperty("/CONTACT_DETAIL") && _oUserModel.getProperty("/CONTACT_DETAIL/EMAIL")) {
				sap.m.URLHelper.triggerEmail(_oUserModel.getProperty("/CONTACT_DETAIL/EMAIL"), oContent.subject, oContent.body);
			} else {
				var fnOpenEmailDialog = function(bWithEmailAddr) {
					oContent.body = that.getMailSignatureBody(oContent.body, bWithEmailAddr);

					_oMailModel.setData(oContent);
					_oMailModel.setProperty("/username", sUserName);
					_oMailModel.setProperty("/to_identity", iIdentityId);

					var oMailDialog = that.getEmailDialog();
					oMailDialog.open();
				};

				MessageBox.confirm(this.getText("MAIL_MSG_SEND_CONFIRMATION"), {
					title: this.getText("MAIL_CONFIRMATION_LABEL"),
					icon: MessageBox.Icon.NONE,
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					onClose: function(bAction) {
						if (bAction === "YES") {
							fnOpenEmailDialog(true);
						} else {
							fnOpenEmailDialog(false);
						}
					}
				});
			}
		};

		IdentityCardSendMailMixin.onIdeaContactMail = function(aPeople) {
			var that = this;
			var aIdentityId = aPeople.map(function(oPeople) {
				return oPeople.IDENTITY_ID;
			});
			var sUserNames = aPeople.map(function(oPeople) {
				return oPeople.NAME;
			}).join(";");
			var oContent = MailMixin.createMailContent.apply(this);

			var fnOpenEmailDialog = function(bWithEmailAddr) {
				oContent.body = that.getMailSignatureBody(oContent.body, bWithEmailAddr);

				_oMailModel.setData(oContent);
				_oMailModel.setProperty("/username", sUserNames);
				_oMailModel.setProperty("/to_identity", aIdentityId);

				var oMailDialog = that.getEmailDialog();
				oMailDialog.open();
			};

			MessageBox.confirm(this.getText("MAIL_MSG_SEND_CONFIRMATION"), {
				title: this.getText("MAIL_CONFIRMATION_LABEL"),
				icon: MessageBox.Icon.NONE,
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				onClose: function(bAction) {
					if (bAction === "YES") {
						fnOpenEmailDialog(true);
					} else {
						fnOpenEmailDialog(false);
					}
				}
			});
		};

		IdentityCardSendMailMixin.onEmailDialogSend = function() {
			var that = this;
			var oData = {
				TO_IDENTITY: _oMailModel.getProperty("/to_identity"),
				SUBJECT: _oMailModel.getProperty("/subject"),
				CONTENT: _oMailModel.getProperty("/body")
			};
			var sSendEmailURI = "/sap/ino/xs/rest/common/send_identity_email.xsjs";

			jQuery.ajax({
				url: Configuration.getBackendRootURL() + sSendEmailURI,
				headers: {
					"X-CSRF-Token": Configuration.getXSRFToken()
				},
				method: "POST",
				cache: false,
				data: JSON.stringify(oData),
				success: function() {
					MessageToast.show(that.getText("MAIL_MSG_SEND_SUCCESS"));
					that._oEmailDialog.close();
				},
				error: function() {
					MessageToast.show(that.getText("MAIL_MSG_SEND_ERROR"));
				}
			});
		};

		IdentityCardSendMailMixin.onEmailDialogCancel = function() {
			this._oEmailDialog.close();
		};

		return IdentityCardSendMailMixin;
	});