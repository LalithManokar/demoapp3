sap.ui.define([
], function() {
    "use strict";

    /**
     * @class
     * Object Instance Selection
     */
    var UIObjectConfig = function() {
        throw "May not be instantiated directly";
    };
    
    var Definition = {
        "sap.ino.xs.object.iam.Identity" : {
            searchPath : "/SearchIdentity(searchToken='{searchToken}')/Results",
            instancePath : "Identity",
            selectionKey : "ID",
            selectionField : "NAME",
            secondarySelectionField : "USER_NAME",
            navigation : {
                path : "identity-display",
                key : "id"
            },
            quickView : "sap.ino.vc.iam.IdentityCard",
            parameters : {
                select : "searchToken,ID,NAME,USER_NAME"
            }
        },
        "sap.ino.xs.object.iam.User" : {
            searchPath : "/SearchIdentity(searchToken='{searchToken}')/Results",
            instancePath : "Identity",
            selectionKey : "ID",
            selectionField : "NAME",
            secondarySelectionField : "USER_NAME",
            navigation : {
                path : "idea-display",
                key : "id"
            },
            quickView : "sap.ino.vc.iam.IdentityCard",
            parameters : {
                select : "searchToken,ID,NAME,USER_NAME",
                filter : "TYPE_CODE%20eq%20%27USER%27"
            }
        },
        "sap.ino.xs.object.iam.Group" : {
            searchPath : "/SearchIdentity(searchToken='{searchToken}')/Results",
            instancePath : "Identity",
            selectionKey : "ID",
            selectionField : "NAME",
            secondarySelectionField : "USER_NAME",
            navigation : {
                path : "group-display",
                key : "id"
            },
            quickView : "sap.ino.vc.iam.IdentityCard",
            parameters : {
                select : "searchToken,ID,NAME,USER_NAME",
                filter : "TYPE_CODE%20eq%20%27GROUP%27"
            }
        },
        "sap.ino.xs.object.idea.Idea" : {
            searchPath : "/IdeaMediumSearchParams(searchToken='{searchToken}',tagsToken='',filterName='',filterBackoffice=0)/Results",
            instancePath : "IdeaFull",
            selectionKey : "ID",
            selectionField : "NAME",
            secondarySelectionField : "",
            navigation : {
                path : "idea-display",
                key : "id"
            },
            parameters : {
                select : "searchToken,ID,NAME"
            }
        },
        "sap.ino.xs.object.campaign.Campaign" : {
            searchPath : "/CampaignSearchParams(searchToken='{searchToken}',tagsToken='',filterName='',filterBackoffice=0)/Results",
            instancePath : "CampaignFull",
            selectionKey : "ID",
            selectionField : "NAME",
            secondarySelectionField : "",
            navigation : {
                path : "campaign-display",
                key : "id"
            },
            parameters : {
                select : "searchToken,ID,NAME"
            }
        }
    };
    
    UIObjectConfig.getDefinition = function(sObjectName) {
        var aPart = sObjectName.split(".");
        var sNodeName = aPart.pop();
        if (sNodeName === "Root") {
            sObjectName = aPart.join(".");
        }
        return Definition[sObjectName];
    };
    
    UIObjectConfig.getSearchPath = function(sObjectNode, sSearchToken) {
        sSearchToken = jQuery.sap.encodeURL(sSearchToken.replace(/'/g, "''"));
        sSearchToken = jQuery.trim(sSearchToken);
        var oDefinition = UIObjectConfig.getDefinition(sObjectNode);
        return oDefinition.searchPath.replace("{searchToken}", sSearchToken);
    };
    
    jQuery.each(Definition, function(sObjectName, oUIObjectConfig) {
        if (oUIObjectConfig.searchPath) {
            UIObjectConfig.getSearchPath(sObjectName, oUIObjectConfig.searchPath);
        }
    });
    
    return UIObjectConfig;
});