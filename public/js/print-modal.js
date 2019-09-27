document.getElementById('printMe').onclick = function() {
  console.log('i was clicked!');
  modal.style.display = 'none';

  // printElement(document.getElementById('printThis'));
};

// function printElement(elem) {
//   var domClone = elem.cloneNode(true);

//   var $printSection = document.getElementById('printSection');

//   if (!$printSection) {
//     $printSection = document.createElement('div');
//     $printSection.id = 'printSection';
//     document.body.appendChild($printSection);
//   }

//   $printSection.innerHTML = '';
//   $printSection.appendChild(domClone);
//   window.print();
// }

//Modal example without requiring Bootstrap https://www.w3schools.com/howto/howto_css_modals.asp
//TODO: Add Attribution to readme

// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById('print');

// Get the <span> element that closes the modal
var span = document.getElementsByClassName('close')[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = 'block';
};

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = 'none';
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};
