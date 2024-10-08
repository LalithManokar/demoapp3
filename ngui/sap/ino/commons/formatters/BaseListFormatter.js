/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/commons/formatters/ObjectFormatter",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ui/base/Object"
], function(ObjectFormatter,
            CodeModel,
            Object) {
    "use strict";
    
    var oBaseListFormatter = Object.extend("sap.ino.commons.formatters.BaseListFormatter", {});
    
    jQuery.extend(oBaseListFormatter, ObjectFormatter);
    
    oBaseListFormatter.showActiveFilterInBar = function(sStatus, sPhase, oSystem) {
        var bPhone = oSystem && oSystem.phone;
        var sPath = this.getListProperty("/Filter/PhaseBinding/TABLE_PATH");
        var fnFormatter = CodeModel.getFormatter(sPath);
        
        if (!!sStatus) {
            sStatus = this.getText(this.getStatus(sStatus).TEXT);
        }
        
        if (!!sPhase) {
            sPhase = fnFormatter(sPhase);
        }
        
        if (bPhone) {
            if (sStatus && sPhase) {
                return this.getText("LIST_FILTER_FLD_COUNTS", [2]);
            }
            else if (sStatus || sPhase) {
                return this.getText("LIST_FILTER_FLD_COUNT");
            }
        }
        else {
            if (sStatus && sPhase) {
                return this.getText("LIST_FILTERS_FLD", [sStatus, sPhase]);
            }
            else if (sStatus) {
                return this.getText("LIST_FILTER_FLD", [sStatus]);
            }
            else if (sPhase) {
                return this.getText("LIST_FILTER_FLD", [sPhase]);
            }
        }
        
        return "";
    };
    
    oBaseListFormatter.variantTitle = function(sVariant, sOptionalCampaignContext, oCurrentIdeaLink) {
        
        if(oCurrentIdeaLink && oCurrentIdeaLink.TYPE_CODE === "QUICK_LINK_CUSTOM_IDEA" && !sOptionalCampaignContext) {
            return oCurrentIdeaLink.LINK_TEXT;
        }
        
        if (sVariant === undefined) {
            return this.getText("EMPTY_FLD_TEXT");
        }
        
        var oVariant = this.getVariant(sVariant);
        if(!oVariant){
        	return this.getText("EMPTY_FLD_TEXT");
        }
        var sDisplayLabel = oVariant.DISPLAY_LABEL;
        if (!sOptionalCampaignContext) {
            if(sDisplayLabel){
            return this.getText(oVariant.TEXT,[sDisplayLabel]);
            } 
             return this.getText(oVariant.TEXT);  
        } else if(oCurrentIdeaLink && oCurrentIdeaLink.TYPE_CODE === "QUICK_LINK_CUSTOM_IDEA"){
            return this.getText("LIST_TIT_COMBINED_TEXT", [sOptionalCampaignContext, oCurrentIdeaLink.LINK_TEXT]);
        }
        else {
            var sText;
            if(sDisplayLabel){
             sText = this.getText(oVariant.TEXT,[sDisplayLabel]);
            }  else {
                sText = this.getText(oVariant.TEXT);
            }           
            
            return this.getText("LIST_TIT_COMBINED_TEXT", [sOptionalCampaignContext, sText]);
        }
    };
    
    oBaseListFormatter.listSortText = function(oSystem, sSort) {
        if (sSort === undefined) {
            return this.getText("EMPTY_FLD_TEXT");
        }
        
        var bPhone = oSystem && oSystem.phone;
        var sText = bPhone ? "LIST_SORT_BY_SHORT" : "LIST_SORT_BY";
        var sParameter = this.getSort(sSort).TEXT;
        
        return this.getText(sText, [this.getText(sParameter)]);
    };

    return oBaseListFormatter;
});