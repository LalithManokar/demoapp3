/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Label",
    "sap/m/Link",
    "sap/m/Text",
    "sap/ui/core/TextAlign",
    "sap/ui/core/Icon",
    "sap/m/ToggleButton",
	"sap/base/security/sanitizeHTML"
], function(Control,
    Button,
    ButtonType,
    Label,
    Link,
    Text,
    TextAlign,
    Icon,
    ToggleButton, sanitizeHTML
    ) {
    "use strict";
    
     var TagCard = Control.extend("sap.ino.controls.TagCard", {
        metadata: {
            properties: {
               "tagId" :{
                 type: "int"  
               },
               "tagName" : {
                  type: "string" 
               },
               "campaignCount" : {
                   type: "string"
               },
               "ideaCount" : {
                   type: "string"
               },
               "tagGroupId": {
                  type: "int"  
               },
               "campaignHref": {
				    type: "sap.ui.core.URI"
			   },
			   "ideaHref": {
				    type: "sap.ui.core.URI"
				}
            },
            aggregations : {
               "followPlaceholder": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
               _campaignLink: {
                    type: "sap.m.Link",
                    multiple: false,
                    visibility: "hidden"
                },  
                _ideaLink: {
                    type: "sap.m.Link",
                    multiple: false,
                    visibility: "hidden"
                },
                _tagLabel: {
                    type: "sap.m.Text",
                    multiple: false,
                    visibility: "hidden"
                }
            },
            events : {
               press : {},
               openCampaign : {},
               openIdea : {}
           }
    },
    

    init: function () {
        this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
	},
	
	_getCampaignLink: function() {
            var that = this;
            var sAggregationName = "_campaignLink";
            // var oCampaignLink = this.getAggregation(sAggregationName);
            // if (!oCampaignLink) {
               var     oCampaignLink = new Link({
                        // id : this.getId() + sAggregationName,
                        href : this.getProperty("campaignHref"),
                        text : this.getProperty("campaignCount"),
                        enabled: this.getProperty("campaignCount") === "0" ? false : true,
                        press : function(oEvent) {
                            // prevent href
                            oEvent.preventDefault();
                            that.fireOpenCampaign({
                                tagId: that.getProperty("tagId"),
                                tagName: that.getProperty("tagName"),
                                tagGroupId: that.getProperty("tagGroupId")
                            });
                        }
                    }); 
            // }
            this.setAggregation(sAggregationName, oCampaignLink, true);
            
            return oCampaignLink;
	},
	
	_getIdeaLink: function() {
            var that = this;
            var sAggregationName = "_ideaLink";
            // var oIdeaLink = this.getAggregation(sAggregationName);
            // if (!oIdeaLink) {
                var oIdeaLink = new Link({
                    // id : this.getId() + sAggregationName,
                    href : this.getProperty("ideaHref"),
                    text : this.getProperty("ideaCount"),
                    enabled: this.getProperty("ideaCount") === "0" ? false : true,
                    press : function(oEvent) {
                        // prevent href
                        oEvent.preventDefault();
                        that.fireOpenIdea({
                            tagId: that.getProperty("tagId"),
                            tagName: that.getProperty("tagName"),
                            tagGroupId: that.getProperty("tagGroupId")
                        });
                    }
                });
                this.setAggregation(sAggregationName, oIdeaLink, true);
            // }
            return oIdeaLink;
	},
	
	_getTagIcon: function() {
      return new Icon({
            src: "sap-icon://tag"
        }).addStyleClass("log");
	},
	
	_follow: function(oEvent){
	   var that = this;
	   that.fireFollow();
	},
	
	_getFeedIcon: function() {
	    var that = this;
	    return new Icon({
            // type: ButtonType.Transparent, icon: "sap-icon://feed"
            src:"sap-icon://feed",
            press: function(oEvent) {
                that._follow();
            }
        }).addStyleClass("follow"); 
	},
	
	setTagName: function(sTag) {
            if (sTag) {
                this.setAggregation("_tagLabel", new Text({maxLines: 1}).setText(sTag).setTooltip(sTag));
            }
            this.setProperty("tagName", sTag);
            return this;
    },
    
    // setCampaignCount: function(sCampaignCount) {
    //         if (sCampaignCount) {
    //             var sAggregationName = "_campaignLink";
    //             var that = this;
    //             this.setAggregation("_campaignLink",  new Link({
    //                     id : this.getId() + sAggregationName,
    //                     href : this.getProperty("campaignHref"),
    //                     text : this.getProperty("campaignCount"),
    //                     enabled: this.getProperty("campaignCount") === "0" ? false : true,
    //                     press : function(oEvent) {
    //                         // prevent href
    //                         oEvent.preventDefault();
    //                         that.fireOpenCampaign({
    //                             tagId: that.getProperty("tagId"),
    //                             tagName: that.getProperty("tagName"),
    //                             tagGroupId: that.getProperty("tagGroupId")
    //                         });
    //                     }
    //                 }));
    //         }
    //         this.setProperty("campaignCount", sCampaignCount);
    //         return this;
    // },
    
    // setIdeaCount: function(sIdeaCount) {
    //         if (sIdeaCount) {
    //             var sAggregationName = "_ideaLink";
    //             var that = this;
    //             this.setAggregation("_ideaLink",  new Link({
    //                     id : this.getId() + sAggregationName,
    //                     href : this.getProperty("ideaHref"),
    //                     text : this.getProperty("ideaCount"),
    //                     enabled: this.getProperty("ideaCount") === "0" ? false : true,
    //                     press : function(oEvent) {
    //                         // prevent href
    //                         oEvent.preventDefault();
    //                         that.fireOpenIdea({
    //                             tagId: that.getProperty("tagId"),
    //                             tagName: that.getProperty("tagName"),
    //                             tagGroupId: that.getProperty("tagGroupId")
    //                         });
    //                     }
    //                 }));
    //         }
    //         this.setProperty("campaignCount", sIdeaCount);
    //         return this;
    // },
	
    renderer: function (oRM, oControl) {
        oRM.write("<div");   // Outer DIV
        oRM.writeControlData(oControl);
        oRM.addClass("container");
        oRM.writeClasses();
        oRM.write(">");
        oRM.write("<header");
        oRM.addClass("tagheader");
        oRM.writeClasses();
        oRM.write(">");
        oRM.write("<div");
        oRM.addClass("bio");
        oRM.writeClasses();
        oRM.write(">");

        oRM.write("<div");
        oRM.addClass("desc");
        oRM.writeClasses();
        oRM.write(">");
        oRM.write("<div>");
        var oTagTitle = oControl.getAggregation("_tagLabel");
        if (oTagTitle) {
            oRM.renderControl(oTagTitle);
        }
        oRM.write("</div>");
        oRM.write("</div>");
        
        
        oRM.write("</div>");
        oRM.write("</header>");
        
        
        
        
        oRM.write("<div");
        oRM.addClass("content");
        oRM.writeClasses();
        oRM.write(">");
        
        oRM.write("<div");
        oRM.addClass("data");
        oRM.writeClasses();
        oRM.write(">");
        
        oRM.write("<ul>");
        oRM.write("<li");
        oRM.addClass("cardleft");
        oRM.writeClasses();
        oRM.write(">");
        oRM.renderControl(oControl._getCampaignLink());
        // var oCampaignLink = oControl.getAggregation("_campaignLink");
        // if (oCampaignLink) {
        //     oRM.renderControl(oCampaignLink);
        // }
        
        
        oRM.write("<span class=\"tagContentText\">" + sanitizeHTML(oControl._oRB.getText('CTRL_TAG_CARD_CAMPAIGN')));
        oRM.write("</span>");
        oRM.write("</li>");
        
        oRM.write("<li");
        oRM.addClass("split");
        oRM.writeClasses();
        oRM.write(">");
        oRM.write("</li>");
        
        oRM.write("<li");
        oRM.addClass("cardright");
        oRM.writeClasses();
        oRM.write(">");
        oRM.renderControl(oControl._getIdeaLink());
        // var oIdaeLink = oControl.getAggregation("_ideaLink");
        // if (oIdaeLink) {
        //     oRM.renderControl(oIdaeLink);
        // }
        oRM.write("<span class=\"tagContentText\">" + sanitizeHTML(oControl._oRB.getText('CTRL_TAG_CARD_IDEA')));
        oRM.write("</span>");
        oRM.write("</li>");
        oRM.write("</ul>");
        
        oRM.write("</div>");
        
        oRM.write("</div>");
        
        oRM.write("<div");
        oRM.addClass("splitH");
        oRM.writeClasses();
        oRM.write(">");
        oRM.write("</div>");
        
        oRM.write("<div>");
        var oFollowPlaceholderControl = oControl.getAggregation("followPlaceholder");
        if (oFollowPlaceholderControl) {
            oRM.renderControl(oFollowPlaceholderControl);
        }
        oRM.write("</div>");
        oRM.write("</div>");
	},
	onAfterRendering: function(){
	    this._initTabs();
	},
	_getTabs: function() {
		return this._tabs;
	},
	_initTabs: function(){
 	    this._tabs = [];
	    if (this.getAggregation("_campaignLink") && this.getAggregation("_campaignLink").$().length) {
			this._tabs.push(this.getAggregation("_campaignLink").$()[0].id);
		}
		if (this.getAggregation("_ideaLink") && this.getAggregation("_ideaLink").$().length) {
			this._tabs.push(this.getAggregation("_ideaLink").$()[0].id);
		}
		if( this.getAggregation("followPlaceholder")){
		    this._tabs.push(this.getAggregation("followPlaceholder").$().find("[tabindex=0],button")[0].id);
		}
	},
	_defaultOnKeyDown: function(oEvent) {
		if (Control.prototype.onkeydown) {
			Control.prototype.onkeydown.apply(this, arguments);
		}
	},

	onkeydown: function(oEvent) {
		var aTabs = this._getTabs();
		var fnUpdate = this._incr;

		if (oEvent.shiftKey || oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_UP || oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_LEFT) {
			fnUpdate = this._decr;
		}

		if (oEvent.keyCode === jQuery.sap.KeyCodes.ESCAPE) {
			this.getParent().focus();
		} else if (oEvent.keyCode === jQuery.sap.KeyCodes.TAB ||
			oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_DOWN ||
			oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_RIGHT ||
			oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_UP ||
			oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_LEFT) {
	        var $Current = jQuery(":focus");
			var iIdx = -1;
			if ($Current && $Current.length > 0) {
				iIdx = aTabs.indexOf($Current[0].id);
				iIdx = fnUpdate(iIdx, aTabs.length - 1);
				this._focus(jQuery("#" + aTabs[iIdx]));

				oEvent.preventDefault();
				oEvent.stopPropagation();
			} else {
				this.getParent().focus();
			}
		} else {
			this._defaultOnKeyDown(oEvent);
		}
	},
	_incr: function(iVal, iMax) {
		iVal++;
		if (iVal > iMax) {
			return 0;
		}
		return iVal;
	},

	/**
	 * @private
	 */
	_decr: function(iVal, iMax) {
		iVal--;
		if (iVal < 0) {
			return iMax;
		}
		return iVal;
	},
	_focus: function(oElement) {
		if (jQuery.type(oElement.focus) === "function") {
			setTimeout(function() {
				oElement.focus();
			}, 0);
		}
	}
});
    
return TagCard;
});