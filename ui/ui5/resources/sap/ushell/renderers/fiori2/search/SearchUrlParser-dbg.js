// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/* global $ */
/* eslint-disable quotes */
/* eslint-disable max-len */

sap.ui.define(['sap/ushell/renderers/fiori2/search/SearchHelper', 'sap/ushell/renderers/fiori2/search/SearchUrlParserInav2'], function (SearchHelper, SearchUrlParserInav2) {
    "use strict";

    var SearchUrlSerializer = function () {
        this.init.apply(this, arguments);
    };

    SearchUrlSerializer.prototype = {

        init: function (properties) {
            this.model = properties.model;
            this.urlParserInav2 = new SearchUrlParserInav2(properties);
        },

        parse: function () {

            // ignore url hash change which if no search application
            if (SearchHelper.getHashFromUrl().indexOf('#Action-search') !== 0) {
                return jQuery.when(undefined);
            }

            // check if hash differs from old hash. if not -> return
            if (!SearchHelper.hasher.hasChanged()) {
                return jQuery.when(undefined);
            }

            return this.model.initBusinessObjSearch().then(function () {

                //parse url parameters
                var oParametersLowerCased = SearchHelper.getUrlParameters();
                if ($.isEmptyObject(oParametersLowerCased)) {
                    return undefined;
                }

                if (oParametersLowerCased.datasource || oParametersLowerCased.searchterm) {
                    // old sina format
                    return this.urlParserInav2.parseUrlParameters(oParametersLowerCased);
                }
                // new sinaNext format
                return this.parseUrlParameters(oParametersLowerCased);


            }.bind(this)).then(function () {

                // update placeholder in case back button is clicked.
                this.model.setProperty("/searchTermPlaceholder", this.model.calculatePlaceholder());

                // calculate search button status
                this.model.calculateSearchButtonStatus();

                // fire query
                this.model._firePerspectiveQuery(true);

            }.bind(this));
        },

        parseUrlParameters: function (oParametersLowerCased) {

            // top
            if (oParametersLowerCased.top) {
                var top = parseInt(oParametersLowerCased.top, 10);
                this.model.setTop(top, false);
            }

            // order by
            if (oParametersLowerCased.orderby && oParametersLowerCased.sortorder) {
                var orderBy = {
                    orderBy: decodeURIComponent(oParametersLowerCased.orderby),
                    sortOrder: oParametersLowerCased.sortorder
                };
                this.model.setOrderBy(orderBy, false);
            } else {
                this.model.resetOrderBy(false);
            }

            // filter conditions
            var filter;
            if (oParametersLowerCased.filter) {
                var filterJson = JSON.parse(oParametersLowerCased.filter);
                try {
                    filter = this.model.sinaNext.parseFilterFromJson(filterJson);
                } catch (e) {
                    // fallback to a save filter + send error message
                    filter = this.model.sinaNext.createFilter();
                    if (filterJson.searchTerm) {
                        filter.setSearchTerm(filterJson.searchTerm);
                    }
                    sap.m.MessageBox.show(sap.ushell.resources.i18n.getText('searchUrlParsingErrorLong') + '\n(' + e.toString() + ')', {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: sap.ushell.resources.i18n.getText('searchUrlParsingError'),
                        actions: [sap.m.MessageBox.Action.OK]
                    });
                }
                this.model.setProperty("/uiFilter", filter);
                this.model.setDataSource(filter.dataSource, false, false); // explicitely updata datasource (for categories: update ds list in model)
            }

        },

        render: function () {
            return this.renderFromParameters(this.model.getTop(), this.model.getProperty('/uiFilter'), true, this.model.getOrderBy());
        },

        renderFromParameters: function (top, filter, encodeFilter, orderBy) {

            //  use encodeURIComponent and not encodeURI because:
            // >= in filter condition needs to be
            // encoded. If = ist not encoded the url parameter parser will use = as delimiter for
            // a parameter=value pair

            // prefix
            var sHash = "#Action-search";

            // top
            sHash += "&/top=" + top;

            // order by
            if (orderBy && Object.keys(orderBy).length > 0) {
                if (orderBy.orderBy) {
                    sHash += "&orderby=" + encodeURIComponent(orderBy.orderBy);
                }
                if (orderBy.sortOrder) {
                    sHash += "&sortorder=" + orderBy.sortOrder; // ASC | DESC
                }
            }

            // filter conditions/searchTerm
            if (encodeFilter) {
                sHash += "&filter=" + encodeURIComponent(JSON.stringify(filter.toJson()));
            } else {
                sHash += "&filter=" + JSON.stringify(filter.toJson());
            }

            return sHash;
        }

    };

    return SearchUrlSerializer;

});
