/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.controls.LikeButton");

(function() {
    "use strict";
    
    /**
     * 
     * LikeButton control the user can use for voting. Like a toggle button, but also communicating w/ the backend.
     * Button displays new state even before the backend call is finished.
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>ideaId: Id of the idea, the LikeButton belongs to</li>
     * <li>likeSelected: if true, the user already voted for the idea</li>
     * <li>ideaScore: The overal score of votes for the idea</li>
     * <li>readOnly: Inactive vote</li>
     * <li>locked: Locked vote</li>
     * <li>lockedReasonText: Popup text describing the reason if the idea is locked</li>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * <li>like: Fired if the user votes for the idea</li>
     * <li>unvote: Fired if the user revokes his vote</li>
     * </ul>
     * </li>
     * </ul>
     */
    sap.ui.core.Control.extend("sap.ui.ino.controls.LikeButton", {
        metadata : {
            properties : {
                ideaId : {
                    type : "int",
                    defaultValue : 0
                },
                likeSelected : {
                    type : "boolean",
                    defaultValue : false
                },
                ideaScore : {
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
                unvote : {}
            }
        },
        
        focus : function() {
        	return jQuery(this.getDomRef()).find(".sapUiLikeButtonButton").focus();
        },

        renderer : function(oRm, oControl) {

            var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();

            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("sapUiLikeButton");
            oRm.writeClasses();
            oRm.write(">");

            var likeButton = new sap.ui.commons.Button({
                lite : true
            });
            likeButton.addStyleClass("sapUiLikeButtonButton");

            this._oLikeButton = likeButton;

            function likeButtonSelect() {
                if (oControl.getLocked()) {
                    likeButton.removeStyleClass("sapUiLikeButtonUnselectedLock");
                    likeButton.addStyleClass("sapUiLikeButtonSelectedLock");
                } else {
                    likeButton.removeStyleClass("sapUiLikeButtonUnselected");
                    likeButton.addStyleClass("sapUiLikeButtonSelected");
                }
                if (!oControl.getReadOnly()) {
                    likeButton.setTooltip(i18n.getText("CTRL_LIKEBUTTON_EXP_UNVOTE"));
                }
            }

            function likeButtonUnSelect() {
                if (oControl.getLocked()) {
                    likeButton.removeStyleClass("sapUiLikeButtonSelectedLock");
                    likeButton.addStyleClass("sapUiLikeButtonUnselectedLock");
                } else {
                    likeButton.removeStyleClass("sapUiLikeButtonSelected");
                    likeButton.addStyleClass("sapUiLikeButtonUnselected");
                }
                if (!oControl.getReadOnly()) {
                    likeButton.setTooltip(i18n.getText("CTRL_LIKEBUTTON_EXP_LIKE"));
                }
            }

            if (oControl.getLikeSelected()) {
                likeButtonSelect();
            } else {
                likeButtonUnSelect();
            }

            if (!oControl.getReadOnly() && !oControl.getLocked()) {
                likeButton.addStyleClass("sapUiLikeButtonButtonEdit");
                likeButton.attachPress(function(oEvent) {

                    if (oControl.getLikeSelected()) {
                        oControl.setLikeSelected(false);
                        oControl.fireUnvote({
                            id : oControl.getId()
                        });
                    } else {
                        oControl.setLikeSelected(true);
                        oControl.fireLike({
                            id : oControl.getId()
                        });
                    }
                    oControl.rerender();
                });
            } else {
                likeButton.setEnabled(false);
                if (oControl.getLocked()) {
                    likeButton.setTooltip(oControl.getLockedReasonText());
                }
            }

            oRm.renderControl(likeButton);

            oRm.write("<p");
            oRm.writeControlData(oControl);
            oRm.addClass("sapUiLikeButtonScore");
            oRm.writeClasses();
            oRm.write(">");
            if (oControl.getIdeaScore() != 0) {
                oRm.writeEscaped("" + oControl.getIdeaScore());
            } else {
                oRm.writeEscaped("0");
            }
            oRm.write("</p>");

            oRm.write("</div>");
        }
    });
})();