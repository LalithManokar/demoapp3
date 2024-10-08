/*!
 * @copyright@
 */
(function() {
    jQuery.sap.declare("sap.ui.ino.controls.library");
    jQuery.sap.require("sap.ui.core.Core");

    // library dependencies 
    jQuery.sap.require("sap.ui.core.library");

    // delegate further initialization of this library to the Core   
    sap.ui.getCore().initLibrary({
        name : "sap.ui.ino.controls",
        dependencies : [ "sap.ui.core" ],
        types : [], 
        interfaces : [],
        controls : [ "sap.ui.ino.controls.Attachment",
                     "sap.ui.ino.controls.AttachmentControl",
                     "sap.ui.ino.controls.AutoComplete",
                     "sap.ui.ino.controls.BackofficeShell",
                     "sap.ui.ino.controls.BackofficeShellHeader",
                     "sap.ui.ino.controls.BusyIndicator",
                     "sap.ui.ino.controls.CampaignTile",
                     "sap.ui.ino.controls.Comment",
                     "sap.ui.ino.controls.ContentPane", 
                     "sap.ui.ino.controls.Dialog",
                     "sap.ui.ino.controls.Evaluation",
                     "sap.ui.ino.controls.EvaluationCollapsibleSectionCriteria",
                     "sap.ui.ino.controls.EvaluationCriterionValue",
                     "sap.ui.ino.controls.EvaluationCriterionValueLine",
                     "sap.ui.ino.controls.EvaluationMatrix",
                     "sap.ui.ino.controls.ExpertGraph",
                     "sap.ui.ino.controls.FileUploader",
                     "sap.ui.ino.controls.IdeaCard",
                     "sap.ui.ino.controls.IdentityCard",
                     "sap.ui.ino.controls.IFrame",
                     "sap.ui.ino.controls.LightBox",
                     "sap.ui.ino.controls.LikeButton",
                     "sap.ui.ino.controls.LikeDislike",
                     "sap.ui.ino.controls.MessageBox",
                     "sap.ui.ino.controls.MessageLog",
                     "sap.ui.ino.controls.OverlayContainer",
                     "sap.ui.ino.controls.ProcessIndicator",
                     "sap.ui.ino.controls.Repeater",
                     "sap.ui.ino.controls.RichTextEditor",
                     "sap.ui.ino.controls.Slider",
                     "sap.ui.ino.controls.StatusModelViz",
                     "sap.ui.ino.controls.Tag",
                     "sap.ui.ino.controls.TextView",
                     "sap.ui.ino.controls.Tile",
                     "sap.ui.ino.controls.TileContainer",
                     "sap.ui.ino.controls.ToolPopup",
                     "sap.ui.ino.controls.Widget",
                     "sap.ui.ino.controls.WidgetBannerData",
                     "sap.ui.ino.controls.WidgetRowItem"
                    ],
        elements : [ "sap.ui.ino.controls.EvaluationData",
                     "sap.ui.ino.controls.EvaluationDataCriterionValue",
                     "sap.ui.ino.controls.EvaluationMatrixItem",
                     "sap.ui.ino.controls.StatusModelVizData"
                    ],
        version : "0.0"
    });
    
})();