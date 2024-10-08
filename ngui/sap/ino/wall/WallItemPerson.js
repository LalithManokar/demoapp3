/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemPerson");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBase");
    jQuery.sap.require("sap.ino.wall.util.Formatter");
    jQuery.sap.require("sap.ino.wall.DropUpload");
    jQuery.sap.require("sap.ino.commons.models.object.Attachment");

    jQuery.sap.require("sap.ino.commons.application.Configuration");
    var Configuration = sap.ino.commons.application.Configuration;

    /**
     * Constructor for a new WallItemPerson.
     * 
     * Accepts an object literal <code>mSettings</code> that defines initial property values, aggregated and
     * associated objects as well as event handlers.
     * 
     * If the name of a setting is ambiguous (e.g. a property has the same name as an event), then the framework assumes
     * property, aggregation, association, event in that order. To override this automatic resolution, one of the
     * prefixes "aggregation:", "association:" or "event:" can be added to the name of the setting (such a prefixed name
     * must be enclosed in single or double quotes).
     * 
     * The supported settings are:
     * <ul>
     * <li>Properties
     * <ul>
     * <li>{@link #getStatus status} : string (default: 'Normal')</li>
     * <li>{@link #getImage image} : sap.ui.core.URI</li>
     * <li>{@link #getPhone phone} : string</li>
     * <li>{@link #getEmail email} : string</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * </ul>
     * </li>
     * <li>Associations
     * <ul>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * </ul>
     * </li>
     * </ul>
     * 
     * 
     * In addition, all settings applicable to the base type
     * {@link sap.ino.wall.WallItemBase#constructor sap.ino.wall.WallItemBase} can be used as well.
     * 
     * @param {string}
     *            [sId] id for the new control, generated automatically if no id is given
     * @param {object}
     *            [mSettings] initial settings for the new control
     * 
     * @class Add your documentation for the new WallItemPerson control
     * @extends sap.ino.wall.WallItemBase
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.WallItemPerson
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ino.wall.WallItemBase.extend("sap.ino.wall.WallItemPerson", {
        metadata : {
            properties : {
                "status" : {
                    type : "string",
                    group : "Behavior",
                    defaultValue : 'Normal'
                },
                "image" : {
                    type : "sap.ui.core.URI",
                    group : "Behavior",
                    defaultValue : null
                },
                "phone" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : null
                },
                "email" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : null
                },
                "originId" : {
                    type : "int",
                    group : "Misc",
                    defaultValue : 0
                },
                "requestImage" : {
                    type : "boolean",
                    group : "Misc",
                    defaultValue : false
                },
                "assignmentId" : {
                    type : "int",
                    group : "Identification",
                    defaultValue : -1
                }
            },
            aggregations : {
                "_image" : {
                    type : "sap.m.Image",
                    multiple : false,
                    visibility : "hidden"
                },
                "_inputPhone" : {
                    type : "sap.m.Input",
                    multiple : false,
                    visibility : "hidden"
                },
                "_inputEmail" : {
                    type : "sap.m.Input",
                    multiple : false,
                    visibility : "hidden"
                },
                "_linkPhone" : {
                    type : "sap.m.Link",
                    multiple : false,
                    visibility : "hidden"
                },
                "_linkEmail" : {
                    type : "sap.m.Link",
                    multiple : false,
                    visibility : "hidden"
                },
                "_busyIndicator" : {
                    type : "sap.m.BusyIndicator",
                    multiple : false,
                    visibility : "hidden"
                },
                "_dropUpload" : {
                    type : "sap.ino.wall.DropUpload",
                    multiple : false,
                    visibility : "hidden"
                }
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.WallItemPerson with name <code>sClassName</code> and enriches
     * it with the information contained in <code>oClassInfo</code>.
     * 
     * <code>oClassInfo</code> might contain the same kind of informations as described in
     * {@link sap.ui.core.Element.extend Element.extend}.
     * 
     * @param {string}
     *            sClassName name of the class to be created
     * @param {object}
     *            [oClassInfo] object literal with informations about the class
     * @param {function}
     *            [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to
     *            sap.ui.core.ElementMetadata.
     * @return {function} the created class / constructor function
     * @public
     * @static
     * @name sap.ino.wall.WallItemPerson.extend
     * @function
     */

    /**
     * Getter for property <code>status</code>. The status of the person item. If set to "Busy" a busy indicator will
     * overlay the preview to indicate that the image is currently uploaded.
     * 
     * Default value is <code>Normal</code>
     * 
     * @return {string} the value of property <code>status</code>
     * @public
     * @name sap.ino.wall.WallItemPerson#getStatus
     * @function
     */

    /**
     * Setter for property <code>status</code>.
     * 
     * Default value is <code>Normal</code>
     * 
     * @param {string}
     *            sStatus new value for property <code>status</code>
     * @return {sap.ino.wall.WallItemPerson} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemPerson#setStatus
     * @function
     */

    /**
     * Getter for property <code>image</code>. The image URI to be displayed with the person.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {sap.ui.core.URI} the value of property <code>image</code>
     * @public
     * @name sap.ino.wall.WallItemPerson#getImage
     * @function
     */

    /**
     * Setter for property <code>image</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {sap.ui.core.URI}
     *            sImage new value for property <code>image</code>
     * @return {sap.ino.wall.WallItemPerson} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemPerson#setImage
     * @function
     */

    /**
     * Getter for property <code>phone</code>. A description text.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {string} the value of property <code>phone</code>
     * @public
     * @name sap.ino.wall.WallItemPerson#getPhone
     * @function
     */

    /**
     * Setter for property <code>phone</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {string}
     *            sPhone new value for property <code>phone</code>
     * @return {sap.ino.wall.WallItemPerson} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemPerson#setPhone
     * @function
     */

    /**
     * Getter for property <code>email</code>. A description text.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {string} the value of property <code>email</code>
     * @public
     * @name sap.ino.wall.WallItemPerson#getEmail
     * @function
     */

    /**
     * Setter for property <code>email</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {string}
     *            sEmail new value for property <code>email</code>
     * @return {sap.ino.wall.WallItemPerson} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemPerson#setEmail
     * @function
     */

    sap.ino.wall.WallItemPerson._DEFAULT_IMAGE = "images/default/person.png";

    sap.ino.wall.WallItemPerson.prototype.init = function() {
        sap.ino.wall.WallItemBase.prototype.init.call(this);
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Input} the input
     */
    sap.ino.wall.WallItemPerson.prototype._getInputEmail = function() {
        var that = this, oControl = this.getAggregation("_inputEmail");

        if (!oControl) {
            // create control
            oControl = new sap.m.Input({
                value : this.getEmail(),
                placeholder : this._oRB.getText("WALL_ITEMPERSON_PLACEHOLDER_EMAIL"),
                change : function(oEvent) {
                    that.setEmail(oEvent.getParameter("newValue"), false, true);
                }
            }).addStyleClass("sapInoWallWIPEmailIP");

            // set hidden aggregation without rerendering
            this.setAggregation("_inputEmail", oControl, true);
        }

        return oControl;
    };

    sap.ino.wall.WallItemPerson.prototype._getInputTitle = function() {
        var bEnhanceInput = !this.getAggregation("_inputTitle");
        var oTitleInput = sap.ino.wall.WallItemBase.prototype._getInputTitle.apply(this, arguments);
        if (bEnhanceInput) {
            oTitleInput.setShowSuggestion(true);
            oTitleInput.attachSuggest(function(oEvent) {
                var sValue = oEvent.getParameter("suggestValue");
                // Encoding needed for IE!
                var oListItemTemplate = new sap.ui.core.ListItem({
                    text : "{data>NAME}",
                    additionalText : "{data>USER_NAME}",
                    key : "{data>ID}"
                });
                oEvent.getSource().bindAggregation("suggestionItems", {
                    path : "data>/SearchIdentityWallItemPerson(searchToken='" + jQuery.sap.encodeURL(sValue) + "')/Results",
                    template : oListItemTemplate,
                    parameters : {
                        select : "searchToken,ID,NAME,USER_NAME"
                    }
                });
            });
            oTitleInput.setFilterFunction(function(sValue, oItem) {
                return true;
            });
        }
        return oTitleInput;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Input} the input
     */
    sap.ino.wall.WallItemPerson.prototype._getInputPhone = function() {
        var that = this, oControl = this.getAggregation("_inputPhone");

        if (!oControl) {
            // create control
            oControl = new sap.m.Input({
                value : this.getPhone(),
                placeholder : this._oRB.getText("WALL_ITEMPERSON_PLACEHOLDER_PHONE"),
                change : function(oEvent) {
                    that.setPhone(oEvent.getParameter("newValue"));
                }
            }).addStyleClass("sapInoWallWIPPhoneIP");

            // set hidden aggregation without rerendering
            this.setAggregation("_inputPhone", oControl, true);
        }

        return oControl;
    };

    /**
     * Lazy initialization of control managed in an internal aggregation
     * 
     * @private
     * @returns {sap.m/BusyIndicator} the control
     */

    sap.ino.wall.WallItemPerson.prototype._getBusyIndicator = function() {
        var oBusyIndicator = this.getAggregation("_busyIndicator");

        if (!oBusyIndicator) {
            // create control
            oBusyIndicator = new sap.m.BusyIndicator(this.getId() + "-busy").addStyleClass("sapInoWallIndicatorBusy");

            // set hidden aggregation without rerendering
            this.setAggregation("_busyIndicator", oBusyIndicator, true);
        }

        return oBusyIndicator;
    };

    /*******************************************************************************************************************
     * overloaded setters to supress rendering and update ui
     ******************************************************************************************************************/

    sap.ino.wall.WallItemPerson.prototype.setImage = function(sURI, bSuppressNotify) {
        var that = this;
        that.$().find(".sapInoWallWIPImageWrapper").addClass("sapInoWallWIPImageWrapperDefaultImage");
        var oOldImage = this.getAggregation("_image"), oNewImage = null, fnImageOnload = function(oEvent) {
            // call original function
            if (sap.m.Image.prototype.onload) {
                sap.m.Image.prototype.onload.apply(this, arguments);
            }

            that.$().find(".sapInoWallWIPImageWrapper").removeClass("sapInoWallWIPImageWrapperDefaultImage");
            // hide busy indicator after loading the preview
            that.setStatus("Normal");
        }, fnImageOnerror = function(oEvent) {
            // call original function
            if (sap.m.Image.prototype.onerror) {
                sap.m.Image.prototype.onerror.apply(this, arguments);
            }
            // set default image again when no image is available
            // this.setSrc(sap.ino.wall.WallItemPerson._DEFAULT_IMAGE);
            that.$().find(".sapInoWallWIPImageWrapper").addClass("sapInoWallWIPImageWrapperDefaultImage");
            that.setStatus("Normal");
        };

        // re-rendering, replace it with a DOM manipulation
        this.setProperty("image", sURI, (oOldImage ? true : false));
        if (oOldImage) {
            oOldImage.destroy();
        }

        oNewImage = new sap.m.Image({
            src : sURI,
            densityAware : false
        }).addEventDelegate({
            // only density-aware images call onload/onerror in the current implementation but we don't have a
            // high-res picture so we need to register the handlers by ourselves
            onBeforeRendering : function(oEvent) {
                var oImage = oEvent.srcControl, $image = oImage.$();

                // unbind the load and error event handler
                $image.unbind("load", oImage.___onloadproxy);
                $image.unbind("error", oImage.___onloadproxy);
            },
            onAfterRendering : jQuery.proxy(function(oEvent) {
                var oImage = oEvent.srcControl, $image = oImage.$();

                // set an internal pointer inside sap.m.Image
                if (!oImage.___onloadproxy) {
                    oImage.___onloadproxy = jQuery.proxy(oImage.onload, oImage);
                    oImage.___onerrorproxy = jQuery.proxy(oImage.onerror, oImage);
                }
                // bind the load and error event handler
                $image.bind("load", jQuery.proxy(oImage.___onloadproxy, oImage));
                $image.bind("error", jQuery.proxy(oImage.___onerrorproxy, oImage));
            }, oNewImage)
        });
        // we add our custom handlers to do stuff that is currently not possible with sap.m.Image
        oNewImage.onload = fnImageOnload;
        oNewImage.onerror = fnImageOnerror;

        oNewImage.attachPress(function(oEvent) {
            if (!that._bMoving && that.getParent() instanceof sap.ino.wall.Wall) {
                that.setFlipped(true);
            }
        });

        this.setAggregation("_image", oNewImage, true);

        if (this._isRendered()) {
            // render new item
            this._renderItemIntoContainer(this.$().find("#" + this.getId() + "-imageWrapper").children("a")[0], this.getAggregation("_image"), false, true);

            // inform wall that this item has changed a persistence property
            if (this.getParent() && !bSuppressNotify) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
    };
    
    sap.ino.wall.WallItemPerson.prototype.setAssignmentId = function(iID) {
        
        this.setProperty("assignmentId", iID, true);
        
        // inform wall that this item has changed a persistence property
        if (this.getParent()) {
            this.getParent()._notifyItemChanged(this);
        }
        return this;
    };

    /*
     * Shows/hides a busy indicator when uploading imaged without rerendering @override
     */
    sap.ino.wall.WallItemPerson.prototype.setStatus = function(sStatus) {
        var oImage, oBusyIndicator;

        this.setProperty("status", sStatus, true);
        if (this._isRendered()) {
            oImage = this._getImage();
            oBusyIndicator = this._getBusyIndicator();
            if (this.getStatus() === "Busy") {
                oBusyIndicator.removeStyleClass("sapInoWallInvisible");
                oImage.addStyleClass("sapInoWallImageBusy");
            } else {
                oBusyIndicator.addStyleClass("sapInoWallInvisible");
                oImage.removeStyleClass("sapInoWallImageBusy");
            }
        }
    };

    sap.ino.wall.WallItemPerson.prototype._requestIdentity = function(sValue) {
        var that = this;

        if (!sValue) {
            return;
        }
        
        this.setRequestImage(false);

        jQuery.ajax({
            url : Configuration.getBackendRootURL() + "/" + Configuration.getSystemSetting("sap.ino.config.URL_PATH_OD_APPLICATION") + "/SearchIdentityWallItemPerson(searchToken='" + jQuery.sap.encodeURL(sValue) + "')/Results?$select=searchToken,ID,NAME,USER_NAME&$format=json",
            type : "GET"
        }).success(function(oData) {
            var iIdentity, iImage, sPhone, sEmail, sName;
            var iSet = 0;

            if (oData.d && jQuery.type(oData.d.results) === "array") {
                // use the first item that is identical to the search
                // => only if there is just one person w/ this name
                for (var ii = 0; ii < oData.d.results.length; ii++) {
                    var oResult = oData.d.results[ii];
                    if ((oResult.searchToken && oResult.NAME && oResult.searchToken.toLowerCase() === oResult.NAME.toLowerCase()) || (oResult.searchToken && oResult.EMAIL && oResult.searchToken.toLowerCase() === oResult.EMAIL.toLowerCase())) {
                        iIdentity = oResult.ID;
                        iImage = oResult.IMAGE_ID;
                        sPhone = oResult.PHONE ? oResult.PHONE : oResult.MOBILE;
                        sEmail = oResult.EMAIL;
                        sName = oResult.NAME;

                        iSet++;
                    }
                }

                // do nothing if there are multiple persons or the identity has already been set
                if (iSet === 1 && iIdentity && iIdentity !== that.getProperty("originId")) {
                    // update everything
                    that.setProperty("originId", iIdentity, true);

                    if (iImage > 0) {
                        that.setProperty("image", Configuration.getAttachmentDownloadURL(iImage), true);
                    } else {
                        that.setProperty("image", "", true);
                    }
                    that._fetchPicture();

                    that.setPhone(sPhone);
                    that.setEmail(sEmail);
                    that.setTitle(sName);

                    that.rerender();
                }
            }

        }).error(function(jqXHR, sStatus, sErrorThrown) {
            // TODO: Handle error
        });
    };

    sap.ino.wall.WallItemPerson.prototype.setTitle = function(sTitle, bSuppressNotify, bRequestIdentity) {
        // call the base class method
        sap.ino.wall.WallItemBase.prototype.setTitle.apply(this, arguments);

        // hide the meta information if there is nothing to show
        if (this._isRendered()) {
            this.$().find(".sapInoWallWIPMeta").toggleClass("sapInoWallInvisible", !this.getTitle() && !this.getEmail() && !this.getPhone());
        }

        if (bRequestIdentity) {
            this._requestIdentity(sTitle);
        }
    };

    sap.ino.wall.WallItemPerson.prototype.setPhone = function(sPhone, bSuppressNotify) {
        var oLinkPhone = this._getLinkPhone();

        this.setProperty("phone", sPhone, true);
        // update link control
        oLinkPhone.setText(sPhone);
        oLinkPhone.toggleStyleClass("sapInoWallInvisible", !sPhone);

        var oInputPhone = this._getInputPhone();
        oInputPhone.setValue(sPhone);

        // hide the meta information if there is nothing to show
        if (this._isRendered()) {
            this.$().find(".sapInoWallWIPMeta").toggleClass("sapInoWallInvisible", !this.getTitle() && !this.getEmail() && !this.getPhone());
        }

        // inform wall that this item has changed a persistence property
        if (this.getParent() && !bSuppressNotify) {
            this.getParent()._notifyItemChanged(this);
        }
        return this;
    };

    sap.ino.wall.WallItemPerson.prototype.setEmail = function(sEmail, bSuppressNotify, bRequestIdentity) {
        var oLinkEmail = this._getLinkEmail();

        this.setProperty("email", sEmail, true);
        // update link control
        oLinkEmail.setText(sEmail);
        oLinkEmail.toggleStyleClass("sapInoWallInvisible", !sEmail);

        var oInputEmail = this._getInputEmail();
        oInputEmail.setValue(sEmail);

        // hide the meta information if there is nothing to show
        if (this._isRendered()) {
            this.$().find(".sapInoWallWIPMeta").toggleClass("sapInoWallInvisible", !this.getTitle() && !this.getEmail() && !this.getPhone());
        }

        // fetch address book picture (when updating the email address
        if (sEmail && sEmail.length > 0 && bRequestIdentity) {
            this._requestIdentity(sEmail);
        }

        // inform wall that this item has changed a persistence property
        if (this.getParent() && !bSuppressNotify) {
            this.getParent()._notifyItemChanged(this);
        }
        return this;
    };

    sap.ino.wall.WallItemPerson.prototype.setRequestImage = function(bRequestImage, bSuppressNotify) {
        this.setProperty("requestImage", bRequestImage, true);

        // inform wall that this item has changed a persistence property
        if (this.getParent() && !bSuppressNotify) {
            this.getParent()._notifyItemChanged(this);
        }
        return this;
    };
    
    /*
     * Fetches a picture from the address book by converting the email address to the user id @private @returns
     * {sap.m/Button} the button
     */
    sap.ino.wall.WallItemPerson.prototype._fetchPicture = function() {
        var sImage = this.getProperty("image");
        this.setImage(sImage);
    };

    sap.ino.wall.WallItemPerson.prototype._uploadImage = function(oEvent) {
        var that = this, aFiles = oEvent.getParameter("files"), oFile, oFormData, oReader;

        // set title to nothing if it is still the default (image-only mode)
        if (this.getTitle() === this._oRB.getText("WALL_ITEMPERSON_NEW_TEXT")) {
            this.setTitle("");
        }

        // display an error if user tries to drop a file with IE9
        if (sap.ui.Device.browser.name === "ie" && sap.ui.Device.browser.version < 10 && aFiles === undefined) {
            return;
        }

        // hide drag preview
        jQuery.sap.byId(this.getParent().getId() + "-drag").css("display", "none");

        // reset cursor to normal
        this.$().removeClass("dragCursor");

        if (aFiles.length !== 0) {
            oFile = aFiles[0];
            if (!!oFile.type.match(/image\.*/)) {
                that.setStatus("Busy");
                that.setFlipped(false);
                sap.ino.commons.models.object.Attachment.uploadFile(oFile).done(function(oResponse) {
                    var iStorageId = oResponse.attachmentId;
                    setTimeout(function() {
                        that.setImage(Configuration.getAttachmentDownloadURL(iStorageId));
                    }, 500);
                }).fail(function(oResponse) {
                    // TODO: Handle error
                });
            }
        }
    };

    /*
     * Lazy initialization of the internal dialog @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemPerson.prototype._getImage = function() {
        var oImage = this.getAggregation("_image");

        if (!oImage) {
            this.setImage("");
            this.$().find(".sapInoWallWIPImageWrapper").addClass("sapInoWallWIPImageWrapperDefaultImage");
            oImage = this.getAggregation("_image");
        }
        return oImage;
    };
    
    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Link} the link
     */
    sap.ino.wall.WallItemPerson.prototype._getLinkPhone = function() {
        var that = this, oControl = this.getAggregation("_linkPhone");

        if (!oControl) {
            // create control
            oControl = new sap.m.Link({
                text : sap.ino.wall.util.Formatter.escapeBindingCharacters(this.getPhone()),
                press : function(oEvent) {
                    sap.m.URLHelper.triggerTel(that.getPhone());
                }
            }).addStyleClass("sapInoWallWIPPhoneL").addStyleClass("noflip").toggleStyleClass("sapInoWallInvisible", !this.getPhone());

            // set hidden aggregation without rerendering
            this.setAggregation("_linkPhone", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Link} the link
     */
    sap.ino.wall.WallItemPerson.prototype._getLinkEmail = function() {
        var that = this, oControl = this.getAggregation("_linkEmail");

        if (!oControl) {
            // create control
            oControl = new sap.m.Link({
                text : sap.ino.wall.util.Formatter.escapeBindingCharacters(this.getEmail()),
                press : function(oEvent) {
                    sap.m.URLHelper.triggerEmail(that.getEmail());
                }
            }).addStyleClass("sapInoWallWIPEmailL").addStyleClass("noflip").toggleStyleClass("sapInoWallInvisible", !this.getEmail());

            // set hidden aggregation without rerendering
            this.setAggregation("_linkEmail", oControl, true);
        }

        return oControl;
    };

    /**
     * Lazy initialization of a control managed in an internal aggregation
     * 
     * @private
     * @returns {sap.ui.core/Icon} the control
     */
    sap.ino.wall.WallItemPerson.prototype._getDropUpload = function() {
        var oControl = this.getAggregation("_dropUpload");

        if (!oControl) {
            // create control
            oControl = new sap.ino.wall.DropUpload({
                size : "S",
                change : [this._uploadImage, this]
            });

            // set hidden aggregation without rerendering
            this.setAggregation("_dropUpload", oControl, true);
        }

        return oControl;
    };

    /**
     * creates a minimalic JSON representation of the item to be stored in the db
     * 
     * @param {string}
     *            sColor color identifier
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemPerson.prototype.formatToJSON = function() {
        // call the base object's JSON method
        var oJSON = sap.ino.wall.WallItemBase.prototype.formatToJSON.call(this);
        // add properties of this control
        oJSON.content.phone = this.getPhone();
        oJSON.content.email = this.getEmail();
        oJSON.content.originId = this.getOriginId();
        oJSON.content.requestImage = this.getRequestImage();
        if (this.getImage()) {
            oJSON.content.image = this.getImage();
            oJSON.content.assignmentId = this.getAssignmentId();
        }
        // return the final object
        return oJSON;
    };

})();