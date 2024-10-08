function getSystemDefaultLanguage(oHQ) {
    const aResult = oHQ.statement('select iso_code from "sap.ino.db.basis::v_sys_default_language"').execute();
    return aResult.length === 0? undefined : aResult[0].ISO_CODE;
}

function getSessionLanguage() {
    if($.request) {
        return $.request.language && $.request.language.length >= 2 ? $.request.language.substr(0,2) : undefined;
    } else if($.session) {
        return $.session.language && $.session.language.length >= 2 ? $.session.language.substr(0,2) : undefined;
    }
    return "";
}

function getLanguageCodeForIso(oHQ, sIso) {
    const aResult = oHQ.statement('select code from "sap.ino.db.basis::v_languages" where iso_code = ?').execute(sIso);
    return aResult.length === 0? undefined : aResult[0].CODE;
}

function getLanguageIsoForCode(oHQ, sCode) {
    const aResult = oHQ.statement('select iso_code from "sap.ino.db.basis::v_languages" where code = ?').execute(sCode);
    return aResult.length === 0? undefined : aResult[0].ISO_CODE;
}

