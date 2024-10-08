/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/ReadSource"
], function(ApplicationObject, ReadSource) {
    "use strict";
    
    var StaticRoles = {
        CommunityUser        : "COMMUNITY_USER",
        InnovationOfficeUser : "INNOVATION_OFFICE_USER",
        InnovationManager    : "INNOVATION_MANAGER",
        SystemManager        : "INNOVATION_SYSTEM_MANAGER"        	
    };
    
    var User = ApplicationObject.extend("sap.ino.commons.models.object.User", {
        objectName : "sap.ino.xs.object.iam.User",
        readSource : ReadSource.getDefaultODataSource("Identity", {
			excludeNodes: ["MemberOf"]
		}),
        invalidation : {
            entitySets : ["Identity", "SearchIdentity"]
        }
    });
    
    
    User.StaticRoles = StaticRoles;
    
    return User;
});