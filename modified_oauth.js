
/**var el = document.querySelector('signin');
if(el){
    el.addEventListener('click', function() {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
        console.log(token);
        });
    });
}**/

var signin_var = document.querySelector('button');
if(signin_var) {
    signin_var.addEventListener('click', function() {
      chrome.identity.getAuthToken({interactive: true}, function(token) {
        console.log(token);
        var x = new XMLHttpRequest();
        x.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=' + token);
        x.onload = function() {
            alert(x.response);
        };






        
        //x.send();
        console.log(x.send());
        //let fetchRes = fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events');

        //fetchRes.then(res =>
                //res.json()).then(d => {
                    //console.log(d)
                //})
      });

      

    });
    


    
  };