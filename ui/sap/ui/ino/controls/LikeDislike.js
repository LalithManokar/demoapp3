/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.controls.LikeDislike");

(function() {
    "use strict";

    /**
     * 
     * LikeDislike button control the user can use for voting. Like a toggle button w/ 3 states (not voted, positive or
     * negative voted). The button is also communicating w/ the backend. Button displays new state even before the
     * backend call is finished.
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>ideaId: Id of the idea, the LikeButton belongs to</li>
     * <li>status: current status of the button</li>
     * <li>ideaScoreLike: The overall positive score of votes for the idea</li>
     * <li>ideaScoreDislike: The overall negative score of votes for the idea</li>
     * <li>readOnly: Inactive vote</li>
     * <li>locked: Locked vote</li>
     * <li>lockedReasonText: Popup text describing the reason if the idea is locked</li>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * <li>like: Fired if the user votes positive for the idea</li>
     * <li>dislike: Fired if the user votes negative for the idea</li>
     * <li>unvote: Fired if the user revokes his vote</li>
     * </ul>
     * </li>
     * </ul>
     */
    sap.ui.core.Control.extend("sap.ui.ino.controls.LikeDislike", {
        metadata : {
            properties : {
                ideaId : {
                    type : "int",
                    defaultValue : 0
                },
                status : {
                    type : "string",
                    defaultValue : "unselected"
                },
                ideaScoreLike : {
                    type : "int",
                    defaultValue : 0
                },
                ideaScoreDislike : {
                    type : "int",
                    defaultValue : 0
                },
                readOnly : {
                    type : "boolean",
                    defaultValue : false
                },
                locked : {
                    type : "boolean",
                    defaultValue : false
                },
                lockedReasonText : "string"
            },
            events : {
                like : {},
                dislike : {},
                unvote : {}
            }
        },
        
        focus : function(iScore) {
        	if (iScore < 0) {
        		return jQuery(this.getDomRef()).find(".sapUiLikeDislikeButton-Dislike").focus();
        	}
        	else {
        		return jQuery(this.getDomRef()).find(".sapUiLikeDislikeButton-Like").focus();
        	}        	
        },

        renderer : function(oRm, oControl) {
            var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();

            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("sapUiLikeDislike");
            oRm.writeClasses();
            oRm.write(">");

            var likeButton = new sap.ui.commons.Button({
                lite : true
            });
            var dislikeButton = new sap.ui.commons.Button({
                lite : true
            });

            likeButton.addStyleClass("sapUiLikeDislikeButton");
            likeButton.addStyleClass("sapUiLikeDislikeButton-Like");
            dislikeButton.addStyleClass("sapUiLikeDislikeButton");
            dislikeButton.addStyleClass("sapUiLikeDislikeButton-Dislike");

            // functions to handle status changes and fire events
            function likeButtonSelect() {
                if (oControl.getLocked()) {
                    likeButton.addStyleClass("sapUiLikeDislikeLikeButtonSelectedLock").addStyleClass("spriteLikeDislike").addStyleClass("sapUiInothumb_up_on_lock");
                } else {
                    likeButton.addStyleClass("sapUiLikeDislikeLikeButtonSelected").addStyleClass("spriteLikeDislike").addStyleClass("sapUiInothumb_up_on");
                }
                if (!oControl.getReadOnly()) {
                    likeButton.setTooltip(i18n.getText("CTRL_LIKEDISLIKE_EXP_UNVOTE"));
                }
            }

            function likeButtonUnSelect() {
                if (oControl.getLocked()) {
                    likeButton.addStyleClass("sapUiLikeDislikeLikeButtonUnselectedLock").addStyleClass("spriteLikeDislike").addStyleClass("sapUiInothumb_up_off_lock");
                } else {
                    likeButton.addStyleClass("sapUiLikeDislikeLikeButtonUnselected").addStyleClass("spriteLikeDislike").addStyleClass("sapUiInothumb_up_off");
                }
                if (!oControl.getReadOnly()) {
                    likeButton.setTooltip(i18n.getText("CTRL_LIKEDISLIKE_EXP_LIKE"));
                }
            }

            function dislikeButtonSelect() {
                if (oControl.getLocked()) {
                    dislikeButton.addStyleClass("sapUiLikeDislikeDislikeButtonSelectedLock");
                } else {
                    dislikeButton.addStyleClass("sapUiLikeDislikeDislikeButtonSelected").addStyleClass("spriteLikeDislike").addStyleClass("sapUiInothumb_down_on");
                }
                if (!oControl.getReadOnly()) {
                    dislikeButton.setTooltip(i18n.getText("CTRL_LIKEDISLIKE_EXP_UNVOTE"));
                }
            }

            function dislikeButtonUnSelect() {
                if (oControl.getLocked()) {
                    dislikeButton.addStyleClass("sapUiLikeDislikeDislikeButtonUnselectedLock").addStyleClass("spriteLikeDislike").addStyleClass("sapUiInothumb_down_off_lock");
                } else {
                    dislikeButton.addStyleClass("sapUiLikeDislikeDislikeButtonUnselected").addStyleClass("spriteLikeDislike").addStyleClass("sapUiInothumb_down_off");
                }
                if (!oControl.getReadOnly()) {
                    dislikeButton.setTooltip(i18n.getText("CTRL_LIKEDISLIKE_EXP_DISLIKE"));
                }
            }

            function clearStyles() {
                likeButton.removeStyleClass("sapUiLikeDislikeLikeButtonUnselected").removeStyleClass("spriteLikeDislike").removeStyleClass("sapUiInothumb_up_off");
                likeButton.removeStyleClass("sapUiLikeDislikeLikeButtonUnselectedLock").removeStyleClass("spriteLikeDislike").removeStyleClass("sapUiInothumb_up_off_lock");
                likeButton.removeStyleClass("sapUiLikeDislikeLikeButtonSelected").removeStyleClass("spriteLikeDislike").removeStyleClass("sapUiInothumb_up_on");
                likeButton.removeStyleClass("sapUiLikeDislikeLikeButtonSelectedLock").removeStyleClass("spriteLikeDislike").removeStyleClass("sapUiInothumb_up_on_lock");
                dislikeButton.removeStyleClass("sapUiLikeDislikeDislikeButtonUnselected").removeStyleClass("spriteLikeDislike").removeStyleClass("sapUiInothumb_down_off");
                dislikeButton.removeStyleClass("sapUiLikeDislikeDislikeButtonUnselectedLock").removeStyleClass("spriteLikeDislike").removeStyleClass("sapUiInothumb_up_off_lock");
                dislikeButton.removeStyleClass("sapUiLikeDislikeDislikeButtonSelected").removeStyleClass("spriteLikeDislike").removeStyleClass("sapUiInothumb_down_on");
                dislikeButton.removeStyleClass("sapUiLikeDislikeDislikeButtonSelectedLock").removeStyleClass("spriteLikeDislike").removeStyleClass("sapUiInothumb_down_on_lock");
            }

            function like() {
                oControl.setStatus("like");
                oControl.fireLike({
                    id : oControl.getId()
                });
            }

            function dislike() {
                oControl.setStatus("dislike");
                oControl.fireDislike({
                    id : oControl.getId()
                });
            }

            function unvote() {
                oControl.setStatus("unselected");
                oControl.fireUnvote({
                    id : oControl.getId()
                });
            }

            // initial setting
            var status = oControl.getStatus();

            if (status == "unselected") {
                clearStyles();
                likeButtonUnSelect();
                dislikeButtonUnSelect();
            } else if (status == "like") {
                clearStyles();
                likeButtonSelect();
                dislikeButtonUnSelect();
            } else if (status == "dislike") {
                clearStyles();
                likeButtonUnSelect();
                dislikeButtonSelect();
            }

            if (!oControl.getReadOnly() && !oControl.getLocked()) {
                likeButton.addStyleClass("sapUiLikeDislikeButtonEdit");
                dislikeButton.addStyleClass("sapUiLikeDislikeButtonEdit");
                // event handler for like button
                likeButton.attachPress(function(oEvent) {
                    var status = oControl.getStatus();
                    if (status == "unselected") {
                        /*
                         * clearStyles(); likeButtonSelect(); dislikeButtonUnSelect();
                         */
                        like();
                        oControl.rerender();
                    } else if (status == "like") {
                        /*
                         * clearStyles(); likeButtonUnSelect(); dislikeButtonUnSelect();
                         */
                        unvote();
                        oControl.rerender();
                    } else if (status == "dislike") {
                        /*
                         * clearStyles(); likeButtonSelect(); dislikeButtonUnSelect();
                         */
                        like();
                        oControl.rerender();
                    }
                });

                // event handler for dislike button
                dislikeButton.attachPress(function(oEvent) {
                    var status = oControl.getStatus();
                    if (status == "unselected") {
                        /*
                         * clearStyles(); likeButtonUnSelect(); dislikeButtonSelect();
                         */
                        dislike();
                        oControl.rerender();
                    } else if (status == "like") {
                        /*
                         * clearStyles(); likeButtonUnSelect(); dislikeButtonSelect();
                         */
                        dislike();
                        oControl.rerender();
                    } else if (status == "dislike") {
                        /*
                         * clearStyles(); likeButtonUnSelect(); dislikeButtonUnSelect();
                         */
                        unvote();
                        oControl.rerender();
                    }
                });
            } else {
                likeButton.setEnabled(false);
                dislikeButton.setEnabled(false);
                if (oControl.getLocked()) {
                    likeButton.setTooltip(oControl.getLockedReasonText());
                    dislikeButton.setTooltip(oControl.getLockedReasonText());
                }
            }

            oRm.write("<div");
            oRm.addClass("sapUiLikeDislikeButtonDiv");
            oRm.writeClasses();
            oRm.write(">");
            oRm.renderControl(likeButton);

            oRm.write("<p");
            oRm.writeControlData(oControl);
            oRm.addClass("sapUiLikeDislikeButtonScore");
            oRm.writeClasses();
            oRm.write(">");
            if (oControl.getIdeaScoreLike() != 0) {
                oRm.writeEscaped("" + oControl.getIdeaScoreLike());
            } else {
                oRm.writeEscaped("0");
            }
            oRm.write("</p>");

            oRm.write("</div>");

            oRm.write("<div");
            oRm.addClass("sapUiLikeDislikeButtonDiv");
            oRm.writeClasses();
            oRm.write(">");
            oRm.renderControl(dislikeButton);

            oRm.write("<p");
            oRm.writeControlData(oControl);
            oRm.addClass("sapUiLikeDislikeButtonScore");
            oRm.writeClasses();
            oRm.write(">");
            if (oControl.getIdeaScoreDislike() != 0) {
                oRm.writeEscaped("" + oControl.getIdeaScoreDislike());
            } else {
                oRm.writeEscaped("0");
            }
            oRm.write("</p>");

            oRm.write("</div>");

            oRm.write("</div>");

        },

        onBeforeRendering : function() {
        },

        onAfterRendering : function() {

        },

        onclick : function(evt) {

        }
    });
})();