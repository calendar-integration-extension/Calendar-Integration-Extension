
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
      });
    });
  };