/*!
 * @copyright@
 */
sap.ui.define([
    "sap/m/ButtonType",
    "sap/ui/core/Control",
    "sap/ui/core/IconPool",
    "sap/m/HBox",
    "sap/m/RatingIndicator",
    "sap/m/ToggleButton",
    "sap/ino/controls/VoteType",
    "sap/ui/core/format/NumberFormat",
    "sap/ino/controls/LabelledIcon",
    "sap/m/Label"
], function(ButtonType,
	Control,
	IconPool,
	HBox,
	RatingIndicator,
	ToggleButton,
	VoteType,
	NumberFormat,
	LabelledIcon,
	Label) {
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
	 * <li> objectId: ID of the object for which the voting is rendered</li>
	 * <li> enabled: the flag shows if voting is enabled</li>
	 * <li> type: the type of voting, i.e., LIKE, DISLIKE, and STAR</li>
	 * <li> value: the vote score</li>
	 * <li> maxStar: the maximum number of stars if voting has type STAR</li>
	 * </ul>
	 * </li>
	 * <li>Aggregations
	 * <ul>
	 * <li> _like: the child control for LIKE voting</li>
	 * <li> _likeDislike: the child control for LIKE-DISLIKE voting</li>
	 * <li> _star: the child control for STAR voting</li>
	 * </ul>
	 * </li>
	 * </ul>
	 */
	var VoteControl = Control.extend("sap.ino.controls.VoteNoImage", {
		metadata: {
			properties: {
				"voteId": {
					type: "int"
				},
				"objectId": {
					type: "int"
				},
				"enabled": {
					type: "boolean"
				},
				"type": {
					type: "string"
				},
				"value": {
					type: "float"
				},
				"maxStar": {
					type: "int"
				},
				"tooltip": {
					type: "string"
				},
				"likeVotes": {
					type: "int"
				},
				"starVoteCount": {
					type: "int"
				},
				"starVotes": {
					type: "float"
				},
				"score": {
					type: "float"
				},
				"voteCount":{
				    type: "int"
				}
			},
			aggregations: {
				"_like": {
					type: "sap.m.ToggleButton",
					multiple: false,
					visibility: "hidden"
				},
				"_likeDislike": {
					type: "sap.m.HBox",
					// typd:"sap.m.ToggleButton",
					multiple: false,
					visibility: "hidden"
				},
				"_star": {
					type: "sap.m.RatingIndicator",
					multiple: false,
					visibility: "hidden"
				},
				"_score": {
					type: "sap.m.Text",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				userVote: {}
			}
		},

		init: function() {
			this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
		},

		_getLike: function() {
			var oLikeControl = this.getAggregation("_like");
			var that = this;
			if (!oLikeControl) {
				oLikeControl = new ToggleButton({
					enabled: this.getProperty("enabled"),
					icon: IconPool.getIconURI("heart", "InoIcons"),
					press: function() {
						that._onButtonPressed();
					},
					pressed: this.getProperty("value") === 1,
					tooltip: this.getProperty("tooltip"),
					type: ButtonType.Transparent
				});
				this.setAggregation("_like", oLikeControl, true);
			}
			return oLikeControl;
		},

		_getLikeDislike: function() {
			var oLikeDislikeControl = this.getAggregation("_likeDislike");
			var that = this;
			if (!oLikeDislikeControl) {
				var oLikeControl = new ToggleButton({
					enabled: this.getProperty("enabled"),
					icon: IconPool.getIconURI("thumbsup", "InoIcons"),
					press: function() {
						that._onButtonPressed(true);
					},
					pressed: this.getValue() === 1,
					tooltip: this.getProperty("tooltip"),
					type: ButtonType.Transparent
				});
				oLikeControl.addStyleClass("sapInoVoteLikeDislikeLike");
				
				var oDislikeControl = new ToggleButton({
					enabled: this.getProperty("enabled"),
					icon: IconPool.getIconURI("thumbsdown", "InoIcons"),
					press: function() {
						that._onButtonPressed();
					},
					pressed: this.getValue() === -1,
					tooltip: this.getProperty("tooltip"),
					type: ButtonType.Transparent
				});
				oDislikeControl.addStyleClass("sapInoVoteLikeDislikeDislike");

				oLikeDislikeControl = new HBox({
					displayInline: true,
					items: [oLikeControl, oDislikeControl],
					tooltip: this.getProperty("tooltip")
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

		_getStar: function() {
			var oStarControl = this.getAggregation("_star");
			var that = this;
			
			if (!oStarControl) {
				oStarControl = new RatingIndicator({
					change: function() {
						that._onButtonPressed();
					},
					enabled: this.getEnabled(),
					maxValue: this.getMaxStar(),
					value: this.getValue(),
					tooltip: this.getProperty("tooltip")
				}).addStyleClass('starVote');
				this.setAggregation("_star", oStarControl, true);
			}
			
			return oStarControl;
		},

        _getStatusText: function(){
            var voteStatus = this.getValue() === 1 || this.getValue() === -1 ? this._oRB.getText('CTRL_VOTE_DISPLAY_VOTED') : this._oRB.getText('CTRL_VOTE_DISPLAY_VOTE');
            return  voteStatus ;
        },

		renderer: function(oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("sapInoVoteNoImage");
			oRM.writeClasses();
			if (oControl.getTooltip_Text()) {
				oRM.writeAttributeEscaped("title", oControl.getTooltip());
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
			if (oVoteControl) {
				// ATTN.: DO NOT SET THE TOOLTIP FOR THE STARCONTROL LIKE THIS, AS THIS CAUSES A RERENDERING OF THE WHOLE LIST
				//oVoteControl.setTooltip(oControl.getTooltip_Text());
				oRM.renderControl(oVoteControl);
				if (oControl.getProperty("type") === VoteType.TYPE_STAR) {
					var oDisplayControl = oControl._getStarLabel();
					oRM.renderControl(oDisplayControl);
				}
				
			}

			oRM.write("</div>");
		},
		_getStarLabel: function() {
			var sLabel;
			var voteStatus = this.getVoteId() ? this._oRB.getText('CTRL_VOTE_DISPLAY_VOTED') : this._oRB.getText('CTRL_VOTE_DISPLAY_VOTE');
			var starVoted = this.getVoteId() ? 'sapInoStarVoted' : '' ; 
			var sStarVotes = this.getStarVotes();
			var iStarVoteCount = this.getStarVoteCount();
			if (sStarVotes !== undefined && sStarVotes !== null && iStarVoteCount !== undefined && iStarVoteCount !== null) {
				sLabel =  voteStatus + '  ' + oFloatFormat.format(sStarVotes);
			}
			var oLabelIcon = new LabelledIcon({
				label: sLabel
			}).addStyleClass(starVoted);
			return oLabelIcon;
		},
		_onButtonPressed: function(bLikePressed) {
			var fValue = this.getProperty("value");
			var sType = this.getProperty("type");
			if (sType) {
				switch (sType) {
					case VoteType.TYPE_LIKE:
						this.setProperty("value", (fValue === 1) ? 0 : 1);
						break;
					case VoteType.TYPE_LIKE_DISLIKE:
						var oLikeControl = this._getLikeDislikeLike();
						var oDislikeControl = this._getLikeDislikeDislike();
						if (bLikePressed && oLikeControl && oDislikeControl) {
							oDislikeControl.setPressed(false);
							oLikeControl.setPressed(oLikeControl.getPressed());
							this.setProperty("value", (oLikeControl.getPressed()) ? 1 : 0);
						} else if (oLikeControl && oDislikeControl) {
							oDislikeControl.setPressed(oDislikeControl.getPressed());
							oLikeControl.setPressed(false);
							this.setProperty("value", (oDislikeControl.getPressed()) ? -1 : 0);
						}
						break;
					case VoteType.TYPE_STAR:
						var oStar = this._getStar();
						this.setProperty("value", oStar.getValue());
						break;
					default:
						break;
				}
				this.fireUserVote({
					voteId: this.getVoteId(),
					value: this.getValue(),
					objectId: this.getObjectId(),
					type: this.getType(),
					oldValue: fValue
				});
			}
		}
	});

	VoteControl.prototype.setEnabled = function(oValue) {
		this.setProperty("enabled", oValue);
		if (this.getProperty("type")) {
			switch (this.getProperty("type")) {
				case VoteType.TYPE_LIKE:
					this._getLike().setEnabled(oValue);
					break;
				case VoteType.TYPE_LIKE_DISLIKE:
					this._getLikeDislikeLike().setEnabled(oValue);
					this._getLikeDislikeDislike().setEnabled(oValue);
					break;
				case VoteType.TYPE_STAR:
					this._getStar().setEnabled(oValue);
					break;
				default:
					break;
			}
		}
	};

	VoteControl.prototype.setValue = function(oValue) {
		this.setProperty("value", oValue);
		
		if (this.getProperty("type")) {
			switch (this.getProperty("type")) {
				case VoteType.TYPE_LIKE:
					this._getLike().setPressed(oValue === 1).setText(this._getStatusText());
					break;
				case VoteType.TYPE_LIKE_DISLIKE:
					this._getLikeDislikeLike().setPressed(oValue === 1);
					this._getLikeDislikeDislike().setPressed(oValue === -1);
					if(oValue === 1){
					    this._getLikeDislikeLike().setText(this._getStatusText());
					}else if(oValue === -1){
					    this._getLikeDislikeDislike().setText(this._getStatusText());
					}else{
					    this._getLikeDislikeLike().setText(this._getStatusText());
					    this._getLikeDislikeDislike().setText(this._getStatusText());
					}
					break;
				case VoteType.TYPE_STAR:
					this._getStar().setValue(oValue);
					break;
				default:
					break;
			}
		}
	};

	VoteControl.prototype.setType = function(oValue) {
		this.setProperty("type", oValue);
		this.setValue(this.getValue());
		this.setEnabled(this.getEnabled());
	};

	VoteControl.prototype.setMaxStar = function(iMaxStar) {
		this.setProperty("maxStar", iMaxStar);
		if (this.getProperty("type") === VoteType.TYPE_STAR) {
			this._getStar().setMaxValue(iMaxStar);
		}
	};

	VoteControl.prototype.setTooltip = function(oValue) {
		this.setProperty("tooltip", oValue);
		if (this.getProperty("type")) {
			switch (this.getProperty("type")) {
				case VoteType.TYPE_LIKE:
					this._getLike().setTooltip(oValue);
					break;
				case VoteType.TYPE_LIKE_DISLIKE:
					this._getLikeDislikeLike().setTooltip(oValue);
					this._getLikeDislikeDislike().setTooltip(oValue);
					break;
				case VoteType.TYPE_STAR:
					this._getStar().setTooltip(oValue);
					break;
				default:
					break;
			}
		} else {
			this.setAggregation("_like", undefined);
			this.setAggregation("_likeDislike", undefined);
			this.setAggregation("_star", undefined);
		}
	};

	return VoteControl;
});