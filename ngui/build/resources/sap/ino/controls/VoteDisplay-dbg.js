/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/IconPool",
    "sap/m/Text",
    "sap/m/HBox",
    "sap/ino/controls/LabelledIcon",
    "sap/ui/core/format/NumberFormat",
    "sap/ino/controls/VoteType"
], function (Control,
             IconPool,
             Text,
             HBox,
             LabelledIcon,
             NumberFormat,
             VoteType) {
    "use strict";
    
    var oIntegerFormat = NumberFormat.getIntegerInstance({
        style: "short"
    });
    var oFloatFormat = NumberFormat.getFloatInstance({
        decimals: 1
    });
    
    /**
     *
     * The VoteDisplay shows the current state of votes for an object, for instance, for an idea.
     * It indicates the type of votes and their amount.
     *
     * <ul>
     * <li>Properties
     * <ul>
     * <li> likeVotes: the number of LIKE votes</li>
     * <li> negativeVotes: the number of negative votes for LIKE_DISLIKE voting</li>
     * <li> positiveVotes: the number of positive votes for LIKE_DISLIKE voting</li>
     * <li> starVoteCount: the number of votes for STAR voting</li>
     * <li> starVotes: the average score for STAR voting</li>
     * <li> type: type of voting, i.e., LIKE, LIKE-DISLIKE, and STAR</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * <li> _like: the child control for displaying LIKE voting</li>
     * <li> _likeDislike: the child control for displaying LIKE-DISLIKE voting</li>
     * <li> _star: the child control for displaying STAR voting</li>
     * </ul>
     * </li>
     * </ul>
     */
    var VoteDisplay = Control.extend("sap.ino.controls.VoteDisplay", {
        metadata: {
            properties: {
                "likeVotes": {
                    type: "int"
                },
                "negativeVotes": {
                    type: "int"
                },
                "positiveVotes": {
                    type: "int"
                },
                "starVoteCount": {
                    type: "int"
                },
                "starVotes": {
                    type: "float"
                },
                "score" : {
                    type: "float"
                },
                "type": {
                    type: "string"
                },
                "isExpert": {
                    type : "boolean",
                    defaultValue : false
                }
            },
            aggregations: {
                "_like": {
                    type: "sap.ino.controls.LabelledIcon",
                    multiple: false,
                    visibility: "hidden"
                },
                "_likeDislike": {
                    type: "sap.m.HBox",
                    multiple: false,
                    visibility: "hidden"
                },
                "_star": {
                    type: "sap.ino.controls.LabelledIcon",
                    multiple: false,
                    visibility: "hidden"
                },
                "_score": {
                    type: "sap.m.Text",
                    multiple: false,
                    visibility: "hidden"
                }                
			}
        },
        
        init: function () {
            this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
        },
        
        _getLike: function() {
            var oLikeControl = this.getAggregation("_like");
            if (!oLikeControl) {
                oLikeControl = new LabelledIcon({
                    iconUrl: this.getIsExpert() ? "sap-icon://person-placeholder" : IconPool.getIconURI("heart","InoIcons"),
                    label: oIntegerFormat.format(this.getLikeVotes())
                });
                this.setAggregation("_like", oLikeControl, true);
            }
            return oLikeControl;
		},
		
		_getLikeDislike: function() {
            var oLikeDislikeControl = this.getAggregation("_likeDislike");
            if (!oLikeDislikeControl) {            
                var oLikeControl = new LabelledIcon({
                    iconUrl: this.getIsExpert() ? "sap-icon://employee-approvals" : IconPool.getIconURI("thumbsup","InoIcons"),
                    label: oIntegerFormat.format(this.getPositiveVotes())
                }).addStyleClass("sapInoVoteDisplayLike");
                var oDislikeControl = new LabelledIcon({
                    iconUrl: this.getIsExpert() ? "sap-icon://employee-rejections" : IconPool.getIconURI("thumbsdown","InoIcons"),
                    label: oIntegerFormat.format(this.getNegativeVotes())
                }).addStyleClass("sapInoVoteDisplayDislike");
                oLikeDislikeControl = new HBox({
                    items: [oLikeControl, oDislikeControl],
                    displayInline: true
                });
                this.setAggregation("_likeDislike", oLikeDislikeControl, true);
            }
            return oLikeDislikeControl;
		},
		
		_getLikeDislikeLike: function() {
		    return this._getLikeDislike().getItems()[0];
		},
		
		_getLikeDislikeDislike: function() {
		    return this._getLikeDislike().getItems()[1];
		},
		
		_getStarLabel: function() {
		    var sLabel;
            var sStarVotes = this.getStarVotes();
            var iStarVoteCount = this.getStarVoteCount();
            if (sStarVotes !== undefined && sStarVotes !== null && iStarVoteCount !== undefined && iStarVoteCount !== null) {
                if(iStarVoteCount !== 1){
                    sLabel = this._oRB.getText("CTRL_VOTE_DISPLAY_FLD_STARS", [oFloatFormat.format(sStarVotes), oIntegerFormat.format(iStarVoteCount)]);
                } else {
                    sLabel = this._oRB.getText("CTRL_VOTE_DISPLAY_FLD_STAR", [oFloatFormat.format(sStarVotes), iStarVoteCount]);
                }
            }
            
            return sLabel;
		},
		
		_getStar: function() {
            var oStarControl = this.getAggregation("_star");
            if (!oStarControl) {
                oStarControl = new LabelledIcon({
                    iconUrl: this.getIsExpert() ? "sap-icon://person-placeholder" : "sap-icon://favorite",
                    label: this._getStarLabel()
                });
                this.setAggregation("_star", oStarControl, true);
            }
            return oStarControl;
		},
		
		_getScore: function() {
            var oScoreControl = this.getAggregation("_score");
            if (!oScoreControl) {
                oScoreControl = new Text({
                    text: this.getScore()
                });
                this.setAggregation("_score", oScoreControl, true);
            }
            return oScoreControl;
        },
                
        renderer: function (oRM, oControl) {
            oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("sapInoVoteDisplay");
			oRM.writeClasses();
			if (oControl.getTooltip_Text()) {
			    oRM.writeAttributeEscaped("title", oControl.getTooltip_Text());
			}
			oRM.write(">");
			
            var oVoteControl;
            switch (oControl.getProperty("type")) {
                case VoteType.TYPE_LIKE:
                    oVoteControl = oControl._getLike();
                    break;
                case VoteType.TYPE_LIKE_DISLIKE:
                    oVoteControl = oControl._getLikeDislike();
                    break;
                case VoteType.TYPE_STAR:
                    oVoteControl = oControl._getStar();
                    break;
                default:
                    break;
            }
            if(oVoteControl) {
                oRM.renderControl(oVoteControl);
            }
            
            oRM.write("</div>");
        }
    });

    VoteDisplay.prototype.onAfterRendering = function() {
        this._getLike().data("ignoreExport", true);
        this._getLikeDislikeLike().data("ignoreExport", true);
        this._getLikeDislikeDislike().data("ignoreExport", true);
        this._getStar().data("ignoreExport", true);
    };    
    
    VoteDisplay.prototype.bindProperty = function (sKey, oBinding) {
        Control.prototype.bindProperty.apply(this, arguments);
        switch (sKey) {
            case "likeVotes":
                this._getLike().bindProperty("label", oBinding);
                break;
            case "positiveVotes":
                this._getLikeDislikeLike().bindProperty("label", oBinding);
                break;
            case "negativeVotes":
                this._getLikeDislikeDislike().bindProperty("label", oBinding);
                break;
            case "starVotes": 
                this._getStar().bindProperty("label", oBinding);
                break;
            case "score": 
                this._getScore().bindProperty("text", oBinding);
                break;
            default:
                break;
        }
    };
    
    VoteDisplay.prototype.setLikeVotes = function (oValue) {
        this.setProperty("likeVotes", oValue);
        this._getLike().setLabel(oIntegerFormat.format(oValue));
    };
    
    VoteDisplay.prototype.setStarVotes = function (oValue) {
        this.setProperty("starVotes", oValue);
        this._getStar().setLabel(this._getStarLabel());
    };
    
    VoteDisplay.prototype.setStarVoteCount = function (oValue) {
        this.setProperty("starVoteCount", oValue);
        this._getStar().setLabel(this._getStarLabel());
    };
    
    VoteDisplay.prototype.setPositiveVotes = function (oValue) {
        this.setProperty("positiveVotes", oValue);
        this._getLikeDislikeLike().setLabel(oIntegerFormat.format(oValue));
    };
    
    VoteDisplay.prototype.setNegativeVotes = function (oValue) {
        this.setProperty("negativeVotes", oValue);
        this._getLikeDislikeDislike().setLabel(oIntegerFormat.format(oValue));
    };
    
    return VoteDisplay;
});