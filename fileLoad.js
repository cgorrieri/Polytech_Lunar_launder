// Lecture du fichier
var reader;

function errorHandler(evt) {
  switch(evt.target.error.code) {
    case evt.target.error.NOT_FOUND_ERR:
      alert("Fichier introuvable !");
      break;
    case evt.target.error.NOT_READABLE_ERR:
      alert("Fichier illisible !");
      break;
    case evt.target.error.ABORT_ERR:
      break; // noop
    default:
      alert("Une erreur est survenue durant la lecture");
  };
}

// Lorsque le fichier à été choisis
function handleFileSelect(evt) {

  reader = new FileReader();
  reader.onerror = errorHandler;
  reader.onload = function(e) {
    // On récupère les valeurs
    var values = e.target.result.split(",");
    // On recréer les matrices
    var Kn = new Array();
    for(var i = 0; i<values.length; i = i+8) {
      Kn.push($M([[values[i],values[i+1],values[i+2],values[i+3]],
                  [values[i+4],values[i+5],values[i+6],values[i+7]]]))
    }
    Q.Kn=Kn;
    document.getElementById("fileLoadResult").innerHTML = "Données chargées !"
    // On remet le jeu en route
    Q.stage().unpause();
  }

  // Read in the image file as a binary string.
  reader.readAsText(evt.target.files[0]);
}