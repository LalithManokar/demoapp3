/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.OverlayContainer");
(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.controls.OverlayContainerRenderer");
    /**
     */

    sap.ui.ux3.OverlayContainer.extend("sap.ui.ino.controls.OverlayContainer",
            {
                metadata : {
                    properties : {
                        selectedFacet : {
                            type : "int",
                            defaultValue : undefined
                        }
                    },
                    aggregations : {
                        firstTitle : {
                            type : "sap.ui.commons.Label",
                            multiple : false
                        },
                        secondTitle : {
                            type : "sap.ui.commons.Label",
                            multiple : false
                        },
                        leftHeaderAction : {
                            type : "sap.ui.commons.Button",
                            multiple : false
                        },
                        rightHeaderAction : {
                            type : "sap.ui.commons.Button",
                            multiple : false
                        },
                        facets : {
                            type : "sap.ui.ux3.NavigationItem",
                            multiple : true
                        },
                        leftSubHeaderAction : {
                            type : "sap.ui.core.Control",
                            multiple : false
                        },
                        rightSubHeaderAction : {
                            type : "sap.ui.core.Control",
                            multiple : false
                        },
                        content : {
                            type : "sap.ui.core.Control",
                            multiple : true,
                            defaultValue : undefined
                        },
                        leftFooterActions : {
                            type : "sap.ui.commons.Button",
                            multiple : true
                        },
                        actions : {
                            type : "sap.ui.commons.Button",
                            multiple : true
                        },
                        _navigationBar : {
                            type : "sap.ui.ux3.NavigationBar",
                            multiple: false,
                            hidden : true
                        }
                    },
                    events : {
                        actionSelected : {},
                        facetSelected : {}
                    }
                },

                _renderHeader : function(oRm, oControl) {
                	oRm.write("<div");
                	oRm.addClass("sapMPageHeader");
                	oRm.addClass("sapUiInoOverlayHeader");
                	oRm.writeClasses();
                	oRm.write(">");
                	oRm.write("</div>");
                	
                    oRm.write("<div");
                    oRm.addClass("sapMBar");
                    oRm.addClass("sapMBar-CTX");
                    oRm.addClass("sapUiInoOverlayBar");
                    oRm.writeClasses();
                    oRm.write(">");

                    oRm.write("<div");
                    oRm.addClass("sapUiInoOverlayHeaderSideContainer");
                    oRm.addClass("sapUiInoOverlayLeftAlignment");
                    oRm.writeClasses();
                    oRm.write(">");
                    if(oControl.getLeftHeaderAction()) {
                        var oButton = oControl.getLeftHeaderAction();
                        oButton.setLite(true);
                        oButton.addStyleClass("sapUiInoOverlayHeaderButton");
                        oRm.renderControl(oButton);
                    }
                    oRm.write("</div>");

                    oRm.write("<div");
                    oRm.addClass("sapUiInoOverlayHeaderCenterContainer");
                    oRm.writeClasses();
                    oRm.write(">");
                    
                    oRm.write("<div");
                    oRm.addClass("sapUiInoOverlayHeaderCenterContainerTable");
                    oRm.writeClasses();
                    oRm.write(">");
                    
                    oRm.write("<div");
                    oRm.addClass("sapUiInoOverlayCenterAlignment sapUiInoOverlayMiddleAlignment");
                    oRm.writeClasses();
                    oRm.write(">");
                    if(oControl.getFirstTitle()) {
                        var oLabel = oControl.getFirstTitle();
                        oLabel.setTextAlign(sap.ui.core.TextAlign.Center);
                        oLabel.setWidth("100%");
                        oLabel.addStyleClass("sapUiInoOverlayHeaderLargeTitle");
                        oLabel.addStyleClass("sapUiInoOverlayMiddleAlignment");
                        oRm.renderControl(oLabel);
                    }
                    if(oControl.getSecondTitle()) {
                        var oLabel = oControl.getSecondTitle();
                        oLabel.setTextAlign(sap.ui.core.TextAlign.Center);
                        oLabel.setWidth("100%");
                        oLabel.addStyleClass("sapUiInoOverlayHeaderSmallTitle");
                        oLabel.addStyleClass("sapUiInoOverlayMiddleAlignment");
                        oRm.renderControl(oLabel);
                    }
                    oRm.write("</div>");
                    oRm.write("</div>");                    
                    oRm.write("</div>");

                    oRm.write("<div");
                    oRm.addClass("sapUiInoOverlayHeaderSideContainer");
                    oRm.addClass("sapUiInoOverlayRightAlignment");
                    oRm.writeClasses();
                    oRm.write(">");
                    if(oControl.getRightHeaderAction()) {
                        var oButton = oControl.getRightHeaderAction();
                        oButton.setLite(true);
                        oButton.addStyleClass("sapUiInoOverlayHeaderButton");
                        oRm.renderControl(oButton);
                    }
                    oRm.write("</div>");

                    oRm.write("</div>");
                },

                _renderSubHeader : function(oRm, oControl) {
                	var oLeftSubHeaderAction = oControl.getLeftSubHeaderAction();
                	var oRightSubHeaderAction = oControl.getRightSubHeaderAction();
                	
                    var aFacets = oControl.getFacets();
                    if(aFacets && aFacets.length > 0 ||
                    		oLeftSubHeaderAction || oRightSubHeaderAction) {
                        oRm.write("<div");
                        oRm.addClass("sapMBar");
                        oRm.addClass("sapUiInoOverlayHeader");
                        oRm.addClass("sapUiInoOverlaySubHeader");
                        oRm.writeClasses();
                        oRm.write(">");
    
                        oRm.write("<div");
                        oRm.addClass("sapUiInoOverlaySubHeaderSideContainer");
                        oRm.addClass("sapUiInoOverlayHeaderSideContainer");
                        oRm.addClass("sapUiInoOverlayLeftAlignment");
                        oRm.writeClasses();
                        oRm.write(">");
                        if(oLeftSubHeaderAction) {
                            oLeftSubHeaderAction.addStyleClass("sapUiInoOverlaySubHeaderControl");
                            oRm.renderControl(oLeftSubHeaderAction);
                        }
                        oRm.write("</div>");
    
                        oRm.write("<div");
                        oRm.addClass("sapUiInoOverlayHeaderCenterContainer");
                        oRm.writeClasses();
                        oRm.write(">");
                        
                        if(aFacets && aFacets.length > 0) {
                            var oNavigationBar = oControl.getAggregation("_navigationBar");
                            if(oNavigationBar === null || oNavigationBar === undefined) {
                                oNavigationBar = new sap.ui.ux3.NavigationBar({
                                    select : function(oEvent) {
                                        oControl.fireFacetSelected({
                                            KEY : oEvent.getParameter("item").getKey(),
                                            SOURCE : oEvent.Source
                                        });
                                    }
                                });
                                oControl.setAggregation("_navigationBar", oNavigationBar);
                            } else {
                                oNavigationBar.removeAllItems();
                            }
    
                            //the NavigationBar will remove all items out of the initial array
                            //as soon as they are added. Therefore we need to create new items
                            jQuery.each(aFacets, function(iIndex, oFacet) {
                                oNavigationBar.addItem(
                                    new sap.ui.ux3.NavigationItem({
                                        key : oFacet.getKey(),
                                        text : oFacet.getText()
                                    })
                                );
                            });
                            if(oControl.getSelectedFacet() !== undefined) {
                                oNavigationBar.setSelectedItem(oNavigationBar.getItems()[oControl.getSelectedFacet()]);
                            } else {
                                oNavigationBar.setSelectedItem(oNavigationBar.getItems()[0]);
                            }
                            oNavigationBar.addStyleClass("sapUiInoOverlaySubHeaderNavigation");
                            oRm.renderControl(oNavigationBar);
                        }

                        oRm.write("</div>");
    
                        oRm.write("<div");
                        oRm.addClass("sapUiInoOverlaySubHeaderSideContainer");
                        oRm.addClass("sapUiInoOverlayHeaderSideContainer");
                        oRm.addClass("sapUiInoOverlayRightAlignment");
                        oRm.writeClasses();
                        oRm.write(">");
                        if(oRightSubHeaderAction) {
                            oRightSubHeaderAction.addStyleClass("sapUiInoOverlaySubHeaderControl");
                            oRm.renderControl(oRightSubHeaderAction);
                        }
                        oRm.write("</div>");
    
                        oRm.write("</div>");

                        return true;
                    }
                    return false;
                },

                _renderFooter : function(oRm, oControl) {
                    oRm.write("<div");
                    oRm.addClass("sapUiUx3ActionBar");
                    oRm.addClass("sapUiInoOverlayFooterActionBar");
                    oRm.writeClasses();
                    oRm.write(">");

                    var aLeftFooterActions = oControl.getLeftFooterActions();
                    if(aLeftFooterActions && aLeftFooterActions.length > 0) {
                    	var iLength = aLeftFooterActions.length;
                    	for (var i = 0; i < iLength; i++) {
                            aLeftFooterActions[i].addStyleClass("sapUiInoOverlayLeftFooterActionButton");
                            oRm.renderControl(aLeftFooterActions[i]);
                    	}
                    }
                    
                    oRm.write("<div");
                    oRm.addClass("sapUiInoOverlayRightFooterActionButtonSection");
                    oRm.writeClasses();
                    oRm.write(">");

                    var aRightFooterActions = oControl.getActions();
                    if(aRightFooterActions && aRightFooterActions.length > 0) {
                    	var iRightFooterActionsLength = aRightFooterActions.length;
                    	for (var j = 0; j < iRightFooterActionsLength; j++) {
                            aRightFooterActions[j].addStyleClass("sapUiInoOverlayRightFooterActionButton");
                            oRm.renderControl(aRightFooterActions[j]);
                    	}
                    }

                    oRm.write("</div>");
                    oRm.write("</div>");
                },

                renderContent : function(oRm, oControl) {
                    //Header Height: 48px; Footer Height: 40px;
                    var sHeaderFooterHeight = "4em + 40px";
                    oControl._renderHeader(oRm, oControl);
                    var bShowBar = oControl._renderSubHeader(oRm, oControl);
                    if(bShowBar) {
                        sHeaderFooterHeight += " + 3em";
                    }

                    oRm.write("<div");
                    oRm.addClass("sapUiInoOverlayContentArea");
                    oRm.writeClasses();
                    oRm.writeAttributeEscaped("style", "height: calc(100% - (" + sHeaderFooterHeight + "));");
                    oRm.write(">");

                    if(oControl.getContent() !== undefined
                            && oControl.getContent().length !== 0) {
                        jQuery.each(oControl.getContent(), function(iIndex, oContentControl){
                            oRm.renderControl(oContentControl);
                        });
                    }

                    oRm.write("</div>");

                    
                    oControl._renderFooter(oRm, oControl);
                },
            	
            	onAfterRendering : function() {
            		sap.ui.ux3.Overlay.prototype.onAfterRendering.apply(this,arguments);
            		var oShell = this._getShell();
            		if((!oShell  && this.bShellContext === undefined) ||
            				this.bShellContext === false) {
            		    var oJQObject = jQuery(this.getDomRef()); 
            			oJQObject.addClass("sapUiInoOverlayNoFrame");
            			oJQObject.css("position","fixed");
            			oJQObject.css("bottom","0px");
            			oJQObject.css("top","0px");
            			oJQObject.css("left","0px");
            			oJQObject.css("right","0px");
            			oJQObject.css("display","block");
            			
            			this.bShellContext = false;
            		} else {
            			this.bShellContext = true;
            		}
            	},
                
                renderer : sap.ui.ino.controls.OverlayContainerRenderer
            });
})();