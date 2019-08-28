'use strict';

//Toggle form show for church or pastor
$('.add-church-form').hide();
$('.add-pastor-form').hide();

$('.add-church-button').on('click', function () {
  if($('.add-pastor-button').hasClass('selected') === true){
    $('.add-pastor-form').hide();
    $('.add-pastor-button').removeClass('selected');
  }
  $('.add-church-form').toggle();
  $('.add-church-button').toggleClass('selected');
})

$('.add-pastor-button').on('click', function () {
  if($('.add-church-button').hasClass('selected') === true){
    $('.add-church-form').hide();
    $('.add-church-button').removeClass('selected');
  }
  $('.add-pastor-form').toggle();
  $('.add-pastor-button').toggleClass('selected');
})

//Hamburger Menu
  $(".menu").hide();
  $(".hamburger").click(function () {
    $(".menu").toggle("slow");
  });

//Church Selection on Pastor Add
// $('#church-value').hide();
// $('.show-church-list').on('change', function(){
//   let selectedChurch = $(this).val();
//   console.log((this).value)//this works
//   $(this).parent().find('#church-value').val(selectedChurch);
//     console.log('I should be hiding');
//     console.log(selectedChurch);
//   });

  //drop down menu animation
  $('.dropdown-el').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).toggleClass('expanded');
    $('#'+$(e.target).attr('for')).prop('checked',true);
    // let selectedChurch = $(e.target).attr('for');
  // console.log((this).value)//this works
  // $(this).parent().find('#church-value').val(parseInt(selectedChurch));
  //   // console.log('I should be hiding');
  //   console.log(typeof selectedChurch);
  });
  $(document).click(function() {
    $('.dropdown-el').removeClass('expanded');
  });



