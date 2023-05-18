
// Aplikazio-eredua osatzeko elementu erabilgarrien liburutegia inportatu
const {FunctionInfo, createLastMicroservice, addMicroServiceToModel, checkApplicationMetaModel} = require('../appModel_utils.js');

// Osagaiaren aldagaiak
const componentName = "ShowNumbers";
const codeName = "gcr.io/gcis/show-numbers:latest";

module.exports = function(RED) {
    function ShowNumbers(config) {
        RED.nodes.createNode(this,config);
        
        this.function = config.function;
        this.selectedPortNumber = config.portnumber;
        this.selectedFileName = config.filename;
        var node = this;
        
        node.on('input', function(msg) {

            if (node.function === "") {
                node.error(`Ez da funtzionalitaterik aukeratu nodo batean. Jakiteko zein den, klikatu errore mezu honetan.`);
            } else {

                // Funtzionalitate guztien informazioa betetzen dugu
                // --------------------
                const allFunctionsInfo= [
                    consoleDisplay = new FunctionInfo("ConsoleDisplay", "HTTP", null, "TNumber", null, null),
                    saveTXT = new FunctionInfo("SaveTXT", "HTTP", null, "TNumber", null, "filename"),
                    saveCSV = new FunctionInfo("SaveCSV", "HTTP", null, "TNumber", null, "filename"),
                ]

                // Hautatutako funtzionalitatearen informazioa lortzen dugu
                // --------------------
                let selectedFunctionInfo;
                let selectedCustomizationValue = "";
                for (const funcObj in allFunctionsInfo) {
                    if (node.function === allFunctionsInfo[funcObj].name) {
                        selectedFunctionInfo = allFunctionsInfo[funcObj];
                        if (node.function === "SaveTXT" || node.function === "SaveCSV") {
                            if (node.selectedFileName === "") {
                                node.error("Ez duzu fitxategi izenik zehaztu. Mesedez, zehaztu ezazu.");
                                return;
                            } else
                                selectedCustomizationValue = node.selectedFileName;
                        }
                    }
                }

                // Mikrozerbitzu berriaren informazioa eraikitzen dugu
                // --------------------
                const newMicroservice = createLastMicroservice(componentName, codeName, selectedFunctionInfo, node.selectedPortNumber);
                // Osagai honen pertsonalizazioa gehitzen diogu (osagai honen bereizgarria dena)
                if (selectedCustomizationValue !== "")
                    newMicroservice.$.customization = `{'${selectedFunctionInfo.customizationName}': '${selectedCustomizationValue}'}`;


                // Aurreko osagaiak bidalitako aplikazio-ereduari osagaiaren informazioa gehitzen diogu
                // --------------------
                let appModelXML = addMicroServiceToModel(msg, newMicroservice, true);

                // Azkenengo osagaia denez, aplikazio-eredua zuzena dela konprobatuko du
                let result = checkApplicationMetaModel(appModelXML);
                if (!result || result.length === 0) {
                    // XML aplikazio-eredua zuzena da, erabiltzaileari emaitza erakustiko diogu
                    node.warn(appModelXML);
                } else
                    node.error(`Sortutako aplikazio-eredua ez dator bat meta-ereduarekin. Arrazoia: ${result}`);

            }


        });
    }

    RED.nodes.registerType("Show numbers",ShowNumbers);
}
