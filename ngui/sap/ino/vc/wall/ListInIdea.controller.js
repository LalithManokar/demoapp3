/*!
 * @copyright@
 */
sap.ui.getCore().loadLibrary("sap.ino.wall");

sap.ui.define([
    "sap/ino/vc/commons/BaseVariantListController",
    "sap/ui/Device",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/commons/models/object/Wall",
    "sap/ino/wall/Wall",
    "sap/ino/vc/wall/util/WallFactory",
    "sap/ino/vc/wall/WallMixin"
], function(BaseController,
    Device,
    Configuration,
    ObjectListFormatter,
    WallModel,
    Wall,
    WallFactory,
    WallMixin) {
        "use strict";

        var mVariant = {
            MY: "my",
            SHARED: "shared"
        };

        var mFilter = {
            NONE: "myWalls",
            MY: "myWalls",
            SHARED: "sharedWalls"
        };

        return BaseController.extend("sap.ino.vc.wall.ListInIdea", jQuery.extend({}, WallMixin, {
            /* Controller reacts when these routes match */
            routes: [],
            list: {
                "Variants": {},
                "Picker": {
                    "Variants": {
                        "Values": [{
                            "TEXT": "WALL_LIST_MIT_MY",
                            "ACTION": mVariant.MY,
                            "FILTER": mFilter.MY
                        }, {
                            "TEXT": "WALL_LIST_MIT_SHARED",
                            "ACTION": mVariant.SHARED,
                            "FILTER": mFilter.SHARED
                        }]
                    }
                }
            },

            /* ViewModel storing the current configuration of the list */
            view: {
                "Picker": {
                    "VARIANT": undefined // mVariant.MY will be initialized in onWallAdd
                },
                "EDITABLE": undefined
            },

            formatter: ObjectListFormatter,
            
            objectListFormatter: ObjectListFormatter,

            onInit: function() {
                var that = this;
                this._wallMixinInit({
                    wallId: "walllistinidea",
                    wallBindPath: "object>/Walls",
                    wallAddAction : function(oObject, oWallData){
                        oObject.addWall(oWallData);
                        that._updateWallPreviewControls();
                    },
                    wallRemoveAction : function(oObject, oWallControl){
                        oObject.removeWall(oWallControl.getStorageId());
                        that._updateWallPreviewControls();
                    },
                    wallData: function(oObject){
                        return oObject.getProperty("/Walls");
                    }
                });
                this.getList().addStyleClass("sapInoWallListPreviewItems");

                BaseController.prototype.onInit.apply(this, arguments);
            },

            onBeforeRendering: function() {
                this.setViewProperty("/EDITABLE", this.getView().data("editable") === "true"); // custom props are strings, not boolean
                this._sRoute = "walllistvariant";
                this._bindList();
                var oBinding = this.getList().getBinding("items");
                if (oBinding) {
                    this._updateWallPreviewControls();
                }
            },

            onWallAdd: function() {
                this._getWallPickerDialog().open();
                
                var oWallPickerView = this._getWallPickerView();
                if (oWallPickerView) {
                    var bVariantChanged = oWallPickerView.getController().setDefaultVariant();
                    if (bVariantChanged) {
                        oWallPickerView.invalidate();
                    }
                }
                var sDefaultVariantAction = mVariant.MY;
                this.setViewProperty("/Picker", {
                    "VARIANT" : sDefaultVariantAction
                });
            },

            getVariantsPopover : function() {
                if (!this._getWallPickerDialog().isActive()) {
                    return BaseController.prototype.getVariantsPopover.apply(this, arguments);
                } else {
                    if (!this._oPickerVariantPopover) {
                        this._oPickerVariantPopover = sap.ui.xmlfragment("sap.ino.vc.wall.fragments.PickerListVariants", this);
                        // if (Device.system.phone) {
                        //     this._oPickerVariantPopover = sap.ui.xmlfragment("sap.ino.vc.wall.fragments.PickerListVariantsDialog", this);
                        // } else {
                        //     this._oPickerVariantPopover = sap.ui.xmlfragment("sap.ino.vc.wall.fragments.PickerListVariants", this);
                        // }
                        this.getView().addDependent(this._oPickerVariantPopover);
                    }
                    return this._oPickerVariantPopover;
                }
            },

            getVariant : function(sAction) {
                if (!this._getWallPickerDialog().isActive()) {
                   return BaseController.prototype.getVariant.apply(this, arguments);
                } else {
                   return this._getListDefinitionEntry(sAction, "ACTION", "/Picker/Variants/Values");
                }
            },
            
            // onWallPickerCancel : function() {
            //     this._getWallPickerDialog().close();
            // },

            // this is a callback function, do not rename
            // it is called from WallPicker dialog
            onVariantPress: function(sVariantAction, oEvent) {
                this.setViewProperty("/Picker/VARIANT", sVariantAction);
                var oWallPickerView = this._getWallPickerView();
                if (oWallPickerView) {
                    oWallPickerView.getController().setViewProperty("/List/VARIANT", sVariantAction);
                    oWallPickerView.invalidate();
                }
            },
            
            // this is a callback function, do not rename
            // it is called from WallPicker dialog
            _onVariantPress : function(oEvent) {
                var oItem = oEvent.getSource();
        	    var oContext = oItem.getBindingContext("list");
        	    var sAction;
        	    var oObject;
        	    
        	    if (oContext) {
        	        oObject = oContext.getObject();    
        	        sAction = oObject ? oObject.ACTION : undefined;
        	    }
        	    
        	    this.onVariantPress(sAction, oEvent);
        	    
        	    var oPopover = this.getVariantsPopover();
        	    if (typeof oPopover.close === "function") {
                    oPopover.close();
                }
            },
            
            
            onShowFilterBar: function(oEvent) {
                var oWallPickerView = this._getWallPickerView();
                var oFilterBar = oWallPickerView && oWallPickerView.getController().getFilterBar();
                if (oWallPickerView && oFilterBar) {
                    oWallPickerView.getController().showFilterBar(!oFilterBar.getVisible());
                }
            }

        }));
});