var nani = require('nani').init(auth.clientId, auth.clientSecret);
var username = "bote795";
nani.get('user/'+username+'/animelist')
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.log(error);
  });