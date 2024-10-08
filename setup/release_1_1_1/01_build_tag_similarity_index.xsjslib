const Tag = $.import("sap.ino.xs.object.tag", "Tag");
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

function check(oConnection) {
    return true;
}

function run(oConnection) {
    const oHQ = HQ.hQuery(oConnection);

    Tag.reindexAllTags(oHQ);

    return true;
}

function clean(oConnection) {
    return true;
}
