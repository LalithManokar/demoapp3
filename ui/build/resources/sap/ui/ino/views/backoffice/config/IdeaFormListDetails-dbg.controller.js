/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.controller("sap.ui.ino.views.backoffice.config.IdeaFormListDetails", {

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 */
	onExit: function() {
		//also make sure the sub-view is exited
		this.getView().oFieldDetailView.exit();
	},

	isInEditMode: function() {
		return false;
	},

	getTextModelPrefix: function() {
		return "i18n>";
	},

	getCodeModelPrefix: function() {
		return "code>";
	},

	getTextModel: function() {
		if (this.i18n === null) {
			this.i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
		}
		return this.i18n;
	},

	getModelPrefix: function() {
		return "Fields>";
	},

	getModelName: function() {
		return "Fields";
	},

	getModel: function() {
		return this.getView().getModel(this.getModelName());
	},

	getModelKey: function() {
		return this.getModel() && this.getModel().getKey();
	},

	getBoundPath: function(oBinding, absolute) {
		if (typeof oBinding === "object") {
			return oBinding;
		}

		if (absolute) {
			return "{" + this.getModelPrefix() + "/" + oBinding + "}";
		} else {
			return "{" + this.getModelPrefix() + oBinding + "}";
		}
	},

	getBoundObject: function(oBinding, absolute, oType) {
		if (typeof oBinding === "object") {
			return oBinding;
		}
		if (oType) {
			if (absolute) {
				return {
					path: this.getModelPrefix() + "/" + oBinding,
					type: oType
				};
			} else {
				return {
					path: this.getModelPrefix() + oBinding,
					type: oType
				};
			}
		} else {
			if (absolute) {
				return {
					path: this.getModelPrefix() + "/" + oBinding
				};
			} else {
				return {
					path: this.getModelPrefix() + oBinding
				};
			}
		}
	},

	getFormatterPath: function(oBinding, absolute) {
		if (typeof oBinding === "object") {
			return oBinding;
		}
		if (absolute) {
			return this.getModelPrefix() + "/" + oBinding;
		} else {
			return this.getModelPrefix() + oBinding;
		}

	},

	getTextPath: function(oBinding) {
		if (typeof oBinding === "object") {
			return oBinding;
		}
		return "{" + this.getTextModelPrefix() + oBinding + "}";
	}
});