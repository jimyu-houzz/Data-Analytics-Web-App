$(document).ready(function(){
    //When submitted article's title of an author, respond with list of revisions' timestamps
    $('#selectAuthorArticleSubmit').on('click', function(e){
      var author = $('#selectAuthor').val();
      var encodedAuthor = encodeURIComponent(author);
      var title = $('#selectAuthorArticle').val();
      var encodedTitle = encodeURIComponent(title);
      console.log(title);
      $.get("/main/author/showTimestamp?user=" + encodedAuthor + "&title=" + encodedTitle, function(result) {
        //console.log(result);
        $('#timestampResult').html(result)
      });
    });
});
