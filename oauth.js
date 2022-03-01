
/**var el = document.querySelector('signin');
if(el){
    el.addEventListener('click', function() {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
        console.log(token);
        });
    });
}**/

var signin_var = document.querySelector('button');
//if(signin_var) {
    //signin_var.addEventListener('click', function() {
      chrome.identity.getAuthToken({interactive: true}, function(token) {
        console.log(token);

        var x = new XMLHttpRequest();

        x.onload = () => {
          const data = JSON.parse(x.responseText);
      
          // log response

          var element = document.getElementById("calendar_events");
          
          console.log(data);
          element.appendChild(document.createElement("tr"));
          var tag = document.createElement("th");
          tag.style.cssText = 'text-align: left';
          var text = document.createTextNode("Event Name");
          tag.appendChild(text);
          element.appendChild(tag);
          var tag = document.createElement("th");
          tag.style.cssText = 'text-align: left';
          var text = document.createTextNode("Start");
          tag.appendChild(text);
          element.appendChild(tag);
          var tag = document.createElement("th");
          tag.style.cssText = 'text-align: left';
          var text = document.createTextNode("End");
          tag.appendChild(text);
          element.appendChild(tag);

          for(let i = 0; i < data['items'].length; i++){
            console.log(data['items'][i]['summary']);
            if(data['items'][i]['start']['dateTime'] == null){
              element.appendChild(document.createElement("tr"));
              var tag = document.createElement("td");
              var text = document.createTextNode(data['items'][i]['summary']);
              tag.appendChild(text);
              element.appendChild(tag);
              var tag = document.createElement("td");
              var text = document.createTextNode(data['items'][i]['start']['date']);
              tag.appendChild(text);
              element.appendChild(tag);
              var tag = document.createElement("td");
              var text = document.createTextNode(data['items'][i]['end']['date']);
              tag.appendChild(text);
              element.appendChild(tag);
            }else{
              element.appendChild(document.createElement("tr"));
              var tag = document.createElement("td");
              var text = document.createTextNode(data['items'][i]['summary']);
              tag.appendChild(text);
              element.appendChild(tag);
              var tag = document.createElement("td");
              var text = document.createTextNode(data['items'][i]['start']['dateTime']);
              tag.appendChild(text);
              element.appendChild(tag);
              var tag = document.createElement("td");
              var text = document.createTextNode(data['items'][i]['end']['dateTime']);
              tag.appendChild(text);
              element.appendChild(tag);
            }


            
            
          }


          




      };
        x.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=' + token, true);
        //x.onload = function() {
        //    alert(x.response);
        //};





        
        
        x.send();
        
        //console.log(x);


        //let fetchRes = fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events');

        //fetchRes.then(res =>
                //res.json()).then(d => {
                    //console.log(d)
                //})
      });

      

    //});
    


    
  //};