/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.views.common.ObjectInstanceSelection"); 

(function() {
    "use strict";
    
    var fnGetSearchPathFunction = function(sSearchPath) { 
    	return function(sSearchToken, bEncode, bTrim) {
	    	if (bEncode != false) {
	    		sSearchToken = jQuery.sap.encodeURL(sSearchToken.replace(/'/g, "''"));
	    	}
	    	if (bTrim != false) {
	    		sSearchToken = jQuery.trim(sSearchToken);
	    	}
	    	return sSearchPath.replace("{searchToken}", sSearchToken);
    	};
    };

    sap.ui.ino.views.common.ObjectInstanceSelection = {
        "sap.ino.xs.object.basis.Unit" : {
            instancePath : "sap.ino.xs.object.basis.Unit.Root",
            selectionKey : "CODE"
        },
        "sap.ino.xs.object.iam.Identity" : {
            searchPath : "/SearchIdentity(searchToken='{searchToken}')/Results",
            instancePath : "Identity",
            selectionKey : "ID",
            selectionField : "NAME",
            secondarySelectionField : "USER_NAME",
            parameters : {
            	select : "searchToken,ID,NAME,USER_NAME,TYPE_CODE"
            }
        },
        "sap.ino.xs.object.iam.User" : {
        	// ::TODO:: filter must not be part of path
            searchPath : "/SearchIdentity(searchToken='{searchToken}')/Results?$filter=TYPE_CODE%20eq%20%27USER%27",
            instancePath : "Identity",
            selectionKey : "ID",
            selectionField : "NAME",
            secondarySelectionField : "USER_NAME",
            navigation : {
                "sap.ino.config.URL_PATH_UI_BACKOFFICE" : "user"
            },
            parameters : {
            	select : "searchToken,ID,NAME,USER_NAME,TYPE_CODE"
            }
        },
        "sap.ino.xs.object.iam.Group" : {
            searchPath : "/SearchIdentity(searchToken='{searchToken}')/Results?$filter=TYPE_CODE%20eq%20%27GROUP%27",
            instancePath : "Identity",
            selectionKey : "ID",
            selectionField : "NAME",
            secondarySelectionField : "USER_NAME",
            navigation : {
                "sap.ino.config.URL_PATH_UI_BACKOFFICE" : "group"
            },
            parameters : {
            	select : "searchToken,ID,NAME,USER_NAME,TYPE_CODE"
            }
        },
        "sap.ino.xs.object.idea.Idea" : {
            searchPath : "/IdeaMediumSearchParams(searchToken='{searchToken}',tagsToken='',filterName='',filterBackoffice=0)/Results",
            instancePath : "IdeaFull",
            selectionKey : "ID",
            selectionField : "NAME",
            navigation : {
                "sap.ino.config.URL_PATH_UI_FRONTOFFICE" : "idea",
                "sap.ino.config.URL_PATH_UI_BACKOFFICE" : "idea",
                "sap.ino.config.URL_PATH_UI_MOBILE" : "idea"
            },
            parameters : {
            	select : "searchToken,ID,NAME"
            }
        },
        "sap.ino.xs.object.tag.Tag" : {
            searchPath : "/SearchTagsParams(searchToken='{searchToken}')/Results",
            navigation : {
                "sap.ino.config.URL_PATH_UI_BACKOFFICE" : "tag"
            },
            parameters : {
            	select : "searchToken,ID,NAME"
            }
        },
        "sap.ino.xs.object.expert.Tag" : {
            searchPath : "/SearchExpertTag(searchToken='{searchToken}')/Results",
            parameters : {
            	select : "searchToken,ID,NAME" 
            }            
        },
        "sap.ino.xs.object.campaign.Campaign" : {
            searchPath : "/CampaignSearchParams(searchToken='{searchToken}')/Results",
            instancePath : "CampaignFull",
            selectionKey : "ID",
            selectionField : "NAME",
            navigation : {
                "sap.ino.config.URL_PATH_UI_FRONTOFFICE" : "campaign",
                "sap.ino.config.URL_PATH_UI_BACKOFFICE" : "campaign",
                "sap.ino.config.URL_PATH_UI_MOBILE" : "campaign"
            },
            parameters : {
            	select : "searchToken,ID,NAME"
            }
        },
        "sap.ino.xs.object.tag.TagGroup" : {
            searchPath : "/SearchTagGroupsParams(searchToken='{searchToken}')/Results",
            instancePath : "TagGroup",
            selectionKey : "ID",
            selectionField : "NAME",            
            parameters : {
            	select : "searchToken,ID,NAME,DESCRIPTION"
            }
        }   
    };
    
    jQuery.each(sap.ui.ino.views.common.ObjectInstanceSelection, function(sObjectName, oObjectInstanceSelection) {
        if (oObjectInstanceSelection.searchPath) {
            oObjectInstanceSelection.createSearchPath = fnGetSearchPathFunction(oObjectInstanceSelection.searchPath); 
        }
    });

    sap.ui.ino.views.common.ObjectInstanceSelection.getDefinitionByXSObject = function(sObjectName, bCheck) {
        var oSelectionDefinition = sap.ui.ino.views.common.ObjectInstanceSelection[sObjectName];
        if (!oSelectionDefinition && !bCheck) {
            throw new Error("No object instance selection defined for object '" + sObjectName + "'");
        }
        if (oSelectionDefinition) {
            oSelectionDefinition.name = sObjectName;
            oSelectionDefinition.nodeName = "Root";
        }
        return oSelectionDefinition;
    };
    
    sap.ui.ino.views.common.ObjectInstanceSelection.getDefinitionByUIObject = function(sObjectName, bCheck) {
        if(!sObjectName){
            return null;
        }
        jQuery.sap.require(sObjectName);
        var oObject = jQuery.sap.getObject(sObjectName, 0);
        if (oObject) {
            return sap.ui.ino.views.common.ObjectInstanceSelection.getDefinitionByXSObject(oObject.getObjectName(), bCheck);
        }
        return null;
    };
    
    sap.ui.ino.views.common.ObjectInstanceSelection.getDefinitionByApplicationObject = function(oApplicationObject, bCheck) {
        if(!oApplicationObject){
            return null;
        }
        return sap.ui.ino.views.common.ObjectInstanceSelection.getDefinitionByXSObject(oApplicationObject.getObjectName(), bCheck);
    };
    
    sap.ui.ino.views.common.ObjectInstanceSelection.getDefinition = function(sForeignKeyTo, bCheck) {
        var aPart = sForeignKeyTo.split(".");
        var sNodeName = aPart.pop();
        if (sNodeName != "Root") {
            throw new Error("Object instance selection can only be defined for 'Root' and not for '" + sNodeName
                    + "' node");
        }
        var sObjectName = aPart.join(".");
        return sap.ui.ino.views.common.ObjectInstanceSelection.getDefinitionByXSObject(sObjectName, bCheck);
    };
    
    sap.ui.ino.views.common.ObjectInstanceSelection.createSearchPath = function(sSearchPath, sSearchToken, bEncode, bTrim) {
        return fnGetSearchPathFunction(sSearchPath)(sSearchToken, bEncode, bTrim);
    };
})();