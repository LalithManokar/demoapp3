/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");

jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.controls.Repeater");
jQuery.sap.require("sap.ui.ino.controls.Tag");
jQuery.sap.require("sap.ui.ino.controls.TextView");

jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.models.object.Campaign");

var ObjectType = {
    Campaign : "campaign",
    User : "user",
    Group : "group"
};

sap.ui.jsview("sap.ui.ino.views.backoffice.SearchResults", {

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.SearchResults";
    },
    
    getHistoryPath : function () {
        if ( this.getViewData() !== undefined && this.getViewData().historyPath !== undefined )
        {
            return this.getViewData().historyPath;
        }
        return "search";
    },

    setHistoryState : function(oHistoryState) {
        this.getController().setHistoryState(oHistoryState);
    },

    
    createContent : function(oController) {
        var oTextBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
        
        var oSearchFieldLayout = new sap.ui.commons.layout.HorizontalLayout("SearchFieldLayout", {
            content : [new sap.ui.ino.controls.TextView({
                text : oTextBundle.getText("BO_SEARCH_TXT_SEARCH"),
                design : sap.ui.commons.TextViewDesign.H2,
                wrapping : true
            }), new sap.ui.core.HTML({
                content : "<div>&nbsp;&nbsp;&nbsp;</div>",
                sanitizeContent : true
            })]
        });
        
        this.oSearchField = new sap.ui.commons.SearchField("searchField", {
            enableListSuggest : false,
            enableFilterMode : true,
            enableClear: true,
            value : "{filter>/searchTerm}",
            search : [oController.onSearch, oController]
        });

        oSearchFieldLayout.addContent(this.oSearchField);
        
        this.oSearchResultsLayout = new sap.ui.layout.VerticalLayout("SearchResultsLayout", {
            content: [oSearchFieldLayout],
            width: "99%"
        }).addStyleClass("sapUiInoBackofficeVisibleOverflow");
        
        this.oSearchResultsLayout.addContent(new sap.ui.commons.HorizontalDivider({
            height : sap.ui.commons.HorizontalDividerHeight.Large
        }).addStyleClass("sapUiCommonsHoriDivNoStroke"));
        
        this.oNavigationItem = {};
        this.oNavigationItem[ObjectType.Campaign] = new sap.ui.ux3.NavigationItem({
            key : ObjectType.Campaign,
            text : oTextBundle.getText("BO_SEARCH_TXT_CAMPAIGN", ["?"])
        });
        this.oNavigationItem[ObjectType.User] = new sap.ui.ux3.NavigationItem({
            key : ObjectType.User,
            text : oTextBundle.getText("BO_SEARCH_TXT_USER", ["?"])
        });
        this.oNavigationItem[ObjectType.Group] = new sap.ui.ux3.NavigationItem({
            key : ObjectType.Group,
            text : oTextBundle.getText("BO_SEARCH_TXT_GROUP", ["?"])
        });
        
        this.oNavigatorBar = new sap.ui.ux3.NavigationBar({
            items:[
                this.oNavigationItem[ObjectType.Campaign],
                this.oNavigationItem[ObjectType.User],
                this.oNavigationItem[ObjectType.Group]
            ],
            select : [oController.onSwitchView, oController],
            selectedItem : this.oNavigationItem[ObjectType.Campaign]
        });
        
        this.oSearchResultsLayout.addContent(this.oNavigatorBar);
                
        this.createLayouts();
        this.createTemplates(oTextBundle);

        this.oSearchResultsLayout.addContent(this.oResultLayout[ObjectType.Campaign]);
        this.oSearchResultsLayout.addContent(this.oResultLayout[ObjectType.User]);
        this.oSearchResultsLayout.addContent(this.oResultLayout[ObjectType.Group]);
        
        // This is important to take the full height of the shell content
        this.setHeight("100%");
        // this avoids scrollbars for 100% height
        this.setDisplayBlock(true);
        
        this.setWidth("100%");
        return this.oSearchResultsLayout;
    },
    
    createLayouts : function() {
    	this.oFilterPanel = {};
        this.oTagRepeater = {};
        this.oTagTemplate = {};
        this.oRowRepeater = {};
        this.oResultLayout = {};
        this.oResultLayout[ObjectType.Campaign] = this.createTagObjectLayout(ObjectType.Campaign);
        this.oResultLayout[ObjectType.User] = this.createObjectLayout(ObjectType.User);
        this.oResultLayout[ObjectType.Group] = this.createObjectLayout(ObjectType.Group);
    },

    createTagObjectLayout : function(sType) {
        var oView = this;
        var oTextBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
        
        // create a MatrixLayout with defined rows and cells
        var oTagLayout = new sap.ui.commons.layout.MatrixLayout({
            id : "matrix" + sType,
            layoutFixed : false,
            columns : 3,
            width : "101%",
            widths : ["70%", "5%", "25%"] });

        var oRowContent = new sap.ui.commons.layout.MatrixLayoutRow({
            id : "rowContent_" + sType });

        oTagLayout.addRow(oRowContent);

        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            id : "cellRowRepeater" + sType,
            colSpan : 1 
        });

        this.oRowRepeater[sType] = new sap.ui.commons.RowRepeater({
            id : "RowRepeater_" + sType,
            design : sap.ui.commons.RowRepeaterDesign.Transparent,
            numberOfRows: 4
        });
        
        this.oRowRepeater[sType].setNoData(
            new sap.ui.commons.TextView({
                text: "{i18n>BO_SEARCH_MSG_NODATA}"
            })
        );

        oCell.addContent(this.oRowRepeater[sType]);
        oRowContent.addCell(oCell);

        oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        });
        
        oRowContent.addCell(oCell);
        
        oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            vAlign : sap.ui.commons.layout.VAlign.Top
        });
        
        //
        // Filter Panel
        //
        var oTagFilterContent = new sap.ui.ino.controls.Repeater({
            id : this.createId("filtercontent_" + sType)
        });

        this.oFilterPanel[sType] = new sap.ui.commons.Panel({
            id : this.createId("filterpanel_" + sType),
            title : new sap.ui.commons.Title({
                text: "{i18n>BO_SEARCH_GRP_FILTERS}"
            }),
            visible : {
                path : "filter>/filters/" + sType + "/0",
                formatter : function(oFilter) {
                    if(oFilter) {
                        return true;
                    }
                    return false;
                }
            },
            content : oTagFilterContent,
            showCollapseIcon : false,
            areaDesign : sap.ui.commons.enums.AreaDesign.Plain,
            borderDesign : sap.ui.commons.enums.BorderDesign.None
        });

        oCell.addContent(this.oFilterPanel[sType]);

        var oTagFilterTemplate = new sap.ui.commons.layout.HorizontalLayout({
            content : [new sap.ui.ino.controls.TextView({
                text : "{filter>TAG_NAME}"
            }), new sap.ui.commons.Button({
                icon : sap.ui.ino.controls.ThemeFactory.getImage("remove.png"),
                lite : true,
                customData : [new sap.ui.core.CustomData({
                    key : "id",
                    value : "{filter>TAG}"
                })],
                tooltip : "{i18n>BO_SEARCH_REMOVE_TAG_FILTER}",
                press : function(oEvent) {
                    var oButton = oEvent.getSource();
                    var iTagId = oButton.getCustomData()[0].getValue();
                    oView.getController().removeFilter(sType, [{
                        "TAG" : iTagId
                    }]);
                    var oFilterPanel = oView.byId("filterpanel_" + sType);
                    
                    var sFocus = "filterpanel_" + sType;
                    if (!oFilterPanel.getVisible()) {
                        sFocus = "tagpanel_" + sType;
                    }
                    
                    jQuery.sap.byId(oView.createId(sFocus)).focus();
                }
            })]
        });

        oTagFilterContent.bindRows("filter>/filters/" + sType, oTagFilterTemplate);

        //
        // Tag Cloud
        // 
        
        this.oTagRepeater[sType] = new sap.ui.ino.controls.Repeater({
            waitingText : "{i18n>BO_COMMON_MSG_LOADING_TAGS}",
            showMoreSteps : 100,
            noData : new sap.ui.ino.controls.TextView({
                text : "{i18n>BO_SEARCH_MSG_NO_TAGS}"
            }),
            floatHorizontal : true,
            sortFunction : function(a, b) {
                return a.getText() > b.getText() ? 1 : -1;
            }
        });

        this.oTagTemplate[sType] = new sap.ui.ino.controls.Tag({
            text : "{NAME}",
            rank : "{RANK}",
            tagId : "{ID}",
            tooltip : {
                path : "NAME",
                formatter : function(sName) {
                    if (sName) {
                        return oTextBundle.getText("BO_SEARCH_EXP_TAG_TOOLTIP", [sName]);
                    }
                    else {
                        return undefined;
                    }
                }
            },
            readonly : {
                path : "filter>/",
                formatter : function() {
                    var that = this;
                    return jQuery.grep(oView.getController().getFilters(sType), function(e) {
                        return e.TAG === that.getTagId();
                    }).length > 0;
                }
            },
            action : function(iTagId) {
                var oTagLink = this;
                oView.getController().addFilter(sType, [{
                    "TAG" : iTagId,
                    "TAG_NAME" : oTagLink.getText()
                }]);
                jQuery.sap.byId(oView.createId("tagpanel_" + sType)).focus();
            },
            describedBy : this.createId("tagpanel_" + sType + "-title")
        });

        var oTagPanel = new sap.ui.commons.Panel(this.createId("tagpanel_" + sType), {
            title : new sap.ui.commons.Title({
                text: "{i18n>BO_SEARCH_GRP_TAGS}"
            }),
            content : this.oTagRepeater[sType],
            showCollapseIcon : false,
            areaDesign : sap.ui.commons.enums.AreaDesign.Plain,
            borderDesign : sap.ui.commons.enums.BorderDesign.None
        }).addStyleClass("sapUiInoBackofficeTagCloud");
        
        oCell.addContent(oTagPanel);
        oRowContent.addCell(oCell);
        
        return oTagLayout;
    },

    createObjectLayout : function(sType){
    	this.oRowRepeater[sType] = new sap.ui.commons.RowRepeater({
            id : "RowRepeater_" + sType,
            design : sap.ui.commons.RowRepeaterDesign.Transparent,
            visible : false
        });
        
        this.oRowRepeater[sType].setNoData(
            new sap.ui.commons.TextView({
                text: "{i18n>BO_SEARCH_MSG_NODATA}"
            })
        );
        return this.oRowRepeater[sType];
    },
    
    createTemplates : function(oTextBundle) {
    	this.oTemplate = {};
        this.oTemplate[ObjectType.Campaign] = this.createCampaignTemplate(oTextBundle);
        this.oTemplate[ObjectType.User] = this.createUserTemplate();
        this.oTemplate[ObjectType.Group] = this.createGroupTemplate();
    },

    createCampaignTemplate : function(oTextBundle) {
        // create the template control that will be repeated and will display
        // the data
        var oCampaignTemplate = new sap.ui.commons.layout.MatrixLayout({
            width : "70%"
        });

        var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
        var oCell = new sap.ui.commons.layout.MatrixLayoutCell();

        var oName = new sap.ui.commons.Link({
            text : "{NAME}",
            press : function(oControlEvent) {
                var oRowBindingContext = oControlEvent.getSource().getBindingContext();
                var iId = oRowBindingContext.getProperty("ID");

                sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignInstance").show(
                        iId, "display");
            }
        });
        oName.addStyleClass("sapUiInoBackofficeNavigationLink");

        var oToggleClipboardButton = sap.ui.ino.application.backoffice.ControlFactory.createClipboardToggleButton(sap.ui.ino.models.object.Campaign, "ID", undefined);
        oToggleClipboardButton.addStyleClass("sapUiInoBackofficeSmallButton");

        var oHorizontalLayout = new sap.ui.layout.HorizontalLayout({
            content : [oName, oToggleClipboardButton]
        });
        
        oCell.addContent(oHorizontalLayout);
        oRow.addCell(oCell);
        oCampaignTemplate.addRow(oRow);

        oRow = new sap.ui.commons.layout.MatrixLayoutRow();
        oCell = new sap.ui.commons.layout.MatrixLayoutCell(); 

        var oSubmitter = new sap.ui.ino.controls.TextView({
            text : {
                parts : ["STATUS_CODE", {
                    path : "VALID_FROM",
                    type : new sap.ui.model.type.Date({
                        style : "medium"
                    })
                }, {
                    path : "VALID_TO",
                    type : new sap.ui.model.type.Date({
                        style : "medium"
                    })
                }],
                formatter : function(sStatus, sValidFrom, sValidTo) {
                    var fnStatusFormatter = sap.ui.ino.models.core.CodeModel
                            .getFormatter("sap.ino.xs.object.status.Status.Root");
                    return oTextBundle.getText("BO_SEARCH_TXT_CAMPAIGN_STATUS",
                            [fnStatusFormatter(sStatus), sValidFrom, sValidTo]);
                }
            },
            design : sap.ui.commons.TextViewDesign.Bold,
            wrapping : true
        });

        oCell.addContent(oSubmitter);
        oRow.addCell(oCell);
        oCampaignTemplate.addRow(oRow);

        oRow = new sap.ui.commons.layout.MatrixLayoutRow();
        oCell = new sap.ui.commons.layout.MatrixLayoutCell();

        var oDescription = new sap.ui.core.HTML({
            content : {
                path : "DESCRIPTION",
                formatter : function(sDescription) {
                    if (sDescription) {
                        // content is expected to be wrapped by proper HTML
                        // we ensure this by adding the divs around it
                        return "<div style='word-wrap: break-word;'>" + sDescription + "</div>";
                    }
                }
            },
            sanitizeContent : true
        });

        oCell.addContent(oDescription);
        oRow.addCell(oCell);
        oCampaignTemplate.addRow(oRow);
        
        return oCampaignTemplate;
    },

    createUserTemplate : function() {
        return sap.ui.ino.application.backoffice.ControlFactory.createIdentityTemplate(undefined, "ID", false, false, false, undefined);
    },
    
    createGroupTemplate : function() {    
        return sap.ui.ino.application.backoffice.ControlFactory.createIdentityTemplate();
    }
});