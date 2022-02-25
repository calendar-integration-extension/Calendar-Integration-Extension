
/**var el = document.querySelector('signin');
if(el){
    el.addEventListener('click', function() {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
        console.log(token);
        });
    });
}**/

//window.onload = function() {
    document.querySelector('button').addEventListener('click', function() {
      chrome.identity.getAuthToken({interactive: true}, function(token) {
        console.log(token);
      });
    });
//  };