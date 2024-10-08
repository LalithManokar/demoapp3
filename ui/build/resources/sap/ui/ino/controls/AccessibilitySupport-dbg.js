/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.AccessibilitySupport");
jQuery.sap.require("sap.ui.ino.controls.AriaLivePriority");

(function() {
	"use strict";
	
	sap.ui.core.Control.extend("sap.ui.ino.controls.AccessibilitySupport", {
	    metadata : {
	    	properties : {
	    		complexTabbing : {
	    			type : "boolean",
	                defaultValue : true
	    		},
	    		ariaLivePriority : {
	    			type : "sap.ui.ino.controls.AriaLivePriority",
	    			defaultValue : sap.ui.ino.controls.AriaLivePriority.none
	    		}
	    	}
	    },
	    
	    _bActionMode : false,
	    _sParam : undefined,
	    // due to IE we are forced to use different tags for entry and exit
	    _oAfterEntry : undefined,
	    _oAfterExit : undefined,
	    _oBeforeEntry : undefined,
	    _oBeforeExit : undefined,
	    _sFocus : undefined,
	    
	    handleActionFirst : function(oEvent) {
	    	var $this = this.$();
	    	var aAll = $this.find("[tabindex=0]");
    		
    		// we need at least 6 tags (selector, beforeEntry, beforeExit, <whatever>, afterExit, afterEntry)
    		if (aAll && aAll.length > 5) {
	    		var oFirst = aAll[3];
	    		sap.ui.ino.controls.AccessibilitySupport.setFocus(oFirst);
	    		return true;    			
    		}
    		else {
    			return this.leaveActionMode(oEvent);    			
    		}
	    },
	    
	    handleActionLast : function(oEvent) {
	    	var $this = this.$();
	    	var aAll = $this.find("[tabindex=0]");
    		
	    	// we need at least 6 tags (selector, beforeEntry, beforeExit, <whatever>, afterExit, afterEntry)
    		if (aAll && aAll.length > 5) {
	    		var oLast = aAll[aAll.length - 3];
	    		sap.ui.ino.controls.AccessibilitySupport.setFocus(oLast);
        		return true;    			
    		}
    		else {
    			return this.leaveActionMode(oEvent);    			
    		}    	
	    },
	    
	    handleActionAbove : function(oEvent) {
	    	return this.handleActionPrevious(oEvent);
	    },
	    
	    handleActionBelow : function(oEvent) {
	    	return this.handleActionNext(oEvent);
	    },
	    
	    handleActionNext : function(oEvent) {
	    	var $this = this.$();
	    	var aAll = $this.find(":sapTabbable");
	    	
    		// we need at least 7 tags (selector, beforeEntry, beforeExit, <whatever>, <whatever>, afterExit, afterEntry)
    		if (aAll && aAll.length > 6) {
	    	
    			var oCurrent = jQuery(oEvent.srcControl.getFocusDomRef(true));
    	    	var iIndex = aAll.index(oCurrent);
    	    	
    	    	if (iIndex == -1) {
    	    		oCurrent = jQuery(oEvent.target);
    	    	    iIndex = aAll.index(oCurrent);
    	    	}
        		
	    		if (iIndex == -1) {
	    			// current focus is on the container => focus first element
	    			iIndex = 2; // => 1 is the BeforeExit Tag 
	    		}
	    		
    			if (iIndex == aAll.length - 1 || iIndex == aAll.length - 2 || iIndex == aAll.length - 3) {
    				iIndex = 2;
    			}
    			
    			var oNext = aAll[iIndex + 1];
    			sap.ui.ino.controls.AccessibilitySupport.setFocus(oNext);
    			return true;
    			
    		}
    		else {
    			return this.leaveActionMode(oEvent);    			
    		}
	    },
	    
	    handleActionPrevious : function(oEvent) {
	    	var $this = this.$();
	    	var aAll = $this.find(":sapTabbable");
            
    		// we need at least 7 tags (selector, beforeEntry, beforeExit, <whatever>, <whatever>, afterExit, afterEntry)
    		if (aAll && aAll.length > 6) {
	    		
    			var oCurrent = jQuery(oEvent.srcControl.getFocusDomRef(false));
    	    	var iIndex = aAll.index(oCurrent);
    	    	
    	    	if (iIndex == -1) {
    	    		oCurrent = jQuery(oEvent.target);
    	    		iIndex = aAll.index(oCurrent);
    	    	}
        		
	    		if (iIndex == -1) {
	    			// current focus is on the container => focus first element
	    			iIndex = aAll.length - 2; // => last is the AfterExit Tag 
	    		}
	    		
    			if (iIndex == 0 || iIndex == 1 || iIndex == 2 || iIndex == 3) {
    				iIndex = aAll.length - 2;
    			}
    			
    			var oPrev = aAll[iIndex - 1];
    			sap.ui.ino.controls.AccessibilitySupport.setFocus(oPrev);
    			return true;    			
    		}
    		else {
    			return this.leaveActionMode(oEvent);    			
    		}	    	
	    },
	    
	    enterActionMode : function(oEvent) {
	    	this._bActionMode = true;
	    	return this.handleActionFirst(oEvent);	    		
	    },
	    
	    handleActionTab : function(oEvent) {
	    	return this.handleActionNext(oEvent);
	    },
	    
	    handleActionReverseTab : function(oEvent) {
	    	return this.handleActionPrevious(oEvent);
	    },
	    
	    handleNoActionAbove : function(oEvent) {
	    	return this.handleNoActionPrevious(oEvent);
	    },
	    
	    handleNoActionBelow : function(oEvent) {
	    	return this.handleNoActionNext(oEvent);	    	
	    },
	    
	    handleNoActionNext : function(oEvent) {
	    	return this.handleNoActionTab(oEvent);	    	
	    },
	    
	    handleNoActionPrevious : function(oEvent) {
	    	return this.handleNoActionReverseTab(oEvent);
	    },
	    
	    handleNoActionTab : function(oEvent) {
	    	var oAfter = this.getAfterExitTab();
	    	this._sParam = "NoActionTab";
	    	sap.ui.ino.controls.AccessibilitySupport.setFocus(oAfter);
	    	return true;	    	
	    },
	    
	    handleNoActionReverseTab : function(oEvent) {
	    	var oBefore = this.getBeforeExitTab();
	    	this._sParam = "NoActionReverseTab";
	    	sap.ui.ino.controls.AccessibilitySupport.setFocus(oBefore);
	    	return true;
	    },
	    
	    leaveActionMode : function(oEvent) {
	    	jQuery.sap.log.debug("Leaving action mode of " + this.getId(), this.getId(), "sap.ui.ino.controls.AccessibilitySupport");
	    	this._bActionMode = false;
	    	
	    	var $this = this.$();
	    	var aAll = $this.find("[tabindex=0]");
    		sap.ui.ino.controls.AccessibilitySupport.setFocus(aAll[0]);
	    	
    		return true;
	    },
	    
	    exitActionMode : function() {
	    	this._bActionMode = false;
	    },
	    
	    handleActionSpace : function(oEvent) {
	    	return false;
	    },
	    
	    handleNoActionSpace : function(oEvent) {
	    	return false;
	    },
	    
	    handlekeydown : function(oEvent) {
	    	var bStopBubble = false;    	
	    	
	    	if (this.getComplexTabbing()) {
		    	if (!this._bActionMode && (oEvent.keyCode == jQuery.sap.KeyCodes.F2 || oEvent.keyCode == jQuery.sap.KeyCodes.ENTER)) {
		    		bStopBubble = this.enterActionMode(oEvent);
		    	}
		    	else if (this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.ESCAPE) {
		    		bStopBubble = this.leaveActionMode(oEvent);
		    	}
		    	else if (this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.HOME) {
		    		bStopBubble = this.handleActionFirst(oEvent);
		    	}
		    	else if (this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.END) {
		    		bStopBubble = this.handleActionLast(oEvent);
		    	}
		    	else if (this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_DOWN) {
		    		bStopBubble = this.handleActionBelow(oEvent);
		    	}
		    	else if (this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_RIGHT) {
		    		bStopBubble = this.handleActionNext(oEvent);
		    	}
		    	else if (this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_LEFT) {
		    		bStopBubble = this.handleActionPrevious(oEvent);
		    	}
		    	else if (this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_UP) {
		    		bStopBubble = this.handleActionAbove(oEvent);
		    	}
		    	else if (!this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_DOWN) {
		    		bStopBubble = this.handleNoActionBelow(oEvent);
		    	}
		    	else if (!this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_RIGHT) {
		    		bStopBubble = this.handleNoActionNext(oEvent);
		    	}
		    	else if (!this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_LEFT) {
		    		bStopBubble = this.handleNoActionPrevious(oEvent);
		    	}
		    	else if (!this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_UP) {
		    		bStopBubble = this.handleNoActionAbove(oEvent);
		    	}
		    	else if (!this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.TAB && oEvent.shiftKey) {
		    		bStopBubble = this.handleNoActionReverseTab(oEvent);
		    	}
		    	else if (!this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.TAB) {
		    		bStopBubble = this.handleNoActionTab(oEvent);
		    	}
		    	else if (this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.TAB && oEvent.shiftKey) {
		    		bStopBubble = this.handleActionReverseTab(oEvent);
		    	}	    
		    	else if (this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.TAB) {
		    		bStopBubble = this.handleActionTab(oEvent);
		    	}
		    	else if (this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.SPACE) {
		    		bStopBubble = this.handleActionSpace(oEvent);
		    	}
		    	else if (!this._bActionMode && oEvent.keyCode == jQuery.sap.KeyCodes.SPACE) {
		    		bStopBubble = this.handleNoActionSpace(oEvent);
		    	}
		    	
		    	if (bStopBubble) {
		    		oEvent.preventDefault();
					oEvent.stopPropagation();
					oEvent.stopImmediatePropagation();					
		    	}
	    	}
	    },
	    
	    getAccessibilityContainerId : function() {
	    	// overwritten by subclass
	    },
	    
	    handlefocusin : function(oEvent) {
	    	if (this.getComplexTabbing() && oEvent) {
		    	var oBeforeExit = this.getBeforeExitTab();
		    	var oBeforeEntry = this.getBeforeEntryTab();
		    	var oAfterExit = this.getAfterExitTab();
		    	var oAfterEntry = this.getAfterEntryTab();
		    	var sTarget = jQuery(oEvent.target)[0].id;
		    	
		    	if ((oAfterExit[0].id === sTarget || oBeforeExit[0].id === sTarget) && this._sParam === undefined) {
		    		jQuery.sap.log.debug("Ignore focus on " + sTarget + " w/o parameter", this.getId(), "sap.ui.ino.controls.AccessibilitySupport");
		    		return false;
		    	} 
	    		
		    	if (this.getAccessibilityContainerId() === sTarget) {
		    		if (this._sFocus !== this.getFocusDomRef().id) {
			    		this._sFocus = this.getFocusDomRef().id;
			    		this._sParam = undefined;
		    			return this.leaveActionMode(oEvent);
		    		}
		    		return false;
	    		}
	    		
	    		this._sFocus = sTarget;
	    		
	    		jQuery.sap.log.debug("Focus received on " + this._sFocus + " with param set to: " + this._sParam, this.getId(), "sap.ui.ino.controls.AccessibilitySupport");
	    		
	    		if (this._sParam == "NoActionTab") {
	    			this._sParam = undefined;
	    			oAfterExit.blur();
	    			var aNext = oAfterExit.parents().next();
	    			var oNext = undefined;
	    			while (true) {
		    			if (aNext && aNext.length > 0) {
		    				var aTabs = jQuery(aNext[0]).find("[tabindex=0]");
		    				if (aTabs && aTabs.length > 0) {
		    					oNext = jQuery(aTabs[0]);
		    					break;
		    				}
		    				else {
		    					var aParent = aNext.parent();
		    					if (aParent && aParent.length > 0) {
		    						var aChildren = jQuery(aParent[aParent.length - 1]).children();
		    						if (aChildren && aChildren.length > 0) {
		    							var iIdx = aChildren.index(aNext[0]);
		    							if (iIdx != -1 && aChildren.length > iIdx + 1) {
		    								aNext = jQuery(aChildren[iIdx + 1]);
		    								continue;
		    							}
		    						}
		    					}		    					
		    				}
		    			}
		    			
		    			break;		    			
	    			}
	    			
	    			if (!oNext) {
	    				oNext = oAfterExit.parents().next().find("[tabindex=0]");
	    				oNext = jQuery(oNext[0]);	    				
	    			}
	    			
	    			if (oNext && oNext.length > 0) {
		    			jQuery.sap.log.debug("Setting focus to: " + oNext[0].id, this.getId(), "sap.ui.ino.controls.AccessibilitySupport");
		    		    sap.ui.ino.controls.AccessibilitySupport.setFocus(oNext);
	    			}
	    		}
	    		else if (this._sParam == "NoActionReverseTab") {
	                this._sParam = undefined;
	                oBeforeExit.blur();
	    		    var oPrev = oBeforeEntry.parents().prev().parent().find("[tabindex=0]");
	    		    var iBefore = oPrev.index(oBeforeEntry);
	    		    iBefore -= 2; // the tag directly before is the container, e.g. the panel, but we want the tag before the panel
	    		    if (iBefore < 0) {
	    		    	this.leaveActionMode(oEvent); 
	    		    }
	    		    else {
	    		    	oPrev = jQuery(oPrev[iBefore]);
	    		    	sap.ui.ino.controls.AccessibilitySupport.setFocus(oPrev);   		    	
	    		    }	    		    
	    		}
	    		else if (this._sFocus === oBeforeEntry[0].id || this._sFocus === oAfterEntry[0].id) {
	    			this._bActionMode = false;
	    	    	var $this = this.$();
        	    	var aAll = $this.find("[tabindex=0]");
            		sap.ui.ino.controls.AccessibilitySupport.setFocus(aAll[0]);
	    		}
	    		
	    		return true;
	    	}
	    },
	    
	    handleclick : function(oEvent) {
	    	// focus cannot bubble up the control tree, but we need to set the correct action mode if an element within this is clicked
	    	if (this.getComplexTabbing() && oEvent) {
	    		var aFocusables = jQuery(':focusable');
		    	var oBefore = this.getBeforeEntryTab();
		    	var oAfter = this.getAfterEntryTab();
	    		var oCurrent = jQuery(oEvent.target);
    			
	    		var iBeforeIdx = aFocusables.index(oBefore);
    	    	var iAfterIdx = aFocusables.index(oAfter);
    	    	var iCurrentIdx = aFocusables.index(oCurrent);
    	    	
    	    	if ( iCurrentIdx > iBeforeIdx && iCurrentIdx < iAfterIdx ) {
    	    		this._bActionMode = true;
    	    	}
    	    	// else this was clicked but not within the action area => no action mode
	    	}
	    },
	    
	    renderer : function(oRm, oControl) {
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.writeAttribute("tabindex", "-1");
            oRm.write("/>");
	    },
	    
	    onclick : function(oEvent) {
	    	this.handleclick(oEvent);
	    },
	    
	    onfocusin : function(oEvent) {
	    	this.handlefocusin(oEvent);
	    },
	    
	    onkeydown : function(oEvent) {
	    	this.handlekeydown(oEvent);
	    },
	    
	    onAfterRendering : function() {
	    	this._oAfterExit = undefined;
	    	this._oAfterEntry = undefined;
	    	this._oBeforeExit = undefined;
	    	this._oBeforeEntry = undefined;
	    },
	    
	    getAfterExitTab : function() {
	    	if (!this._oAfterExit) { 
	    		var $this = this.$();
	    		this._oAfterExit = $this.find("#sapUiInoAccessibleTabAfterExit" + this.getId());
	    	}
	    	
	    	return this._oAfterExit;
	    },
	    
	    getAfterEntryTab : function() {
	    	if (!this._oAfterEntry) { 
	    		var $this = this.$();
	    		this._oAfterEntry = $this.find("#sapUiInoAccessibleTabAfterEntry" + this.getId());
	    	}
	    	
	    	return this._oAfterEntry;
	    },
	    
	    getBeforeExitTab : function() {
	    	if (!this._oBeforeExit) { 
	    		var $this = this.$();
	    		this._oBeforeExit = $this.find("#sapUiInoAccessibleTabBeforeExit" + this.getId());
	    	}
	    	
	    	return this._oBeforeExit;
	    },
	    
	    getBeforeEntryTab : function() {
	    	if (!this._oBeforeEntry) { 
	    		var $this = this.$();
	    		this._oBeforeEntry = $this.find("#sapUiInoAccessibleTabBeforeEntry" + this.getId());
	    	}
	    	
	    	return this._oBeforeEntry;
	    }	    
	});
	
	sap.ui.ino.controls.AccessibilitySupport.setFocus = function(oObject) {
		if (oObject) {
			setTimeout(function(){ oObject.blur(); }, 1);
			setTimeout(function(){ oObject.focus(); }, 2);
		}
	}; 
})();
