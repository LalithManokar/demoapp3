/*
  Example calls:
  select default number of tags
  http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/tagcloud_campaigns.xsjs

  selection restricted to all campaigns with TAG 2 AND 5
  http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/tagcloud_campaigns.xsjs?TAG=2&TAG=5

  debug
  http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/tagcloud_campaigns.xsjs/trace
 */

const hReadService = $.import("sap.ino.xs.xslib", "hReadService"); 

var configuration = {};

    configuration[$.net.http.GET] = {
            procedureName: "sap.ino.db.blog.ext::p_ext_blog_tag_cloud_by_group",
            inputParameterMap:  {
                SEARCHTERM: { scalarName: "IV_SEARCHTERM", defaultValue: "" },
                FILTERNAME: { scalarName: "IV_FILTERNAME", defaultValue: "" },
                CAMPAIGN:   { scalarName: "IV_CAMPAIGN",   defaultValue: -1 },
                TAG:        { scalarName: "IV_TAG_STR",    defaultValue: "" },
                EXCL_STATUS:{ scalarName: "IV_EXCL_STATUS_STR",defaultValue: "" }
            },
            outputParameterMap: {
                WITHOUT_GROUP: { scalarName: "OV_WITHOUT_TAGGROUP", defaultValue: ""},
                RANKED_TAG:    { tableName: "OT_RANKED_TAG" }
            }
        };


hReadService.process(configuration, $.request, $.response);
