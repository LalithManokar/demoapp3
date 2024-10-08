sap.ui.define([
    "sap/ino/vc/blog/List.controller",
    "sap/ino/vc/commons/TopLevelPageFacet"
], function (BlogList,
             TopLevelPageFacet) {
    "use strict";
   
    return BlogList.extend("sap.ino.vc.blog.ListPage", jQuery.extend({}, TopLevelPageFacet, {
        /* Controller reacts when these routes match */ 
        routes : ["bloglist", "bloglistvariant"],
        
        onRouteMatched : function(oEvent) {
            this.setGlobalFilter([]);
            this.setHelp("BLOG_LIST");
            this.show(oEvent);
        }
        
   }));
});