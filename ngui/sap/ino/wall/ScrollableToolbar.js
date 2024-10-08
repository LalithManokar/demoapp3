/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.ScrollableToolbar");

(function() {
    "use strict";

    /**
     * Constructor for a new ScrollableToolbar.
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
     * <li>{@link #getVisible visible} : boolean (default: true)</li>
     * <li>{@link #getOrientation orientation} : string (default: "Horizontal")</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * <li>{@link #getContent content} : sap.ui.core.Control[]</li>
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
     * @param {string}
     *            [sId] id for the new control, generated automatically if no id is given
     * @param {object}
     *            [mSettings] initial settings for the new control
     * 
     * @class Add your documentation for the newScrollableToolbar
     * @extends sap.ui.core.Control
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.ScrollableToolbar
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ui.core.Control.extend("sap.ino.wall.ScrollableToolbar", {
        metadata : {
            properties : {
                "visible" : {
                    type : "boolean",
                    group : "Appearance",
                    defaultValue : true
                },
                "orientation" : {
                    type : "string",
                    group : "Appearance",
                    defaultValue : "Horizontal"
                },
                "scrollStep" : {
                    type : "float",
                    defaultValue : 500
                },
                "scrollIntoView" : {
                    type : "boolean",
                    defaultValue : true
                }
            },
            aggregations : {
                "content" : {
                    type : "sap.ui.core.Control",
                    multiple : true,
                    singularName : "content"
                }
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.ScrollableToolbar with name <code>sClassName</code> and
     * enriches it with the information contained in <code>oClassInfo</code>.
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
     * @name sap.ino.wall.ScrollableToolbar.extend
     * @function
     */

    /**
     * Getter for property <code>visible</code>. Sets the visibility of the control.
     * 
     * Default value is <code>true</code>
     * 
     * @return {boolean} the value of property <code>visible</code>
     * @public
     * @name sap.ino.wall.ScrollableToolbar#getVisible
     * @function
     */

    /**
     * Setter for property <code>visible</code>.
     * 
     * Default value is <code>true</code>
     * 
     * @param {boolean}
     *            bVisible new value for property <code>visible</code>
     * @return {sap.ino.wall.ScrollableToolbar} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ScrollableToolbar#setVisible
     * @function
     */

    /**
     * Getter for aggregation <code>content</code>.<br/> The content of the toolbar.
     * 
     * @return {sap.ui.core.Control[]}
     * @public
     * @name sap.ino.wall.ScrollableToolbar#getContent
     * @function
     */

    /**
     * Inserts a content into the aggregation named <code>content</code>.
     * 
     * @param {sap.ui.core.Control}
     *            oContent the content to insert; if empty, nothing is inserted
     * @param {int}
     *            iIndex the <code>0</code>-based index the content should be inserted at; for a negative value of
     *            <code>iIndex</code>, the content is inserted at position 0; for a value greater than the current
     *            size of the aggregation, the content is inserted at the last position
     * @return {sap.ino.wall.ScrollableToolbar} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ScrollableToolbar#insertContent
     * @function
     */

    /**
     * Adds some content <code>oContent</code> to the aggregation named <code>content</code>.
     * 
     * @param {sap.ui.core.Control}
     *            oContent the content to add; if empty, nothing is inserted
     * @return {sap.ino.wall.ScrollableToolbar} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ScrollableToolbar#addContent
     * @function
     */

    /**
     * Removes an content from the aggregation named <code>content</code>.
     * 
     * @param {int |
     *            string | sap.ui.core.Control} vContent the content to remove or its index or id
     * @return {sap.ui.core.Control} the removed content or null
     * @public
     * @name sap.ino.wall.ScrollableToolbar#removeContent
     * @function
     */

    /**
     * Removes all the controls in the aggregation named <code>content</code>.<br/> Additionally unregisters them
     * from the hosting UIArea.
     * 
     * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
     * @public
     * @name sap.ino.wall.ScrollableToolbar#removeAllContent
     * @function
     */

    /**
     * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>content</code> and
     * returns its index if found or -1 otherwise.
     * 
     * @param {sap.ui.core.Control}
     *            oContent the content whose index is looked for.
     * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
     * @public
     * @name sap.ino.wall.ScrollableToolbar#indexOfContent
     * @function
     */

    /**
     * Destroys all the content in the aggregation named <code>content</code>.
     * 
     * @return {sap.ino.wall.ScrollableToolbar} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ScrollableToolbar#destroyContent
     * @function
     */

    // When to create a scroll delegate:
    sap.ino.wall.ScrollableToolbar.prototype._bDeviceDesktop = true; //sap.ui.Device.system.desktop;
    // Disable scroll container 
    sap.ino.wall.ScrollableToolbar.prototype._bDoScroll = false; //!sap.ui.Device.system.desktop || (sap.ui.Device.os.windows && sap.ui.Device.os.version === 8);

    /**
     * Init
     */
    sap.ino.wall.ScrollableToolbar.prototype.init = function() {
        this._bPreviousScrollForward = false; // remember the item overflow state
        this._bPreviousScrollBack = false;
        this._iCurrentScrollLeft = 0;
        this._iCurrentScrollTop = 0;
        this._bRtl = sap.ui.getCore().getConfiguration().getRTL();

        this.startScrollX = 0;
        this.startTouchX = 0;
        this.startScrollY = 0;
        this.startTouchY = 0;
        this._scrollable = null;

        // Initialize the ItemNavigation
        this._oItemNavigation = new sap.ui.core.delegate.ItemNavigation().setCycling(false);
        this._oItemNavigation.attachEvent(sap.ui.core.delegate.ItemNavigation.Events.AfterFocus, this._onItemNavigationAfterFocus, this);
        this.addDelegate(this._oItemNavigation);

        if (this._bDoScroll) {
            jQuery.sap.require("sap.ui.core.delegate.ScrollEnablement");
            this._oScroller = new sap.ui.core.delegate.ScrollEnablement(this, this.getId() + "-head", {
                horizontal : (this.getOrientation() === "Horizontal" ? true : false),
                vertical : (this.getOrientation() !== "Horizontal" ? true : false),
                nonTouchScrolling : true
            });
        }

    };

    /**
     * Exit
     */
    sap.ino.wall.ScrollableToolbar.prototype.exit = function() {
        if (this._oArrowLeft) {
            this._oArrowLeft.destroy();
        }
        if (this._oArrowRight) {
            this._oArrowRight.destroy();
        }

        if (this._oItemNavigation) {
            this.removeDelegate(this._oItemNavigation);
            this._oItemNavigation.destroy();
            delete this._oItemNavigation;
        }

        if (this._oScroller) {
            this._oScroller.destroy();
            this._oScroller = null;
        }

        if (this._sResizeListenerId) {
            sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);
            this._sResizeListenerId = null;
        }
    };

    /**
     * Before Rendering
     */
    sap.ino.wall.ScrollableToolbar.prototype.onBeforeRendering = function() {
        if (this._sResizeListenerId) {
            sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);
            this._sResizeListenerId = null;
        }
    };

    /*
     * adjusts arrows when keyboard is used for navigation and the beginning/end of the toolbar is reached
     */
    sap.ino.wall.ScrollableToolbar.prototype._onItemNavigationAfterFocus = function(oEvent) {
        var oHead = this.getDomRef("head"), oIndex = oEvent.getParameter("index"), $event = oEvent.getParameter('event');

        // handle only keyboard navigation here
        if ($event.keyCode === undefined) {
            return;
        }

        if (this.getOrientation() === "Horizontal") {
            this._iCurrentScrollLeft = oHead.scrollLeft;
        } else {
            this._iCurrentScrollTop = oHead.scrollTop;
        }
        this._checkOverflow(oHead, this.$());
        if (oIndex !== null && oIndex !== undefined) {
            this._scrollIntoView(this.getContent()[oIndex]);
        }
    };

    /**
     * return first visible item, which is needed for correct arrow calculation
     */
    sap.ino.wall.ScrollableToolbar.prototype._getFirstVisibleItem = function(aItems) {
        for (var i = 0; i < aItems.length; i++) {
            if (aItems[i].getVisible()) {
                return aItems[i];
            }
        }

        return null;
    };

    /**
     * afterRendering
     */

    sap.ino.wall.ScrollableToolbar.prototype.onAfterRendering = function() {
        var that = this, oHeadDomRef = this.getDomRef("head"), $bar = this.$(), aItems, aTabDomRefs;

        // initialize scrolling
        // we re-use the icon tab bar scrolling registration here
        if (this._oScroller) {
            this._oScroller.setIconTabBar(this, jQuery.proxy(this._afterIscroll, this), jQuery.proxy(this._scrollPreparation, this));
        }

        if (this._bDoScroll) {
            jQuery.sap.delayedCall(350, this, "_checkOverflow", [oHeadDomRef, $bar]);
        } else {
            this._checkOverflow(oHeadDomRef, $bar);
        }

        // reset scroll state after re-rendering for non-touch devices (iScroll will handle this internally)
        if (this.getOrientation() === "Horizontal") {
            if (this._iCurrentScrollLeft !== 0 && !this._bDoScroll) {
                // setTimeout needed here because the bar will only set a width when it detects that the content
                // is larger after this call
                setTimeout(function() {
                    oHeadDomRef.scrollLeft = that._iCurrentScrollLeft;
                }, 0);
            }
        } else {
            if (this._iCurrentScrollTop !== 0 && !this._bDoScroll) {
                // setTimeout needed here because the bar will only set a width when it detects that the content
                // is larger after this call
                setTimeout(function() {
                    oHeadDomRef.scrollTop = that._iCurrentScrollTop;
                }, 0);
            }
        }

        // use ItemNavigation for keyboardHandling
        aItems = this.getContent();
        aTabDomRefs = [];

        // find a collection of all tabs
        aItems.forEach(function(oItem) {
            var oItemDomRef = oItem.getFocusDomRef();
            jQuery(oItemDomRef).attr("tabindex", "-1");
            aTabDomRefs.push(oItemDomRef);
        });

        // Initialize the ItemNavigation
        if (!this._oItemNavigation) {
            this._oItemNavigation = new sap.ui.core.delegate.ItemNavigation();
            this._oItemNavigation.attachEvent(sap.ui.core.delegate.ItemNavigation.Events.AfterFocus, this._onItemNavigationAfterFocus, this);
            this.addDelegate(this._oItemNavigation);
        }

        // Reinitialize the ItemNavigation after rendering
        this._oItemNavigation.setRootDomRef(oHeadDomRef);
        this._oItemNavigation.setItemDomRefs(aTabDomRefs);

        // listen to resize
        this._sResizeListenerId = sap.ui.core.ResizeHandler.register(this.getDomRef(), jQuery.proxy(this._fnResize, this));
    };

    /**
     * Checks if scrolling is needed.
     * 
     * @private
     * @returns true if scrolling is needed, otherwise false
     */
    sap.ino.wall.ScrollableToolbar.prototype._checkScrolling = function(oHead, $bar) {
        var bScrolling = false, domScrollCont, domHead;

        if (this._bDoScroll) { // iScroll is used, therefore we need other calculation then in desktop mode
            domScrollCont = this.getDomRef("scrollContainer");
            domHead = this.getDomRef("head");
            if (this.getOrientation() === "Horizontal") {
                if (domHead.offsetWidth > domScrollCont.offsetWidth) {
                    bScrolling = true;
                }
            } else {
                if (domHead.offsetHeight > domScrollCont.offsetHeight) {
                    bScrolling = true;
                }
            }
        } else { // desktop mode
            // check if there are more tabs as displayed
            if (oHead) {
                if (this.getOrientation() === "Horizontal") {
                    if (oHead.scrollWidth > oHead.clientWidth) {
                        // scrolling possible
                        bScrolling = true;
                    }
                } else {
                    if (oHead.scrollHeight > oHead.clientHeight) {
                        // scrolling possible
                        bScrolling = true;
                    }
                }
            }
        }

        if (this._scrollable !== bScrolling) {
            $bar.toggleClass("sapInoWallScrollableToolbarScrollable", bScrolling);
            $bar.toggleClass("sapInoWallScrollableToolbarNotScrollable", !bScrolling);
            this._scrollable = bScrolling;
        }

        return bScrolling;
    };

    /**
     * Gets the icon of the requested arrow (left/right).
     * 
     * @private
     * @param sName
     *            left or right
     * @returns icon of the requested arrow
     */
    sap.ino.wall.ScrollableToolbar.prototype._getScrollingArrow = function(sName) {
        var mProperties = {
            src : "sap-icon://navigation-" + sName + "-arrow"
        }, sSuffix = this._bTextOnly ? "TextOnly" : "", sLeftArrowClass = "sapInoWallScrollableToolbarArrowScrollLeft" + sSuffix, sRightArrowClass = "sapInoWallScrollableToolbarArrowScrollRight" + sSuffix, aCssClassesToAddLeft = ["sapInoWallScrollableToolbarArrowScroll", sLeftArrowClass], aCssClassesToAddRight = ["sapInoWallScrollableToolbarArrowScroll", sRightArrowClass];

        if (sName === "left" || sName === "up") {
            if (!this._oArrowLeft) {
                this._oArrowLeft = sap.m.ImageHelper.getImageControl(this.getId() + "-arrowScrollLeft", this._oArrowLeft, this, mProperties, aCssClassesToAddLeft);
            }
            return this._oArrowLeft;
        }
        if (sName === "right" || sName === "down") {
            if (!this._oArrowRight) {
                this._oArrowRight = sap.m.ImageHelper.getImageControl(this.getId() + "-arrowScrollRight", this._oArrowRight, this, mProperties, aCssClassesToAddRight);
            }
            return this._oArrowRight;
        }
    };

    /**
     * Changes the state of the scroll arrows depending on whether they are required due to overflow.
     * 
     * @param oListDomRef
     *            the ul tag containing the items
     * @param of_back
     *            the backward scroll arrow
     * @param of_fw
     *            the forward scroll arrow
     * @private
     */
    sap.ino.wall.ScrollableToolbar.prototype._checkOverflow = function(oBarHead, $bar) {
        var bScrollBack, bScrollForward, domScrollCont, domHead, iScrollLeft, realWidth, availableWidth, iScrollTop, realHeight, availableHeight, $List;

        if (this._checkScrolling(oBarHead, $bar) && oBarHead) {
            // check whether scrolling to the left is possible
            bScrollBack = false;
            bScrollForward = false;

            if (this._bDoScroll) { // ScrollEnablement is used, therefore we need other calculation then in desktop
                // mode
                domScrollCont = this.getDomRef("scrollContainer");
                domHead = this.getDomRef("head");

                if (this.getOrientation() === "Horizontal") {
                    if (this._oScroller.getScrollLeft() > 0) {
                        bScrollBack = true;
                    }
                    if ((this._oScroller.getScrollLeft() + domScrollCont.offsetWidth) < domHead.offsetWidth) {
                        bScrollForward = true;
                    }
                } else {
                    if (this._oScroller.getScrollTop() > 0) {
                        bScrollBack = true;
                    }
                    if ((this._oScroller.getScrollTop() + domScrollCont.offsetHeight) < domHead.offsetHeight) {
                        bScrollForward = true;
                    }
                }

            } else { // desktop mode
                if (this.getOrientation() === "Horizontal") {
                    iScrollLeft = this._iCurrentScrollLeft;
                    realWidth = oBarHead.scrollWidth;
                    availableWidth = oBarHead.clientWidth;

                    if (Math.abs(realWidth - availableWidth) === 1) { // Avoid rounding issues see CSN 1316630 2013
                        realWidth = availableWidth;
                    }

                    if (!this._bRtl) { // normal LTR mode
                        if (iScrollLeft > 0) {
                            bScrollBack = true;
                        }
                        if ((realWidth > availableWidth) && (iScrollLeft + availableWidth < realWidth)) {
                            bScrollForward = true;
                        }
                    } else { // RTL mode
                        $List = jQuery(oBarHead);
                        if ($List.scrollLeftRTL() > 0) {
                            bScrollForward = true;
                        }
                        if ($List.scrollRightRTL() > 0) {
                            bScrollBack = true;
                        }
                    }
                } else {
                    iScrollTop = this._iCurrentScrollTop;
                    realHeight = oBarHead.scrollHeight;
                    availableHeight = oBarHead.clientHeight;

                    if (Math.abs(realHeight - availableHeight) === 1) { // Avoid rounding issues see CSN 1316630 2013
                        realHeight = availableHeight;
                    }

                    if (iScrollTop > 0) {
                        bScrollBack = true;
                    }
                    if ((realHeight > availableHeight) && (iScrollTop + availableHeight < realHeight)) {
                        bScrollForward = true;
                    }
                }
            }

            // only do DOM changes if the state changed to avoid periodic application of identical values
            if ((bScrollForward !== this._bPreviousScrollForward) || (bScrollBack !== this._bPreviousScrollBack)) {
                this._bPreviousScrollForward = bScrollForward;
                this._bPreviousScrollBack = bScrollBack;
                $bar.toggleClass("sapInoWallScrollableToolbarNoScrollBack", !bScrollBack);
                $bar.toggleClass("sapInoWallScrollableToolbarNoScrollForward", !bScrollForward);
            }
        } else {
            this._bPreviousScrollForward = false;
            this._bPreviousScrollBack = false;
        }
    };

    /**
     * Handles the activation of the tabs and arrows.
     * 
     * @private
     */
    sap.ino.wall.ScrollableToolbar.prototype._handleActivation = function(oEvent) {
        var sTargetId = oEvent.target.id, oControl = oEvent.srcControl, oChild, sId, iScrollLeft, iScrollTop, iContainerWidth, iContainerHeight, iHeadWidth, iHeadHeight;

        if (sTargetId) {
            sId = this.getId();

            // For items: do not navigate away! Stay on the page and handle the click in-place. Right-click + "Open in
            // new Tab" still works.
            // For scroll buttons: Prevent IE from firing beforeunload event -> see CSN 4378288 2012
            oEvent.preventDefault();

            // on mobile devices click on arrows has no effect
            if (sTargetId === sId + "-arrowScrollLeft" && this._bDeviceDesktop) {
                if (this._bDoScroll && sap.ui.Device.os.windows && sap.ui.Device.os.version === 8) {
                    // combi devices with windows 8 should also scroll on click on arrows
                    // need to use iscroll
                    if (this.getOrientation() === "Horizontal") {
                        iScrollLeft = this._oScroller.getScrollLeft() - this.getScrollStep();
                        if (iScrollLeft < 0) {
                            iScrollLeft = 0;
                        }
                    } else {
                        iScrollTop = this._oScroller.getScrollTop() - this.getScrollStep();
                        if (iScrollTop < 0) {
                            iScrollTop = 0;
                        }
                    }
                    // execute manual scrolling with iScroll's scrollTo method (delayedCall 0 is needed for positioning
                    // glitch)
                    this._scrollPreparation();
                    jQuery.sap.delayedCall(0, this._oScroller, "scrollTo", [iScrollLeft, 0, 500]);
                    jQuery.sap.delayedCall(500, this, "_afterIscroll");
                } else {
                    // scroll back/left button
                    this._scroll(-this.getScrollStep(), 500);
                }

            } else if (sTargetId === sId + "-arrowScrollRight" && this._bDeviceDesktop) {
                if (this._bDoScroll && sap.ui.Device.os.windows && sap.ui.Device.os.version === 8) {
                    // combi devices with windows 8 should also scroll on click on arrows
                    // need to use iscroll
                    if (this.getOrientation() === "Horizontal") {
                        iScrollLeft = this._oScroller.getScrollLeft() + this.getScrollStep();
                        iContainerWidth = this.$("scrollContainer").width();
                        iHeadWidth = this.$("head").width();
                        if (iScrollLeft > (iHeadWidth - iContainerWidth)) {
                            iScrollLeft = iHeadWidth - iContainerWidth;
                        }
                    } else {
                        iScrollTop = this._oScroller.getScrollTop() + this.getScrollStep();
                        iContainerHeight = this.$("scrollContainer").height();
                        iHeadHeight = this.$("head").height();
                        if (iScrollTop > (iHeadHeight - iContainerHeight)) {
                            iScrollTop = iHeadHeight - iContainerHeight;
                        }
                    }
                    // execute manual scrolling with iScroll's scrollTo method (delayedCall 0 is needed for positioning
                    // glitch)
                    this._scrollPreparation();
                    jQuery.sap.delayedCall(0, this._oScroller, "scrollTo", [iScrollLeft, 0, 500]);
                    jQuery.sap.delayedCall(500, this, "_afterIscroll");
                } else {
                    // scroll forward/right button
                    this._scroll(this.getScrollStep(), 500);
                }
            } else {
                // content item clicked, scroll into view if necessary
                if (!(oControl instanceof sap.ino.wall.ScrollableToolbar)) {
                    oChild = oControl;
                    // move up parent chain until we have the direct child of the toolbar
                    while (oChild && !(oChild.getParent() instanceof sap.ino.wall.ScrollableToolbar)) {
                        oChild = oChild.getParent();
                    }
                    if (oChild) {
                        this._scrollIntoView(oChild);
                    }
                }
            }
        }
    };

    /*
     * Scrolls to the item passed as parameter if it is not (fully) visible If the item is to the left of the viewport
     * it will be put leftmost. If the item is to the right of the viewport it will be put rightmost. @param
     * {sap.ui.core.Control} oItem The item to be scrolled into view @param {int} iDuration The duration of the
     * animation effect @private @return {sap.ino.wall.ScrollableToolbar} this pointer for chaining
     */
    sap.ino.wall.ScrollableToolbar.prototype._scrollIntoView = function(oItem, iDuration) {
        if (!this.getScrollIntoView()) {
            return this;
        }
        var $item = oItem.$(), $head, iHeadPaddingWidth, oHeadDomRef, iScrollLeft, iNewScrollLeft, iContainerWidth, iItemWidth, iItemPosLeft, iScrollTop, iNewScrollTop, iContainerHeight, iItemHeight, iItemPosTop;

        if ($item.length > 0) {
            if (this.getOrientation() === "Horizontal") {
                $head = this.$('head');
                iHeadPaddingWidth = $head.innerWidth() - $head.width();
                iItemWidth = $item.outerWidth(true);
                iItemPosLeft = $item.position().left - iHeadPaddingWidth / 2;

                // switch based on scrolling mode
                if (this._bDoScroll) { // ScrollEnablement
                    iScrollLeft = this._oScroller.getScrollLeft();
                    iContainerWidth = this.$("scrollContainer").width();
                    iNewScrollLeft = 0;

                    // check if item is outside of viewport
                    if (iItemPosLeft - iScrollLeft < 0 || iItemPosLeft - iScrollLeft > iContainerWidth - iItemWidth) {
                        if (iItemPosLeft - iScrollLeft < 0) { // left side: make this the first item
                            iNewScrollLeft += iItemPosLeft;
                        } else { // right side: make this the last item
                            iNewScrollLeft += iItemPosLeft + iItemWidth - iContainerWidth;
                        }

                        // execute manual scrolling with scrollTo method (delayedCall 0 is needed for positioning
                        // glitch)
                        this._scrollPreparation();
                        // store current scroll state to set it after rerendering
                        this._iCurrentScrollLeft = iNewScrollLeft;
                        jQuery.sap.delayedCall(0, this._oScroller, "scrollTo", [iNewScrollLeft, 0, iDuration]);
                        jQuery.sap.delayedCall(iDuration, this, "_afterIscroll");
                    }
                } else { // desktop scrolling with jQuery
                    oHeadDomRef = this.getDomRef("head");
                    iScrollLeft = oHeadDomRef.scrollLeft;
                    iContainerWidth = $item.parent().width();
                    iNewScrollLeft = iScrollLeft;

                    // check if item is outside of viewport
                    if (iItemPosLeft < 0 || iItemPosLeft > iContainerWidth - iItemWidth) {
                        if (iItemPosLeft < 0) { // left side: make this the first item
                            iNewScrollLeft += iItemPosLeft;
                        } else { // right side: make this the last item
                            iNewScrollLeft += iItemPosLeft + iItemWidth - iContainerWidth;
                        }

                        // execute scrolling
                        this._scrollPreparation();
                        // store current scroll state to set it after rerendering
                        this._iCurrentScrollLeft = iNewScrollLeft;
                        jQuery(oHeadDomRef).stop(true, true).animate({
                            scrollLeft : iNewScrollLeft
                        }, iDuration, jQuery.proxy(this._adjustAndShowArrow, this));
                    }
                }
            } else {
                iItemHeight = $item.outerHeight(true);
                iItemPosTop = $item.position().top;

                // switch based on scrolling mode
                if (this._bDoScroll) { // ScrollEnablement
                    iScrollTop = this._oScroller.getScrollTop();
                    iContainerHeight = this.$("scrollContainer").height();
                    iNewScrollTop = 0;

                    // check if item is outside of viewport
                    if (iItemPosTop - iScrollTop < 0 || iItemPosTop - iScrollTop > iContainerHeight - iItemHeight) {
                        if (iItemPosTop - iScrollTop < 0) { // left side: make this the first item
                            iNewScrollTop += iItemPosTop;
                        } else { // right side: make this the last item
                            iNewScrollTop += iItemPosTop + iItemHeight - iContainerHeight;
                        }

                        // execute manual scrolling with scrollTo method (delayedCall 0 is needed for positioning
                        // glitch)
                        this._scrollPreparation();
                        // store current scroll state to set it after rerendering
                        this._iCurrentScrollTop = iNewScrollTop;
                        jQuery.sap.delayedCall(0, this._oScroller, "scrollTo", [0, iNewScrollTop, iDuration]);
                        jQuery.sap.delayedCall(iDuration, this, "_afterIscroll");
                    }
                } else { // desktop scrolling with jQuery
                    oHeadDomRef = this.getDomRef("head");
                    iScrollTop = oHeadDomRef.scrollTop;
                    iContainerHeight = $item.parent().height();
                    iNewScrollTop = iScrollTop;

                    // check if item is outside of viewport
                    if (iItemPosTop < 0 || iItemPosTop > iContainerHeight - iItemHeight) {
                        if (iItemPosTop < 0) { // left side: make this the first item
                            iNewScrollTop += iItemPosTop;
                        } else { // right side: make this the last item
                            iNewScrollTop += iItemPosTop + iItemHeight - iContainerHeight;
                        }

                        // execute scrolling
                        this._scrollPreparation();
                        // store current scroll state to set it after rerendering
                        this._iCurrentScrollTop = iNewScrollTop;
                        jQuery(oHeadDomRef).stop(true, true).animate({
                            scrollTop : iNewScrollTop
                        }, iDuration, jQuery.proxy(this._adjustAndShowArrow, this));
                    }
                }
            }

        }

        return this;
    };

    /*
     * Scrolls the items if possible, using an animation.
     * 
     * @param iDelta how far to scroll @param iDuration how long to scroll (ms) @private
     */
    sap.ino.wall.ScrollableToolbar.prototype._scroll = function(iDelta, iDuration) {
        var oDomRef, iScrollLeft, iScrollTop, iScrollTarget;

        this._scrollPreparation();

        oDomRef = this.getDomRef("head");

        if (this.getOrientation() === "Horizontal") {
            iScrollLeft = oDomRef.scrollLeft;

            if (!!!sap.ui.Device.browser.internet_explorer && this._bRtl) {
                iDelta = -iDelta;
            } // RTL lives in the negative space
            iScrollTarget = iScrollLeft + iDelta;
            jQuery(oDomRef).stop(true, true).animate({
                scrollLeft : iScrollTarget
            }, iDuration, jQuery.proxy(this._adjustAndShowArrow, this));
            this._iCurrentScrollLeft = iScrollTarget;
        } else {
            iScrollTop = oDomRef.scrollTop;

            if (!!!sap.ui.Device.browser.internet_explorer && this._bRtl) {
                iDelta = -iDelta;
            } // RTL lives in the negative space
            iScrollTarget = iScrollTop + iDelta;
            jQuery(oDomRef).stop(true, true).animate({
                scrollTop : iScrollTarget
            }, iDuration, jQuery.proxy(this._adjustAndShowArrow, this));
            this._iCurrentScrollTop = iScrollTarget;
        }
    };

    /**
     * Adjusts the arrow position and shows the arrow.
     * 
     * @private
     */
    sap.ino.wall.ScrollableToolbar.prototype._adjustAndShowArrow = function() {
        if (this._$bar) {
            this._$bar.toggleClass("sapInoWallScrollableToolbarScroll", false);
        }
        this._$bar = null;
        // update the arrows on desktop
        if (this._bDeviceDesktop) {
            this._checkOverflow(this.getDomRef("head"), this.$());
        }
    };

    /**
     * Scroll preparation.
     * 
     * @private
     */
    sap.ino.wall.ScrollableToolbar.prototype._scrollPreparation = function() {
        if (!this._$bar) {
            this._$bar = this.$().toggleClass("sapInoWallScrollableToolbarScroll", true);
        }
    };

    /**
     * After iscroll.
     * 
     * @private
     */
    sap.ino.wall.ScrollableToolbar.prototype._afterIscroll = function() {
        var oHead = this.getDomRef("head");
        this._checkOverflow(oHead, this.$());
        this._adjustAndShowArrow();
    };

    /**
     * Resize handling.
     * 
     * @private
     */
    sap.ino.wall.ScrollableToolbar.prototype._fnResize = function() {
        var oHead = this.getDomRef("head");
        this._checkOverflow(oHead, this.$());
    };

    sap.ino.wall.ScrollableToolbar.prototype.applyFocusInfo = function(oFocusInfo) {
        // sets the focus depending on the used IconTabFilter
        if (oFocusInfo.focusDomRef) {
            jQuery(oFocusInfo.focusDomRef).focus();
        }
    };

    /* =========================================================== */
    /* begin: event handlers */
    /* =========================================================== */

    /**
     * Initializes scrolling on the IconTabHeader.
     * 
     * @param {jQuery.Event}
     *            oEvent
     * @private
     */
    sap.ino.wall.ScrollableToolbar.prototype.ontouchstart = function(oEvent) {
        if (oEvent.target != this._oArrowLeft.$()[0] && oEvent.target != this._oArrowRight.$()[0]) {
            return;
        }
        var oTargetTouch = oEvent.targetTouches[0];

        // store & init touch state
        this._iActiveTouch = oTargetTouch.identifier;
        this._iTouchStartPageX = oTargetTouch.pageX;
        this._iTouchDragX = 0;
        this._iTouchStartPageY = oTargetTouch.pageY;
        this._iTouchDragY = 0;
    };

    /**
     * Sets an internal flag if horizontal drag was executed.
     * 
     * @param {jQuery.Event}
     *            oEvent
     * @private
     */
    sap.ino.wall.ScrollableToolbar.prototype.ontouchmove = function(oEvent) {
        if (oEvent.target != this._oArrowLeft.$()[0] && oEvent.target != this._oArrowRight.$()[0]) {
            return;
        }
        var oTouch;

        if (!this._iActiveTouch) {
            return;
        }

        oTouch = sap.m.touch.find(oEvent.changedTouches, this._iActiveTouch);

        if (this.getOrientation() === "Horizontal") {
            // check for valid changes
            if (!oTouch || oTouch.pageX === this._iTouchStartPageX) {
                return;
            }

            // sum up movement to determine in touchend event if selection should be executed
            this._iTouchDragX += Math.abs(this._iTouchStartPageX - oTouch.pageX);
            this._iTouchStartPageX = oTouch.pageX;
        } else {
            // check for valid changes
            if (!oTouch || oTouch.pageY === this._iTouchStartPageY) {
                return;
            }

            // sum up movement to determine in touchend event if selection should be executed
            this._iTouchDragY += Math.abs(this._iTouchStartPageY - oTouch.pageY);
            this._iTouchStartPageY = oTouch.pageY;
        }
    };
    
    sap.ino.wall.ScrollableToolbar.prototype.validate = function() {
        var that = this;
        setTimeout(function() {
            var oHead = that.getDomRef("head");
            that._iCurrentScrollTop = oHead.scrollTop;
            that._iCurrentScrollLeft = oHead.scrollLeft;
            that._checkOverflow(oHead, that.$());
        }, 500 + 250);
    };

    /**
     * Handles touch end and events and trigger selection if bar was not dragged.
     * 
     * @param {jQuery.Event}
     *            oEvent
     * @private
     */
    sap.ino.wall.ScrollableToolbar.prototype.ontouchend = function(oEvent) {
        if (oEvent.target != this._oArrowLeft.$()[0] && oEvent.target != this._oArrowRight.$()[0]) {
            return;
        }
        // suppress selection if there was a drag (moved more than 20px)
        if (this.getOrientation() === "Horizontal") {
            if (this._iTouchDragX > 5 || oEvent.isMarked()) {
                return;
            }
        } else {
            if (this._iTouchDragY > 5 || oEvent.isMarked()) {
                return;
            }
        }
        // 
        this._handleActivation(oEvent);
    };

    /**
     * Handle the touch cancel event.
     * 
     * @param {jQuery.EventObject}
     *            oEvent The event object
     * @private
     */
    sap.ino.wall.ScrollableToolbar.prototype.ontouchcancel = sap.ino.wall.ScrollableToolbar.prototype.ontouchend;

    /**
     * Keyboard navigation event when the user presses Enter or Space.
     * 
     * @param {jQuery.Event}
     *            oEvent
     * @private
     */
    sap.ino.wall.ScrollableToolbar.prototype.onsapselect = function(oEvent) {
        this._handleActivation(oEvent);
    };

    /* =========================================================== */
    /* end: event handlers */
    /* =========================================================== */
})();