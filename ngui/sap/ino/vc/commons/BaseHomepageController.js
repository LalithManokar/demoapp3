/*!
 * @copyright@
 */
 /* global _:true */
sap.ui.define([
    "./BaseController",
    "sap/ui/core/ResizeHandler",
    "sap/ui/core/mvc/ViewType",
    "sap/ui/model/json/JSONModel",
    "sap/ino/vc/commons/mixins/GlobalSearchMixin",
    "sap/ino/commons/application/Configuration"
], function(BaseController, ResizeHandler, ViewType, JSONMODEL, GlobalSearchMixin, Configuration) {

	/**
	 * Base Controller to use for a responsive homepage design with different layouts.
	 * Supports different subviews to be displayed.
	 *
	 */

	return BaseController.extend("sap.ino.vc.commons.BaseHomepageController", jQuery.extend({}, GlobalSearchMixin, {

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
			this._sResizeRegId = ResizeHandler.register(this.getView(), this._onResize);
		},

		onExit: function() {
			if (this._sResizeRegId) {
				ResizeHandler.deregister(this._sResizeRegId);
			}
		},

		// this function is only called if the extending controller implements the top level page facet
		onRouteMatched: function(oEvent) {
		    var that = this;
			var oArgs = oEvent.getParameter("arguments");
			var iId = parseInt(oArgs.id, 10);
			this.openDisplayViewonRouteMatched(iId);
		},

		// this function is only called if the extending controller implements the top level page facet
		onBeforeHide: function() {
			if (this.getCurrentRoute() !== "wall") {
				this._bFullscreenReset = true;
				this.setFullScreen(this._bPreviouslyFullscreen);
			}
		},

		onAfterShow: function() {
			this.initFullScreen();
			var oCurrentView = this.getCurrentView();
			if (oCurrentView && oCurrentView.getController()) {
				var oCurrentController = oCurrentView.getController();

				if (typeof oCurrentController.onAfterShow === "function") {
					oCurrentController.onAfterShow();
				}
			}
		},

		getDisplayView: function() {
			// needs to be overwritten
			jQuery.sap.assert(false, "getDisplayView of sap.ino.vc.commons.BaseHomepageController must not be called");
		},

		_initDisplayView: function(oEvent) {
			this._onResize({
				control: this.getView(),
				size: {
					width: this.getView().$().width()
				}
			});
		},
		
		openDisplayView: function(iId) {
			var sDisplayView = this.getDisplayView(iId);
			this.setCurrentView(sDisplayView);
		},

		openDisplayViewonRouteMatched: function(iId) {
			var sDisplayView;
			var that = this;
			
			var fnInit = function() {
				if (typeof that.onBeforeDisplayViewShow === "function") {
					that.onBeforeDisplayViewShow();
				}
				var oView = that.getCurrentView();
				if (typeof oView.getController().show === "function") {
					oView.getController().show(that.getView());
				}
			};

			if (iId) {
			    var sPath = "/CampaignPrivilege(" + iId + ")";
			    this.getModel("data").read(sPath, {
					async: true,
					success: function(oData) {
						that.getModel("component").setProperty("/REGISTRABLE", oData.REGISTRATION_PRIVILEGE ? true : false);
						that.getModel("component").setProperty("/COMMUNITY", oData.COMMUNITY_PRIVILEGE ? true : false);
						sDisplayView = that.getDisplayView(iId);
				        that.setCurrentView(sDisplayView);
				        that.bindDefaultODataModel(iId, fnInit);
					},
					error: function() {
					    that.getModel("component").setProperty("/REGISTRABLE", false);
						that.getModel("component").setProperty("/COMMUNITY", true);
						sDisplayView = that.getDisplayView(iId);
				        that.setCurrentView(sDisplayView);
				        that.bindDefaultODataModel(iId, fnInit);
					}
				});	
			} else {
			  sDisplayView = this.getDisplayView(iId);
			  this.setCurrentView(sDisplayView); 
			  this.bindDefaultODataModel(iId, fnInit);
			}
		},

		initFullScreen: function() {
			// only read previous setting if we already restored it
			// routing from campaign homepage to campaign homepage would not restore, as view is not hidden
			if (this._bFullscreenReset === undefined || this._bFullscreenReset === true) {
				this._bPreviouslyFullscreen = this.getFullScreen();
			}
			this.setFullScreen(true);
			this._bFullscreenReset = false;
		},

		getCurrentView: function() {
			var aContent = this.getView().getContent();
			var oPage = (aContent && aContent.length > 0) ? aContent[0] : undefined;
			if (oPage) {
				if (oPage.getContent().length > 0) {
					return oPage.getContent()[0];
				}
			}
			return undefined;
		},

		getCurrentController: function() {
			var oView = this.getCurrentView();
			return oView ? oView.getController() : undefined;
		},

		setCurrentView: function(sViewName) {
			var aContent = this.getView().getContent();
			//var that = this;
			var oPage = (aContent && aContent.length > 0) ? aContent[0] : undefined;
			if (oPage) {
				var oCurrentView = this.getCurrentView();
				var oView = this._mViews ? this._mViews[sViewName] : undefined;
				if (oView) {
					oPage.removeContent(oCurrentView);
					oPage.addContent(oView);
				} else {
					if (!oCurrentView) {
						oView = this.createView({
							type: ViewType.XML,
							viewName: sViewName
						});
						oView.attachAfterRendering(this._initDisplayView, this);
						oPage.addContent(oView);
					} else if (oCurrentView && oCurrentView.getViewName() !== sViewName) {
						// oCurrentView.detachAfterRendering(this._initDisplayView, this);
						oView = this.createView({
							type: ViewType.XML,
							viewName: sViewName
						});
						oView.attachAfterRendering(this._initDisplayView, this);
						oPage.removeContent(oCurrentView);
						oPage.addContent(oView);
					}
					this._mViews = this._mViews ? this._mViews : {};
					this._mViews[sViewName] = oView;
				}
			}
		},

		switchView: function() {
			var bShowBackoffice = this.getModel("component").getProperty("/SHOW_BACKOFFICE");
			var iId = this.iCampaignId ? this.iCampaignId : null;
			bShowBackoffice = !bShowBackoffice;
			this.getModel("component").setProperty("/SHOW_BACKOFFICE", bShowBackoffice);
			var selectedCategory = this.getModel('search').getProperty('/selectedCategory');
            if(!bShowBackoffice){
             this._removeCategory('campaign-idealistbycompany');
             this._removeCategory('idealistbycompany');
            this.getModel('search').setProperty('/selectedCategory', selectedCategory);
            }else{
                this._addCategory({
            			key: 'idealistbycompany',
            			value: Configuration.getGroupConfiguration().DISPLAY_LABEL
            		});
                this.getModel('search').setProperty('/selectedCategory', selectedCategory);
            }
			this.openDisplayView(iId);

			var oCurrentView = this.getCurrentView();
			var oCurrentController = oCurrentView.getController();

			if (typeof oCurrentController.show === "function") {
				oCurrentController.show(this.getView());
			}

			oCurrentController.setViewFocus();
		},

		setViewFocus: function() {
			if (this.getCurrentController()) {
				this.getCurrentController().setViewFocus();
			}
		},

		updateLayout: function(sLayout) {
			var bUpdated = false;
			if (this.getCurrentController()) {
				var mLayout = this.getCurrentController().getLayout(sLayout);

				for (var sContainer in mLayout) {
					if (mLayout.hasOwnProperty(sContainer)) {
						var sControl = mLayout[sContainer];
						var oContainer = this.getCurrentView().byId(sContainer);
						if (oContainer) {
							var oControl = this.getCurrentView().byId(sControl);
							if (oControl) {
								oControl.removeStyleClass("sapInoInvisible");

								if (oContainer.indexOfItem(oControl) === -1) {
									oContainer.addItem(oControl);
								}
							} else {
								var aItems = oContainer.getItems();
								// we only support one item per container
								var oItem = aItems.length > 0 ? aItems[0] : undefined;
								if (oItem) {
									oItem.addStyleClass("sapInoInvisible");
								}
							}
							bUpdated = true;
						}
					}
				}
			}
			return bUpdated;
		},

		_onResize: function(oEvent) {
			var oView = oEvent.control;
			var that = oView.getController();
			var oCurrentController = that.getCurrentController();
			var sLayoutPrefix = (typeof that.getLayoutPrefix === "function" && that.getLayoutPrefix()) ? that.getLayoutPrefix() : undefined;
			var iWidth = oEvent.size.width;
			var sNewLayout;
			var iOldWidth = oEvent.oldsize ? oEvent.oldsize.width : -1;

			if (iWidth !== iOldWidth) {

				if (iWidth < 800) {
					sNewLayout = "XS";
				} else if (iWidth < 1100) {
					sNewLayout = "S";
				} else if (iWidth < 1350) {
					sNewLayout = "M";
				} else if (iWidth < 1700) {
					sNewLayout = "L";
				} else {
					sNewLayout = "XL";
				}

				if (oCurrentController && (!oCurrentController._sCurrentLayout || oCurrentController._sCurrentLayout !== sNewLayout)) {
					if (sLayoutPrefix) {
						oView.removeStyleClass(sLayoutPrefix + "XS");
						oView.removeStyleClass(sLayoutPrefix + "S");
						oView.removeStyleClass(sLayoutPrefix + "M");
						oView.removeStyleClass(sLayoutPrefix + "L");
						oView.removeStyleClass(sLayoutPrefix + "XL");

						oView.addStyleClass(sLayoutPrefix + sNewLayout);
					}

					oView.removeStyleClass("sapInoBaseHomepageXS");
					oView.removeStyleClass("sapInoBaseHomepageS");
					oView.removeStyleClass("sapInoBaseHomepageM");
					oView.removeStyleClass("sapInoBaseHomepageL");
					oView.removeStyleClass("sapInoBaseHomepageXL");

					oView.addStyleClass("sapInoBaseHomepage" + sNewLayout);

					if (that.updateLayout(sNewLayout)) {
						var sOldLayout = oCurrentController._sCurrentLayout;
						oCurrentController._sCurrentLayout = sNewLayout;
						// if "listener" is existing, call it
						if (typeof oCurrentController.onResizeLayoutChange === "function") {
							oCurrentController.onResizeLayoutChange(sOldLayout, sNewLayout);
						}

					}
				}
			}
		},

		/**
		 * @overrides BaseController.setObjectExists
		 */
        setObjectExists : function(bObjectExists) {
            // due to view nesting we have to set the flag into the view model of the current view
            var oController = this.getCurrentController();
            if (oController) {
                oController.setViewProperty("/objectExists", bObjectExists);
            }
        },

		/**
		 * @overrides BaseController.getObjectExists
		 */
        getObjectExists : function(bObjectExists) {
            var oController = this.getCurrentController();
            if (oController) {
                return oController.getViewProperty("/objectExists");
            } else {
                return undefined;
            }
        },
        
		/**
		 * Binds view to object instance of oData model
		 * Afterwards you can bind on the view with the named model "data"
		 * @param iId : Integer
		 * @param fnCallback : function
		 */
		bindDefaultODataModel: function(iId, fnCallback) {
			var that = this;

			var sEntitySet = (typeof this.getODataEntitySet === "function") ? this.getODataEntitySet() : undefined;
			if (sEntitySet && iId > 0) {
				this.getView().bindElement({
					path: "data>/" + sEntitySet + "(" + iId + ")",
					events: {
						dataRequested: function() {
							jQuery.each(that.getBusyControls(), function(iIdx, oControl) {
								if (jQuery.type(oControl.setBusy) === "function") {
									oControl.setBusy(true);
								}
							});
						},
						dataReceived: function(oEvent) {
							jQuery.each(that.getBusyControls(), function(iIdx, oControl) {
								if (jQuery.type(oControl.setBusy) === "function") {
									oControl.setBusy(false);
								}
							});

                            if (oEvent.getParameter("data") === undefined) {
                                // error happened when reading the object
                                that.setObjectExists(false);
                            } else {
                                that.setObjectExists(true);
                            }

							if (typeof fnCallback === "function") {
								fnCallback.apply(that);
							}
						},
						change: function() {
						    // "dataReceived" might be called too late for not found objects
						    // So we it whether an object exists by checking if the model has data
						    // with the given path
						    var bObjectExists = this.getModel().getProperty(this.getPath()) !== undefined;
						    that.setObjectExists(bObjectExists);
						}
					}
				});

				// if no request is needed, immediately trigger the callback
				if (typeof fnCallback === "function") {
					var oContext = this.getView().getBindingContext("data");
					if (oContext && oContext.getPath() === ("/" + sEntitySet + "(" + iId + ")")) {
						fnCallback.apply(that);
					}
				}

				return true;
			}

			if (typeof fnCallback === "function") {
				fnCallback.apply(that);
			}

			return false;
		}
	}));
});