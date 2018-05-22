const rapidClient = Rapid.createClient(API_KEY);


// Referenziert eine Collection mit dem Namen 'itemlist'
const itemlist = rapidClient.collection('itemlist');

// Referenziert ein Dokument mit der ID 'item'
const item = itemlist.document('item-1');

// Referenziert ein neues Dokument
const newItem = itemlist.newDocument();



// Subscribe alle Teilmengen, in denen der 'name' auf 'gold' gesetzt ist.
rapidClient
  .collection('itemlist')
  .filter({name: 'gold'}) // Filter die Collection durch den Parameter 'name'
  .subscribe(function(itemTodos) {
    // Die Callback-Funktion wird einmal aufgerufen und dann jedes Mal,
    // wenn ein Dokument aus einer Teilmenge hinzugefügt, aktualisiert oder gelöscht wird.
    // TODO: Benutzerschnittstelle aktualisieren
    console.log(itemTodos)
  });


  rapidClient
    .collection('itemlist')
    .subscribe(function(allDocuments, changes) {
      const { added, updated, removed } = changes;
      // TODO: Gebe alle Änderungen der Benutzerschnittstelle aus
      console.log('Alle Items: ', allDocuments);
      console.log('Neue Items: ', added);
      console.log('Aktualisierte Items: ', updated);
      console.log('Entfernte Items: ', removed);
    });

// Subscribe ein Dokument mit der ID item-1
rapidClient
  .collection('itemlist')
  .document('item-1')
  .subscribe(function(document) {
    // TODO: Aktualisiere Benutzerschnittstelle
    console.log(document)
  });

// Speichern der zurückgegebenen Subscription in mySubscription
const mySubscription = rapidClient
  .collection('itemlist')
  .subscribe(function(allDocuments) {
    console.log(allDocuments)
  });

// unsubscribe
mySubscription.unsubscribe();
