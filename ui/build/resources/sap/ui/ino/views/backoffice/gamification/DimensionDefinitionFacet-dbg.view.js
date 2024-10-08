/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.core.ListItem");
jQuery.sap.require("sap.ui.commons.DropdownBox");
jQuery.sap.require("sap.ui.commons.RowRepeater");
jQuery.sap.require("sap.ui.commons.Button");
jQuery.sap.require("sap.ui.table.TreeTable");
jQuery.sap.require("sap.ui.model.Filter");
jQuery.sap.require("sap.ui.commons.MessageBox");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.views.backoffice.gamification.DimensionGeneralMixin");
jQuery.sap.require("sap.ui.ino.views.backoffice.gamification.DimensionActivityMixin");
jQuery.sap.require("sap.ui.ino.views.backoffice.gamification.DimensionBadgeMixin");
var Configuration = sap.ui.ino.application.Configuration;

sap.ui.jsview("sap.ui.ino.views.backoffice.gamification.DimensionDefinitionFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView,
	sap.ui.ino.views.backoffice.gamification.DimensionGeneralMixin,
	sap.ui.ino.views.backoffice.gamification.DimensionActivityMixin,
	sap.ui.ino.views.backoffice.gamification.DimensionBadgeMixin, {
		getControllerName: function() {
			return "sap.ui.ino.views.backoffice.gamification.DimensionDefinitionFacet";
		},

		createFacetContent: function(oController) {
			var bEdit = oController.isInEditMode();
			return [this.createCommonThingGrp(bEdit)];
		},

		createCommonThingGrp: function(bEdit) {
			var oLayout = new sap.m.VBox();
			oLayout.addStyleClass("sapInoGamificationDimension");
			oLayout.addItem(this.createGeneralContentThingGroup(bEdit));
			oLayout.addItem(this.createActivitiesThingGroup(bEdit));
			oLayout.addItem(this.createBadgeThingGroup(bEdit));
			return new sap.ui.ux3.ThingGroup({
				content: [oLayout],
				colspan: true
			});
		}
	}));