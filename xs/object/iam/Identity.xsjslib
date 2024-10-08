// Identity Object for existence check purposes only.
// Manipulation of identities is handles by the User and Group objects


this.definition = {
    Root : {
        table : "sap.ino.db.iam::t_identity",
        readOnly : true,
        attributes : {
            TYPE_CODE : { 
                foreignKeyTo : "sap.ino.xs.object.iam.TypeCode.Root"
            },
            SOURCE_TYPE_CODE : { 
                required : true,
                foreignKeyTo : "sap.ino.xs.object.iam.SourceTypeCode.Root"
            },
            NAME : { 
                required : true, 
                isName : true 
            },
            STAGED : {
                readOnly : true
            }
        }
    }
    
};