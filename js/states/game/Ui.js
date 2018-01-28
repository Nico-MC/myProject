function loadUI() {
  var width = 200;
  var height = 150;

  mainScreenJSON = {
  	id: 'myWindow',
  	component: 'Window',
  	header: { position: { x: 0, y: 0 }, height: 40, text: 'Header' },
  	draggable: true,
  	// position: { x: mouseX, y: mouseY },
  	width: width,
  	height: height,

  	layout: [1, 3],
  	children: [
      null,
      {
    	  id: 'button1',
    	  component: 'Button',
    	  position: 'center',
    	  text: 'my Button',
    	  width: 200,
    	  height: 80
      }
  	]
  }

  return EZGUI.Theme.load(['modules/ezgui/assets/metalworks-theme/metalworks-theme.json']);
}
