/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "./BaseController",
    "sap/uxap/BlockBase"
], function(BaseController, BlockBase) {

    /*
     * we overwrite method createView of the BlockBase object to propagate the component
     * down to the sub-views of ObjectPageLayout. 
     * This code fixes the bug with the getOwnerComponent() on the subviews
     */
    // BlockBase.prototype.createView = function(oViewData) {
    //     var oView;
    //     sap.ui.getCore().getComponent(this._sOwnerId).runAsOwner(function () {
    //         oView = sap.ui.view(oViewData);
    //     });
    //     return oView;
    // };

    /**
     * Base Block Controller is to use for the views under ObjectPageLayout
     * which shall be lazy-loaded. 
     */
    return BaseController.extend("sap.ino.vc.commons.BaseBlockController", {
        /* returns a view with redefined method data().
        for views within OPL blocks, data() shall read custom data from its parent,
        e.g. from <uxap:CommentBlock>
        */
        getBlockView: function() {
            var oView = BaseController.prototype.getView.apply(this, arguments);
            if (oView.getParent() && oView.getParent().getMetadata().getParent() && 
                oView.getParent().getMetadata().getParent().getName() === "sap.uxap.BlockBase") {
                oView.data = function() {
                    var oParent = oView.getParent();
                    return oParent.data.apply(oParent, arguments);
                };
            }
            return oView;
        }
    });
});
