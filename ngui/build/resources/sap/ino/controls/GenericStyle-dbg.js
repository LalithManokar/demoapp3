/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/IconPool"
], function(Control, IconPool) {
    "use strict";

    var GenericStyle = Control.extend("sap.ino.controls.GenericStyle", {
        constructor : function() {
            throw new Error("Control is not instantiatable.");
        }
    });
    
    GenericStyle.getImage = function(sImage, sPath) {
        if (!sPath) {
            sPath = "sap.ino.controls";
        }
        // always get the current theme
        var sCurrentTheme = sap.ui.getCore().getConfiguration().getTheme();
        var bRTL = sap.ui.getCore().getConfiguration().getRTL();
        return sap.ui.resource(sPath, "themes/" + sCurrentTheme + "/img" + (bRTL ? "-RTL" : "") + "/GenericStyle/" + sImage);
    };
    
    IconPool.addIcon("campaign", "InoIcons", "InoIcons", "e900");
    IconPool.addIcon("campaign-add", "InoIcons", "InoIcons", "e901");
    IconPool.addIcon("wall-add", "InoIcons", "InoIcons", "e902");
    IconPool.addIcon("wall", "InoIcons", "InoIcons", "e903");
    IconPool.addIcon("heart", "InoIcons", "InoIcons", "e904");
    IconPool.addIcon("heart-filled", "InoIcons", "InoIcons", "e905");
    IconPool.addIcon("idea", "InoIcons", "InoIcons", "e906");
    IconPool.addIcon("idea-add", "InoIcons", "InoIcons", "e907");
    IconPool.addIcon("thumbsdown", "InoIcons", "InoIcons", "e908");
    IconPool.addIcon("thumbsdown-filled", "InoIcons", "InoIcons", "e909");
    IconPool.addIcon("thumbsup", "InoIcons", "InoIcons", "e90a");
    IconPool.addIcon("line3", "InoIcons", "InoIcons", "e90c");
    IconPool.addIcon("line4", "InoIcons", "InoIcons", "e90d");
    IconPool.addIcon("line5", "InoIcons", "InoIcons", "e90e");
    IconPool.addIcon("line-both", "InoIcons", "InoIcons", "e90f");
    IconPool.addIcon("line-dashed", "InoIcons", "InoIcons", "e910");
    IconPool.addIcon("line-dotted", "InoIcons", "InoIcons", "e911");
    IconPool.addIcon("line-end", "InoIcons", "InoIcons", "e912");
    IconPool.addIcon("line-start", "InoIcons", "InoIcons", "e913");
    IconPool.addIcon("line-vertical", "InoIcons", "InoIcons", "e914");
    IconPool.addIcon("follow", "InoIcons", "InoIcons", "e915");
    IconPool.addIcon("following", "InoIcons", "InoIcons", "e916");
    IconPool.addIcon("unfollow", "InoIcons", "InoIcons", "e917");
    IconPool.addIcon("register", "InoIcons", "InoIcons", "e918");
    IconPool.addIcon("pending", "InoIcons", "InoIcons", "e919"); 
    IconPool.addIcon("raise_hand", "InoIcons", "InoIcons", "e91a"); 
    IconPool.addIcon("shake_hands", "InoIcons", "InoIcons", "e91b"); 
    IconPool.addIcon("lightbulb_check", "InoIcons", "InoIcons", "e91c"); 
    
    IconPool.addIcon("information", "InoIcons", "InoIcons", "e612"); 
    IconPool.addIcon("quicklink", "InoIcons", "InoIcons", "e610"); 
    IconPool.addIcon("quicklink-custom", "InoIcons", "InoIcons", "e60f"); 
    IconPool.addIcon("quicklink-standard", "InoIcons", "InoIcons", "e611"); 
    IconPool.addIcon("latest-update", "InoIcons", "InoIcons", "e91d");
    IconPool.addIcon("latest-update-selected", "InoIcons", "InoIcons", "e91e");    
    IconPool.addIcon("status-update", "InoIcons", "InoIcons", "e91f");  
    IconPool.addIcon("status-update-selected", "InoIcons", "InoIcons", "e920");  
    IconPool.addIcon("comment-update", "InoIcons", "InoIcons", "e921");
    IconPool.addIcon("comment-update-selected", "InoIcons", "InoIcons", "e914");
    
    IconPool.addIcon("active-participates", "InoIcons", "InoIcons", "e922");    
    IconPool.addIcon("new_comment", "InoIcons", "InoIcons", "e923");      
    IconPool.addIcon("new_status", "InoIcons", "InoIcons", "e924");
    IconPool.addIcon("idea_read", "InoIcons", "InoIcons", "e925");
    IconPool.addIcon("idea_update", "InoIcons", "InoIcons", "e926"); 
    IconPool.addIcon("idea-news", "InoIcons", "InoIcons", "e927");
    IconPool.addIcon("idea_create", "InoIcons", "InoIcons", "e928");    
    IconPool.addIcon("leaderboard_fire", "InoIcons", "InoIcons", "e929");      
    IconPool.insertFontFaceStyle();

    return GenericStyle;
});