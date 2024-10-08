/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ino/commons/models/aof/ApplicationObject","sap/ino/commons/models/core/ReadSource"],function(A,R){"use strict";var S={CommunityUser:"COMMUNITY_USER",InnovationOfficeUser:"INNOVATION_OFFICE_USER",InnovationManager:"INNOVATION_MANAGER",SystemManager:"INNOVATION_SYSTEM_MANAGER"};var U=A.extend("sap.ino.commons.models.object.communityUser",{objectName:"sap.ino.xs.object.iam.CommunityUserGroup",readSource:R.getDefaultODataSource("Identity",{excludeNodes:["MemberOf"]}),invalidation:{entitySets:["Identity","SearchIdentity"]}});U.StaticRoles=S;return U;});
