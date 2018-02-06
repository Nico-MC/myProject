function loadJSON() {
  var width = 200;
  var height = 150;
  var width_clickableButton = "50%";
  var height_clickableButton = 40;

  mainScreenJSON = {

    id: 'myWindow',
    component: 'Window',
    header: { position: { x: 0, y: 0 }, height: 40, text: 'Statistics', font: { size: '30px', family: 'Skranji', color: 'white' } },

    draggable: false,
    // position: { x: mouseX, y: mouseY },
    width: width,
    height: height,

    layout: [1, 1],



    children: [
    	{
        id: 'tabsObj',
    		component: 'Tabs',

        //Tabs bar height
    		tabHeight: 40,

    		padding: 1,
    		position: {x:0, y:0},
    		width: "100%",
    		height: "100%",

        //tabs components
        children: [
          {
            id: 'first_tab',
            title: 'Spieler',
            component: 'Label',
            position: { x: 0, y: 20 },
            text: 'Koordinaten: ',
            width: "100%",
            height: "100%",
            font: { size: "20px", family: 'desyrel' },
            active: true
          },
          {
            id: 'second_tab',
            title: 'Shop',
            component: 'Button',
            position: 'center',
            text: 'Öffnen',
            width: "100%",
            height: "100%",
            font: { size: "20px", family: 'desyrel' }
          }
        ]
      }
    ]
  }

  return mainScreenJSON;
}
