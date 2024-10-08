/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
	"sap/m/List"
], function (List) {
	"use strict";
	
	/**
     * @class Standard List that can display its items horizontally.
     * 
     * @static
     * @public
     */
	return List.extend("sap.ino.controls.WrappingList", {
		metadata: {
		    properties : {
		        wrapping : {
				    type : "boolean",
				    defaultValue : false
				},
				overwirteOnkeydown : {
				    type : "boolean",
				    defaultValue : true
				}
			}
		},
		
		init : function() {
		    var that = this;
		    
            List.prototype.init.apply(this, arguments);
            
            this.addEventDelegate({
                onAfterRendering : function() {
                    var bWrapping = that.getWrapping();
                    var $This = that.$();
                    
                    $This.addClass("sapInoWrappingList");    
                    
                    if (bWrapping) {
                        $This.removeClass("sapInoWrappingListNoWrap");
                        $This.addClass("sapInoWrappingListWrap");    
                    }
                    else {
                        $This.removeClass("sapInoWrappingListWrap");
                        $This.addClass("sapInoWrappingListNoWrap");
                    }
                }
            });
        },
        
        setNavigationItems : function() {
            // enable right-/left-arrowkey
            this.getItemNavigation().setTableMode(!this.getWrapping());
            List.prototype.setNavigationItems.apply(this, arguments);
        },
		
		_isRendered : function() {
            if (this._bIsInDOM === undefined || this._bIsInDOM === 0) {
                this._bIsInDOM = jQuery.sap.byId(this.getId()).length;
            }
    
            return this._bIsInDOM;
        },
		
		setWrapping : function(bWrapping) {
		    if (this.getWrapping() !== bWrapping) {
                this.setProperty("wrapping", bWrapping, true);
                if (this._isRendered()) {
                    var $This = this.$();
                    
                    if (bWrapping) {
                        $This.removeClass("sapInoWrappingListNoWrap");
                        $This.addClass("sapInoWrappingListWrap");    
                    }
                    else {
                        $This.removeClass("sapInoWrappingListWrap");
                        $This.addClass("sapInoWrappingListNoWrap");
                    }
                }
            }
            return this;
		},
		
		onkeydown : function(oEvent) {
		    if (!this.getWrapping() || !this.getOverwirteOnkeydown()) {
		        // return to default behaviour 
		        return;
		    }
		    
		    var $Current = this.$();
		    var $Next;
		    var $Children;
		    var bDone = false;
		    var bIgnore = false;
		    
		    var $All = this.$().find("[tabindex!=-1]:focusable");
		    if ($All && $All.length > 0) {
                if ($All[$All.length - 1] === oEvent.target) {
                    bIgnore = true;   
                }
            }
		    
		    // use arrow keys to navigate within list
		    // (shift +) tab jumps to element before / after the list
		    if (!bIgnore && oEvent.keyCode === jQuery.sap.KeyCodes.TAB) {
		        if (oEvent.shiftKey) {
		            // jump before list
		            do {
    		            $Next = $Current.prev();
    		            if ($Next && $Next.length > 0) {
    		                $Children = $Next.find("[tabindex!=-1]:focusable");
    		                if ($Children && $Children.length > 0) {
    		                    this._focus(jQuery($Children[$Children.length - 1]));
    		                    bDone = true;
    		                    break;
    		                }
    		                if ($Next.attr("tabindex") !== "-1" && $Next.is(":focusable")) {
    		                    this._focus($Next);
    		                    bDone = true;
    		                    break;
    		                }
    		            }
    		            $Next = $Current.parent();
    		            $Current = $Next;
		            } while ($Next && $Next.length > 0);
		        }
		        else {
		            // jump after list
		            var $Last = jQuery($All[$All.length - 1]);
		            $Next = $Last.next();
		            do {
		            	if ($Next && $Next.length > 0) {
							if ($Next.attr("tabindex") !== "-1" && $Next.is(":focusable")) {
								this._focus($Next);
								bDone = true;
								break;
							}
							$Children = $Next.find("[tabindex!=-1]:focusable");
							if ($Children && $Children.length > 0) {
								this._focus(jQuery($Children[0]));
								bDone = true;
								break;
							}
							$Last = $Next;							
		            	}
		            	else {
		            		$Last = $Last.parent();
		            	}

		            	$Next = $Last.next();

    		            while ($Next.length === 0 && $Last.parent().length > 0) {
    		            	$Last = $Last.parent();
    		            	$Next = $Last.next();
    		            } 
		            } while ($Next && $Next.length > 0);
		        }
		    
		        // if we couldn't set the focus => reset to first focusable element on screen    
	            if (!bDone) {
	                this._focus(jQuery("html").find("[tabindex!=-1]:focusable")[0]);
	            }
	        
	            oEvent.preventDefault();
				oEvent.stopPropagation();
				oEvent.stopImmediatePropagation();	
		    }
		    else {
		        List.prototype.onkeydown.apply(this, arguments);
		    }
		},
		
		_focus : function(oElement) {
		    if (oElement && jQuery.type(oElement.focus) === "function") {
    		    setTimeout(function() {
    		        oElement.focus();
    		    }, 10);
		    }
		},
		
		renderer : "sap.m.ListRenderer"
	});
});