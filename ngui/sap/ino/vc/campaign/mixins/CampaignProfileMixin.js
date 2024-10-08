sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function(JSONModel) {
    "use strict";

    /**
     * @class
     * Mixin for a short Identity Profile
     */
    var IdentityMixin = function() {
        throw "Mixin may not be instantiated directly";
    };
    
    IdentityMixin.bindIdentityProfile = function(oIdentityProfile, mSettings, iContextId, oIdentityProfileButtons) {
        this._mIdentityMixinIdentityProfile = oIdentityProfile;
        this._setIdentityProfileContext(iContextId || 0);
        if (oIdentityProfile) {
            oIdentityProfile.bindElement("data>" + mSettings.PATH);
            oIdentityProfile.setModel(new JSONModel(mSettings), "IdentityProfile");
            
            if(oIdentityProfileButtons) {
                oIdentityProfileButtons.bindElement("data>" + this.getView().getBindingContext("data").sPath);
            }
        }
    };
    
    IdentityMixin.onIdentityProfileCreateIdea = function() {
        this.navigateTo("idea-create", {query: {campaign: this._getIdentityProfileContext()}});
    };
    
    IdentityMixin.onIdentityProfileCreateWall = function() {
        jQuery.sap.require("sap.ino.commons.models.object.Wall");
        var Wall = sap.ino.commons.models.object.Wall;
        var that = this;
        Wall.create({
            ID : -1,
            NAME : that.getText("WALL_BUT_CREATE_WALL_NAME"),
            WALL_TYPE_CODE : "sap.ino.config.WALL",
            BACKGROUND_IMAGE_REPEAT: 0,
            BACKGROUND_IMAGE_URL: "cork.jpg",
            BACKGROUND_IMAGE_ZOOM: 0
        }).done(function(oRequest) {
            that.navigateToWall("wall", {
                id : oRequest.GENERATED_IDS[-1]
            });
        });
    };
   IdentityMixin.onIdentityProfileCreateBlog = function()
   {
       this.navigateTo("blog-create", {query: {campaign: this._getIdentityProfileContext()}});
   };    
    
    IdentityMixin.formatIdentityProfileText = function(sKey) {
        var oProfile = this._mIdentityMixinIdentityProfile;
        if (oProfile) {
            var oTextModel = oProfile.getModel("i18n");
            if (!oTextModel) {
                return "";
            }
            return oTextModel.getResourceBundle().getText(sKey);
        }
        return "";
    };
    
    IdentityMixin.formatIdentityProfileCount = function(sCount) {
        //always use the first registered profile for formatting
        var oProfile = this._mIdentityMixinIdentityProfile;
        if (oProfile) {
            var oBinding = oProfile.getElementBinding("data");
            if (!oBinding) {
                return "0";
            }
            
            var oContext = oBinding.getBoundContext();
            if (!oContext) {
                return "0";
            }
            
            var oEntityCount = oContext.getObject();
            if (!oEntityCount) {
                return "0";
            }
            return oEntityCount[sCount] || "0";
        }
        return "0";
    };
    
    IdentityMixin.formatIdentityProfileNavigationLink = function(sRouteName, oParameter) {
        oParameter = oParameter || {};
        oParameter.id = this._getIdentityProfileContext();
        return this.getOwnerComponent().getNavigationLink(sRouteName, oParameter);
    };
    
    IdentityMixin._setIdentityProfileContext = function(vContext) {
        this._vIdentityProfileContext = vContext;
    };
    
    IdentityMixin._getIdentityProfileContext = function() {
        return this._vIdentityProfileContext;
    };
    
    IdentityMixin.navigateToList = function(oEvent){
        var oController = this.getView().getController();
        var oLink = oEvent.oSource;
        var sPath = oLink.oPropagatedProperties.oBindingContexts.IdentityProfile.sPath;
        var oRoute = oLink.getModel("IdentityProfile").getProperty(sPath).Route;
        
        if(oRoute.NAME === "campaign-idealist" || oRoute.NAME === "campaign-idealistvariant" || oRoute.NAME === "campaign-bloglist"){
            oRoute.QUERY.id = oController.getCampaignId();
        }
        
        oController.navigateTo(oRoute.NAME, oRoute.QUERY);
    };
    
    IdentityMixin.formatIdentityProfileCountVisibility = function(sCount, sVariant, bExpert, sNo, aRoles){
        // var bExpertInCampaign;
        // var oObject = this.getModel("object");
        // if(oObject) {
        //     bExpertInCampaign = oObject.getProperty("/property/nodes/Root/customProperties/expertInCampaign");
        // }
        // if(sVariant === "completed"){
        //     var oProfile = this._mIdentityMixinIdentityProfile;
        //     if (oProfile) {
        //         var oBinding = oProfile.getElementBinding("data");
        //         if (!oBinding) {
        //             return false;
        //         }
                
        //         var oContext = oBinding.getBoundContext();
        //         if (!oContext) {
        //             return false;
        //         }
                
        //         var oEntityCount = oContext.getObject();
        //         if (!oEntityCount) {
        //             return false;
        //         }
        //     }
        //     return Number(oEntityCount[sCount]) > 0;
        // } else {
        //     return !bExpert || bExpertInCampaign;
        // }
        
        if (aRoles && !this._formatIdentityProfileVisByRole(aRoles)) {
			return false;
		}
		return true;
    };
    
    IdentityMixin._formatIdentityProfileVisByRole = function(aRoles) {
		if (aRoles[0].indexOf("sap.ino.ui::") > -1) {
			return this._hasCampaignsPrivileges(aRoles);
		}
		return this._hasCampaignInstanceRole(aRoles);
	};

	IdentityMixin._hasCampaignsPrivileges = function(aRoles) {
		return this._checkCampaignsPrivileges(aRoles, this.getModel("user").getProperty("/privileges"));
	};

	IdentityMixin._hasCampaignInstanceRole = function(aRoles) {
		return this._checkCampaignsPrivileges(aRoles, this.getModel("data").getProperty("/CampaignInstanceRoles(" + this.getCampaignId() + ")"));
	};

	IdentityMixin._checkCampaignsPrivileges = function(aRoles, oExistsRoles) {
		if (!oExistsRoles) {
			return false;
		}
		var bExists = false;
		for (var iRoleIndex = 0; iRoleIndex <= aRoles.length - 1; iRoleIndex++) {
			if (oExistsRoles[aRoles[iRoleIndex]]) {
				bExists = true;
				break;
			}
		}
		if (!bExists) {
			return false;
		}
		return true;
	};

    
    return IdentityMixin;
});