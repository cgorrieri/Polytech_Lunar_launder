/*
***************************************************
* fileLoad.js                                     *
* 	Lecture de données stockées en fichier texte  *
*                                                 *
* Auteurs :                                       *
* 	Loïc FAIZANT, Cyril GORRIERI, Maurice RAMBERT *
*                                                 *
* Ecole Polytech' Nice Sophia Antipolis           *
* Sciences Informatiques - 4e année               *
***************************************************
*/

// --- Lecteur de fichier
var reader;

// --- Fonction errorHandler
//	Traite les exceptions levée lors de la lecture de fichier
//		evt :
//			exception à traiter
function errorHandler(evt) {
  // Contrôler le code d'exception
  switch(evt.target.error.code) {
	// Traiter le cas d'un fichier introuvable
    case evt.target.error.NOT_FOUND_ERR:
      alert("Fichier introuvable !");
      break;
	// Traiter le cas d'un fichier illisible
    case evt.target.error.NOT_READABLE_ERR:
      alert("Fichier illisible !");
      break;
	// Traiter le cas d'une exception d'interruption
    case evt.target.error.ABORT_ERR:
      break;
    default:
      alert("Une erreur est survenue durant la lecture");
  };
}

// Lorsque le fichier à été choisis

// --- Fonction handleFileSelect
//	Lit les données contenues dans un fichier
//		evt :
//			évènement de sélection du fichier
function handleFileSelect(evt) {
  // Initialiser le lecteur de fichier
  reader = new FileReader();
  // Initialiser la gestion des erreurs de lecture
  reader.onerror = errorHandler;
  
  // Définir l'évènement de lecture
  reader.onload = function(e) {
    // Lire les valeurs séparées par des ','
    var values = e.target.result.split(",");
    // Initialiser les matrices K
    var Kn = new Array();
	// Parcourir les valeurs lues dans le fichier
    for(var i = 0; i<values.length; i = i+8) {
	  // Construire la matrice K courante
      Kn.push($M([[values[i],values[i+1],values[i+2],values[i+3]],
                  [values[i+4],values[i+5],values[i+6],values[i+7]]]))
    }
	
	// Définir la matrice K de la simulation
    Q.Kn = Kn;
	// Notifier le résultat de la lecture
    document.getElementById("fileLoadResult").innerHTML = "Données chargées !"
    // Reprendre la simulation
    Q.stage().unpause();
  }

  // Lire le fichier
  reader.readAsText(evt.target.files[0]);
}