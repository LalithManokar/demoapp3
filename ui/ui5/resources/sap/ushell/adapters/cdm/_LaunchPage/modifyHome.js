// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/adapters/cdm/_LaunchPage/readHome","sap/ui/thirdparty/jquery"],function(r,q){"use strict";function c(u){return a(u,"Home",true);}function a(u,t,D){var g={"identification":{"id":u,"namespace":"","title":t},"payload":{"isPreset":false,"locked":false,"tiles":[],"links":[],"groups":[]}};if(D){g.payload.isDefaultGroup=true;}return g;}function b(S,g,i){var G=r.getGroupId(g);S.groups[G]=g;if(i!==undefined){S.site.payload.groupsOrder.splice(i,0,G);}else{S.site.payload.groupsOrder.push(G);}return S;}function o(S,g,G){if(S&&S.groups&&S.groups[G]){S.groups[G]=g;}return S;}function d(S,g){if(S&&S.groups&&S.groups[g.identification.id]){delete S.groups[g.identification.id];}if(S&&S.site&&S.site.payload&&S.site.payload.groupsOrder){S.site.payload.groupsOrder=q.grep(S.site.payload.groupsOrder,function(G){return G!==g.identification.id;});}return S;}function s(S,n){S.site.payload.groupsOrder=n;return S;}function e(g,n){g.identification.title=n;}function f(g,n){if(n){delete g.identification.isVisible;}else{g.identification.isVisible=false;}}return{createDefaultGroup:c,createEmptyGroup:a,addGroupToSite:b,overwriteGroup:o,removeGroupFromSite:d,setGroupsOrder:s,setGroupTitle:e,setGroupVisibility:f};},true);
