sap.ui.define([], function() {
    "use strict";
    
    var oChangeAuthorActionFormatter = function() {};
    
    oChangeAuthorActionFormatter.formatterMoveRewardMessage = function(sOldAuthor, sNewAuthor) {
        return this.getText("IDEA_OBJECT_MSG_MOVE_REWARDS", [sOldAuthor, sNewAuthor]);
    };
    
    oChangeAuthorActionFormatter.formatterMoveSelfEvluMessage = function(sOldAuthor, sNewAuthor) {
        return this.getText("IDEA_OBJECT_MSG_MOVE_EVALUATION_AUTHOR", [sOldAuthor, sNewAuthor]);
    };
    
    return oChangeAuthorActionFormatter;
});