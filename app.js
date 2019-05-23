const {
  app,
  BrowserWindow,
  Menu
} = require('electron');

var io = require('socket.io');

let WindowApp;

app.on('ready',()=>{
  WindowApp = new BrowserWindow({
    resizable:true,
    width:720,
    height:500,
    title:"ytfriends"
  });

  WindowApp.loadURL('file://' + __dirname + '/public/index.html');
  WindowApp.setMenu(null);
});
